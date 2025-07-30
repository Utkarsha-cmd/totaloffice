import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { Save, Loader2 } from 'lucide-react';
import { orderService } from '@/services/orderService';

interface OrderItem {
  _id: string;
  name: string;
  quantity: number;
  price: number;
  isShipped?: boolean;
  productId: string;
}

type OrderStatus = 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';

interface Order {
  _id: string;
  orderNumber: string;
  user?: {
    _id: string;
    name: string;
    email: string;
    company?: string;
  };
  customerName: string;
  items: OrderItem[];
  status: OrderStatus;
  shippingAddress: string | {
    street: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
    phone?: string;
    company?: string;
    name?: string;
  };
  orderDate: string;
  expectedDelivery?: string;
  paymentStatus: string;
  paymentMethod: string;
  totalAmount: number;
  createdAt: string;
  updatedAt: string;
}

interface WarehouseDashboardProps {
  username: string;
  userType: string;
  onLogout: () => void;
}

// Helper function to map backend order to frontend order
const mapBackendOrder = (backendOrder: any): Order => {
  // Calculate total from items if totalAmount is not provided
  const calculateTotal = () => {
    if (backendOrder.totalAmount) return backendOrder.totalAmount;
    if (backendOrder.total) return backendOrder.total;
    if (backendOrder.items && backendOrder.items.length > 0) {
      return backendOrder.items.reduce((sum: number, item: any) => {
        return sum + ((item.price || 0) * (item.quantity || 0));
      }, 0);
    }
    return 0;
  };

  return {
    ...backendOrder,
    customerName: backendOrder.user?.name || backendOrder.customerName || 'Guest Customer',
    orderDate: backendOrder.orderDate || backendOrder.createdAt,
    items: backendOrder.items || [],
    totalAmount: calculateTotal()
  };
};

