"use client"

import { Area, AreaChart, Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, XAxis, YAxis } from "recharts"
import { Banknote, Building, CreditCard, Landmark, ShieldCheck, Wallet } from "lucide-react"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Badge } from "@/components/ui/badge"
import type { BankAccount, Voucher, CheckRecord, EFTBatch } from "../data/mock-data"

interface DashboardViewProps {
  bankAccounts: BankAccount[]
  vouchers: Voucher[]
  checks: CheckRecord[]
  eftBatches: EFTBatch[]
}

const formatPHP = (val: number) => {
  return new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency: "PHP",
    maximumFractionDigits: 0,
  }).format(val)
}

export function DashboardView({ bankAccounts, vouchers, checks, eftBatches }: DashboardViewProps) {
  // 1. Calculate Dynamically:
  // Active/completed disbursements from initial logs + any paid vouchers
  const paidVouchersSum = vouchers.filter(v => v.status === "paid").reduce((sum, v) => sum + v.amount, 0)
  const clearedChecksSum = checks.filter(c => c.status === "cleared").reduce((sum, c) => sum + c.amount, 0)
  const issuedChecksSum = checks.filter(c => c.status === "issued").reduce((sum, c) => sum + c.amount, 0)
  const transmittedEftSum = eftBatches.filter(e => e.status === "transmitted").reduce((sum, e) => sum + e.totalAmount, 0)

  // 2. Prepare Subsystem Chart Data (dynamic + baseline)
  const baseSubsystemData: Record<string, number> = {
    "HRIS Payroll": 1120000,
    "Facilities": 560000,
    "Fleet & Transport": 280000,
    "Supply Chain": 420000,
    "Benefits & Compliance": 370000,
    "CRM": 95000,
    "Client Acquisition": 45000,
    "Governance & Admin": 85000,
  }

  // Add currently paid vouchers dynamically
  vouchers.forEach(v => {
    if (v.status === "paid") {
      baseSubsystemData[v.subsystem] = (baseSubsystemData[v.subsystem] || 0) + v.amount
    }
  })

  // Format for Recharts
  const subsystemChartData = Object.entries(baseSubsystemData)
    .map(([subsystem, amount]) => ({
      name: subsystem,
      amount,
      fill: `var(--subsystem-${subsystem.toLowerCase().replace(/[^a-z0-9]/g, "-")})`
    }))
    .sort((a, b) => b.amount - a.amount)

  const subsystemConfig = {
    amount: {
      label: "Disbursed PHP",
    },
  }

  // 3. Prepare Payment Method Chart Data (dynamic + baseline)
  // Check (cleared/issued checks), EFT (transmitted EFTs), Petty Cash, Wire
  let checkTotal = clearedChecksSum + issuedChecksSum
  let eftTotal = transmittedEftSum
  let pettyCashTotal = bankAccounts.find(b => b.id === "bank-3")?.balance === 50000 ? 12000 : 12000 + (50000 - (bankAccounts.find(b => b.id === "bank-3")?.balance || 50000))
  let wireTotal = 380000 // historical

  // Map voucher payment executions
  vouchers.forEach(v => {
    if (v.status === "paid") {
      // simulate split by type or lookup
      if (v.amount > 300000) {
        wireTotal += v.amount
      } else if (v.amount < 20000) {
        pettyCashTotal += v.amount
      } else if (v.id.includes("CHK")) {
        checkTotal += v.amount
      } else {
        eftTotal += v.amount
      }
    }
  })

  const methodChartData = [
    { name: "Electronic Fund Transfer (EFT)", value: eftTotal, fill: "var(--chart-1)" },
    { name: "Paper Check", value: checkTotal, fill: "var(--chart-2)" },
    { name: "Bank Wire Transfer", value: wireTotal, fill: "var(--chart-3)" },
    { name: "Petty Cash Payout", value: pettyCashTotal, fill: "var(--chart-4)" },
  ]

  const methodConfig = {
    value: { label: "Disbursed PHP" },
  }

  // 4. Trend Outflow over time (last 10 days - baseline + dynamic)
  const trendData = [
    { date: "06-29", amount: 150000 },
    { date: "06-30", amount: 800000 },
    { date: "07-01", amount: 240000 },
    { date: "07-02", amount: 120000 },
    { date: "07-03", amount: 350000 },
    { date: "07-04", amount: 185000 },
    { date: "07-05", amount: 95000 },
    { date: "07-06", amount: 420000 },
    { date: "07-07", amount: 120000 },
    { date: "07-08", amount: paidVouchersSum > 0 ? paidVouchersSum : 45000 },
  ]

  const trendConfig = {
    amount: {
      label: "Outflow PHP",
      color: "var(--primary)",
    },
  }

  return (
    <div className="space-y-6 px-4 lg:px-6">
      {/* Bank Account Balances */}
      <div className="grid gap-4 md:grid-cols-3">
        {bankAccounts.map((account) => {
          const isMetro = account.id === "bank-1"
          const isBdo = account.id === "bank-2"
          const Icon = isMetro ? Landmark : isBdo ? Building : Wallet
          
          return (
            <Card key={account.id} className="relative overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-md cursor-pointer border bg-card/60 backdrop-blur-sm">
              <div className={`absolute top-0 left-0 w-1.5 h-full ${isMetro ? "bg-blue-600" : isBdo ? "bg-emerald-600" : "bg-orange-500"}`} />
              <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                <div className="space-y-1">
                  <p className="text-sm font-medium text-muted-foreground">{account.name}</p>
                  <p className="text-xs font-mono text-muted-foreground/80">{account.accountNo}</p>
                </div>
                <div className="rounded-lg bg-secondary/80 p-2.5">
                  <Icon className={`size-5 ${isMetro ? "text-blue-500" : isBdo ? "text-emerald-500" : "text-orange-500"}`} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold tracking-tight">{formatPHP(account.balance)}</div>
                <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                  <ShieldCheck className="size-3.5 text-emerald-500 inline" /> Secure Liquidity Pool
                </p>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Charts Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Outflow Trend */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Cash Outflow Trend</CardTitle>
            <CardDescription>Daily disbursement volume (in PHP) across all bank accounts</CardDescription>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ChartContainer config={trendConfig} className="h-full w-full">
              <AreaChart data={trendData} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorOutflow" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="var(--primary)" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="date" stroke="currentColor" fontSize={11} strokeOpacity={0.5} />
                <YAxis
                  stroke="currentColor"
                  fontSize={11}
                  strokeOpacity={0.5}
                  tickFormatter={(val) => `₱${val >= 1000 ? `${(val / 1000).toFixed(0)}k` : val}`}
                />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Area type="monotone" dataKey="amount" stroke="var(--primary)" strokeWidth={2.5} fillOpacity={1} fill="url(#colorOutflow)" />
              </AreaChart>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Payment Method Distribution */}
        <Card className="flex flex-col">
          <CardHeader>
            <CardTitle>Payment Methods</CardTitle>
            <CardDescription>Disbursement distribution by execution type</CardDescription>
          </CardHeader>
          <CardContent className="flex-1 pb-0 flex items-center justify-center">
            <ChartContainer config={methodConfig} className="mx-auto aspect-square w-full max-w-[240px]">
              <PieChart>
                <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
                <Pie
                  data={methodChartData}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={50}
                  outerRadius={75}
                  paddingAngle={3}
                >
                  {methodChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Pie>
              </PieChart>
            </ChartContainer>
          </CardContent>
          <div className="flex flex-col gap-2 p-4 text-xs border-t">
            {methodChartData.map((item) => (
              <div key={item.name} className="flex items-center justify-between">
                <span className="flex items-center gap-1.5 text-muted-foreground truncate">
                  <span className="h-2.5 w-2.5 shrink-0 rounded-[2px]" style={{ backgroundColor: item.fill }} />
                  {item.name}
                </span>
                <span className="font-semibold tabular-nums ml-2">{formatPHP(item.value)}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Subsystem Cost Breakdown */}
      <div className="grid gap-6 md:grid-cols-3">
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Disbursements by Subsystem</CardTitle>
            <CardDescription>Allocation of cash outflows by ISMERS modules (Year-to-Date / Period)</CardDescription>
          </CardHeader>
          <CardContent className="h-[350px]">
            <ChartContainer config={subsystemConfig} className="h-full w-full">
              <BarChart data={subsystemChartData} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                <XAxis type="number" tickFormatter={(val) => `₱${val / 1000}k`} strokeOpacity={0.5} />
                <YAxis dataKey="name" type="category" width={140} strokeOpacity={0.5} style={{ fontSize: "11px" }} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="amount" radius={[0, 4, 4, 0]}>
                  {subsystemChartData.map((_, index) => {
                    // Generate colors dynamically based on index or palette
                    const colors = [
                      "hsl(var(--chart-1))",
                      "hsl(var(--chart-2))",
                      "hsl(var(--chart-3))",
                      "hsl(var(--chart-4))",
                      "hsl(var(--chart-5))",
                      "hsl(220, 70%, 50%)",
                      "hsl(160, 60%, 45%)",
                      "hsl(30, 80%, 55%)"
                    ]
                    return <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                  })}
                </Bar>
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Recent Activities */}
        <Card className="flex flex-col">
          <CardHeader>
            <CardTitle>Recent Treasury Log</CardTitle>
            <CardDescription>Latest completed disbursements in the system</CardDescription>
          </CardHeader>
          <CardContent className="flex-1">
            <div className="space-y-4">
              <div className="flex items-start gap-3 text-sm">
                <div className="rounded-full bg-emerald-500/10 p-1.5 text-emerald-500 mt-0.5">
                  <CreditCard className="size-4" />
                </div>
                <div className="flex-1 space-y-1">
                  <p className="font-medium text-foreground">EFT Direct Deposit Transmitted</p>
                  <p className="text-xs text-muted-foreground">BDO Operating • Batch EFT-BATCH-202606B</p>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant="outline" className="text-[10px] py-0 px-1 border-emerald-500/30 bg-emerald-500/5 text-emerald-600">
                      ₱480,000
                    </Badge>
                    <span className="text-[10px] text-muted-foreground">July 02, 2026</span>
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-3 text-sm">
                <div className="rounded-full bg-blue-500/10 p-1.5 text-blue-500 mt-0.5">
                  <Building className="size-4" />
                </div>
                <div className="flex-1 space-y-1">
                  <p className="font-medium text-foreground">Paper Check Cleared</p>
                  <p className="text-xs text-muted-foreground">Metrobank Checking • Check #00028481</p>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant="outline" className="text-[10px] py-0 px-1 border-blue-500/30 bg-blue-500/5 text-blue-600">
                      ₱67,500
                    </Badge>
                    <span className="text-[10px] text-muted-foreground">June 26, 2026</span>
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-3 text-sm">
                <div className="rounded-full bg-orange-500/10 p-1.5 text-orange-500 mt-0.5">
                  <Wallet className="size-4" />
                </div>
                <div className="flex-1 space-y-1">
                  <p className="font-medium text-foreground">Petty Cash Replenishment</p>
                  <p className="text-xs text-muted-foreground">Cash Custodian • Q2 Administrative Fund</p>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant="outline" className="text-[10px] py-0 px-1 border-orange-500/30 bg-orange-500/5 text-orange-600">
                      ₱12,000
                    </Badge>
                    <span className="text-[10px] text-muted-foreground">June 20, 2026</span>
                  </div>
                </div>
              </div>

              {paidVouchersSum > 0 && (
                <div className="flex items-start gap-3 text-sm border-t pt-3">
                  <div className="rounded-full bg-primary/10 p-1.5 text-primary mt-0.5">
                    <Banknote className="size-4" />
                  </div>
                  <div className="flex-1 space-y-1">
                    <p className="font-medium text-foreground">Executed Payment Run</p>
                    <p className="text-xs text-muted-foreground">Processed latest approved vouchers</p>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="outline" className="text-[10px] py-0 px-1 border-primary/30 bg-primary/5 text-primary">
                        {formatPHP(paidVouchersSum)}
                      </Badge>
                      <span className="text-[10px] text-muted-foreground">Just now</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
