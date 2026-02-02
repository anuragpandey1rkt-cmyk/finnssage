// AI Cursor Component - Visual cursor that demonstrates AI navigation
import { useEffect, useRef } from "react";

interface AICursorProps {
    isActive: boolean;
    position: { x: number; y: number } | null;
}

export function AICursor({ isActive, position }: AICursorProps) {
    const cursorRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (cursorRef.current && position) {
            cursorRef.current.style.transform = `translate(${position.x}px, ${position.y}px)`;
        }
    }, [position]);

    if (!isActive) return null;

    return (
        <>
            <div
                ref={cursorRef}
                className="ai-cursor"
                style={{
                    position: "fixed",
                    width: "16px",
                    height: "16px",
                    borderRadius: "50%",
                    background: "linear-gradient(135deg, #4ade80 0%, #22c55e 100%)",
                    pointerEvents: "none",
                    zIndex: 9999,
                    transition: "transform 0.5s cubic-bezier(0.4, 0, 0.2, 1)",
                    boxShadow: "0 0 20px rgba(74, 222, 128, 0.6), 0 0 40px rgba(74, 222, 128, 0.3)",
                    transform: "translate(-50%, -50%)",
                }}
            >
                {/* Inner glow */}
                <div
                    style={{
                        position: "absolute",
                        top: "50%",
                        left: "50%",
                        transform: "translate(-50%, -50%)",
                        width: "8px",
                        height: "8px",
                        borderRadius: "50%",
                        background: "#fff",
                        opacity: 0.8,
                    }}
                />
            </div>

            {/* Pulse animation styles */}
            <style>{`
        @keyframes ai-cursor-pulse {
          0%, 100% {
            transform: translate(-50%, -50%) scale(1);
            opacity: 1;
          }
          50% {
            transform: translate(-50%, -50%) scale(1.2);
            opacity: 0.8;
          }
        }

        .ai-cursor {
          animation: ai-cursor-pulse 2s ease-in-out infinite;
        }

        @keyframes ai-highlight-pulse {
          0%, 100% {
            box-shadow: 0 0 0 3px rgba(74, 222, 128, 0.25), 0 0 20px rgba(74, 222, 128, 0.4);
          }
          50% {
            box-shadow: 0 0 0 6px rgba(74, 222, 128, 0.4), 0 0 30px rgba(74, 222, 128, 0.6);
          }
        }

        .ai-highlight-pulse {
          animation: ai-highlight-pulse 1.5s ease-in-out infinite;
        }
      `}</style>
        </>
    );
}
