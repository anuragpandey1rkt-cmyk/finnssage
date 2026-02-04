import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { supabase, Transaction, Profile } from "@/lib/supabase";
import { useAuth } from "@/context/AuthContext";
import { parseStatement } from "@/services/statementParser";
import { fetchStockPrice } from "@/services/marketData";

export interface Investment {
  id: string;
  symbol: string;
  name: string;
  type: 'stock' | 'sip' | 'mutual_fund';
  quantity: number;
  avg_buy_price: number;
  current_price?: number;
  current_value?: number;
  return_amount?: number;
  return_percentage?: number;
}

interface FinancialData {
  annualIncome: number;
  monthlyIncome: number;
  monthlyExpenses: number;
  monthlySavings: number;
  netWorth: number;
  savingsRate: number;
  transactions: Transaction[];
  investments: Investment[];
  hasCompletedOnboarding: boolean;
}

interface FinancialContextType {
  financialData: FinancialData;
  transactions: Transaction[];
  investments: Investment[];
  isLoading: boolean;
  setAnnualIncome: (income: number) => Promise<void>;
  setMonthlyExpenses: (expenses: number) => Promise<void>;
  addTransaction: (transaction: Omit<Transaction, "id" | "user_id" | "created_at">) => Promise<void>;
  addTransactions: (transactions: Omit<Transaction, "id" | "user_id" | "created_at">[]) => Promise<void>;
  uploadStatement: (file: File) => Promise<void>;
  addInvestment: (investment: Omit<Investment, "id" | "current_price" | "current_value">) => Promise<void>;
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
  investments: [],
  hasCompletedOnboarding: false,
};

const FinancialContext = createContext<FinancialContextType | undefined>(undefined);

