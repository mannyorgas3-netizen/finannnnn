"use client"

import * as React from "react"
import { AlertCircle, ArrowRight, Check, CheckSquare, Coins, CreditCard, Landmark, ListFilter, Square } from "lucide-react"

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { BankAccount, Voucher } from "../data/mock-data"

interface PaymentExecutionProps {
  bankAccounts: BankAccount[]
  vouchers: Voucher[]
  onExecuteDisbursement: (voucherIds: string[], bankAccountId: string, paymentMethod: 'Check' | 'EFT' | 'Wire' | 'Cash') => void
}

const formatPHP = (val: number) => {
  return new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency: "PHP",
    maximumFractionDigits: 0,
  }).format(val)
}

export function PaymentExecution({ bankAccounts, vouchers, onExecuteDisbursement }: PaymentExecutionProps) {
  const [selectedVouchers, setSelectedVouchers] = React.useState<string[]>([])
  const [selectedBankId, setSelectedBankId] = React.useState<string>("bank-1")
  const [paymentMethod, setPaymentMethod] = React.useState<'Check' | 'EFT' | 'Wire' | 'Cash'>("EFT")
  const [filterSubsystem, setFilterSubsystem] = React.useState<string>("all")

  // Filter pending vouchers
  const pendingVouchers = React.useMemo(() => {
    return vouchers.filter(v => {
      const isPending = v.status === "pending"
      const matchesSubsystem = filterSubsystem === "all" || v.subsystem === filterSubsystem
      return isPending && matchesSubsystem
    })
  }, [vouchers, filterSubsystem])

  const selectedBank = React.useMemo(() => {
    return bankAccounts.find(b => b.id === selectedBankId)
  }, [bankAccounts, selectedBankId])

  const totalAmountSelected = React.useMemo(() => {
    return vouchers
      .filter(v => selectedVouchers.includes(v.id))
      .reduce((sum, v) => sum + v.amount, 0)
  }, [vouchers, selectedVouchers])

  const remainingBalance = React.useMemo(() => {
    if (!selectedBank) return 0
    return selectedBank.balance - totalAmountSelected
  }, [selectedBank, totalAmountSelected])

  const hasInsufficientFunds = remainingBalance < 0

  const toggleSelect = (id: string) => {
    setSelectedVouchers(prev => 
      prev.includes(id) ? prev.filter(vId => vId !== id) : [...prev, id]
    )
  }

  const toggleSelectAll = () => {
    if (selectedVouchers.length === pendingVouchers.length) {
      setSelectedVouchers([])
    } else {
      setSelectedVouchers(pendingVouchers.map(v => v.id))
    }
  }

  const handleExecute = () => {
    if (selectedVouchers.length === 0) return
    if (hasInsufficientFunds) return

    onExecuteDisbursement(selectedVouchers, selectedBankId, paymentMethod)
    setSelectedVouchers([]) // Clear selection
  }

  // Get subsystems present in pending vouchers for filter options
  const subsystems = React.useMemo(() => {
    const list = new Set(vouchers.filter(v => v.status === "pending").map(v => v.subsystem))
    return Array.from(list)
  }, [vouchers])

  return (
    <div className="space-y-6 px-4 lg:px-6">
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left Side: Pending Voucher Queue */}
        <div className="lg:col-span-2 space-y-4">
          <Card className="bg-card/50 backdrop-blur-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <div>
                <CardTitle>Disbursement Queue</CardTitle>
                <CardDescription>Select vouchers pulled from other modules for payment execution</CardDescription>
              </div>
              <div className="flex items-center space-x-2">
                <ListFilter className="size-4 text-muted-foreground" />
                <Select value={filterSubsystem} onValueChange={setFilterSubsystem}>
                  <SelectTrigger className="w-[180px] h-8 text-xs cursor-pointer">
                    <SelectValue placeholder="Filter Subsystem" />
                  </SelectTrigger>
                  <SelectContent className="text-xs">
                    <SelectItem value="all" className="cursor-pointer">All Subsystems</SelectItem>
                    {subsystems.map(sub => (
                      <SelectItem key={sub} value={sub} className="cursor-pointer">{sub}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
            <CardContent>
              {pendingVouchers.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center border border-dashed rounded-lg">
                  <Coins className="size-10 text-muted-foreground/50 mb-3" />
                  <p className="font-semibold text-muted-foreground">Disbursement Queue is Empty</p>
                  <p className="text-xs text-muted-foreground/80 mt-1">No pending payments are currently scheduled for this filter.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="flex items-center justify-between px-3 py-1 text-xs text-muted-foreground border-b pb-2">
                    <button 
                      onClick={toggleSelectAll} 
                      className="flex items-center gap-2 font-medium hover:text-foreground cursor-pointer transition-colors"
                    >
                      {selectedVouchers.length === pendingVouchers.length && pendingVouchers.length > 0 ? (
                        <CheckSquare className="size-4 text-primary" />
                      ) : (
                        <Square className="size-4" />
                      )}
                      Select All ({pendingVouchers.length})
                    </button>
                    <span className="font-medium">Total Pending: {pendingVouchers.length}</span>
                  </div>

                  <div className="space-y-2 max-h-[450px] overflow-y-auto pr-1">
                    {pendingVouchers.map((voucher) => {
                      const isSelected = selectedVouchers.includes(voucher.id)
                      const urgencyColor = 
                        voucher.urgency === "high" ? "bg-red-500/10 text-red-500 hover:bg-red-500/20 border-red-500/30" : 
                        voucher.urgency === "medium" ? "bg-orange-500/10 text-orange-500 hover:bg-orange-500/20 border-orange-500/30" : 
                        "bg-slate-500/10 text-slate-500 hover:bg-slate-500/20 border-slate-500/30"

                      return (
                        <div
                          key={voucher.id}
                          onClick={() => toggleSelect(voucher.id)}
                          className={`flex items-start gap-3 p-3.5 border rounded-lg transition-all duration-200 cursor-pointer ${
                            isSelected 
                              ? "border-primary bg-primary/5 shadow-sm" 
                              : "border-border hover:border-muted-foreground/30 bg-card/40"
                          }`}
                        >
                          <div className="mt-1">
                            {isSelected ? (
                              <CheckSquare className="size-4.5 text-primary" />
                            ) : (
                              <Square className="size-4.5 text-muted-foreground" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0 grid md:grid-cols-4 gap-2 items-center">
                            <div className="md:col-span-2 space-y-1">
                              <div className="flex items-center gap-2">
                                <span className="font-semibold text-sm truncate">{voucher.payee}</span>
                                <Badge className="text-[10px] py-0 px-1 border-primary/20 bg-secondary/80 text-foreground" variant="outline">
                                  {voucher.subsystem}
                                </Badge>
                              </div>
                              <p className="text-xs text-muted-foreground truncate">{voucher.description}</p>
                              <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                                <span className="font-mono">{voucher.id}</span>
                                <span>•</span>
                                <span>Ref: {voucher.referenceNo}</span>
                              </div>
                            </div>
                            
                            <div className="text-left md:text-right">
                              <span className="text-xs text-muted-foreground block">Due Date</span>
                              <span className="text-xs font-medium">{voucher.date}</span>
                            </div>

                            <div className="flex items-center justify-between md:justify-end gap-3">
                              <Badge className={`text-[10px] uppercase font-bold tracking-wider py-0.5 border ${urgencyColor}`}>
                                {voucher.urgency}
                              </Badge>
                              <span className="font-bold text-sm text-right min-w-[90px]">
                                {formatPHP(voucher.amount)}
                              </span>
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Side: Payment Run Configuration */}
        <div>
          <Card className="sticky top-6 border bg-card/70 shadow-lg backdrop-blur-md">
            <CardHeader className="border-b bg-muted/20">
              <CardTitle className="text-lg flex items-center gap-2">
                <CreditCard className="size-5 text-primary" /> Payment Processor
              </CardTitle>
              <CardDescription>Configure treasury outputs and execute selected payment runs</CardDescription>
            </CardHeader>
            <CardContent className="pt-5 space-y-4">
              {/* Vouchers Selected details */}
              <div className="rounded-lg border bg-muted/40 p-3 space-y-1.5 text-sm">
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Selected Vouchers</span>
                  <span>{selectedVouchers.length} items</span>
                </div>
                <div className="flex justify-between items-baseline">
                  <span className="font-medium text-foreground">Disbursement Outflow</span>
                  <span className="text-xl font-bold tracking-tight text-primary">
                    {formatPHP(totalAmountSelected)}
                  </span>
                </div>
              </div>

              {/* Source Bank Selector */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground">Debit Bank Account</label>
                <Select value={selectedBankId} onValueChange={setSelectedBankId}>
                  <SelectTrigger className="w-full cursor-pointer h-10">
                    <SelectValue placeholder="Select Account" />
                  </SelectTrigger>
                  <SelectContent>
                    {bankAccounts.map(account => (
                      <SelectItem key={account.id} value={account.id} className="cursor-pointer">
                        <div className="flex justify-between items-center gap-3 w-full">
                          <span>{account.name}</span>
                          <span className="font-mono text-xs text-muted-foreground">({formatPHP(account.balance)})</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Payment Method Selector */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground">Disbursement Method</label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { id: "EFT", label: "EFT / Direct", icon: Landmark },
                    { id: "Check", label: "Paper Check", icon: CreditCard },
                    { id: "Wire", label: "Bank Wire", icon: Landmark },
                    { id: "Cash", label: "Petty Cash", icon: Coins }
                  ].map(method => {
                    const Icon = method.icon
                    const isSelected = paymentMethod === method.id
                    return (
                      <button
                        key={method.id}
                        type="button"
                        onClick={() => setPaymentMethod(method.id as any)}
                        className={`flex flex-col items-center gap-1.5 p-3 rounded-lg border text-left cursor-pointer transition-all duration-200 ${
                          isSelected 
                            ? "border-primary bg-primary/5 text-primary shadow-xs" 
                            : "border-border hover:border-muted-foreground/30 hover:bg-muted/10 text-muted-foreground"
                        }`}
                      >
                        <Icon className="size-4" />
                        <span className="text-[11px] font-medium">{method.label}</span>
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Fund balance simulation */}
              {selectedBank && (
                <div className="border-t pt-4 space-y-2.5 text-xs">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Current Pool Balance</span>
                    <span className="font-mono font-medium">{formatPHP(selectedBank.balance)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Treasury Outflow</span>
                    <span className="font-mono text-rose-500 font-medium">-{formatPHP(totalAmountSelected)}</span>
                  </div>
                  <div className="flex justify-between border-t pt-2">
                    <span className="font-semibold text-muted-foreground">Projected Pool Balance</span>
                    <span className={`font-mono font-bold ${hasInsufficientFunds ? "text-rose-600" : "text-emerald-600"}`}>
                      {formatPHP(remainingBalance)}
                    </span>
                  </div>
                </div>
              )}

              {/* Warnings */}
              {hasInsufficientFunds && (
                <div className="flex items-start gap-2.5 rounded-lg border p-3 bg-rose-500/10 text-rose-600 border-rose-500/30">
                  <AlertCircle className="size-4 text-rose-600 shrink-0 mt-0.5" />
                  <div className="space-y-0.5">
                    <h5 className="text-xs font-semibold">Overdraft Warning</h5>
                    <p className="text-[10px] leading-tight">
                      The selected debit amount exceeds the cash balance of the designated bank account.
                    </p>
                  </div>
                </div>
              )}

              {selectedVouchers.length > 0 && !hasInsufficientFunds && (
                <div className="flex items-start gap-2.5 rounded-lg border p-3 bg-emerald-500/10 text-emerald-600 border-emerald-500/30">
                  <Check className="size-4 text-emerald-600 shrink-0 mt-0.5" />
                  <div className="space-y-0.5">
                    <h5 className="text-xs font-semibold">Payment Ready</h5>
                    <p className="text-[10px] leading-tight">
                      Transactions will be recorded in General Ledger and corresponding bank statements matched.
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
            <CardFooter className="border-t pt-4 bg-muted/10">
              <Button
                onClick={handleExecute}
                disabled={selectedVouchers.length === 0 || hasInsufficientFunds}
                className="w-full cursor-pointer h-10 font-medium"
              >
                Execute Payment Run <ArrowRight className="size-4 ml-1" />
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  )
}
