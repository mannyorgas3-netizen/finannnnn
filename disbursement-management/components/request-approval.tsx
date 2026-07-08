"use client"

import * as React from "react"
import { Check, ClipboardList, FileText, Plus, X } from "lucide-react"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import type { BankAccount, DisbursementRequest } from "../data/mock-data"

interface RequestApprovalProps {
  bankAccounts: BankAccount[]
  requests: DisbursementRequest[]
  onApproveRequest: (id: string) => void
  onRejectRequest: (id: string) => void
  onCreateRequest: (req: Omit<DisbursementRequest, "id" | "date" | "status">) => void
}

const formatPHP = (val: number) => {
  return new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency: "PHP",
    maximumFractionDigits: 0,
  }).format(val)
}

export function RequestApproval({ bankAccounts, requests, onApproveRequest, onRejectRequest, onCreateRequest }: RequestApprovalProps) {
  const [open, setOpen] = React.useState(false)
  const [filterStatus, setFilterStatus] = React.useState<string>("all")

  // Form states
  const [title, setTitle] = React.useState("")
  const [payee, setPayee] = React.useState("")
  const [amount, setAmount] = React.useState("")
  const [description, setDescription] = React.useState("")
  const [subsystem, setSubsystem] = React.useState<any>("Financials")
  const [bankAccountId, setBankAccountId] = React.useState("bank-1")
  const [requester, setRequester] = React.useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!title || !payee || !amount || !requester) return

    onCreateRequest({
      title,
      payee,
      amount: parseFloat(amount),
      subsystem,
      description,
      bankAccountId,
      requester,
    })

    // Reset Form
    setTitle("")
    setPayee("")
    setAmount("")
    setDescription("")
    setSubsystem("Financials")
    setBankAccountId("bank-1")
    setRequester("")
    setOpen(false)
  }

  const filteredRequests = React.useMemo(() => {
    return requests.filter(r => filterStatus === "all" || r.status === filterStatus)
  }, [requests, filterStatus])

  return (
    <div className="space-y-6 px-4 lg:px-6">
      <Card className="bg-card/50 backdrop-blur-sm">
        <CardHeader className="flex flex-col space-y-2 sm:flex-row sm:items-center sm:justify-between sm:space-y-0 pb-3">
          <div>
            <CardTitle>Disbursement Requests</CardTitle>
            <CardDescription>
              Review and approve non-invoice operational disbursements (reimbursements, advances, emergency funds)
            </CardDescription>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {/* Status Filter buttons */}
            <div className="flex items-center border rounded-lg p-0.5 bg-muted/30">
              {["all", "pending", "approved", "rejected", "paid"].map(status => (
                <button
                  key={status}
                  onClick={() => setFilterStatus(status)}
                  className={`px-3 py-1.5 rounded-md text-xs font-medium capitalize cursor-pointer transition-colors ${
                    filterStatus === status 
                      ? "bg-background text-foreground shadow-xs" 
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {status}
                </button>
              ))}
            </div>

            {/* Dialog Trigger to Create Request */}
            <Dialog open={open} onOpenChange={setOpen}>
              <DialogTrigger asChild>
                <Button size="sm" className="cursor-pointer">
                  <Plus className="size-4 mr-1.5" /> File Request
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-lg">
                <form onSubmit={handleSubmit} className="space-y-4">
                  <DialogHeader>
                    <DialogTitle>Disbursement Request Form</DialogTitle>
                    <DialogDescription>
                      File an operational disbursement request. Approved requests are queued for bank payment execution.
                    </DialogDescription>
                  </DialogHeader>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5 col-span-2">
                      <Label htmlFor="title">Request Subject</Label>
                      <Input
                        id="title"
                        placeholder="e.g., Q3 Office Stationeries Reimbursement"
                        value={title}
                        onChange={e => setTitle(e.target.value)}
                        required
                      />
                    </div>

                    <div className="space-y-1.5">
                      <Label htmlFor="requester">Requester Name</Label>
                      <Input
                        id="requester"
                        placeholder="e.g., Clara Reyes"
                        value={requester}
                        onChange={e => setRequester(e.target.value)}
                        required
                      />
                    </div>

                    <div className="space-y-1.5">
                      <Label htmlFor="payee">Payee (Receiving Entity)</Label>
                      <Input
                        id="payee"
                        placeholder="e.g., Clara Reyes / Vendor Name"
                        value={payee}
                        onChange={e => setPayee(e.target.value)}
                        required
                      />
                    </div>

                    <div className="space-y-1.5">
                      <Label htmlFor="amount">Amount (PHP)</Label>
                      <Input
                        id="amount"
                        type="number"
                        min="1"
                        step="0.01"
                        placeholder="e.g., 25000"
                        value={amount}
                        onChange={e => setAmount(e.target.value)}
                        required
                      />
                    </div>

                    <div className="space-y-1.5">
                      <Label htmlFor="subsystem">Origin Subsystem</Label>
                      <Select value={subsystem} onValueChange={(val: any) => setSubsystem(val)}>
                        <SelectTrigger id="subsystem" className="cursor-pointer">
                          <SelectValue placeholder="Select Subsystem" />
                        </SelectTrigger>
                        <SelectContent>
                          {[
                            "Client Acquisition",
                            "HRIS Payroll",
                            "Benefits & Compliance",
                            "Governance & Admin",
                            "Supply Chain",
                            "Fleet & Transport",
                            "Facilities",
                            "CRM",
                            "Financials",
                          ].map(sub => (
                            <SelectItem key={sub} value={sub} className="cursor-pointer">
                              {sub}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-1.5 col-span-2">
                      <Label htmlFor="bankAccountId">Target Disbursement Bank</Label>
                      <Select value={bankAccountId} onValueChange={setBankAccountId}>
                        <SelectTrigger id="bankAccountId" className="cursor-pointer">
                          <SelectValue placeholder="Select Bank" />
                        </SelectTrigger>
                        <SelectContent>
                          {bankAccounts.map(b => (
                            <SelectItem key={b.id} value={b.id} className="cursor-pointer">
                              {b.name} (Bal: {formatPHP(b.balance)})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-1.5 col-span-2">
                      <Label htmlFor="description">Justification & Details</Label>
                      <Textarea
                        id="description"
                        placeholder="Specify business reason, itemized expenses, or references..."
                        value={description}
                        onChange={e => setDescription(e.target.value)}
                        className="min-h-[80px]"
                      />
                    </div>
                  </div>

                  <DialogFooter className="pt-2">
                    <Button type="button" variant="outline" onClick={() => setOpen(false)} className="cursor-pointer">
                      Cancel
                    </Button>
                    <Button type="submit" className="cursor-pointer">Submit Request</Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          {filteredRequests.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center border border-dashed rounded-lg">
              <ClipboardList className="size-10 text-muted-foreground/40 mb-3" />
              <p className="font-semibold text-muted-foreground">No Requests Found</p>
              <p className="text-xs text-muted-foreground/80 mt-1">
                There are no disbursement requests matching the filter '{filterStatus}'.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-left text-sm">
                <thead>
                  <tr className="border-b text-xs font-semibold text-muted-foreground/80 bg-muted/10">
                    <th className="py-3 px-4">Request ID</th>
                    <th className="py-3 px-4">Subject</th>
                    <th className="py-3 px-4">Subsystem</th>
                    <th className="py-3 px-4">Requester / Payee</th>
                    <th className="py-3 px-4">Filing Date</th>
                    <th className="py-3 px-4">Amount</th>
                    <th className="py-3 px-4 text-center">Status</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {filteredRequests.map(req => {
                    const isPending = req.status === "pending"
                    const statusColors = 
                      req.status === "approved" ? "bg-blue-500/10 text-blue-500 border-blue-500/20" :
                      req.status === "rejected" ? "bg-red-500/10 text-red-500 border-red-500/20" :
                      req.status === "paid" ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" :
                      "bg-amber-500/10 text-amber-500 border-amber-500/20"

                    return (
                      <tr key={req.id} className="hover:bg-muted/10 transition-colors group">
                        <td className="py-3.5 px-4 font-mono text-xs">{req.id}</td>
                        <td className="py-3.5 px-4 max-w-[200px]">
                          <div className="font-medium text-foreground truncate">{req.title}</div>
                          <div className="text-xs text-muted-foreground truncate">{req.description || "No description provided"}</div>
                        </td>
                        <td className="py-3.5 px-4">
                          <Badge variant="outline" className="text-[10px] py-0 px-1.5 font-normal bg-secondary/30">
                            {req.subsystem}
                          </Badge>
                        </td>
                        <td className="py-3.5 px-4 text-xs">
                          <div>By: <span className="font-medium">{req.requester}</span></div>
                          <div className="text-muted-foreground mt-0.5">Pay: <span className="font-medium">{req.payee}</span></div>
                        </td>
                        <td className="py-3.5 px-4 text-xs text-muted-foreground">{req.date}</td>
                        <td className="py-3.5 px-4 font-bold">{formatPHP(req.amount)}</td>
                        <td className="py-3.5 px-4 text-center">
                          <Badge className={`text-[10px] capitalize font-medium px-2 py-0.5 border ${statusColors}`}>
                            {req.status}
                          </Badge>
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {isPending ? (
                              <>
                                <Button
                                  variant="outline"
                                  size="icon"
                                  onClick={() => onApproveRequest(req.id)}
                                  className="size-7 text-emerald-600 border-emerald-600/30 hover:bg-emerald-500/10 hover:text-emerald-500 cursor-pointer"
                                  title="Approve"
                                >
                                  <Check className="size-3.5" />
                                </Button>
                                <Button
                                  variant="outline"
                                  size="icon"
                                  onClick={() => onRejectRequest(req.id)}
                                  className="size-7 text-rose-600 border-rose-600/30 hover:bg-rose-500/10 hover:text-rose-500 cursor-pointer"
                                  title="Reject"
                                >
                                  <X className="size-3.5" />
                                </Button>
                              </>
                            ) : (
                              <div className="text-xs text-muted-foreground flex items-center gap-1 opacity-60">
                                <FileText className="size-3.5" /> Archival Log
                              </div>
                            )}
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
