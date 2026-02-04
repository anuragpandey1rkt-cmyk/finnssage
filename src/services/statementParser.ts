// import * as pdfjsLib from 'pdfjs-dist';
// pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

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

import aiService, { BackendTransaction } from './aiService';

// Keep CSV parsing locally for now, but PDF goes to backend
async function parsePDF(file: File): Promise<ParsedTransaction[]> {
    try {
        console.log("Uploading PDF to backend for analysis...");
        const response = await aiService.analyzeBankStatement(file);

        if (response.status !== 'success' || !response.transactions) {
            throw new Error("Failed to parse transactions from backend");
        }

        console.log("Received transactions:", response.transactions);

        return response.transactions.map((t: BackendTransaction) => {
            // Parse date DD/MM/YYYY
            const [day, month, year] = t.date.split('/').map(Number);
            const dateObj = new Date(year, month - 1, day);

            return {
                date: dateObj,
                description: t.description,
                amount: Math.abs(t.amount), // Amount is usually absolute, sign determined by type
                type: t.type === 'credit' ? 'income' : 'expense',
                category: 'Uncategorized' // Backend doesn't categorize yet, or maybe it does? 
                // The backend prompt asks for date, description, amount, type.
                // We can start with Uncategorized and let auto-categorizer (if any) or user handle it.
                // Or we can add simple heuristic here.
            };
        }).map(categorizeTransaction); // Re-run local categorization on the clean data

    } catch (error) {
        console.error("Error parsing PDF via backend:", error);
        throw error;
    }
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
