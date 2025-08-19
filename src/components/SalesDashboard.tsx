import React, { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from 'react-router-dom';
import quoteService, { Quote as QuoteType } from "@/services/quoteService";
import { userProfileService, UserProfile } from "@/services/userProfileService"; 
import { 
  Loader2, 
  Eye, 
  Download, 
  X,
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
  Send,
  Edit,
  Filter,
  Clock,
  XCircle,
  AlertCircle,
  CheckCircle,
  ShoppingCart,
  Pencil,
  Check
} from "lucide-react";

// Aliases for icons with naming conflicts
const PlusCircleIcon = PlusCircle;
const Trash2Icon = Trash2;
const XIcon = X;
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import QuoteTracking from "@/components/QuoteTracking";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";

interface Quote {
  id: string;
  _id?: string;
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
  status: 'draft' | 'sent' | 'accepted' | 'rejected' | 'expired';
  createdBy?: string;
  updatedAt?: string | Date;
}

// LineItem interface that matches the backend's LineItem type
interface LineItem {
  id?: string; // Optional since it might not be set when creating a new item
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

// Customer interface is now replaced by UserProfile from userProfileService

interface SalesDashboardProps {
  username: string;
  userType: 'customer' | 'admin' | 'staff' | 'sales';
  onLogout: () => void;
}

const SalesDashboard: React.FC<SalesDashboardProps> = ({
  username = "Demo User",
  userType = "admin",
  onLogout = () => { },
}) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("overview");
  const [customers, setCustomers] = useState<UserProfile[]>([]);
  const [services, setServices] = useState<any[]>([]);
  const [selectedServices, setSelectedServices] = useState<Array<{service: any, products: any[]}>>([]);
  const [currentService, setCurrentService] = useState<any>(null);
  const [selectedProducts, setSelectedProducts] = useState<any[]>([]);
  const [filters, setFilters] = useState<any>({});
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [selectedQuote, setSelectedQuote] = useState<Quote | null>(null);
  const [showQuoteModal, setShowQuoteModal] = useState(false);
  const [currentQuote, setCurrentQuote] = useState<Partial<Quote>>({
    id: `quote-${Date.now()}`,
    customerId: '',
    customerName: '',
    quoteNumber: `QT-${Math.floor(1000 + Math.random() * 9000)}`,
    date: new Date().toISOString().split('T')[0],
    expiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    lineItems: [],
    status: 'draft',
    subtotal: 0,
    taxRate: 0,
    taxAmount: 0,
    total: 0,
    notes: '',
    terms: 'Payment due within 30 days'
  });

  // Fetch quotes from the backend
  const fetchQuotes = async () => {
    if (!user) return;
    
    try {
      setIsLoading(true);
      setError(null);
      const queryParams: any = { ...filters };
      if (statusFilter && statusFilter !== 'all') {
        queryParams.status = statusFilter as Quote['status'];
      }
      if (searchTerm) queryParams.customerName = searchTerm;
      
      const data = await quoteService.getQuotes(queryParams);
      
      // Map _id to id for compatibility with the frontend
      const formattedQuotes = data.map((quote: any) => ({
        ...quote,
        id: quote._id || quote.id,
        date: new Date(quote.date).toISOString().split('T')[0],
        expiryDate: new Date(quote.expiryDate).toISOString().split('T')[0]
      }));
      
      setQuotes(formattedQuotes);
    } catch (err) {
      console.error('Error fetching quotes:', err);
      setError('Failed to load quotes. Please try again.');
      toast.error('Failed to load quotes');
    } finally {
      setIsLoading(false);
    }
  };

  // Load customers from API
  const loadCustomers = async () => {
    setIsLoadingCustomers(true);
    try {
      const userProfiles = await userProfileService.getUserProfiles();
      setCustomers(userProfiles);
    } catch (error) {
      console.error('Error loading customers:', error);
      setError('Failed to load customers');
    } finally {
      setIsLoadingCustomers(false);
    }
  };

  useEffect(() => {
    // Fetch customers
    const fetchCustomers = async () => {
      try {
        // Get user data from localStorage
        const userData = localStorage.getItem('user');
        if (!userData) {
          throw new Error('User not authenticated');
        }
        
        const user = JSON.parse(userData);
        const token = user?.token;
        
        if (!token) {
          throw new Error('No authentication token found');
        }
        
        const response = await fetch('http://localhost:5000/api/customers', {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          credentials: 'include'
        });
        
        if (response.status === 401) {
          // Token is invalid or expired
          console.error('Authentication failed - redirecting to login');
          localStorage.removeItem('user');
          window.location.href = '/login';
          return;
        }
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        setCustomers(data);
      } catch (error) {
        console.error('Error fetching customers:', error);
        if (error instanceof Error && error.message.includes('401')) {
          localStorage.removeItem('user');
          window.location.href = '/login';
        }
      }
    };

    // Fetch services with their products
    const fetchServices = async () => {
      try {
        // Get user data from localStorage
        const userData = localStorage.getItem('user');
        if (!userData) {
          throw new Error('User not authenticated');
        }
        
        const user = JSON.parse(userData);
        const token = user?.token;
        
        if (!token) {
          throw new Error('No authentication token found');
        }
        
        const response = await fetch('http://localhost:5000/api/services', {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          credentials: 'include' // Important for sending cookies if using httpOnly cookies
        });
        
        if (response.status === 401) {
          // Token is invalid or expired
          console.error('Authentication failed - redirecting to login');
          localStorage.removeItem('user');
          window.location.href = '/login';
          return;
        }
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('Fetched services:', data);
        setServices(data);
      } catch (error) {
        console.error('Error fetching services:', error);
        if (error instanceof Error && error.message.includes('401')) {
          localStorage.removeItem('user');
          window.location.href = '/login';
        }
      }
    };

    fetchCustomers();
    fetchServices();
  }, []);

  // Load initial data
  useEffect(() => {
    const loadInitialData = async () => {
      setIsLoading(true);
      try {
        await Promise.all([
          loadCustomers(),
          fetchQuotes(),
        ]);
      } catch (error) {
        console.error('Error loading initial data:', error);
        setError('Failed to load initial data');
      } finally {
        setIsLoading(false);
      }
    };

    loadInitialData();
  }, []);

  useEffect(() => {
    fetchQuotes();
  }, [user, filters, statusFilter, searchTerm]);

  // Handle quote status update
  const handleUpdateQuoteStatus = async (quoteId: string, newStatus: 'draft' | 'sent' | 'accepted' | 'rejected' | 'expired') => {
    try {
      await quoteService.updateQuoteStatus(quoteId, newStatus);
      await fetchQuotes(); // Refresh the quotes list
      toast.success(`Quote status updated to ${newStatus}`);
    } catch (err) {
      console.error('Error updating quote status:', err);
      toast.error('Failed to update quote status');
    }
  };

  // Handle quote deletion
  const handleDeleteQuote = async (quoteId: string) => {
    if (window.confirm('Are you sure you want to delete this quote?')) {
      try {
        await quoteService.deleteQuote(quoteId);
        setQuotes(quotes.filter(quote => quote.id !== quoteId));
        toast.success('Quote deleted successfully');
      } catch (err) {
        console.error('Error deleting quote:', err);
        toast.error('Failed to delete quote');
      }
    }
  };

  const [isLoadingCustomers, setIsLoadingCustomers] = useState(false);

  // Debug services state changes
  useEffect(() => {
    console.log('Services updated:', services);
  }, [services]);

  // Handle service selection change
  useEffect(() => {
    if (currentService) {
      console.log('Current service:', currentService);
      console.log('Service products:', currentService.products);
    } else {
      console.log('No service selected');
    }
  }, [currentService]);

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

  // Handle customer selection
  const handleCustomerSelect = (customerId: string) => {
    const selectedCustomer = customers.find(c => c._id === customerId);
    if (selectedCustomer) {
      setCurrentQuote({
        ...currentQuote,
        customerId: selectedCustomer._id,
        customerName: selectedCustomer.fullName || `${selectedCustomer.firstName} ${selectedCustomer.lastName}`.trim(),
      });
    }
  };

  const saveQuote = async () => {
    if (!currentQuote.customerId || !currentQuote.customerName || !currentQuote.lineItems || currentQuote.lineItems.length === 0) {
      toast.error("Please select a customer and add at least one line item");
      return;
    }

    try {
      setIsLoading(true);
      
      // Calculate totals
      const subtotal = currentQuote.lineItems.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
      const taxAmount = subtotal * ((currentQuote.taxRate || 0) / 100);
      const total = subtotal + taxAmount;
      
      // Create the quote data for the backend
      const quoteData = {
        customerId: currentQuote.customerId,
        customerName: currentQuote.customerName, // This will be populated by the backend
        date: new Date().toISOString(),
        expiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        lineItems: currentQuote.lineItems.map(item => ({
          description: item.description,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          total: item.quantity * item.unitPrice
        })),
        subtotal,
        taxRate: currentQuote.taxRate || 0,
        taxAmount,
        total,
        terms: currentQuote.terms || 'Payment due within 30 days',
        notes: currentQuote.notes || '',
        status: 'draft' as const, // Ensure status is set
        createdBy: username // Add the current user as the creator
      };

      // Save to backend
      const savedQuote = await quoteService.createQuote(quoteData);
      
      // Convert the saved quote to match our frontend Quote type
      const newQuote: Quote = {
        id: savedQuote._id || savedQuote.id || '',
        _id: savedQuote._id,
        customerId: savedQuote.customerId,
        customerName: savedQuote.customerName,
        quoteNumber: savedQuote.quoteNumber || '',
        date: new Date(savedQuote.date).toISOString().split('T')[0],
        expiryDate: new Date(savedQuote.expiryDate).toISOString().split('T')[0],
        lineItems: (savedQuote.lineItems || []).map(item => ({
          id: item.id || `item-${Math.random().toString(36).substr(2, 9)}`,
          description: item.description,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          total: item.total || (item.quantity * item.unitPrice)
        })),
        subtotal: savedQuote.subtotal,
        taxRate: savedQuote.taxRate,
        taxAmount: savedQuote.taxAmount,
        total: savedQuote.total,
        terms: savedQuote.terms,
        notes: savedQuote.notes || '',
        status: savedQuote.status,
        createdBy: savedQuote.createdBy,
        updatedAt: typeof savedQuote.updatedAt === 'string' ? savedQuote.updatedAt : savedQuote.updatedAt?.toISOString()
      };
      
      // Update local state with the saved quote
      setQuotes(prevQuotes => [newQuote, ...prevQuotes]);

      // Reset form
      setCurrentQuote({
        customerId: "",
        customerName: "",
        quoteNumber: "", // Let the backend generate this
        date: new Date().toISOString().split("T")[0],
        expiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
        lineItems: [],
        subtotal: 0,
        taxRate: 8.5,
        taxAmount: 0,
        total: 0,
        terms: "Payment due within 30 days of invoice date. Late payments may be subject to 1.5% monthly service charge.",
        notes: "",
        status: "draft" as const,
      });

      setActiveTab("overview");
      toast.success("Quote created successfully!");
    } catch (error) {
      console.error('Error saving quote:', error);
      toast.error("Failed to save quote. Please try again.");
    } finally {
      setIsLoading(false);
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

  const handleViewQuote = (quote: Quote) => {
    setSelectedQuote(quote);
    setShowQuoteModal(true);
  };

  const handleEditQuote = (quote: Quote) => {
    if (quote.id) {
      navigate(`/quotes/edit/${quote.id}`);
    } else {
      toast.error('Cannot edit quote: Missing quote ID');
    }
  };

  const handleSendToAdmin = async (quote: Quote) => {
    try {
      if (!quote.id) {
        toast.error('Cannot send quote: Missing quote ID');
        return;
      }
      
      // Only allow sending to admin from draft status
      if (quote.status !== 'draft') {
        return;
      }
      
      await quoteService.updateQuoteStatus(quote.id, 'sent');
      
      // Update the local state
      setQuotes(prevQuotes => 
        prevQuotes.map(q => 
          q.id === quote.id ? { ...q, status: 'sent' } : q
        )
      );
      
      toast.success('Quote sent to admin successfully');
    } catch (error) {
      console.error('Error updating quote status:', error);
      toast.error('Failed to update quote status');
    }
  };

  interface UserData {
    token: string;
    // Add other user properties if needed
  }

  const handleDownloadPDF = async (quote: Quote) => {
    try {
      const userData: UserData | null = JSON.parse(localStorage.getItem('user') || 'null');
      
      if (!userData?.token) {
        console.error('No authentication token found');
        window.location.href = '/login';
        return;
      }

      const response = await fetch(`http://localhost:5000/api/quotes/${quote.id}/pdf`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${userData.token}`
        },
        credentials: 'include'
      });

      if (response.status === 401) {
        // Token is invalid or expired
        console.error('Authentication failed - redirecting to login');
        localStorage.removeItem('user');
        window.location.href = '/login';
        return;
      }

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `quote-${quote.quoteNumber}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading PDF:', error);
      toast.error('Failed to download PDF');
    }
  };

  return (
    <div className="flex h-screen bg-gradient-to-br from-emerald-50 to-green-100">
      {/* Side Navigation */}
      <div className="fixed inset-y-0 left-0 z-50 w-64 bg-gradient-to-b from-emerald-900 to-emerald-800 shadow-xl flex flex-col">
        <div className="px-6 py-6 border-b border-emerald-700">
          <h1 className="text-xl font-bold text-white">Sales Dashboard</h1>
          <p className="text-sm text-emerald-200 mt-1">Welcome, {username} ({userType})</p>
        </div>

        <nav className="flex-1 px-4 py-4 overflow-y-auto">
          <ul className="space-y-2">
            <li>
              <button
                onClick={() => setActiveTab("overview")}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all duration-200 ${activeTab === "overview"
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
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all duration-200 ${activeTab === "create-quote"
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
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all duration-200 ${activeTab === "quote-tracking"
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
                          {quotes.filter((q) => q.status === "draft" || q.status === "sent").length}
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
                            <Button 
                              variant="outline" 
                              size="sm" 
                              className="border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 hover:text-emerald-800"
                              onClick={() => handleViewQuote(quote)}
                              title="View Quote"
                            >
                              <Eye size={14} />
                            </Button>
                            {quote.status === 'draft' && (
                              <Button 
                                variant="outline" 
                                size="sm" 
                                className="border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100 hover:text-blue-800"
                                onClick={() => handleSendToAdmin(quote)}
                                title="Send to Admin"
                              >
                                <Send size={14} />
                              </Button>
                            )}
                            <Button 
                              variant="outline" 
                              size="sm" 
                              className="border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100 hover:text-blue-800"
                              onClick={() => handleEditQuote(quote)}
                              title="Edit Quote"
                            >
                              <Pencil size={14} />
                            </Button>
                            <Button 
                              variant="outline" 
                              size="sm" 
                              className="border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 hover:text-emerald-800"
                              onClick={() => handleDownloadPDF(quote)}
                              title="Download PDF"
                            >
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
                    <CardHeader className="bg-emerald-50/80 border-b border-emerald-100 p-4">
                      <CardTitle className="text-gray-700">
                        <span className="text-gray-800">Select Customer</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-6 space-y-4">
                      <div className="space-y-2">
                        <Label className="text-sm font-medium text-gray-700">Select Customer *</Label>
                        <select
                          value={currentQuote.customerId}
                          onChange={(e) => handleCustomerSelect(e.target.value)}
                          className="w-full p-3 rounded-lg border border-gray-300 bg-white text-gray-800 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                        >
                          <option value="">Select a customer</option>
                          {isLoadingCustomers ? (
                            <option value="" disabled>Loading customers...</option>
                          ) : customers.length > 0 ? (
                            customers.map((customer) => (
                              <option key={customer._id} value={customer._id}>
                                {customer.company} - {customer.firstName} {customer.lastName}
                              </option>
                            ))
                          ) : (
                            <option value="" disabled>No customers found</option>
                          )}
                        </select>
                      </div>
                      
                      {currentQuote.customerId && (
                        <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                            <div>
                              <p className="text-black font-medium">Company</p>
                              <p className="text-black">{
                                customers.find(c => c._id === currentQuote.customerId)?.company || 'N/A'
                              }</p>
                            </div>
                            <div>
                              <p className="text-black font-medium">Contact Name</p>
                              <p className="text-black">{
                                (() => {
                                  const customer = customers.find(c => c._id === currentQuote.customerId);
                                  return customer ? `${customer.firstName} ${customer.lastName}` : 'N/A';
                                })()
                              }</p>
                            </div>
                            <div>
                              <p className="text-black font-medium">Email</p>
                              <p className="text-black">{
                                customers.find(c => c._id === currentQuote.customerId)?.email || 'N/A'
                              }</p>
                            </div>
                            <div>
                              <p className="text-black font-medium">Phone</p>
                              <p className="text-black">{
                                customers.find(c => c._id === currentQuote.customerId)?.phone || 'N/A'
                              }</p>
                            </div>
                            <div className="md:col-span-2">
                              <p className="text-black font-medium">Billing Address</p>
                              <p className="text-black">{
                                customers.find(c => c._id === currentQuote.customerId)?.billingAddress || 'N/A'
                              }</p>
                            </div>
                            <div>
                              <p className="text-black font-medium">VAT Code</p>
                              <p className="text-black">{
                                customers.find(c => c._id === currentQuote.customerId)?.vatCode || 'N/A'
                              }</p>
                            </div>
                          </div>
                        </div>
                      )}
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

                  {/* Service & Products */}
                  <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg mb-6">
                    <CardHeader className="bg-emerald-50/80 border-b border-emerald-100">
                      <CardTitle className="flex items-center gap-2 text-gray-700">
                        <Package size={20} className="text-emerald-600" />
                        <span className="text-gray-800">Service & Products</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-6">
                      <div className="space-y-4">
                        {/* Service Selection */}
                        <div className="space-y-2">
                          <div>
                            <Label htmlFor="service" className="text-black">Select Service</Label>
                          </div>
                          <Select
                            value={currentService?._id || ''}
                            onValueChange={(value) => {
                              const service = services.find(s => s._id === value);
                              setCurrentService(service || null);
                              setSelectedProducts([]);
                            }}
                          >
                            <SelectTrigger className="w-full text-black">
                              <SelectValue placeholder="Select a service" className="text-black" />
                            </SelectTrigger>
                            <SelectContent>
                              {services.map((service) => (
                                <SelectItem key={service._id} value={service._id} className="text-black">
                                  {service.serviceName}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        {/* Selected Services */}
                        {selectedServices.length > 0 && (
                          <div className="space-y-4">
                            <h4 className="text-sm font-medium text-black">Selected Services</h4>
                            {selectedServices.map((selected, index) => (
                              <div key={index} className="p-3 border rounded-lg bg-gray-50">
                                <div className="flex justify-between items-center mb-2">
                                  <span className="font-medium text-black">{selected.service.serviceName}</span>
                                  <Button 
                                    variant="ghost" 
                                    size="sm" 
                                    className="h-6 w-6 p-0 text-red-500 hover:bg-red-50"
                                    onClick={() => {
                                      const updated = [...selectedServices];
                                      updated.splice(index, 1);
                                      setSelectedServices(updated);
                                    }}
                                  >
                                    <XIcon className="h-3.5 w-3.5" />
                                  </Button>
                                </div>
                                <div className="space-y-1">
                                  {selected.products.map((product, pIndex) => (
                                    <div key={pIndex} className="flex justify-between text-sm">
                                      <span className="text-black">{product.name}</span>
                                      <span className="text-black">${product.price.toFixed(2)}</span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Products Grid */}
                        {currentService && (
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Available Products */}
                            <div className="space-y-2">
                              <Label className="text-black">Available Products</Label>
                              <div className="border rounded-lg p-4 h-64 overflow-y-auto space-y-2">
                                {currentService.products?.length > 0 ? (
                                  currentService.products.map((product) => (
                                    <div 
                                      key={product._id}
                                      className={`p-3 rounded-md border cursor-pointer transition-colors ${
                                        selectedProducts.some(p => p._id === product._id)
                                          ? 'bg-emerald-50 border-emerald-200'
                                          : 'hover:bg-gray-50 border-gray-200'
                                      }`}
                                      onClick={() => {
                                        setSelectedProducts(prev => {
                                          const isSelected = prev.some(p => p._id === product._id);
                                          return isSelected 
                                            ? prev.filter(p => p._id !== product._id)
                                            : [...prev, product];
                                        });
                                      }}
                                    >
                                      <div className="flex justify-between items-start">
                                        <div>
                                          <p className="font-medium text-black">{product.name}</p>
                                          <p className="text-sm text-black">${product.price.toFixed(2)}</p>
                                        </div>
                                        <Check 
                                          className={`h-5 w-5 ${
                                            selectedProducts.some(p => p._id === product._id)
                                              ? 'text-emerald-600'
                                              : 'text-gray-300'
                                          }`} 
                                        />
                                      </div>
                                    </div>
                                  ))
                                ) : (
                                  <p className="text-sm text-gray-500 text-center py-8">No products available for this service</p>
                                )}
                              </div>
                            </div>

                            {/* Selected Products */}
                            <div className="space-y-2">
                              <div className="flex justify-between items-center">
                                <Label className="text-black">Selected Products</Label>
                                <span className="text-sm text-gray-500">
                                  {selectedProducts.length} selected
                                </span>
                              </div>
                              <div className="border rounded-lg p-4 h-64 overflow-y-auto space-y-2">
                                {selectedProducts.length > 0 ? (
                                  selectedProducts.map((product) => (
                                    <div 
                                      key={product._id}
                                      className="p-3 rounded-md border border-gray-200 bg-white"
                                    >
                                      <div className="flex justify-between items-start">
                                        <div>
                                          <p className="font-medium text-black">{product.name}</p>
                                          <p className="text-sm text-black">${product.price.toFixed(2)}</p>
                                        </div>
                                        <Button
                                          variant="ghost"
                                          size="sm"
                                          className="text-red-500 hover:bg-red-50 hover:text-red-700 h-8 w-8 p-0"
                                          onClick={() => {
                                            setSelectedProducts(prev => 
                                              prev.filter(p => p._id !== product._id)
                                            );
                                          }}
                                        >
                                          <XIcon size={16} />
                                        </Button>
                                      </div>
                                    </div>
                                  ))
                                ) : (
                                  <div className="flex flex-col items-center justify-center h-full text-center p-8 text-gray-400">
                                    <ShoppingCart className="h-10 w-10 mb-2" />
                                    <p>No products selected</p>
                                    <p className="text-xs mt-1">Select products from the left panel</p>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Add to Quote Button */}
                        <div className="flex space-x-2">
                          <Button 
                            type="button"
                            variant="outline"
                            className="flex-1 bg-white border-emerald-500 text-emerald-600 hover:bg-emerald-50 hover:text-emerald-700"
                            onClick={() => {
                              if (currentService && selectedProducts.length > 0) {
                                const newService = {
                                  service: { ...currentService },
                                  products: [...selectedProducts].map(p => ({ ...p }))
                                };
                                
                                setSelectedServices(prev => [...prev, newService]);
                                setSelectedProducts([]);
                                setCurrentService(null);
                                
                                // Reset the service dropdown
                                const selectElement = document.querySelector('select[value=""]') as HTMLSelectElement;
                                if (selectElement) {
                                  selectElement.value = '';
                                }
                                
                                toast.success('Service added successfully');
                              } else {
                                toast.warning('Please select a service and at least one product');
                              }
                            }}
                            disabled={!currentService || selectedProducts.length === 0}
                          >
                            <PlusCircleIcon className="mr-2 h-4 w-4" />
                            Add Another Service
                          </Button>
                          <Button 
                            className="flex-1 bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white shadow-lg"
                            disabled={selectedServices.length === 0 && (!currentService || selectedProducts.length === 0)}
                            onClick={() => {
                              // Add all selected services and products to quote
                              const allProducts = [
                                ...selectedServices.flatMap(s => s.products),
                                ...selectedProducts
                              ];

                              const newLineItems = allProducts.map(product => ({
                                id: `item-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                                description: `${product.name}${product.serviceName ? ` (${product.serviceName})` : ''}`,
                                quantity: 1,
                                unitPrice: product.price,
                                total: product.price
                              }));

                              setCurrentQuote(prev => ({
                                ...prev,
                                lineItems: [...(prev.lineItems || []), ...newLineItems]
                              }));

                              // Reset all selections
                              setSelectedServices([]);
                              setSelectedProducts([]);
                              setCurrentService(null);
                              toast.success('All services and products added to quote');
                            }}
                          >
                            <FileText className="mr-2 h-4 w-4" />
                            Add to Quote
                          </Button>
                        </div>
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
                          className="bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white shadow-lg"
                        >
                          <PlusCircleIcon size={16} className="mr-2" />
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
                                <Textarea
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
                                    ${(item.quantity * item.unitPrice).toFixed(2)}
                                  </div>
                                </div>
                                <Button
                                  onClick={() => removeLineItem(item.id)}
                                  variant="ghost"
                                  size="sm"
                                  className="text-red-500 hover:bg-red-50 hover:text-red-700"
                                >
                                  <Trash2Icon size={16} />
                                </Button>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-8 text-gray-500">
                          <Package size={32} className="mx-auto mb-2 text-gray-300" />
                          <p>No items added yet</p>
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
                        <span className="text-black">Subtotal:</span>
                        <span className="font-medium text-black">${(currentQuote.subtotal || 0).toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-black">Tax Rate:</span>
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
                        <span className="text-black">Tax Amount:</span>
                        <span className="font-medium text-black">${(currentQuote.taxAmount || 0).toFixed(2)}</span>
                      </div>
                      <div className="border-t border-gray-200 pt-3 mt-2">
                        <div className="flex justify-between text-lg font-bold">
                          <span className="text-black">Total:</span>
                          <span className="text-black font-bold">
                            ${(currentQuote.total || 0).toFixed(2)}
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>


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

      {/* Quote Details Modal */}
      {showQuoteModal && selectedQuote && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-bold text-gray-800">Quote #{selectedQuote.quoteNumber}</h3>
                <button 
                  onClick={() => setShowQuoteModal(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X size={24} />
                </button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <h4 className="font-semibold text-gray-700 mb-2">Customer</h4>
                  <p className="text-gray-800">{selectedQuote.customerName}</p>
                  <p className="text-sm text-gray-600">Quote Date: {new Date(selectedQuote.date).toLocaleDateString()}</p>
                  <p className="text-sm text-gray-600">Expiry Date: {new Date(selectedQuote.expiryDate).toLocaleDateString()}</p>
                </div>
                <div className="text-right">
                  <h4 className="font-semibold text-gray-700 mb-2">Status</h4>
                  {getStatusBadge(selectedQuote.status || 'draft')}
                  <p className="text-sm text-gray-600 mt-2">Total: ${selectedQuote.total?.toFixed(2)}</p>
                </div>
              </div>

              <div className="border-t border-gray-200 pt-4 mb-6">
                <h4 className="font-semibold text-gray-700 mb-3">Line Items</h4>
                <div className="space-y-4">
                  {selectedQuote.lineItems?.map((item, index) => (
                    <div key={index} className="flex justify-between py-2 border-b border-gray-100">
                      <div>
                        <p className="font-medium text-gray-800">{item.description}</p>
                        <p className="text-sm text-gray-600">{item.quantity} x ${item.unitPrice?.toFixed(2)}</p>
                      </div>
                      <p className="font-medium text-gray-800">${(item.quantity * item.unitPrice)?.toFixed(2)}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="border-t border-gray-200 pt-4">
                <div className="flex justify-between mb-2">
                  <span className="text-black">Subtotal:</span>
                  <span className="text-black">${selectedQuote.subtotal?.toFixed(2)}</span>
                </div>
                <div className="flex justify-between mb-2">
                  <span className="text-black">Tax ({selectedQuote.taxRate || 0}%):</span>
                  <span className="text-black">${selectedQuote.taxAmount?.toFixed(2)}</span>
                </div>
                <div className="flex justify-between font-bold text-lg border-t border-gray-200 mt-4 pt-3">
                  <span className="text-black">Total:</span>
                  <span className="font-bold text-black">${selectedQuote.total?.toFixed(2)}</span>
                </div>
              </div>

              {(selectedQuote.notes || selectedQuote.terms) && (
                <div className="mt-6 pt-4 border-t border-gray-200">
                  {selectedQuote.notes && (
                    <div className="mb-4">
                      <h4 className="font-semibold text-gray-700 mb-2">Notes</h4>
                      <p className="text-gray-700 whitespace-pre-line">{selectedQuote.notes}</p>
                    </div>
                  )}
                  {selectedQuote.terms && (
                    <div>
                      <h4 className="font-semibold text-gray-700 mb-2">Terms & Conditions</h4>
                      <p className="text-gray-700 whitespace-pre-line">{selectedQuote.terms}</p>
                    </div>
                  )}
                </div>
              )}

              <div className="mt-6 flex justify-end space-x-3">
                <Button 
                  variant="outline"
                  onClick={() => setShowQuoteModal(false)}
                >
                  Close
                </Button>
                <Button 
                  onClick={() => handleDownloadPDF(selectedQuote)}
                  className="bg-emerald-600 hover:bg-emerald-700"
                >
                  <Download size={16} className="mr-2" />
                  Download PDF
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
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