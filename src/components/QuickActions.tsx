import {
    TrendingUp,
    CreditCard,
    PiggyBank,
    Calculator,
} from "lucide-react";
import { QuickActionCard } from "@/components/ui/QuickActionCard";

export function QuickActions() {
    return (
        <div className="mt-8">
            <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <QuickActionCard
                    title="Stocks"
                    subtitle="Trade & Invest"
                    icon={TrendingUp}
                    href="/stock-trading"
                />
                <QuickActionCard
                    title="Mutual Funds SIP"
                    subtitle="SIPs & Investments"
                    icon={PiggyBank}
                    href="/investments"
                />
                <QuickActionCard
                    title="Credit Cards"
                    subtitle="Optimize Cards"
                    icon={CreditCard}
                    href="/credit-optimizer"
                />
                <QuickActionCard
                    title="Calculate Returns"
                    subtitle="Financial Tools"
                    icon={Calculator}
                    href="/financial-calculators"
                />
            </div>
        </div>
    );
}
