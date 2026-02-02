import * as pdfjsLib from 'pdfjs-dist';

// Set worker source (required for pdfjs in browser)
pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

export interface ParsedTransaction {
    date: Date;
    description: string;
    amount: number; // Positive for income, negative for expense
    type: 'income' | 'expense';
    category: string;
}

export async function parseStatement(file: File): Promise<ParsedTransaction[]> {
    if (file.type === "application/pdf") {
        return parsePDF(file);
    } else if (file.type === "text/csv") {
        return parseCSV(file);
    }
    throw new Error("Unsupported file type. Please upload a PDF or CSV.");
}

async function parsePDF(file: File): Promise<ParsedTransaction[]> {
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    const transactions: ParsedTransaction[] = [];
    const fullText: string[] = [];

    // Extract text from all pages
    for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        const pageText = textContent.items.map((item: any) => item.str).join(' ');
        fullText.push(pageText);
    }

    const content = fullText.join('\n');
    console.log("PDF Content Sample:", content.substring(0, 500));

    // Regex to match typical statement lines: Date Description Amount
    // Example: "01/01/2024 Transfer to Zomato -500.00"
    // This is highly variable per bank. We'll use a generic matcher for demo purposes.
    // Match: Date (DD/MM/YYYY or DD-MMM), Description, Amount (with +/- or CR/DR)

    // Simple heuristic: Look for lines with dates and numbers
    // Note: PDF text extraction often messes up layout. This is a best-effort parser.

    // Mocking the extraction logic for MVP robust demo if specific layout unknown:
    // We will scan for keywords to categorize and assume amounts found nearby are relevant.
    // BUT for "Real Data" requirement, let's try to find patterns.

    // Pattern: Date... Amount
    const datePattern = /\b\d{1,2}[\/-]\d{1,2}[\/-]\d{2,4}\b/g;
    const amountPattern = /-?[\d,]+\.\d{2}\b/g;

    // Fallback: If parsing fails to find structured rows, result is empty.
    // We can add a "Draft" mode where user verifies.

    // For this implementation, let's look for "Description" keywords and associate generic amounts if parsing fails, 
    // OR just return extracted text for debugging if needed.

    // Let's implement a "Standard Chartered" / "HDFC" style simple parser logic
    // Row: Date | Narration | Ref | Withdrawal | Deposit | Balance

    // Since we can't guarantee format, we will implement a 'Smart Scraper'
    // 1. Find all dates.
    // 2. Find all amounts.
    // 3. Try to align them?

    // BETTER APPROACH for "Real Data" feeling without fragile parsing:
    // Support CSV primarily? User said "upload their bank account statement" (implies PDF).

    // We will parse strictly for dates and amounts.
    // If we find a Date followed by text followed by Amount...

    // Let's leave PDF precise parsing as 'Best Effort' and stub a reliable CSV parser.
    // And for PDF, maybe just mock-extract if we can't find specific format? 
    // NO, User said "no mock data".

    // I entered a difficult requirement: "real data" from "PDF".
    // I will try to support standard text extraction.

    // Split by common delimiters
    const tokens = content.split(/\s+/);
    let currentDate: Date | null = null;
    let descriptionBuffer: string[] = [];

    for (const token of tokens) {
        // Is date?
        if (/\d{1,2}\/\d{1,2}\/\d{4}/.test(token)) {
            if (currentDate && descriptionBuffer.length > 0) {
                // Push previous
                // We need amount.
            }
            currentDate = parseDate(token);
            descriptionBuffer = [];
        } else if (/-?[\d,]+\.\d{2}/.test(token)) {
            // Is amount?
            const amountStr = token.replace(/,/g, '');
            const amount = parseFloat(amountStr);
            if (!isNaN(amount) && currentDate) {
                // Found a transaction row end?
                const desc = descriptionBuffer.join(' ');
                if (desc.trim()) {
                    transactions.push(categorizeTransaction({
                        date: currentDate,
                        description: desc,
                        amount: amount, // Assume negative is expense? Or need CR/DR logic.
                        // Most PDFs show Debits and Credits in columns.
                        // Simple logic: If it has '-', it's expense. If not, check context?
                        // Let's assume standard format: -ve is expense.
                        type: amount > 0 ? 'income' : 'expense',
                        category: 'Uncategorized'
                    }));
                }
                currentDate = null;
                descriptionBuffer = [];
            }
        } else {
            if (currentDate) {
                descriptionBuffer.push(token);
            }
        }
    }

    return transactions;
}

async function parseCSV(file: File): Promise<ParsedTransaction[]> {
    const text = await file.text();
    const lines = text.split('\n');
    const transactions: ParsedTransaction[] = [];

    // Expect Header: Date, Description, Amount
    for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;

        const parts = line.split(',');
        if (parts.length >= 3) {
            const dateStr = parts[0].trim();
            const desc = parts[1].trim();
            const amountStr = parts[2].trim();

            const date = new Date(dateStr);
            const amount = parseFloat(amountStr);

            if (!isNaN(date.getTime()) && !isNaN(amount)) {
                transactions.push(categorizeTransaction({
                    date,
                    description: desc,
                    amount,
                    type: amount >= 0 ? 'income' : 'expense',
                    category: 'Uncategorized'
                }));
            }
        }
    }
    return transactions;
}

function parseDate(str: string): Date {
    const [d, m, y] = str.split('/');
    return new Date(parseInt(y), parseInt(m) - 1, parseInt(d));
}

function categorizeTransaction(tx: ParsedTransaction): ParsedTransaction {
    const desc = tx.description.toLowerCase();

    if (desc.includes('zomato') || desc.includes('swiggy') || desc.includes('restaurant')) {
        tx.category = 'Food';
        tx.type = 'expense';
        if (tx.amount > 0) tx.amount = -tx.amount; // Fix sign if needed for known expense
    } else if (desc.includes('uber') || desc.includes('ola') || desc.includes('fuel')) {
        tx.category = 'Transport';
        tx.type = 'expense';
    } else if (desc.includes('salary') || desc.includes('deposit')) {
        tx.category = 'Income';
        tx.type = 'income';
    } else if (desc.includes('netflix') || desc.includes('spotify')) {
        tx.category = 'Entertainment';
        tx.type = 'expense';
    } else if (desc.includes('upi')) {
        tx.category = 'UPI Transfer';
    }

    return tx;
}
