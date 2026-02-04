import * as pdfjsLib from 'pdfjs-dist';
import * as XLSX from 'xlsx';

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
    balance?: number;
}

/**
 * Parse date string in DD/MM/YYYY format (Indian bank statement format)
 */
function parseIndianDate(dateStr: string): Date | null {
    if (!dateStr) return null;

    // Handle DD/MM/YYYY format
    const ddmmyyyy = dateStr.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
    if (ddmmyyyy) {
        const [, day, month, year] = ddmmyyyy;
        return new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
    }

    // Handle DD-MM-YYYY format
    const ddmmyyyyDash = dateStr.match(/^(\d{1,2})-(\d{1,2})-(\d{4})$/);
    if (ddmmyyyyDash) {
        const [, day, month, year] = ddmmyyyyDash;
        return new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
    }

    // Fallback to standard parsing
    const date = new Date(dateStr);
    return isNaN(date.getTime()) ? null : date;
}

/**
 * Categorize transaction based on description keywords
 */
function categorizeTransaction(description: string, amount: number): { category: string; type: 'income' | 'expense' } {
    const desc = description.toLowerCase();

    // Income patterns
    if (desc.includes('salary') || desc.includes('credit') || desc.includes('refund') ||
        desc.includes('cashback') || desc.includes('interest credited')) {
        return { category: 'Income', type: 'income' };
    }

    // Food & Dining
    if (desc.includes('zomato') || desc.includes('swiggy') || desc.includes('restaurant') ||
        desc.includes('cafe') || desc.includes('food')) {
        return { category: 'Food & Dining', type: 'expense' };
    }

    // Transport
    if (desc.includes('uber') || desc.includes('ola') || desc.includes('rapido') ||
        desc.includes('fuel') || desc.includes('petrol') || desc.includes('diesel') ||
        desc.includes('metro') || desc.includes('railway') || desc.includes('irctc')) {
        return { category: 'Transport', type: 'expense' };
    }

    // Entertainment & Subscriptions
    if (desc.includes('netflix') || desc.includes('spotify') || desc.includes('amazon prime') ||
        desc.includes('hotstar') || desc.includes('youtube') || desc.includes('zee5') ||
        desc.includes('jiocinema') || desc.includes('gaming')) {
        return { category: 'Entertainment', type: 'expense' };
    }

    // Shopping
    if (desc.includes('amazon') || desc.includes('flipkart') || desc.includes('myntra') ||
        desc.includes('ajio') || desc.includes('nykaa') || desc.includes('meesho')) {
        return { category: 'Shopping', type: 'expense' };
    }

    // Utilities & Bills
    if (desc.includes('electricity') || desc.includes('water') || desc.includes('gas') ||
        desc.includes('mobile recharge') || desc.includes('airtel') || desc.includes('jio') ||
        desc.includes('vi ') || desc.includes('bsnl') || desc.includes('broadband')) {
        return { category: 'Utilities', type: 'expense' };
    }

    // UPI Transfers
    if (desc.includes('upi') || desc.includes('paytm') || desc.includes('phonepe') ||
        desc.includes('gpay') || desc.includes('google pay')) {
        // For UPI, determine type based on amount sign
        return { category: 'UPI Transfer', type: amount >= 0 ? 'income' : 'expense' };
    }

    // Bank Transfers
    if (desc.includes('neft') || desc.includes('imps') || desc.includes('rtgs') ||
        desc.includes('transfer')) {
        return { category: 'Bank Transfer', type: amount >= 0 ? 'income' : 'expense' };
    }

    // ATM
    if (desc.includes('atm') || desc.includes('cash withdrawal')) {
        return { category: 'Cash Withdrawal', type: 'expense' };
    }

    // Default based on amount sign
    return {
        category: 'Other',
        type: amount >= 0 ? 'income' : 'expense'
    };
}

/**
 * Parse Excel file (.xlsx, .xls) - Bank Statement Format
 * Expected columns: Date, Description, Amount (Rs.), Balance (Rs.)
 */
