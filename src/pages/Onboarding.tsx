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
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { useFinancial } from "@/context/FinancialContext";

interface ParsedTransaction {
    date: string;
    description: string;
    amount: number;
    category: string;
}

export default function Onboarding() {
    const navigate = useNavigate();
    const { toast } = useToast();
    const { setAnnualIncome, setTransactions, completeOnboarding, financialData } = useFinancial();
    const [income, setIncome] = useState("");
    const [incomeType, setIncomeType] = useState<"annual" | "monthly">("annual");
    const [isLoading, setIsLoading] = useState(false);
    const [uploadedFile, setUploadedFile] = useState<File | null>(null);
    const [parseError, setParseError] = useState<string | null>(null);
    const [parsedData, setParsedData] = useState<ParsedTransaction[] | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // If already onboarded, redirect to dashboard
    if (financialData.hasCompletedOnboarding && !isLoading) {
        navigate("/");
        return null;
    }

    const handleIncomeSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!income) return;

        setIsLoading(true);

        const incomeValue = parseInt(income, 10);
        const annualIncome = incomeType === "monthly" ? incomeValue * 12 : incomeValue;

        // Simulated AI processing delay
        setTimeout(() => {
            setAnnualIncome(annualIncome);
            completeOnboarding();

            toast({
                title: "Profile personalized!",
                description: `Your dashboard has been customized based on your ${incomeType === "monthly" ? "monthly" : "annual"} income of $${incomeValue.toLocaleString()}.`,
            });

            navigate("/");
        }, 1500);
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
        const categories = ["Groceries", "Dining", "Shopping", "Transport", "Utilities", "Entertainment", "Healthcare", "Income"];

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

                transactions.push({
                    date: dateStr,
                    description,
                    amount,
                    category,
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
                    const incomeTransactions = transactions.filter((t) => t.amount > 0);
                    const totalIncome = incomeTransactions.reduce((sum, t) => sum + t.amount, 0);
                    // Estimate annual based on data range
                    const estimatedAnnual = totalIncome * 4; // Assuming quarterly data

                    toast({
                        title: "File parsed successfully!",
                        description: `Found ${transactions.length} transactions. Estimated annual income: $${estimatedAnnual.toLocaleString()}`,
                    });
                } catch (err) {
                    setParseError(err instanceof Error ? err.message : "Failed to parse file");
                }
            };
            reader.readAsText(file);
        } else if (file.name.endsWith(".pdf")) {
            // For PDF files, we'll simulate extraction
            toast({
                title: "PDF detected",
                description: "PDF parsing is simulated. In production, this would use a PDF parsing library.",
            });
        }
    };

    const handleFileUpload = () => {
        if (!uploadedFile && !parsedData) {
            toast({
                title: "No file selected",
                description: "Please select a CSV or PDF file to upload.",
                variant: "destructive",
            });
            return;
        }

        setIsLoading(true);

        setTimeout(() => {
            if (parsedData && parsedData.length > 0) {
                // Calculate income from parsed transactions
                const incomeTransactions = parsedData.filter((t) => t.amount > 0);
                const totalIncome = incomeTransactions.reduce((sum, t) => sum + t.amount, 0);
                const estimatedAnnual = Math.round(totalIncome * 4);

                setAnnualIncome(estimatedAnnual || 85000);
                setTransactions(parsedData);
            } else {
                // Mock extracted income from file
                setAnnualIncome(85000);
            }

            completeOnboarding();

            toast({
                title: "Statement analyzed",
                description: "We've extracted your financial data successfully.",
            });

            navigate("/");
        }, 2000);
    };

    return (
        <div className="min-h-screen bg-background flex items-center justify-center p-4">
            <div className="w-full max-w-4xl grid md:grid-cols-2 gap-8 items-center">

                {/* Left Side - Info */}
                <div className="space-y-6">
                    <div className="flex items-center gap-2">
                        <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-info">
                            <Sparkles className="w-6 h-6 text-primary-foreground" />
                        </div>
                        <span className="text-xl font-bold">FinSage AI</span>
                    </div>

                    <h1 className="text-4xl font-bold leading-tight">
                        Let's personalize your <span className="text-gradient">financial</span> experience
                    </h1>

                    <p className="text-lg text-muted-foreground">
                        To provide accurate AI insights, personalized dashboards, and smart recommendations, we need a starting point.
                    </p>

                    <div className="space-y-4 pt-4">
                        <div className="flex items-start gap-3">
                            <ShieldCheck className="w-6 h-6 text-primary mt-1" />
                            <div>
                                <h3 className="font-medium">Private & Secure</h3>
                                <p className="text-sm text-muted-foreground">Your data is processed locally and never shared.</p>
                            </div>
                        </div>
                        <div className="flex items-start gap-3">
                            <Sparkles className="w-6 h-6 text-info mt-1" />
                            <div>
                                <h3 className="font-medium">AI-Powered Analysis</h3>
                                <p className="text-sm text-muted-foreground">Get instant projections, budget recommendations, and investment insights.</p>
                            </div>
                        </div>
                        <div className="flex items-start gap-3">
                            <CheckCircle2 className="w-6 h-6 text-success mt-1" />
                            <div>
                                <h3 className="font-medium">Personalized Dashboard</h3>
                                <p className="text-sm text-muted-foreground">All charts, metrics, and recommendations tailored to your finances.</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Side - Input Card */}
                <Card className="border-border/50 shadow-2xl relative overflow-hidden">
                    {isLoading && (
                        <div className="absolute inset-0 bg-background/80 backdrop-blur-sm z-50 flex flex-col items-center justify-center">
                            <div className="w-12 h-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin mb-4" />
                            <p className="font-medium animate-pulse">Analyzing your financial profile...</p>
                            <p className="text-sm text-muted-foreground mt-2">Setting up AI insights...</p>
                        </div>
                    )}

                    <CardHeader>
                        <CardTitle>Welcome to FinSage!</CardTitle>
                        <CardDescription>
                            Choose how you want to start your journey
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Tabs defaultValue="manual" className="space-y-6">
                            <TabsList className="grid w-full grid-cols-2">
                                <TabsTrigger value="manual">Manual Input</TabsTrigger>
                                <TabsTrigger value="upload">Upload Statement</TabsTrigger>
                            </TabsList>

                            <TabsContent value="manual" className="space-y-4">
                                <form onSubmit={handleIncomeSubmit} className="space-y-4">
                                    <div className="space-y-2">
                                        <Label>Income Type</Label>
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
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="income">
                                            {incomeType === "annual" ? "Annual Income" : "Monthly Income"} (Approx.)
                                        </Label>
                                        <div className="relative">
                                            <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                            <Input
                                                id="income"
                                                type="number"
                                                placeholder={incomeType === "annual" ? "e.g. 75000" : "e.g. 6500"}
                                                className="pl-10"
                                                value={income}
                                                onChange={(e) => setIncome(e.target.value)}
                                                required
                                            />
                                        </div>
                                        <p className="text-xs text-muted-foreground">
                                            We use this to calculate cash flow projections and personalize your dashboard.
                                        </p>
                                    </div>

                                    <Button type="submit" className="w-full">
                                        Continue to Dashboard
                                        <ArrowRight className="w-4 h-4 ml-2" />
                                    </Button>
                                </form>
                            </TabsContent>

                            <TabsContent value="upload" className="space-y-4">
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept=".csv,.pdf"
                                    onChange={handleFileChange}
                                    className="hidden"
                                />

                                <div
                                    className={`border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center text-center transition-colors cursor-pointer group ${uploadedFile
                                            ? "border-primary bg-primary/5"
                                            : "border-border hover:bg-secondary/30"
                                        }`}
                                    onClick={() => fileInputRef.current?.click()}
                                >
                                    <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-4 transition-transform ${uploadedFile ? "bg-primary/20" : "bg-secondary group-hover:scale-110"
                                        }`}>
                                        {uploadedFile ? (
                                            <CheckCircle2 className="w-6 h-6 text-primary" />
                                        ) : (
                                            <Upload className="w-6 h-6 text-muted-foreground" />
                                        )}
                                    </div>

                                    {uploadedFile ? (
                                        <>
                                            <h3 className="font-medium mb-1 text-primary">{uploadedFile.name}</h3>
                                            <p className="text-sm text-muted-foreground">
                                                {parsedData ? `${parsedData.length} transactions found` : "Click to change file"}
                                            </p>
                                        </>
                                    ) : (
                                        <>
                                            <h3 className="font-medium mb-1">Upload Bank Statement</h3>
                                            <p className="text-sm text-muted-foreground mb-4">
                                                CSV or PDF files supported
                                            </p>
                                            <Button variant="outline" size="sm">Select File</Button>
                                        </>
                                    )}
                                </div>

                                {parseError && (
                                    <div className="flex gap-2 p-3 rounded-lg bg-destructive/10 text-destructive text-sm">
                                        <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                                        <p>{parseError}</p>
                                    </div>
                                )}

                                {parsedData && parsedData.length > 0 && (
                                    <div className="bg-secondary/30 rounded-lg p-3 space-y-2">
                                        <p className="text-sm font-medium">Preview (first 3 transactions):</p>
                                        {parsedData.slice(0, 3).map((t, i) => (
                                            <div key={i} className="flex justify-between text-xs text-muted-foreground">
                                                <span>{t.description.substring(0, 30)}...</span>
                                                <span className={t.amount >= 0 ? "text-success" : "text-destructive"}>
                                                    {t.amount >= 0 ? "+" : ""}{t.amount.toFixed(2)}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                <Button
                                    className="w-full"
                                    onClick={handleFileUpload}
                                    disabled={!uploadedFile}
                                >
                                    Analyze Statement
                                    <ArrowRight className="w-4 h-4 ml-2" />
                                </Button>

                                <div className="bg-secondary/30 rounded-lg p-3 flex gap-3 text-xs text-muted-foreground">
                                    <FileText className="w-4 h-4 shrink-0" />
                                    <p>We'll automatically extract income and recurring expenses to set up your personalized budget and AI insights.</p>
                                </div>
                            </TabsContent>
                        </Tabs>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
