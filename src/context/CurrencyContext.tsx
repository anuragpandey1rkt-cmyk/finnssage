import { createContext, useContext, ReactNode } from "react";

type Currency = "INR";

interface CurrencyContextType {
    currency: Currency;
    symbol: string;
    format: (amount: number) => string;
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

export function CurrencyProvider({ children }: { children: ReactNode }) {
    const currency: Currency = "INR";
    const symbol = "₹";

    const format = (amount: number): string => {
        // Indian number formatting (lakhs/crores)
        return `₹${amount.toLocaleString("en-IN", { maximumFractionDigits: 0 })}`;
    };

    return (
        <CurrencyContext.Provider value={{ currency, symbol, format }}>
            {children}
        </CurrencyContext.Provider>
    );
}

export function useCurrency() {
    const context = useContext(CurrencyContext);
    if (context === undefined) {
        throw new Error("useCurrency must be used within a CurrencyProvider");
    }
    return context;
}
