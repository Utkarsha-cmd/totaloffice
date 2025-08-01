import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Clock, Package, Calendar, CheckCircle, Clock as ClockIcon, XCircle } from 'lucide-react';
import { Order } from '../services/orderService';
import { orderService } from '../services/orderService';
import { userService } from '../services/userService';
import { format, parseISO } from 'date-fns';

const CustomerHistoryPage: React.FC = () => {
  const { customerId } = useParams<{ customerId: string }>();
  const [customer, setCustomer] = useState<any>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  
  // Calculate total spent
  const totalSpent = orders.reduce((sum, order) => sum + order.total, 0);

  // Get recent orders (last 5)
  const recentOrders = [...orders]
    .sort((a, b) => new Date(a.orderDate).getTime() - new Date(b.orderDate).getTime())
    .slice(0, 5);

  useEffect(() => {
    const fetchCustomerData = async () => {
      try {
        setLoading(true);
        setError('');
        
        if (!customerId) {
          setError('No customer ID provided');
          setLoading(false);
          return;
        }

        console.log('Fetching customer data for ID:', customerId);
        
        // Fetch customer details
        const customerData = await userService.getUserById(customerId);
        console.log('Customer data:', customerData);
        setCustomer(customerData);
        
        try {
          // First, try to get all orders (admin endpoint)
          console.log('Fetching all orders...');
          const allOrders = await orderService.getOrders();
          console.log('All orders from API:', allOrders);
          
          // Filter orders by customer email (more reliable than ID)
          const customerEmail = customerData.email?.toLowerCase();
          console.log('Filtering orders for email:', customerEmail);
          
          const customerOrders = allOrders.filter(order => {
            const orderEmail = order.customerEmail?.toLowerCase();
            const matches = orderEmail === customerEmail;
            
            if (matches) {
              console.log('Matching order found:', {
                orderId: order._id,
                orderEmail,
                customerEmail,
                orderNumber: order.orderNumber,
                total: order.total
              });
            }
            
            return matches;
          });
          
          console.log('Filtered customer orders:', customerOrders);
          setOrders(customerOrders);
          
          if (customerOrders.length === 0) {
            console.log('No orders found for this customer');
            setError('No order history found for this customer.');
          }
        } catch (orderError) {
          console.error('Error fetching orders:', orderError);
          setError('Failed to load order history. Please check the console for details.');
        }
      } catch (err) {
        console.error('Error fetching customer data:', err);
        setError('Failed to load customer data');
      } finally {
        setLoading(false);
      }
    };

    fetchCustomerData();
  }, [customerId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
          <strong className="font-bold">Error: </strong>
          <span className="block sm:inline">{error}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex items-center mb-6">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center text-blue-600 hover:text-blue-800 mr-4"
        >
          <ArrowLeft className="w-5 h-5 mr-1" />
          Back to Dashboard
        </button>
        <h1 className="text-2xl font-bold text-gray-800">
          {customer?.firstName} {customer?.lastName}'s History
        </h1>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-5 gap-4 text-black">
        {/* Customer Summary Card */}
        <div className="bg-white rounded-lg shadow p-4 flex flex-col text-sm">
          <h2 className="text-base font-semibold mb-3 text-black">Customer Information</h2>
          {customer ? (
            <div className="space-y-1.5 flex-grow">
              <p><span className="font-medium">Name:</span> {customer.firstName} {customer.lastName}</p>
              <p><span className="font-medium">Email:</span> {customer.email}</p>
              <p><span className="font-medium">Phone:</span> {customer.phone}</p>
              <p><span className="font-medium">Company:</span> {customer.company || 'N/A'}</p>
            </div>
          ) : (
            <p>Loading customer information...</p>
          )}
        </div>

        {/* Order Statistics */}
        <div className="bg-white rounded-lg shadow p-2 flex flex-col text-xs">
          <h2 className="text-sm font-semibold mb-2 text-black">Order Stats</h2>
          <div className="space-y-2 flex-grow">
            <div className="flex items-center">
              <div className="p-1.5 bg-blue-100 rounded-full mr-2">
                <Package className="w-4 h-4 text-blue-600" />
              </div>
              <div>
                <p className="text-xs text-gray-600">Total Orders</p>
                <p className="text-lg font-semibold">{orders.length}</p>
              </div>
            </div>
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-full mr-3">
                <CheckCircle className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Completed</p>
                <p className="text-xl font-semibold">
                  {orders.filter(order => order.status === 'delivered').length}
                </p>
              </div>
            </div>
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-full mr-3">
                <ClockIcon className="w-5 h-5 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Pending</p>
                <p className="text-xl font-semibold">
                  {orders.filter(order => order.status === 'pending' || order.status === 'processing').length}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Current Services Card */}
        <div className="bg-white rounded-lg shadow p-4 flex flex-col text-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-black">Current Services</h2>
            <div className="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
              {customer?.services?.current?.length || 0}
            </div>
          </div>
          <div className="space-y-1.5 flex-grow">
            {customer?.services?.current && customer.services.current.length > 0 ? (
              customer.services.current.map((service: string, index: number) => (
                <div key={`current-${index}`} className="flex items-center p-1.5 bg-green-50 rounded-md">
                  <CheckCircle className="h-3.5 w-3.5 text-green-600 mr-1.5 flex-shrink-0" />
                  <span className="text-xs text-gray-900 truncate">{service}</span>
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-sm">No active services</p>
            )}
          </div>
        </div>

        {/* Past Services Card */}
        <div className="bg-white rounded-lg shadow p-4 flex flex-col text-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-black">Past Services</h2>
            <div className="bg-gray-100 text-gray-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
              {customer?.services?.past?.length || 0}
            </div>
          </div>
          <div className="space-y-1.5 flex-grow">
            {customer?.services?.past && customer.services.past.length > 0 ? (
              customer.services.past.map((service: string, index: number) => (
                <div key={`past-${index}`} className="flex items-center p-1.5 bg-gray-50 rounded-md">
                  <Clock className="h-3.5 w-3.5 text-gray-500 mr-1.5 flex-shrink-0" />
                  <span className="text-xs text-gray-900 truncate">{service}</span>
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-sm">No past services</p>
            )}
          </div>
        </div>

        {/* Recent Activity Card */}
        <div className="bg-white rounded-lg shadow p-4 flex flex-col text-sm h-full">
          <h2 className="text-base font-semibold mb-3 text-black">Recent Activity</h2>
          <div className="flex-grow overflow-y-auto max-h-[200px] pr-2">
            {recentOrders.length > 0 ? (
              <div className="space-y-2">
                {recentOrders.map(order => (
                  <div key={order._id} className="border-l-2 border-blue-500 pl-2 py-1 bg-blue-50 rounded-r text-xs">
                    <p className="font-medium text-gray-900">Order #{order.orderNumber}</p>
                    <p className="text-gray-600">
                      {order.status === 'delivered' ? 'Delivered' : 'Ordered'} • {format(parseISO(order.orderDate), 'MMM d')}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-4">
                <Clock className="mx-auto h-6 w-6 text-gray-400 mb-2" />
                <p className="text-sm text-gray-500">No recent activity</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Order History */}
      <div className="mt-8 bg-white rounded-lg shadow overflow-hidden">
        <div className="p-6 border-b">
          <h2 className="text-xl font-semibold text-black mb-4">Order History</h2>
          {orders.length > 0 ? (
            <div className="grid grid-cols-4 gap-4 font-medium text-black">
              <div>Order #</div>
              <div>Date</div>
              <div>Status</div>
              <div className="text-right">Total</div>
            </div>
          ) : (
            <p className="text-gray-500">No orders found for this customer</p>
          )}
        </div>
        
        {orders.length > 0 && (
          <div className="divide-y">
            {orders
              .sort((a, b) => new Date(b.orderDate).getTime() - new Date(a.orderDate).getTime())
              .map(order => (
                <div key={order._id} className="p-6 hover:bg-gray-50 transition-colors">
                  <div className="grid grid-cols-4 gap-4 items-center text-black">
                    <div className="font-medium">
                      #{order.orderNumber}
                    </div>
                    <div className="text-sm">
                      {format(parseISO(order.orderDate), 'MMM d, yyyy')}
                    </div>
                    <div>
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        order.status === 'delivered' 
                          ? 'bg-green-100 text-black' 
                          : order.status === 'cancelled'
                          ? 'bg-red-100 text-black'
                          : 'bg-yellow-100 text-black'
                      }`}>
                        {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                      </span>
                    </div>
                    <div className="text-right font-medium">
                      ${order.total.toFixed(2)}
                    </div>
                  </div>
                </div>
              ))}
          </div>
        )}
      </div>


    </div>
  );
};

export default CustomerHistoryPage;
