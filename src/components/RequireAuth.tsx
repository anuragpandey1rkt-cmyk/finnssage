import { ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Loader2 } from "lucide-react";

interface RequireAuthProps {
    children: ReactNode;
    requireOnboarding?: boolean;
}

export function RequireAuth({ children, requireOnboarding = false }: RequireAuthProps) {
    const { user, profile, isLoading } = useAuth();
    const location = useLocation();

    // Show loading spinner while checking auth
    // Show loading spinner while checking auth
    if (isLoading) {
        return (
            <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
                <div className="flex flex-col items-center gap-6 max-w-sm text-center">
                    <div className="relative">
                        <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full"></div>
                        <Loader2 className="w-12 h-12 animate-spin text-primary relative z-10" />
                    </div>
                    <div className="space-y-2">
                        <h3 className="text-xl font-semibold tracking-tight">FinSage AI</h3>
                        <p className="text-muted-foreground text-sm">
                            Initialize secure connection...
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    // Redirect to login if not authenticated
    if (!user) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    // If onboarding is required, check if completed
    if (requireOnboarding && profile && !profile.onboarding_completed) {
        return <Navigate to="/onboarding" state={{ from: location }} replace />;
    }

    return <>{children}</>;
}
