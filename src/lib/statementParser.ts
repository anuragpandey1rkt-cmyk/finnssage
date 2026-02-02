import * as pdfjsLib from 'pdfjs-dist';

import { aiService } from "@/services/aiService";

// @ts-ignore
import workerUrl from 'pdfjs-dist/build/pdf.worker.min.mjs?url';

// Ensure worker is set
pdfjsLib.GlobalWorkerOptions.workerSrc = workerUrl;

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

export async function parsePDFAsync(buffer: ArrayBuffer): Promise<ParsedTransaction[]> {
    try {
        const pdf = await pdfjsLib.getDocument({ data: buffer }).promise;
        let fullText = "";

        for (let i = 1; i <= pdf.numPages; i++) {
            const page = await pdf.getPage(i);
            const textContent = await page.getTextContent();
            const pageText = textContent.items.map((item: any) => item.str).join(' ');
            fullText += pageText + "\n";
        }

        console.log("PDF Text Extracted, sending to AI...", fullText.length);

        // Use Gemini AI to parse the text
        return await aiService.analyzeBankStatement(fullText);

    } catch (error) {
        console.error("PDF Parsing Error:", error);
        throw error;
    }
}
