import { useState, useRef, useEffect } from "react";
import { Bot, Send, Sparkles, User, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export interface ChatMessage {
    id: string;
    role: "system" | "user" | "assistant";
    content: string;
    type?: "text" | "action_card";
    actionData?: {
        title: string;
        description: string;
        actionLabel: string;
        onAction: () => void;
    };
    timestamp: Date;
}

interface AIChatPanelProps {
    messages: ChatMessage[];
    onSendMessage: (message: string) => void;
    isTyping?: boolean;
    onReset?: () => void;
}

export function AIChatPanel({ messages, onSendMessage, isTyping, onReset }: AIChatPanelProps) {
    const [input, setInput] = useState("");
    const scrollRef = useRef<HTMLDivElement>(null);

    // Auto-scroll to bottom
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollIntoView({ behavior: "smooth" });
        }
    }, [messages, isTyping]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (input.trim()) {
            onSendMessage(input);
            setInput("");
        }
    };

    return (
        <div className="flex flex-col h-full bg-[#0f172a] border-l border-border/10 w-full max-w-md shadow-2xl">
            {/* Header */}
            <div className="p-4 border-b border-border/10 flex items-center justify-between bg-[#0f172a]/50 backdrop-blur-sm">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-green-400 to-emerald-600 flex items-center justify-center shadow-lg shadow-green-500/20">
                        <Bot className="w-4 h-4 text-white" />
                    </div>
                    <div>
                        <h3 className="font-semibold text-white text-sm">FinSage AI</h3>
                        <div className="flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                            <span className="text-[10px] text-emerald-500 font-medium">Online</span>
                        </div>
                    </div>
                </div>
                <div className="flex items-center gap-1">
                    {onReset && (
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-white" onClick={onReset}>
                            <RotateCcw className="w-4 h-4" />
                        </Button>
                    )}
                </div>
            </div>

            {/* Messages Area */}
            <ScrollArea className="flex-1 p-4">
                <div className="space-y-6">
                    {messages.map((msg) => (
                        <div
                            key={msg.id}
                            className={`flex gap-3 ${msg.role === "user" ? "flex-row-reverse" : ""}`}
                        >
                            <Avatar className="w-8 h-8 border border-border/10 shadow-sm mt-1">
                                {msg.role === "assistant" || msg.role === "system" ? (
                                    <>
                                        <AvatarImage src="/ai-avatar.png" />
                                        <AvatarFallback className="bg-[#1e293b] text-emerald-400">
                                            <Bot className="w-4 h-4" />
                                        </AvatarFallback>
                                    </>
                                ) : (
                                    <>
                                        <AvatarImage src="/user-avatar.png" />
                                        <AvatarFallback className="bg-primary/20 text-primary">
                                            <User className="w-4 h-4" />
                                        </AvatarFallback>
                                    </>
                                )}
                            </Avatar>

                            <div className={`flex flex-col gap-2 max-w-[85%] ${msg.role === "user" ? "items-end" : "items-start"}`}>
                                <div
                                    className={`rounded-2xl px-4 py-3 text-sm shadow-sm ${msg.role === "user"
                                            ? "bg-primary text-primary-foreground rounded-tr-none"
                                            : "bg-[#1e293b] text-slate-200 rounded-tl-none border border-border/5"
                                        }`}
                                >
                                    {msg.content}
                                </div>

                                {/* Action Card */}
                                {msg.type === "action_card" && msg.actionData && (
                                    <Card className="bg-[#1e293b]/50 border-emerald-500/30 overflow-hidden w-full animate-in zoom-in-95 duration-300">
                                        <div className="p-1 h-1 w-full bg-gradient-to-r from-emerald-500 via-green-400 to-emerald-600" />
                                        <div className="p-4 space-y-3">
                                            <div className="flex items-center gap-2 text-emerald-400">
                                                <Sparkles className="w-4 h-4" />
                                                <span className="text-xs font-bold uppercase tracking-wider">{msg.actionData.title}</span>
                                            </div>
                                            <p className="text-sm text-slate-300 leading-relaxed">
                                                {msg.actionData.description}
                                            </p>
                                            <div className="flex gap-2 pt-1">
                                                <Button
                                                    size="sm"
                                                    className="bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-900/20 w-full transition-all hover:scale-[1.02]"
                                                    onClick={msg.actionData.onAction}
                                                >
                                                    {msg.actionData.actionLabel}
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    className="border-slate-700 text-slate-400 hover:text-white hover:bg-slate-800 w-auto px-4"
                                                >
                                                    Not now
                                                </Button>
                                            </div>
                                        </div>
                                    </Card>
                                )}

                                <span className="text-[10px] text-slate-500 px-1 opacity-70">
                                    {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </span>
                            </div>
                        </div>
                    ))}

                    {isTyping && (
                        <div className="flex gap-3">
                            <Avatar className="w-8 h-8 border border-border/10 mt-1">
                                <AvatarFallback className="bg-[#1e293b] text-emerald-400">
                                    <Bot className="w-4 h-4" />
                                </AvatarFallback>
                            </Avatar>
                            <div className="bg-[#1e293b] border border-border/5 rounded-2xl rounded-tl-none px-4 py-3 flex items-center gap-1.5 w-16 h-[42px]">
                                <span className="w-1.5 h-1.5 bg-emerald-500/50 rounded-full animate-bounce [animation-delay:-0.3s]" />
                                <span className="w-1.5 h-1.5 bg-emerald-500/50 rounded-full animate-bounce [animation-delay:-0.15s]" />
                                <span className="w-1.5 h-1.5 bg-emerald-500/50 rounded-full animate-bounce" />
                            </div>
                        </div>
                    )}
                    <div ref={scrollRef} />
                </div>
            </ScrollArea>

            {/* Input Area */}
            <div className="p-4 bg-[#0f172a] border-t border-border/10">
                <form onSubmit={handleSubmit} className="relative group">
                    <Input
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="Ask anything... (Ctrl+L)"
                        className="pr-12 bg-[#1e293b] border-slate-700/50 focus-visible:ring-emerald-500/50 focus-visible:border-emerald-500/50 text-slate-200 placeholder:text-slate-500 transition-all group-hover:border-slate-600"
                    />
                    <Button
                        type="submit"
                        size="icon"
                        className="absolute right-1 top-1 h-8 w-8 bg-emerald-600 hover:bg-emerald-500 text-white transition-all shadow-lg shadow-emerald-900/20"
                        disabled={!input.trim()}
                    >
                        <Send className="w-4 h-4" />
                    </Button>
                </form>
                <div className="flex justify-between items-center mt-2 px-1">
                    <div className="flex gap-2">
                        <Badge variant="outline" className="text-[10px] bg-[#1e293b] text-slate-400 border-slate-800 hover:bg-slate-800 cursor-pointer transition-colors">PLANNING</Badge>
                        <Badge variant="outline" className="text-[10px] bg-[#1e293b] text-slate-400 border-slate-800 hover:bg-slate-800 cursor-pointer transition-colors">GEMINI 1.5 PRO</Badge>
                    </div>
                </div>
            </div>
        </div>
    );
}
