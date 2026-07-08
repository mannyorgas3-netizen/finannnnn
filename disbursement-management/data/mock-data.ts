export interface BankAccount {
  id: string
  name: string
  accountNo: string
  balance: number
  currency: string
}

export interface Voucher {
  id: string
  payee: string
  amount: number
  date: string
  subsystem: 'Client Acquisition' | 'HRIS Payroll' | 'Benefits & Compliance' | 'Governance & Admin' | 'Supply Chain' | 'Fleet & Transport' | 'Facilities' | 'CRM' | 'Financials'
  description: string
  referenceNo: string
  status: 'pending' | 'processing' | 'paid'
  urgency: 'low' | 'medium' | 'high'
}

export interface DisbursementRequest {
  id: string
  title: string
  payee: string
  amount: number
  subsystem: 'Client Acquisition' | 'HRIS Payroll' | 'Benefits & Compliance' | 'Governance & Admin' | 'Supply Chain' | 'Fleet & Transport' | 'Facilities' | 'CRM' | 'Financials'
  description: string
  bankAccountId: string
  requester: string
  date: string
  status: 'pending' | 'approved' | 'rejected' | 'paid'
}

export interface CheckRecord {
  id: string
  checkNo: string
  voucherId?: string
  payee: string
  amount: number
  date: string
  bankName: string
  status: 'issued' | 'cleared' | 'voided'
}

export interface EFTBatch {
  id: string
  batchRef: string
  voucherCount: number
  totalAmount: number
  bankName: string
  date: string
  status: 'pending' | 'transmitted' | 'cleared'
}

export interface ReconciliationItem {
  id: string
  date: string
  reference: string
  type: 'Check' | 'EFT' | 'Wire' | 'Cash'
  description: string
  amount: number
  matched: boolean
  matchedId?: string
}

export interface BankStatementItem {
  id: string
  date: string
  description: string
  amount: number // Negative for outflow
  matched: boolean
}

export const initialBankAccounts: BankAccount[] = [
  {
    id: "bank-1",
    name: "Metrobank Checking (Primary)",
    accountNo: "METRO-9831-2940",
    balance: 4250000,
    currency: "PHP",
  },
  {
    id: "bank-2",
    name: "BDO Corporate Operating",
    accountNo: "BDO-0021-8843",
    balance: 2450000,
    currency: "PHP",
  },
  {
    id: "bank-3",
    name: "Petty Cash Fund",
    accountNo: "PETTY-CASH-MAIN",
    balance: 50000,
    currency: "PHP",
  },
]

export const initialVouchers: Voucher[] = [
  {
    id: "VCH-2026-001",
    payee: "June 2026 Deployed Staff",
    amount: 750000,
    date: "2026-07-01",
    subsystem: "HRIS Payroll",
    description: "Bi-monthly payroll disbursement for deployment contracts",
    referenceNo: "PAY-2026-06B",
    status: "pending",
    urgency: "high",
  },
  {
    id: "VCH-2026-002",
    payee: "Shell Fleet Solutions",
    amount: 112500,
    date: "2026-07-02",
    subsystem: "Fleet & Transport",
    description: "Monthly fleet fuel consumption cards replenishment",
    referenceNo: "FLEET-FUEL-492",
    status: "pending",
    urgency: "medium",
  },
  {
    id: "VCH-2026-003",
    payee: "Ayala Land Inc.",
    amount: 280000,
    date: "2026-07-03",
    subsystem: "Facilities",
    description: "Head Office Main lease payment (July 2026)",
    referenceNo: "FAC-LEASE-9921",
    status: "pending",
    urgency: "high",
  },
  {
    id: "VCH-2026-004",
    payee: "Maxicare Health Plans",
    amount: 185000,
    date: "2026-07-04",
    subsystem: "Benefits & Compliance",
    description: "Q3 Employee medical insurance premium coverage",
    referenceNo: "BEN-MAXI-Q3",
    status: "pending",
    urgency: "medium",
  },
  {
    id: "VCH-2026-005",
    payee: "TechVantage Corp Client",
    amount: 95000,
    date: "2026-07-05",
    subsystem: "CRM",
    description: "Security deposit refund upon job order completion",
    referenceNo: "CRM-DEP-841",
    status: "pending",
    urgency: "low",
  },
  {
    id: "VCH-2026-006",
    payee: "PLDT Enterprise",
    amount: 35000,
    date: "2026-07-05",
    subsystem: "Facilities",
    description: "Dedicated high-speed internet lease for Smart Warehousing",
    referenceNo: "FAC-NET-3211",
    status: "pending",
    urgency: "medium",
  },
  {
    id: "VCH-2026-007",
    payee: "Cisco Systems Philippines",
    amount: 420000,
    date: "2026-07-06",
    subsystem: "Supply Chain",
    description: "Smart warehousing server and scanner infrastructure PO-991",
    referenceNo: "SC-INV-991A",
    status: "pending",
    urgency: "medium",
  },
  {
    id: "VCH-2026-008",
    payee: "Employee Calamity Loans Batch A",
    amount: 120000,
    date: "2026-07-07",
    subsystem: "Benefits & Compliance",
    description: "Employee assistance loan disbursement for typhoon affected staff",
    referenceNo: "BEN-LOAN-CALA",
    status: "pending",
    urgency: "high",
  },
]

