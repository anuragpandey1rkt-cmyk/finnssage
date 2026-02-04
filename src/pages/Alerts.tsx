import { useState } from "react";
import {
  Bell,
  AlertTriangle,
  CreditCard,
  TrendingUp,
  Calendar,
  CheckCircle2,
  XCircle,
  Filter,
  Settings,
  DollarSign,
  Clock,
  Zap,
} from "lucide-react";
import { DashboardLayout } from "@/components/layout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

type AlertType = "warning" | "danger" | "info" | "success";

interface Alert {
  id: number;
  type: AlertType;
  title: string;
  description: string;
  time: string;
  read: boolean;
  priority: "high" | "medium" | "low";
  category: "spending" | "payment" | "investment" | "security";
}

const alerts: Alert[] = [
  {
    id: 1,
    type: "danger",
    title: "Credit card payment due tomorrow",
    description: "AMEX Platinum payment of $2,450 is due on Feb 1. Avoid late fees by paying today.",
    time: "2 hours ago",
    read: false,
    priority: "high",
    category: "payment",
  },
  {
    id: 2,
    type: "warning",
    title: "Unusual spending detected",
    description: "Your dining expenses this week are 85% higher than your weekly average.",
    time: "5 hours ago",
    read: false,
    priority: "medium",
    category: "spending",
  },
  {
    id: 3,
    type: "info",
    title: "Investment opportunity",
    description: "VTI is down 3% this week. Consider adding to your position based on your DCA strategy.",
    time: "1 day ago",
    read: false,
    priority: "medium",
    category: "investment",
  },
  {
    id: 4,
    type: "success",
    title: "Savings goal milestone",
    description: "Congratulations! You've reached 75% of your emergency fund goal.",
    time: "2 days ago",
    read: true,
    priority: "low",
    category: "spending",
  },
  {
    id: 5,
    type: "warning",
    title: "Subscription renewal",
    description: "Your annual Adobe Creative Cloud subscription ($599) renews in 7 days.",
    time: "3 days ago",
    read: true,
    priority: "medium",
    category: "payment",
  },
  {
    id: 6,
    type: "info",
    title: "New login detected",
    description: "A new device signed in to your account from San Francisco, CA.",
    time: "3 days ago",
    read: true,
    priority: "medium",
    category: "security",
  },
];

const upcomingPayments = [
  { name: "AMEX Platinum", amount: 2450, dueDate: "Feb 1", daysLeft: 1, autopay: false },
  { name: "Chase Sapphire", amount: 890, dueDate: "Feb 5", daysLeft: 5, autopay: true },
  { name: "Netflix", amount: 15.99, dueDate: "Feb 8", daysLeft: 8, autopay: true },
  { name: "Rent", amount: 2100, dueDate: "Feb 15", daysLeft: 15, autopay: false },
];

