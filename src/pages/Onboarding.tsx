import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
    ArrowRight,
    Upload,
    DollarSign,
    FileText,
    ShieldCheck,
    Sparkles,
    CheckCircle2,
    AlertCircle,
    Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { useFinancial } from "@/context/FinancialContext";
import { useAuth } from "@/context/AuthContext";
import { supabase, Transaction } from "@/lib/supabase";

interface ParsedTransaction {
    date: string;
    description: string;
    amount: number;
    category: string;
    type: "income" | "expense";
}

export default function Onboarding() {
    const navigate = useNavigate();
    const { toast } = useToast();
    const { user, profile } = useAuth();
    const { setAnnualIncome, addTransactions, completeOnboarding, financialData } = useFinancial();
    const [income, setIncome] = useState("");
    const [incomeType, setIncomeType] = useState<"annual" | "monthly">("annual");
    const [isLoading, setIsLoading] = useState(false);
    const [uploadedFile, setUploadedFile] = useState<File | null>(null);
    const [parseError, setParseError] = useState<string | null>(null);
    const [parsedData, setParsedData] = useState<ParsedTransaction[] | null>(null);
    const [isUploading, setIsUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // If already onboarded, redirect to dashboard
    if (profile?.onboarding_completed && !isLoading) {
        navigate("/");
        return null;
    }

    const handleIncomeSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!income || !user) return;

        setIsLoading(true);

        try {
            const incomeValue = parseInt(income, 10);
            const annualIncome = incomeType === "monthly" ? incomeValue * 12 : incomeValue;

            await setAnnualIncome(annualIncome);
            await completeOnboarding();

            toast({
                title: "Profile personalized!",
                description: `Your dashboard has been customized based on your ${incomeType === "monthly" ? "monthly" : "annual"} income.`,
            });

            navigate("/");
        } catch (error) {
            toast({
                title: "Error",
                description: "Failed to save your data. Please try again.",
                variant: "destructive",
            });
        } finally {
            setIsLoading(false);
        }
    };

    const parseCSV = (content: string): ParsedTransaction[] => {
        const lines = content.trim().split("\n");
        if (lines.length < 2) {
            throw new Error("CSV file must contain a header row and at least one data row");
        }

        const header = lines[0].toLowerCase();
        const hasHeaders = header.includes("date") || header.includes("amount") || header.includes("description");
        const startIndex = hasHeaders ? 1 : 0;

        const transactions: ParsedTransaction[] = [];

        for (let i = startIndex; i < lines.length; i++) {
            const line = lines[i].trim();
            if (!line) continue;

            // Support both comma and semicolon delimiters
            const parts = line.includes(";") ? line.split(";") : line.split(",");

            if (parts.length >= 2) {
                const dateStr = parts[0]?.trim() || new Date().toISOString().split("T")[0];
                const description = parts[1]?.trim() || "Unknown";
                const amountStr = parts[2]?.trim().replace(/[^-\d.]/g, "") || "0";
                const amount = parseFloat(amountStr) || 0;

                // Auto-categorize based on description keywords
                let category = "Other";
                const descLower = description.toLowerCase();
                if (descLower.includes("grocery") || descLower.includes("market") || descLower.includes("food")) {
                    category = "Groceries";
                } else if (descLower.includes("restaurant") || descLower.includes("cafe") || descLower.includes("dining")) {
                    category = "Dining";
                } else if (descLower.includes("amazon") || descLower.includes("shop") || descLower.includes("store")) {
                    category = "Shopping";
                } else if (descLower.includes("uber") || descLower.includes("lyft") || descLower.includes("gas") || descLower.includes("fuel")) {
                    category = "Transport";
                } else if (descLower.includes("electric") || descLower.includes("water") || descLower.includes("utility")) {
                    category = "Utilities";
                } else if (descLower.includes("salary") || descLower.includes("payroll") || descLower.includes("deposit")) {
                    category = "Income";
                }

                const type: "income" | "expense" = amount > 0 ? "income" : "expense";

                transactions.push({
                    date: dateStr,
                    description,
                    amount: Math.abs(amount),
                    category,
                    type,
                });
            }
        }

        if (transactions.length === 0) {
            throw new Error("No valid transactions found in the CSV file");
        }

        return transactions;
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setUploadedFile(file);
        setParseError(null);
        setParsedData(null);

        // Only process CSV files for now
        if (file.name.endsWith(".csv")) {
            const reader = new FileReader();
            reader.onload = (event) => {
                try {
                    const content = event.target?.result as string;
                    const transactions = parseCSV(content);
                    setParsedData(transactions);

                    // Calculate estimated annual income from positive transactions
                    const incomeTransactions = transactions.filter((t) => t.type === "income");
                    const totalIncome = incomeTransactions.reduce((sum, t) => sum + t.amount, 0);
                    // Estimate annual based on data range
                    const estimatedAnnual = totalIncome * 4; // Assuming quarterly data

                    toast({
                        title: "File parsed successfully!",
                        description: `Found ${transactions.length} transactions. Estimated annual income: ₹${estimatedAnnual.toLocaleString()}`,
                    });
                } catch (err) {
                    setParseError(err instanceof Error ? err.message : "Failed to parse file");
                }
            };
            reader.readAsText(file);
        } else if (file.name.endsWith(".pdf")) {
            toast({
                title: "PDF detected",
                description: "PDF parsing requires additional processing. Please use CSV format for best results.",
            });
        }
    };

    const uploadFileToStorage = async (file: File): Promise<string | null> => {
        if (!user) return null;

        const fileExt = file.name.split(".").pop();
        const fileName = `${user.id}/${Date.now()}.${fileExt}`;

        const { data, error } = await supabase.storage
            .from("statements")
            .upload(fileName, file);

        if (error) {
            console.error("Error uploading file:", error);
            return null;
        }

        // Get public URL
        const { data: urlData } = supabase.storage
            .from("statements")
            .getPublicUrl(fileName);

        return urlData.publicUrl;
    };

    const saveStatementRecord = async (file: File, fileUrl: string, transactionsCount: number) => {
        if (!user) return;

        const fileType = file.name.endsWith(".pdf") ? "pdf" : "csv";

        await supabase.from("bank_statements").insert({
            user_id: user.id,
            file_name: file.name,
            file_url: fileUrl,
            file_type: fileType,
            processed: true,
            transactions_extracted: transactionsCount,
        });
    };

    const handleFileUpload = async () => {
        if (!uploadedFile || !user) {
            toast({
                title: "No file selected",
                description: "Please select a CSV or PDF file to upload.",
                variant: "destructive",
            });
            return;
        }

        setIsLoading(true);
        setIsUploading(true);

        try {
            // Upload file to Supabase Storage
            const fileUrl = await uploadFileToStorage(uploadedFile);

            if (parsedData && parsedData.length > 0) {
                // Save transactions to database
                const transactionsToSave = parsedData.map((t) => ({
                    date: t.date,
                    description: t.description,
                    amount: t.type === "expense" ? -t.amount : t.amount,
                    category: t.category,
                    type: t.type,
                    source: "csv_upload" as const,
                }));

                await addTransactions(transactionsToSave);

                // Calculate and set income
                const incomeTransactions = parsedData.filter((t) => t.type === "income");
                const totalIncome = incomeTransactions.reduce((sum, t) => sum + t.amount, 0);
                const estimatedAnnual = Math.round(totalIncome * 4);

                await setAnnualIncome(estimatedAnnual || 85000);

                // Save statement record
                if (fileUrl) {
                    await saveStatementRecord(uploadedFile, fileUrl, parsedData.length);
                }
            } else {
                // No parsed data, just set a default income
                await setAnnualIncome(85000);
            }

            await completeOnboarding();

            toast({
                title: "Statement analyzed",
                description: `We've extracted ${parsedData?.length || 0} transactions and saved them to your account.`,
            });

            navigate("/");
        } catch (error) {
            console.error("Upload error:", error);
            toast({
                title: "Upload failed",
                description: "Failed to process your statement. Please try again.",
                variant: "destructive",
            });
        } finally {
            setIsLoading(false);
            setIsUploading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-sidebar via-background to-sidebar flex items-center justify-center p-4">
            {/* Background decoration */}
            <div className="fixed inset-0 opacity-30 pointer-events-none">
                <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-3xl" />
                <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-info/20 rounded-full blur-3xl" />
            </div>

            <div className="w-full max-w-2xl relative z-10">
                {/* Header */}
                <div className="text-center mb-8">
                    <div className="flex items-center justify-center gap-3 mb-4">
                        <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-info">
                            <Sparkles className="w-7 h-7 text-primary-foreground" />
                        </div>
                    </div>
                    <h1 className="text-3xl font-bold mb-2">
                        Welcome to <span className="text-gradient">FinSage AI</span>
                    </h1>
                    <p className="text-muted-foreground">
                        {profile?.full_name ? `Hi ${profile.full_name.split(" ")[0]}! ` : ""}
                        Let's personalize your financial dashboard
                    </p>
                </div>

                {/* Main Card */}
                <Card className="border-border/50 shadow-2xl">
                    <CardHeader>
                        <CardTitle className="text-xl">Get Started</CardTitle>
                        <CardDescription>
                            Choose how you'd like to set up your personalized dashboard
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Tabs defaultValue="income" className="w-full">
                            <TabsList className="grid w-full grid-cols-2 mb-6">
                                <TabsTrigger value="income" className="gap-2">
                                    <DollarSign className="w-4 h-4" />
                                    Enter Income
                                </TabsTrigger>
                                <TabsTrigger value="upload" className="gap-2">
                                    <Upload className="w-4 h-4" />
                                    Upload Statement
                                </TabsTrigger>
                            </TabsList>

                            {/* Income Tab */}
                            <TabsContent value="income">
                                <form onSubmit={handleIncomeSubmit} className="space-y-6">
                                    <div className="space-y-4">
                                        <div className="flex gap-2">
                                            <Button
                                                type="button"
                                                variant={incomeType === "annual" ? "default" : "outline"}
                                                size="sm"
                                                onClick={() => setIncomeType("annual")}
                                            >
                                                Annual
                                            </Button>
                                            <Button
                                                type="button"
                                                variant={incomeType === "monthly" ? "default" : "outline"}
                                                size="sm"
                                                onClick={() => setIncomeType("monthly")}
                                            >
                                                Monthly
                                            </Button>
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="income">
                                                {incomeType === "annual" ? "Annual" : "Monthly"} Income (INR)
                                            </Label>
                                            <div className="relative">
                                                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                                <Input
                                                    id="income"
                                                    type="number"
                                                    placeholder={incomeType === "annual" ? "100000" : "8333"}
                                                    value={income}
                                                    onChange={(e) => setIncome(e.target.value)}
                                                    className="pl-9"
                                                    required
                                                />
                                            </div>
                                            <p className="text-xs text-muted-foreground">
                                                This helps us provide personalized financial recommendations
                                            </p>
                                        </div>
                                    </div>

                                    <Button type="submit" className="w-full" size="lg" disabled={isLoading || !income}>
                                        {isLoading ? (
                                            <Loader2 className="w-4 h-4 animate-spin" />
                                        ) : (
                                            <>
                                                Continue to Dashboard
                                                <ArrowRight className="w-4 h-4" />
                                            </>
                                        )}
                                    </Button>
                                </form>
                            </TabsContent>

                            {/* Upload Tab */}
                            <TabsContent value="upload">
                                <div className="space-y-6">
                                    <div
                                        className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${uploadedFile
                                            ? "border-primary bg-primary/5"
                                            : "border-border hover:border-primary/50"
                                            }`}
                                        onClick={() => fileInputRef.current?.click()}
                                    >
                                        <input
                                            ref={fileInputRef}
                                            type="file"
                                            accept=".csv,.pdf"
                                            className="hidden"
                                            onChange={handleFileChange}
                                        />

                                        {uploadedFile ? (
                                            <div className="space-y-2">
                                                <CheckCircle2 className="w-12 h-12 mx-auto text-primary" />
                                                <p className="font-medium">{uploadedFile.name}</p>
                                                <p className="text-sm text-muted-foreground">
                                                    {parsedData
                                                        ? `${parsedData.length} transactions found`
                                                        : "Click to select a different file"}
                                                </p>
                                            </div>
                                        ) : (
                                            <div className="space-y-2">
                                                <FileText className="w-12 h-12 mx-auto text-muted-foreground" />
                                                <p className="font-medium">Drop your bank statement here</p>
                                                <p className="text-sm text-muted-foreground">
                                                    Supports CSV and PDF files
                                                </p>
                                            </div>
                                        )}
                                    </div>

                                    {parseError && (
                                        <div className="flex items-center gap-2 p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive">
                                            <AlertCircle className="w-4 h-4" />
                                            <p className="text-sm">{parseError}</p>
                                        </div>
                                    )}

                                    {parsedData && (
                                        <div className="p-4 rounded-lg bg-success/10 border border-success/20">
                                            <div className="flex items-center gap-2 mb-2">
                                                <CheckCircle2 className="w-5 h-5 text-success" />
                                                <p className="font-medium text-success">File parsed successfully</p>
                                            </div>
                                            <div className="grid grid-cols-2 gap-4 mt-3">
                                                <div>
                                                    <p className="text-xs text-muted-foreground">Transactions</p>
                                                    <p className="font-semibold">{parsedData.length}</p>
                                                </div>
                                                <div>
                                                    <p className="text-xs text-muted-foreground">Total Income</p>
                                                    <p className="font-semibold text-success">
                                                        ₹{parsedData.filter(t => t.type === "income").reduce((s, t) => s + t.amount, 0).toLocaleString()}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    <div className="flex items-start gap-3 p-4 rounded-lg bg-secondary/50">
                                        <ShieldCheck className="w-5 h-5 text-primary mt-0.5" />
                                        <div>
                                            <p className="font-medium text-sm">Your data is secure</p>
                                            <p className="text-xs text-muted-foreground">
                                                We use bank-level encryption to protect your financial information. Your data is stored securely and never shared.
                                            </p>
                                        </div>
                                    </div>

                                    <Button
                                        onClick={handleFileUpload}
                                        className="w-full"
                                        size="lg"
                                        disabled={isLoading || !uploadedFile}
                                    >
                                        {isLoading ? (
                                            <>
                                                <Loader2 className="w-4 h-4 animate-spin mr-2" />
                                                {isUploading ? "Uploading..." : "Processing..."}
                                            </>
                                        ) : (
                                            <>
                                                Analyze & Continue
                                                <ArrowRight className="w-4 h-4" />
                                            </>
                                        )}
                                    </Button>
                                </div>
                            </TabsContent>
                        </Tabs>
                    </CardContent>
                </Card>

                {/* Footer */}
                <p className="text-center text-xs text-muted-foreground mt-6">
                    By continuing, you agree to our{" "}
                    <a href="/privacy" className="text-primary hover:underline">
                        Privacy Policy
                    </a>
                </p>
            </div>
        </div>
    );
}
