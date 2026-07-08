"use client"

import * as React from "react"
import { Check, Info, Landmark, Link, RefreshCw, AlertCircle } from "lucide-react"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import type { ReconciliationItem, BankStatementItem } from "../data/mock-data"

interface BankReconciliationProps {
  reconciliationItems: ReconciliationItem[]
  bankStatementItems: BankStatementItem[]
  onMatch: (ledgerId: string, statementId: string) => void
  onAutoMatch: () => void
}

const formatPHP = (val: number) => {
  return new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency: "PHP",
    maximumFractionDigits: 0,
  }).format(val)
}

export function BankReconciliation({ reconciliationItems, bankStatementItems, onMatch, onAutoMatch }: BankReconciliationProps) {
  const [selectedLedgerId, setSelectedLedgerId] = React.useState<string | null>(null)
  const [selectedStatementId, setSelectedStatementId] = React.useState<string | null>(null)

  // Filter unmatched
  const unmatchedLedger = React.useMemo(() => {
    return reconciliationItems.filter(item => !item.matched)
  }, [reconciliationItems])

  const unmatchedStatement = React.useMemo(() => {
    // Only show outflows on statement (negative amounts) since we are reconciling disbursements
    return bankStatementItems.filter(item => !item.matched && item.amount < 0)
  }, [bankStatementItems])

  const selectedLedgerItem = React.useMemo(() => {
    return reconciliationItems.find(item => item.id === selectedLedgerId)
  }, [reconciliationItems, selectedLedgerId])

  const selectedStatementItem = React.useMemo(() => {
    return bankStatementItems.find(item => item.id === selectedStatementId)
  }, [bankStatementItems, selectedStatementId])

  // Calculation of stats
  const stats = React.useMemo(() => {
    const totalCount = reconciliationItems.length
    const matchedCount = reconciliationItems.filter(i => i.matched).length
    const percent = totalCount > 0 ? Math.round((matchedCount / totalCount) * 100) : 100
    
    const unmatchedLedgerSum = unmatchedLedger.reduce((sum, item) => sum + Math.abs(item.amount), 0)
    const unmatchedStatementSum = unmatchedStatement.reduce((sum, item) => sum + Math.abs(item.amount), 0)

    return {
      totalCount,
      matchedCount,
      percent,
      unmatchedLedgerSum,
      unmatchedStatementSum
    }
  }, [reconciliationItems, unmatchedLedger, unmatchedStatement])

  const canMatch = React.useMemo(() => {
    if (!selectedLedgerItem || !selectedStatementItem) return false
    // Match if amounts are equal in absolute terms (statement is negative, ledger is negative)
    return Math.abs(selectedLedgerItem.amount) === Math.abs(selectedStatementItem.amount)
  }, [selectedLedgerItem, selectedStatementItem])

  const handleMatchSelected = () => {
    if (selectedLedgerId && selectedStatementId && canMatch) {
      onMatch(selectedLedgerId, selectedStatementId)
      setSelectedLedgerId(null)
      setSelectedStatementId(null)
    }
  }

  return (
    <div className="space-y-6 px-4 lg:px-6">
      {/* Reconciliation Scoreboard */}
      <div className="grid gap-6 md:grid-cols-3">
        {/* Progress Ring Card */}
        <Card className="bg-card/50 backdrop-blur-sm flex flex-col justify-between">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold text-muted-foreground">Reconciliation Progress</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center justify-center py-4 flex-1">
            <div className="relative flex items-center justify-center mb-2">
              {/* Circular SVG Progress */}
              <svg className="w-28 h-28 transform -rotate-90">
                <circle
                  cx="56"
                  cy="56"
                  r="48"
                  className="stroke-muted-foreground/10"
                  strokeWidth="8"
                  fill="transparent"
                />
                <circle
                  cx="56"
                  cy="56"
                  r="48"
                  className="stroke-primary transition-all duration-500"
                  strokeWidth="8"
                  fill="transparent"
                  strokeDasharray={2 * Math.PI * 48}
                  strokeDashoffset={2 * Math.PI * 48 * (1 - stats.percent / 100)}
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute flex flex-col items-center text-center">
                <span className="text-2xl font-bold tracking-tight">{stats.percent}%</span>
                <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Matched</span>
              </div>
            </div>
            <p className="text-xs text-muted-foreground text-center mt-2">
              {stats.matchedCount} of {stats.totalCount} ledger entries cleared
            </p>
          </CardContent>
        </Card>

        {/* Unmatched Totals */}
        <Card className="bg-card/50 backdrop-blur-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold text-muted-foreground">Unreconciled Variances</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 pt-2">
            <div className="flex justify-between items-center">
              <div>
                <span className="text-xs text-muted-foreground block font-medium">Unresolved Ledger Balance</span>
                <span className="text-lg font-bold font-mono tracking-tight text-rose-500">
                  {formatPHP(stats.unmatchedLedgerSum)}
                </span>
              </div>
              <Badge variant="outline" className="border-rose-500/20 bg-rose-500/5 text-rose-500 text-[10px]">
                {unmatchedLedger.length} Items
              </Badge>
            </div>

            <div className="flex justify-between items-center border-t pt-3">
              <div>
                <span className="text-xs text-muted-foreground block font-medium">Uncleared Statement Balance</span>
                <span className="text-lg font-bold font-mono tracking-tight text-amber-500">
                  {formatPHP(stats.unmatchedStatementSum)}
                </span>
              </div>
              <Badge variant="outline" className="border-amber-500/20 bg-amber-500/5 text-amber-500 text-[10px]">
                {unmatchedStatement.length} Items
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Engine and actions */}
        <Card className="bg-card/50 backdrop-blur-sm flex flex-col justify-between">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold text-muted-foreground">Treasury Auto-Match Engine</CardTitle>
            <CardDescription className="text-xs">
              Automated reconciliation of ledger records against bank charges by amount and date
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-2 flex-1 flex flex-col justify-end gap-3">
            <div className="flex items-center gap-2 rounded-lg border py-2.5 px-3 bg-blue-500/10 text-blue-500 border-blue-500/30">
              <Info className="size-4 text-blue-500 shrink-0" />
              <span className="text-[10px] leading-tight">
                Ensure bank feeds are updated before running the automatic matching system.
              </span>
            </div>
            <Button
              onClick={onAutoMatch}
              disabled={unmatchedLedger.length === 0}
              className="w-full cursor-pointer h-10 flex items-center justify-center gap-2"
            >
              <RefreshCw className="size-4" /> Trigger Auto-Match Engine
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Manual Matching Workspace */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Left: Treasury Ledger Ledger */}
        <Card className="border bg-card/40">
          <CardHeader className="pb-3 border-b">
            <CardTitle className="text-base flex items-center justify-between">
              <span>Treasury Outflow Ledger</span>
              <Badge variant="secondary" className="text-[10px] py-0 px-2 font-normal">
                Ledger Entries
              </Badge>
            </CardTitle>
            <CardDescription>Unmatched disbursements recorded in ISMERS General Ledger</CardDescription>
          </CardHeader>
          <CardContent className="pt-4">
            {unmatchedLedger.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground">
                <Check className="size-8 text-emerald-500 mb-2" />
                <p className="font-semibold text-xs text-foreground">Ledger is Fully Reconciled</p>
                <p className="text-[11px] mt-0.5">All outbound payments have been matched with bank transactions.</p>
              </div>
            ) : (
              <div className="space-y-2 max-h-[350px] overflow-y-auto pr-1">
                {unmatchedLedger.map(item => {
                  const isSelected = selectedLedgerId === item.id
                  return (
                    <div
                      key={item.id}
                      onClick={() => setSelectedLedgerId(isSelected ? null : item.id)}
                      className={`p-3 border rounded-lg transition-all duration-150 cursor-pointer ${
                        isSelected
                          ? "border-blue-500 bg-blue-500/5 shadow-xs"
                          : "border-border hover:border-muted-foreground/30 bg-card/40"
                      }`}
                    >
                      <div className="flex justify-between items-start gap-2">
                        <div>
                          <div className="font-semibold text-xs text-foreground">{item.description}</div>
                          <div className="text-[10px] font-mono text-muted-foreground mt-0.5">
                            ID: {item.reference} • {item.date}
                          </div>
                        </div>
                        <span className="font-bold text-xs tabular-nums text-rose-500">
                          {formatPHP(Math.abs(item.amount))}
                        </span>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Right: Bank Statement Statement */}
        <Card className="border bg-card/40">
          <CardHeader className="pb-3 border-b">
            <CardTitle className="text-base flex items-center justify-between">
              <span>Bank Statement Feed</span>
              <Badge variant="secondary" className="text-[10px] py-0 px-2 font-normal">
                Live Bank Feed
              </Badge>
            </CardTitle>
            <CardDescription>Uncleared charges reported on bank statement files</CardDescription>
          </CardHeader>
          <CardContent className="pt-4">
            {unmatchedStatement.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground">
                <Check className="size-8 text-emerald-500 mb-2" />
                <p className="font-semibold text-xs text-foreground">Bank Statement Cleared</p>
                <p className="text-[11px] mt-0.5">No uncleared outbound bank transactions currently require resolution.</p>
              </div>
            ) : (
              <div className="space-y-2 max-h-[350px] overflow-y-auto pr-1">
                {unmatchedStatement.map(item => {
                  const isSelected = selectedStatementId === item.id
                  return (
                    <div
                      key={item.id}
                      onClick={() => setSelectedStatementId(isSelected ? null : item.id)}
                      className={`p-3 border rounded-lg transition-all duration-150 cursor-pointer ${
                        isSelected
                          ? "border-amber-500 bg-amber-500/5 shadow-xs"
                          : "border-border hover:border-muted-foreground/30 bg-card/40"
                      }`}
                    >
                      <div className="flex justify-between items-start gap-2">
                        <div>
                          <div className="font-semibold text-xs text-foreground">{item.description}</div>
                          <div className="text-[10px] font-mono text-muted-foreground mt-0.5">
                            Bank Val: {item.date}
                          </div>
                        </div>
                        <span className="font-bold text-xs tabular-nums text-rose-500">
                          {formatPHP(Math.abs(item.amount))}
                        </span>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Matching confirmation workspace */}
      {(selectedLedgerItem || selectedStatementItem) && (
        <Card className="border bg-muted/20">
          <CardContent className="py-4">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex flex-wrap items-center gap-4 text-xs">
                {selectedLedgerItem ? (
                  <div className="rounded-lg border bg-background/80 p-2.5 flex items-center gap-2">
                    <Landmark className="size-3.5 text-blue-500" />
                    <div>
                      <span className="text-[10px] text-muted-foreground block leading-tight">Ledger Entry</span>
                      <span className="font-medium text-foreground">{selectedLedgerItem.reference}</span>
                      <span className="font-mono ml-2 font-bold text-rose-500">{formatPHP(Math.abs(selectedLedgerItem.amount))}</span>
                    </div>
                  </div>
                ) : (
                  <span className="text-muted-foreground italic">Select a ledger disbursement entry</span>
                )}

                <Link className="size-4 text-muted-foreground shrink-0 hidden md:block" />

                {selectedStatementItem ? (
                  <div className="rounded-lg border bg-background/80 p-2.5 flex items-center gap-2">
                    <Landmark className="size-3.5 text-amber-500" />
                    <div>
                      <span className="text-[10px] text-muted-foreground block leading-tight">Statement Charge</span>
                      <span className="font-medium text-foreground truncate max-w-[120px] inline-block">{selectedStatementItem.description}</span>
                      <span className="font-mono ml-2 font-bold text-rose-500">{formatPHP(Math.abs(selectedStatementItem.amount))}</span>
                    </div>
                  </div>
                ) : (
                  <span className="text-muted-foreground italic">Select a matching bank statement transaction</span>
                )}
              </div>

              {selectedLedgerItem && selectedStatementItem && (
                <div>
                  {canMatch ? (
                    <Button onClick={handleMatchSelected} className="cursor-pointer font-medium h-9 text-xs">
                      <Check className="size-3.5 mr-1" /> Reconcile Selected
                    </Button>
                  ) : (
                    <div className="flex items-center gap-1.5 rounded-lg border py-1.5 px-3 bg-rose-500/10 text-rose-600 border-rose-500/30">
                      <AlertCircle className="size-4 text-rose-600 shrink-0" />
                      <span className="text-[10px] font-semibold">Amount Mismatch</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
