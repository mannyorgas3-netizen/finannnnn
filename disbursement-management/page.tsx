"use client"

import * as React from "react"
import { toast } from "sonner"
import { Activity, ClipboardList, CheckCircle, FileText, CreditCard, Calendar, Wallet } from "lucide-react"

import { BaseLayout } from "@/components/layouts/base-layout"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent } from "@/components/ui/card"
import { Toaster } from "@/components/ui/sonner"

import { DashboardView } from "./components/dashboard-view"
import { PaymentExecution } from "./components/payment-execution"
import { RequestApproval } from "./components/request-approval"
import { CheckEftRegister } from "./components/check-eft-register"
import { BankReconciliation } from "./components/bank-reconciliation"

import {
  initialBankAccounts,
  initialVouchers,
  initialRequests,
  initialChecks,
  initialEFTBatches,
  initialReconciliationItems,
  initialBankStatementItems,
  type BankAccount,
  type Voucher,
  type DisbursementRequest,
  type CheckRecord,
  type EFTBatch,
  type ReconciliationItem,
  type BankStatementItem,
} from "./data/mock-data"

const formatPHP = (val: number) => {
  return new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency: "PHP",
    maximumFractionDigits: 0,
  }).format(val)
}

export default function DisbursementManagementPage() {
  const [bankAccounts, setBankAccounts] = React.useState<BankAccount[]>(initialBankAccounts)
  const [vouchers, setVouchers] = React.useState<Voucher[]>(initialVouchers)
  const [requests, setRequests] = React.useState<DisbursementRequest[]>(initialRequests)
  const [checks, setChecks] = React.useState<CheckRecord[]>(initialChecks)
  const [eftBatches, setEftBatches] = React.useState<EFTBatch[]>(initialEFTBatches)
  const [reconciliationItems, setReconciliationItems] = React.useState<ReconciliationItem[]>(initialReconciliationItems)
  const [bankStatementItems, setBankStatementItems] = React.useState<BankStatementItem[]>(initialBankStatementItems)

  const todayStr = React.useMemo(() => {
    return new Date().toISOString().split("T")[0]
  }, [])

  // Top Metrics calculations
  const topMetrics = React.useMemo(() => {
    const paidVouchersSum = vouchers.filter(v => v.status === "paid").reduce((sum, v) => sum + v.amount, 0)
    const checksSum = checks.filter(c => c.status !== "voided").reduce((sum, c) => sum + c.amount, 0)
    const eftSum = eftBatches.filter(e => e.status === "transmitted").reduce((sum, e) => sum + e.totalAmount, 0)
    const totalDisbursed = paidVouchersSum + checksSum + eftSum

    const pendingRequestsCount = requests.filter(r => r.status === "pending").length
    const pendingVouchersCount = vouchers.filter(v => v.status === "pending").length
    const totalCash = bankAccounts.reduce((sum, b) => sum + b.balance, 0)

    return {
      totalDisbursed,
      pendingRequestsCount,
      pendingVouchersCount,
      totalCash
    }
  }, [bankAccounts, vouchers, requests, checks, eftBatches])

  // --- Dynamic Operations ---

  // 1. Payment Run Execution
  const handleExecuteDisbursement = (voucherIds: string[], bankAccountId: string, paymentMethod: 'Check' | 'EFT' | 'Wire' | 'Cash') => {
    // Retrieve target bank account
    const bankIndex = bankAccounts.findIndex(b => b.id === bankAccountId)
    if (bankIndex === -1) return

    const targetBank = bankAccounts[bankIndex]
    
    // Sum selected vouchers
    const selectedVouchersList = vouchers.filter(v => voucherIds.includes(v.id))
    const totalDisbursing = selectedVouchersList.reduce((sum, v) => sum + v.amount, 0)

    if (targetBank.balance < totalDisbursing) {
      toast.error("Execution failed: Insufficient funds in target bank account.")
      return
    }

    // Deduct balance
    const updatedBanks = [...bankAccounts]
    updatedBanks[bankIndex] = {
      ...targetBank,
      balance: targetBank.balance - totalDisbursing
    }
    setBankAccounts(updatedBanks)

    // Update vouchers status to 'paid'
    const updatedVouchers = vouchers.map(v => {
      if (voucherIds.includes(v.id)) {
        return { ...v, status: "paid" as const }
      }
      return v
    })
    setVouchers(updatedVouchers)

    // Record logs depending on method
    if (paymentMethod === "Check") {
      const newChecks: CheckRecord[] = []
      const newRecs: ReconciliationItem[] = []
      const newStatements: BankStatementItem[] = []

      selectedVouchersList.forEach((vch, index) => {
        const checkNum = (28484 + checks.length + index).toString().padStart(8, "0")
        const chkId = `CHK-NEW-${Math.floor(Math.random() * 9000 + 1000)}`
        
        newChecks.push({
          id: chkId,
          checkNo: checkNum,
          voucherId: vch.id,
          payee: vch.payee,
          amount: vch.amount,
          date: todayStr,
          bankName: targetBank.name,
          status: "issued" as const
        })

        // Ledger Reconciliation
        newRecs.push({
          id: `REC-CHK-${chkId}`,
          date: todayStr,
          reference: `CHK-${checkNum}`,
          type: "Check",
          description: `Check ${checkNum} - ${vch.payee}`,
          amount: -vch.amount,
          matched: false
        })

        // Bank Statement Charge Feed (Simulated Outward Transaction)
        newStatements.push({
          id: `BST-CHK-${chkId}`,
          date: todayStr,
          description: `${targetBank.name.substring(0, 10).toUpperCase()} OUTWARD CHECK ${checkNum}`,
          amount: -vch.amount,
          matched: false
        })
      })

      setChecks(prev => [...newChecks, ...prev])
      setReconciliationItems(prev => [...newRecs, ...prev])
      setBankStatementItems(prev => [...newStatements, ...prev])
      
      toast.success(`Check payment run executed! ${newChecks.length} checks issued for printing.`)
    } 
    else if (paymentMethod === "EFT") {
      const batchRef = `EFT-BATCH-${new Date().getFullYear()}${String(new Date().getMonth() + 1).padStart(2, "0")}${String(new Date().getDate()).padStart(2, "0")}-${Math.floor(Math.random() * 900 + 100)}`
      const eftId = `EFT-${Math.floor(Math.random() * 9000 + 1000)}`

      const newBatch: EFTBatch = {
        id: eftId,
        batchRef,
        voucherCount: selectedVouchersList.length,
        totalAmount: totalDisbursing,
        bankName: targetBank.name,
        date: todayStr,
        status: "transmitted" as const
      }

      const newRec: ReconciliationItem = {
        id: `REC-EFT-${eftId}`,
        date: todayStr,
        reference: batchRef,
        type: "EFT",
        description: `Direct Deposit Batch ${batchRef}`,
        amount: -totalDisbursing,
        matched: false
      }

      const newStatement: BankStatementItem = {
        id: `BST-EFT-${eftId}`,
        date: todayStr,
        description: `${targetBank.name.substring(0, 10).toUpperCase()} ACH OUTWARD ${batchRef}`,
        amount: -totalDisbursing,
        matched: false
      }

      setEftBatches(prev => [newBatch, ...prev])
      setReconciliationItems(prev => [newRec, ...prev])
      setBankStatementItems(prev => [newStatement, ...prev])
      
      toast.success(`Direct deposit batch ${batchRef} transmitted to bank.`)
    } 
    else { // Wire or Cash
      const refCode = `TXN-${Math.floor(Math.random() * 900000 + 100000)}`
      const itemId = `TR-${Math.floor(Math.random() * 9000 + 1000)}`

      const newRec: ReconciliationItem = {
        id: `REC-${itemId}`,
        date: todayStr,
        reference: refCode,
        type: paymentMethod,
        description: `${paymentMethod} Payout - Consolidated Settlement`,
        amount: -totalDisbursing,
        matched: false
      }

      const newStatement: BankStatementItem = {
        id: `BST-${itemId}`,
        date: todayStr,
        description: `OUTWARD ${paymentMethod.toUpperCase()} REFC-${refCode}`,
        amount: -totalDisbursing,
        matched: false
      }

      setReconciliationItems(prev => [newRec, ...prev])
      setBankStatementItems(prev => [newStatement, ...prev])

      toast.success(`Disbursement completed via ${paymentMethod}. Code: ${refCode}`)
    }
  }

  // 2. Custom Disbursement Requests Approvals
  const handleApproveRequest = (requestId: string) => {
    const requestIndex = requests.findIndex(r => r.id === requestId)
    if (requestIndex === -1) return

    const req = requests[requestIndex]
    
    // Set request as approved
    const updatedRequests = [...requests]
    updatedRequests[requestIndex] = { ...req, status: "approved" as const }
    setRequests(updatedRequests)

    // Spawn a new voucher in the system for this request
    const newVchId = `VCH-${new Date().getFullYear()}-${Math.floor(Math.random() * 9000 + 1000)}`
    const newVoucher: Voucher = {
      id: newVchId,
      payee: req.payee,
      amount: req.amount,
      date: todayStr,
      subsystem: req.subsystem,
      description: `Approved request: ${req.title} (${req.description})`,
      referenceNo: `REQ-REF-${req.id}`,
      status: "pending" as const,
      urgency: "medium" as const
    }

    setVouchers(prev => [newVoucher, ...prev])
    toast.success(`Request ${requestId} Approved. Created voucher in Disbursement queue.`)
  }

  // 3. Custom Disbursement Requests Rejections
  const handleRejectRequest = (requestId: string) => {
    setRequests(prev => prev.map(r => r.id === requestId ? { ...r, status: "rejected" as const } : r))
    toast.error(`Disbursement request ${requestId} rejected.`)
  }

  // 4. File New Request
  const handleCreateRequest = (newReq: Omit<DisbursementRequest, "id" | "date" | "status">) => {
    const nextId = `REQ-${Math.floor(Math.random() * 900 + 100)}`
    const req: DisbursementRequest = {
      ...newReq,
      id: nextId,
      date: todayStr,
      status: "pending" as const
    }
    setRequests(prev => [req, ...prev])
    toast.success(`Disbursement request ${nextId} filed. Pending administrative review.`)
  }

  // 5. Void check (restores balances, voids records)
  const handleVoidCheck = (checkId: string) => {
    const checkIndex = checks.findIndex(c => c.id === checkId)
    if (checkIndex === -1) return

    const check = checks[checkIndex]

    // Restore funds to target bank account
    const targetBankIndex = bankAccounts.findIndex(b => check.bankName.includes(b.name) || b.name.includes(check.bankName))
    if (targetBankIndex !== -1) {
      const targetBank = bankAccounts[targetBankIndex]
      const updatedBanks = [...bankAccounts]
      updatedBanks[targetBankIndex] = {
        ...targetBank,
        balance: targetBank.balance + check.amount
      }
      setBankAccounts(updatedBanks)
    }

    // Set check as voided
    setChecks(prev => prev.map(c => c.id === checkId ? { ...c, status: "voided" as const } : c))

    // Set ledger reconciliation item as matched/removed
    setReconciliationItems(prev => prev.map(item => 
      item.reference === `CHK-${check.checkNo}` ? { ...item, matched: true, description: `[VOIDED] ${item.description}` } : item
    ))

    // Remove simulated bank statement charge so reconciliation matches
    setBankStatementItems(prev => prev.map(item => 
      item.description.includes(`CHECK ${check.checkNo}`) ? { ...item, matched: true, description: `[VOIDED CHK] ${item.description}`, amount: 0 } : item
    ))

    // If check had a linked voucher, restore the voucher back to pending
    if (check.voucherId) {
      setVouchers(prev => prev.map(v => v.id === check.voucherId ? { ...v, status: "pending" as const } : v))
    }

    toast.warning(`Check ${check.checkNo} voided. Funds (${formatPHP(check.amount)}) restored to bank account.`)
  }

  // 6. Manual Bank Statement Match
  const handleMatch = (ledgerId: string, statementId: string) => {
    // Match in state
    setReconciliationItems(prev => prev.map(item => item.id === ledgerId ? { ...item, matched: true, matchedId: statementId } : item))
    setBankStatementItems(prev => prev.map(item => item.id === statementId ? { ...item, matched: true } : item))

    // If ledger item was a check, update check status to 'cleared'
    const matchedLedger = reconciliationItems.find(i => i.id === ledgerId)
    if (matchedLedger && matchedLedger.type === "Check") {
      const checkNoVal = matchedLedger.reference.replace("CHK-", "")
      setChecks(prev => prev.map(c => c.checkNo === checkNoVal ? { ...c, status: "cleared" as const } : c))
    }

    toast.success("Manual match confirmed. Bank ledger updated.")
  }

  // 7. Auto-Match Engine
  const handleAutoMatch = () => {
    let matchCount = 0
    let tempLedger = [...reconciliationItems]
    let tempStatement = [...bankStatementItems]
    const updatedChecks = [...checks]

    tempLedger.forEach(ledgerItem => {
      if (ledgerItem.matched) return

      // Find an unmatched statement charge with exact absolute amount
      const matchIdx = tempStatement.findIndex(stmtItem => 
        !stmtItem.matched && 
        stmtItem.amount < 0 && 
        Math.abs(stmtItem.amount) === Math.abs(ledgerItem.amount)
      )

      if (matchIdx !== -1) {
        ledgerItem.matched = true
        ledgerItem.matchedId = tempStatement[matchIdx].id
        tempStatement[matchIdx].matched = true
        matchCount++

        // If it was a check, clear it
        if (ledgerItem.type === "Check") {
          const checkNoVal = ledgerItem.reference.replace("CHK-", "")
          const checkIdx = updatedChecks.findIndex(c => c.checkNo === checkNoVal)
          if (checkIdx !== -1) {
            updatedChecks[checkIdx] = { ...updatedChecks[checkIdx], status: "cleared" }
          }
        }
      }
    })

    setReconciliationItems(tempLedger)
    setBankStatementItems(tempStatement)
    setChecks(updatedChecks)

    if (matchCount > 0) {
      toast.success(`Auto-Match Engine successfully reconciled ${matchCount} transactions.`)
    } else {
      toast.info("Auto-Match scan complete. No obvious matches found.")
    }
  }

  return (
    <BaseLayout 
      title="Disbursement Management" 
      description="Execute operational outflow payments, sign printed paper checks, generate bank transfer files, and reconcile treasury balances."
    >
      <Toaster />
      <div className="space-y-6">
        {/* Core Integrated Stat Cards */}
        <div className="grid gap-4 grid-cols-2 lg:grid-cols-4 px-4 lg:px-6">
          <Card className="bg-card/40 backdrop-blur-sm transition-all duration-300 hover:shadow-sm">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-muted-foreground text-xs font-semibold uppercase tracking-wider">Total Disbursed</p>
                  <div className="mt-1">
                    <span className="text-2xl font-bold tracking-tight">{formatPHP(topMetrics.totalDisbursed)}</span>
                  </div>
                </div>
                <div className="bg-secondary rounded-lg p-2.5">
                  <Activity className="size-5 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card/40 backdrop-blur-sm transition-all duration-300 hover:shadow-sm">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-muted-foreground text-xs font-semibold uppercase tracking-wider">Awaiting Approvals</p>
                  <div className="mt-1 flex items-baseline gap-1.5">
                    <span className="text-2xl font-bold tracking-tight">{topMetrics.pendingRequestsCount}</span>
                    <span className="text-[10px] text-amber-500 font-semibold">Requests</span>
                  </div>
                </div>
                <div className="bg-secondary rounded-lg p-2.5">
                  <ClipboardList className="size-5 text-amber-500" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card/40 backdrop-blur-sm transition-all duration-300 hover:shadow-sm">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-muted-foreground text-xs font-semibold uppercase tracking-wider">Scheduled Runs</p>
                  <div className="mt-1 flex items-baseline gap-1.5">
                    <span className="text-2xl font-bold tracking-tight">{topMetrics.pendingVouchersCount}</span>
                    <span className="text-[10px] text-blue-500 font-semibold">Vouchers</span>
                  </div>
                </div>
                <div className="bg-secondary rounded-lg p-2.5">
                  <Calendar className="size-5 text-blue-500" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card/40 backdrop-blur-sm transition-all duration-300 hover:shadow-sm">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-muted-foreground text-xs font-semibold uppercase tracking-wider">Treasury Balance</p>
                  <div className="mt-1">
                    <span className="text-2xl font-bold tracking-tight">{formatPHP(topMetrics.totalCash)}</span>
                  </div>
                </div>
                <div className="bg-secondary rounded-lg p-2.5">
                  <Wallet className="size-5 text-emerald-500" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tab Interface */}
        <Tabs defaultValue="overview" className="w-full">
          <div className="px-4 lg:px-6">
            <TabsList className="grid grid-cols-5 w-full max-w-3xl bg-muted/30 p-1 border">
              <TabsTrigger value="overview" className="cursor-pointer text-xs flex items-center gap-1.5">
                <Activity className="size-3.5" /> Dashboard
              </TabsTrigger>
              <TabsTrigger value="execution" className="cursor-pointer text-xs flex items-center gap-1.5">
                <CreditCard className="size-3.5" /> Run Payments
              </TabsTrigger>
              <TabsTrigger value="requests" className="cursor-pointer text-xs flex items-center gap-1.5">
                <ClipboardList className="size-3.5" /> Requests
              </TabsTrigger>
              <TabsTrigger value="registers" className="cursor-pointer text-xs flex items-center gap-1.5">
                <FileText className="size-3.5" /> Registers
              </TabsTrigger>
              <TabsTrigger value="reconciliation" className="cursor-pointer text-xs flex items-center gap-1.5">
                <CheckCircle className="size-3.5" /> Reconcile
              </TabsTrigger>
            </TabsList>
          </div>

          <div className="mt-6">
            <TabsContent value="overview" className="outline-hidden">
              <DashboardView 
                bankAccounts={bankAccounts}
                vouchers={vouchers}
                checks={checks}
                eftBatches={eftBatches}
              />
            </TabsContent>

            <TabsContent value="execution" className="outline-hidden">
              <PaymentExecution 
                bankAccounts={bankAccounts}
                vouchers={vouchers}
                onExecuteDisbursement={handleExecuteDisbursement}
              />
            </TabsContent>

            <TabsContent value="requests" className="outline-hidden">
              <RequestApproval 
                bankAccounts={bankAccounts}
                requests={requests}
                onApproveRequest={handleApproveRequest}
                onRejectRequest={handleRejectRequest}
                onCreateRequest={handleCreateRequest}
              />
            </TabsContent>

            <TabsContent value="registers" className="outline-hidden">
              <CheckEftRegister 
                checks={checks}
                eftBatches={eftBatches}
                onVoidCheck={handleVoidCheck}
              />
            </TabsContent>

            <TabsContent value="reconciliation" className="outline-hidden">
              <BankReconciliation 
                reconciliationItems={reconciliationItems}
                bankStatementItems={bankStatementItems}
                onMatch={handleMatch}
                onAutoMatch={handleAutoMatch}
              />
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </BaseLayout>
  )
}
