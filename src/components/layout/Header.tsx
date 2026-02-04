import { Bell, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/context/AuthContext";

interface HeaderProps {
  title: string;
  subtitle?: string;
}

export function Header({ title, subtitle }: HeaderProps) {
  const { profile } = useAuth();

  // Get first name for greeting
  const firstName = profile?.full_name?.split(" ")[0] || profile?.email?.split("@")[0] || "there";

  return (
    <header className="flex items-center justify-between h-16 px-6 border-b border-border bg-card/50 backdrop-blur-sm">
      <div>
        <h1 className="text-xl font-semibold text-foreground">
          {title === "Dashboard" ? `Welcome back, ${firstName}!` : title}
        </h1>
        {subtitle && (
          <p className="text-sm text-muted-foreground">{subtitle}</p>
        )}
      </div>

      <div className="flex items-center gap-3">
        {/* Search */}
        <div className="relative hidden md:block">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search..."
            className="w-64 h-9 pl-9 pr-4 rounded-lg bg-secondary/50 border border-border text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
          />
        </div>

        {/* Notifications */}
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="w-5 h-5" />
          <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-[10px] font-bold text-destructive-foreground">
            3
          </span>
        </Button>

        {/* Account status */}
        <Badge variant="success" className="hidden sm:flex">
          {profile ? "Connected" : "All Systems Operational"}
        </Badge>
      </div>
    </header>
  );
}
