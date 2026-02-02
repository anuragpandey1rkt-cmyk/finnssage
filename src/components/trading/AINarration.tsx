// AI Narration Component - Shows what the AI is doing
import { Bot } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface AINarrationProps {
    isActive: boolean;
    message: string;
    confidence?: number;
}

export function AINarration({ isActive, message, confidence }: AINarrationProps) {
    if (!isActive || !message) return null;

    return (
        <div
            className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[9998] animate-in slide-in-from-bottom-4 duration-300"
            style={{ maxWidth: "600px", width: "90%" }}
        >
            <Card className="border-2 border-primary/50 bg-card/95 backdrop-blur-sm shadow-2xl">
                <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                        <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                            <Bot className="w-5 h-5 text-primary animate-pulse" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-foreground">{message}</p>
                            {confidence !== undefined && (
                                <div className="mt-2">
                                    <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
                                        <span>Confidence</span>
                                        <span className="font-semibold">{(confidence * 100).toFixed(0)}%</span>
                                    </div>
                                    <div className="h-1.5 bg-secondary rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-gradient-to-r from-success to-primary transition-all duration-500"
                                            style={{ width: `${confidence * 100}%` }}
                                        />
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
