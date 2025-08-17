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
  Send
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

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
  userType: 'customer' | 'admin' | 'staff';
  onLogout: () => void;
}

const SalesDashboard: React.FC<SalesDashboardProps> = ({
  username,
  userType,
  onLogout,
}) => {
  const [activeTab, setActiveTab] = useState("overview");
  
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

  const [quotes, setQuotes] = useState<Quote[]>([]);
  
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
    window.location.href = '/';
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      draft: "outline",
      pending: "secondary",
      sent: "secondary", 
      approved: "default",
      rejected: "destructive"
    };
    
    return (
      <Badge variant={variants[status] || "outline"}>
        {status?.charAt(0).toUpperCase() + status?.slice(1)}
      </Badge>
    );
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
        id: `Q-${String(quotes.length + 1).padStart(3, "0")}`,
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

  return (
    <div className="min-h-screen flex bg-gray-50">
      {/* Side Navigation */}
      <aside className="w-64 bg-emerald-800 text-white border-r border-gray-200 shadow-md flex flex-col">
        <div className="px-6 py-6">
          <h1 className="text-xl font-bold">Sales Dashboard</h1>
          <p className="text-sm text-=white-500">Welcome</p>
        </div>

        <nav className="p-4">
          <ul className="space-y-2 ">
            <li>
              <button 
                onClick={() => setActiveTab("overview")}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-all ${
                  activeTab === "overview" 
                    ? "bg-gradient-primary text-white shadow-lg" 
                    : "text-foreground hover:bg-accent/50"
                }`}
              >
                <TrendingUp size={20} />
                <span>Overview</span>
              </button>
            </li>
            <li>
              <button 
                onClick={() => setActiveTab("create-quote")}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-all ${
                  activeTab === "create-quote" 
                    ? "bg-gradient-primary text-white shadow-lg" 
                    : "text-foreground hover:bg-accent/50"
                }`}
              >
                <PlusCircle size={20} />
                <span>Create Quote</span>
              </button>
            </li>
          </ul>
        </nav>

        <div className="absolute bottom-4 left-4 right-4">
          <Button variant="outline" onClick={handleLogout} className=" border-emerald-600 bg-emerald-800" >
            <LogOut size={16} />
            Sign Out
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-hidden">
        <div className="h-full overflow-y-auto p-6 max-w-7xl mx-auto">
          {activeTab === "overview" && (
            <>
              <div className="mb-8">
                <h2 className="text-3xl font-bold text-gray-800">Sales Overview</h2>
            
              </div>

              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <Card className="bg-white border-emerald-600">
                  <CardContent className="p-6 ">
                    <div className="flex items-center">
                      <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center text-white shadow-lg mr-4">
                        <Users size={16} />
                      </div>
                      <div>
                        <div className="text-sm font-medium  text-gray-600">Total Customers</div>
                        <div className="text-xl font-bold from-emerald-600 to-emerald-700 bg-clip-text text-gray-600">
                          {customers.length}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-white border-emerald-600">
                  <CardContent className="p-6">
                    <div className="flex items-center">
                      <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-green-600 rounded-lg flex items-center justify-center text-white shadow-lg mr-4">
                        <FileText size={16} />
                      </div>
                      <div>
                        <div className="text-sm font-medium text-gray-600">Total Quotes</div>
                        <div className="text-xl font-bold  bg-clip-text text-gray-600">
                          {quotes.length}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-white border-emerald-600">
                  <CardContent className="p-6">
                    <div className="flex items-center">
                      <div className="w-8 h-8 bg-gradient-to-br from-amber-500 to-amber-600 rounded-lg flex items-center justify-center text-white shadow-lg mr-4">
                        <Calculator size={16} />
                      </div>
                      <div>
                        <div className="text-sm font-medium text-gray-600">Pending</div>
                        <div className="text-xl font-bold bg-gradient-to-r from-amber-600 to-amber-700 bg-clip-text text-transparent">
                          {quotes.filter((q) => q.status === "pending").length}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-white border-emerald-600">
                  <CardContent className="p-6">
                    <div className="flex items-center">
                      <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg flex items-center justify-center text-white shadow-lg mr-4">
                        <DollarSign size={16} />
                      </div>
                      <div>
                        <div className="text-sm font-medium text-gray-600">Total Value</div>
                        <div className="text-xl font-bold text-gray-800">
                          ${quotes.reduce((sum, q) => sum + (q.total || 0), 0).toLocaleString()}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Recent Quotes */}
              <Card className="bg-white border-emerald-600">
                <CardHeader className=" border-emerald-600">
                  <div className="flex justify-between items-center">
                    <div>
                      <CardTitle className="flex items-center gap-2 text-gray-800">
                        <FileText size={20} />
                        Recent Quotes
                      </CardTitle>
                      <p className="text-sm text-gray-800 mt-1">Manage and track your quotes</p>
                    </div>
                    <Button onClick={() => setActiveTab("create-quote")} className="bg-emerald-600 hover:opacity-90">
                      <PlusCircle size={16} className="mr-2 text-white-800" />
                      New Quote
                    </Button>
                  </div>
                </CardHeader>

                <CardContent className="p-6">
                  {quotes.length > 0 ? (
                    <div className="space-y-3">
                      {quotes.map((quote) => (
                        <div key={quote.id} className="flex justify-between items-center p-4 bg-gradient-to-r from-card/60 to-accent/30 rounded-lg border border-border/30 backdrop-blur-sm">
                          <div>
                            <div className="font-medium text-foreground">Quote #{quote.quoteNumber}</div>
                            <div className="text-sm text-muted-foreground">{quote.customerName}</div>
                          </div>
                          <div className="text-right">
                            <div className="font-semibold text-foreground">${quote.total?.toLocaleString()}</div>
                            <div className="text-sm text-muted-foreground">{quote.date}</div>
                          </div>
                          <div className="flex items-center gap-2">
                            {getStatusBadge(quote.status || "draft")}
                            <Button variant="outline" size="sm">
                              <Download size={14} />
                            </Button>
                            <Button variant="outline" size="sm">
                              <Send size={14} />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12 text-muted-foreground">
                      <FileText size={48} className="mx-auto mb-4 border-emerald-600 opacity-50" />
                      <p className="text-lg mb-2 text-gray-800">No quotes created yet</p>
                      <p className="text-sm text-gray-800">Create your first quote to get started</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </>
          )}

          {activeTab === "create-quote" && (
            <>
              <div className="mb-8">
                <h2 className="text-3xl font-bold text-gray-800">Create New Quote</h2>
                <p className=" text-gray-600">Generate professional quotes for your customers</p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                  {/* Customer Selection */}
                  <Card className="bg-emerald-200">
                    <CardHeader className="bg-emerald-100 border-emerald-200">
                      <CardTitle className="flex items-center gap-2 text-gray-700">
                        <Users size={20} />
                        Customer Selection
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-6">
                      <div className="space-y-2">
                        <Label className="text-sm text-gray-800">Customer *</Label>
                        <select
                         
                          value={currentQuote.customerId}
                          onChange={(e) => handleCustomerSelect(e.target.value)}
                          className="w-full p-3 rounded-lg border-emerald-200  text-gray-800"
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
                  <Card className="bg-gradient-to-br from-green-50/80 to-green-100/60 border-green-200/50 backdrop-blur-sm">
                    <CardHeader className="bg-gradient-to-r from-green-50l">
                      <CardTitle className="flex items-center gap-2 text-green-700">
                        <FileText size={20} />
                        Quote Information
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-6 bg-white">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label className="text-sm font-medium  text-gray-800">Quote Number</Label>
                          <Input
                            className="bg-white border-gray-300 "
                            value={currentQuote.quoteNumber}
                            onChange={(e) => setCurrentQuote({ ...currentQuote, quoteNumber: e.target.value })}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-sm font-medium  text-gray-800">Quote Date</Label>
                          <Input
                             className="bg-white border-gray-300 "
                            type="date"
                            value={currentQuote.date}
                            onChange={(e) => setCurrentQuote({ ...currentQuote, date: e.target.value })}
                          />
                        </div>
                      </div>
                      <div className="space-y-2 mt-4">
                        <Label className="text-sm font-medium  text-gray-800">Expiry Date</Label>
                        <Input
                         className="bg-white border-gray-300 "
                          type="date"
                          value={currentQuote.expiryDate}
                          onChange={(e) => setCurrentQuote({ ...currentQuote, expiryDate: e.target.value })}
                        />
                      </div>
                    </CardContent>
                  </Card>

                  {/* Line Items */}
                  <Card className="bg-white border-gray ">
                    <CardHeader className="bg-white border-gray-200">
                      <div className="flex justify-between items-center">
                        <CardTitle className="flex items-center gap-2 text-gray-700">
                          <Package size={20} />
                          Line Items
                        </CardTitle>
                        <Button onClick={addLineItem} className="bg-gradient-primary text-gray-700 hover:opacity-90">
                          <PlusCircle size={16} className="mr-2 text-gray-700" />
                          Add Item
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent className="p-6">
                      {currentQuote.lineItems && currentQuote.lineItems.length > 0 ? (
                        <div className="space-y-4">
                          {currentQuote.lineItems.map((item) => (
                            <div key={item.id} className="grid grid-cols-1 md:grid-cols-5 gap-4 p-4 bg-gradient-to-r from-amber-50/50 to-amber-100/30 rounded-lg border border-amber-200/30">
                              <div className="md:col-span-2 space-y-2">
                                <Label className="text-sm font-medium text-foreground">Description</Label>
                                <textarea
                                  value={item.description}
                                  onChange={(e) => updateLineItem(item.id, "description", e.target.value)}
                                  placeholder="Product or service description"
                                  className="w-full p-2 rounded border border-border/50 bg-card/80 backdrop-blur-sm resize-none h-20"
                                />
                              </div>
                              <div className="space-y-2">
                                <Label className="text-sm font-medium text-foreground">Quantity</Label>
                                <Input
                                  type="number"
                                  value={item.quantity}
                                  onChange={(e) => updateLineItem(item.id, "quantity", parseFloat(e.target.value) || 0)}
                                  min="0"
                                  step="0.01"
                                />
                              </div>
                              <div className="space-y-2">
                                <Label className="text-sm font-medium text-foreground">Unit Price</Label>
                                <Input
                                  type="number"
                                  value={item.unitPrice}
                                  onChange={(e) => updateLineItem(item.id, "unitPrice", parseFloat(e.target.value) || 0)}
                                  min="0"
                                  step="0.01"
                                />
                              </div>
                              <div className="flex items-end justify-between">
                                <div>
                                  <Label className="text-sm font-medium text-foreground">Total</Label>
                                  <div className="text-lg font-semibold text-green-600 py-2">
                                    ${item.total.toFixed(2)}
                                  </div>
                                </div>
                                <Button
                                  onClick={() => removeLineItem(item.id)}
                                  variant="outline"
                                  size="sm"
                                  className="text-red-600 hover:bg-red-50"
                                >
                                  <Trash2 size={16} />
                                </Button>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-12 text-muted-foreground">
                          <Package size={48} className="mx-auto mb-4 opacity-50" />
                          <p className="text-lg mb-2">No line items added yet</p>
                          <p className="text-sm">Click "Add Item" to get started</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  {/* Terms and Notes */}
                  <Card className="bg-white">
                    <CardHeader className="bg-gradient-to-r from-purple-50/95 to-purple-100/80 backdrop-blur-xl">
                      <CardTitle className="flex items-center gap-2 text-purple-700">
                        <Receipt size={20} />
                        Terms & Notes
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-6 space-y-4 text-gray-800 bg-white">
                      <div className="space-y-2">
                        <Label className="text-sm font-medium text-gray-600">Terms & Conditions</Label>
                        <textarea
                          value={currentQuote.terms}
                          onChange={(e) => setCurrentQuote({ ...currentQuote, terms: e.target.value })}
                          className="w-full p-3 rounded border border-border/50 bg-card/80 backdrop-blur-sm resize-none h-24"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-sm font-medium text-foreground">Internal Notes</Label>
                        <textarea
                          value={currentQuote.notes}
                          onChange={(e) => setCurrentQuote({ ...currentQuote, notes: e.target.value })}
                          placeholder="Internal notes (not visible to customer)"
                          className="w-full p-3 rounded border border-border/50 bg-card/80 backdrop-blur-sm resize-none h-20"
                        />
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Quote Summary Sidebar */}
                <div className="space-y-6">
                  {/* Quote Summary */}
                  <Card className="bg-gradient-to-br from-indigo-50/80 to-indigo-100/60 border-indigo-200/50 backdrop-blur-sm">
                    <CardHeader className="bg-gradient-to-r from-indigo-50/95 to-indigo-100/80 backdrop-blur-xl">
                      <CardTitle className="flex items-center gap-2 text-indigo-700">
                        <Calculator size={20} />
                        Quote Summary
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-6 space-y-3">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Subtotal:</span>
                        <span className="font-medium">${(currentQuote.subtotal || 0).toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-muted-foreground">Tax Rate:</span>
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
                            className="w-20 text-right text-sm"
                            min="0"
                            step="0.1"
                          />
                          <span className="text-muted-foreground">%</span>
                        </div>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Tax Amount:</span>
                        <span className="font-medium">${(currentQuote.taxAmount || 0).toFixed(2)}</span>
                      </div>
                      <div className="border-t pt-3">
                        <div className="flex justify-between text-lg font-bold">
                          <span>Total:</span>
                          <span className="bg-gradient-to-r from-indigo-600 to-indigo-700 bg-clip-text text-transparent">
                            ${(currentQuote.total || 0).toFixed(2)}
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Customer Info */}
                  {currentQuote.customerId && (
                    <Card className="bg-gradient-to-br from-teal-50/80 to-teal-100/60 border-teal-200/50 backdrop-blur-sm">
                      <CardHeader className="bg-gradient-to-r from-teal-50/95 to-teal-100/80 backdrop-blur-xl">
                        <CardTitle className="flex items-center gap-2 text-teal-700">
                          <Users size={20} />
                          Customer Information
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="p-6">
                        {(() => {
                          const customer = customers.find((c) => c.id === currentQuote.customerId);
                          return customer ? (
                            <div className="space-y-3 text-sm">
                              <div className="font-medium text-foreground">{customer.company}</div>
                              <div className="text-muted-foreground">{customer.name}</div>
                              <div className="flex items-center text-muted-foreground">
                                <Mail size={14} className="mr-2" />
                                {customer.email}
                              </div>
                              <div className="flex items-center text-muted-foreground">
                                <Phone size={14} className="mr-2" />
                                {customer.phone}
                              </div>
                              <div className="flex items-start text-muted-foreground">
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
                  <Card className="bg-gradient-to-br from-rose-50/80 to-rose-100/60 border-rose-200/50 backdrop-blur-sm">
                    <CardHeader className="bg-gradient-to-r from-rose-50/95 to-rose-100/80 backdrop-blur-xl">
                      <CardTitle className="flex items-center gap-2 text-rose-700">
                        <FileText size={20} />
                        Actions
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-6 space-y-3">
                      <Button
                        onClick={saveQuote}
                        disabled={!currentQuote.customerId || !currentQuote.lineItems || currentQuote.lineItems.length === 0}
                        className="w-full bg-gradient-primary hover:opacity-90"
                      >
                        <FileText size={16} className="mr-2" />
                        Save Quote
                      </Button>
                      <Button
                        variant="outline"
                        className="w-full"
                        disabled={!currentQuote.customerId || !currentQuote.lineItems || currentQuote.lineItems.length === 0}
                      >
                        <Download size={16} className="mr-2" />
                        Download PDF
                      </Button>
                      <Button
                        variant="outline"
                        className="w-full"
                        disabled={!currentQuote.customerId || !currentQuote.lineItems || currentQuote.lineItems.length === 0}
                      >
                        <Send size={16} className="mr-2" />
                        Send to Customer
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

export default SalesDashboard;
