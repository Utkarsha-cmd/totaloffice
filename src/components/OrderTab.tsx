import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { format } from 'date-fns';
import OrderCard from './OrderCard';
import axios from 'axios';
import { serviceApi } from '@/services/api';
import {
  ShoppingCart,
  Plus,
  Minus,
  Package,
  Briefcase,
  Printer,
  Shield,
  Scissors,
  Monitor,
  Leaf,
  Shirt,
  Heart
} from 'lucide-react';

type OrderStatus = 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';

interface OrderItem {
  productId: string;
  name: string;
  quantity: number;
  price: number;
  description: string;
}

export interface Order {
  _id: string;
  orderNumber: string;
  customerName: string;
  items: OrderItem[];
  totalAmount: number;
  shippingAddress: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
  };
  status: OrderStatus;
  paymentStatus: string;
  expectedDeliveryDate?: string;
  createdAt: string;
  updatedAt: string;
}

interface Product {
  _id: string;
  name: string;
  price: number;
  description: string;
  stock: number;
}

interface DisplayProduct {
  id: string;
  name: string;
  price: number;
  description: string;
  inStock: number;
}

interface CartItem extends DisplayProduct {
  quantity: number;
}

interface Address {
  street: string;
  city: string;
  state: string;
  zipCode: string;
  [key: string]: any;
}

interface OrderTabProps {
  customerInfo?: {
    name?: string;
    email?: string;
    paymentMethod?: string;
    address?: Address;
    billingAddress?: string | Address;
  };
}

interface Service {
  _id: string;
  serviceName: string;
  description: string;
  icon?: React.ReactNode;
  products: Product[];
}

