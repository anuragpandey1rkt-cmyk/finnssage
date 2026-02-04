import { useState } from "react";
import {
  Target,
  Plus,
  TrendingUp,
  Calendar,
  DollarSign,
  Home,
  Car,
  Plane,
  GraduationCap,
  Sparkles,
  Zap,
  Settings,
  ChevronRight,
  PiggyBank,
} from "lucide-react";
import { DashboardLayout } from "@/components/layout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

const goals = [
  {
    id: 1,
    name: "Emergency Fund",
    icon: PiggyBank,
    target: 15000,
    current: 11250,
    deadline: "Jun 2024",
    color: "bg-success",
    monthlyContribution: 500,
  },
  {
    id: 2,
    name: "House Down Payment",
    icon: Home,
    target: 60000,
    current: 24000,
    deadline: "Dec 2025",
    color: "bg-primary",
    monthlyContribution: 1500,
  },
  {
    id: 3,
    name: "New Car Fund",
    icon: Car,
    target: 25000,
    current: 8750,
    deadline: "Mar 2025",
    color: "bg-info",
    monthlyContribution: 600,
  },
  {
    id: 4,
    name: "Vacation Fund",
    icon: Plane,
    target: 5000,
    current: 2100,
    deadline: "Aug 2024",
    color: "bg-warning",
    monthlyContribution: 300,
  },
];

const automationRules = [
  {
    id: 1,
    name: "Round-up savings",
    description: "Round up every purchase to the nearest dollar and save the difference",
    enabled: true,
    icon: Sparkles,
    impact: "+₹45/month avg",
  },
  {
    id: 2,
    name: "Payday auto-save",
    description: "Transfer 20% of each paycheck to savings automatically",
    enabled: true,
    icon: Calendar,
    impact: "+₹1,080/month",
  },
  {
    id: 3,
    name: "Spare change investing",
    description: "Invest round-ups in your portfolio when balance reaches ₹50",
    enabled: false,
    icon: TrendingUp,
    impact: "+₹45/month avg",
  },
  {
    id: 4,
    name: "Bill payment alerts",
    description: "Get notified 3 days before any bill is due",
    enabled: true,
    icon: Zap,
    impact: "Avoid late fees",
  },
];

export default function Goals() {
  const [rules, setRules] = useState(automationRules);

  const toggleRule = (id: number) => {
    setRules(rules.map(r => r.id === id ? { ...r, enabled: !r.enabled } : r));
  };

  const totalProgress = goals.reduce((sum, g) => sum + g.current, 0);
  const totalTarget = goals.reduce((sum, g) => sum + g.target, 0);
  const overallProgress = Math.round((totalProgress / totalTarget) * 100);

  return (
    <DashboardLayout title="Financial Goals" subtitle="Track progress and automate your savings">
      <div className="space-y-6">
        {/* Summary Cards */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card className="card-success">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Saved</p>
                  <p className="text-2xl font-bold">₹{totalProgress.toLocaleString()}</p>
                </div>
                <Target className="w-8 h-8 text-success" />
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                {overallProgress}% of total goals
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Monthly Savings</p>
                  <p className="text-2xl font-bold">₹2,900</p>
                </div>
                <DollarSign className="w-8 h-8 text-primary" />
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Across all goals
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Active Goals</p>
                  <p className="text-2xl font-bold">{goals.length}</p>
                </div>
                <Target className="w-8 h-8 text-info" />
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                1 completing soon
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Automations</p>
                  <p className="text-2xl font-bold">{rules.filter(r => r.enabled).length}</p>
                </div>
                <Zap className="w-8 h-8 text-warning" />
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                {rules.length} rules total
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Goals Grid */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Your Goals</h2>
            <Dialog>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  New Goal
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create New Goal</DialogTitle>
                  <DialogDescription>
                    Set up a new savings goal to track your progress
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 pt-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Goal Name</label>
                    <input
                      type="text"
                      placeholder="e.g., New Laptop"
                      className="w-full h-10 px-3 rounded-lg bg-secondary/50 border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Target Amount</label>
                      <input
                        type="text"
                        placeholder="₹0.00"
                        className="w-full h-10 px-3 rounded-lg bg-secondary/50 border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Target Date</label>
                      <input
                        type="date"
                        className="w-full h-10 px-3 rounded-lg bg-secondary/50 border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Monthly Contribution</label>
                    <input
                      type="text"
                      placeholder="₹0.00"
                      className="w-full h-10 px-3 rounded-lg bg-secondary/50 border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                    />
                  </div>
                  <Button className="w-full">Create Goal</Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {goals.map((goal) => {
              const progress = Math.round((goal.current / goal.target) * 100);
              const remaining = goal.target - goal.current;

              return (
                <Card key={goal.id} className="hover:shadow-lg transition-all duration-300">
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-12 h-12 rounded-xl ${goal.color} flex items-center justify-center`}>
                          <goal.icon className="w-6 h-6 text-primary-foreground" />
                        </div>
                        <div>
                          <h3 className="font-semibold">{goal.name}</h3>
                          <p className="text-sm text-muted-foreground">Target: {goal.deadline}</p>
                        </div>
                      </div>
                      <Button variant="ghost" size="icon">
                        <Settings className="w-4 h-4" />
                      </Button>
                    </div>

                    <div className="space-y-3">
                      {/* Progress bar */}
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>₹{goal.current.toLocaleString()}</span>
                          <span className="text-muted-foreground">₹{goal.target.toLocaleString()}</span>
                        </div>
                        <div className="h-3 rounded-full bg-secondary overflow-hidden">
                          <div
                            className={`h-full ${goal.color} rounded-full transition-all duration-500`}
                            style={{ width: `${progress}%` }}
                          />
                        </div>
                      </div>

                      {/* Stats */}
                      <div className="flex items-center justify-between pt-2 border-t border-border">
                        <div>
                          <p className="text-xs text-muted-foreground">Remaining</p>
                          <p className="font-semibold">₹{remaining.toLocaleString()}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-muted-foreground">Monthly</p>
                          <p className="font-semibold text-primary">
                            ₹{goal.monthlyContribution}/mo
                          </p>
                        </div>
                        <Badge variant={progress >= 75 ? "success" : progress >= 50 ? "info" : "muted"}>
                          {progress}%
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Automation Rules */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Zap className="w-5 h-5 text-warning" />
              <CardTitle>Automation Rules</CardTitle>
            </div>
            <CardDescription>
              Set up automatic savings and smart financial rules
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {rules.map((rule) => (
                <div
                  key={rule.id}
                  className={`flex items-center justify-between p-4 rounded-lg border ${rule.enabled ? "bg-secondary/30 border-primary/20" : "bg-secondary/10 border-border/50"
                    }`}
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${rule.enabled ? "bg-primary/20" : "bg-secondary"
                      }`}>
                      <rule.icon className={`w-5 h-5 ${rule.enabled ? "text-primary" : "text-muted-foreground"}`} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-medium">{rule.name}</p>
                        <Badge variant={rule.enabled ? "success" : "muted"} className="text-xs">
                          {rule.impact}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{rule.description}</p>
                    </div>
                  </div>
                  <Switch
                    checked={rule.enabled}
                    onCheckedChange={() => toggleRule(rule.id)}
                  />
                </div>
              ))}
            </div>

            <Button variant="outline" className="w-full mt-4">
              <Plus className="w-4 h-4 mr-2" />
              Create Custom Rule
            </Button>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