export function FinancialProvider({ children }: { children: ReactNode }) {
  const { user, profile, updateProfile } = useAuth();
  const [financialData, setFinancialData] = useState<FinancialData>(defaultFinancialData);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [investments, setInvestments] = useState<Investment[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Calculate financial metrics from transactions and investments
  const calculateMetrics = (txns: Transaction[], invs: Investment[], income: number) => {
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

    // Calculate income for current month
    const transactionIncome = monthlyTxns
      .filter((t) => t.type === "income")
      .reduce((sum, t) => sum + t.amount, 0);

    const monthlyIncome = transactionIncome > 0
      ? transactionIncome
      : (income > 0 ? Math.round(income / 12) : 0);

    const monthlySavings = monthlyIncome - monthlyExpenses;
    const savingsRate = monthlyIncome > 0 ? Math.round((monthlySavings / monthlyIncome) * 100) : 0;

    // Calculate Net Worth: Savings + Investment Value
    const investmentValue = invs.reduce((sum, inv) => sum + (inv.current_value || 0), 0);
    // Simple Net Worth calc for now: (Savings est * 12) + Investments. 
    // Ideally we should track "Cash Balance" properly.
    // For now, let's assume Net Worth = Investments + (Monthly Savings * 12 as Liquid Cash proxy) 
    // This is rough but better than hardcoded.
    const netWorth = investmentValue + (monthlySavings * 12);

    return {
      monthlyIncome,
      monthlyExpenses,
      monthlySavings,
      savingsRate,
      netWorth
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

    console.log("Fetched transactions:", data);

    // Normalize data: ensure type exists and amounts are correct
    const normalizedData = (data as any[]).map(t => {
      // Infer type from amount if missing, or trust existing type
      let type: 'income' | 'expense' = t.type;

      // If type is missing, infer from amount sign
      if (!type) {
        type = t.amount < 0 ? 'expense' : 'income';
      }

      // Ensure amount is handled correctly (database might have negative for expenses)
      // We want absolute amount for display/calcs usually, but let's keep it signed in the DB
      // stored convention but normalize for the app which often expects positive numbers + type
      // OR just ensure consistency.

      return {
        ...t,
        type: type,
        // Ensure amount is absolute for UI if the Type determines sign, 
        // OR keep as is. The app seems to use Math.abs(amount) in places.
        // Let's passed raw amount but ensure type is correct.
      };
    });

    return (normalizedData as Transaction[]) || [];
  };

  // Fetch investments
  const fetchInvestments = async () => {
    if (!user) return [];
    const { data } = await supabase.from("investments").select("*").eq("user_id", user.id);

    if (!data) return [];

    // Enhance with real-time price
    const enhanced = await Promise.all(data.map(async (inv: any) => {
      try {
        const quote = await fetchStockPrice(inv.symbol);
        const currentPrice = quote.price;
        const currentValue = currentPrice * inv.quantity;
        const investedValue = inv.avg_buy_price * inv.quantity;

        return {
          ...inv,
          current_price: currentPrice,
          current_value: currentValue,
          return_amount: currentValue - investedValue,
          return_percentage: ((currentValue - investedValue) / investedValue) * 100
        };
      } catch (e) {
        return inv;
      }
    }));

    return enhanced as Investment[];
  };

  // Refresh all data
  const refreshTransactions = async () => {
    if (!user) return;

    const [txns, invs] = await Promise.all([
      fetchTransactions(),
      fetchInvestments()
    ]);

    setTransactions(txns);
    setInvestments(invs);

    const income = profile?.annual_income || 0;
    const metrics = calculateMetrics(txns, invs, income);

    setFinancialData({
      annualIncome: income,
      ...metrics,
      transactions: txns,
      investments: invs,
      hasCompletedOnboarding: profile?.onboarding_completed || false,
    });
  };

  // Load data when user/profile changes
  useEffect(() => {
    const loadData = async () => {
      if (user) {
        if (profile) {
          await refreshTransactions();
        }
        setIsLoading(false);
      } else {
        setFinancialData(defaultFinancialData);
        setTransactions([]);
        setInvestments([]);
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

    // Re-calculate local state eagerly for UI snap
    const metrics = calculateMetrics(transactions, investments, income);
    setFinancialData((prev) => ({
      ...prev,
      annualIncome: income,
      ...metrics,
    }));
  };

  // Set monthly expenses
  const setMonthlyExpenses = async (expenses: number) => {
    if (!user) return;

    // We update the profile or local state. 
    // Assuming we store this in profile for persistence:
    // If profile table doesn't have monthly_expenses column, we might need to rely on calculation
    // But user explicitly asked to "update expenses".
    // For now, let's update local state and calculate metrics.

    setFinancialData(prev => ({
      ...prev,
      monthlyExpenses: expenses,
      monthlySavings: prev.monthlyIncome - expenses
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

  // Add multiple transactions (bulk import) - using direct REST API to avoid client issues
  const addTransactions = async (txns: Omit<Transaction, "id" | "user_id" | "created_at">[]) => {
    if (!user || txns.length === 0) return;

    // Get session for auth token
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      console.error("No active session - user not authenticated");
      throw new Error("Please log in to upload statements");
    }

    console.log("User authenticated:", session.user.email);

    const transactionsWithUserId = txns.map((t) => ({
      user_id: user.id,
      amount: Number(t.amount) || 0,
      type: t.type,
      category: t.category || 'Other',
      description: t.description || 'No description',
      date: typeof t.date === 'string' ? t.date : new Date(t.date).toISOString().split('T')[0],
      source: 'statement_upload',
    }));

    console.log("Inserting", transactionsWithUserId.length, "transactions via REST API");

    // Use direct REST API call instead of Supabase client
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

    try {
      const response = await fetch(`${supabaseUrl}/rest/v1/transactions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': supabaseKey,
          'Authorization': `Bearer ${session.access_token}`,
          'Prefer': 'return=minimal'
        },
        body: JSON.stringify(transactionsWithUserId)
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("REST API Error:", response.status, errorText);
        throw new Error(`Failed to insert transactions: ${errorText}`);
      }

      console.log(`Successfully inserted ${transactionsWithUserId.length} transactions`);
      await refreshTransactions();
    } catch (error) {
      console.error("Error inserting transactions:", error);
      throw error;
    }
  };

  // Add Investment
  const addInvestment = async (investment: Omit<Investment, "id" | "current_price" | "current_value">) => {
    if (!user) return;
    const { error } = await supabase.from("investments").insert({
      ...investment,
      user_id: user.id
    });
    if (error) {
      console.error("Error adding investment:", error);
      throw error;
    }
    await refreshTransactions();
  };

  // Upload and process statement
  const uploadStatement = async (file: File) => {
    if (!user) return;

    try {
      // 1. Record statement upload
      const { data: statement, error: stmtError } = await supabase.from('statements').insert({
        user_id: user.id,
        filename: file.name,
        processed: false
      }).select().single();

      if (stmtError) throw stmtError;

      // 2. Parse file
      const parsedTxns = await parseStatement(file);

      if (parsedTxns.length === 0) {
        throw new Error("No transactions found in statement.");
      }

      // 3. Prepare transactions with statement_id
      const transactionsToInsert = parsedTxns.map(t => ({
        user_id: user.id,
        statement_id: statement.id,
        amount: t.amount,
        type: t.type,
        category: t.category,
        description: t.description,
        date: t.date.toISOString(),
        source: 'statement_upload'
      }));

      // 4. Insert transactions
      const { error: txnError } = await supabase.from('transactions').insert(transactionsToInsert);

      if (txnError) throw txnError;

      // 5. Mark statement as processed
      await supabase.from('statements').update({
        processed: true,
        transaction_count: parsedTxns.length
      }).eq('id', statement.id);

      // 6. Refresh UI
      await refreshTransactions();

    } catch (error) {
      console.error("Error parsing statement:", error);
      throw error;
    }
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
        investments,
        isLoading,
        setAnnualIncome,
        setMonthlyExpenses,
        addTransaction,
        addTransactions,
        uploadStatement,
        addInvestment,
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
