import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { fetchCardDetails, CardDetails } from "@/services/cardAI";
import { Loader2, Zap, Check, CreditCard, Shield, Gift } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/lib/supabase";
import { useCurrency } from "@/context/CurrencyContext";
import { useAuth } from "@/context/AuthContext";

interface AddCreditCardModalProps {
    onCardAdded?: () => void;
}

export const AddCreditCardModal: React.FC<AddCreditCardModalProps> = ({ onCardAdded }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [bankName, setBankName] = useState('');
    const [cardModel, setCardModel] = useState('');
    const [creditLimit, setCreditLimit] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [analyzedData, setAnalyzedData] = useState<CardDetails | null>(null);
    const { toast } = useToast();


    const { user, session } = useAuth();

    const handleAnalyze = async () => {
        if (!bankName || !cardModel) {
            toast({
                title: "Missing Information",
                description: "Please enter both Bank Name and Card Model.",
                variant: "destructive"
            });
            return;
        }

        setIsLoading(true);
        try {
            const data = await fetchCardDetails(bankName, cardModel);
            setAnalyzedData(data);
            toast({
                title: "Card Analyzed",
                description: "We found the benefits for your card!",
            });
        } catch (error: any) {
            console.error("Card Analysis Error:", error);
            let errorMessage = "Could not fetch card details.";

            if (error.message?.includes("FunctionsFetchError")) {
                errorMessage = "Function not deployed or not reachable. Please check your Supabase deployment.";
            } else if (error.message) {
                errorMessage = error.message;
            }

            toast({
                title: "Analysis Failed",
                description: errorMessage,
                variant: "destructive"
            });
        } finally {
            setIsLoading(false);
        }
    };

    const handleSave = async (e: React.MouseEvent) => {
        e.preventDefault();
        if (!analyzedData) return;

        setIsLoading(true);
        try {
            console.log("Attempting to save card for user:", user?.id);
            if (!user?.id) {
                throw new Error("You must be logged in to save cards.");
            }

            const payload = {
                user_id: user.id,
                bank_name: bankName,
                card_model: cardModel,
                credit_limit: parseFloat(creditLimit) || 0,
                features: analyzedData.features || [],
                rewards: analyzedData.rewards || {},
            };

            console.log("Saving payload:", payload);

            console.log("Saving payload using raw FETCH:", payload);

            // Construct REST API URL
            const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
            const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

            if (!session?.access_token) {
                throw new Error("No active session token found. Please reload.");
            }

            const response = await fetch(`${supabaseUrl}/rest/v1/user_credit_cards`, {
                method: 'POST',
                headers: {
                    'apikey': supabaseKey,
                    'Authorization': `Bearer ${session.access_token}`,
                    'Content-Type': 'application/json',
                    'Prefer': 'return=minimal'
                },
                body: JSON.stringify(payload)
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || errorData.error || "Failed to save to database");
            }


            toast({
                title: "Card Added",
                description: `${bankName} ${cardModel} has been added to your wallet.`,
            });
            setIsOpen(false);
            if (onCardAdded) onCardAdded();

            // Reset form
            setBankName('');
            setCardModel('');
            setCreditLimit('');
            setAnalyzedData(null);

        } catch (error: any) {
            console.error("Save Error:", error);

            let msg = "Failed to save card. Please try again.";
            if (error.message) msg = error.message;
            if (error.details) msg += ` (${error.details})`;

            toast({
                title: "Error Saving Card",
                description: msg,
                variant: "destructive"
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <Button className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white shadow-lg shadow-purple-500/25">
                    <CreditCard className="mr-2 h-4 w-4" /> Add Credit Card
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px] bg-slate-900 text-white border-slate-800">
                <DialogHeader>
                    <DialogTitle className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400">
                        Add New Credit Card
                    </DialogTitle>
                </DialogHeader>

                <div className="grid gap-6 py-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="bank" className="text-slate-300">Bank Name</Label>
                            <Input
                                id="bank"
                                placeholder="e.g. HDFC, SBI"
                                value={bankName}
                                onChange={(e) => setBankName(e.target.value)}
                                className="bg-slate-800 border-slate-700 text-white placeholder:text-slate-500"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="model" className="text-slate-300">Card Model</Label>
                            <Input
                                id="model"
                                placeholder="e.g. Regalia Gold"
                                value={cardModel}
                                onChange={(e) => setCardModel(e.target.value)}
                                className="bg-slate-800 border-slate-700 text-white placeholder:text-slate-500"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="limit" className="text-slate-300">Credit Limit (Optional)</Label>
                        <Input
                            id="limit"
                            type="number"
                            placeholder="e.g. 500000"
                            value={creditLimit}
                            onChange={(e) => setCreditLimit(e.target.value)}
                            className="bg-slate-800 border-slate-700 text-white placeholder:text-slate-500"
                        />
                    </div>

                    {!analyzedData ? (
                        <Button
                            type="button"
                            onClick={(e) => { e.preventDefault(); handleAnalyze(); }}
                            disabled={isLoading || !bankName || !cardModel}
                            className="w-full bg-blue-600 hover:bg-blue-700"
                        >
                            {isLoading ? (
                                <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Analyzing...</>
                            ) : (
                                <><Zap className="mr-2 h-4 w-4" /> Detect Benefits with AI</>
                            )}
                        </Button>
                    ) : (
                        <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <div className="rounded-lg border border-slate-700 bg-slate-800/50 p-4 space-y-3">
                                <div className="flex items-center gap-2 text-green-400 font-medium">
                                    <Check className="h-4 w-4" /> Benefits Detected
                                </div>

                                <div className="grid gap-2 text-sm text-slate-300">
                                    {analyzedData.features.slice(0, 3).map((feature, idx) => (
                                        <div key={idx} className="flex items-start gap-2">
                                            <Shield className="h-3 w-3 mt-1 text-blue-400 shrink-0" />
                                            <span>{feature}</span>
                                        </div>
                                    ))}
                                </div>

                                <div className="mt-3 pt-3 border-t border-slate-700">
                                    <div className="text-xs text-slate-400 uppercase font-bold mb-2">Rewards</div>
                                    <div className="flex items-center gap-2 text-sm">
                                        <Gift className="h-3 w-3 text-purple-400" />
                                        <span>Base: <span className="text-white">{analyzedData.rewards.base_rate}</span></span>
                                    </div>
                                </div>
                            </div>

                            <div className="flex gap-3">
                                <Button variant="outline" onClick={() => setAnalyzedData(null)} className="flex-1 border-slate-700 text-slate-300 hover:bg-slate-800 hover:text-white">
                                    Back
                                </Button>
                                <Button type="button" onClick={handleSave} className="flex-1 bg-green-600 hover:bg-green-700 text-white">
                                    {isLoading ? <Loader2 className="animate-spin h-4 w-4" /> : "Confirm & Save Card"}
                                </Button>
                            </div>
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
};
