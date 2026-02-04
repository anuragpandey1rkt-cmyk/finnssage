import { useFinancial } from "@/context/FinancialContext";
import { useCurrency } from "@/context/CurrencyContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
    Heart,
    TrendingUp,
    TrendingDown,
    AlertTriangle,
    CheckCircle2,
    Target,
    Lightbulb,
    ArrowRight,
} from "lucide-react";

interface HealthMetric {
    label: string;
    value: number;
    target: number;
    status: "excellent" | "good" | "warning" | "critical";
    description: string;
}

interface FinancialHealthMeterProps {
    income?: number;
    expenses?: number;
    savings?: number;
}

export function FinancialHealthMeter({ income: propIncome, expenses: propExpenses, savings: propSavings }: FinancialHealthMeterProps = {}) {
    const { financialData } = useFinancial();
    const { format } = useCurrency();

    const income = propIncome ?? (financialData.monthlyIncome || 0);
    const expenses = propExpenses ?? (financialData.monthlyExpenses || 0);
    const savings = propSavings ?? (income - expenses);

    // Calculate key ratios
    const savingsRate = income > 0 ? (savings / income) * 100 : 0;
    const expenseRatio = income > 0 ? (expenses / income) * 100 : 0;
    const emergencyFundMonths = savings > 0 ? Math.floor((financialData.monthlySavings * 3 || 15000) / expenses) : 0;

    // Calculate overall health score (0-100)
    const calculateHealthScore = (): number => {
        let score = 0;

        // Savings rate contribution (0-35 points)
        if (savingsRate >= 30) score += 35;
        else if (savingsRate >= 20) score += 28;
        else if (savingsRate >= 15) score += 22;
        else if (savingsRate >= 10) score += 15;
        else if (savingsRate >= 5) score += 8;
        else score += 0;

        // Expense ratio contribution (0-30 points)
        if (expenseRatio <= 50) score += 30;
        else if (expenseRatio <= 60) score += 25;
        else if (expenseRatio <= 70) score += 20;
        else if (expenseRatio <= 80) score += 12;
        else if (expenseRatio <= 90) score += 5;
        else score += 0;

        // Emergency fund contribution (0-35 points)
        if (emergencyFundMonths >= 6) score += 35;
        else if (emergencyFundMonths >= 4) score += 28;
        else if (emergencyFundMonths >= 3) score += 20;
        else if (emergencyFundMonths >= 1) score += 10;
        else score += 0;

        return Math.min(score, 100);
    };

    const healthScore = calculateHealthScore();

    const getScoreStatus = (score: number) => {
        if (score >= 80) return { label: "Excellent", color: "text-success", bg: "bg-success" };
        if (score >= 60) return { label: "Good", color: "text-info", bg: "bg-info" };
        if (score >= 40) return { label: "Fair", color: "text-warning", bg: "bg-warning" };
        return { label: "Needs Attention", color: "text-destructive", bg: "bg-destructive" };
    };

    const scoreStatus = getScoreStatus(healthScore);

    const metrics: HealthMetric[] = [
        {
            label: "Savings Rate",
            value: savingsRate,
            target: 20,
            status: savingsRate >= 20 ? "excellent" : savingsRate >= 15 ? "good" : savingsRate >= 10 ? "warning" : "critical",
            description: savingsRate >= 20 ? "Great job! You're saving well." : "Aim to save at least 20% of your income.",
        },
        {
            label: "Expense Ratio",
            value: expenseRatio,
            target: 70,
            status: expenseRatio <= 60 ? "excellent" : expenseRatio <= 70 ? "good" : expenseRatio <= 80 ? "warning" : "critical",
            description: expenseRatio <= 70 ? "Expenses under control!" : "Try to reduce expenses to under 70%.",
        },
        {
            label: "Emergency Fund",
            value: emergencyFundMonths,
            target: 6,
            status: emergencyFundMonths >= 6 ? "excellent" : emergencyFundMonths >= 3 ? "good" : emergencyFundMonths >= 1 ? "warning" : "critical",
            description: emergencyFundMonths >= 6 ? "Solid emergency buffer!" : `Build up to 6 months of expenses (${format(expenses * 6)}).`,
        },
    ];

    const getStatusBadge = (status: HealthMetric["status"]) => {
        switch (status) {
            case "excellent":
                return <Badge variant="success" className="gap-1"><CheckCircle2 className="w-3 h-3" /> Excellent</Badge>;
            case "good":
                return <Badge variant="secondary" className="gap-1 bg-info/20 text-info border-info/30"><TrendingUp className="w-3 h-3" /> Good</Badge>;
            case "warning":
                return <Badge variant="warning" className="gap-1"><AlertTriangle className="w-3 h-3" /> Needs Work</Badge>;
            case "critical":
                return <Badge variant="destructive" className="gap-1"><TrendingDown className="w-3 h-3" /> Critical</Badge>;
        }
    };

    // Generate personalized recommendations
    const recommendations = [];

    if (savingsRate < 20) {
        const targetSavings = income * 0.2;
        const additionalNeeded = targetSavings - savings;
        recommendations.push({
            priority: "high",
            title: "Increase Savings Rate",
            description: `Save an additional ${format(additionalNeeded)}/month to reach the recommended 20% savings rate.`,
            action: "Review subscriptions and discretionary spending",
        });
    }

    if (expenseRatio > 70) {
        const targetExpenses = income * 0.7;
        const reduceBy = expenses - targetExpenses;
        recommendations.push({
            priority: "high",
            title: "Reduce Monthly Expenses",
            description: `Cut ${format(reduceBy)}/month from expenses to stay within the 70% guideline.`,
            action: "Identify top 3 expense categories to optimize",
        });
    }

    if (emergencyFundMonths < 6) {
        const targetFund = expenses * 6;
        const currentFund = financialData.monthlySavings * 3 || savings * 3;
        const needed = targetFund - currentFund;
        recommendations.push({
            priority: emergencyFundMonths < 3 ? "high" : "medium",
            title: "Build Emergency Fund",
            description: `Save ${format(needed)} more to reach 6 months of expenses.`,
            action: "Set up automatic transfers to savings account",
        });
    }

    if (recommendations.length === 0) {
        recommendations.push({
            priority: "low",
            title: "Excellent Financial Health!",
            description: "You're doing great. Consider investing surplus funds for long-term growth.",
            action: "Explore investment options for wealth building",
        });
    }

    return (
        <Card className="overflow-hidden">
            <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2">
                    <Heart className="w-5 h-5 text-destructive" />
                    Financial Health Score
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
                {/* Main Score Display */}
                <div className="relative">
                    <div className="flex items-center justify-center">
                        <div className="relative w-36 h-36">
                            {/* Background circle */}
                            <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                                <circle
                                    cx="50"
                                    cy="50"
                                    r="42"
                                    fill="none"
                                    stroke="hsl(var(--secondary))"
                                    strokeWidth="8"
                                />
                                <circle
                                    cx="50"
                                    cy="50"
                                    r="42"
                                    fill="none"
                                    stroke={healthScore >= 80 ? "#22c55e" : healthScore >= 60 ? "#3b82f6" : healthScore >= 40 ? "#f59e0b" : "#ef4444"}
                                    strokeWidth="8"
                                    strokeLinecap="round"
                                    strokeDasharray={`${(healthScore / 100) * 264} 264`}
                                    className="transition-all duration-1000 ease-out"
                                />
                            </svg>
                            <div className="absolute inset-0 flex flex-col items-center justify-center">
                                <span className={`text-4xl font-bold ${scoreStatus.color}`}>{healthScore}</span>
                                <span className="text-xs text-muted-foreground">out of 100</span>
                            </div>
                        </div>
                    </div>
                    <div className="mt-3 text-center">
                        <Badge className={`${scoreStatus.bg} text-white px-4 py-1`}>
                            {scoreStatus.label}
                        </Badge>
                    </div>
                </div>

                {/* Key Metrics */}
                <div className="space-y-4">
                    <h4 className="text-sm font-semibold flex items-center gap-2">
                        <Target className="w-4 h-4 text-primary" />
                        Key Metrics
                    </h4>
                    {metrics.map((metric) => (
                        <div key={metric.label} className="space-y-2">
                            <div className="flex items-center justify-between">
                                <span className="text-sm font-medium">{metric.label}</span>
                                {getStatusBadge(metric.status)}
                            </div>
                            <div className="flex items-center gap-3">
                                <Progress
                                    value={metric.label === "Expense Ratio"
                                        ? Math.min((100 - metric.value) / (100 - metric.target) * 100, 100)
                                        : Math.min((metric.value / metric.target) * 100, 100)
                                    }
                                    className={`h-2 flex-1 ${metric.status === "excellent" ? "[&>div]:bg-success" :
                                        metric.status === "good" ? "[&>div]:bg-info" :
                                            metric.status === "warning" ? "[&>div]:bg-warning" :
                                                "[&>div]:bg-destructive"
                                        }`}
                                />
                                <span className="text-sm font-bold min-w-[60px] text-right">
                                    {metric.label === "Emergency Fund"
                                        ? `${metric.value} mo`
                                        : `${metric.value.toFixed(1)}%`
                                    }
                                </span>
                            </div>
                            <p className="text-xs text-muted-foreground">{metric.description}</p>
                        </div>
                    ))}
                </div>

                {/* Summary Stats */}
                <div className="grid grid-cols-3 gap-3 p-4 rounded-lg bg-secondary/30 border border-border/50">
                    <div className="text-center">
                        <p className="text-xs text-muted-foreground">Monthly Income</p>
                        <p className="font-bold text-success">{format(income)}</p>
                    </div>
                    <div className="text-center border-x border-border/50">
                        <p className="text-xs text-muted-foreground">Monthly Expenses</p>
                        <p className="font-bold text-destructive">{format(expenses)}</p>
                    </div>
                    <div className="text-center">
                        <p className="text-xs text-muted-foreground">Monthly Savings</p>
                        <p className="font-bold text-info">{format(savings)}</p>
                    </div>
                </div>

                {/* AI Recommendations */}
                <div className="space-y-3">
                    <h4 className="text-sm font-semibold flex items-center gap-2">
                        <Lightbulb className="w-4 h-4 text-warning" />
                        How to Improve
                    </h4>
                    {recommendations.map((rec, index) => (
                        <div
                            key={index}
                            className={`p-3 rounded-lg border ${rec.priority === "high"
                                ? "bg-destructive/5 border-destructive/20"
                                : rec.priority === "medium"
                                    ? "bg-warning/5 border-warning/20"
                                    : "bg-success/5 border-success/20"
                                }`}
                        >
                            <p className="text-sm font-medium">{rec.title}</p>
                            <p className="text-xs text-muted-foreground mt-1">{rec.description}</p>
                            <div className="flex items-center gap-1 mt-2 text-xs text-primary">
                                <ArrowRight className="w-3 h-3" />
                                <span>{rec.action}</span>
                            </div>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}
