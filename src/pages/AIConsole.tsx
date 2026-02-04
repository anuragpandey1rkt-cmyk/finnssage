import { useState } from "react";
import {
  Bot,
  Send,
  Sparkles,
  User,
  ThumbsUp,
  ThumbsDown,
  Copy,
  RefreshCw,
  ChevronRight,
  CheckCircle2,
  XCircle,
  AlertCircle,
  ArrowRight,
  Lightbulb,
} from "lucide-react";
import { DashboardLayout } from "@/components/layout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface Message {
  id: number;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
  actions?: {
    type: "approve" | "reject" | "info";
    label: string;
  }[];
  reasoning?: string;
}

const initialMessages: Message[] = [
  {
    id: 1,
    role: "assistant",
    content: "Hello! I'm your FinSage AI assistant. I've analyzed your financial data and have some recommendations ready. What would you like to explore?",
    timestamp: "10:30 AM",
  },
  {
    id: 2,
    role: "user",
    content: "I noticed my spending is higher this month. What's going on?",
    timestamp: "10:31 AM",
  },
  {
    id: 3,
    role: "assistant",
    content: "I've analyzed your January spending and found some key insights:\n\n**Spending Overview:**\n- Total: ₹4,447 (12% higher than December)\n- Biggest increase: Dining (+40%)\n- Unusual transaction: ₹450 at Best Buy\n\n**Root Causes:**\n1. Holiday-related dining expenses carried into January\n2. One-time electronics purchase\n3. 3 new subscription services added\n\nWould you like me to suggest ways to reduce spending this month?",
    timestamp: "10:31 AM",
    reasoning: "I identified these patterns by comparing your current month's transactions against your 6-month average, flagging categories with >20% variance and any single transactions over ₹200.",
  },
  {
    id: 4,
    role: "user",
    content: "Yes, what do you recommend?",
    timestamp: "10:32 AM",
  },
  {
    id: 5,
    role: "assistant",
    content: "Based on your spending patterns and goals, here are my recommendations:\n\n**Immediate Actions:**",
    timestamp: "10:32 AM",
    actions: [
      { type: "approve", label: "Cancel unused Peacock subscription (₹599/mo)" },
      { type: "approve", label: "Set dining budget alert at ₹40,000/mo" },
      { type: "info", label: "Switch groceries to AMEX Gold for 4x points" },
    ],
    reasoning: "These recommendations are based on: (1) Your Peacock subscription shows 0 activity in 90 days, (2) Your dining spending exceeds budget 4 of last 6 months, (3) You're leaving 3x points on the table with current grocery card usage.",
  },
];

const suggestedPrompts = [
  "How can I save more this month?",
  "Am I on track for my savings goal?",
  "Which credit card should I use for travel?",
  "Show me my investment performance",
];

