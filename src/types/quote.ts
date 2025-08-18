export interface LineItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

export interface Contract {
  id: string;
  quoteId: string;
  contractNumber: string;
  customerName: string;
  startDate: string;
  endDate: string;
  value: number;
  status: "active" | "completed" | "cancelled";
  signedDate: string;
}

export interface Quote {
  id: string;
  customerId: string;
  customerName: string;
  quoteNumber: string;
  date: string;
  expiryDate: string;
  lineItems: LineItem[];
  subtotal: number;
  taxRate: number;
  taxAmount: number;
  total: number;
  terms: string;
  notes: string;
  status: "draft" | "pending" | "sent" | "approved" | "rejected" | "under_review" | "active_contract";
  salesRep?: string;
  reviewNotes?: string;
}
