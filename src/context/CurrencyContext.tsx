import { createContext, useContext, useState, ReactNode } from "react";

type Currency = "USD" | "INR";

interface CurrencyContextType {
    currency: Currency;
    setCurrency: (currency: Currency) => void;
    symbol: string;
    format: (amount: number) => string;
    convert: (usdAmount: number) => number;
}

const EXCHANGE_RATE = 83.5; // USD to INR

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

export function CurrencyProvider({ children }: { children: ReactNode }) {
    const [currency, setCurrency] = useState<Currency>("USD");

    const symbol = currency === "USD" ? "$" : "₹";

    const convert = (usdAmount: number): number => {
        if (currency === "INR") {
            return usdAmount * EXCHANGE_RATE;
        }
        return usdAmount;
    };

    const format = (amount: number): string => {
        const converted = convert(amount);
        if (currency === "INR") {
            // Indian number formatting (lakhs/crores)
            return `₹${converted.toLocaleString("en-IN", { maximumFractionDigits: 0 })}`;
        }
        return `$${converted.toLocaleString("en-US", { maximumFractionDigits: 2 })}`;
    };

    return (
        <CurrencyContext.Provider value={{ currency, setCurrency, symbol, format, convert }}>
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
