import { useState } from "react";
import {
  User,
  Bell,
  Shield,
  Palette,
  CreditCard,
  Link,
  HelpCircle,
  ChevronRight,
  Check,
  Moon,
  Sun,
  Globe,
} from "lucide-react";
import { DashboardLayout } from "@/components/layout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";

const settingsSections = [
  {
    id: "profile",
    icon: User,
    title: "Profile Settings",
    description: "Manage your personal information",
  },
  {
    id: "notifications",
    icon: Bell,
    title: "Notifications",
    description: "Configure how you receive alerts",
  },
  {
    id: "security",
    icon: Shield,
    title: "Security",
    description: "Password, 2FA, and session management",
  },
  {
    id: "appearance",
    icon: Palette,
    title: "Appearance",
    description: "Theme and display preferences",
  },
  {
    id: "billing",
    icon: CreditCard,
    title: "Billing",
    description: "Subscription and payment methods",
  },
  {
    id: "integrations",
    icon: Link,
    title: "Integrations",
    description: "Connected apps and services",
  },
];

const notificationSettings = [
  { label: "Email notifications", enabled: true },
  { label: "Push notifications", enabled: true },
  { label: "Weekly summary", enabled: true },
  { label: "Marketing emails", enabled: false },
];

export default function Settings() {
  const [activeSection, setActiveSection] = useState("profile");
  const [notifications, setNotifications] = useState(notificationSettings);

  const toggleNotification = (index: number) => {
    setNotifications(notifications.map((n, i) => 
      i === index ? { ...n, enabled: !n.enabled } : n
    ));
  };

  return (
    <DashboardLayout title="Settings" subtitle="Manage your account preferences">
      <div className="grid gap-6 lg:grid-cols-4">
        {/* Sidebar */}
        <div className="lg:col-span-1">
          <Card>
            <CardContent className="p-2">
              <nav className="space-y-1">
                {settingsSections.map((section) => (
                  <button
                    key={section.id}
                    onClick={() => setActiveSection(section.id)}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-colors ${
                      activeSection === section.id
                        ? "bg-primary/10 text-primary"
                        : "hover:bg-secondary text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    <section.icon className="w-5 h-5" />
                    <span className="text-sm font-medium">{section.title}</span>
                  </button>
                ))}
              </nav>
            </CardContent>
          </Card>
        </div>

        {/* Content */}
        <div className="lg:col-span-3 space-y-6">
          {activeSection === "profile" && (
            <Card>
              <CardHeader>
                <CardTitle>Profile Settings</CardTitle>
                <CardDescription>Update your personal information</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Avatar */}
                <div className="flex items-center gap-6">
                  <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary to-info flex items-center justify-center text-2xl font-bold text-primary-foreground">
                    JD
                  </div>
                  <div>
                    <Button variant="outline" size="sm">Change Avatar</Button>
                    <p className="text-xs text-muted-foreground mt-2">
                      JPG, GIF or PNG. 1MB max.
                    </p>
                  </div>
                </div>

                {/* Form */}
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">First Name</label>
                    <input
                      type="text"
                      defaultValue="John"
                      className="w-full h-10 px-3 rounded-lg bg-secondary/50 border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Last Name</label>
                    <input
                      type="text"
                      defaultValue="Doe"
                      className="w-full h-10 px-3 rounded-lg bg-secondary/50 border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                    />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <label className="text-sm font-medium">Email</label>
                    <input
                      type="email"
                      defaultValue="john.doe@example.com"
                      className="w-full h-10 px-3 rounded-lg bg-secondary/50 border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                    />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <label className="text-sm font-medium">Timezone</label>
                    <select className="w-full h-10 px-3 rounded-lg bg-secondary/50 border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/50">
                      <option>Pacific Time (PT)</option>
                      <option>Eastern Time (ET)</option>
                      <option>Central Time (CT)</option>
                    </select>
                  </div>
                </div>

                <Button>Save Changes</Button>
              </CardContent>
            </Card>
          )}

          {activeSection === "notifications" && (
            <Card>
              <CardHeader>
                <CardTitle>Notification Preferences</CardTitle>
                <CardDescription>Choose how you want to be notified</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {notifications.map((notification, index) => (
                    <div
                      key={notification.label}
                      className="flex items-center justify-between p-4 rounded-lg bg-secondary/30"
                    >
                      <span className="font-medium">{notification.label}</span>
                      <Switch
                        checked={notification.enabled}
                        onCheckedChange={() => toggleNotification(index)}
                      />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {activeSection === "security" && (
            <>
              <Card>
                <CardHeader>
                  <CardTitle>Password</CardTitle>
                  <CardDescription>Change your password</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Current Password</label>
                    <input
                      type="password"
                      className="w-full h-10 px-3 rounded-lg bg-secondary/50 border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                    />
                  </div>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">New Password</label>
                      <input
                        type="password"
                        className="w-full h-10 px-3 rounded-lg bg-secondary/50 border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Confirm Password</label>
                      <input
                        type="password"
                        className="w-full h-10 px-3 rounded-lg bg-secondary/50 border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                      />
                    </div>
                  </div>
                  <Button>Update Password</Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Two-Factor Authentication</CardTitle>
                  <CardDescription>Add an extra layer of security</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between p-4 rounded-lg bg-success/10 border border-success/20">
                    <div className="flex items-center gap-3">
                      <Check className="w-5 h-5 text-success" />
                      <div>
                        <p className="font-medium">2FA is enabled</p>
                        <p className="text-sm text-muted-foreground">
                          Using authenticator app
                        </p>
                      </div>
                    </div>
                    <Button variant="outline">Configure</Button>
                  </div>
                </CardContent>
              </Card>
            </>
          )}

          {activeSection === "appearance" && (
            <Card>
              <CardHeader>
                <CardTitle>Appearance</CardTitle>
                <CardDescription>Customize the look and feel</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-3">
                  <label className="text-sm font-medium">Theme</label>
                  <div className="grid grid-cols-3 gap-4">
                    {[
                      { name: "Dark", icon: Moon, active: true },
                      { name: "Light", icon: Sun, active: false },
                      { name: "System", icon: Globe, active: false },
                    ].map((theme) => (
                      <button
                        key={theme.name}
                        className={`p-4 rounded-lg border text-center transition-colors ${
                          theme.active
                            ? "border-primary bg-primary/10"
                            : "border-border hover:border-primary/50"
                        }`}
                      >
                        <theme.icon className="w-6 h-6 mx-auto mb-2" />
                        <span className="text-sm font-medium">{theme.name}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 rounded-lg bg-secondary/30">
                  <div>
                    <p className="font-medium">Compact Mode</p>
                    <p className="text-sm text-muted-foreground">
                      Reduce spacing for denser information
                    </p>
                  </div>
                  <Switch />
                </div>
              </CardContent>
            </Card>
          )}

          {activeSection === "billing" && (
            <Card>
              <CardHeader>
                <CardTitle>Subscription</CardTitle>
                <CardDescription>Manage your plan and billing</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="p-6 rounded-xl bg-gradient-to-r from-primary/20 to-info/20 border border-primary/20">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Current Plan</p>
                      <p className="text-2xl font-bold">Premium</p>
                      <p className="text-sm text-muted-foreground mt-1">
                        $19.99/month • Renews Feb 15
                      </p>
                    </div>
                    <Button variant="outline">Manage Plan</Button>
                  </div>
                </div>

                <div className="space-y-3">
                  <h3 className="font-medium">Payment Method</h3>
                  <div className="flex items-center justify-between p-4 rounded-lg border border-border">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-8 rounded bg-gradient-to-r from-blue-600 to-blue-800" />
                      <div>
                        <p className="font-medium">•••• 4242</p>
                        <p className="text-xs text-muted-foreground">Expires 12/25</p>
                      </div>
                    </div>
                    <Button variant="ghost" size="sm">Update</Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {activeSection === "integrations" && (
            <Card>
              <CardHeader>
                <CardTitle>Connected Services</CardTitle>
                <CardDescription>Apps and services connected to your account</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[
                    { name: "Plaid", status: "Connected", accounts: 5 },
                    { name: "Google", status: "Connected", accounts: 1 },
                    { name: "Slack", status: "Not connected", accounts: 0 },
                  ].map((integration) => (
                    <div
                      key={integration.name}
                      className="flex items-center justify-between p-4 rounded-lg border border-border"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center">
                          <Link className="w-5 h-5 text-muted-foreground" />
                        </div>
                        <div>
                          <p className="font-medium">{integration.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {integration.status}
                            {integration.accounts > 0 && ` • ${integration.accounts} accounts`}
                          </p>
                        </div>
                      </div>
                      <Button
                        variant={integration.status === "Connected" ? "outline" : "default"}
                        size="sm"
                      >
                        {integration.status === "Connected" ? "Manage" : "Connect"}
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
