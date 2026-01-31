import { useCurrency } from "@/context/CurrencyContext";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

export function CurrencyToggle() {
    const { currency, setCurrency } = useCurrency();

    return (
        <div className="flex items-center gap-3 px-3 py-2 rounded-lg bg-secondary/50 border border-border/50">
            <span className={`text-sm font-medium ${currency === "USD" ? "text-foreground" : "text-muted-foreground"}`}>
                $ USD
            </span>
            <Switch
                checked={currency === "INR"}
                onCheckedChange={(checked) => setCurrency(checked ? "INR" : "USD")}
                className="data-[state=checked]:bg-primary"
            />
            <span className={`text-sm font-medium ${currency === "INR" ? "text-foreground" : "text-muted-foreground"}`}>
                ₹ INR
            </span>
        </div>
    );
}