export async function parseExcelAsync(buffer: ArrayBuffer): Promise<ParsedTransaction[]> {
    const workbook = XLSX.read(buffer, { type: 'array' });
    const transactions: ParsedTransaction[] = [];

    // Get the first sheet (usually "Bank Statement" or first available)
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];

    // Convert to JSON with header detection
    const data = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as any[][];

    if (data.length < 2) {
        throw new Error('Excel file appears to be empty or has no data rows');
    }

    // Find header row (look for "Date" column)
    let headerRowIndex = 0;
    for (let i = 0; i < Math.min(5, data.length); i++) {
        const row = data[i];
        if (row && row.some((cell: any) =>
            String(cell).toLowerCase().includes('date') ||
            String(cell).toLowerCase().includes('description')
        )) {
            headerRowIndex = i;
            break;
        }
    }

    // Parse header to find column indices
    const header = data[headerRowIndex].map((h: any) => String(h || '').toLowerCase().trim());

    const dateColIndex = header.findIndex((h: string) => h.includes('date'));
    const descColIndex = header.findIndex((h: string) => h.includes('description') || h.includes('narration') || h.includes('particulars'));
    const amountColIndex = header.findIndex((h: string) => h.includes('amount') || h.includes('debit') || h.includes('credit'));
    const balanceColIndex = header.findIndex((h: string) => h.includes('balance'));

    // Also check for separate debit/credit columns
    const debitColIndex = header.findIndex((h: string) => h.includes('debit') || h.includes('withdrawal'));
    const creditColIndex = header.findIndex((h: string) => h.includes('credit') || h.includes('deposit'));

    console.log('Excel Header:', header);
    console.log('Column indices - Date:', dateColIndex, 'Desc:', descColIndex, 'Amount:', amountColIndex, 'Balance:', balanceColIndex);

    // Process data rows
    for (let i = headerRowIndex + 1; i < data.length; i++) {
        const row = data[i];
        if (!row || row.length === 0) continue;

        // Get date
        let dateValue = row[dateColIndex >= 0 ? dateColIndex : 0];
        let date: Date | null = null;

        if (dateValue) {
            // Handle Excel date serial numbers
            if (typeof dateValue === 'number') {
                date = XLSX.SSF.parse_date_code(dateValue) as unknown as Date;
                if (date) {
                    const excelDate = XLSX.SSF.parse_date_code(dateValue);
                    date = new Date(excelDate.y, excelDate.m - 1, excelDate.d);
                }
            } else {
                date = parseIndianDate(String(dateValue).trim());
            }
        }

        if (!date) continue; // Skip rows without valid date

        // Get description
        const description = String(row[descColIndex >= 0 ? descColIndex : 1] || '').trim();
        if (!description) continue; // Skip rows without description

        // Get amount - handle various formats
        let amount = 0;

        if (debitColIndex >= 0 && creditColIndex >= 0) {
            // Separate debit/credit columns
            const debit = parseFloat(String(row[debitColIndex] || '0').replace(/[,₹Rs.]/g, ''));
            const credit = parseFloat(String(row[creditColIndex] || '0').replace(/[,₹Rs.]/g, ''));
            amount = (isNaN(credit) ? 0 : credit) - (isNaN(debit) ? 0 : debit);
        } else if (amountColIndex >= 0) {
            // Single amount column
            const amountStr = String(row[amountColIndex] || '0').replace(/[,₹Rs.]/g, '');
            amount = parseFloat(amountStr);
        } else {
            // Fallback: try column index 2
            const amountStr = String(row[2] || '0').replace(/[,₹Rs.]/g, '');
            amount = parseFloat(amountStr);
        }

        if (isNaN(amount)) continue;

        // Get balance (optional)
        let balance: number | undefined;
        if (balanceColIndex >= 0) {
            const balanceStr = String(row[balanceColIndex] || '').replace(/[,₹Rs.]/g, '');
            balance = parseFloat(balanceStr);
            if (isNaN(balance)) balance = undefined;
        }

        // Categorize the transaction
        const { category, type } = categorizeTransaction(description, amount);

        transactions.push({
            date,
            description,
            amount: Math.abs(amount),
            type,
            category,
            balance
        });
    }

    console.log(`Parsed ${transactions.length} transactions from Excel`);
    return transactions;
}

/**
 * Parse CSV file with Indian bank statement format
 * Expected columns: Date, Description, Amount, Balance (optional)
 */
export async function parseCSVAsync(content: string): Promise<ParsedTransaction[]> {
    const lines = content.split(/\r?\n/);
    const transactions: ParsedTransaction[] = [];

    if (lines.length < 2) {
        throw new Error('CSV file appears to be empty');
    }

    // Find header row
    let headerRowIndex = 0;
    for (let i = 0; i < Math.min(5, lines.length); i++) {
        if (lines[i].toLowerCase().includes('date') || lines[i].toLowerCase().includes('description')) {
            headerRowIndex = i;
            break;
        }
    }

    // Parse header
    const headerParts = lines[headerRowIndex].split(',').map(h => h.toLowerCase().trim().replace(/"/g, ''));
    const dateColIndex = headerParts.findIndex(h => h.includes('date'));
    const descColIndex = headerParts.findIndex(h => h.includes('description') || h.includes('narration'));
    const amountColIndex = headerParts.findIndex(h => h.includes('amount'));

    // Process data rows
    for (let i = headerRowIndex + 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;

        // Handle CSV with quoted fields
        const parts = line.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/).map(p => p.replace(/"/g, '').trim());

        if (parts.length < 3) continue;

        // Get date
        const dateStr = parts[dateColIndex >= 0 ? dateColIndex : 0];
        const date = parseIndianDate(dateStr);
        if (!date) continue;

        // Get description
        const description = parts[descColIndex >= 0 ? descColIndex : 1];
        if (!description) continue;

        // Get amount
        const amountStr = parts[amountColIndex >= 0 ? amountColIndex : 2].replace(/[,₹Rs.]/g, '');
        const amount = parseFloat(amountStr);
        if (isNaN(amount)) continue;

        // Categorize
        const { category, type } = categorizeTransaction(description, amount);

        transactions.push({
            date,
            description,
            amount: Math.abs(amount),
            type,
            category
        });
    }

    console.log(`Parsed ${transactions.length} transactions from CSV`);
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
