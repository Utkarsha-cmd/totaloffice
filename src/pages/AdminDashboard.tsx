import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { LayoutDashboard, Users, Clock, Menu, X, History, Package, FileSignature, RefreshCw, TrendingUp, ShoppingCart, UserCheck, CheckCircle, Truck, FileText, Edit, Trash2, LogOut} from 'lucide-react';
import { cn } from '@/lib/utils';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';
import { Order } from '../hooks/order';
import { orderService } from '../services/orderService';
import OrderCard from '../components/OrderCard';
import ServicesAndStocks from '@/components/ServiceandStock';
import TicketAssignment from '@/components/TicketAssignment';
import ServiceAgreementSection from '@/components/ServiceAgreementSection';
import Quotes from '@/components/Quotes';

interface AdminDashboardProps {
  username: string;
  userType: 'admin' | 'staff' | 'customer';
  onLogout: () => void;
}

import { User, userService } from '../services/userService';
import { serviceApi } from '../services/api';


interface ServiceProduct {
  _id: string;
  name: string;
  stock: number;
  price: number;
}

interface Service {
  _id: string;
  serviceName: string;
  products: ServiceProduct[];
}

interface UserWithFile extends Omit<User, 'document'> {
  document?: File | null;
  _id?: string;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ username, userType, onLogout }) => {
  const [customers, setCustomers] = useState<UserWithFile[]>([]);
  const [availableServices, setAvailableServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'details' | 'orders' | 'services'|'quotes'| 'serviceagreement' | 'tickets'>("details");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [showHistory, setShowHistory] = useState<{ [key: string]: boolean }>({});
  const [newCustomer, setNewCustomer] = useState<UserWithFile>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    company: '',
    vatCode: '',
    duration: '',
    services: { current: [], past: [] },
    document: null,
    billingAddress: '',
    paymentInfo: '',
  });

  const [editingCustomer, setEditingCustomer] = useState<UserWithFile | null>(null);
  const [showEditForm, setShowEditForm] = useState(false);
  const [orders, setOrders] = useState<Order[]>([]);
  const [ordersLoading, setOrdersLoading] = useState<boolean>(false);
  const [postcode, setPostcode] = useState('');

  // Fetch available services
  useEffect(() => {
    const fetchServices = async () => {
      try {
        const services = await serviceApi.getServices();
        setAvailableServices(services);
      } catch (error) {
        console.error('Error fetching services:', error);
      }
    };

    fetchServices();
  }, []);
  const [addressSuggestions, setAddressSuggestions] = useState<string[]>([]);
  const [isLoadingAddress, setIsLoadingAddress] = useState(false);
  const [addressError, setAddressError] = useState('');
  const [serviceDropdownOpen, setServiceDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement | null>(null);
  const [servicesAndProducts, setServicesAndProducts] = useState<
    { serviceName: string; products: { id: number; name: string; stock: number; price: number }[] }[]
  >([]);

  // Dashboard data
  const [dashboardStats, setDashboardStats] = useState({
    totalOrders: 0,
    totalCustomers: 0,
    totalServices: 0,
    ordersReceived: 0,
    ordersDelivered: 0
  });

  // State for chart data
  const [weeklyData, setWeeklyData] = useState<Array<{ name: string, orders: number, delivered: number }>>([]);
  const [monthlyData, setMonthlyData] = useState<Array<{ name: string, orders: number, delivered: number }>>([]);
  const [serviceDistribution, setServiceDistribution] = useState<Array<{ name: string, value: number, color: string }>>([]);

  // Process orders data for charts
  const processOrdersData = (orders: Order[]) => {
    // Process weekly data (last 7 days)
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (6 - i));
      return date.toLocaleDateString('en-US', { weekday: 'short' });
    });

    const weeklyOrders = last7Days.map(day => {
      const dayOrders = orders.filter(order => {
        const orderDate = new Date(order.orderDate);
        return orderDate.toLocaleDateString('en-US', { weekday: 'short' }) === day;
      });

      return {
        name: day,
        orders: dayOrders.length,
        delivered: dayOrders.filter(order => order.status === 'delivered').length
      };
    });

    // Process monthly data (last 6 months)
    const last6Months = Array.from({ length: 6 }, (_, i) => {
      const date = new Date();
      date.setMonth(date.getMonth() - (5 - i));
      return date.toLocaleDateString('en-US', { month: 'short' });
    });

    const monthlyOrders = last6Months.map(month => {
      const monthOrders = orders.filter(order => {
        const orderDate = new Date(order.orderDate);
        return orderDate.toLocaleDateString('en-US', { month: 'short' }) === month;
      });

      return {
        name: month,
        orders: monthOrders.length,
        delivered: monthOrders.filter(order => order.status === 'delivered').length
      };
    });

    // Process service distribution - Always show exactly 11 services
    const allServices = [
      'Totally Tasty',
      'Cleaning Supplies',
      'Business Supplies',
      'Print Services',
      'Office Furniture',
      'IT Equipment',
      'Stationery',
      'Kitchen Supplies',
      'Safety Equipment',
      'Packaging Materials',
      'Miscellaneous'
    ];

    const serviceMap = new Map<string, number>();

    // Initialize all services with 0 count
    allServices.forEach(service => {
      serviceMap.set(service, 0);
    });

    // Update counts from orders
    orders.forEach(order => {
      order.items.forEach(item => {
        const category = item.category || 'Miscellaneous';
        if (allServices.includes(category)) {
          serviceMap.set(category, (serviceMap.get(category) || 0) + item.quantity);
        } else {
          // Add to Miscellaneous if category not in predefined list
          serviceMap.set('Miscellaneous', (serviceMap.get('Miscellaneous') || 0) + item.quantity);
        }
      });
    });

    const colors = [
      '#10b981', '#34d399', '#6ee7b7', '#a7f3d0', '#d1fae5',
      '#86efac', '#4ade80', '#22c55e', '#16a34a', '#15803d', '#166534'
    ];

    const distribution = Array.from(serviceMap.entries())
      .map(([name, value], index) => ({
        name,
        value,
        color: colors[index % colors.length] || '#10b981'
      }));

    setWeeklyData(weeklyOrders);
    setMonthlyData(monthlyOrders);
    setServiceDistribution(distribution);
  };

  const toggleHistory = (customerId: string) => {
    setShowHistory(prev => ({
      ...prev,
      [customerId]: !prev[customerId]
    }));
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setServiceDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const fetchAllData = async () => {
      try {
        setLoading(true);
        const [ordersData, customersData] = await Promise.all([
          orderService.getOrders(),
          userService.getUsers('')
        ]);

        setOrders(ordersData);
        setCustomers(customersData);
        processOrdersData(ordersData);

        setDashboardStats({
          totalOrders: ordersData.length,
          totalCustomers: customersData.length,
          totalServices: 11, 
          ordersReceived: ordersData.filter(order =>
            ['pending', 'processing', 'shipped', 'delivered'].includes(order.status)
          ).length,
          ordersDelivered: ordersData.filter(order =>
            order.status === 'delivered'
          ).length
        });
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        setError('Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };

    fetchAllData();
  }, []);

  useEffect(() => {
    if (activeTab === 'orders') {
      fetchOrders();
    }
  }, [activeTab]);

  const fetchDashboardData = async () => {
    try {
      const ordersData = await orderService.getOrders();
      const customersData = await userService.getUsers('');

      setDashboardStats({
        totalOrders: ordersData.length,
        totalCustomers: customersData.length,
        totalServices: 11,
        ordersReceived: ordersData.filter(order => ['pending', 'confirmed', 'delivered'].includes(order.status)).length,
        ordersDelivered: ordersData.filter(order => order.status === 'delivered').length
      });
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
    }
  };

  const handlePostcodeLookup = async () => {
    if (!postcode.trim()) {
      setAddressError('Please enter a postcode');
      return;
    }

    setIsLoadingAddress(true);
    setAddressError('');

    try {
      const formattedPostcode = postcode.replace(/\s+/g, '').toUpperCase();
      const apiKey = 'pdSw7G1TEk6kghR1DNzddQ41182';
      const lookupResponse = await fetch(
        `https://api.getaddress.io/find/${encodeURIComponent(formattedPostcode)}?api-key=${apiKey}&expand=true`
      );

      if (!lookupResponse.ok) {
        throw new Error('Address lookup failed');
      }
      const data = await lookupResponse.json();
      if (data.addresses && data.addresses.length > 0) {
        const formattedAddresses = data.addresses.map((addr: any) => {
          const parts = [
            addr.line_1,
            addr.line_2,
            addr.line_3,
            addr.town_or_city,
            addr.county,
            formattedPostcode
          ].filter(Boolean);

          return parts.join(', ');
        });

        setAddressSuggestions(formattedAddresses);
      } else {
        const autoCompleteResponse = await fetch(
          `https://api.getaddress.io/autocomplete/${encodeURIComponent(formattedPostcode)}?api-key=${apiKey}`
        );

        if (!autoCompleteResponse.ok) {
          throw new Error('Address lookup failed');
        }

        const autoCompleteData = await autoCompleteResponse.json();

        if (autoCompleteData.suggestions && autoCompleteData.suggestions.length > 0) {
          setAddressSuggestions(autoCompleteData.suggestions);
        } else {
          setAddressError('No addresses found for this postcode');
          setAddressSuggestions([]);
        }
      }
    } catch (error) {
      console.error('Error fetching address:', error);
      setAddressError('Failed to fetch addresses. Please try again.');
      setAddressSuggestions([]);
    } finally {
      setIsLoadingAddress(false);
    }
  };

  const handleAddressSelect = (address: string) => {
    setNewCustomer(prev => ({
      ...prev,
      billingAddress: address
    }));
    setAddressSuggestions([]);
  };

  const navigation = [
    { name: 'Dashboard', icon: LayoutDashboard, tab: 'dashboard', current: activeTab === 'dashboard' },
    { name: 'User Details', icon: Users, tab: 'details', current: activeTab === 'details' },
    { name: 'Orders', tab: 'orders', icon: Package, current: activeTab === 'orders' },
    { name: 'Services and Stocks', tab: 'services', icon: Truck, current: activeTab === 'services' },
    { name: 'Support Tickets', icon: History, tab: 'tickets', current: activeTab === 'tickets' },
     { name: 'Quotes', icon: FileSignature , tab: 'quotes', current: activeTab === 'quotes' },
    { name: 'Service Agreement', icon: FileText, tab: 'serviceagreement', current: activeTab === 'serviceagreement' },
  ];

  const [showAddModal, setShowAddModal] = useState(false);
  const [newServiceData, setNewServiceData] = useState({
    serviceName: '',
    productName: '',
    stock: '',
    price: ''
  });

  const fetchOrders = async () => {
    try {
      setOrdersLoading(true);
      const orders = await orderService.getOrders();
      setOrders(orders);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch orders');
    } finally {
      setOrdersLoading(false);
    }
  };

  const handleStatusUpdate = async (orderId: string, status: Order['status']) => {
    try {
      await orderService.updateOrderStatus(orderId, status);
      // Refresh orders after status update
      fetchOrders();
    } catch (err: any) {
      setError(err.message || 'Failed to update order status');
    }
  };

  const handleDownloadCSV = async () => {
    try {
      await userService.exportUsersCSV();
    } catch (err: any) {
      setError(err.message || 'Failed to export CSV');
    }
  };

  const handleAddCustomer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCustomer.firstName || !newCustomer.email) {
      setError('First name and email are required');
      return;
    }

    try {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(newCustomer.email)) {
        setError('Please enter a valid email address');
        return;
      }

      const formData = new FormData();
      formData.append('firstName', newCustomer.firstName);
      formData.append('lastName', newCustomer.lastName || '');
      formData.append('email', newCustomer.email);
      formData.append('phone', newCustomer.phone || '');
      formData.append('company', newCustomer.company || '');
      formData.append('vatCode', newCustomer.vatCode || '');
      formData.append('duration', newCustomer.duration || '');
      formData.append('services', JSON.stringify(newCustomer.services || { current: [], past: [] }));
      formData.append('billingAddress', newCustomer.billingAddress || '');
      formData.append('paymentInfo', newCustomer.paymentInfo || '');

      if (newCustomer.document) {
        formData.append('document', newCustomer.document);
      }

      await userService.createUser(formData);
      fetchCustomers();
      setNewCustomer({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        company: '',
        vatCode: '',
        duration: '',
        services: { current: [], past: [] },
        document: null,
        billingAddress: '',
        paymentInfo: '',
      });
      setPostcode('');
      setAddressSuggestions([]);
      setShowAddForm(false);
    } catch (err: any) {
      console.error('Error adding customer:', err);
      setError(err.message || 'Failed to add user');
    }
  };


  const handleEditCustomer = (customer: UserWithFile) => {
    setEditingCustomer({
      ...customer,
      firstName: customer.firstName || '',
      lastName: customer.lastName || '',
      email: customer.email || '',
      phone: customer.phone || '',
      company: customer.company || '',
      vatCode: customer.vatCode || '',
      duration: customer.duration || '',
      services: {
        current: [...(customer.services?.current || [])],
        past: [...(customer.services?.past || [])]
      },
      billingAddress: customer.billingAddress || '',
      paymentInfo: customer.paymentInfo || '',
      document: customer.document || null
    });
    setShowEditForm(true);
    setShowAddForm(false);
  };

  const handleUpdateCustomer = async () => {
    if (!editingCustomer) return;

    try {
      setLoading(true);
      setError('');

      const formData = new FormData();
      const { document: doc, services, ...rest } = editingCustomer;
      const userData = {
        ...rest,
        lastName: rest.lastName || '',
        services: services || { current: [], past: [] }
      };

      Object.entries(userData).forEach(([key, value]) => {
        if (value !== null && value !== undefined) {
          if (key === 'services') {
            formData.append(key, JSON.stringify(value));
          } else {
            formData.append(key, String(value));
          }
        }
      });

      if (doc && doc instanceof File) {
        formData.append('document', doc);
      }

      await userService.updateUser(editingCustomer._id, formData);
      fetchCustomers();
      setEditingCustomer(null);
      setShowEditForm(false);
    } catch (err: any) {
      console.error('Error updating customer:', err);
      setError(err.message || 'Failed to update user');
    } finally {
      setLoading(false);
    }
  };

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await userService.getUsers(searchTerm);
      if (Array.isArray(data)) {
        setCustomers(data);
      } else {
        console.warn('API returned non-array data:', data);
        setCustomers([]);
      }
    } catch (err: any) {
      console.error('Error in fetchCustomers:', err);
      setError(err.message || 'Failed to fetch users');
      setCustomers([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCustomer = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        await userService.deleteUser(id);
        fetchCustomers();
      } catch (err: any) {
        setError(err.message || 'Failed to delete user');
      }
    }
  };

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchCustomers();
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm]);

  const filteredCustomers = customers.filter(customer => {
    const searchLower = searchTerm.toLowerCase();
    const fullName = `${customer.firstName || ''} ${customer.lastName || ''}`.toLowerCase();

    return (
      fullName.includes(searchLower) ||
      (customer.email || '').toLowerCase().includes(searchLower) ||
      (customer.phone || '').toLowerCase().includes(searchLower) ||
      (customer.company || '').toLowerCase().includes(searchLower) ||
      (customer.billingAddress || '').toLowerCase().includes(searchLower)
    );
  });

  const [editingProductId, setEditingProductId] = useState<number | null>(null);
  const [editedProduct, setEditedProduct] = useState<{
    id: number;
    name: string;
    stock: number;
    price: number;
  }>({ id: 0, name: '', stock: 0, price: 0 });

  const handleSaveEdit = (productId: number, serviceName: string) => {
    setServicesAndProducts((prev) =>
      prev.map((service) =>
        service.serviceName === serviceName
          ? {
            ...service,
            products: service.products.map((product) =>
              product.id === productId ? { ...product, ...editedProduct } : product
            )
          }
          : service
      )
    );
    setEditingProductId(null);
  };


  // Dashboard Statistics Cards Component
  const DashboardStats = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
      <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-lg border border-green-200 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-green-600 text-sm font-medium">Total Orders</p>
            <p className="text-2xl font-bold text-green-800">{dashboardStats.totalOrders}</p>
          </div>
          <ShoppingCart className="h-8 w-8 text-green-600" />
        </div>
      </div>

      <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-lg border border-green-200 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-green-600 text-sm font-medium">Total Customers</p>
            <p className="text-2xl font-bold text-green-800">{dashboardStats.totalCustomers}</p>
          </div>
          <UserCheck className="h-8 w-8 text-green-600" />
        </div>
      </div>

      {/* <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-lg border border-green-200 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-green-600 text-sm font-medium">Total Services</p>
            <p className="text-2xl font-bold text-green-800">{dashboardStats.totalServices}</p>
          </div>
          <Package className="h-8 w-8 text-green-600" />
        </div>
      </div> */}

      <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-lg border border-green-200 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-green-600 text-sm font-medium">Orders Received</p>
            <p className="text-2xl font-bold text-green-800">{dashboardStats.ordersReceived}</p>
          </div>
          <TrendingUp className="h-8 w-8 text-green-600" />
        </div>
      </div>

      <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-lg border border-green-200 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-green-600 text-sm font-medium">Orders Delivered</p>
            <p className="text-2xl font-bold text-green-800">{dashboardStats.ordersDelivered}</p>
          </div>
          <CheckCircle className="h-8 w-8 text-green-600" />
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-[#f3fdf7]">
      {/* Sidebar */}
      <div
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-64 bg-[#0d3324] shadow-lg transform transition-transform duration-300 ease-in-out",
          sidebarOpen ? 'translate-x-0' : '-translate-x-full',
          "md:relative md:translate-x-0"
        )}
      >
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-between h-16 px-4 bg-[#0d3324] text-white">
            <div className="flex items-center space-x-2">
              <LayoutDashboard className="h-6 w-6" />
              <span className="text-xl font-semibold">Admin Panel</span>
            </div>
            <button
              onClick={() => setSidebarOpen(false)}
              className="md:hidden p-1 rounded-md text-green-200 hover:text-white focus:outline-none"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <nav className="flex-1 px-4 py-6 space-y-2">
            {navigation.map((item) => (
              <button
                key={item.name}
                onClick={() => setActiveTab(item.tab as 'dashboard' | 'details' | 'orders'|'tickets'|'quotes'| 'serviceagreement')}
                className={cn(
                  item.current
                    ? 'bg-green-100 text-green-900 border-r-4 border-green-600'
  : 'text-green-200 hover:bg-green-800 hover:text-white',
                  'group flex items-center w-full px-4 py-3 text-sm font-medium rounded-md transition-colors duration-200 focus:outline-none focus:ring-0 focus:border-transparent active:outline-none'
                )}
                style={{ outline: 'none', boxShadow: 'none' }}
              >
                <item.icon
                  className={cn(
                    item.current ? 'text-green-700' : 'text-green-300 group-hover:text-white',
                    'mr-3 flex-shrink-0 h-5 w-5'
                  )}
                  aria-hidden="true"
                />
                {item.name}
              </button>
            ))}
          </nav>

          <div className="p-4 border-t border-green-700">
            <div className="flex justify-center">
              <button
                onClick={onLogout}
                className="flex items-center space-x-2 text-sm text-white hover:text-green-200 transition-colors duration-200"
              >
                <LogOut className="w-4 h-4" />
                <span>Sign out</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top navigation */}
        <div className="bg-white shadow-sm">
          <div className="px-4 py-3 flex items-center justify-between">
            <div className="flex items-center">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="md:hidden p-2 rounded-md text-gray-500 hover:text-gray-600 hover:bg-gray-100"
              >
                <Menu className="h-5 w-5" />
              </button>
              <h1 className="text-2xl font-bold text-gray-900">
                {activeTab === 'dashboard' ? 'Dashboard Overview' : activeTab === 'details' ? 'Customer Details' : activeTab === 'orders' ? 'Orders':activeTab === 'quotes' ? 'Quotes ':activeTab === 'serviceagreement' ? 'Service Agreements' : activeTab === 'services'?'Services and Stocks' : 'Support Tickets'}
              </h1>
            </div>

            {activeTab == 'details' && (
              <div className="flex items-center space-x-3">
                <input
                  type="text"
                  placeholder="Search"
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  className="w-full md:w-1/3 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500 text-gray-800 placeholder-gray-400"
                />
                <button
                  onClick={() => setShowAddForm(true)}
                  className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 bg-emerald-600 hover:bg-emerald-700 text-white"
                >
                  Add Customer
                </button>
              </div>

            )}
          </div>
        </div>

        {/* Page content */}
        <div className="flex-1 overflow-y-auto p-4">
          {error && (
            <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md">
              {error}
              <button
                onClick={() => setError('')}
                className="ml-2 text-red-500 hover:text-red-700"
              >
                ×
              </button>
            </div>
          )}

          {/* Dashboard Content */}
          {activeTab === 'dashboard' ? (
            <div className="space-y-6">
              <DashboardStats />

              {/* Charts Section */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Weekly Orders Chart */}
                <div className="bg-white p-6 rounded-lg border border-green-200 shadow-sm">
                  <h3 className="text-lg font-semibold text-green-800 mb-4">Weekly Orders Overview</h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={weeklyData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                      <XAxis dataKey="name" stroke="#6b7280" />
                      <YAxis stroke="#6b7280" />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#f0fdf4',
                          border: '1px solid #bbf7d0',
                          borderRadius: '8px'
                        }}
                      />
                      <Bar dataKey="orders" fill="#059669" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="delivered" fill="#34d399" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                {/* Monthly Trend Chart */}
                <div className="bg-white p-6 rounded-lg border border-green-200 shadow-sm">
                  <h3 className="text-lg font-semibold text-green-800 mb-4">Monthly Trend</h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={monthlyData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                      <XAxis dataKey="name" stroke="#6b7280" />
                      <YAxis stroke="#6b7280" />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#f0fdf4',
                          border: '1px solid #bbf7d0',
                          borderRadius: '8px'
                        }}
                      />
                      <Line
                        type="monotone"
                        dataKey="orders"
                        stroke="#059669"
                        strokeWidth={3}
                        dot={{ fill: '#059669', strokeWidth: 2, r: 6 }}
                      />
                      <Line
                        type="monotone"
                        dataKey="delivered"
                        stroke="#34d399"
                        strokeWidth={3}
                        dot={{ fill: '#34d399', strokeWidth: 2, r: 6 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          )
            : activeTab === 'services' ? (
              <ServicesAndStocks
              />
            )
              : activeTab === 'tickets' ? (
                <TicketAssignment />
              ): activeTab === 'quotes' ? (
                <Quotes />
              )
              : activeTab === 'serviceagreement' ? (
              <ServiceAgreementSection
              />
            )
                : (
  <>
  {/* Content based on active tab */}
  {activeTab === 'orders' ? (
    // Orders tab content
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center space-x-2">
          <input
            type="text"
            placeholder="Search orders..."
            className="px-3 py-1.5 border border-gray-300 text-gray-700 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
          />
          <button
            onClick={fetchOrders}
            className="p-1.5 text-gray-500 hover:text-gray-700"
            title="Refresh orders"
          >
            <RefreshCw className={`h-4 w-4 ${ordersLoading ? 'animate-spin' : ''}`} />
          </button>
        </div>
        <button
          onClick={handleDownloadCSV}
          className="inline-flex items-center px-3 py-1.5 border border-gray-300 text-xs font-medium rounded-md text-white-700 bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          Export CSV
        </button>
      </div>

      {ordersLoading ? (
        <div className="flex justify-center items-center h-40">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
        </div>
      ) : orders.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-lg border border-gray-200 shadow-sm">
          <Package className="h-16 w-16 mx-auto mb-4 text-gray-300" />
          <h3 className="text-lg font-medium text-gray-900">No orders found</h3>
          <p className="mt-1 text-sm text-gray-500">
            Orders will appear here when customers make purchases.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <OrderCard
              key={order._id}
              order={order}
              onStatusUpdate={handleStatusUpdate}
            />
          ))}
        </div>
      )}
    </div>
  ) : (
    // Customer details/history tabs
    <div>
      {filteredCustomers.length === 0 ? (
        <div className="text-center py-10 text-gray-500">
          No customers found. Add a new customer to get started.
        </div>
      ) : (
        <div className="grid gap-6">
          {filteredCustomers.map((customer) => (
            <div
              key={customer._id}
              className="bg-white rounded-lg shadow-md border border-gray-200 p-6 relative hover:shadow-lg transition-shadow duration-200"
            >
              {activeTab === 'details' ? (
                <>
                  <div className="flex items-center gap-3">
                    <h2 className="text-xl font-semibold text-gray-800">
                      {customer.firstName} {customer.lastName}
                    </h2>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleEditCustomer(customer)}
                        className="text-indigo-600 hover:text-indigo-800 p-1 rounded hover:bg-indigo-50 transition-colors"
                        title="Edit Customer"
                      >
                        <Edit size={16} />
                      </button>
                      <button
                        onClick={() => handleDeleteCustomer(customer._id || '')}
                        className="text-red-500 hover:text-red-700 p-1 rounded hover:bg-red-50 transition-colors"
                        title="Delete Customer"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3">
                    <div>
                      <p className="text-sm font-medium text-gray-700">Company</p>
                      <p className="text-sm text-gray-600 mb-1">
                        {customer.company || 'N/A'}
                      </p>

                      <p className="text-sm font-medium text-gray-700">Email</p>
                      <p className="text-sm text-gray-600 mb-1">
                        {customer.email || 'N/A'}
                      </p>

                      <p className="text-sm font-medium text-gray-700">Phone</p>
                      <p className="text-sm text-gray-600 mb-1">
                        {customer.phone || 'N/A'}
                      </p>

                      <p className="text-sm font-medium text-gray-700">VAT Code</p>
                      <p className="text-sm text-gray-600">
                        {customer.vatCode || 'N/A'}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-700">Payment Info</p>
                      <p className="text-sm text-gray-600 mb-1">
                        {customer.paymentInfo || 'N/A'}
                      </p>

                      <p className="text-sm font-medium text-gray-700">Billing Address</p>
                      <p className="text-sm text-gray-600">
                        {customer.billingAddress || 'N/A'}
                      </p>
                    </div>
                  </div>
                  <div className="mt-4">
                    <p className="text-sm font-medium text-gray-700 mb-1">Services</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm font-medium text-gray-800 mb-1">
                          Current Services
                        </p>
                      <ul className="list-disc list-inside">
                        {customer.services?.current?.length > 0 ? (
                          customer.services.current.map((service, i) => (
                            <li key={i} className="text-sm text-gray-700">
                              {service}
                            </li>
                          ))
                        ) : (
                          <li className="text-sm text-gray-400">No current services</li>
                        )}
                      </ul>
                        <ul className="list-disc list-inside">
                          {customer.services?.current?.length > 0 ? (
                            customer.services.current.map((service, i) => (
                              <li key={i} className="text-sm text-gray-700">
                                {service}
                              </li>
                            ))
                          ) : (
                            <li className="text-sm text-gray-400">No current services</li>
                          )}
                        </ul>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-700 mb-1">
                          Service History
                        </p>
                        <ul className="list-disc list-inside">
                          {customer.services?.past?.length > 0 ? (
                            customer.services.past.map((service, i) => (
                              <li key={i} className="text-sm text-gray-500">
                                {service}
                              </li>
                            ))
                          ) : (
                            <li className="text-sm text-gray-400">No past services</li>
                          )}
                        </ul>
                        <div className="mt-2">
                          <Link
                            to={`/customer-history/${customer._id}`}
                            className="text-sm text-indigo-600 hover:underline"
                          >
                            View Full History
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                  {customer.document && (
                    <div className="mt-3">
                      <p className="text-sm font-medium text-gray-700">Document</p>
                      {typeof customer.document === 'string' ? (
                        <a
                          href={`http://localhost:5000${customer.document}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-indigo-600 hover:underline"
                        >
                          View Document
                        </a>
                      ) : (
                        <p className="text-sm text-indigo-600">{customer.document.name}</p>
                      )}
                    </div>
                  )}


                </>
              ) : (
                <>
                  <div className="flex justify-between items-start">
                    <div>
                      <h2 className="text-lg font-semibold text-gray-800">
                        {customer.firstName} {customer.lastName}
                      </h2>
                      <p className="text-sm text-gray-600">
                        {customer.company || 'No company'}
                      </p>
                    </div>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-50 text-indigo-600">
                      {customer.duration}
                    </span>
                  </div>

                  <div className="mt-4 space-y-3">
                    <div>
                      <p className="text-sm font-medium text-gray-700">
                        Payment Information
                      </p>
                      <p className="text-sm text-gray-600">{customer.paymentInfo}</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm font-medium text-indigo-600">Current Services</p>
                        <ul className="mt-1 space-y-1">
                          {customer.services.current.map((service, i) => (
                            <li key={i} className="text-sm text-gray-700">
                              • {service}
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-700">Service History</p>
                        <ul className="mt-1 space-y-1">
                          {customer.services.past.map((service, i) => (
                            <li key={i} className="text-sm text-gray-500">
                              • {service}
                            </li>
                          ))}
                          {customer.services.past.length === 0 && (
                            <li className="text-sm text-gray-400">No past services</li>
                          )}
                        </ul>
                        <div className="mt-2">
                          <Link
                            to={`/customer-history/${customer._id}`}
                            className="text-sm text-indigo-600 hover:underline"
                          >
                            View Full History
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )}
</>

)
}

          {showAddForm && (
            <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
              <div className="bg-white rounded-lg p-6 w-full max-w-2xl shadow-lg">
                <h2 className="text-xl font-semibold mb-4 text-emerald-600">Add New Customer</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">

                  {/* 1. Postcode + Address */}
                  <div className="md:col-span-2 space-y-2">
                    <div className="relative">
                      <div className="flex gap-2">
                        <input
                          type="text"
                          placeholder="Enter UK Postcode (e.g., M3 1SH)"
                          value={postcode}
                          onChange={e => setPostcode(e.target.value)}
                          onKeyDown={e => e.key === 'Enter' && handlePostcodeLookup()}
                          className="flex-1 p-2 border border-black focus:outline-none font-semibold text-gray-800 rounded"
                        />
                        <button
                          type="button"
                          onClick={handlePostcodeLookup}
                          disabled={isLoadingAddress}
                          className="px-3 py-2 bg-emerald-600 text-white rounded hover:bg-emerald-700 disabled:opacity-50 whitespace-nowrap"
                        >
                          {isLoadingAddress ? 'Looking...' : 'Find'}
                        </button>
                      </div>

                      {isLoadingAddress ? (
                        <div className="absolute z-10 mt-1 w-full bg-white border border-gray-300 rounded-md shadow-lg p-2">
                          <div className="text-sm text-gray-600 py-1">Searching for addresses...</div>
                        </div>
                      ) : addressSuggestions.length > 0 ? (
                        <div className="absolute z-10 mt-1 w-full bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto">
                          <div className="px-3 py-2 text-xs text-gray-500 bg-gray-50 border-b">
                            Found {addressSuggestions.length} addresses:
                          </div>
                          {addressSuggestions.map((address, index) => (
                            <div
                              key={index}
                              className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer border-b border-gray-100 last:border-b-0"
                              onClick={() => {
                                handleAddressSelect(address);
                                setAddressSuggestions([]);
                              }}
                            >
                              {address}
                            </div>
                          ))}
                        </div>
                      ) : null}
                    </div>

                    {addressError && (
                      <p className="text-red-500 text-sm">{addressError}</p>
                    )}

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Billing Address</label>
                      <input
                        type="text"
                        placeholder="Address will appear here after selection"
                        value={newCustomer.billingAddress}
                        onChange={e => setNewCustomer({ ...newCustomer, billingAddress: e.target.value })}
                        className="w-full p-2 border border-black focus:outline-none font-semibold text-gray-800 rounded"
                      />
                    </div>
                  </div>

                  {/* 2. First Name */}
                  <input
                    type="text"
                    placeholder="First Name"
                    value={newCustomer.firstName}
                    onChange={e => setNewCustomer({ ...newCustomer, firstName: e.target.value })}
                    className="p-2 border border-black focus:outline-none font-semibold text-gray-800 rounded"
                  />

                  {/* 3. Last Name */}
                  <input
                    type="text"
                    placeholder="Last Name"
                    value={newCustomer.lastName || ''}
                    onChange={e => setNewCustomer({ ...newCustomer, lastName: e.target.value })}
                    className="p-2 border border-black focus:outline-none font-semibold text-gray-800 rounded"
                  />

                  {/* 4. Company */}
                  <input
                    type="text"
                    placeholder="Company"
                    value={newCustomer.company}
                    onChange={e => setNewCustomer({ ...newCustomer, company: e.target.value })}
                    className="p-2 border border-black focus:outline-none font-semibold text-gray-800 rounded"
                  />

                  {/* 5. Duration */}
                  <input
                    type="text"
                    placeholder="Duration (e.g. 2 years)"
                    value={newCustomer.duration}
                    onChange={e => setNewCustomer({ ...newCustomer, duration: e.target.value })}
                    className="p-2 border border-black focus:outline-none font-semibold text-gray-800 rounded"
                  />

                  {/* 6. Email */}
                  <input
                    type="text"
                    placeholder="Email Address"
                    value={newCustomer.email}
                    onChange={e => setNewCustomer({ ...newCustomer, email: e.target.value })}
                    className="p-2 border border-black focus:outline-none font-semibold text-gray-800 rounded"
                  />

                  {/* 7. Phone */}
                  <input
                    type="text"
                    placeholder="Phone Number"
                    value={newCustomer.phone}
                    onChange={e => setNewCustomer({ ...newCustomer, phone: e.target.value })}
                    className="p-2 border border-black focus:outline-none font-semibold text-gray-800 rounded"
                  />

                  {/* 8. Payment Info */}
                  <input
                    type="text"
                    placeholder="Payment Info"
                    value={newCustomer.paymentInfo}
                    onChange={e => setNewCustomer({ ...newCustomer, paymentInfo: e.target.value })}
                    className="p-2 border border-black focus:outline-none font-semibold text-gray-800 rounded"
                  />

                  {/* 9. VAT Code */}
                  <input
                    type="text"
                    placeholder="Customer VAT Code"
                    value={newCustomer.vatCode}
                    onChange={e => setNewCustomer({ ...newCustomer, vatCode: e.target.value })}
                    className="p-2 border border-black focus:outline-none font-semibold text-gray-800 rounded"
                  />

                  {/* 10. Services (multi-select) */}
                  <div className="md:col-span-2 relative">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Services</label>
                    <div
                      className="p-2 border border-black rounded cursor-pointer bg-white text-gray-900 font-semibold"
                      onClick={() => setServiceDropdownOpen(!serviceDropdownOpen)}
                    >
                      {newCustomer.services.current.length > 0
                        ? newCustomer.services.current.join(', ')
                        : 'Select services'}
                    </div>

                    {serviceDropdownOpen && (
                      <div
                        ref={dropdownRef}
                        className="absolute z-10 mt-1 w-full bg-gray-100 border border-gray-600 text-sm text-gray-900 font-semibold rounded shadow-xl shadow-gray-700 max-h-60 overflow-auto"
                      >
                        {availableServices.length > 0 ? (
                          availableServices.map((service) => (
                            <label
                              key={service._id}
                              className="flex items-center px-4 py-2 text-sm text-gray-800 hover:bg-gray-200 cursor-pointer"
                            >
                              <input
                                type="checkbox"
                                className="mr-2"
                                checked={newCustomer.services.current.includes(service.serviceName)}
                                onChange={() => {
                                  const isChecked = newCustomer.services.current.includes(service.serviceName);
                                  const updated = isChecked
                                    ? newCustomer.services.current.filter((s) => s !== service.serviceName)
                                    : [...newCustomer.services.current, service.serviceName];
                                  setNewCustomer({
                                    ...newCustomer,
                                    services: {
                                      ...newCustomer.services,
                                      current: updated,
                                    },
                                  });
                                }}
                              />
                              {service.serviceName}
                            </label>
                          ))
                        ) : (
                          <div className="px-4 py-2 text-sm text-gray-500">No services available</div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* 11. Past Services */}
                  <input
                    type="text"
                    placeholder="Past Services (comma separated)"
                    onChange={e =>
                      setNewCustomer({
                        ...newCustomer,
                        services: {
                          ...newCustomer.services,
                          past: e.target.value.split(',').map(s => s.trim()),
                        },
                      })
                    }
                    className="p-2 border border-black focus:outline-none font-semibold text-gray-800 rounded md:col-span-2"
                  />

                  {/* 12. Document Upload */}
                  <input
                    type="file"
                    accept="application/pdf,image/*"
                    onChange={e =>
                      setNewCustomer({
                        ...newCustomer,
                        document: e.target.files ? e.target.files[0] : null,
                      })
                    }
                    className="p-2 border border-black focus:outline-none font-semibold text-gray-800 rounded md:col-span-2"
                  />
                </div>

                {/* Action Buttons */}
                <div className="flex justify-end gap-3">
                  <button
                    onClick={() => setShowAddForm(false)}
                    className="text-sm text-white-600 border border-red-300  bg-red-400 rounded px-4 py-2 hover:bg-red-600"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleAddCustomer}
                    className="text-sm text-white bg-emerald-600 px-4 py-2 rounded hover:bg-emerald-700"
                  >
                    Add Customer
                  </button>
                </div>
              </div>
            </div>
          )}
          {showEditForm && editingCustomer && (
            <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
              <div className="bg-white rounded-lg p-6 w-full max-w-2xl shadow-lg">
                <h2 className="text-xl font-semibold mb-4 text-blue-700">Edit Customer</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  {/* Postcode Lookup */}
                  <div className="space-y-2">
                    <div className="relative">
                      <div className="flex gap-2">
                        <input
                          type="text"
                          placeholder="Enter UK Postcode (e.g., M3 1SH)"
                          value={postcode}
                          onChange={e => setPostcode(e.target.value)}
                          onKeyDown={e => e.key === 'Enter' && handlePostcodeLookup()}
                          className="flex-1 p-2 border border-black focus:outline-none font-semibold text-gray-800 rounded"
                        />
                        <button
                          type="button"
                          onClick={handlePostcodeLookup}
                          disabled={isLoadingAddress}
                          className="px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 whitespace-nowrap"
                        >
                          {isLoadingAddress ? 'Looking...' : 'Find'}
                        </button>
                      </div>

                      {/* Address Dropdown */}
                      {isLoadingAddress ? (
                        <div className="absolute z-10 mt-1 w-full bg-white border border-gray-300 rounded-md shadow-lg p-2">
                          <div className="text-sm text-gray-600 py-1">Searching for addresses...</div>
                        </div>
                      ) : addressSuggestions.length > 0 ? (
                        <div className="absolute z-10 mt-1 w-full bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto">
                          <div className="px-3 py-2 text-xs text-gray-500 bg-gray-50 border-b">
                            Found {addressSuggestions.length} addresses:
                          </div>
                          {addressSuggestions.map((address, index) => (
                            <div
                              key={index}
                              className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer border-b border-gray-100 last:border-b-0"
                              onClick={() => {
                                setEditingCustomer({ ...editingCustomer, billingAddress: address });
                                setAddressSuggestions([]);
                              }}
                            >
                              {address}
                            </div>
                          ))}
                        </div>
                      ) : null}
                    </div>

                    {addressError && (
                      <p className="text-red-500 text-sm">{addressError}</p>
                    )}

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Billing Address</label>
                      <input
                        type="text"
                        placeholder="Address will appear here after selection"
                        value={editingCustomer.billingAddress}
                        onChange={e => setEditingCustomer({ ...editingCustomer, billingAddress: e.target.value })}
                        className="w-full p-2 border border-black focus:outline-none font-semibold text-gray-800 rounded"
                      />
                    </div>
                  </div>
                  {/* 2. First Name */}
                  <input
                    type="text"
                    placeholder="First Name"
                    value={editingCustomer.firstName || ''}
                    onChange={e => setEditingCustomer({ ...editingCustomer, firstName: e.target.value })}
                    className="p-2 border border-black focus:outline-none font-semibold text-gray-800 rounded"
                  />

                  {/* 3. Last Name */}
                  <input
                    type="text"
                    placeholder="Last Name"
                    value={editingCustomer.lastName || ''}
                    onChange={e => setEditingCustomer({ ...editingCustomer, lastName: e.target.value })}
                    className="p-2 border border-black focus:outline-none font-semibold text-gray-800 rounded"
                  />

                  {/* 4. Company */}
                  <input
                    type="text"
                    placeholder="Company"
                    value={editingCustomer.company}
                    onChange={e => setEditingCustomer({ ...editingCustomer, company: e.target.value })}
                    className="p-2 border border-black focus:outline-none font-semibold text-gray-800 rounded"
                  />

                  {/* 5. Duration */}
                  <input
                    type="text"
                    placeholder="Duration (e.g. 2 years)"
                    value={editingCustomer.duration}
                    onChange={e => setEditingCustomer({ ...editingCustomer, duration: e.target.value })}
                    className="p-2 border border-black focus:outline-none font-semibold text-gray-800 rounded"
                  />

                  {/* 6. Email */}
                  <input
                    type="text"
                    placeholder="Email Address"
                    value={editingCustomer.email}
                    onChange={e => setEditingCustomer({ ...editingCustomer, email: e.target.value })}
                    className="p-2 border border-black focus:outline-none font-semibold text-gray-800 rounded"
                  />

                  {/* 7. Phone */}
                  <input
                    type="text"
                    placeholder="Phone Number"
                    value={editingCustomer.phone}
                    onChange={e => setEditingCustomer({ ...editingCustomer, phone: e.target.value })}
                    className="p-2 border border-black focus:outline-none font-semibold text-gray-800 rounded"
                  />

                  {/* 8. Payment Info */}
                  <input
                    type="text"
                    placeholder="Payment Info"
                    value={editingCustomer.paymentInfo}
                    onChange={e => setEditingCustomer({ ...editingCustomer, paymentInfo: e.target.value })}
                    className="p-2 border border-black focus:outline-none font-semibold text-gray-800 rounded"
                  />

                  {/* 9. VAT Code */}
                  <input
                    type="text"
                    placeholder="Customer VAT Code"
                    value={editingCustomer.vatCode}
                    onChange={e => setEditingCustomer({ ...editingCustomer, vatCode: e.target.value })}
                    className="p-2 border border-black focus:outline-none font-semibold text-gray-800 rounded"
                  />

                  {/* 10. Services (Multi-select Dropdown) */}
                  <div className="md:col-span-2 relative">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Services</label>
                    <div
                      className="p-2 border border-black rounded cursor-pointer bg-white text-gray-900 font-semibold"
                      onClick={() => setServiceDropdownOpen(!serviceDropdownOpen)}
                    >
                      {editingCustomer.services.current.length > 0
                        ? editingCustomer.services.current.join(', ')
                        : 'Select services'}
                    </div>

                    {serviceDropdownOpen && (
                      <div
                        ref={dropdownRef}
                        className="absolute z-10 mt-1 w-full bg-gray-100 border border-gray-600 text-sm text-gray-900 font-semibold rounded shadow-xl shadow-gray-700 max-h-60 overflow-auto"
                      >
                        {availableServices.length > 0 ? (
                          availableServices.map((service) => (
                            <label
                              key={service._id}
                              className="flex items-center px-4 py-2 text-sm text-gray-800 hover:bg-gray-200 cursor-pointer"
                            >
                              <input
                                type="checkbox"
                                className="mr-2"
                                checked={editingCustomer.services.current.includes(service.serviceName)}
                                onChange={() => {
                                  const isChecked = editingCustomer.services.current.includes(service.serviceName);
                                  const updated = isChecked
                                    ? editingCustomer.services.current.filter((s) => s !== service.serviceName)
                                    : [...editingCustomer.services.current, service.serviceName];
                                  setEditingCustomer({
                                    ...editingCustomer,
                                    services: {
                                      ...editingCustomer.services,
                                      current: updated,
                                    },
                                  });
                                }}
                              />
                              {service.serviceName}
                            </label>
                          ))
                        ) : (
                          <div className="px-4 py-2 text-sm text-gray-500">No services available</div>
                        )}
                      </div>
                    )}
                  </div>

                  <input
                    type="text"
                    placeholder="Past Services (comma separated)"
                    value={editingCustomer.services.past.join(', ')}
                    onChange={e =>
                      setEditingCustomer({
                        ...editingCustomer,
                        services: {
                          ...editingCustomer.services,
                          past: e.target.value.split(',').map(s => s.trim()),
                        },
                      })
                    }
                    className="p-2 border border-black focus:outline-none font-semibold text-gray-800 rounded"
                  />
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Document Upload</label>
                    <input
                      type="file"
                      accept="application/pdf,image/*"
                      onChange={e =>
                        setEditingCustomer({
                          ...editingCustomer,
                          document: e.target.files ? e.target.files[0] : editingCustomer.document,
                        })
                      }
                      className="p-2 border border-black focus:outline-none font-semibold text-gray-800 rounded w-full"
                    />
                    {typeof editingCustomer.document === 'string' && (
                      <div className="mt-2">
                        <p className="text-sm text-gray-600">Current document:</p>
                        <a
                          href={`http://localhost:5000${editingCustomer.document}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-blue-600 hover:underline"
                        >
                          View Current Document
                        </a>
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex justify-end gap-3">
                  <button
                    onClick={() => {
                      setShowEditForm(false);
                      setEditingCustomer(null);
                    }}
                    className="text-sm text-gray-600 border border-gray-300 rounded px-4 py-2 hover:bg-gray-100"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleUpdateCustomer}
                    className="text-sm text-white bg-blue-600 px-4 py-2 rounded hover:bg-blue-700"
                  >
                    Update Customer
                  </button>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;