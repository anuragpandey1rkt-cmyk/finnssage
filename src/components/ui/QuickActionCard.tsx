import { LucideIcon } from "lucide-react";
import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";

interface QuickActionCardProps {
    title: string;
    subtitle: string;
    icon: LucideIcon;
    href: string;
}

export function QuickActionCard({ title, subtitle, icon: Icon, href }: QuickActionCardProps) {
    return (
        <Link to={href} className="block group">
            <Card className="h-full border border-border/50 hover:border-primary/50 transition-colors bg-card hover:bg-secondary/20">
                <CardContent className="p-4 flex flex-col items-center text-center gap-3">
                    <div className="p-3 rounded-full bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                        <Icon className="w-6 h-6" />
                    </div>
                    <div>
                        <h3 className="font-semibold text-sm">{title}</h3>
                        <p className="text-xs text-muted-foreground">{subtitle}</p>
                    </div>
                </CardContent>
            </Card>
        </Link>
    );
}
