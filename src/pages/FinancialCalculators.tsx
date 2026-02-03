"use client";

import { useState } from "react";
import {
  Calculator,
  TrendingUp,
  Home,
  Percent,
  Calendar,
  PiggyBank,
} from "lucide-react";
import { FaRupeeSign } from "react-icons/fa";
import { DashboardLayout } from "@/components/layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

/* ---------- Reusable Rupee Input Wrapper ---------- */
function RupeeInput({ value, onChange, id }: any) {
  return (
    <div className="relative">
      <FaRupeeSign className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
      <Input
        id={id}
        type="number"
        value={value}
        onChange={onChange}
        className="pl-9"
      />
    </div>
  );
}

/* ---------- Loan Calculator ---------- */
function LoanCalculator() {
  const [amount, setAmount] = useState(500000);
  const [rate, setRate] = useState(10);
  const [years, setYears] = useState(5);

  const r = rate / 100 / 12;
  const n = years * 12;

  const emi =
    (amount * r * Math.pow(1 + r, n)) /
    (Math.pow(1 + r, n) - 1);

  const total = emi * n;
  const interest = total - amount;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Loan / EMI Calculator</CardTitle>
      </CardHeader>
      <CardContent className="grid lg:grid-cols-2 gap-6">
        <div className="space-y-4">
          <Label>Loan Amount</Label>
          <RupeeInput value={amount} onChange={(e:any)=>setAmount(+e.target.value)} />

          <Label>Interest Rate (%)</Label>
          <Input value={rate} onChange={(e)=>setRate(+e.target.value)} />

          <Label>Tenure (Years)</Label>
          <Input value={years} onChange={(e)=>setYears(+e.target.value)} />
        </div>

        <div className="bg-primary/5 rounded-xl p-6 space-y-4">
          <p className="text-sm text-muted-foreground">Monthly EMI</p>
          <p className="text-3xl font-bold text-primary">₹ {emi.toFixed(0)}</p>

          <div className="flex justify-between text-sm">
            <span>Total Payment</span>
            <span>₹ {total.toFixed(0)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span>Total Interest</span>
            <span className="text-destructive">
              ₹ {interest.toFixed(0)}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

/* ---------- Investment Calculator ---------- */
function InvestmentCalculator() {
  const [initial, setInitial] = useState(10000);
  const [monthly, setMonthly] = useState(2000);
  const [rate, setRate] = useState(12);
  const [years, setYears] = useState(10);

  const months = years * 12;
  const r = rate / 100 / 12;

  let future =
    initial * Math.pow(1 + r, months) +
    monthly * ((Math.pow(1 + r, months) - 1) / r);

  const invested = initial + monthly * months;

  const chartData = [];
  for (let i = 0; i <= years; i++) {
    const m = i * 12;
    const val =
      initial * Math.pow(1 + r, m) +
      monthly * ((Math.pow(1 + r, m) - 1) / r);

    chartData.push({
      year: `Y${i}`,
      value: Math.round(val),
    });
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Investment Growth</CardTitle>
      </CardHeader>
      <CardContent className="grid lg:grid-cols-2 gap-6">
        <div className="space-y-4">
          <Label>Initial Investment</Label>
          <RupeeInput value={initial} onChange={(e:any)=>setInitial(+e.target.value)} />

          <Label>Monthly Contribution</Label>
          <RupeeInput value={monthly} onChange={(e:any)=>setMonthly(+e.target.value)} />

          <Label>Expected Return (%)</Label>
          <Input value={rate} onChange={(e)=>setRate(+e.target.value)} />

          <Label>Years</Label>
          <Input value={years} onChange={(e)=>setYears(+e.target.value)} />
        </div>

        <div className="space-y-4">
          <div className="bg-success/10 p-4 rounded-xl">
            <p className="text-sm">Future Value</p>
            <p className="text-3xl font-bold text-success">
              ₹ {future.toFixed(0)}
            </p>
            <p className="text-sm">
              Invested: ₹ {invested.toFixed(0)}
            </p>
          </div>

          <div className="h-[220px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="year" />
                <YAxis hide />
                <Tooltip />
                <Area
                  type="monotone"
                  dataKey="value"
                  stroke="#10b981"
                  fill="#10b981"
                  fillOpacity={0.2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

/* ---------- SIP Calculator ---------- */
function SIPCalculator() {
  const [sip, setSip] = useState(5000);
  const [rate, setRate] = useState(12);
  const [years, setYears] = useState(15);

  const n = years * 12;
  const r = rate / 100 / 12;

  const future =
    sip * ((Math.pow(1 + r, n) - 1) / r) * (1 + r);

  const invested = sip * n;
  const gains = future - invested;

  return (
    <Card>
      <CardHeader>
        <CardTitle>SIP Calculator</CardTitle>
      </CardHeader>
      <CardContent className="grid lg:grid-cols-2 gap-6">
        <div className="space-y-4">
          <Label>Monthly SIP</Label>
          <RupeeInput value={sip} onChange={(e:any)=>setSip(+e.target.value)} />

          <Label>Expected Return (%)</Label>
          <Input value={rate} onChange={(e)=>setRate(+e.target.value)} />

          <Label>Years</Label>
          <Input value={years} onChange={(e)=>setYears(+e.target.value)} />
        </div>

        <div className="bg-info/10 p-6 rounded-xl space-y-2">
          <p className="text-sm">Total Value</p>
          <p className="text-3xl font-bold text-info">
            ₹ {future.toFixed(0)}
          </p>
          <p>Invested: ₹ {invested}</p>
          <p className="text-success">
            Gains: ₹ {gains.toFixed(0)}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

/* ---------- Main Page ---------- */
export default function CalculatorsPage() {
  return (
    <DashboardLayout>
      <div className="p-6 space-y-6">
        <div className="flex items-center gap-2">
          <Calculator className="w-6 h-6 text-primary" />
          <h1 className="text-2xl font-bold">Financial Calculators</h1>
        </div>

        <Tabs defaultValue="loan">
          <TabsList className="grid grid-cols-3 w-full">
            <TabsTrigger value="loan">Loan</TabsTrigger>
            <TabsTrigger value="investment">Investment</TabsTrigger>
            <TabsTrigger value="sip">SIP</TabsTrigger>
          </TabsList>

          <TabsContent value="loan">
            <LoanCalculator />
          </TabsContent>

          <TabsContent value="investment">
            <InvestmentCalculator />
          </TabsContent>

          <TabsContent value="sip">
            <SIPCalculator />
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}