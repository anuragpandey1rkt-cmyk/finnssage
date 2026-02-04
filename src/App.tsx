import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/context/AuthContext";
import { FinancialProvider } from "@/context/FinancialContext";
import { CurrencyProvider } from "@/context/CurrencyContext";
import { RequireAuth } from "@/components/RequireAuth";
import Dashboard from "./pages/Dashboard";
import Login from "./pages/Login";
import Consent from "./pages/Consent";
import Spending from "./pages/Spending";
import CreditOptimizer from "./pages/CreditOptimizer";
import AIConsole from "./pages/AIConsole";
import Investments from "./pages/Investments";
import Alerts from "./pages/Alerts";
import Goals from "./pages/Goals";
import Reports from "./pages/Reports";
import Settings from "./pages/Settings";
import Privacy from "./pages/Privacy";
import NotFound from "./pages/NotFound";
import Onboarding from "./pages/Onboarding";
import FinancialCalculators from "./pages/FinancialCalculators";
import StockTrading from "./pages/StockTrading";
import CryptoTrading from "./pages/CryptoTrading";
import BudgetPlanner from "./pages/BudgetPlanner";
import PortfolioAnalytics from "./pages/PortfolioAnalytics";
import MarketAnalysis from "./pages/MarketAnalysis";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <FinancialProvider>
        <CurrencyProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <Routes>
                {/* Public routes */}
                <Route path="/login" element={<Login />} />
                <Route path="/consent" element={<Consent />} />
                <Route path="/privacy" element={<Privacy />} />

                {/* Protected routes - require authentication and onboarding */}
                <Route path="/onboarding" element={<RequireAuth><Onboarding /></RequireAuth>} />
                <Route path="/" element={<RequireAuth requireOnboarding><Dashboard /></RequireAuth>} />
                <Route path="/spending" element={<RequireAuth requireOnboarding><Spending /></RequireAuth>} />
                <Route path="/credit-optimizer" element={<RequireAuth requireOnboarding><CreditOptimizer /></RequireAuth>} />
                <Route path="/ai-console" element={<RequireAuth requireOnboarding><AIConsole /></RequireAuth>} />
                <Route path="/investments" element={<RequireAuth requireOnboarding><Investments /></RequireAuth>} />
                <Route path="/alerts" element={<RequireAuth requireOnboarding><Alerts /></RequireAuth>} />
                <Route path="/goals" element={<RequireAuth requireOnboarding><Goals /></RequireAuth>} />
                <Route path="/reports" element={<RequireAuth requireOnboarding><Reports /></RequireAuth>} />
                <Route path="/settings" element={<RequireAuth requireOnboarding><Settings /></RequireAuth>} />
                <Route path="/financial-calculators" element={<RequireAuth requireOnboarding><FinancialCalculators /></RequireAuth>} />
                <Route path="/stock-trading" element={<RequireAuth requireOnboarding><StockTrading /></RequireAuth>} />
                <Route path="/crypto-trading" element={<RequireAuth requireOnboarding><CryptoTrading /></RequireAuth>} />
                <Route path="/budget-planner" element={<RequireAuth requireOnboarding><BudgetPlanner /></RequireAuth>} />
                <Route path="/portfolio-analytics" element={<RequireAuth requireOnboarding><PortfolioAnalytics /></RequireAuth>} />
                <Route path="/market-analysis" element={<RequireAuth requireOnboarding><MarketAnalysis /></RequireAuth>} />

                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
          </TooltipProvider>
        </CurrencyProvider>
      </FinancialProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
