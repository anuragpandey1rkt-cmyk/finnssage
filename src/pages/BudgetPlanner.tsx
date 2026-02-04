import { useState } from "react";
import {
    Wallet,
    PlusCircle,
    Edit3,
    Trash2,
    TrendingUp,
    AlertTriangle,
    CheckCircle2,
    Bot,
    DollarSign,
    Percent,
} from "lucide-react";
import { DashboardLayout } from "@/components/layout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter,
} from "@/components/ui/dialog";
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Cell,
} from "recharts";
import { useFinancial } from "@/context/FinancialContext";

interface BudgetCategory {
    id: string;
    name: string;
    budget: number;
    spent: number;
    color: string;
    icon: string;
}

const defaultCategories: BudgetCategory[] = [
    { id: "1", name: "Housing", budget: 1500, spent: 1450, color: "#6366f1", icon: "🏠" },
    { id: "2", name: "Food & Groceries", budget: 600, spent: 520, color: "#10b981", icon: "🍕" },
    { id: "3", name: "Transportation", budget: 400, spent: 380, color: "#f59e0b", icon: "🚗" },
    { id: "4", name: "Utilities", budget: 250, spent: 225, color: "#3b82f6", icon: "💡" },
    { id: "5", name: "Entertainment", budget: 300, spent: 420, color: "#f43f5e", icon: "🎬" },
    { id: "6", name: "Shopping", budget: 400, spent: 350, color: "#8b5cf6", icon: "🛍️" },
    { id: "7", name: "Healthcare", budget: 200, spent: 85, color: "#14b8a6", icon: "🏥" },
    { id: "8", name: "Savings", budget: 500, spent: 500, color: "#22c55e", icon: "💰" },
];

