import React, { useState } from "react";
import { 
  FileText, 
  PlusCircle, 
  User, 
  Calendar, 
  FileSignature, 
  LogOut, 
  Users,
  DollarSign,
  TrendingUp,
  Calculator,
  Package,
  Trash2,
  Mail,
  Phone,
  MapPin,
  Receipt,
  Download,
  Send,
  Eye,
  Edit,
  Filter,
  Search,
  CheckCircle,
  Clock,
  XCircle,
  AlertCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import QuoteTracking from "@/components/QuoteTracking";

interface Quote {
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
  status: 'draft' | 'pending' | 'sent' | 'approved' | 'rejected';
}

interface LineItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

interface Customer {
  id: string;
  name: string;
  company: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  status: string;
  totalQuotes: number;
  totalValue: number;
  lastContact: string;
}

interface SalesDashboardProps {
  username: string;
  userType: 'customer' | 'admin' | 'staff' | 'sales';
  onLogout: () => void;
}

const SalesDashboard: React.FC<SalesDashboardProps> = ({
  username = "Demo User",
  userType = "admin",
  onLogout = () => {},
}) => {
  const [activeTab, setActiveTab] = useState("overview");
  const [statusFilter, setStatusFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  
  const [currentQuote, setCurrentQuote] = useState<Partial<Quote>>({
    customerId: "",
    customerName: "",
    quoteNumber: `Q-${String(Date.now()).slice(-6)}`,
    date: new Date().toISOString().split("T")[0],
    expiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
    lineItems: [],
    subtotal: 0,
    taxRate: 8.5,
    taxAmount: 0,
    total: 0,
    terms: "Payment due within 30 days of invoice date. Late payments may be subject to 1.5% monthly service charge.",
    notes: "",
    status: "draft",
  });

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
          total: 1500
        }
      ],
      subtotal: 1500,
      taxRate: 8.5,
      taxAmount: 127.5,
      total: 1627.5,
      terms: "Payment due within 30 days of invoice date.",
      notes: "Initial consultation package",
      status: "sent"
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
          total: 5000
        }
      ],
      subtotal: 5000,
      taxRate: 8.5,
      taxAmount: 425,
      total: 5425,
      terms: "50% upfront, 50% on completion",
      notes: "Custom software solution",
      status: "approved"
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
          total: 2500
        }
      ],
      subtotal: 2500,
      taxRate: 8.5,
      taxAmount: 212.5,
      total: 2712.5,
      terms: "Payment due within 15 days",
      notes: "Q1 campaign setup",
      status: "draft"
    }
  ]);
  
  const [customers] = useState<Customer[]>([
    {
      id: "C-001",
      name: "John Smith",
      company: "Acme Corporation",
      email: "john.smith@acme.com",
      phone: "(555) 123-4567",
      address: "123 Business Ave",
      city: "New York",
      state: "NY",
      zipCode: "10001",
      status: "active",
      totalQuotes: 8,
      totalValue: 45600,
      lastContact: "2024-01-15",
    },
    {
      id: "C-002",
      name: "Sarah Johnson",
      company: "Tech Solutions Inc",
      email: "sarah@techsolutions.com",
      phone: "(555) 987-6543",
      address: "456 Innovation Blvd",
      city: "San Francisco",
      state: "CA",
      zipCode: "94105",
      status: "active",
      totalQuotes: 5,
      totalValue: 28900,
      lastContact: "2024-01-14",
    },
    {
      id: "C-003",
      name: "Michael Brown",
      company: "Global Enterprises",
      email: "m.brown@global.com",
      phone: "(555) 456-7890",
      address: "789 Corporate Dr",
      city: "Chicago",
      state: "IL",
      zipCode: "60601",
      status: "prospect",
      totalQuotes: 2,
      totalValue: 15600,
      lastContact: "2024-01-13",
    },
  ]);

  const handleLogout = () => {
    onLogout();
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, string> = {
      draft: "outline bg-emerald-50 text-emerald-700 border-emerald-200",
      pending: "bg-emerald-100 text-emerald-800 border-emerald-200",
      sent: "bg-emerald-100 text-emerald-800 border-emerald-200", 
      approved: "bg-emerald-600 text-white border-emerald-700",
      rejected: "bg-red-50 text-red-700 border-red-200"
    };
    
    const icons: Record<string, React.ReactNode> = {
      draft: <Edit size={12} className="mr-1 text-emerald-600" />,
      pending: <Clock size={12} className="mr-1 text-emerald-600" />,
      sent: <Send size={12} className="mr-1 text-emerald-600" />,
      approved: <CheckCircle size={12} className="mr-1 text-white" />,
      rejected: <XCircle size={12} className="mr-1 text-red-600" />
    };
    
    return (
      <Badge variant="outline" className={`flex items-center ${variants[status] || ''}`}>
        {icons[status]}
        {status?.charAt(0).toUpperCase() + status?.slice(1)}
      </Badge>
    );
  };

  const getStatusIcon = (status: string) => {
    const iconMap: Record<string, React.ReactNode> = {
      draft: <Edit size={16} className="text-emerald-700" />,
      pending: <Clock size={16} className="text-emerald-700" />,
      sent: <Send size={16} className="text-emerald-600" />,
      approved: <CheckCircle size={16} className="text-emerald-700" />,
      rejected: <XCircle size={16} className="text-red-600" />
    };
    return iconMap[status] || <AlertCircle size={16} className="text-gray-400" />;
  };

  const calculateLineItemTotal = (quantity: number, unitPrice: number) => {
    return quantity * unitPrice;
  };

  const calculateQuoteTotals = (lineItems: LineItem[], taxRate: number) => {
    const subtotal = lineItems.reduce((sum, item) => sum + item.total, 0);
    const taxAmount = (subtotal * taxRate) / 100;
    const total = subtotal + taxAmount;
    return { subtotal, taxAmount, total };
  };

  const addLineItem = () => {
    const newItem: LineItem = {
      id: `item-${Date.now()}`,
      description: "",
      quantity: 1,
      unitPrice: 0,
      total: 0,
    };
    setCurrentQuote({
      ...currentQuote,
      lineItems: [...(currentQuote.lineItems || []), newItem],
    });
  };

  const updateLineItem = (itemId: string, field: keyof LineItem, value: string | number) => {
    const updatedItems = (currentQuote.lineItems || []).map((item) => {
      if (item.id === itemId) {
        const updatedItem = { ...item, [field]: value };
        if (field === "quantity" || field === "unitPrice") {
          updatedItem.total = calculateLineItemTotal(updatedItem.quantity, updatedItem.unitPrice);
        }
        return updatedItem;
      }
      return item;
    });

    const { subtotal, taxAmount, total } = calculateQuoteTotals(updatedItems, currentQuote.taxRate || 8.5);

    setCurrentQuote({
      ...currentQuote,
      lineItems: updatedItems,
      subtotal,
      taxAmount,
      total,
    });
  };

  const removeLineItem = (itemId: string) => {
    const updatedItems = (currentQuote.lineItems || []).filter((item) => item.id !== itemId);
    const { subtotal, taxAmount, total } = calculateQuoteTotals(updatedItems, currentQuote.taxRate || 8.5);

    setCurrentQuote({
      ...currentQuote,
      lineItems: updatedItems,
      subtotal,
      taxAmount,
      total,
    });
  };

  const handleCustomerSelect = (customerId: string) => {
    const customer = customers.find((c) => c.id === customerId);
    if (customer) {
      setCurrentQuote({
        ...currentQuote,
        customerId,
        customerName: customer.company,
      });
    }
  };

  const saveQuote = () => {
    if (currentQuote.customerId && currentQuote.lineItems && currentQuote.lineItems.length > 0) {
      const quote: Quote = {
        ...currentQuote,
        id: `Q-${String(quotes.length + 4).padStart(3, "0")}`,
      } as Quote;

      setQuotes([...quotes, quote]);

      // Reset form
      setCurrentQuote({
        customerId: "",
        customerName: "",
        quoteNumber: `Q-${String(Date.now()).slice(-6)}`,
        date: new Date().toISOString().split("T")[0],
        expiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
        lineItems: [],
        subtotal: 0,
        taxRate: 8.5,
        taxAmount: 0,
        total: 0,
        terms: "Payment due within 30 days of invoice date. Late payments may be subject to 1.5% monthly service charge.",
        notes: "",
        status: "draft",
      });

      setActiveTab("overview");
      toast.success("Quote created successfully!");
    } else {
      toast.error("Please select a customer and add at least one line item");
    }
  };

  const updateQuoteStatus = (quoteId: string, newStatus: Quote['status']) => {
    setQuotes(quotes.map(quote => 
      quote.id === quoteId 
        ? { ...quote, status: newStatus }
        : quote
    ));
    toast.success(`Quote status updated to ${newStatus}`);
  };

  const filteredQuotes = quotes.filter(quote => {
    const matchesStatus = statusFilter === "all" || quote.status === statusFilter;
    const matchesSearch = quote.quoteNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         quote.customerName.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  return (
    <div className="flex h-screen bg-white">
      {/* Side Navigation */}
      <div className="fixed inset-y-0 left-0 z-50 w-64 bg-gradient-to-b from-emerald-900 to-emerald-800 shadow-xl flex flex-col">
        <div className="px-6 py-6 border-b border-emerald-700">
          <h1 className="text-xl font-bold text-white">Sales Dashboard</h1>
          <p className="text-sm text-emerald-200 mt-1">Welcome, {username}</p>
        </div>

        <nav className="flex-1 px-4 py-4 overflow-y-auto">
          <ul className="space-y-2">
            <li>
              <button 
                onClick={() => setActiveTab("overview")}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all duration-200 ${
                  activeTab === "overview" 
                    ? "bg-emerald-700 text-white shadow-lg" 
                    : "text-emerald-100 hover:bg-emerald-800/50 hover:text-white"
                }`}
              >
                <TrendingUp size={20} className="flex-shrink-0" />
                <span>Overview</span>
              </button>
            </li>
            <li>
              <button 
                onClick={() => setActiveTab("create-quote")}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all duration-200 ${
                  activeTab === "create-quote" 
                    ? "bg-emerald-700 text-white shadow-lg" 
                    : "text-emerald-100 hover:bg-emerald-800/50 hover:text-white"
                }`}
              >
                <PlusCircle size={20} className="flex-shrink-0" />
                <span>Create Quote</span>
              </button>
            </li>
            <li>
              <button 
                onClick={() => setActiveTab("quote-tracking")}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all duration-200 ${
                  activeTab === "quote-tracking" 
                    ? "bg-emerald-700 text-white shadow-lg" 
                    : "text-emerald-100 hover:bg-emerald-800/50 hover:text-white"
                }`}
              >
                <FileText size={20} className="flex-shrink-0" />
                <span>Quote Tracking</span>
              </button>
            </li>
          </ul>
        </nav>

        <div className="p-4 border-t border-emerald-700">
          <Button 
            onClick={handleLogout} 
            variant="ghost" 
            className="w-full text-emerald-100 hover:bg-emerald-800 hover:text-white transition-colors"
          >
            <LogOut size={16} className="mr-2" />
            Sign Out
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-1 ml-64 overflow-y-auto h-screen">
        <div className="p-6 max-w-7xl mx-auto">
          {activeTab === "overview" && (
            <>
              <div className="mb-8">
                <h2 className="text-3xl font-bold text-gray-800">Sales Overview</h2>
                <p className="text-gray-600 mt-1">Monitor your sales performance and quote analytics</p>
              </div>

              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
                  <CardContent className="p-6">
                    <div className="flex items-center">
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center text-white shadow-lg mr-4">
                        <Users size={20} />
                      </div>
                      <div>
                        <div className="text-sm font-medium text-gray-600">Total Customers</div>
                        <div className="text-2xl font-bold text-gray-800">
                          {customers.length}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
                  <CardContent className="p-6">
                    <div className="flex items-center">
                      <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl flex items-center justify-center text-white shadow-lg mr-4">
                        <FileText size={20} />
                      </div>
                      <div>
                        <div className="text-sm font-medium text-gray-600">Total Quotes</div>
                        <div className="text-2xl font-bold text-gray-800">
                          {quotes.length}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
                  <CardContent className="p-6">
                    <div className="flex items-center">
                      <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-amber-600 rounded-xl flex items-center justify-center text-white shadow-lg mr-4">
                        <Clock size={20} />
                      </div>
                      <div>
                        <div className="text-sm font-medium text-gray-600">Pending</div>
                        <div className="text-2xl font-bold text-gray-800">
                          {quotes.filter((q) => q.status === "pending" || q.status === "sent").length}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
                  <CardContent className="p-6">
                    <div className="flex items-center">
                      <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center text-white shadow-lg mr-4">
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

              {/* Recent Quotes */}
              <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <div>
                      <CardTitle className="flex items-center gap-2 text-gray-800">
                        <FileText size={20} />
                        Recent Quotes
                      </CardTitle>
                      <p className="text-sm text-gray-600 mt-1">Manage and track your quotes</p>
                    </div>
                    <Button 
                      onClick={() => setActiveTab("create-quote")} 
                      className="bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white shadow-lg"
                    >
                      <PlusCircle size={16} className="mr-2" />
                      New Quote
                    </Button>
                  </div>
                </CardHeader>

                <CardContent className="p-6">
                  {quotes.length > 0 ? (
                    <div className="space-y-4">
                      {quotes.slice(0, 5).map((quote) => (
                        <div key={quote.id} className="flex justify-between items-center p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl border border-gray-200 hover:shadow-md transition-all duration-200">
                          <div className="flex items-center space-x-4">
                            <div className="flex-shrink-0">
                              {getStatusIcon(quote.status)}
                            </div>
                            <div>
                              <div className="font-semibold text-gray-800">Quote #{quote.quoteNumber}</div>
                              <div className="text-sm text-gray-600">{quote.customerName}</div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="font-semibold text-gray-800">${quote.total?.toLocaleString()}</div>
                            <div className="text-sm text-gray-600">{quote.date}</div>
                          </div>
                          <div className="flex items-center gap-2">
                            {getStatusBadge(quote.status || "draft")}
                            <Button variant="outline" size="sm" className="border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 hover:text-emerald-800">
                              <Eye size={14} />
                            </Button>
                            <Button variant="outline" size="sm" className="border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 hover:text-emerald-800">
                              <Download size={14} />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12 text-gray-500">
                      <FileText size={48} className="mx-auto mb-4 opacity-50" />
                      <p className="text-lg mb-2">No quotes created yet</p>
                      <p className="text-sm">Create your first quote to get started</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </>
          )}

          {activeTab === "quote-tracking" && (
            <QuoteTracking quotes={quotes} onUpdateQuoteStatus={updateQuoteStatus} />
          )}

          {activeTab === "create-quote" && (
            <>
              <div className="mb-8">
                <h2 className="text-3xl font-bold text-gray-800">Create New Quote</h2>
                <p className="text-gray-600">Generate professional quotes for your customers</p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                  {/* Customer Selection */}
                  <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
                    <CardHeader className="bg-emerald-50/80 border-b border-emerald-100">
                      <CardTitle className="flex items-center gap-2 text-gray-700">
                        <Users size={20} className="text-emerald-600" />
                        <span className="text-gray-800">Customer Selection</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-6">
                      <div className="space-y-2">
                        <Label className="text-sm font-medium text-gray-700">Customer *</Label>
                        <select
                          value={currentQuote.customerId}
                          onChange={(e) => handleCustomerSelect(e.target.value)}
                          className="w-full p-3 rounded-lg border border-gray-300 bg-white text-gray-800 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                        >
                          <option value="">Select a customer</option>
                          {customers.map((customer) => (
                            <option key={customer.id} value={customer.id}>
                              {customer.company} - {customer.name}
                            </option>
                          ))}
                        </select>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Quote Details */}
                  <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
                    <CardHeader className="bg-emerald-50/80 border-b border-emerald-100">
                      <CardTitle className="flex items-center gap-2 text-gray-700">
                        <FileText size={20} className="text-emerald-600" />
                        <span className="text-gray-800">Quote Information</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label className="text-sm font-medium text-gray-800">Quote Number</Label>
                          <Input
                            className="bg-white border-gray-300 text-gray-800"
                            value={currentQuote.quoteNumber}
                            onChange={(e) => setCurrentQuote({ ...currentQuote, quoteNumber: e.target.value })}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-sm font-medium text-gray-800">Quote Date</Label>
                          <Input
                            className="bg-white border-gray-300 text-gray-800"
                            type="date"
                            value={currentQuote.date}
                            onChange={(e) => setCurrentQuote({ ...currentQuote, date: e.target.value })}
                          />
                        </div>
                      </div>
                      <div className="space-y-2 mt-4">
                        <Label className="text-sm font-medium text-gray-800">Expiry Date</Label>
                        <Input
                          className="bg-white border-gray-300 text-gray-800"
                          type="date"
                          value={currentQuote.expiryDate}
                          onChange={(e) => setCurrentQuote({ ...currentQuote, expiryDate: e.target.value })}
                        />
                      </div>
                    </CardContent>
                  </Card>

                  {/* Line Items */}
                  <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
                    <CardHeader className="bg-emerald-50/80 border-b border-emerald-100">
                      <div className="flex justify-between items-center">
                        <CardTitle className="flex items-center gap-2 text-gray-700">
                          <Package size={20} className="text-emerald-600" />
                          <span className="text-gray-800">Line Items</span>
                        </CardTitle>
                        <Button 
                          onClick={addLineItem} 
                          className="bg-gradient-to-r from-emerald-600 to-emerald-700 text-white hover:from-emerald-700 hover:to-emerald-800 shadow-lg"
                        >
                          <PlusCircle size={16} className="mr-2" />
                          Add Item
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent className="p-6">
                      {currentQuote.lineItems && currentQuote.lineItems.length > 0 ? (
                        <div className="space-y-4">
                          {currentQuote.lineItems.map((item) => (
                            <div key={item.id} className="grid grid-cols-1 md:grid-cols-5 gap-4 p-4 bg-emerald-50/50 rounded-lg border border-emerald-100">
                              <div className="md:col-span-2 space-y-2">
                                <Label className="text-sm font-medium text-gray-700">Description</Label>
                                <textarea
                                  value={item.description}
                                  onChange={(e) => updateLineItem(item.id, "description", e.target.value)}
                                  placeholder="Product or service description"
                                  className="w-full p-2 rounded border border-gray-300 bg-white text-gray-800 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 resize-none h-20"
                                />
                              </div>
                              <div className="space-y-2">
                                <Label className="text-sm font-medium text-gray-700">Quantity</Label>
                                <Input
                                  type="number"
                                  value={item.quantity}
                                  onChange={(e) => updateLineItem(item.id, "quantity", parseFloat(e.target.value) || 0)}
                                  min="0"
                                  step="0.01"
                                  className="bg-white border-gray-300 text-gray-800 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                                />
                              </div>
                              <div className="space-y-2">
                                <Label className="text-sm font-medium text-gray-700">Unit Price</Label>
                                <Input
                                  type="number"
                                  value={item.unitPrice}
                                  onChange={(e) => updateLineItem(item.id, "unitPrice", parseFloat(e.target.value) || 0)}
                                  min="0"
                                  step="0.01"
                                  className="bg-white border-gray-300 text-gray-800 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                                />
                              </div>
                              <div className="flex items-end justify-between">
                                <div>
                                  <Label className="text-sm font-medium text-gray-700">Total</Label>
                                  <div className="text-lg font-semibold text-emerald-600 py-2">
                                    ${item.total.toFixed(2)}
                                  </div>
                                </div>
                                <Button
                                  onClick={() => removeLineItem(item.id)}
                                  variant="ghost"
                                  size="sm"
                                  className="text-red-500 hover:bg-red-50 hover:text-red-700"
                                >
                                  <Trash2 size={16} />
                                </Button>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-12 text-gray-400">
                          <Package size={48} className="mx-auto mb-4 opacity-50" />
                          <p className="text-lg mb-2 text-gray-500">No line items added yet</p>
                          <p className="text-sm text-gray-500">Click "Add Item" to get started</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  {/* Terms and Notes */}
                  <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
                    <CardHeader className="bg-emerald-50/80 border-b border-emerald-100">
                      <CardTitle className="flex items-center gap-2 text-gray-700">
                        <Receipt size={20} className="text-emerald-600" />
                        <span className="text-gray-800">Terms & Notes</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-6 space-y-4">
                      <div className="space-y-2">
                        <Label className="text-sm font-medium text-gray-700">Terms & Conditions</Label>
                        <textarea
                          value={currentQuote.terms}
                          onChange={(e) => setCurrentQuote({ ...currentQuote, terms: e.target.value })}
                          className="w-full p-3 rounded border border-gray-300 bg-white text-gray-800 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 resize-none h-24"
                          placeholder="Payment terms, delivery terms, etc."
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-sm font-medium text-gray-700">Internal Notes</Label>
                        <textarea
                          value={currentQuote.notes}
                          onChange={(e) => setCurrentQuote({ ...currentQuote, notes: e.target.value })}
                          placeholder="Internal notes (not visible to customer)"
                          className="w-full p-3 rounded border border-gray-300 bg-white text-gray-800 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 resize-none h-20"
                        />
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Quote Summary Sidebar */}
                <div className="space-y-6">
                  {/* Quote Summary */}
                  <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
                    <CardHeader className="bg-emerald-50/80 border-b border-emerald-100">
                      <CardTitle className="flex items-center gap-2 text-gray-700">
                        <Calculator size={20} className="text-emerald-600" />
                        <span className="text-gray-800">Quote Summary</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-6 space-y-3">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Subtotal:</span>
                        <span className="font-medium text-gray-800">${(currentQuote.subtotal || 0).toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Tax Rate:</span>
                        <div className="flex items-center gap-2">
                          <Input
                            type="number"
                            value={currentQuote.taxRate}
                            onChange={(e) => {
                              const taxRate = parseFloat(e.target.value) || 0;
                              const { subtotal, taxAmount, total } = calculateQuoteTotals(
                                currentQuote.lineItems || [],
                                taxRate,
                              );
                              setCurrentQuote({ ...currentQuote, taxRate, taxAmount, total });
                            }}
                            className="w-20 text-right text-sm bg-white text-gray-800 border-gray-300 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                            min="0"
                            step="0.1"
                          />
                          <span className="text-gray-500">%</span>
                        </div>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Tax Amount:</span>
                        <span className="font-medium text-gray-800">${(currentQuote.taxAmount || 0).toFixed(2)}</span>
                      </div>
                      <div className="border-t border-gray-200 pt-3 mt-2">
                        <div className="flex justify-between text-lg font-bold">
                          <span className="text-gray-800">Total:</span>
                          <span className="text-emerald-600">
                            ${(currentQuote.total || 0).toFixed(2)}
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Customer Info */}
                  {currentQuote.customerId && (
                    <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
                      <CardHeader className="bg-emerald-50/80 border-b border-emerald-100">
                        <CardTitle className="flex items-center gap-2 text-gray-700">
                          <Users size={20} className="text-emerald-600" />
                          Customer Information
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="p-6">
                        {(() => {
                          const customer = customers.find((c) => c.id === currentQuote.customerId);
                          return customer ? (
                            <div className="space-y-3 text-sm">
                              <div className="font-medium text-gray-800">{customer.company}</div>
                              <div className="text-gray-600">{customer.name}</div>
                              <div className="flex items-center text-gray-600">
                                <Mail size={14} className="mr-2" />
                                {customer.email}
                              </div>
                              <div className="flex items-center text-gray-600">
                                <Phone size={14} className="mr-2" />
                                {customer.phone}
                              </div>
                              <div className="flex items-start text-gray-600">
                                <MapPin size={14} className="mr-2 mt-0.5" />
                                <div>
                                  {customer.address}<br />
                                  {customer.city}, {customer.state} {customer.zipCode}
                                </div>
                              </div>
                            </div>
                          ) : null;
                        })()}
                      </CardContent>
                    </Card>
                  )}

                  {/* Actions */}
                  <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
                    <CardHeader className="bg-emerald-50/80 border-b border-emerald-100">
                      <CardTitle className="flex items-center gap-2 text-gray-700">
                        <FileText size={20} className="text-emerald-600" />
                        <span className="text-gray-800">Actions</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-6 space-y-3">
                      <Button
                        onClick={saveQuote}
                        disabled={!currentQuote.customerId || !currentQuote.lineItems || currentQuote.lineItems.length === 0}
                        className="w-full bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white shadow-lg"
                      >
                        <FileText size={16} className="mr-2" />
                        Save Quote
                      </Button>
                      <Button
                        className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-lg"
                        disabled={!currentQuote.customerId || !currentQuote.lineItems || currentQuote.lineItems.length === 0}
                      >
                        <Download size={16} className="mr-2" />
                        Download PDF
                      </Button>
                      <Button
                        className="w-full bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white shadow-lg"
                        disabled={!currentQuote.customerId || !currentQuote.lineItems || currentQuote.lineItems.length === 0}
                        onClick={() => {
                          if (currentQuote.customerId && currentQuote.lineItems && currentQuote.lineItems.length > 0) {
                            toast.success("Quote sent to admin for approval!");
                          }
                        }}
                      >
                        <Send size={16} className="mr-2" />
                        Send to Admin
                      </Button>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
};

const Index = () => {
  const [userType, setUserType] = useState<'customer' | 'admin' | 'staff'>('admin');
  const [isLoggedIn, setIsLoggedIn] = useState(true);

  // Demo function to switch user types - in real app this would be determined by authentication
  const switchUserType = (type: 'customer' | 'admin' | 'staff') => {
    setUserType(type);
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    console.log("Logged out");
  };

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-green-100 flex items-center justify-center">
        <Card className="w-96 bg-white/80 backdrop-blur-sm border-0 shadow-xl">
          <CardContent className="p-8 text-center">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Demo Login</h2>
            <p className="text-gray-600 mb-6">Choose your user type to continue</p>
            <div className="space-y-3">
              <Button 
                onClick={() => {
                  setUserType('admin');
                  setIsLoggedIn(true);
                }}
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white"
              >
                Login as Sales Admin
              </Button>
              <Button 
                onClick={() => {
                  setUserType('customer');
                  setIsLoggedIn(true);
                }}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white"
              >
                Login as Customer
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }
}

export default SalesDashboard;