import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
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


const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/login" element={<Login />} />
          <Route path="/onboarding" element={<Onboarding />} />
          <Route path="/consent" element={<Consent />} />
          <Route path="/spending" element={<Spending />} />
          <Route path="/credit-optimizer" element={<CreditOptimizer />} />
          <Route path="/ai-console" element={<AIConsole />} />
          <Route path="/investments" element={<Investments />} />
          <Route path="/alerts" element={<Alerts />} />
          <Route path="/goals" element={<Goals />} />
          <Route path="/reports" element={<Reports />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/privacy" element={<Privacy />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
