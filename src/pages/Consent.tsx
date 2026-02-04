import { useState } from "react";
import { 
  Building2, 
  CreditCard, 
  TrendingUp, 
  Shield, 
  Check,
  ChevronRight,
  Smartphone,
  Monitor,
  Clock,
  RefreshCw,
} from "lucide-react";
import { DashboardLayout } from "@/components/layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";

const consentOptions = [
  {
    id: "bank",
    icon: Building2,
    title: "Bank Account Access",
    description: "View transaction history, balances, and account details",
    enabled: true,
  },
  {
    id: "credit",
    icon: CreditCard,
    title: "Credit Card Access",
    description: "Track spending, rewards, and optimize card usage",
    enabled: true,
  },
  {
    id: "investment",
    icon: TrendingUp,
    title: "Investment Access",
    description: "Monitor portfolio performance and get rebalancing insights",
    enabled: false,
  },
];

const activeSessions = [
  {
    device: "MacBook Pro",
    icon: Monitor,
    location: "San Francisco, CA",
    lastActive: "Active now",
    current: true,
  },
  {
    device: "iPhone 15 Pro",
    icon: Smartphone,
    location: "San Francisco, CA",
    lastActive: "2 hours ago",
    current: false,
  },
];

export default function Consent() {
  const [consents, setConsents] = useState(consentOptions);

  const toggleConsent = (id: string) => {
    setConsents(consents.map(c => 
      c.id === id ? { ...c, enabled: !c.enabled } : c
    ));
  };

  return (
    <DashboardLayout title="Consent & Privacy" subtitle="Manage your data sharing preferences">
      <div className="max-w-4xl space-y-6">
        {/* Data Access Consents */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-primary" />
              <CardTitle>Data Access Permissions</CardTitle>
            </div>
            <CardDescription>
              Control what financial data FinSage AI can access. You can change these settings at any time.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {consents.map((consent) => (
              <div
                key={consent.id}
                className="flex items-center justify-between p-4 rounded-lg bg-secondary/30 border border-border/50"
              >
                <div className="flex items-center gap-4">
                  <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-secondary">
                    <consent.icon className="w-6 h-6 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="font-medium">{consent.title}</p>
                    <p className="text-sm text-muted-foreground">{consent.description}</p>
                  </div>
                </div>
                <Switch 
                  checked={consent.enabled} 
                  onCheckedChange={() => toggleConsent(consent.id)}
                />
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Connected Institutions */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Connected Institutions</CardTitle>
                <CardDescription>
                  Financial institutions sharing data with FinSage AI
                </CardDescription>
              </div>
              <Button variant="outline">
                Connect New
                <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[
                { name: "Chase Bank", accounts: 3, status: "Active", lastSync: "5 min ago" },
                { name: "American Express", accounts: 2, status: "Active", lastSync: "1 hour ago" },
                { name: "Fidelity", accounts: 1, status: "Pending", lastSync: "Connecting..." },
              ].map((institution) => (
                <div
                  key={institution.name}
                  className="flex items-center justify-between p-4 rounded-lg border border-border/50 hover:bg-secondary/30 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-secondary">
                      <Building2 className="w-5 h-5 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="font-medium">{institution.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {institution.accounts} account{institution.accounts > 1 ? "s" : ""} connected
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <Badge variant={institution.status === "Active" ? "success" : "warning"}>
                        {institution.status}
                      </Badge>
                      <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                        <RefreshCw className="w-3 h-3" />
                        {institution.lastSync}
                      </p>
                    </div>
                    <Button variant="ghost" size="sm">
                      Manage
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Active Sessions */}
        <Card>
          <CardHeader>
            <CardTitle>Active Sessions</CardTitle>
            <CardDescription>
              Devices currently signed in to your account
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {activeSessions.map((session, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-4 rounded-lg border border-border/50"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-secondary">
                      <session.icon className="w-5 h-5 text-muted-foreground" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-medium">{session.device}</p>
                        {session.current && (
                          <Badge variant="success" className="text-xs">
                            Current
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {session.location} • {session.lastActive}
                      </p>
                    </div>
                  </div>
                  {!session.current && (
                    <Button variant="outline" size="sm" className="text-destructive hover:text-destructive">
                      Revoke
                    </Button>
                  )}
                </div>
              ))}
            </div>
            <Button variant="outline" className="w-full mt-4 text-destructive hover:text-destructive">
              Sign Out All Other Devices
            </Button>
          </CardContent>
        </Card>

        {/* Data Refresh Settings */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-primary" />
              <CardTitle>Data Refresh Settings</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between p-4 rounded-lg bg-secondary/30 border border-border/50">
              <div>
                <p className="font-medium">Automatic Data Sync</p>
                <p className="text-sm text-muted-foreground">
                  Refresh your financial data every 6 hours automatically
                </p>
              </div>
              <Switch defaultChecked />
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