export default function AIConsole() {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [input, setInput] = useState("");
  const [showReasoning, setShowReasoning] = useState<number | null>(null);

  const handleSend = () => {
    if (!input.trim()) return;

    const newMessage: Message = {
      id: messages.length + 1,
      role: "user",
      content: input,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages([...messages, newMessage]);
    setInput("");

    // Simulate AI response
    setTimeout(() => {
      const aiResponse: Message = {
        id: messages.length + 2,
        role: "assistant",
        content: "I understand you're asking about \"" + input + "\". Let me analyze your financial data to provide personalized insights...\n\nBased on my analysis, I can see several opportunities to optimize your finances. Would you like me to elaborate on any specific area?",
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };
      setMessages(prev => [...prev, aiResponse]);
    }, 1000);
  };

  return (
    <DashboardLayout title="AI Console" subtitle="Your intelligent financial assistant">
      <div className="grid gap-6 lg:grid-cols-3 h-[calc(100vh-12rem)]">
        {/* Chat Interface */}
        <div className="lg:col-span-2 flex flex-col">
          <Card className="flex-1 flex flex-col overflow-hidden">
            {/* Messages */}
            <CardContent className="flex-1 overflow-y-auto scrollbar-thin p-4 space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex gap-3 ${message.role === "user" ? "flex-row-reverse" : ""}`}
                >
                  {/* Avatar */}
                  <div
                    className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${message.role === "assistant"
                        ? "bg-gradient-to-br from-primary to-info"
                        : "bg-secondary"
                      }`}
                  >
                    {message.role === "assistant" ? (
                      <Bot className="w-4 h-4 text-primary-foreground" />
                    ) : (
                      <User className="w-4 h-4 text-muted-foreground" />
                    )}
                  </div>

                  {/* Message content */}
                  <div className={`flex-1 max-w-[80%] ${message.role === "user" ? "text-right" : ""}`}>
                    <div
                      className={`inline-block p-4 rounded-2xl ${message.role === "assistant"
                          ? "bg-secondary/50 text-left"
                          : "bg-primary text-primary-foreground"
                        }`}
                    >
                      <p className="text-sm whitespace-pre-wrap">{message.content}</p>

                      {/* Actions */}
                      {message.actions && (
                        <div className="mt-4 space-y-2">
                          {message.actions.map((action, index) => (
                            <div
                              key={index}
                              className="flex items-center gap-2 p-3 rounded-lg bg-background/50 border border-border/50"
                            >
                              {action.type === "approve" && (
                                <CheckCircle2 className="w-4 h-4 text-success shrink-0" />
                              )}
                              {action.type === "reject" && (
                                <XCircle className="w-4 h-4 text-destructive shrink-0" />
                              )}
                              {action.type === "info" && (
                                <AlertCircle className="w-4 h-4 text-info shrink-0" />
                              )}
                              <span className="flex-1 text-sm">{action.label}</span>
                              <Button variant="ghost" size="sm" className="shrink-0">
                                {action.type === "approve" ? "Approve" : action.type === "reject" ? "Dismiss" : "Learn More"}
                              </Button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Message meta */}
                    <div className={`flex items-center gap-2 mt-1 ${message.role === "user" ? "justify-end" : ""}`}>
                      <span className="text-xs text-muted-foreground">{message.timestamp}</span>
                      {message.role === "assistant" && (
                        <div className="flex items-center gap-1">
                          <Button variant="ghost" size="icon" className="h-6 w-6">
                            <ThumbsUp className="w-3 h-3" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-6 w-6">
                            <ThumbsDown className="w-3 h-3" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-6 w-6">
                            <Copy className="w-3 h-3" />
                          </Button>
                          {message.reasoning && (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-6 text-xs"
                              onClick={() => setShowReasoning(showReasoning === message.id ? null : message.id)}
                            >
                              <Lightbulb className="w-3 h-3 mr-1" />
                              Why?
                            </Button>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Reasoning panel */}
                    {message.reasoning && showReasoning === message.id && (
                      <div className="mt-2 p-3 rounded-lg bg-info/10 border border-info/20 text-left">
                        <p className="text-xs font-medium text-info mb-1">AI Reasoning</p>
                        <p className="text-xs text-muted-foreground">{message.reasoning}</p>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </CardContent>

            {/* Input */}
            <div className="p-4 border-t border-border">
              {/* Suggested prompts */}
              <div className="flex flex-wrap gap-2 mb-3">
                {suggestedPrompts.map((prompt) => (
                  <Button
                    key={prompt}
                    variant="outline"
                    size="sm"
                    className="text-xs"
                    onClick={() => setInput(prompt)}
                  >
                    {prompt}
                  </Button>
                ))}
              </div>

              <div className="flex gap-2">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSend()}
                  placeholder="Ask me anything about your finances..."
                  className="flex-1 h-11 px-4 rounded-lg bg-secondary/50 border border-border text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
                <Button onClick={handleSend} size="lg">
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </Card>
        </div>

        {/* Side Panel */}
        <div className="space-y-4">
          {/* AI Status */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <div className="relative">
                  <Sparkles className="w-5 h-5 text-primary" />
                  <span className="absolute -top-1 -right-1 w-2 h-2 bg-success rounded-full animate-pulse" />
                </div>
                <CardTitle className="text-base">AI Status</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Model</span>
                  <Badge variant="secondary">FinSage Pro</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Last Data Sync</span>
                  <span className="text-sm">5 min ago</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Context</span>
                  <span className="text-sm text-success">Full Access</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {[
                "Generate spending report",
                "Analyze investment portfolio",
                "Check upcoming bills",
                "Review credit score",
              ].map((action) => (
                <Button
                  key={action}
                  variant="ghost"
                  className="w-full justify-between h-auto py-3"
                  onClick={() => setInput(action)}
                >
                  <span className="text-sm">{action}</span>
                  <ArrowRight className="w-4 h-4" />
                </Button>
              ))}
            </CardContent>
          </Card>

          {/* Disclaimer */}
          <Card className="bg-secondary/30">
            <CardContent className="pt-4">
              <p className="text-xs text-muted-foreground">
                <strong>Note:</strong> AI suggestions are for informational purposes only.
                Always review recommendations before taking action. FinSage AI does not
                execute transactions without explicit user approval.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
