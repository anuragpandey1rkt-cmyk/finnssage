import { useState, useEffect } from "react";
import {
  CreditCard,
  TrendingUp,
  AlertTriangle,
  ChevronRight,
  CheckCircle2,
  XCircle,
  Sparkles,
  Gift,
  Shield,
  Trash2,
  Plus
} from "lucide-react";
import { DashboardLayout } from "@/components/layout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AddCreditCardModal } from "@/components/cards/AddCreditCardModal";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/hooks/use-toast";

// --- Interfaces ---
interface UserCard {
  id: string;
  bank_name: string;
  card_model: string;
  credit_limit: number;
  features: string[];
  rewards: {
    base_rate: string;
    special_categories: { category: string; rate: string }[];
  };
  created_at: string;
}

interface CategoryAnalysis {
  category: string;
  currentCard: string;
  optimalCard: string;
  currentRate: string;
  optimalRate: string;
  monthlySpend: number;
  potentialGain: number;
}

// --- Helper Functions ---

// 1. Get Card Color based on Bank Name (Premium Gradients)
const getCardColor = (bankName: string) => {
  const name = bankName.toLowerCase();
  if (name.includes("chase")) return "from-blue-600 to-blue-900";
  if (name.includes("amex") || name.includes("american express")) return "from-amber-500 to-yellow-700";
  if (name.includes("capital one") || name.includes("venture")) return "from-slate-700 to-slate-900";
  if (name.includes("citi")) return "from-blue-500 to-red-500";
  if (name.includes("discover")) return "from-orange-500 to-orange-700";
  if (name.includes("apple")) return "from-slate-200 to-slate-400 text-black";
  if (name.includes("hdfc")) return "from-blue-800 to-red-700";
  if (name.includes("icici")) return "from-orange-600 to-red-800";
  if (name.includes("sbi")) return "from-blue-500 to-cyan-600";
  return "from-slate-800 to-slate-950"; // Default Dark Premium
};

// 2. Parse Reward Rate to Number (e.g., "5x points" -> 5, "2%" -> 2)
const parseRate = (rateStr: string): number => {
  if (!rateStr) return 0;
  const match = rateStr.match(/(\d+(\.\d+)?)/);
  return match ? parseFloat(match[0]) : 0; // Returns raw number (e.g., 5 for 5x, 2 for 2%)
};

// 3. Normalize Rate String for Display
const formatRate = (rateStr: string) => {
  if (!rateStr) return "1x";
  return rateStr.replace(" points", "").replace(" miles", "").replace(" cashback", "");
};


