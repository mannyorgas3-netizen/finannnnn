import {
  CheckCircle2,
  Circle,
  Clock,
  PlayCircle,
} from "lucide-react"

export const categories = [
  {
    value: "invoice-review",
    label: "Invoice Review",
  },
  {
    value: "expense-approval",
    label: "Expense Approval",
  },
  {
    value: "vendor-setup",
    label: "Vendor Setup",
  },
  {
    value: "payment-run",
    label: "Payment Run",
  },
  {
    value: "tax-compliance",
    label: "Tax Compliance",
  },
  {
    value: "reconciliation",
    label: "Reconciliation",
  },
]

export const statuses = [
  {
    value: "pending-review",
    label: "Pending Review",
    icon: Clock,
  },
  {
    value: "approved",
    label: "Approved",
    icon: Circle,
  },
  {
    value: "scheduled",
    label: "Scheduled",
    icon: PlayCircle,
  },
  {
    value: "paid",
    label: "Paid",
    icon: CheckCircle2,
  },
]

export const priorities = [
  {
    label: "Low",
    value: "low",
  },
  {
    label: "Medium",
    value: "medium",
  },
  {
    label: "High",
    value: "high",
  },
  {
    label: "Urgent",
    value: "urgent",
  },
]
