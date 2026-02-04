import {
  Shield,
  Eye,
  Database,
  Bot,
  Lock,
  Trash2,
  AlertTriangle,
  ChevronRight,
  FileText,
  Download,
  Info,
} from "lucide-react";
import { DashboardLayout } from "@/components/layout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";

const dataUsageItems = [
  {
    title: "Transaction Analysis",
    description: "We analyze your transactions to provide spending insights and categorization",
    icon: Database,
  },
  {
    title: "AI Recommendations",
    description: "Our AI uses your financial data to suggest optimization opportunities",
    icon: Bot,
  },
  {
    title: "Pattern Detection",
    description: "We detect unusual patterns to alert you about potential fraud or overspending",
    icon: Eye,
  },
];

const aiCapabilities = [
  {
    name: "Spending recommendations",
    description: "Get personalized tips to reduce expenses",
    enabled: true,
  },
  {
    name: "Investment suggestions",
    description: "Receive portfolio optimization ideas",
    enabled: true,
  },
  {
    name: "Bill prediction",
    description: "Predict upcoming bills based on history",
    enabled: true,
  },
  {
    name: "Auto-categorization",
    description: "Automatically categorize transactions",
    enabled: true,
  },
];

const modelLimitations = [
  "AI recommendations are suggestions only and require your approval before any action",
  "Investment advice is educational and not a substitute for professional financial advice",
  "Predictions are based on historical patterns and may not account for future changes",
  "The AI may occasionally miscategorize transactions—you can always correct them",
  "We never share your personal financial data with third parties for marketing",
];

export default function Privacy() {
  return (
    <DashboardLayout title="Privacy & Transparency" subtitle="Understand how we use and protect your data">
      <div className="max-w-4xl space-y-6">
        {/* Data Security Overview */}
        <Card className="bg-success/5 border-success/20">
          <CardContent className="py-6">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-success/20 flex items-center justify-center">
                <Shield className="w-6 h-6 text-success" />
              </div>
              <div>
                <h3 className="text-lg font-semibold">Your Data is Protected</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  All your financial data is encrypted with AES-256 encryption at rest and in transit.
                  We are SOC 2 Type II certified and follow industry best practices.
                </p>
                <div className="flex gap-2 mt-3">
                  <Badge variant="success">SOC 2 Certified</Badge>
                  <Badge variant="success">256-bit Encryption</Badge>
                  <Badge variant="success">GDPR Compliant</Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* How We Use Your Data */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Database className="w-5 h-5 text-primary" />
              <CardTitle>How We Use Your Data</CardTitle>
            </div>
            <CardDescription>
              Transparency about what we do with your financial information
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {dataUsageItems.map((item, index) => (
                <div
                  key={index}
                  className="flex items-start gap-4 p-4 rounded-lg bg-secondary/30"
                >
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <item.icon className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium">{item.title}</p>
                    <p className="text-sm text-muted-foreground">{item.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* AI Capabilities Toggle */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Bot className="w-5 h-5 text-primary" />
              <CardTitle>AI Capabilities</CardTitle>
            </div>
            <CardDescription>
              Control which AI features are enabled for your account
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {aiCapabilities.map((capability) => (
                <div
                  key={capability.name}
                  className="flex items-center justify-between p-4 rounded-lg border border-border/50"
                >
                  <div>
                    <p className="font-medium">{capability.name}</p>
                    <p className="text-sm text-muted-foreground">{capability.description}</p>
                  </div>
                  <Switch defaultChecked={capability.enabled} />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* AI Limitations */}
        <Card className="bg-info/5 border-info/20">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Info className="w-5 h-5 text-info" />
              <CardTitle>AI Model Limitations</CardTitle>
            </div>
            <CardDescription>
              Important information about how our AI works
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              {modelLimitations.map((limitation, index) => (
                <li key={index} className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-info/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-xs font-bold text-info">{index + 1}</span>
                  </div>
                  <p className="text-sm text-muted-foreground">{limitation}</p>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        {/* Data Export & Deletion */}
        <Card>
          <CardHeader>
            <CardTitle>Your Data Rights</CardTitle>
            <CardDescription>
              You have full control over your data
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-4 rounded-lg bg-secondary/30">
              <div className="flex items-center gap-3">
                <Download className="w-5 h-5 text-primary" />
                <div>
                  <p className="font-medium">Export Your Data</p>
                  <p className="text-sm text-muted-foreground">
                    Download all your data in a portable format
                  </p>
                </div>
              </div>
              <Button variant="outline">
                Request Export
              </Button>
            </div>

            <div className="flex items-center justify-between p-4 rounded-lg bg-secondary/30">
              <div className="flex items-center gap-3">
                <FileText className="w-5 h-5 text-info" />
                <div>
                  <p className="font-medium">Privacy Policy</p>
                  <p className="text-sm text-muted-foreground">
                    Read our complete privacy policy
                  </p>
                </div>
              </div>
              <Button variant="outline">
                View Policy
                <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Danger Zone */}
        <Card className="border-destructive/50">
          <CardHeader>
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-destructive" />
              <CardTitle className="text-destructive">Danger Zone</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between p-4 rounded-lg bg-destructive/10 border border-destructive/20">
              <div className="flex items-center gap-3">
                <Trash2 className="w-5 h-5 text-destructive" />
                <div>
                  <p className="font-medium">Delete Account</p>
                  <p className="text-sm text-muted-foreground">
                    Permanently delete your account and all associated data
                  </p>
                </div>
              </div>
              <Button variant="destructive">
                Delete Account
              </Button>
            </div>
            <p className="text-xs text-muted-foreground mt-4">
              This action is irreversible. All your data will be permanently deleted within 30 days.
              You will receive a confirmation email before deletion.
            </p>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
