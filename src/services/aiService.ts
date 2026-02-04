export interface BackendTransaction {
    date: string;
    description: string;
    amount: number;
    type: 'debit' | 'credit';
}

export interface AnalyzeStatementResponse {
    status: string;
    message?: string;
    transactions: BackendTransaction[];
}

const aiService = {
    async analyzeBankStatement(file: File): Promise<AnalyzeStatementResponse> {
        const formData = new FormData();
        formData.append("file", file);

        const response = await fetch("http://127.0.0.1:8000/upload-pdf", {
            method: "POST",
            body: formData
        });

        if (!response.ok) {
            throw new Error("Failed to analyze bank statement");
        }

        return await response.json();
    }
};

export default aiService;
