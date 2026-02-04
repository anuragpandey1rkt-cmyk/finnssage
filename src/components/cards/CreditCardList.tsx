import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/lib/supabase";
import { AddCreditCardModal } from "./AddCreditCardModal";
import { CreditCard, Shield, Gift, Trash2, ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/context/AuthContext";

interface UserCard {
    id: string;
    bank_name: string;
    card_model: string;
    credit_limit: number;
    features: string[];
    rewards: {
        base_rate: string;
        special_categories: any[];
    };
}

export const CreditCardList = () => {
    const [cards, setCards] = useState<UserCard[]>([]);
    const [loading, setLoading] = useState(true);
    const [expandedCard, setExpandedCard] = useState<string | null>(null);
    const { toast } = useToast();
    const { user, session } = useAuth();

    const fetchCards = async () => {
        if (!user || !session?.access_token) {
            setLoading(false);
            return;
        }

        try {
            console.log("Fetching cards via REST...");
            const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
            const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

            const response = await fetch(`${supabaseUrl}/rest/v1/user_credit_cards?user_id=eq.${user.id}&order=created_at.desc`, {
                method: 'GET',
                headers: {
                    'apikey': supabaseKey,
                    'Authorization': `Bearer ${session.access_token}`,
                }
            });

            if (!response.ok) {
                throw new Error("Failed to fetch cards");
            }

            const data = await response.json();
            setCards(data || []);
        } catch (error) {
            console.error('Error fetching cards:', error);
            // Don't show toast on fetch error to avoid spamming, just log
        } finally {
            setLoading(false);
        }
    };

    const deleteCard = async (id: string) => {
        if (!session?.access_token) return;

        try {
            const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
            const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

            const response = await fetch(`${supabaseUrl}/rest/v1/user_credit_cards?id=eq.${id}`, {
                method: 'DELETE',
                headers: {
                    'apikey': supabaseKey,
                    'Authorization': `Bearer ${session.access_token}`,
                }
            });

            if (!response.ok) throw new Error("Delete failed");

            toast({ title: "Card Removed", description: "Credit card has been removed from your wallet." });
            fetchCards();
        } catch (error) {
            toast({ title: "Error", description: "Failed to delete card.", variant: "destructive" });
        }
    };

    useEffect(() => {
        if (user) {
            fetchCards();
        }
    }, [user]); // Re-fetch when user matches

    const toggleExpand = (id: string) => {
        setExpandedCard(expandedCard === id ? null : id);
    };

    return (
        <Card className="lg:col-span-2">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-xl font-bold flex items-center gap-2">
                    <CreditCard className="w-5 h-5 text-purple-400" />
                    My Credit Cards
                </CardTitle>
                <AddCreditCardModal onCardAdded={fetchCards} />
            </CardHeader>
            <CardContent>
                <div className="space-y-4 mt-2">
                    {loading ? (
                        <div className="text-center py-4 text-muted-foreground">Loading cards...</div>
                    ) : cards.length === 0 ? (
                        <div className="text-center py-8 border-2 border-dashed border-slate-700 rounded-xl bg-slate-800/20">
                            <CreditCard className="w-8 h-8 mx-auto text-slate-500 mb-2" />
                            <p className="text-muted-foreground text-sm">No credit cards added yet.</p>
                            <p className="text-xs text-slate-500 mt-1">Add a card to track benefits & rewards.</p>
                        </div>
                    ) : (
                        <div className="grid gap-3">
                            {cards.map((card) => (
                                <div key={card.id} className="group relative rounded-xl border border-slate-700 bg-gradient-to-br from-slate-800 to-slate-900 overflow-hidden transition-all hover:shadow-lg hover:shadow-purple-900/10">
                                    <div className="p-4 cursor-pointer" onClick={() => toggleExpand(card.id)}>
                                        <div className="flex justify-between items-start">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-blue-600 flex items-center justify-center text-white font-bold text-xs shadow-inner">
                                                    {card.bank_name.substring(0, 2).toUpperCase()}
                                                </div>
                                                <div>
                                                    <h3 className="font-semibold text-white">{card.card_model}</h3>
                                                    <p className="text-xs text-slate-400">{card.bank_name}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                {card.credit_limit > 0 && (
                                                    <Badge variant="outline" className="bg-slate-900/50 text-slate-300 border-slate-600">
                                                        Limit: ₹{(card.credit_limit / 1000).toFixed(0)}k
                                                    </Badge>
                                                )}
                                                <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-white" onClick={(e) => { e.stopPropagation(); deleteCard(card.id); }}>
                                                    <Trash2 className="w-4 h-4" />
                                                </Button>
                                                {expandedCard === card.id ? <ChevronUp className="w-4 h-4 text-slate-500" /> : <ChevronDown className="w-4 h-4 text-slate-500" />}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Expanded Details */}
                                    {expandedCard === card.id && (
                                        <div className="px-4 pb-4 pt-0 border-t border-slate-700/50 bg-slate-800/30">
                                            <div className="mt-3 grid gap-3 animate-in slide-in-from-top-2 duration-300">
                                                {/* Benefits */}
                                                <div className="space-y-2">
                                                    <div className="flex items-center gap-2 text-xs font-semibold text-blue-400 uppercase tracking-wider">
                                                        <Shield className="w-3 h-3" /> Key Benefits
                                                    </div>
                                                    <ul className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                                        {card.features?.slice(0, 4).map((feat, idx) => (
                                                            <li key={idx} className="text-xs text-slate-300 flex items-start gap-1.5">
                                                                <span className="w-1 h-1 rounded-full bg-blue-500 mt-1.5 shrink-0" />
                                                                {feat}
                                                            </li>
                                                        ))}
                                                    </ul>
                                                </div>

                                                {/* Rewards */}
                                                <div className="space-y-2">
                                                    <div className="flex items-center gap-2 text-xs font-semibold text-purple-400 uppercase tracking-wider">
                                                        <Gift className="w-3 h-3" /> Rewards
                                                    </div>
                                                    <div className="text-xs text-slate-300 bg-slate-900/50 p-2 rounded border border-slate-700/50">
                                                        Base: {card.rewards?.base_rate || "N/A"}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    );
};