export const initialRequests: DisbursementRequest[] = [
  {
    id: "REQ-101",
    title: "Travel Reimbursement - Visayas Recruitment",
    payee: "Maria Santos (Recruitment Lead)",
    amount: 24500,
    subsystem: "Client Acquisition",
    description: "Visayas recruiting roadshow expenses, hotel and terminal fees",
    bankAccountId: "bank-2",
    requester: "Maria Santos",
    date: "2026-07-05",
    status: "pending",
  },
  {
    id: "REQ-102",
    title: "Legal Consultation Retainer",
    payee: "Cruz & Associates Law Firm",
    amount: 85000,
    subsystem: "Governance & Admin",
    description: "Professional legal retainer fees for contract management disputes",
    bankAccountId: "bank-1",
    requester: "Atty. Juan Cruz",
    date: "2026-07-06",
    status: "approved",
  },
  {
    id: "REQ-103",
    title: "Emergency Generator Fuel Replenishment",
    payee: "Petron Corporation",
    amount: 18000,
    subsystem: "Facilities",
    description: "Diesel fuel replenishment for warehouse backup generators",
    bankAccountId: "bank-3",
    requester: "Roberto Gomez",
    date: "2026-07-07",
    status: "pending",
  },
  {
    id: "REQ-104",
    title: "Cloud Migration Server Hosting Payout",
    payee: "Amazon Web Services",
    amount: 55000,
    subsystem: "Governance & Admin",
    description: "Special system migration hosting fee payment (cancelled in governance)",
    bankAccountId: "bank-1",
    requester: "Mark Wilson",
    date: "2026-07-04",
    status: "rejected",
  },
  {
    id: "REQ-105",
    title: "Petty Cash Replenishment Request Q3",
    payee: "Finance Custodian",
    amount: 15000,
    subsystem: "Financials",
    description: "Replenishing administrative office petty cash drawer",
    bankAccountId: "bank-3",
    requester: "Clara Reyes",
    date: "2026-07-08",
    status: "pending",
  },
]

export const initialChecks: CheckRecord[] = [
  {
    id: "CHK-001",
    checkNo: "00028481",
    payee: "Apex Building Supplies Inc.",
    amount: 67500,
    date: "2026-06-25",
    bankName: "Metrobank Checking (Primary)",
    status: "cleared",
  },
  {
    id: "CHK-002",
    checkNo: "00028482",
    payee: "Davao Fleet Logistics Corp",
    amount: 145000,
    date: "2026-06-28",
    bankName: "Metrobank Checking (Primary)",
    status: "issued",
  },
  {
    id: "CHK-003",
    checkNo: "00028483",
    payee: "Bureau of Internal Revenue",
    amount: 320000,
    date: "2026-06-30",
    bankName: "Metrobank Checking (Primary)",
    status: "issued",
  },
]

export const initialEFTBatches: EFTBatch[] = [
  {
    id: "EFT-001",
    batchRef: "EFT-BATCH-202606A",
    voucherCount: 15,
    totalAmount: 640000,
    bankName: "BDO Corporate Operating",
    date: "2026-06-15",
    status: "transmitted",
  },
  {
    id: "EFT-002",
    batchRef: "EFT-BATCH-202606B",
    voucherCount: 12,
    totalAmount: 480000,
    bankName: "BDO Corporate Operating",
    date: "2026-06-30",
    status: "transmitted",
  },
]

export const initialReconciliationItems: ReconciliationItem[] = [
  {
    id: "REC-001",
    date: "2026-06-25",
    reference: "CHK-00028481",
    type: "Check",
    description: "Check 00028481 - Apex Building Supplies",
    amount: -67500,
    matched: true,
  },
  {
    id: "REC-002",
    date: "2026-06-28",
    reference: "CHK-00028482",
    type: "Check",
    description: "Check 00028482 - Davao Fleet Logistics Corp",
    amount: -145000,
    matched: false,
  },
  {
    id: "REC-003",
    date: "2026-06-30",
    reference: "CHK-00028483",
    type: "Check",
    description: "Check 00028483 - Bureau of Internal Revenue",
    amount: -320000,
    matched: false,
  },
  {
    id: "REC-004",
    date: "2026-06-15",
    reference: "EFT-BATCH-202606A",
    type: "EFT",
    description: "Direct Deposit Batch EFT-BATCH-202606A",
    amount: -640000,
    matched: true,
  },
  {
    id: "REC-005",
    date: "2026-06-30",
    reference: "EFT-BATCH-202606B",
    type: "EFT",
    description: "Direct Deposit Batch EFT-BATCH-202606B",
    amount: -480000,
    matched: false,
  },
]

export const initialBankStatementItems: BankStatementItem[] = [
  {
    id: "BST-001",
    date: "2026-06-26",
    description: "METROBANK OUTWARD CHECK 00028481",
    amount: -67500,
    matched: true,
  },
  {
    id: "BST-002",
    date: "2026-06-16",
    description: "BDO CORPORATE ACH OUTWARD EFT-BATCH-202606A",
    amount: -640000,
    matched: true,
  },
  {
    id: "BST-003",
    date: "2026-06-29",
    description: "METROBANK DEPOSIT RET-CLIENT RET-9831",
    amount: 150000,
    matched: false,
  },
  {
    id: "BST-004",
    date: "2026-07-02",
    description: "BDO CORPORATE ACH OUTWARD EFT-BATCH-202606B",
    amount: -480000,
    matched: false,
  },
  {
    id: "BST-005",
    date: "2026-07-03",
    description: "METROBANK OUTWARD CHECK 00028482",
    amount: -145000,
    matched: false,
  },
]
