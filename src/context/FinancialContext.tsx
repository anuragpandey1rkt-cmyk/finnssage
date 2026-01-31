import { createContext, useContext, useState, useEffect, ReactNode } from "react";

interface Transaction {
  date: string;
  description: string;
  amount: number;
  category: string;
}

interface FinancialData {
  annualIncome: number;
  monthlyIncome: number;
  monthlyExpenses: number;
  monthlySavings: number;
  netWorth: number;
  savingsRate: number;
  transactions: Transaction[];
  hasCompletedOnboarding: boolean;
}

interface FinancialContextType {
  financialData: FinancialData;
  setAnnualIncome: (income: number) => void;
  setTransactions: (transactions: Transaction[]) => void;
  completeOnboarding: () => void;
  resetOnboarding: () => void;
  isLoading: boolean;
}

const defaultFinancialData: FinancialData = {
  annualIncome: 0,
  monthlyIncome: 0,
  monthlyExpenses: 0,
  monthlySavings: 0,
  netWorth: 0,
  savingsRate: 0,
  transactions: [],
  hasCompletedOnboarding: false,
};

const FinancialContext = createContext<FinancialContextType | undefined>(undefined);

export function FinancialProvider({ children }: { children: ReactNode }) {
  const [financialData, setFinancialData] = useState<FinancialData>(defaultFinancialData);
  const [isLoading, setIsLoading] = useState(true);

  // Load data from localStorage on mount
  useEffect(() => {
    const storedIncome = localStorage.getItem("userIncome");
    const storedOnboarding = localStorage.getItem("onboardingComplete");
    const storedTransactions = localStorage.getItem("userTransactions");

    if (storedIncome && storedOnboarding === "true") {
      const annualIncome = parseInt(storedIncome, 10);
      const monthlyIncome = Math.round(annualIncome / 12);
      // Assume ~65% expenses for realistic data
      const monthlyExpenses = Math.round(monthlyIncome * 0.65);
      const monthlySavings = monthlyIncome - monthlyExpenses;
      const savingsRate = Math.round((monthlySavings / monthlyIncome) * 100);

      let transactions: Transaction[] = [];
      if (storedTransactions) {
        try {
          transactions = JSON.parse(storedTransactions);
        } catch {
          transactions = [];
        }
      }

      setFinancialData({
        annualIncome,
        monthlyIncome,
        monthlyExpenses,
        monthlySavings,
        netWorth: Math.round(annualIncome * 2.5),
        savingsRate,
        transactions,
        hasCompletedOnboarding: true,
      });
    }

    setIsLoading(false);
  }, []);

  const setAnnualIncome = (income: number) => {
    const monthlyIncome = Math.round(income / 12);
    const monthlyExpenses = Math.round(monthlyIncome * 0.65);
    const monthlySavings = monthlyIncome - monthlyExpenses;
    const savingsRate = Math.round((monthlySavings / monthlyIncome) * 100);

    localStorage.setItem("userIncome", income.toString());

    setFinancialData((prev) => ({
      ...prev,
      annualIncome: income,
      monthlyIncome,
      monthlyExpenses,
      monthlySavings,
      netWorth: Math.round(income * 2.5),
      savingsRate,
    }));
  };

  const setTransactions = (transactions: Transaction[]) => {
    localStorage.setItem("userTransactions", JSON.stringify(transactions));
    
    // Calculate expenses from transactions
    const totalExpenses = transactions
      .filter((t) => t.amount < 0)
      .reduce((sum, t) => sum + Math.abs(t.amount), 0);
    
    const avgMonthlyExpenses = Math.round(totalExpenses / 12);

    setFinancialData((prev) => ({
      ...prev,
      transactions,
      monthlyExpenses: avgMonthlyExpenses || prev.monthlyExpenses,
      monthlySavings: prev.monthlyIncome - (avgMonthlyExpenses || prev.monthlyExpenses),
    }));
  };

  const completeOnboarding = () => {
    localStorage.setItem("onboardingComplete", "true");
    setFinancialData((prev) => ({
      ...prev,
      hasCompletedOnboarding: true,
    }));
  };

  const resetOnboarding = () => {
    localStorage.removeItem("userIncome");
    localStorage.removeItem("onboardingComplete");
    localStorage.removeItem("userTransactions");
    setFinancialData(defaultFinancialData);
  };

  return (
    <FinancialContext.Provider
      value={{
        financialData,
        setAnnualIncome,
        setTransactions,
        completeOnboarding,
        resetOnboarding,
        isLoading,
      }}
    >
      {children}
    </FinancialContext.Provider>
  );
}

export function useFinancial() {
  const context = useContext(FinancialContext);
  if (context === undefined) {
    throw new Error("useFinancial must be used within a FinancialProvider");
  }
  return context;
}
