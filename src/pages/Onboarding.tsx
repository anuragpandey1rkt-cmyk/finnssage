import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
    ArrowRight,
    Upload,
    DollarSign,
    FileText,
    ShieldCheck,
    Sparkles
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";

export default function Onboarding() {
    const navigate = useNavigate();
    const { toast } = useToast();
    const [income, setIncome] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const handleIncomeSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!income) return;

        setIsLoading(true);

        // Simulate AI processing
        setTimeout(() => {
            localStorage.setItem("userIncome", income);
            localStorage.setItem("onboardingComplete", "true");

            toast({
                title: "Profile personalized!",
                description: "We've customized your dashboard based on your input.",
            });

            navigate("/");
        }, 1500);
    };

    const handleFileUpload = () => {
        setIsLoading(true);
        // Simulate file processing
        setTimeout(() => {
            // Mock extracted income from file
            localStorage.setItem("userIncome", "85000");
            localStorage.setItem("onboardingComplete", "true");

            toast({
                title: "Statement analyzed",
                description: "We've extracted your financial data successfully.",
            });

            navigate("/");
        }, 2000);
    };

    return (
        <div className="min-h-screen bg-background flex items-center justify-center p-4">
            <div className="w-full max-w-3xl grid md:grid-cols-2 gap-8 items-center">

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
                        To provide accurate AI insights and credit optimization strategies, we need a starting point.
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
                                <p className="text-sm text-muted-foreground">Get instant projections and budget recommendations.</p>
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
                                        <Label htmlFor="income">Annual Income (Approx.)</Label>
                                        <div className="relative">
                                            <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                            <Input
                                                id="income"
                                                type="number"
                                                placeholder="e.g. 75000"
                                                className="pl-10"
                                                value={income}
                                                onChange={(e) => setIncome(e.target.value)}
                                                required
                                            />
                                        </div>
                                        <p className="text-xs text-muted-foreground">
                                            We use this to calculate monthly cash flow projections.
                                        </p>
                                    </div>

                                    <Button type="submit" className="w-full">
                                        Continue to Dashboard
                                        <ArrowRight className="w-4 h-4 ml-2" />
                                    </Button>
                                </form>
                            </TabsContent>

                            <TabsContent value="upload" className="space-y-4">
                                <div
                                    className="border-2 border-dashed border-border rounded-xl p-8 flex flex-col items-center justify-center text-center hover:bg-secondary/30 transition-colors cursor-pointer group"
                                    onClick={handleFileUpload}
                                >
                                    <div className="w-12 h-12 rounded-full bg-secondary flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                                        <Upload className="w-6 h-6 text-muted-foreground" />
                                    </div>
                                    <h3 className="font-medium mb-1">Upload Bank Statement</h3>
                                    <p className="text-sm text-muted-foreground mb-4">
                                        PDF or CSV files supported
                                    </p>
                                    <Button variant="outline" size="sm">Select File</Button>
                                </div>

                                <div className="bg-secondary/30 rounded-lg p-3 flex gap-3 text-xs text-muted-foreground">
                                    <FileText className="w-4 h-4 shrink-0" />
                                    <p>We'll automatically extract income and recurring expenses to set up your budget.</p>
                                </div>
                            </TabsContent>
                        </Tabs>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