const WarehouseDashboard: React.FC<WarehouseDashboardProps> = ({ username, userType, onLogout }) => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [deliveredOrders, setDeliveredOrders] = useState<Order[]>([]);
  const [activeTab, setActiveTab] = useState<'new' | 'delivered'>('new');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        const allOrders = await orderService.getOrders();
        
        // Map and separate orders
        const mappedOrders = allOrders.map(mapBackendOrder);
        const processingOrders = mappedOrders.filter(
          order => order.status === 'processing'
        );
        const delivered = mappedOrders.filter(
          order => order.status === 'delivered'
        );
        
        setOrders(processingOrders);
        setDeliveredOrders(delivered);
      } catch (err) {
        console.error('Error fetching orders:', err);
        setError('Failed to load orders. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  const handleToggle = async (orderId: string, itemId: string) => {
    try {
      // Update local state optimistically
      setOrders(prev =>
        prev.map(order => ({
          ...order,
          items: order.items.map(item =>
            item._id === itemId ? { ...item, isShipped: !item.isShipped } : item
          )
        }))
      );

      // No need to update status here, will be handled by save
    } catch (err) {
      console.error('Error toggling item status:', err);
      // Revert on error by refetching
      const allOrders = await orderService.getOrders();
      const mappedOrders = allOrders.map(mapBackendOrder);
      setOrders(mappedOrders.filter(o => o.status !== 'delivered' && o.status !== 'cancelled'));
    }
  };

  const handleSaveOrder = async (orderId: string) => {
    try {
      const order = orders.find(o => o._id === orderId);
      if (!order) return;

      // Update order status based on items shipped
      const allItemsShipped = order.items.every(item => item.isShipped);
      const status = allItemsShipped ? 'shipped' : 'processing';
      
      await orderService.updateOrderStatus(orderId, status);
      
      // Refresh orders after update
      const allOrders = await orderService.getOrders();
      const mappedOrders = allOrders.map(mapBackendOrder);
      
      // Filter orders based on their status
      setOrders(mappedOrders.filter(o => o.status === 'processing'));
      setDeliveredOrders(mappedOrders.filter(o => o.status === 'delivered'));
      
      alert(`Order ${order.orderNumber} has been updated successfully!`);
    } catch (err) {
      console.error('Error saving order:', err);
      alert('Failed to update order. Please try again.');
      
      // Revert on error by refetching
      const allOrders = await orderService.getOrders();
      const mappedOrders = allOrders.map(mapBackendOrder);
      setOrders(mappedOrders.filter(o => o.status === 'processing'));
      setDeliveredOrders(mappedOrders.filter(o => o.status === 'delivered'));
    }
  };


  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <div className="w-64 bg-white shadow-md flex flex-col justify-between">
        <div className="p-6">
          <h2 className="text-xl font-bold text-emerald-600 mb-6">Warehouse</h2>
          <div className="space-y-2">
            <button
              onClick={() => setActiveTab('new')}
              className={`w-full text-left px-4 py-2 rounded-md font-medium ${
                activeTab === 'new'
                  ? 'bg-emerald-500 text-white'
                  : 'hover:bg-gray-100 text-gray-800'
              }`}
            >
              New Orders
            </button>
            <button
              onClick={() => setActiveTab('delivered')}
              className={`w-full text-left px-4 py-2 rounded-md font-medium ${
                activeTab === 'delivered'
                  ? 'bg-emerald-500 text-white'
                  : 'hover:bg-gray-100 text-gray-800'
              }`}
            >
              Orders Delivered
            </button>
          </div>
        </div>

        {/* Logout section at the bottom */}
        <div className="p-6 border-t text-sm text-gray-600">
          <p className="mb-2">Logged in as <strong>{username}</strong></p>
          <Button onClick={onLogout} className="bg-red-500 hover:bg-red-600 text-white w-full">
            Logout
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-6">
        {activeTab === 'new' ? (
          <Card className="shadow-lg bg-white">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-gray-800">New Orders</CardTitle>
            </CardHeader>
            <CardContent className="overflow-x-auto">
              {loading ? (
                <div className="flex justify-center items-center p-8">
                  <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
                  <span className="ml-2">Loading orders...</span>
                </div>
              ) : error ? (
                <div className="p-4 text-red-600 bg-red-50 rounded-md">
                  {error}
                </div>
              ) : orders.length === 0 ? (
                <div className="p-4 text-gray-500 text-center">No new orders found.</div>
              ) : (
                orders.map((order) => (
                  <div key={order._id} className="mb-6 border border-gray-200 rounded-md p-4 relative">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-md font-bold text-emerald-600">Order #{order.orderNumber}</h3>
                        <p className="text-sm text-gray-600">
                          Company: <strong>{order.customerName || 'N/A'}</strong>
                        </p>
                        <p className="text-sm text-gray-500 mt-1">
                          Order Date: {new Date(order.orderDate || order.createdAt || Date.now()).toLocaleDateString()}
                        </p>
                        <p className="text-sm text-gray-500">
                          Shipping: <span className="font-medium">
                            {typeof order.shippingAddress === 'string' 
                              ? order.shippingAddress 
                              : order.shippingAddress 
                                ? `${order.shippingAddress.street || ''}, ${order.shippingAddress.city || ''} ${order.shippingAddress.state || ''} ${order.shippingAddress.postalCode || ''}`.trim() 
                                : 'Not specified'}
                          </span>
                        </p>
                        <p className="text-sm text-gray-500">
                          Status: <span className="font-medium capitalize">{order.status || 'pending'}</span>
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        className="text-emerald-600 hover:text-emerald-800"
                        onClick={() => handleSaveOrder(order._id)}
                        disabled={order.status === 'shipped' || order.status === 'delivered'}
                      >
                        <Save className="w-5 h-5 mr-1" />
                        <span className="text-sm">Mark as Shipped</span>
                      </Button>
                    </div>

                    <table className="min-w-full border border-gray-300 shadow-sm rounded-lg overflow-hidden">
                      <thead className="bg-green-100 text-gray-900 font-semibold border-b border-gray-300">
                        <tr>
                          <th className="py-2 px-4 border border-gray-300">Product</th>
                          <th className="py-2 px-4 border border-gray-300">Quantity</th>
                          <th className="py-2 px-4 border border-gray-300">Price</th>
                          <th className="py-2 px-4 border text-center border-gray-300">Shipped</th>
                        </tr>
                      </thead>
                      <tbody>
                        {order.items.map((item) => (
                          <tr key={item._id} className="border-t text-gray-800">
                            <td className="py-2 px-4 border border-gray-300">{item.name}</td>
                            <td className="py-2 px-4 border border-gray-300">{item.quantity}</td>
                            <td className="py-2 px-4 border border-gray-300">
                              ${(item.price * item.quantity).toFixed(2)}
                            </td>
                            <td className="py-2 px-4 border border-gray-300 text-center">
                              <Checkbox
                                checked={item.isShipped || false}
                                onCheckedChange={() => handleToggle(order._id, item._id)}
                                disabled={order.status === 'shipped' || order.status === 'delivered'}
                              />
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        ) : (
          <Card className="shadow-lg bg-white">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-gray-800">Delivered Orders</CardTitle>
            </CardHeader>
            <CardContent className="overflow-x-auto">
              {loading ? (
                <div className="flex justify-center items-center p-8">
                  <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
                </div>
              ) : deliveredOrders.length === 0 ? (
                <div className="p-4 text-gray-500 text-center">No delivered orders found.</div>
              ) : (
                <div className="space-y-4">
                  {deliveredOrders.map((order) => {
                    const orderDate = order.orderDate || order.createdAt;
                    const shippingAddress = typeof order.shippingAddress === 'string' 
                      ? order.shippingAddress 
                      : order.shippingAddress 
                        ? `${order.shippingAddress.street || ''} ${order.shippingAddress.city || ''} ${order.shippingAddress.state || ''} ${order.shippingAddress.postalCode || ''}`.trim()
                        : 'Not specified';
                    
                    return (
                      <div key={order._id} className="border rounded-lg p-4 bg-white shadow-sm">
                        <div className="flex justify-between items-start mb-3 border-b pb-2">
                          <div>
                            <h3 className="font-bold text-lg text-black">Order #{order.orderNumber || 'N/A'}</h3>
                            <p className="text-sm text-gray-700">
                              {orderDate ? new Date(orderDate).toLocaleDateString('en-US', {
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              }) : 'Date not available'}
                            </p>
                          </div>
                          <div className="text-right">
                            <span className={`px-2 py-1 rounded text-xs font-medium ${
                              order.status === 'delivered' ? 'bg-green-100 text-green-800' :
                              order.status === 'processing' ? 'bg-blue-100 text-blue-800' :
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {order.status ? order.status.charAt(0).toUpperCase() + order.status.slice(1) : 'Unknown'}
                            </span>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-black mt-3">
                          {/* Customer Information */}
                          <div className="space-y-1">
                            <h4 className="font-semibold text-gray-700 border-b pb-1">Customer</h4>
                            <p className="font-medium">{order.customerName || order.user?.name || 'Guest Customer'}</p>
                            {order.user?.company && (
                              <p className="text-gray-700">{order.user.company}</p>
                            )}
                            {order.user?.email && (
                              <p className="text-gray-600 text-sm">{order.user.email}</p>
                            )}
                          </div>
                          
                          {/* Shipping Information */}
                          <div className="space-y-1">
                            <h4 className="font-semibold text-gray-700 border-b pb-1">Shipping</h4>
                            <p className="whitespace-pre-line">{shippingAddress || 'Not specified'}</p>
                            {order.expectedDelivery && (
                              <p className="mt-1">
                                <span className="font-medium">Expected:</span> {new Date(order.expectedDelivery).toLocaleDateString()}
                              </p>
                            )}
                          </div>
                        </div>
                        
                        {/* Order Summary */}
                        <div className="mt-3 text-sm text-black">
                          <p><span className="font-medium">Total Items:</span> {order.items?.length || 0}</p>
                          <p><span className="font-medium">Order Total:</span> ${order.totalAmount?.toFixed(2) || '0.00'}</p>
                        </div>
                        
                        {/* Items List */}
                        {order.items?.length > 0 && (
                          <div className="mt-4 border-t pt-3">
                            <h4 className="font-semibold text-black mb-2">Items</h4>
                            <div className="space-y-2">
                              {order.items.map((item, index) => (
                                <div key={item._id || index} className="flex justify-between text-sm text-black">
                                  <span className="text-black">{item.quantity} × {item.name || 'Unnamed Item'}</span>
                                  <span className="text-black">${(item.price || 0).toFixed(2)}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default WarehouseDashboard;
