import React, { useState, useEffect } from 'react';
import { User, userService } from '../services/userService';
import { orderService, Order } from '../services/orderService';
import OrderCard from '../components/OrderCard';
import { LayoutDashboard, Users, Clock, Menu, LogOut, History, Package, Search} from 'lucide-react';

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
  const [ordersLoading, setOrdersLoading] = useState<boolean>(false);
  const [ordersError, setOrdersError] = useState<string>('');
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
  useEffect(() => {
    if (activeTab === 'orders') {
      const fetchOrders = async () => {
        try {
          setOrdersLoading(true);
          setOrdersError('');
          const data = await orderService.getOrders();
          setOrders(data);
        } catch (err) {
          console.error('Error fetching orders:', err);
          setOrdersError('Failed to load orders. Please try again later.');
        } finally {
          setOrdersLoading(false);
        }
      };

      fetchOrders();
    }
  }, [activeTab]);
  
  const handleStatusUpdate = async (orderId: string, status: Order['status']) => {
    try {
      const updatedOrder = await orderService.updateOrderStatus(orderId, status);
      setOrders(orders.map(order => 
        order._id === updatedOrder._id ? updatedOrder : order
      ));
    } catch (err) {
      console.error('Error updating order status:', err);
    }
  };

  const filteredCustomers = customers.filter(customer => 
    `${customer.firstName} ${customer.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (customer.company?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
    customer.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredOrders = orders.filter(order => 
    order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
    order.customerName.toLowerCase().includes(searchTerm.toLowerCase())
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
      <aside className="fixed inset-y-0 left-0 z-50 w-64 bg-[#0d3324] shadow-lg border-r border-green-800 flex flex-col">
  {/* Header */}
  <div className="px-6 py-8">
    <h1 className="text-2xl font-bold text-white tracking-wide">Staff Portal</h1>
    <p className="text-sm text-green-200 mt-1">{username}</p>
  </div>

  {/* Navigation - scrollable */}
  <div className="flex-1 overflow-y-auto px-6">
    <nav className="flex flex-col gap-1">
      <button
        onClick={() => setActiveTab('customers')}
        className={`flex items-start px-4 py-3 rounded-md text-sm font-medium transition duration-200 ${
          activeTab === 'customers'
            ? 'bg-green-100 text-green-900'
            : 'hover:bg-green-800 hover:text-white text-green-200'
        }`}
      >
        <Users className="w-4 h-4 mr-2 mt-0.5" />
        <div>Customer Details</div>
      </button>

      <button
        onClick={() => setActiveTab('orders')}
        className={`flex items-start px-4 py-3 rounded-md text-sm font-medium transition duration-200 ${
          activeTab === 'orders'
            ? 'bg-green-100 text-green-900'
            : 'hover:bg-green-800 hover:text-white text-green-200'
        }`}
      >
        <Package className="w-4 h-4 mr-2 mt-0.5" />
        <div>Orders</div>
      </button>
    </nav>
  </div>

  {/* Sticky Footer */}
  <div className="sticky bottom-0 bg-[#0d3324] border-t border-green-800 p-4">
    <button
      onClick={onLogout}
      className="flex items-center gap-2 text-sm font-medium hover:text-red-400 transition"
    >
      <LogOut className="w-4 h-4" />
      Sign Out
    </button>
  </div>
</aside>


      {/* Main Content */}
      <div className="flex-1 flex flex-col ml-64">
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
        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg 
                   text-gray-800 placeholder-gray-400
                   focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />
      <div className="absolute left-3 top-2.5 text-gray-400">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-5 w-5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
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