export default function BudgetPlanner() {
    const { financialData } = useFinancial();
    const [categories, setCategories] = useState<BudgetCategory[]>(defaultCategories);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingCategory, setEditingCategory] = useState<BudgetCategory | null>(null);
    const [newCategoryName, setNewCategoryName] = useState("");
    const [newCategoryBudget, setNewCategoryBudget] = useState("");

    const totalBudget = categories.reduce((sum, cat) => sum + cat.budget, 0);
    const totalSpent = categories.reduce((sum, cat) => sum + cat.spent, 0);
    const remainingBudget = totalBudget - totalSpent;
    const budgetUtilization = Math.round((totalSpent / totalBudget) * 100);

    const overBudgetCategories = categories.filter((cat) => cat.spent > cat.budget);
    const underBudgetCategories = categories.filter((cat) => cat.spent <= cat.budget * 0.8);

    const chartData = categories.map((cat) => ({
        name: cat.name,
        budget: cat.budget,
        spent: cat.spent,
        fill: cat.color,
    }));

    const handleAddCategory = () => {
        if (!newCategoryName || !newCategoryBudget) return;

        const newCat: BudgetCategory = {
            id: Date.now().toString(),
            name: newCategoryName,
            budget: parseFloat(newCategoryBudget),
            spent: 0,
            color: `#${Math.floor(Math.random() * 16777215).toString(16)}`,
            icon: "📦",
        };

        setCategories([...categories, newCat]);
        setNewCategoryName("");
        setNewCategoryBudget("");
        setIsDialogOpen(false);
    };

    const handleDeleteCategory = (id: string) => {
        setCategories(categories.filter((cat) => cat.id !== id));
    };

    const getStatusColor = (spent: number, budget: number) => {
        const ratio = spent / budget;
        if (ratio > 1) return "destructive";
        if (ratio > 0.8) return "warning";
        return "success";
    };

    return (
        <DashboardLayout title="Budget Planner" subtitle="Track and manage your monthly budget">
            <div className="grid gap-6 lg:grid-cols-3">
                {/* Overview Cards */}
                <Card className="lg:col-span-3">
                    <CardContent className="pt-6">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                            <div>
                                <p className="text-xs text-muted-foreground uppercase tracking-wider">Total Budget</p>
                                <p className="text-2xl font-bold">₹{totalBudget.toLocaleString()}</p>
                                <p className="text-xs text-muted-foreground mt-1">Monthly allocation</p>
                            </div>
                            <div>
                                <p className="text-xs text-muted-foreground uppercase tracking-wider">Total Spent</p>
                                <p className="text-2xl font-bold">₹{totalSpent.toLocaleString()}</p>
                                <p className="text-xs text-muted-foreground mt-1">{budgetUtilization}% utilized</p>
                            </div>
                            <div>
                                <p className="text-xs text-muted-foreground uppercase tracking-wider">Remaining</p>
                                <p className={`text-2xl font-bold ${remainingBudget >= 0 ? "text-success" : "text-destructive"}`}>
                                    {remainingBudget < 0 ? `-₹${Math.abs(remainingBudget).toLocaleString()}` : `₹${remainingBudget.toLocaleString()} left`}
                                </p>
                                <p className="text-xs text-muted-foreground mt-1">
                                    {remainingBudget >= 0 ? "Left to spend" : "Over budget"}
                                </p>
                            </div>
                            <div>
                                <p className="text-xs text-muted-foreground uppercase tracking-wider">Monthly Income</p>
                                <p className="text-2xl font-bold">₹{financialData.monthlyIncome.toLocaleString()}</p>
                                <p className="text-xs text-muted-foreground mt-1">
                                    Savings: ₹{(financialData.monthlyIncome - totalSpent).toLocaleString()}
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Budget Categories */}
                <div className="lg:col-span-2 space-y-4">
                    <div className="flex items-center justify-between">
                        <h2 className="text-lg font-semibold">Budget Categories</h2>
                        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                            <DialogTrigger asChild>
                                <Button size="sm" className="gap-2">
                                    <PlusCircle className="w-4 h-4" />
                                    Add Category
                                </Button>
                            </DialogTrigger>
                            <DialogContent>
                                <DialogHeader>
                                    <DialogTitle>Add Budget Category</DialogTitle>
                                    <DialogDescription>Create a new spending category for your budget.</DialogDescription>
                                </DialogHeader>
                                <div className="space-y-4 py-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="cat-name">Category Name</Label>
                                        <Input
                                            id="cat-name"
                                            placeholder="e.g., Pet Expenses"
                                            value={newCategoryName}
                                            onChange={(e) => setNewCategoryName(e.target.value)}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="cat-budget">Monthly Budget (₹)</Label>
                                        <div className="relative">
                                            <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                            <Input
                                                id="cat-budget"
                                                type="number"
                                                placeholder="500"
                                                className="pl-10"
                                                value={newCategoryBudget}
                                                onChange={(e) => setNewCategoryBudget(e.target.value)}
                                            />
                                        </div>
                                    </div>
                                </div>
                                <DialogFooter>
                                    <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                                    <Button onClick={handleAddCategory}>Add Category</Button>
                                </DialogFooter>
                            </DialogContent>
                        </Dialog>
                    </div>

                    <div className="grid gap-4">
                        {categories.map((category) => {
                            const progress = Math.min((category.spent / category.budget) * 100, 100);
                            const isOverBudget = category.spent > category.budget;
                            const remaining = category.budget - category.spent;

                            return (
                                <Card key={category.id}>
                                    <CardContent className="pt-4 pb-4">
                                        <div className="flex items-center justify-between mb-3">
                                            <div className="flex items-center gap-3">
                                                <span className="text-xl">{category.icon}</span>
                                                <div>
                                                    <p className="font-medium">{category.name}</p>
                                                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                                        <span>₹{category.spent} of ₹{category.budget}</span>
                                                        {isOverBudget && (
                                                            <Badge variant="destructive" className="text-xs">
                                                                Over by ₹{(category.spent - category.budget).toFixed(0)}
                                                            </Badge>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <span className={`text-sm font-medium ${isOverBudget ? "text-destructive" : remaining > category.budget * 0.2 ? "text-success" : "text-warning"}`}>
                                                    {isOverBudget ? `-₹${Math.abs(remaining)}` : `₹${remaining} left`}
                                                </span>
                                                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleDeleteCategory(category.id)}>
                                                    <Trash2 className="w-4 h-4 text-muted-foreground hover:text-destructive" />
                                                </Button>
                                            </div>
                                        </div>
                                        <div className="relative">
                                            <Progress
                                                value={progress}
                                                className={`h-2 ${isOverBudget ? "[&>div]:bg-destructive" : progress > 80 ? "[&>div]:bg-warning" : "[&>div]:bg-success"}`}
                                            />
                                            {isOverBudget && (
                                                <div
                                                    className="absolute top-0 h-2 bg-destructive/30 rounded-full"
                                                    style={{ left: `${100}%`, width: `${((category.spent - category.budget) / category.budget) * 100}%`, maxWidth: "50%" }}
                                                />
                                            )}
                                        </div>
                                    </CardContent>
                                </Card>
                            );
                        })}
                    </div>
                </div>

                {/* Sidebar */}
                <div className="space-y-4">
                    {/* Budget vs Actual Chart */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base">Budget vs Actual</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="h-[250px] w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={chartData.slice(0, 5)} layout="vertical" margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                                        <CartesianGrid strokeDasharray="3 3" horizontal vertical={false} stroke="hsl(var(--border))" />
                                        <XAxis type="number" axisLine={false} tickLine={false} tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 10 }} />
                                        <YAxis type="category" dataKey="name" axisLine={false} tickLine={false} tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 10 }} width={80} />
                                        <Tooltip
                                            contentStyle={{ backgroundColor: "hsl(var(--card))", borderColor: "hsl(var(--border))", borderRadius: "0.5rem" }}
                                            formatter={(value: number) => [`₹${value.toLocaleString()}`, ""]}
                                        />
                                        <Bar dataKey="budget" fill="hsl(var(--muted))" radius={[0, 4, 4, 0]} name="Budget" />
                                        <Bar dataKey="spent" radius={[0, 4, 4, 0]} name="Spent">
                                            {chartData.slice(0, 5).map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={entry.spent > entry.budget ? "#f43f5e" : entry.fill} />
                                            ))}
                                        </Bar>
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Alerts */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-base">
                                <AlertTriangle className="w-4 h-4 text-warning" />
                                Alerts
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            {overBudgetCategories.length > 0 ? (
                                overBudgetCategories.map((cat) => (
                                    <div key={cat.id} className="p-3 rounded-lg bg-destructive/10 border border-destructive/20">
                                        <p className="text-sm font-medium text-destructive">
                                            {cat.icon} {cat.name} is over budget
                                        </p>
                                        <p className="text-xs text-muted-foreground">
                                            ${cat.spent - cat.budget} over the ${cat.budget} limit
                                        </p>
                                    </div>
                                ))
                            ) : (
                                <div className="p-3 rounded-lg bg-success/10 border border-success/20">
                                    <p className="text-sm font-medium text-success flex items-center gap-2">
                                        <CheckCircle2 className="w-4 h-4" />
                                        All categories on track!
                                    </p>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* AI Recommendations */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-base">
                                <Bot className="w-4 h-4 text-primary" />
                                AI Recommendations
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <div className="p-3 rounded-lg bg-info/10 border border-info/20">
                                <p className="text-sm">
                                    💡 Consider reducing entertainment spending by $120 to meet savings goals.
                                </p>
                            </div>
                            <div className="p-3 rounded-lg bg-success/10 border border-success/20">
                                <p className="text-sm">
                                    ✨ Great job on healthcare spending - you're 57% under budget!
                                </p>
                            </div>
                            <div className="p-3 rounded-lg bg-warning/10 border border-warning/20">
                                <p className="text-sm">
                                    ⚠️ Transportation is at 95% - consider carpooling or public transit.
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </DashboardLayout>
    );
}
