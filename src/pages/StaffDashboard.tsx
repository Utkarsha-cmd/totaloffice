import React, { useState, useEffect } from 'react';
import { User, userService } from '../services/userService';
import { Order } from '../hooks/order';
import { orderService } from '../hooks/orderservice';
import OrderCard from '../components/OrderCard';
import { LayoutDashboard, Users, Clock, Menu, X , History, Package, Search} from 'lucide-react';

interface StaffDashboardProps {
  username: string;
  userType: 'staff';
  onLogout: () => void;
}

const StaffDashboard: React.FC<StaffDashboardProps> = ({ username, onLogout }) => {
  const [customers, setCustomers] = useState<User[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');
  const [orders, setOrders] = useState<Order[]>([]);
  const [activeTab, setActiveTab] = useState<'customers' | 'orders'>('customers');;

  const navigation = [
    { name: 'Customer Details', icon: Users, tab: 'customers', current: activeTab === 'customers' },
    { name: 'Orders', tab: 'orders',  icon: Package, current: activeTab === 'orders' },
  ];
  
  
  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        setLoading(true);
        const data = await userService.getUsers();
        setCustomers(data);
      } catch (err) {
        setError('Failed to fetch customers');
        console.error('Error fetching customers:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchCustomers();
  }, []);
  const mockOrders: Order[] = [
    {
      _id: 'order1',
      orderNumber: 'ORD-1001',
      customerId: '1',
      customerName: 'John Smith',
      customerEmail: 'john.smith@company.com',
      items: [
        {
          id: 'item1',
          name: 'Cleaning Supplies',
          category: 'Janitorial',
          quantity: 2,
          price: 49.99,
        },
        {
          id: 'item2',
          name: 'Business Cards',
          category: 'Print',
          quantity: 1,
          price: 19.99,
        }
      ],
      subtotal: 119.97,
      tax: 10.00,
      shipping: 5.00,
      total: 134.97,
      status: 'pending',
      shippingAddress: {
        firstName: 'John',
        lastName: 'Smith',
        street: '123 Business Park Drive',
        city: 'Manchester',
        state: '',
        postalCode: 'M3 1SH',
        country: 'UK',
        phone: '+44 161 123 4567'
      },
      billingAddress: {
        firstName: 'John',
        lastName: 'Smith',
        street: '123 Business Park Drive',
        city: 'Manchester',
        state: '',
        postalCode: 'M3 1SH',
        country: 'UK',
        phone: '+44 161 123 4567'
      },
      paymentMethod: 'Credit Card',
      trackingNumber: 'TRK123456',
      orderDate: '2025-07-17T10:30:00Z',
      estimatedDelivery: '2025-07-22T00:00:00Z',
      notes: 'Leave at reception.'
    },
    {
      _id: 'order2',
      orderNumber: 'ORD-1002',
      customerId: '2',
      customerName: 'Sarah Johnson',
      customerEmail: 'sarah.johnson@innovate.co.uk',
      items: [
        {
          id: 'item3',
          name: 'Totally Tasty Snack Box',
          category: 'Food',
          quantity: 3,
          price: 29.99,
        }
      ],
      subtotal: 89.97,
      tax: 7.50,
      shipping: 4.00,
      total: 101.47,
      status: 'shipped',
      shippingAddress: {
        firstName: 'Sarah',
        lastName: 'Johnson',
        street: '456 Innovation Way',
        city: 'Birmingham',
        state: '',
        postalCode: 'B1 2AA',
        country: 'UK',
        phone: '+44 121 456 7890'
      },
      billingAddress: {
        firstName: 'Sarah',
        lastName: 'Johnson',
        street: '456 Innovation Way',
        city: 'Birmingham',
        state: '',
        postalCode: 'B1 2AA',
        country: 'UK',
        phone: '+44 121 456 7890'
      },
      paymentMethod: 'Bank Transfer',
      orderDate: '2025-07-15T15:00:00Z',
      estimatedDelivery: '2025-07-20T00:00:00Z'
    }
  ];
 const fetchOrders = async () => {
  setLoading(true);
  try {
    setOrders(mockOrders); 
  } catch (err: any) {
    setError(err.message || 'Failed to fetch orders');
    setOrders([]);
  } finally {
    setLoading(false);
  }
};
  useEffect(() => {
    if (activeTab === 'orders') {
      fetchOrders();
    }
  }, [activeTab]);
  
      const handleStatusUpdate = async (orderId: string, status: Order['status']) => {
      try {
        await orderService.updateOrderStatus(orderId, status);
        fetchOrders(); 
      } catch (err: any) {
        setError(err.message || 'Failed to update order status');
      }
    };
  const filteredCustomers = customers.filter(customer => 
    `${customer.firstName} ${customer.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.company?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 text-red-500">
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Side Navigation */}
      <aside className="w-64 bg-white border-r min-h-screen">
        <div className="p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-6">Navigation</h2>
          <nav className="space-y-2">
            <button
              onClick={() => setActiveTab('customers')}
              className={`block w-full text-left px-4 py-2 rounded-lg font-medium ${
                activeTab === 'customers' ? 'bg-green-100 text-green-700' : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              Customers
            </button>
            <button
              onClick={() => setActiveTab('orders')}
              className={`block w-full text-left px-4 py-2 rounded-lg font-medium ${
                activeTab === 'orders' ? 'bg-green-100 text-green-700' : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              Orders
            </button>
          </nav>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="bg-white shadow">
          <div className="px-6 py-4 flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-900">Staff Dashboard</h1>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">Welcome, {username}</span>
              <button
                onClick={onLogout}
                className="px-3 py-1 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700"
              >
                Logout
              </button>
            </div>
          </div>
        </header>

        <main className="flex-1 px-6 py-6">
          {activeTab === 'customers' ? (
            <>
              {/* Search */}
              <div className="mb-6">
                <div className="flex justify-between items-center mb-4">
                  <div className="relative w-1/3">
                    <input
                      type="text"
                      placeholder="Search customers..."
                      className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    <div className="absolute left-3 top-2.5 text-gray-400">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>

              {/* Customer List */}
              <div className="bg-white shadow overflow-hidden sm:rounded-lg">
                {filteredCustomers.length === 0 ? (
                  <div className="text-center py-12">
                    <p className="text-gray-500">No customers found</p>
                  </div>
                ) : (
                  <ul className="divide-y divide-gray-200">
                    {filteredCustomers.map((customer) => (
                      <li key={customer._id} className="hover:bg-gray-50">
                        <div className="px-4 py-4 sm:px-6">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center">
                              <div className="flex-shrink-0 h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
                                <span className="text-green-600 font-medium">
                                  {customer.firstName?.[0]}{customer.lastName?.[0]}
                                </span>
                              </div>
                              <div className="ml-4">
                                <div className="text-sm font-medium text-gray-900">
                                  {customer.firstName} {customer.lastName}
                                </div>
                                <div className="text-sm text-gray-500">{customer.company}</div>
                              </div>
                            </div>
                          </div>

                          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                            <div>
                              <p className="font-medium text-gray-700">Contact Information</p>
                              <p className="text-gray-600">Email: {customer.email}</p>
                              <p className="text-gray-600">Phone: {customer.phone}</p>
                              <p className="text-gray-600">Company: {customer.company}</p>
                              {customer.vatCode && (
                                <p className="text-gray-600">VAT Code: {customer.vatCode}</p>
                              )}
                              <p className="text-gray-600">Duration: {customer.duration}</p>
                              {customer.billingAddress && (
                                <div className="mt-2">
                                  <p className="font-medium text-gray-700">Billing Address</p>
                                  <p className="text-gray-600">{customer.billingAddress}</p>
                                </div>
                              )}
                              {customer.paymentInfo && (
                                <div className="mt-2">
                                  <p className="font-medium text-gray-700">Payment Information</p>
                                  <p className="text-gray-600">{customer.paymentInfo}</p>
                                </div>
                              )}
                            </div>
                            <div>
                              <p className="font-medium text-gray-700">Current Services</p>
                              {customer.services?.current?.length > 0 ? (
                                <ul className="list-disc list-inside text-green-600">
                                  {customer.services.current.map((service, i) => (
                                    <li key={i} className="mb-1">{service}</li>
                                  ))}
                                </ul>
                              ) : (
                                <p className="text-gray-500">No active services</p>
                              )}

                              <div className="mt-4">
                                <p className="font-medium text-gray-700">Service History</p>
                                {customer.services?.past?.length > 0 ? (
                                  <ul className="list-disc list-inside text-gray-500">
                                    {customer.services.past.map((service, i) => (
                                      <li key={`past-${i}`} className="text-sm">{service}</li>
                                    ))}
                                  </ul>
                                ) : (
                                  <p className="text-gray-500 text-sm">No past services</p>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </>
          ) : (
            // Orders tab content
            <div>
              {loading ? (
                <div className="flex justify-center items-center h-40">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-400"></div>
                </div>
              ) : orders.length === 0 ? (
                <div className="text-center py-10 text-gray-500">
                  <Package className="h-12 w-12 mx-auto mb-4 opacity-30 text-gray-400" />
                  <p className="text-lg">No orders found</p>
                  <p className="text-sm">Orders will appear here when customers make purchases.</p>
                </div>
              ) : (
                <div className="space-y-6">
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
          )}
        </main>
      </div>
    </div>
  );
};

export default StaffDashboard;
