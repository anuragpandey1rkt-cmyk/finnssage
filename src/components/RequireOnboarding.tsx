import { ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useFinancial } from "@/context/FinancialContext";
import { Sparkles } from "lucide-react";

interface RequireOnboardingProps {
    children: ReactNode;
}

export function RequireOnboarding({ children }: RequireOnboardingProps) {
    const { financialData, isLoading } = useFinancial();
    const location = useLocation();

    // Show loading state while checking
    if (isLoading) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <div className="flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-info animate-pulse">
                        <Sparkles className="w-8 h-8 text-primary-foreground" />
                    </div>
                    <div className="w-12 h-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
                    <p className="text-muted-foreground animate-pulse">Loading FinSage AI...</p>
                </div>
            </div>
        );
    }

    // Redirect to onboarding if not completed
    if (!financialData.hasCompletedOnboarding) {
        return <Navigate to="/onboarding" state={{ from: location }} replace />;
    }

    return <>{children}</>;
}
