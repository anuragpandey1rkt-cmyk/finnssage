import { useState } from "react";
import {
    Calculator,
    DollarSign,
    TrendingUp,
    Home,
    CreditCard,
    Percent,
    Calendar,
    PiggyBank,
} from "lucide-react";
import { DashboardLayout } from "@/components/layout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
} from "recharts";

// Loan Calculator Component
function LoanCalculator() {
    const [loanAmount, setLoanAmount] = useState(50000);
    const [interestRate, setInterestRate] = useState(5.5);
    const [loanTerm, setLoanTerm] = useState(5);

    const monthlyRate = (interestRate / 100) / 12;
    const numPayments = loanTerm * 12;

    let monthlyPayment = 0;
    let totalPayment = 0;
    let totalInterest = 0;

    if (monthlyRate > 0) {
        monthlyPayment = loanAmount * (monthlyRate * Math.pow(1 + monthlyRate, numPayments)) / (Math.pow(1 + monthlyRate, numPayments) - 1);
        totalPayment = monthlyPayment * numPayments;
        totalInterest = totalPayment - loanAmount;
    } else {
        monthlyPayment = loanAmount / numPayments;
        totalPayment = loanAmount;
        totalInterest = 0;
    }

    // Generate amortization schedule
    const schedule = [];
    let remaining = loanAmount;
    for (let month = 1; month <= Math.min(12, numPayments); month++) {
        const interestPayment = remaining * monthlyRate;
        const principalPayment = monthlyPayment - interestPayment;
        remaining -= principalPayment;
        schedule.push({
            month,
            payment: monthlyPayment.toFixed(2),
            principal: principalPayment.toFixed(2),
            interest: interestPayment.toFixed(2),
            balance: Math.max(0, remaining).toFixed(2),
        });
    }

    return (
        <div className="grid gap-6 lg:grid-cols-2">
            <div className="space-y-4">
                <div className="space-y-2">
                    <Label htmlFor="loan-amount">Loan Amount ($)</Label>
                    <div className="relative">
                        <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                            id="loan-amount"
                            type="number"
                            value={loanAmount}
                            onChange={(e) => setLoanAmount(Number(e.target.value))}
                            className="pl-10"
                        />
                    </div>
                </div>

                <div className="space-y-2">
                    <Label htmlFor="interest-rate">Annual Interest Rate (%)</Label>
                    <div className="relative">
                        <Percent className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                            id="interest-rate"
                            type="number"
                            step="0.1"
                            value={interestRate}
                            onChange={(e) => setInterestRate(Number(e.target.value))}
                            className="pl-10"
                        />
                    </div>
                </div>

                <div className="space-y-2">
                    <Label htmlFor="loan-term">Loan Term (years)</Label>
                    <div className="relative">
                        <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                            id="loan-term"
                            type="number"
                            value={loanTerm}
                            onChange={(e) => setLoanTerm(Number(e.target.value))}
                            className="pl-10"
                        />
                    </div>
                </div>

                <Card className="bg-primary/5 border-primary/20">
                    <CardContent className="pt-6">
                        <div className="space-y-4">
                            <div>
                                <p className="text-xs text-muted-foreground uppercase tracking-wider">Monthly Payment</p>
                                <p className="text-3xl font-bold text-primary">${monthlyPayment.toFixed(2)}</p>
                            </div>
                            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-border">
                                <div>
                                    <p className="text-xs text-muted-foreground">Total Payment</p>
                                    <p className="text-lg font-semibold">${totalPayment.toLocaleString(undefined, { maximumFractionDigits: 2 })}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-muted-foreground">Total Interest</p>
                                    <p className="text-lg font-semibold text-destructive">${totalInterest.toLocaleString(undefined, { maximumFractionDigits: 2 })}</p>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <div>
                <h3 className="font-semibold mb-4">First 12 Months Amortization</h3>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b border-border">
                                <th className="text-left py-2 text-muted-foreground font-medium">Month</th>
                                <th className="text-right py-2 text-muted-foreground font-medium">Payment</th>
                                <th className="text-right py-2 text-muted-foreground font-medium">Principal</th>
                                <th className="text-right py-2 text-muted-foreground font-medium">Interest</th>
                                <th className="text-right py-2 text-muted-foreground font-medium">Balance</th>
                            </tr>
                        </thead>
                        <tbody>
                            {schedule.map((row) => (
                                <tr key={row.month} className="border-b border-border/50 hover:bg-secondary/30">
                                    <td className="py-2">{row.month}</td>
                                    <td className="text-right py-2">${row.payment}</td>
                                    <td className="text-right py-2 text-success">${row.principal}</td>
                                    <td className="text-right py-2 text-destructive">${row.interest}</td>
                                    <td className="text-right py-2 font-medium">${row.balance}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

// Investment Calculator Component
function InvestmentCalculator() {
    const [initialInvestment, setInitialInvestment] = useState(10000);
    const [monthlyContribution, setMonthlyContribution] = useState(500);
    const [expectedReturn, setExpectedReturn] = useState(8);
    const [investmentYears, setInvestmentYears] = useState(10);

    const months = investmentYears * 12;
    const monthlyReturn = (expectedReturn / 100) / 12;

    let futureValue = initialInvestment * Math.pow(1 + monthlyReturn, months);
    if (monthlyReturn > 0) {
        futureValue += monthlyContribution * ((Math.pow(1 + monthlyReturn, months) - 1) / monthlyReturn);
    } else {
        futureValue += monthlyContribution * months;
    }

    const totalContributions = initialInvestment + (monthlyContribution * months);
    const totalEarnings = futureValue - totalContributions;

    // Generate chart data
    const chartData = [];
    for (let year = 0; year <= investmentYears; year++) {
        const month = year * 12;
        let value = initialInvestment * Math.pow(1 + monthlyReturn, month);
        if (monthlyReturn > 0) {
            value += monthlyContribution * ((Math.pow(1 + monthlyReturn, month) - 1) / monthlyReturn);
        } else {
            value += monthlyContribution * month;
        }
        chartData.push({
            year: `Year ${year}`,
            value: Math.round(value),
            contributions: initialInvestment + (monthlyContribution * month),
        });
    }

    return (
        <div className="grid gap-6 lg:grid-cols-2">
            <div className="space-y-4">
                <div className="space-y-2">
                    <Label htmlFor="initial">Initial Investment ($)</Label>
                    <div className="relative">
                        <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                            id="initial"
                            type="number"
                            value={initialInvestment}
                            onChange={(e) => setInitialInvestment(Number(e.target.value))}
                            className="pl-10"
                        />
                    </div>
                </div>

                <div className="space-y-2">
                    <Label htmlFor="monthly">Monthly Contribution ($)</Label>
                    <div className="relative">
                        <PiggyBank className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                            id="monthly"
                            type="number"
                            value={monthlyContribution}
                            onChange={(e) => setMonthlyContribution(Number(e.target.value))}
                            className="pl-10"
                        />
                    </div>
                </div>

                <div className="space-y-2">
                    <Label htmlFor="return">Expected Annual Return (%)</Label>
                    <div className="relative">
                        <TrendingUp className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                            id="return"
                            type="number"
                            step="0.5"
                            value={expectedReturn}
                            onChange={(e) => setExpectedReturn(Number(e.target.value))}
                            className="pl-10"
                        />
                    </div>
                </div>

                <div className="space-y-2">
                    <Label htmlFor="years">Investment Period (years)</Label>
                    <div className="relative">
                        <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                            id="years"
                            type="number"
                            value={investmentYears}
                            onChange={(e) => setInvestmentYears(Number(e.target.value))}
                            className="pl-10"
                        />
                    </div>
                </div>

                <Card className="bg-success/5 border-success/20">
                    <CardContent className="pt-6">
                        <div className="space-y-4">
                            <div>
                                <p className="text-xs text-muted-foreground uppercase tracking-wider">Future Value</p>
                                <p className="text-3xl font-bold text-success">${futureValue.toLocaleString(undefined, { maximumFractionDigits: 0 })}</p>
                            </div>
                            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-border">
                                <div>
                                    <p className="text-xs text-muted-foreground">Total Contributions</p>
                                    <p className="text-lg font-semibold">${totalContributions.toLocaleString()}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-muted-foreground">Total Earnings</p>
                                    <p className="text-lg font-semibold text-success">+${totalEarnings.toLocaleString(undefined, { maximumFractionDigits: 0 })}</p>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <div>
                <h3 className="font-semibold mb-4">Investment Growth</h3>
                <div className="h-[300px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                            <defs>
                                <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.2} />
                                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                                </linearGradient>
                                <linearGradient id="colorContributions" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.2} />
                                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                            <XAxis dataKey="year" axisLine={false} tickLine={false} tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }} />
                            <YAxis hide />
                            <Tooltip
                                contentStyle={{ backgroundColor: "hsl(var(--card))", borderColor: "hsl(var(--border))", borderRadius: "0.5rem" }}
                                formatter={(value: number) => [`$${value.toLocaleString()}`, ""]}
                            />
                            <Area type="monotone" dataKey="value" stroke="#10b981" fillOpacity={1} fill="url(#colorValue)" strokeWidth={2} name="Total Value" />
                            <Area type="monotone" dataKey="contributions" stroke="#6366f1" fillOpacity={1} fill="url(#colorContributions)" strokeWidth={2} name="Contributions" />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );
}

// Mortgage Calculator Component
function MortgageCalculator() {
    const [homePrice, setHomePrice] = useState(300000);
    const [downPaymentPct, setDownPaymentPct] = useState(20);
    const [mortgageRate, setMortgageRate] = useState(6.5);
    const [mortgageTerm, setMortgageTerm] = useState(30);

    const downPayment = homePrice * (downPaymentPct / 100);
    const loanAmount = homePrice - downPayment;
    const monthlyRate = (mortgageRate / 100) / 12;
    const numPayments = mortgageTerm * 12;

    let monthlyMortgage = 0;
    if (monthlyRate > 0) {
        monthlyMortgage = loanAmount * (monthlyRate * Math.pow(1 + monthlyRate, numPayments)) / (Math.pow(1 + monthlyRate, numPayments) - 1);
    } else {
        monthlyMortgage = loanAmount / numPayments;
    }

    const propertyTax = (homePrice * 0.012) / 12; // 1.2% annual
    const insurance = (homePrice * 0.005) / 12; // 0.5% annual
    const totalMonthly = monthlyMortgage + propertyTax + insurance;

    return (
        <div className="grid gap-6 lg:grid-cols-2">
            <div className="space-y-4">
                <div className="space-y-2">
                    <Label htmlFor="home-price">Home Price ($)</Label>
                    <div className="relative">
                        <Home className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                            id="home-price"
                            type="number"
                            value={homePrice}
                            onChange={(e) => setHomePrice(Number(e.target.value))}
                            className="pl-10"
                        />
                    </div>
                </div>

                <div className="space-y-2">
                    <Label htmlFor="down-payment">Down Payment (%)</Label>
                    <div className="relative">
                        <Percent className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                            id="down-payment"
                            type="number"
                            value={downPaymentPct}
                            onChange={(e) => setDownPaymentPct(Number(e.target.value))}
                            className="pl-10"
                        />
                    </div>
                </div>

                <div className="space-y-2">
                    <Label htmlFor="mortgage-rate">Interest Rate (%)</Label>
                    <div className="relative">
                        <Percent className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                            id="mortgage-rate"
                            type="number"
                            step="0.1"
                            value={mortgageRate}
                            onChange={(e) => setMortgageRate(Number(e.target.value))}
                            className="pl-10"
                        />
                    </div>
                </div>

                <div className="space-y-2">
                    <Label htmlFor="mortgage-term">Loan Term (years)</Label>
                    <div className="relative">
                        <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                            id="mortgage-term"
                            type="number"
                            value={mortgageTerm}
                            onChange={(e) => setMortgageTerm(Number(e.target.value))}
                            className="pl-10"
                        />
                    </div>
                </div>

                <Card className="bg-info/5 border-info/20">
                    <CardContent className="pt-6">
                        <div className="space-y-4">
                            <div>
                                <p className="text-xs text-muted-foreground uppercase tracking-wider">Monthly Payment</p>
                                <p className="text-3xl font-bold text-info">${totalMonthly.toFixed(2)}</p>
                            </div>
                            <div className="space-y-2 pt-4 border-t border-border text-sm">
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Principal & Interest</span>
                                    <span className="font-medium">${monthlyMortgage.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Property Tax</span>
                                    <span className="font-medium">${propertyTax.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Insurance</span>
                                    <span className="font-medium">${insurance.toFixed(2)}</span>
                                </div>
                            </div>
                            <div className="pt-4 border-t border-border">
                                <p className="text-xs text-muted-foreground">Down Payment Required</p>
                                <p className="text-lg font-bold">${downPayment.toLocaleString()}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <div>
                <h3 className="font-semibold mb-4">Loan Summary</h3>
                <Card>
                    <CardContent className="pt-6">
                        <table className="w-full text-sm">
                            <tbody className="divide-y divide-border">
                                <tr>
                                    <td className="py-3 text-muted-foreground">Home Price</td>
                                    <td className="py-3 text-right font-semibold">${homePrice.toLocaleString()}</td>
                                </tr>
                                <tr>
                                    <td className="py-3 text-muted-foreground">Down Payment ({downPaymentPct}%)</td>
                                    <td className="py-3 text-right font-semibold text-success">${downPayment.toLocaleString()}</td>
                                </tr>
                                <tr>
                                    <td className="py-3 text-muted-foreground">Loan Amount</td>
                                    <td className="py-3 text-right font-semibold">${loanAmount.toLocaleString()}</td>
                                </tr>
                                <tr>
                                    <td className="py-3 text-muted-foreground">Monthly P&I</td>
                                    <td className="py-3 text-right font-semibold">${monthlyMortgage.toFixed(2)}</td>
                                </tr>
                                <tr>
                                    <td className="py-3 text-muted-foreground">Annual Property Tax (est.)</td>
                                    <td className="py-3 text-right font-semibold">${(propertyTax * 12).toLocaleString()}</td>
                                </tr>
                                <tr>
                                    <td className="py-3 text-muted-foreground">Annual Insurance (est.)</td>
                                    <td className="py-3 text-right font-semibold">${(insurance * 12).toLocaleString()}</td>
                                </tr>
                                <tr>
                                    <td className="py-3 font-medium">Total Monthly Payment</td>
                                    <td className="py-3 text-right font-bold text-info">${totalMonthly.toFixed(2)}</td>
                                </tr>
                                <tr>
                                    <td className="py-3 font-medium">Total Annual Payment</td>
                                    <td className="py-3 text-right font-bold">${(totalMonthly * 12).toLocaleString(undefined, { maximumFractionDigits: 0 })}</td>
                                </tr>
                            </tbody>
                        </table>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}

// Credit Card Payoff Calculator
function CreditCardPayoffCalculator() {
    const [ccBalance, setCcBalance] = useState(5000);
    const [ccApr, setCcApr] = useState(18);
    const [ccPayment, setCcPayment] = useState(200);

    const monthlyRate = (ccApr / 100) / 12;

    // Calculate payoff time
    let monthsToPayoff = 0;
    let balance = ccBalance;
    let totalInterestPaid = 0;

    while (balance > 0 && monthsToPayoff < 360) {
        const interest = balance * monthlyRate;
        const principal = ccPayment - interest;

        if (principal <= 0) {
            monthsToPayoff = 360;
            break;
        }

        balance -= principal;
        totalInterestPaid += interest;
        monthsToPayoff++;

        if (balance < 0) {
            balance = 0;
        }
    }

    const years = Math.floor(monthsToPayoff / 12);
    const months = monthsToPayoff % 12;
    const paymentTooLow = ccPayment <= ccBalance * monthlyRate;

    // Generate scenarios
    const scenarios = [ccPayment, Math.round(ccPayment * 1.5), Math.round(ccPayment * 2)].map((payment) => {
        let bal = ccBalance;
        let mon = 0;
        let intPaid = 0;

        while (bal > 0 && mon < 360) {
            const intTemp = bal * monthlyRate;
            const prinTemp = payment - intTemp;

            if (prinTemp <= 0) break;

            bal -= prinTemp;
            intPaid += intTemp;
            mon++;
        }

        return {
            payment: `$${payment}`,
            months: mon,
            interest: `$${intPaid.toLocaleString(undefined, { maximumFractionDigits: 0 })}`,
            total: `$${(ccBalance + intPaid).toLocaleString(undefined, { maximumFractionDigits: 0 })}`,
        };
    });

    return (
        <div className="grid gap-6 lg:grid-cols-2">
            <div className="space-y-4">
                <div className="space-y-2">
                    <Label htmlFor="cc-balance">Current Balance ($)</Label>
                    <div className="relative">
                        <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                            id="cc-balance"
                            type="number"
                            value={ccBalance}
                            onChange={(e) => setCcBalance(Number(e.target.value))}
                            className="pl-10"
                        />
                    </div>
                </div>

                <div className="space-y-2">
                    <Label htmlFor="cc-apr">APR (%)</Label>
                    <div className="relative">
                        <Percent className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                            id="cc-apr"
                            type="number"
                            step="0.5"
                            value={ccApr}
                            onChange={(e) => setCcApr(Number(e.target.value))}
                            className="pl-10"
                        />
                    </div>
                </div>

                <div className="space-y-2">
                    <Label htmlFor="cc-payment">Monthly Payment ($)</Label>
                    <div className="relative">
                        <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                            id="cc-payment"
                            type="number"
                            value={ccPayment}
                            onChange={(e) => setCcPayment(Number(e.target.value))}
                            className="pl-10"
                        />
                    </div>
                </div>

                {paymentTooLow && (
                    <div className="p-3 rounded-lg bg-warning/10 border border-warning/20 text-warning text-sm">
                        ⚠️ Payment too low! Your payment must exceed the monthly interest charge of ${(ccBalance * monthlyRate).toFixed(2)}.
                    </div>
                )}

                <Card className={paymentTooLow ? "bg-destructive/5 border-destructive/20" : "bg-warning/5 border-warning/20"}>
                    <CardContent className="pt-6">
                        <div className="space-y-4">
                            <div>
                                <p className="text-xs text-muted-foreground uppercase tracking-wider">Time to Pay Off</p>
                                <p className="text-3xl font-bold text-warning">
                                    {paymentTooLow ? "Never" : `${years}y ${months}m`}
                                </p>
                            </div>
                            {!paymentTooLow && (
                                <div className="grid grid-cols-2 gap-4 pt-4 border-t border-border">
                                    <div>
                                        <p className="text-xs text-muted-foreground">Total Interest</p>
                                        <p className="text-lg font-semibold text-destructive">${totalInterestPaid.toLocaleString(undefined, { maximumFractionDigits: 0 })}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-muted-foreground">Total Paid</p>
                                        <p className="text-lg font-semibold">${(ccBalance + totalInterestPaid).toLocaleString(undefined, { maximumFractionDigits: 0 })}</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>

            <div>
                <h3 className="font-semibold mb-4">Payoff Scenarios</h3>
                <Card>
                    <CardContent className="pt-6">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b border-border">
                                    <th className="text-left py-2 text-muted-foreground font-medium">Payment</th>
                                    <th className="text-right py-2 text-muted-foreground font-medium">Months</th>
                                    <th className="text-right py-2 text-muted-foreground font-medium">Interest</th>
                                    <th className="text-right py-2 text-muted-foreground font-medium">Total</th>
                                </tr>
                            </thead>
                            <tbody>
                                {scenarios.map((scenario, index) => (
                                    <tr key={index} className={`border-b border-border/50 ${index === 0 ? "bg-primary/5" : ""}`}>
                                        <td className="py-3 font-medium">
                                            {scenario.payment}
                                            {index === 0 && <Badge variant="secondary" className="ml-2 text-xs">Current</Badge>}
                                        </td>
                                        <td className="py-3 text-right">{scenario.months}</td>
                                        <td className="py-3 text-right text-destructive">{scenario.interest}</td>
                                        <td className="py-3 text-right font-semibold">{scenario.total}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </CardContent>
                </Card>

                <div className="mt-4 p-4 rounded-lg bg-info/10 border border-info/20">
                    <p className="text-sm text-muted-foreground">
                        <strong className="text-foreground">💡 Tip:</strong> Increasing your payment by just 50% could save you ${scenarios[0] && scenarios[1] ? (parseFloat(scenarios[0].interest.replace(/[$,]/g, "")) - parseFloat(scenarios[1].interest.replace(/[$,]/g, ""))).toFixed(0) : 0} in interest!
                    </p>
                </div>
            </div>
        </div>
    );
}

export default function FinancialCalculators() {
    return (
        <DashboardLayout title="Financial Calculators" subtitle="Plan your financial future with precision">
            <Card>
                <CardHeader>
                    <div className="flex items-center gap-2">
                        <Calculator className="w-5 h-5 text-primary" />
                        <CardTitle>Calculators</CardTitle>
                    </div>
                    <CardDescription>
                        Use these tools to plan loans, investments, mortgages, and debt payoff strategies
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Tabs defaultValue="loan" className="space-y-6">
                        <TabsList className="grid w-full grid-cols-4">
                            <TabsTrigger value="loan" className="gap-2">
                                <DollarSign className="w-4 h-4" />
                                <span className="hidden sm:inline">Loan</span>
                            </TabsTrigger>
                            <TabsTrigger value="investment" className="gap-2">
                                <TrendingUp className="w-4 h-4" />
                                <span className="hidden sm:inline">Investment</span>
                            </TabsTrigger>
                            <TabsTrigger value="mortgage" className="gap-2">
                                <Home className="w-4 h-4" />
                                <span className="hidden sm:inline">Mortgage</span>
                            </TabsTrigger>
                            <TabsTrigger value="creditcard" className="gap-2">
                                <CreditCard className="w-4 h-4" />
                                <span className="hidden sm:inline">CC Payoff</span>
                            </TabsTrigger>
                        </TabsList>

                        <TabsContent value="loan">
                            <LoanCalculator />
                        </TabsContent>

                        <TabsContent value="investment">
                            <InvestmentCalculator />
                        </TabsContent>

                        <TabsContent value="mortgage">
                            <MortgageCalculator />
                        </TabsContent>

                        <TabsContent value="creditcard">
                            <CreditCardPayoffCalculator />
                        </TabsContent>
                    </Tabs>
                </CardContent>
            </Card>
        </DashboardLayout>
    );
}
