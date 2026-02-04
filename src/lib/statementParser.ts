import aiService from "@/services/aiService";

export interface ParsedTransaction {
    date: Date;
    description: string;
    amount: number;
    type: 'income' | 'expense';
    category: string;
}

export async function parseCSVAsync(content: string): Promise<ParsedTransaction[]> {
    const lines = content.split('\n');
    const transactions: ParsedTransaction[] = [];

    // Simple parser assuming Date, Description, Amount
    for (const line of lines) {
        if (!line.trim()) continue;
        const parts = line.split(',');
        if (parts.length < 3) continue;

        // Try to parse date
        const dateStr = parts[0].trim();
        const date = new Date(dateStr);
        if (isNaN(date.getTime())) continue; // Skip header or invalid rows

        const amount = parseFloat(parts[2].trim());
        if (isNaN(amount)) continue;

        transactions.push({
            date,
            description: parts[1].trim(),
            amount: Math.abs(amount),
            type: amount >= 0 ? 'income' : 'expense',
            category: 'Uncategorized'
        });
    }
    return transactions;
}

export async function parsePDFAsync(file: File): Promise<ParsedTransaction[]> {
    try {
        console.log("Sending PDF to AI...");
        const response = await aiService.analyzeBankStatement(file);

        // Ensure response.transactions exists and map if necessary
        // Backend returns { status: "success", transactions: [...] }
        if (response.status === "success" && Array.isArray(response.transactions)) {
            return response.transactions.map((t: any) => {
                // Robust Date Parsing
                let dateObj: Date | null = null;
                const rawDate = String(t.date || '');

                // Try standard Date constructor first if ISO
                // If contains slash, assume DD/MM/YYYY which JS Date() might misinterpret as MM/DD/YYYY
                if (rawDate.includes('/')) {
                    const parts = rawDate.split('/');
                    if (parts.length === 3) {
                        try {
                            // Attempt DD/MM/YYYY
                            const day = parseInt(parts[0]);
                            const month = parseInt(parts[1]) - 1;
                            const year = parseInt(parts[2]);
                            if (!isNaN(day) && !isNaN(month) && !isNaN(year)) {
                                dateObj = new Date(year, month, day);
                            }
                        } catch (e) { }
                    }
                }

                if (!dateObj || isNaN(dateObj.getTime())) {
                    // Try standard parsing (handles YYYY-MM-DD)
                    dateObj = new Date(rawDate);
                }

                // Final fallback
                if (isNaN(dateObj.getTime())) {
                    dateObj = new Date();
                }

                // Robust Amount Parsing (Handle strings with commas)
                let rawAmount = t.amount;
                if (typeof rawAmount === 'string') {
                    rawAmount = parseFloat(rawAmount.replace(/,/g, ''));
                }
                const amount = isNaN(Number(rawAmount)) ? 0 : Math.abs(Number(rawAmount));

                // Robust Type Parsing
                let type: 'income' | 'expense' = 'expense';
                const rawType = String(t.type || '').toLowerCase();

                if (rawType.includes('credit') || rawType.includes('income') || rawType.includes('cr') || rawType.includes('dep')) {
                    type = 'income';
                } else if (rawType.includes('debit') || rawType.includes('expense') || rawType.includes('dr')) {
                    type = 'expense';
                } else {
                    // Fallback to signed amount from AI if available (some return -500 for expense)
                    // But we already Math.abs'd it. 
                    // Let's check original rawAmount sign if available in string/number
                    if (typeof t.amount === 'number' && t.amount < 0) type = 'expense';
                    else if (typeof t.amount === 'string' && t.amount.includes('-')) type = 'expense';
                }

                return {
                    date: dateObj,
                    description: t.description || "Unknown Transaction",
                    amount: amount,
                    type: type,
                    category: t.category || "Uncategorized"
                };
            });
        } else {
            throw new Error(response.message || "Failed to parse transactions");
        }

    } catch (error) {
        console.error("PDF Parsing Error:", error);
        throw error;
    }
}
