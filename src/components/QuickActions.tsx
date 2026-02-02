import {
    TrendingUp,
    PiggyBank,
    Repeat,
    CreditCard,
    Calculator,
    ArrowRight
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface QuickAction {
    id: string;
    label: string;
    icon: React.ElementType;
    path: string;
    description: string;
    gradient: string;
}

const quickActions: QuickAction[] = [
    {
        id: "stocks",
        label: "Stocks",
        icon: TrendingUp,
        path: "/stock-trading",
        description: "Trade stocks",
        gradient: "from-blue-500 to-cyan-500",
    },
    {
        id: "mutual-funds",
        label: "Mutual Funds",
        icon: PiggyBank,
        path: "/investments",
        description: "Invest in MFs",
        gradient: "from-green-500 to-emerald-500",
    },
    {
        id: "sip",
        label: "SIP",
        icon: Repeat,
        path: "/investments",
        description: "Start SIP",
        gradient: "from-purple-500 to-pink-500",
    },
    {
        id: "credit-cards",
        label: "Credit Cards",
        icon: CreditCard,
        path: "/credit-optimizer",
        description: "Optimize credit",
        gradient: "from-orange-500 to-red-500",
    },
    {
        id: "calculators",
        label: "Calculators",
        icon: Calculator,
        path: "/financial-calculators",
        description: "Calculate returns",
        gradient: "from-indigo-500 to-blue-500",
    },
];

export function QuickActions() {
    const navigate = useNavigate();

    const handleActionClick = (path: string) => {
        navigate(path);
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    Quick Actions
                    <span className="text-xs font-normal text-muted-foreground">
                        Explore financial services
                    </span>
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                    {quickActions.map((action) => {
                        const Icon = action.icon;
                        return (
                            <button
                                key={action.id}
                                onClick={() => handleActionClick(action.path)}
                                className="group relative flex flex-col items-center gap-3 p-4 rounded-xl bg-secondary/30 hover:bg-secondary/50 transition-all duration-300 hover:scale-105 hover:shadow-lg border border-border/50 hover:border-primary/50"
                            >
                                {/* Icon Container */}
                                <div className={`relative w-14 h-14 rounded-full bg-gradient-to-br ${action.gradient} p-0.5 group-hover:scale-110 transition-transform duration-300`}>
                                    <div className="w-full h-full rounded-full bg-background flex items-center justify-center">
                                        <Icon className="w-6 h-6 text-foreground" />
                                    </div>
                                </div>

                                {/* Label */}
                                <div className="text-center">
                                    <p className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors">
                                        {action.label}
                                    </p>
                                    <p className="text-xs text-muted-foreground mt-0.5">
                                        {action.description}
                                    </p>
                                </div>

                                {/* Navigation Indicator */}
                                <ArrowRight className="absolute top-2 right-2 w-3 h-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                            </button>
                        );
                    })}
                </div>
            </CardContent>
        </Card>
    );
}
