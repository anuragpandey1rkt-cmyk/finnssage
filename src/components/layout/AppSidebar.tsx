import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import {
  LayoutDashboard,
  CreditCard,
  PieChart,
  Bot,
  TrendingUp,
  Bell,
  Target,
  FileText,
  Settings,
  Shield,
  LogOut,
  ChevronLeft,
  Landmark,
  Calculator,
  BarChart3,
  Bitcoin,
  Wallet,
  LineChart,
  Activity,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface SidebarItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
}

const mainNavItems: SidebarItem[] = [
  { name: "Dashboard", href: "/", icon: LayoutDashboard },
  { name: "Spending", href: "/spending", icon: PieChart },
  { name: "Budget Planner", href: "/budget-planner", icon: Wallet, badge: "New" },
  { name: "Credit Cards", href: "/credit-optimizer", icon: CreditCard },
  { name: "AI Console", href: "/ai-console", icon: Bot },
];

const tradingNavItems: SidebarItem[] = [
  { name: "Stock Trading", href: "/stock-trading", icon: TrendingUp, badge: "New" },
  { name: "Crypto Trading", href: "/crypto-trading", icon: Bitcoin, badge: "New" },
  { name: "Market Analysis", href: "/market-analysis", icon: Activity },
];

const investNavItems: SidebarItem[] = [
  { name: "Investments", href: "/investments", icon: BarChart3 },
  { name: "Portfolio Analytics", href: "/portfolio-analytics", icon: LineChart, badge: "New" },
  { name: "Goals", href: "/goals", icon: Target },
];

const toolsNavItems: SidebarItem[] = [
  { name: "Calculators", href: "/financial-calculators", icon: Calculator, badge: "New" },
  { name: "Alerts", href: "/alerts", icon: Bell },
  { name: "Reports", href: "/reports", icon: FileText },
];

const bottomNavItems: SidebarItem[] = [
  { name: "Settings", href: "/settings", icon: Settings },
  { name: "Privacy", href: "/privacy", icon: Shield },
];

function NavSection({ title, items, collapsed }: { title?: string; items: SidebarItem[]; collapsed: boolean }) {
  return (
    <div className="py-2">
      {title && !collapsed && (
        <p className="px-3 mb-2 text-xs font-medium text-muted-foreground uppercase tracking-wider">{title}</p>
      )}
      <ul className="space-y-1 px-2">
        {items.map((item) => (
          <li key={item.name}>
            <NavLink
              to={item.href}
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200",
                  "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                  isActive && "sidebar-item-active bg-sidebar-accent text-sidebar-primary"
                )
              }
            >
              <item.icon className="w-5 h-5 flex-shrink-0" />
              {!collapsed && (
                <>
                  <span className="flex-1">{item.name}</span>
                  {item.badge && (
                    <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-primary/20 text-primary">
                      {item.badge}
                    </span>
                  )}
                </>
              )}
            </NavLink>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function AppSidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const { profile, signOut } = useAuth();
  const navigate = useNavigate();

  // Get user initials from name or email
  const getUserInitials = () => {
    if (profile?.full_name) {
      const parts = profile.full_name.split(" ");
      if (parts.length >= 2) {
        return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
      }
      return parts[0].substring(0, 2).toUpperCase();
    }
    if (profile?.email) {
      return profile.email.substring(0, 2).toUpperCase();
    }
    return "U";
  };

  const handleLogout = async () => {
    await signOut();
    navigate("/login");
  };

  return (
    <aside
      className={cn(
        "flex flex-col h-screen bg-sidebar border-r border-sidebar-border transition-all duration-300 ease-in-out",
        collapsed ? "w-16" : "w-64"
      )}
    >
      {/* Logo */}
      <div className="flex items-center h-16 px-4 border-b border-sidebar-border">
        <div className="flex items-center gap-3">
          <img src="/logo_new.jpg" alt="FinSage" className="w-8 h-8 rounded-lg object-contain bg-black" />
          {!collapsed && (
            <div className="flex flex-col">
              <span className="text-sm font-bold text-sidebar-primary-foreground">
                FinSage
              </span>
              <span className="text-xs text-muted-foreground">AI</span>
            </div>
          )}
        </div>
        <Button
          variant="ghost"
          size="icon"
          className={cn(
            "ml-auto text-sidebar-foreground hover:bg-sidebar-accent transition-transform duration-200",
            collapsed && "rotate-180"
          )}
          onClick={() => setCollapsed(!collapsed)}
        >
          <ChevronLeft className="w-4 h-4" />
        </Button>
      </div>

      {/* Main navigation */}
      <nav className="flex-1 py-2 overflow-y-auto scrollbar-thin">
        <NavSection items={mainNavItems} collapsed={collapsed} />

        {!collapsed && <div className="mx-4 my-2 border-t border-sidebar-border" />}
        <NavSection title="Trading" items={tradingNavItems} collapsed={collapsed} />

        {!collapsed && <div className="mx-4 my-2 border-t border-sidebar-border" />}
        <NavSection title="Investing" items={investNavItems} collapsed={collapsed} />

        {!collapsed && <div className="mx-4 my-2 border-t border-sidebar-border" />}
        <NavSection title="Tools" items={toolsNavItems} collapsed={collapsed} />
      </nav>

      {/* Bottom navigation */}
      <div className="border-t border-sidebar-border py-4">
        <ul className="space-y-1 px-2">
          {bottomNavItems.map((item) => (
            <li key={item.name}>
              <NavLink
                to={item.href}
                className={({ isActive }) =>
                  cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200",
                    "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                    isActive && "sidebar-item-active bg-sidebar-accent text-sidebar-primary"
                  )
                }
              >
                <item.icon className="w-5 h-5 flex-shrink-0" />
                {!collapsed && <span>{item.name}</span>}
              </NavLink>
            </li>
          ))}
        </ul>

        {/* User section */}
        <div className={cn(
          "mt-4 mx-2 p-3 rounded-lg bg-sidebar-accent/50",
          collapsed && "p-2"
        )}>
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-br from-primary to-info text-xs font-bold text-primary-foreground">
              {getUserInitials()}
            </div>
            {!collapsed && (
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-sidebar-accent-foreground truncate">
                  {profile?.full_name || profile?.email?.split("@")[0] || "User"}
                </p>
                <p className="text-xs text-muted-foreground truncate">
                  {profile?.email || "Premium Plan"}
                </p>
              </div>
            )}
            {!collapsed && (
              <Button
                variant="ghost"
                size="icon"
                className="text-sidebar-foreground hover:bg-sidebar-accent"
                onClick={handleLogout}
                title="Logout"
              >
                <LogOut className="w-4 h-4" />
              </Button>
            )}
          </div>
        </div>
      </div>
    </aside>
  );
}
