import { AlertTriangle, CheckCircle2, Clock3, DollarSign, FileText, Landmark, ShieldCheck, TrendingUp } from "lucide-react"

import { BaseLayout } from "@/components/layouts/base-layout"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

const agingBuckets = [
  { label: "0-30 Days", amount: 1480000, tone: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400" },
  { label: "31-60 Days", amount: 620000, tone: "bg-amber-500/10 text-amber-700 dark:text-amber-400" },
  { label: "61-90 Days", amount: 315000, tone: "bg-orange-500/10 text-orange-700 dark:text-orange-400" },
  { label: ">90 Days", amount: 188000, tone: "bg-rose-500/10 text-rose-700 dark:text-rose-400" },
]

const outstandingInvoices = [
  { invoice: "INV-2048", client: "Apex Logistics", service: "Fleet Dispatch", amount: 285000, due: "2026-07-15", status: "Due Soon", aging: "0-30" },
  { invoice: "INV-2047", client: "NorthStar Staffing", service: "Recruitment Deployment", amount: 420750, due: "2026-06-28", status: "Overdue", aging: "31-60" },
  { invoice: "INV-2046", client: "Greenline Facilities", service: "Facility Support", amount: 182500, due: "2026-06-10", status: "Critical", aging: ">90" },
  { invoice: "INV-2045", client: "Crest Medical", service: "HRIS Admin", amount: 360000, due: "2026-07-22", status: "Collected", aging: "0-30" },
]

const followUps = [
  { client: "NorthStar Staffing", note: "Reminder sent for 2nd collection call", priority: "High" },
  { client: "Greenline Facilities", note: "Payment plan approved pending confirmation", priority: "Medium" },
  { client: "Apex Logistics", note: "Invoice scheduled for settlement this week", priority: "Low" },
]

const arModules = [
  { title: "Invoice Management", description: "Create, approve, and issue service invoices tied to deployment, staffing, and facility contracts." },
  { title: "Customer Ledger", description: "Maintain account balances, advance payments, credit notes, and reconciliation history." },
  { title: "Collections & Dunning", description: "Track reminders, escalation steps, and payment arrangements for overdue receivables." },
  { title: "Reporting & Analytics", description: "Monitor collection efficiency, aging trends, revenue recognition, and cash forecasting." },
]

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency: "PHP",
    maximumFractionDigits: 0,
  }).format(value)

export default function AccountsReceivablePage() {
  const totalOutstanding = agingBuckets.reduce((sum, item) => sum + item.amount, 0)
  const overdueAmount = agingBuckets.slice(1).reduce((sum, item) => sum + item.amount, 0)
  const collectionRate = 92

  return (
    <BaseLayout
      title="Accounts Receivable (AR)"
      description="Manage invoices, aging, collections, and reporting for the ISMERS financial module."
    >
      <div className="space-y-6 px-4 lg:px-6">
        <div className="flex flex-col gap-4 rounded-xl border bg-background/70 p-4 shadow-sm lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-sm font-medium text-primary">ISMERS Financial Management</p>
            <h2 className="text-xl font-semibold">Accounts receivable control center for client billing and collections</h2>
            <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
              Monitor service invoices from recruitment, deployment, HRIS operations, fleet dispatch, and facilities support while keeping cash collection efficient and audit-ready.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline">New Invoice</Button>
            <Button>Run Collections</Button>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Outstanding</p>
                  <p className="mt-2 text-2xl font-semibold">{formatCurrency(totalOutstanding)}</p>
                </div>
                <div className="rounded-lg bg-primary/10 p-2 text-primary">
                  <DollarSign className="size-5" />
                </div>
              </div>
              <div className="mt-3 flex items-center gap-1 text-sm text-emerald-600">
                <TrendingUp className="size-4" />
                <span>+6.2% vs prior month</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Overdue Amount</p>
                  <p className="mt-2 text-2xl font-semibold">{formatCurrency(overdueAmount)}</p>
                </div>
                <div className="rounded-lg bg-amber-500/10 p-2 text-amber-600">
                  <AlertTriangle className="size-5" />
                </div>
              </div>
              <div className="mt-3 flex items-center gap-1 text-sm text-muted-foreground">
                <Clock3 className="size-4" />
                <span>12 invoices require escalation</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Collection Rate</p>
                  <p className="mt-2 text-2xl font-semibold">{collectionRate}%</p>
                </div>
                <div className="rounded-lg bg-emerald-500/10 p-2 text-emerald-600">
                  <CheckCircle2 className="size-5" />
                </div>
              </div>
              <div className="mt-3 flex items-center gap-1 text-sm text-muted-foreground">
                <ShieldCheck className="size-4" />
                <span>Healthy cash recovery trend</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Open Invoices</p>
                  <p className="mt-2 text-2xl font-semibold">{outstandingInvoices.length}</p>
                </div>
                <div className="rounded-lg bg-sky-500/10 p-2 text-sky-600">
                  <FileText className="size-5" />
                </div>
              </div>
              <div className="mt-3 flex items-center gap-1 text-sm text-muted-foreground">
                <Landmark className="size-4" />
                <span>Linked to client contracts</span>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
          <Card>
            <CardHeader>
              <CardTitle>Accounts receivable aging summary</CardTitle>
              <CardDescription>Current receivable buckets by days outstanding.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {agingBuckets.map((bucket) => (
                <div key={bucket.label} className="flex items-center justify-between rounded-lg border p-3">
                  <div>
                    <p className="font-medium">{bucket.label}</p>
                    <p className="text-sm text-muted-foreground">Balance exposure</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">{formatCurrency(bucket.amount)}</p>
                    <Badge className={bucket.tone}>{bucket.label}</Badge>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Collection follow-up</CardTitle>
              <CardDescription>Next actions for overdue and at-risk accounts.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {followUps.map((item) => (
                <div key={item.client} className="rounded-lg border p-3">
                  <div className="flex items-center justify-between gap-2">
                    <p className="font-medium">{item.client}</p>
                    <Badge variant="outline">{item.priority}</Badge>
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground">{item.note}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Outstanding invoices</CardTitle>
            <CardDescription>Service-based billing records awaiting settlement.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Invoice</TableHead>
                    <TableHead>Client</TableHead>
                    <TableHead>Service</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Due Date</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {outstandingInvoices.map((invoice) => (
                    <TableRow key={invoice.invoice}>
                      <TableCell className="font-medium">{invoice.invoice}</TableCell>
                      <TableCell>{invoice.client}</TableCell>
                      <TableCell>{invoice.service}</TableCell>
                      <TableCell>{formatCurrency(invoice.amount)}</TableCell>
                      <TableCell>{invoice.due}</TableCell>
                      <TableCell>
                        <Badge
                          variant={invoice.status === "Collected" ? "secondary" : invoice.status === "Overdue" || invoice.status === "Critical" ? "destructive" : "outline"}
                        >
                          {invoice.status}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>AR modules in ISMERS</CardTitle>
            <CardDescription>Core submodules supporting the financial management domain.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2">
            {arModules.map((module) => (
              <div key={module.title} className="rounded-lg border p-4">
                <h3 className="font-semibold">{module.title}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{module.description}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </BaseLayout>
  )
}
