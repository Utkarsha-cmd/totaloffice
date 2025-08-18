import type React from "react"
import { useState } from "react"
import {
  FileText,
  Eye,
  CheckCircle,
  XCircle,
  Clock,
  DollarSign,
  Search,
  Download,
  Send,
  AlertCircle,
  ArrowRight,
  Handshake,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"
import { generateQuotePdf } from "@/utils/generatePdf"
import type { Quote, LineItem, Contract } from "@/types/quote"

const QuotesManagement: React.FC = () => {
  const [activeTab, setActiveTab] = useState("pending_review")
  const [statusFilter, setStatusFilter] = useState("all")
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedQuote, setSelectedQuote] = useState<Quote | null>(null)
  const [reviewNotes, setReviewNotes] = useState("")

  // Sample quotes data with various statuses
  const [quotes, setQuotes] = useState<Quote[]>([
    {
      id: "Q-001",
      customerId: "C-001",
      customerName: "Acme Corporation",
      quoteNumber: "Q-001",
      date: "2024-01-15",
      expiryDate: "2024-02-15",
      lineItems: [
        {
          id: "item-1",
          description: "Professional Services Consultation",
          quantity: 10,
          unitPrice: 150,
          total: 1500,
        },
      ],
      subtotal: 1500,
      taxRate: 8.5,
      taxAmount: 127.5,
      total: 1627.5,
      terms: "Payment due within 30 days of invoice date.",
      notes: "Initial consultation package",
      status: "sent",
      salesRep: "John Smith",
    },
    {
      id: "Q-002",
      customerId: "C-002",
      customerName: "Tech Solutions Inc",
      quoteNumber: "Q-002",
      date: "2024-01-14",
      expiryDate: "2024-02-14",
      lineItems: [
        {
          id: "item-2",
          description: "Software Development Package",
          quantity: 1,
          unitPrice: 5000,
          total: 5000,
        },
      ],
      subtotal: 5000,
      taxRate: 8.5,
      taxAmount: 425,
      total: 5425,
      terms: "50% upfront, 50% on completion",
      notes: "Custom software solution",
      status: "under_review",
      salesRep: "Sarah Johnson",
    },
    {
      id: "Q-003",
      customerId: "C-003",
      customerName: "Global Enterprises",
      quoteNumber: "Q-003",
      date: "2024-01-13",
      expiryDate: "2024-02-13",
      lineItems: [
        {
          id: "item-3",
          description: "Marketing Campaign Setup",
          quantity: 1,
          unitPrice: 2500,
          total: 2500,
        },
      ],
      subtotal: 2500,
      taxRate: 8.5,
      taxAmount: 212.5,
      total: 2712.5,
      terms: "Payment due within 15 days",
      notes: "Q1 campaign setup",
      status: "approved",
      salesRep: "Mike Brown",
    },
    {
      id: "Q-004",
      customerId: "C-004",
      customerName: "StartupCo",
      quoteNumber: "Q-004",
      date: "2024-01-12",
      expiryDate: "2024-02-12",
      lineItems: [
        {
          id: "item-4",
          description: "Website Development",
          quantity: 1,
          unitPrice: 3500,
          total: 3500,
        },
      ],
      subtotal: 3500,
      taxRate: 8.5,
      taxAmount: 297.5,
      total: 3797.5,
      terms: "Payment due within 30 days",
      notes: "Modern responsive website",
      status: "under_review",
      salesRep: "Lisa Davis",
    },
  ])

  const [contracts, setContracts] = useState<Contract[]>([
    {
      id: "C-001",
      quoteId: "Q-001", // Changed from Q-005 to Q-001 which exists in our sample data
      contractNumber: "CON-001",
      customerName: "Acme Corporation", // Updated to match the customer name from Q-001
      startDate: "2024-01-01",
      endDate: "2024-12-31",
      value: 1627.5, // Updated to match the total from Q-001
      status: "active",
      signedDate: "2023-12-28",
    },
  ])

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      draft: "outline",
      pending: "secondary",
      sent: "default",
      approved: "default",
      rejected: "destructive",
      under_review: "secondary",
      active_contract: "outline",
    }

    const icons: Record<string, React.ReactNode> = {
      draft: <FileText size={12} className="mr-1" />,
      pending: <Clock size={12} className="mr-1" />,
      sent: <Send size={12} className="mr-1 text-emerald-600" />,
      approved: <CheckCircle size={12} className="mr-1" />,
      rejected: <XCircle size={12} className="mr-1" />,
      under_review: <Eye size={12} className="mr-1" />,
      active_contract: <Handshake size={12} className="mr-1" />,
    }

    const displayText = status === 'sent' ? 'Sent' : status?.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
    
    return (
      <Badge 
        variant={status === 'active_contract' ? 'outline' : variants[status]}
        className={`text-xs ${status === 'sent' ? 'bg-emerald-100 text-emerald-800 border-emerald-200 hover:bg-emerald-200' : ''} ${status === 'active_contract' ? '!bg-emerald-50 !text-emerald-700 !border-emerald-200 hover:!bg-emerald-100' : ''}`}
      >
        {icons[status]}
        {displayText}
      </Badge>
    )
  }

 

  const handleQuoteAction = (quoteId: string, action: "approve" | "reject" | "request_changes") => {
    setQuotes(
      quotes.map((quote) => {
        if (quote.id === quoteId) {
          let newStatus: Quote["status"]
          switch (action) {
            case "approve":
              newStatus = "approved"
              break
            case "reject":
              newStatus = "rejected"
              break
            case "request_changes":
              newStatus = "draft"
              break
            default:
              newStatus = quote.status
          }
          return {
            ...quote,
            status: newStatus,
            reviewNotes: reviewNotes || quote.reviewNotes,
          }
        }
        return quote
      }),
    )

    toast.success(
      `Quote ${action === "approve" ? "approved" : action === "reject" ? "rejected" : "sent back for changes"} successfully!`,
    )
    setSelectedQuote(null)
    setReviewNotes("")
  }

  const convertToContract = (quoteId: string) => {
    const quote = quotes.find((q) => q.id === quoteId)
    if (!quote) return

    const newContract: Contract = {
      id: `C-${String(contracts.length + 2).padStart(3, "0")}`,
      quoteId: quote.id,
      contractNumber: `CON-${String(contracts.length + 2).padStart(3, "0")}`,
      customerName: quote.customerName,
      startDate: new Date().toISOString().split("T")[0],
      endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
      value: quote.total,
      status: "active",
      signedDate: new Date().toISOString().split("T")[0],
    }

    setContracts([...contracts, newContract])

    // Update quote status to active_contract
    setQuotes(quotes.map((q) => (q.id === quoteId ? { ...q, status: "active_contract" as Quote["status"] } : q)))

    toast.success("Quote converted to active contract successfully!")
  }

  const filteredQuotes = quotes.filter((quote) => {
    const matchesStatus = statusFilter === "all" || quote.status === statusFilter
    const matchesSearch =
      quote.quoteNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      quote.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (quote.salesRep && quote.salesRep.toLowerCase().includes(searchTerm.toLowerCase()))
    return matchesStatus && matchesSearch
  })

  const pendingReviewQuotes = filteredQuotes.filter((q) => q.status === "under_review" || q.status === "sent")
  const approvedQuotes = filteredQuotes.filter((q) => q.status === "approved")
  const activeContracts = contracts.filter((c) => c.status === "active")

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800">Quote Management</h1>
          <p className="text-gray-600 mt-1">Review sales quotes and manage contract conversions</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-xl flex items-center justify-center text-white shadow-lg mr-4">
                  <Clock size={20} />
                </div>
                <div>
                  <div className="text-sm font-medium text-gray-600">Pending Review</div>
                  <div className="text-2xl font-bold text-gray-800">{pendingReviewQuotes.length}</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center text-white shadow-lg mr-4">
                  <CheckCircle size={20} />
                </div>
                <div>
                  <div className="text-sm font-medium text-gray-600">Approved</div>
                  <div className="text-2xl font-bold text-gray-800">{approvedQuotes.length}</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center text-white shadow-lg mr-4">
                  <Handshake size={20} />
                </div>
                <div>
                  <div className="text-sm font-medium text-gray-600">Active Contracts</div>
                  <div className="text-2xl font-bold text-gray-800">{activeContracts.length}</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center text-white shadow-lg mr-4">
                  <DollarSign size={20} />
                </div>
                <div>
                  <div className="text-sm font-medium text-gray-600">Total Value</div>
                  <div className="text-2xl font-bold text-gray-800">
                    ${quotes.reduce((sum, q) => sum + (q.total || 0), 0).toLocaleString()}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Navigation Tabs */}
        <div className="flex space-x-1 mb-6 bg-white/50 p-1 rounded-xl">
          <button
            onClick={() => setActiveTab("pending_review")}
            className={`px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
              activeTab === "pending_review" ? "bg-white text-blue-600 shadow-md" : "text-gray-600 hover:text-blue-600"
            }`}
          >
            Pending Review ({pendingReviewQuotes.length})
          </button>
          <button
            onClick={() => setActiveTab("approved")}
            className={`px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
              activeTab === "approved" ? "bg-white text-blue-600 shadow-md" : "text-gray-600 hover:text-blue-600"
            }`}
          >
            Approved ({approvedQuotes.length})
          </button>
          <button
            onClick={() => setActiveTab("contracts")}
            className={`px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
              activeTab === "contracts" ? "bg-white text-blue-600 shadow-md" : "text-gray-600 hover:text-blue-600"
            }`}
          >
            Active Contracts ({activeContracts.length})
          </button>
        </div>

        {/* Filters */}
        <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg mb-6">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <Input
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 bg-white border-gray-300"
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-4 py-2 rounded-lg border border-gray-300 bg-white text-gray-800 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="all">All Status</option>
                  <option value="under_review">Under Review</option>
                  <option value="sent">Sent</option>
                  <option value="approved">Approved</option>
                  <option value="rejected">Rejected</option>
                  <option value="active_contract">Active Contract</option>
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Content based on active tab */}
        {activeTab === "pending_review" && (
          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-gray-800">
                <Clock size={20} className="text-emerald-500" />
                Quotes Pending Review
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              {pendingReviewQuotes.length > 0 ? (
                <div className="space-y-4">
                  {pendingReviewQuotes.map((quote) => (
                    <div
                      key={quote.id}
                      className="p-6 bg-gradient-to-r from-emerald-50 to-emerald-100 rounded-xl border border-emerald-200 hover:shadow-md transition-all duration-200"
                    >
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex items-center space-x-4">
                          <div>
                            <div className="font-semibold text-gray-800 text-lg">Quote #{quote.quoteNumber}</div>
                            <div className="text-sm text-gray-600">{quote.customerName}</div>
                            <div className="text-sm text-gray-500">Sales Rep: {quote.salesRep}</div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-bold text-xl text-gray-800">${quote.total?.toLocaleString()}</div>
                          <div className="text-sm text-gray-600">{quote.date}</div>
                        </div>
                      </div>

                      <div className="flex justify-between items-center">
                        <div className="text-sm text-gray-600">Expires: {quote.expiryDate}</div>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setSelectedQuote(quote)}
                            className="border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100"
                          >
                            <Eye size={14} className="mr-1" />
                            Review
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleQuoteAction(quote.id, "approve")}
                            className="border-green-200 bg-green-50 text-green-700 hover:bg-green-100"
                          >
                            <CheckCircle size={14} className="mr-1" />
                            Quick Approve
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 text-gray-500">
                  <Clock size={48} className="mx-auto mb-4 opacity-50" />
                  <p className="text-lg mb-2">No quotes pending review</p>
                  <p className="text-sm">All quotes have been processed</p>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {activeTab === "approved" && (
          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-gray-800">
                <CheckCircle size={20} className="text-green-500" />
                Approved Quotes
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              {approvedQuotes.length > 0 ? (
                <div className="space-y-4">
                  {approvedQuotes.map((quote) => (
                    <div
                      key={quote.id}
                      className="p-6 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-200 hover:shadow-md transition-all duration-200"
                    >
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex items-center space-x-4">
                          <div>
                            <div className="font-semibold text-gray-800 text-lg">Quote #{quote.quoteNumber}</div>
                            <div className="text-sm text-gray-600">{quote.customerName}</div>
                            <div className="text-sm text-gray-500">Sales Rep: {quote.salesRep}</div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-bold text-xl text-gray-800">${quote.total?.toLocaleString()}</div>
                          <div className="text-sm text-gray-600">{quote.date}</div>
                        </div>
                      </div>

                      <div className="flex justify-between items-center">
                        <div className="text-sm text-gray-600">Ready for contract conversion</div>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            className="border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100"
                          >
                            <Download size={14} className="mr-1" />
                            Download
                          </Button>
                          <Button
                            size="sm"
                            onClick={() => convertToContract(quote.id)}
                            className="bg-gradient-to-r from-green-600 to-green-700 text-white hover:from-green-700 hover:to-green-800"
                          >
                            <ArrowRight size={14} className="mr-1" />
                            Convert to Contract
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 text-gray-500">
                  <CheckCircle size={48} className="mx-auto mb-4 opacity-50" />
                  <p className="text-lg mb-2">No approved quotes</p>
                  <p className="text-sm">Approved quotes will appear here</p>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {activeTab === "contracts" && (
          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-gray-800">
                <Handshake size={20} className="text-blue-500" />
                Active Contracts
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              {activeContracts.length > 0 ? (
                <div className="space-y-4">
                  {activeContracts.map((contract) => (
                    <div
                      key={contract.id}
                      className="p-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200 hover:shadow-md transition-all duration-200"
                    >
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex items-center space-x-4">
                          <div>
                            <div className="font-semibold text-gray-800 text-lg">
                              Contract #{contract.contractNumber}
                            </div>
                            <div className="text-sm text-gray-600">{contract.customerName}</div>
                            <div className="text-sm text-gray-500">From Quote: {contract.quoteId}</div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-bold text-xl text-gray-800">${contract.value?.toLocaleString()}</div>
                          <div className="text-sm text-gray-600">Signed: {contract.signedDate}</div>
                          <Badge className="mt-2 bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100">
                            <Handshake size={12} className="mr-1 text-emerald-600" />
                            Active
                          </Badge>
                        </div>
                      </div>

                      <div className="flex justify-between items-center">
                        <div className="text-sm text-gray-600">
                          Duration: {contract.startDate} to {contract.endDate}
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            className="border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100"
                            onClick={() => {
                              const quote = quotes.find(q => q.id === contract.quoteId);
                              if (quote) {
                                console.log('Generating PDF for quote:', quote);
                                generateQuotePdf(quote);
                              } else {
                                console.error('Could not find quote for contract:', contract);
                                toast.error("Could not find the original quote details");
                              }
                            }}
                          >
                            <Download size={14} className="mr-1" />
                            Download Contract
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 text-gray-500">
                  <Handshake size={48} className="mx-auto mb-4 opacity-50" />
                  <p className="text-lg mb-2">No active contracts</p>
                  <p className="text-sm">Converted contracts will appear here</p>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Quote Review Modal */}
        {selectedQuote && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-gray-200">
                <div className="flex justify-between items-center">
                  <h2 className="text-2xl font-bold text-gray-800">Review Quote #{selectedQuote.quoteNumber}</h2>
                  <button
                    onClick={() => setSelectedQuote(null)}
                    className="p-1.5 rounded-full text-gray-500 hover:text-emerald-600 hover:bg-emerald-50 transition-colors duration-200"
                  >
                    <XCircle size={20} />
                  </button>
                </div>
              </div>

              <div className="p-6 space-y-6">
                {/* Quote Details */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="font-semibold text-gray-800 mb-3">Customer Information</h3>
                    <div className="space-y-2 text-sm text-gray-700">
                      <div>
                        <span className="font-medium text-gray-800">Company:</span> <span className="text-gray-700">{selectedQuote.customerName}</span>
                      </div>
                      <div>
                        <span className="font-medium text-gray-800">Sales Rep:</span> <span className="text-gray-700">{selectedQuote.salesRep}</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-semibold text-gray-800 mb-3">Quote Details</h3>
                    <div className="space-y-2 text-sm text-gray-700">
                      <div>
                        <span className="font-medium text-gray-800">Date:</span> <span className="text-gray-700">{selectedQuote.date}</span>
                      </div>
                      <div>
                        <span className="font-medium text-gray-800">Expires:</span> <span className="text-gray-700">{selectedQuote.expiryDate}</span>
                      </div>
                      <div>
                        <span className="font-medium text-gray-800">Status:</span> {getStatusBadge(selectedQuote.status)}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Line Items */}
                <div>
                  <h3 className="font-semibold text-gray-800 mb-3">Line Items</h3>
                  <div className="bg-gray-50 rounded-lg p-4">
                    {selectedQuote.lineItems.map((item) => (
                      <div
                        key={item.id}
                        className="flex justify-between items-center py-2 border-b border-gray-200 last:border-b-0"
                      >
                        <div className="flex-1">
                          <div className="font-medium text-gray-800">{item.description}</div>
                          <div className="text-sm text-gray-600">
                            Qty: {item.quantity} × ${item.unitPrice}
                          </div>
                        </div>
                        <div className="font-semibold text-gray-800">${item.total.toFixed(2)}</div>
                      </div>
                    ))}
                    <div className="mt-4 pt-4 border-t border-gray-300">
                      <div className="space-y-2 text-sm text-gray-700">
                      <div className="flex justify-between">
                        <span className="font-medium text-gray-800">Subtotal:</span>
                        <span className="text-gray-700">${selectedQuote.subtotal.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-medium text-gray-800">Tax ({selectedQuote.taxRate}%):</span>
                        <span className="text-gray-700">${selectedQuote.taxAmount.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-lg font-bold mt-2 border-t border-gray-300 pt-2">
                        <span className="text-gray-800">Total:</span>
                        <span className="text-gray-800 font-semibold">${selectedQuote.total.toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                  </div>
                </div>

                {/* Terms and Notes */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="font-semibold text-gray-800 mb-3">Terms & Conditions</h3>
                    <div className="bg-gray-50 rounded-lg p-4 text-sm text-gray-800 border border-gray-200">{selectedQuote.terms}</div>
                  </div>

                  <div>
                    <h3 className="font-semibold text-gray-800 mb-3">Internal Notes</h3>
                    <div className="bg-gray-50 rounded-lg p-4 text-sm text-gray-800 border border-gray-200">
                      <span className="text-gray-700">{selectedQuote.notes || "No internal notes"}</span>
                    </div>
                  </div>
                </div>

                {/* Review Notes */}
                <div>
                  <h3 className="font-semibold text-gray-800 mb-3">Review Notes</h3>
                  <textarea
                    value={reviewNotes}
                    onChange={(e) => setReviewNotes(e.target.value)}
                    placeholder="Add your review notes here..."
                    className="w-full p-3 rounded-lg border border-gray-300 bg-white text-gray-800 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none h-24"
                  />
                </div>

                {/* Action Buttons */}
                <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                  <Button
                    variant="outline"
                    onClick={() => handleQuoteAction(selectedQuote.id, "request_changes")}
                    className="border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100"
                  >
                    <AlertCircle size={16} className="mr-2" />
                    Request Changes
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => handleQuoteAction(selectedQuote.id, "reject")}
                    className="border-red-200 bg-red-50 text-red-700 hover:bg-red-100"
                  >
                    <XCircle size={16} className="mr-2" />
                    Reject
                  </Button>
                  <Button
                    onClick={() => handleQuoteAction(selectedQuote.id, "approve")}
                    className="bg-gradient-to-r from-green-600 to-green-700 text-white hover:from-green-700 hover:to-green-800"
                  >
                    <CheckCircle size={16} className="mr-2" />
                    Approve Quote
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default QuotesManagement
