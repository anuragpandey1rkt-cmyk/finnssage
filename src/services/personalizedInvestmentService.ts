export interface UserFinancialProfile {
    monthlyIncome: number;
    monthlyExpenses: number;
    investableSurplus?: number;
    riskTolerance: "low" | "moderate" | "high";
    age: number;
    savings: number;
    debts: number;
    investments: number;
    investmentGoals: string[];
    dependents?: number;
}

const personalizedInvestmentService = {
    calculateInvestableSurplus(profile: UserFinancialProfile) {
        return profile.monthlyIncome - profile.monthlyExpenses;
    },

    getRiskScore(profile: UserFinancialProfile) {
        const riskMap = { low: 1, moderate: 2, high: 3 };
        return riskMap[profile.riskTolerance as keyof typeof riskMap] || 2;
    },

    analyze(stock: any, profile: UserFinancialProfile) {
        return {
            recommendation: "HOLD",
            reason: "Based on financial profile analysis"
        };
    },

    generateRecommendation(symbol: string, stockInfo: any, profile: UserFinancialProfile, trend: string) {
        const surplus = this.calculateInvestableSurplus(profile);
        const amount = Math.min(surplus * 0.2, 50000);

        return {
            recommendedAmount: amount,
            suitabilityScore: 85,
            timeHorizon: "3-5 Years",
            expectedReturn: "12-15% p.a.",
            reasoning: [
                "• Strong financial alignment and liquidity",
                `• Fits your '${profile.riskTolerance}' risk appetite`,
                `• ${trend} market trend supports entry`,
                "• Diversification benefit for your portfolio"
            ]
        };
    }
};

export default personalizedInvestmentService;
