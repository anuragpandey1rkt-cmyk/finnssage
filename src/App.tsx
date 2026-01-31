import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { FinancialProvider } from "@/context/FinancialContext";
import { CurrencyProvider } from "@/context/CurrencyContext";
import { RequireOnboarding } from "@/components/RequireOnboarding";
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
    <FinancialProvider>
      <CurrencyProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              {/* Public routes */}
              <Route path="/login" element={<Login />} />
              <Route path="/onboarding" element={<Onboarding />} />
              <Route path="/consent" element={<Consent />} />
              <Route path="/privacy" element={<Privacy />} />

              {/* Protected routes - require onboarding completion */}
              <Route path="/" element={<RequireOnboarding><Dashboard /></RequireOnboarding>} />
              <Route path="/spending" element={<RequireOnboarding><Spending /></RequireOnboarding>} />
              <Route path="/credit-optimizer" element={<RequireOnboarding><CreditOptimizer /></RequireOnboarding>} />
              <Route path="/ai-console" element={<RequireOnboarding><AIConsole /></RequireOnboarding>} />
              <Route path="/investments" element={<RequireOnboarding><Investments /></RequireOnboarding>} />
              <Route path="/alerts" element={<RequireOnboarding><Alerts /></RequireOnboarding>} />
              <Route path="/goals" element={<RequireOnboarding><Goals /></RequireOnboarding>} />
              <Route path="/reports" element={<RequireOnboarding><Reports /></RequireOnboarding>} />
              <Route path="/settings" element={<RequireOnboarding><Settings /></RequireOnboarding>} />
              <Route path="/financial-calculators" element={<RequireOnboarding><FinancialCalculators /></RequireOnboarding>} />
              <Route path="/stock-trading" element={<RequireOnboarding><StockTrading /></RequireOnboarding>} />
              <Route path="/crypto-trading" element={<RequireOnboarding><CryptoTrading /></RequireOnboarding>} />
              <Route path="/budget-planner" element={<RequireOnboarding><BudgetPlanner /></RequireOnboarding>} />
              <Route path="/portfolio-analytics" element={<RequireOnboarding><PortfolioAnalytics /></RequireOnboarding>} />
              <Route path="/market-analysis" element={<RequireOnboarding><MarketAnalysis /></RequireOnboarding>} />

              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </CurrencyProvider>
    </FinancialProvider>
  </QueryClientProvider>
);

export default App;