export const OrdersTab: React.FC<OrderTabProps> = (props) => {
  // State for services and products
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { toast } = useToast();

  // State for orders
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedStatus, setSelectedStatus] = useState<OrderStatus | 'all'>('all');

  // State for shopping cart
  const [selectedService, setSelectedService] = useState<string>('');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [checkoutStep, setCheckoutStep] = useState<'cart' | 'shipping' | 'payment' | 'review'>('cart');

  // Fetch services from the database
  useEffect(() => {
    const fetchServices = async () => {
      try {
        const data = await serviceApi.getServices();
        // Add icons to services based on service name
        const servicesWithIcons = data.map(service => ({
          ...service,
          icon: getServiceIcon(service.serviceName)
        }));
        setServices(servicesWithIcons);
      } catch (err) {
        console.error('Error fetching services:', err);
        setError('Failed to load services. Please try again later.');
        toast({
          title: 'Error',
          description: 'Failed to load services',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };

    fetchServices();
  }, [toast]);

  // Convert services array to productsByService format
  const productsByService = React.useMemo(() => {
    return services.reduce<Record<string, DisplayProduct[]>>((acc, service) => {
      acc[service._id] = service.products.map(product => ({
        id: product._id,
        name: product.name,
        price: product.price,
        description: product.description || '',
        inStock: product.stock
      }));
      return acc;
    }, {});
  }, [services]);

  // Helper function to get appropriate icon for each service
  const getServiceIcon = (serviceName: string) => {
    const iconMap: Record<string, React.ReactNode> = {
      'Totally Tasty': <Package className="w-6 h-6 text-gray-600" />,
      'Cleaning and Janitorial': <Shield className="w-6 h-6 text-gray-600" />,
      'Business Supplies': <Briefcase className="w-6 h-6 text-gray-600" />,
      'Business Print': <Printer className="w-6 h-6 text-gray-600" />,
      'Managed Print': <Printer className="w-6 h-6 text-gray-600" />,
      'Mailroom Equipment': <Package className="w-6 h-6 text-gray-600" />,
      'Secure Shredding': <Scissors className="w-6 h-6 text-gray-600" />,
      'Workspace': <Monitor className="w-6 h-6 text-gray-600" />,
      'Office Plants': <Leaf className="w-6 h-6 text-gray-600" />,
      'Workwear': <Shirt className="w-6 h-6 text-gray-600" />,
      'Defibrillators': <Heart className="w-6 h-6 text-gray-600" />
    };
    return iconMap[serviceName] || <Package className="w-6 h-6 text-gray-600" />;
  };

  // Fetch orders from the API

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get('/api/orders');
      setOrders(data);
    } catch (error) {
      console.error('Error fetching orders:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch orders',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (orderId: string, status: OrderStatus) => {
    try {
      await axios.put(`/api/orders/${orderId}/status`, { status });
      await fetchOrders();
      toast({
        title: 'Success',
        description: 'Order status updated successfully',
      });
    } catch (error) {
      console.error('Error updating order status:', error);
      toast({
        title: 'Error',
        description: 'Failed to update order status',
        variant: 'destructive',
      });
    }
  };

  const filteredOrders = selectedStatus === 'all'
    ? orders
    : orders.filter(order => order.status === selectedStatus);

  const getStatusCount = (status: OrderStatus) => {
    return orders.filter(order => order.status === status).length;
  };


  const addToCart = (product: DisplayProduct) => {
    if (product.inStock === 0) {
      toast({
        title: 'Out of Stock',
        description: `${product.name} is currently out of stock.`,
        variant: 'destructive',
      });
      return;
    }

    setCart(prevCart => {
      const existingItem = prevCart.find(item => item.id === product.id);
      if (existingItem) {
        if (existingItem.quantity >= product.inStock) {
          toast({
            title: 'Stock Limit Reached',
            description: `Maximum available quantity: ${product.inStock}`,
            variant: 'destructive',
          });
          return prevCart;
        }
        return prevCart.map(item =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prevCart, { ...product, quantity: 1 }];
    });
  };

  const updateQuantity = (productId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      setCart(prevCart => prevCart.filter(item => item.id !== productId));
      return;
    }

    const cartItem = cart.find(item => item.id === productId);
    if (cartItem && newQuantity > cartItem.inStock) {
      toast({
        title: 'Stock Limit Reached',
        description: `Maximum available quantity: ${cartItem.inStock}`,
        variant: 'destructive',
      });
      return;
    }

    setCart(prevCart =>
      prevCart.map(item =>
        item.id === productId ? { ...item, quantity: newQuantity } : item
      )
    );
  };

  const getCartTotal = () =>
    cart.reduce((total, item) => total + item.price * item.quantity, 0);

  const placeOrder = async () => {
    if (cart.length === 0) {
      toast({
        title: 'Empty Cart',
        description: 'Please add items to your cart before placing an order.',
        variant: 'destructive',
      });
      return;
    }

    try {
      // Get user data from localStorage
      const userData = JSON.parse(localStorage.getItem('user') || '{}');
      const token = userData.token;

      if (!token) {
        throw new Error('No authentication token found. Please log in again.');
      }

      // Get customer data from props, localStorage, or user profile
      const getCustomerData = () => {
        try {
          console.log('Customer Info from props:', props); // Debug log

          // Initialize default values
          let address = 'Address not specified';
          let name = 'Customer';
          let email = ''; // Initialize email
          let paymentMethod = 'credit_card';

          // First, try to get user profile from localStorage
          const userProfile = JSON.parse(localStorage.getItem('userProfile') || 'null');

          // If we have a user profile with billing address, use that
          if (userProfile?.billingAddress) {
            // Handle both string and Address object formats for billingAddress
            if (typeof userProfile.billingAddress === 'string') {
              // Clean up the string address
              address = userProfile.billingAddress
                .replace(/\s+/g, ' ')
                .replace(/\s*,\s*/g, ', ')
                .trim();
            } else if (userProfile.billingAddress.street) {
              // Convert Address object to formatted string
              const { street = '', city = '', state = '', zipCode = '' } = userProfile.billingAddress;
              address = [street, city, state, zipCode]
                .filter(Boolean)
                .join(', ')
                .replace(/\s*,\s*/g, ', ')
                .trim();
            }
            console.log('Using billing address from userProfile:', address);

            // Get name from user profile if available
            if (userProfile.name) {
              name = userProfile.name;
              console.log('Using name from userProfile:', name);
            }

            // Get email from user profile if available
            if (userProfile.email) {
              email = userProfile.email;
              console.log('Using email from userProfile:', email);
            }

            // Get payment method from user profile if available
            if (userProfile.paymentMethod) {
              paymentMethod = userProfile.paymentMethod;
              console.log('Using payment method from userProfile:', paymentMethod);
            }

            return { address, name, email, paymentMethod };
          }

          // Fallback to props if no user profile
          if (props?.customerInfo) {
            // Get address from props if available
            if (props.customerInfo.billingAddress) {
              // Handle both string and Address object formats for billingAddress
              if (typeof props.customerInfo.billingAddress === 'string') {
                // Clean up the string address
                address = props.customerInfo.billingAddress
                  .replace(/\s+/g, ' ')
                  .replace(/\s*,\s*/g, ', ')
                  .trim();
              } else if (props.customerInfo.billingAddress.street) {
                // Convert Address object to formatted string
                const { street = '', city = '', state = '', zipCode = '' } = props.customerInfo.billingAddress;
                address = [street, city, state, zipCode]
                  .filter(Boolean)
                  .join(', ')
                  .replace(/\s*,\s*/g, ', ')
                  .trim();
              }
              console.log('Using billing address from props:', address);
            } else if (props.customerInfo.address) {
              // Fallback to old address format if billingAddress not available
              const { street = '', city = '', state = '', zipCode = '' } = props.customerInfo.address;
              address = [street, city, state, zipCode]
                .filter(Boolean)
                .join(', ')
                .replace(/\s*,\s*/g, ', ')
                .trim();
              console.log('Using address from props:', address);
            }

            // Get name from props
            if (props.customerInfo.name) {
              name = props.customerInfo.name;
              console.log('Using name from props:', name);
            }

            // Get email from props
            if (props.customerInfo.email) {
              email = props.customerInfo.email;
              console.log('Using email from props:', email);
            }

            // Get payment method from props
            if (props.customerInfo.paymentMethod) {
              paymentMethod = props.customerInfo.paymentMethod;
              console.log('Using payment method from props:', paymentMethod);
            }

            return { address, name, email, paymentMethod };
          }

          // Fallback to localStorage if no props or user profile
          const storedProfile = localStorage.getItem('customerInfo');
          if (storedProfile) {
            const profile = JSON.parse(storedProfile);

            // Get address from localStorage
            if (profile?.billingAddress) {
              address = profile.billingAddress;
              console.log('Using billing address from localStorage:', address);
            } else if (profile?.address) {
              // Fallback to old address format if billingAddress not available
              const { street, city, state, zipCode } = profile.address;
              address = [street, city, state, zipCode].filter(Boolean).join(',').replace(/,\s+/g, ', ').trim();
              console.log('Using address from localStorage:', address);
            }

            // Get name from localStorage
            if (profile.name) {
              name = profile.name;
              console.log('Using name from localStorage:', name);
            }

            // Get email from localStorage
            if (profile.email) {
              email = profile.email;
              console.log('Using email from localStorage:', email);
            }

            // Get payment method from localStorage
            if (profile.paymentMethod) {
              paymentMethod = profile.paymentMethod;
              console.log('Using payment method from localStorage:', paymentMethod);
            }
          }

          console.log('Final customer data:', { address, name, email, paymentMethod });
          return { address, name, email, paymentMethod };

        } catch (error) {
          console.error('Error getting customer data:', error);
          return {
            address: 'Address not specified',
            name: 'Customer',
            paymentMethod: 'credit_card'
          };
        }
      };

      // Get all customer data at once
      const {
        address: shippingAddress,
        name: customerName,
        paymentMethod,
        email: customerEmail
      } = getCustomerData() as { address: string | Address; name: string; paymentMethod: string; email: string };

      console.log('Final shipping address:', shippingAddress); // Debug log

      // Format the shipping address as a single string with postcode
      let formattedAddress = '';

      // First, get the full billing address from user profile as it contains the complete address
      const userProfile = JSON.parse(localStorage.getItem('userProfile') || 'null');
      const billingAddress = userProfile?.billingAddress;

      if (billingAddress) {
        // Use the full billing address if available
        if (typeof billingAddress === 'string') {
          formattedAddress = billingAddress
            .replace(/\s+/g, ' ')
            .replace(/\s*,\s*/g, ', ')
            .trim();
        } else if (billingAddress.street) {
          // If it's an address object, format it properly
          const { street = '', city = '', state = '', zipCode = '' } = billingAddress;
          formattedAddress = [street, city, state, zipCode]
            .filter(Boolean)
            .join(', ')
            .replace(/\s*,\s*/g, ', ')
            .trim();
        }
      }

      // Fallback to the provided shipping address if we couldn't get the billing address
      if (!formattedAddress) {
        if (typeof shippingAddress === 'string') {
          formattedAddress = shippingAddress
            .replace(/\s+/g, ' ')
            .replace(/\s*,\s*/g, ', ')
            .trim();
        } else if (shippingAddress && typeof shippingAddress === 'object' && !Array.isArray(shippingAddress)) {
          const { street = '', city = '', state = '', zipCode = '' } = shippingAddress;
          formattedAddress = [street, city, state, zipCode]
            .filter(Boolean)
            .join(', ')
            .replace(/\s*,\s*/g, ', ')
            .trim();
        } else if (Array.isArray(shippingAddress)) {
          formattedAddress = shippingAddress
            .filter(Boolean)
            .join(', ')
            .replace(/\s*,\s*/g, ', ')
            .trim();
        }
      }

      console.log('Formatted shipping address:', formattedAddress);

      // Ensure we have a valid address
      if (!formattedAddress) {
        throw new Error('Please provide a valid shipping address');
      }

      // Ensure the postcode is included in the address
      if (formattedAddress && !/\b[A-Z0-9]{1,4}\s*[A-Z0-9]{1,4}\b/i.test(formattedAddress)) {
        console.warn('Warning: Shipping address appears to be missing a postcode');
      }

      const orderData = {
        items: cart.map(item => ({
          id: item.id,
          name: item.name,
          quantity: item.quantity,
          price: item.price,
          description: item.description
        })),
        customerName: customerName,
        customerEmail: customerEmail,
        shippingAddress: formattedAddress, // Send as a single string
        paymentMethod: paymentMethod
      };

      // Use the full URL with the correct backend port
      const apiUrl = 'http://localhost:5000/api/orders';

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        credentials: 'include', // Important for sending cookies if using them
        body: JSON.stringify(orderData)
      });

      if (!response.ok) {
        let errorMessage = 'Failed to place order';
        try {
          // Try to parse the error response as JSON
          const errorData = await response.json();
          errorMessage = errorData.message || errorMessage;
        } catch (e) {
          // If response is not JSON, use status text
          errorMessage = response.statusText || errorMessage;
        }
        throw new Error(errorMessage);
      }

      const order = await response.json();

      // Refresh services to get updated stock levels
      try {
        const updatedServices = await serviceApi.getServices();
        const servicesWithIcons = updatedServices.map(service => ({
          ...service,
          icon: getServiceIcon(service.serviceName)
        }));
        setServices(servicesWithIcons);
      } catch (err) {
        console.error('Error refreshing services:', err);
        // Don't fail the order if refresh fails, just log the error
      }

      toast({
        title: 'Order Placed Successfully!',
        description: `Your order #${order._id} has been received. Total: $${getCartTotal().toFixed(2)}`,
        className: 'bg-white text-black border border-gray-200',
      });

      setCart([]);
    } catch (error) {
      console.error('Error placing order:', error);
      toast({
        title: 'Order Failed',
        description: error.message || 'There was an error placing your order. Please try again.',
        variant: 'destructive',
        className: 'bg-white text-black border-emerald-300 border border-gray-200',
      });
    }
  };

  const selectedProducts = selectedService && productsByService[selectedService]
    ? productsByService[selectedService]
    : [];

  return (
    <div className="space-y-6">
  {!selectedService ? (
    <div>
      <h2 className="text-2xl font-semibold text-gray-700 mb-6">Select a Service</h2>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {services.map(service => (
          <Card
            key={service._id}
            tabIndex={0}
            className="cursor-pointer hover:shadow-md transition-shadow bg-white border border-gray-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500"
            onClick={() => setSelectedService(service._id)}
          >
            <CardHeader>
              <CardTitle className="text-lg text-black">{service.serviceName}</CardTitle>
              <p className="text-sm text-gray-500">{service.description}</p>
            </CardHeader>
          </Card>
        ))}
      </div>
    </div>
  ) : (
    <div className="grid gap-6 lg:grid-cols-[1fr_350px]">
      {/* Products */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-semibold text-gray-700">
            {services.find(s => s._id === selectedService)?.serviceName} Products
          </h2>
          <button
            onClick={() => setSelectedService('')}
            className="text-emerald-700 border border-emerald-100 bg-emerald-50 hover:bg-emerald-100 px-4 py-2 rounded-md text-sm font-medium transition-colors focus:outline-none focus:ring-0 focus:ring-offset-0"
          >
            Back to Services
          </button>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          {selectedProducts.map(product => (
            <Card key={product.id} className="bg-white border border-gray-200">
              <CardContent className="p-4">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-semibold text-gray-800">{product.name}</h3>
                  <div className="text-right">
                    <div className="font-bold text-lg text-gray-700">${product.price}</div>
                    <span
                      className={`text-xs font-medium px-2 py-1 rounded ${product.inStock > 0
                        ? 'bg-gray-200 text-gray-800'
                        : 'bg-gray-100 text-gray-500'
                        }`}
                    >
                      {product.inStock > 0
                        ? `${product.inStock} in stock`
                        : 'Out of stock'}
                    </span>
                  </div>
                </div>
                <p className="text-sm text-gray-500 mb-3">{product.description}</p>
                <Button
                  onClick={() => addToCart(product)}
                  disabled={product.inStock === 0}
                  className="w-full bg-emerald-600 text-white hover:bg-emerald-700 hover:text-white focus:ring-0 focus:ring-offset-0"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add to Cart
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Cart */}
      <Card className="h-fit sticky top-4 bg-white border border-gray-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-gray-700">
            <ShoppingCart className="w-5 h-5" />
            Cart ({cart.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {cart.length === 0 ? (
            <p className="text-gray-500 text-center py-4">Your cart is empty</p>
          ) : (
            <div className="space-y-4">
              {cart.map(item => (
                <div key={item.id} className="flex justify-between items-center">
                  <div className="flex-1">
                    <div className="font-medium text-sm text-gray-800">{item.name}</div>
                    <div className="text-sm text-gray-500">${item.price} each</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      className="w-8 h-8 flex items-center justify-center text-emerald-700 border border-emerald-100 bg-emerald-50 hover:bg-emerald-100 rounded-md focus:outline-none focus:ring-0"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <input
                      type="number"
                      value={item.quantity}
                      onChange={e =>
                        updateQuantity(item.id, parseInt(e.target.value) || 0)
                      }
                      className="w-16 text-center text-gray-800 border border-gray-200 focus:border-gray-300 focus:ring-0 rounded-md"
                      min="0"
                      max={item.inStock}
                    />
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      className="w-8 h-8 flex items-center justify-center text-emerald-700 border border-emerald-100 bg-emerald-50 hover:bg-emerald-100 rounded-md focus:outline-none focus:ring-0"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              ))}
              <div className="border-t border-gray-200 pt-4">
                <div className="flex justify-between items-center mb-4">
                  <span className="font-semibold text-gray-700">Total:</span>
                  <span className="font-bold text-lg text-gray-900">
                    ${getCartTotal().toFixed(2)}
                  </span>
                </div>
                <button
                  onClick={placeOrder}
                  className="w-full bg-emerald-600 text-white hover:bg-emerald-700 rounded-md py-2 px-4 font-medium transition-colors focus:outline-none focus:ring-0 focus:ring-offset-0 focus:ring-transparent"
                >
Place Order
                </button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )}
</div>
  );
};