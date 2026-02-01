import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { supabase, Transaction, Profile } from "@/lib/supabase";
import { useAuth } from "@/context/AuthContext";

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
  transactions: Transaction[];
  isLoading: boolean;
  setAnnualIncome: (income: number) => Promise<void>;
  addTransaction: (transaction: Omit<Transaction, "id" | "user_id" | "created_at">) => Promise<void>;
  addTransactions: (transactions: Omit<Transaction, "id" | "user_id" | "created_at">[]) => Promise<void>;
  deleteTransaction: (id: string) => Promise<void>;
  refreshTransactions: () => Promise<void>;
  completeOnboarding: () => Promise<void>;
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
  const { user, profile, updateProfile } = useAuth();
  const [financialData, setFinancialData] = useState<FinancialData>(defaultFinancialData);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Calculate financial metrics from transactions
  const calculateMetrics = (txns: Transaction[], income: number) => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    // Filter transactions for current month
    const monthlyTxns = txns.filter((t) => {
      const txDate = new Date(t.date);
      return txDate.getMonth() === currentMonth && txDate.getFullYear() === currentYear;
    });

    // Calculate expenses for current month
    const monthlyExpenses = monthlyTxns
      .filter((t) => t.type === "expense")
      .reduce((sum, t) => sum + Math.abs(t.amount), 0);

    // Calculate income for current month (from transactions + set income)
    const transactionIncome = monthlyTxns
      .filter((t) => t.type === "income")
      .reduce((sum, t) => sum + t.amount, 0);

    const monthlyIncome = Math.round(income / 12) + transactionIncome;
    const monthlySavings = monthlyIncome - monthlyExpenses;
    const savingsRate = monthlyIncome > 0 ? Math.round((monthlySavings / monthlyIncome) * 100) : 0;

    return {
      monthlyIncome,
      monthlyExpenses,
      monthlySavings,
      savingsRate,
      netWorth: Math.round(income * 2.5), // Estimate based on income
    };
  };

  // Fetch transactions from Supabase
  const fetchTransactions = async () => {
    if (!user) return [];

    const { data, error } = await supabase
      .from("transactions")
      .select("*")
      .eq("user_id", user.id)
      .order("date", { ascending: false });

    if (error) {
      console.error("Error fetching transactions:", error);
      return [];
    }

    return data as Transaction[];
  };

  // Refresh transactions and recalculate metrics
  const refreshTransactions = async () => {
    if (!user) return;

    const txns = await fetchTransactions();
    setTransactions(txns);

    const income = profile?.annual_income || 0;
    const metrics = calculateMetrics(txns, income);

    setFinancialData({
      annualIncome: income,
      ...metrics,
      transactions: txns,
      hasCompletedOnboarding: profile?.onboarding_completed || false,
    });
  };

  // Load data when user/profile changes
  useEffect(() => {
    const loadData = async () => {
      if (user) {
        // User exists, try to load data
        if (profile) {
          await refreshTransactions();
        }
        // Always set loading to false when user is authenticated
        setIsLoading(false);
      } else {
        // No user, reset to defaults
        setFinancialData(defaultFinancialData);
        setTransactions([]);
        setIsLoading(false);
      }
    };

    loadData();
  }, [user, profile]);

  // Set annual income
  const setAnnualIncome = async (income: number) => {
    if (!user) return;

    await updateProfile({
      annual_income: income,
      monthly_income: Math.round(income / 12),
    });

    const metrics = calculateMetrics(transactions, income);
    setFinancialData((prev) => ({
      ...prev,
      annualIncome: income,
      ...metrics,
    }));
  };

  // Add a single transaction
  const addTransaction = async (transaction: Omit<Transaction, "id" | "user_id" | "created_at">) => {
    if (!user) return;

    const { error } = await supabase.from("transactions").insert({
      ...transaction,
      user_id: user.id,
    });

    if (error) {
      console.error("Error adding transaction:", error);
      throw error;
    }

    await refreshTransactions();
  };

  // Add multiple transactions (bulk import)
  const addTransactions = async (txns: Omit<Transaction, "id" | "user_id" | "created_at">[]) => {
    if (!user || txns.length === 0) return;

    const transactionsWithUserId = txns.map((t) => ({
      ...t,
      user_id: user.id,
    }));

    const { error } = await supabase.from("transactions").insert(transactionsWithUserId);

    if (error) {
      console.error("Error adding transactions:", error);
      throw error;
    }

    await refreshTransactions();
  };

  // Delete a transaction
  const deleteTransaction = async (id: string) => {
    if (!user) return;

    const { error } = await supabase
      .from("transactions")
      .delete()
      .eq("id", id)
      .eq("user_id", user.id);

    if (error) {
      console.error("Error deleting transaction:", error);
      throw error;
    }

    await refreshTransactions();
  };

  // Complete onboarding
  const completeOnboarding = async () => {
    if (!user) return;

    await updateProfile({
      onboarding_completed: true,
    });

    setFinancialData((prev) => ({
      ...prev,
      hasCompletedOnboarding: true,
    }));
  };

  return (
    <FinancialContext.Provider
      value={{
        financialData,
        transactions,
        isLoading,
        setAnnualIncome,
        addTransaction,
        addTransactions,
        deleteTransaction,
        refreshTransactions,
        completeOnboarding,
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