export default function CreditOptimizer() {
  const [cards, setCards] = useState<UserCard[]>([]);
  const [loading, setLoading] = useState(true);
  const { user, session } = useAuth();
  const { toast } = useToast();

  // --- Fetch Cards ---
  const fetchCards = async () => {
    if (!user || !session?.access_token) {
      setLoading(false);
      return;
    }

    try {
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

      const response = await fetch(`${supabaseUrl}/rest/v1/user_credit_cards?user_id=eq.${user.id}&order=created_at.desc`, {
        method: 'GET',
        headers: {
          'apikey': supabaseKey,
          'Authorization': `Bearer ${session.access_token}`,
        }
      });

      if (!response.ok) throw new Error("Failed to fetch cards");

      const data = await response.json();
      setCards(data || []);
    } catch (error) {
      console.error("Fetch error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) fetchCards();
  }, [user]);

  // --- Calculations ---

  // Define standard categories and average monthly spend (Estimates)
  const categories = [
    { name: "Dining", spend: 450 },
    { name: "Groceries", spend: 600 },
    { name: "Travel", spend: 200 },
    { name: "Gas/Fuel", spend: 180 },
  ];

  const categoryOptimization: CategoryAnalysis[] = categories.map(cat => {
    if (cards.length === 0) return { category: cat.name, currentCard: "-", optimalCard: "-", currentRate: "-", optimalRate: "-", monthlySpend: cat.spend, potentialGain: 0 };

    // Find best card for this category
    let bestCard = cards[0];
    let bestRate = 0;
    let bestRateStr = "1x";

    cards.forEach(card => {
      // Check special categories first
      const special = card.rewards.special_categories?.find(c => c.category.toLowerCase().includes(cat.name.toLowerCase()));
      let rate = 1; // Default base
      let rateStr = card.rewards.base_rate;

      if (special) {
        rate = parseRate(special.rate);
        rateStr = special.rate;
      } else {
        rate = parseRate(card.rewards.base_rate) || 1;
      }

      if (rate > bestRate) {
        bestRate = rate;
        bestCard = card;
        bestRateStr = rateStr;
      }
    });

    // Assume currently using a random other card (simulated inefficiency) or the base card
    // For calculation, we compare Best Card vs "1x" base or 2nd best.
    // To show "Gain", we compare Key Card vs Average Card (approx 1.5x)
    const potentialGain = Math.round(cat.spend * (bestRate - 1) * 0.01 * 100) / 100; // Rough dollars

    return {
      category: cat.name,
      currentCard: "Various", // Placeholder for logic
      optimalCard: bestCard.card_model,
      currentRate: "1x",
      optimalRate: formatRate(bestRateStr),
      monthlySpend: cat.spend,
      potentialGain: Math.max(0, potentialGain * 10) // Multiplying to verify point value approx
    };
  });

  const totalMonthlyPotential = categoryOptimization.reduce((acc, curr) => acc + curr.potentialGain, 0);


  // --- Formatting ---
  const formatCurrency = (val: number) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(val);

  return (
    <DashboardLayout title="Credit Card Optimizer" subtitle="Maximize your rewards across all cards">
      <div className="space-y-8">

        {/* 1. Header & Missed Rewards */}
        {cards.length > 0 && (
          <Card className="bg-gradient-to-r from-amber-900/40 to-black border-amber-500/30">
            <CardContent className="py-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="flex items-center justify-center w-12 h-12 rounded-full bg-amber-500/20">
                    <AlertTriangle className="w-6 h-6 text-amber-500" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white">Your Wallet Strategy</h3>
                    <p className="text-sm text-slate-400">
                      Based on your cards, you could earn ~<span className="text-amber-400 font-bold">{formatCurrency(totalMonthlyPotential)}/mo</span> more by optimizing category spend.
                    </p>
                  </div>
                </div>
                <Button variant="outline" className="border-amber-500/50 text-amber-400 hover:bg-amber-500/10">
                  View Recommendations <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* 2. My Credit Cards (Premium Grid) */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-purple-400" />
              My Credit Cards
            </h2>
            <AddCreditCardModal onCardAdded={fetchCards} />
          </div>

          {loading ? (
            <div className="text-center py-10 text-slate-500">Loading your cards...</div>
          ) : cards.length === 0 ? (
            <div className="text-center py-10 border border-dashed border-slate-700 rounded-xl">
              <p className="text-slate-400 mb-4">No cards found. Add your first card to get started!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {cards.map(card => (
                <div key={card.id} className={`relative overflow-hidden rounded-xl bg-gradient-to-br ${getCardColor(card.bank_name)} p-6 text-white shadow-xl transition-all hover:scale-[1.02]`}>
                  {/* Background Pattern */}
                  <div className="absolute -right-4 -top-4 h-32 w-32 rounded-full bg-white/10 blur-2xl" />

                  <div className="flex justify-between items-start mb-8">
                    <div>
                      <p className="text-xs font-medium uppercase tracking-wider opacity-80">{card.bank_name}</p>
                      <h3 className="text-lg font-bold mt-1 max-w-[180px] leading-tight">{card.card_model}</h3>
                    </div>
                    <CreditCard className="w-8 h-8 opacity-50" />
                  </div>

                  <div className="space-y-4 relative z-10">
                    <div className="flex items-center justify-between text-sm">
                      <span className="opacity-70">.... .... .... {card.id.slice(0, 4)}</span>
                    </div>

                    <div className="pt-4 border-t border-white/20 grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-[10px] uppercase opacity-70 mb-1">Base Reward</p>
                        <p className="text-sm font-semibold">{formatRate(card.rewards.base_rate)}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-[10px] uppercase opacity-70 mb-1">Limit</p>
                        <p className="text-sm font-semibold">{card.credit_limit > 0 ? `₹${(card.credit_limit / 1000).toFixed(0)}k` : 'N/A'}</p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 3. Comparisons & Analysis */}
        {cards.length > 0 && (
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Best Card Table */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-blue-400" />
                  Optimization Strategy
                </CardTitle>
                <CardDescription>Use the optimal card for each category</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="rounded-md border border-slate-800 overflow-hidden">
                  <table className="w-full text-sm">
                    <thead className="bg-slate-900/50">
                      <tr className="text-left text-slate-400">
                        <th className="p-3 font-medium">Category</th>
                        <th className="p-3 font-medium">Optimal Card</th>
                        <th className="p-3 font-medium text-center">Efficiency</th>
                        <th className="p-3 font-medium text-right">Est. Gain</th>
                      </tr>
                    </thead>
                    <tbody>
                      {categoryOptimization.map((row, i) => (
                        <tr key={i} className="border-t border-slate-800 hover:bg-slate-900/30">
                          <td className="p-3 font-medium">{row.category}</td>
                          <td className="p-3">
                            <Badge variant="outline" className={`${getCardColor(row.optimalCard)} border-0 text-white`}>
                              {row.optimalCard}
                            </Badge>
                          </td>
                          <td className="p-3 text-center">
                            <span className="text-green-400 font-bold">{row.optimalRate}</span>
                          </td>
                          <td className="p-3 text-right text-green-400">
                            +{formatCurrency(row.potentialGain)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>

            {/* Annual Value Analysis */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-green-400" />
                  Annual Value
                </CardTitle>
                <CardDescription>Est. value vs fees</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {cards.map(card => {
                  // Heuristic Value Calculation
                  const baseVal = 2000; // Value of holding the card
                  const fee = 0; // We don't have fee data yet, assume 0 or need to parse
                  const net = baseVal - fee;

                  return (
                    <div key={card.id} className="flex items-center justify-between p-3 rounded-lg bg-slate-900/50 border border-slate-800">
                      <div className="flex items-center gap-3">
                        <div className={`w-1 h-8 rounded-full bg-gradient-to-b ${getCardColor(card.bank_name)}`} />
                        <div>
                          <p className="font-medium text-sm">{card.card_model}</p>
                          <p className="text-xs text-slate-500">Net Value</p>
                        </div>
                      </div>
                      <span className="text-green-400 font-bold">+{formatCurrency(net)}</span>
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          </div>
        )}

      </div>
    </DashboardLayout>
  );
}
