import { useState, useRef, useEffect } from "react";
import {
  Bot,
  Send,
  Sparkles,
  User,
  ThumbsUp,
  ThumbsDown,
  Copy,
  Lightbulb,
  ArrowRight,
  CheckCircle2,
  XCircle,
  AlertCircle
} from "lucide-react";
import { DashboardLayout } from "@/components/layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import groqService, { ChatMessage } from "../services/groqService";

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
    content: "Hello! I'm your FinSage AI assistant powered by Groq (Llama 3). I can analyze markets, explain concepts, or help with your portfolio. What's on your mind?",
    timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
  }
];

const suggestedPrompts = [
  "How can I save more this month?",
  "Explain Bitcoin vs Ethereum",
  "What is a 'Stop Loss'?",
  "Analyze current market sentiment",
];

export default function AIConsole() {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMsg: Message = {
      id: Date.now(),
      role: "user",
      content: input,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages(prev => [...prev, userMsg]);
    setInput("");
    setIsTyping(true);

    // Prepare history for API
    const apiMessages: ChatMessage[] = messages.concat(userMsg).map(m => ({
      role: m.role,
      content: m.content
    }));

    // Add System Prompt
    apiMessages.unshift({
      role: "system",
      content: "You are FinSage, a helpful and knowledgeable financial AI assistant. Provide concise, accurate, and actionable financial advice. Use markdown formatting like bolding key terms or lists. If asked about real-time stock prices, clarify that you provide general analysis based on your training data."
    });

    try {
      const responseContent = await groqService.chat(apiMessages);

      const aiMsg: Message = {
        id: Date.now() + 1,
        role: "assistant",
        content: responseContent,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };

      setMessages(prev => [...prev, aiMsg]);
    } catch (error) {
      console.error("Chat Error:", error);
      setMessages(prev => [...prev, {
        id: Date.now() + 1,
        role: "assistant",
        content: "Sorry, I encountered an error connecting to the server. Please try again.",
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
      }]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <DashboardLayout title="AI Console" subtitle="Powered by Groq LPU™ Inference Engine">
      <div className="grid gap-6 lg:grid-cols-3 h-[calc(100vh-12rem)]">
        {/* Chat Interface */}
        <div className="lg:col-span-2 flex flex-col">
          <Card className="flex-1 flex flex-col overflow-hidden border-primary/20">
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
                      ? "bg-gradient-to-br from-primary to-blue-600 shadow-lg"
                      : "bg-secondary"
                      }`}
                  >
                    {message.role === "assistant" ? (
                      <Bot className="w-4 h-4 text-white" />
                    ) : (
                      <User className="w-4 h-4 text-muted-foreground" />
                    )}
                  </div>

                  {/* Message content */}
                  <div className={`flex-1 max-w-[85%] ${message.role === "user" ? "text-right" : ""}`}>
                    <div
                      className={`inline-block p-4 rounded-2xl shadow-sm ${message.role === "assistant"
                        ? "bg-secondary/40 text-left border border-border/50"
                        : "bg-primary text-primary-foreground"
                        }`}
                    >
                      <p className="text-sm whitespace-pre-wrap leading-relaxed">{message.content}</p>

                      {/* Actions (Legacy support) */}
                      {message.actions && (
                        <div className="mt-4 space-y-2">
                          {message.actions.map((action, index) => (
                            <div key={index} className="flex items-center gap-2 p-2 rounded bg-background/50 border border-border/50">
                              <CheckCircle2 className="w-4 h-4 text-success" />
                              <span className="text-xs">{action.label}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Timestamp */}
                    <div className="mt-1 text-[10px] text-muted-foreground opacity-70 px-1">
                      {message.timestamp}
                    </div>
                  </div>
                </div>
              ))}

              {isTyping && (
                <div className="flex gap-3">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-blue-600 flex items-center justify-center">
                    <Bot className="w-4 h-4 text-white" />
                  </div>
                  <div className="bg-secondary/40 p-4 rounded-2xl border border-border/50">
                    <div className="flex gap-1">
                      <span className="w-2 h-2 bg-primary/40 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                      <span className="w-2 h-2 bg-primary/40 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                      <span className="w-2 h-2 bg-primary/40 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </CardContent>

            {/* Input */}
            <div className="p-4 border-t border-border bg-background/50 backdrop-blur-sm">
              <div className="flex flex-wrap gap-2 mb-3">
                {suggestedPrompts.map((prompt) => (
                  <Button
                    key={prompt}
                    variant="outline"
                    size="sm"
                    className="text-xs rounded-full border-primary/20 hover:bg-primary/5"
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
                  placeholder="Ask FinSage (Llama 3 70B)..."
                  disabled={isTyping}
                  className="flex-1 h-11 px-4 rounded-xl bg-secondary/30 border border-border text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                />
                <Button onClick={handleSend} size="lg" disabled={!input.trim() || isTyping} className="rounded-xl w-12 px-0">
                  <Send className="w-5 h-5" />
                </Button>
              </div>
            </div>
          </Card>
        </div>

        {/* Side Panel */}
        <div className="space-y-4">
          {/* AI Status */}
          <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <div className="relative">
                  <Sparkles className="w-5 h-5 text-primary" />
                  <span className="absolute -top-1 -right-1 w-2 h-2 bg-success rounded-full animate-pulse" />
                </div>
                <CardTitle className="text-base">System Status</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Provider</span>
                  <Badge variant="outline" className="text-xs border-orange-500/50 text-orange-500 bg-orange-500/10">Groq Inc.</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Model</span>
                  <span className="text-sm font-medium">Llama 3 70B</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Latency</span>
                  <span className="text-sm text-success font-mono">&lt; 300ms</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Quick Analysis</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {[
                "Analyze my risk profile",
                "Explain Dollar Cost Averaging",
                "Pros/Cons of Crypto",
                "Retirement planning basics",
              ].map((action) => (
                <Button
                  key={action}
                  variant="ghost"
                  className="w-full justify-between h-auto py-3 hover:bg-secondary/50"
                  onClick={() => setInput(action)}
                >
                  <span className="text-sm text-left">{action}</span>
                  <ArrowRight className="w-4 h-4 opacity-50" />
                </Button>
              ))}
            </CardContent>
          </Card>

          {/* Disclaimer */}
          <Card className="bg-secondary/20 border-border/50">
            <CardContent className="pt-4">
              <p className="text-[10px] text-muted-foreground leading-relaxed">
                <strong>Disclaimer:</strong> AI responses are generated by Large Language Models and may contain inaccuracies. FinSage does not provide professional financial advice. Always verify information independently.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