export default function Alerts() {
  const [filter, setFilter] = useState<"all" | "unread">("all");
  
  const filteredAlerts = filter === "all" ? alerts : alerts.filter(a => !a.read);
  const unreadCount = alerts.filter(a => !a.read).length;

  const getAlertIcon = (type: AlertType) => {
    switch (type) {
      case "danger": return AlertTriangle;
      case "warning": return AlertTriangle;
      case "success": return CheckCircle2;
      default: return Bell;
    }
  };

  const getAlertStyle = (type: AlertType) => {
    switch (type) {
      case "danger": return "card-danger";
      case "warning": return "card-warning";
      case "success": return "card-success";
      default: return "bg-info/10 border-l-4 border-info";
    }
  };

  const getPriorityBadge = (priority: "high" | "medium" | "low") => {
    switch (priority) {
      case "high": return <Badge variant="destructive">High Priority</Badge>;
      case "medium": return <Badge variant="warning">Medium</Badge>;
      default: return <Badge variant="muted">Low</Badge>;
    }
  };

  return (
    <DashboardLayout title="Alerts & Notifications" subtitle="Stay on top of your financial health">
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Alerts Feed */}
        <div className="lg:col-span-2 space-y-4">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Button
                variant={filter === "all" ? "default" : "outline"}
                size="sm"
                onClick={() => setFilter("all")}
              >
                All
              </Button>
              <Button
                variant={filter === "unread" ? "default" : "outline"}
                size="sm"
                onClick={() => setFilter("unread")}
              >
                Unread ({unreadCount})
              </Button>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm">
                <Filter className="w-4 h-4 mr-2" />
                Filter
              </Button>
              <Button variant="outline" size="sm">
                Mark All Read
              </Button>
            </div>
          </div>

          {/* Alert List */}
          <div className="space-y-3">
            {filteredAlerts.map((alert) => {
              const Icon = getAlertIcon(alert.type);
              return (
                <Card
                  key={alert.id}
                  className={`${getAlertStyle(alert.type)} ${!alert.read ? "ring-1 ring-primary/20" : "opacity-75"}`}
                >
                  <CardContent className="py-4">
                    <div className="flex gap-4">
                      <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${
                        alert.type === "danger" ? "bg-destructive/20" :
                        alert.type === "warning" ? "bg-warning/20" :
                        alert.type === "success" ? "bg-success/20" : "bg-info/20"
                      }`}>
                        <Icon className={`w-5 h-5 ${
                          alert.type === "danger" ? "text-destructive" :
                          alert.type === "warning" ? "text-warning" :
                          alert.type === "success" ? "text-success" : "text-info"
                        }`} />
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="font-semibold">{alert.title}</h3>
                              {!alert.read && (
                                <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                              )}
                            </div>
                            <p className="text-sm text-muted-foreground">
                              {alert.description}
                            </p>
                            <div className="flex items-center gap-3 mt-2">
                              <span className="text-xs text-muted-foreground">{alert.time}</span>
                              {getPriorityBadge(alert.priority)}
                            </div>
                          </div>
                          
                          <div className="flex gap-2 shrink-0">
                            {alert.type === "danger" && (
                              <Button size="sm" variant="destructive">
                                Pay Now
                              </Button>
                            )}
                            <Button size="sm" variant="ghost">
                              Dismiss
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Side Panel */}
        <div className="space-y-4">
          {/* Upcoming Payments */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-primary" />
                <CardTitle className="text-base">Upcoming Payments</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {upcomingPayments.map((payment, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 rounded-lg bg-secondary/30"
                  >
                    <div>
                      <p className="font-medium text-sm">{payment.name}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs text-muted-foreground">
                          Due {payment.dueDate}
                        </span>
                        {payment.autopay && (
                          <Badge variant="success" className="text-xs">
                            <Zap className="w-3 h-3 mr-1" />
                            Autopay
                          </Badge>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">${payment.amount.toLocaleString()}</p>
                      <p className={`text-xs ${payment.daysLeft <= 3 ? "text-destructive" : "text-muted-foreground"}`}>
                        {payment.daysLeft} days left
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Alert Settings */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Settings className="w-5 h-5 text-primary" />
                <CardTitle className="text-base">Alert Settings</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  { label: "Payment reminders", enabled: true },
                  { label: "Spending alerts", enabled: true },
                  { label: "Investment updates", enabled: false },
                  { label: "Security alerts", enabled: true },
                ].map((setting) => (
                  <div key={setting.label} className="flex items-center justify-between">
                    <span className="text-sm">{setting.label}</span>
                    <Button
                      variant={setting.enabled ? "default" : "outline"}
                      size="sm"
                      className="w-16"
                    >
                      {setting.enabled ? "On" : "Off"}
                    </Button>
                  </div>
                ))}
              </div>
              <Button variant="outline" className="w-full mt-4">
                Manage All Settings
              </Button>
            </CardContent>
          </Card>

          {/* Quick Stats */}
          <Card className="bg-secondary/30">
            <CardContent className="pt-4">
              <div className="grid grid-cols-2 gap-4 text-center">
                <div>
                  <p className="text-2xl font-bold text-primary">{unreadCount}</p>
                  <p className="text-xs text-muted-foreground">Unread alerts</p>
                </div>
                <div>
                  <p className="text-2xl font-bold">12</p>
                  <p className="text-xs text-muted-foreground">This week</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
