export interface LineItem {
  id?: string;
  _id?: string;
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
  createdAt?: string | Date;
  updatedAt?: string | Date;
}

export interface Contract {
  id: string;
  _id?: string;
  quoteId: string;
  contractNumber: string;
  customerName: string;
  startDate: string | Date;
  endDate: string | Date;
  value: number;
  status: "active" | "completed" | "cancelled";
  signedDate: string | Date;
  createdAt?: string | Date;
  updatedAt?: string | Date;
}

export interface QuoteUser {
  id: string;
  _id?: string;
  name: string;
  email: string;
  role?: string;
}

export type QuoteStatus = 
  | 'draft' 
  | 'pending' 
  | 'sent' 
  | 'approved' 
  | 'rejected' 
  | 'under_review' 
  | 'active_contract'
  | 'accepted'
  | 'expired';

export interface Quote {
  id?: string;
  _id?: string;
  customerId: string;
  customerName: string;
  quoteNumber: string;
  date: string | Date;
  expiryDate: string | Date;
  lineItems: LineItem[];
  subtotal: number;
  taxRate: number;
  taxAmount: number;
  total: number;
  terms: string;
  notes: string;
  status: QuoteStatus;
  salesRep?: string;
  createdBy?: string | QuoteUser;
  reviewNotes?: string;
  createdAt?: string | Date;
  updatedAt?: string | Date;
  __v?: number;
}
