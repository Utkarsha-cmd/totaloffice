import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { format } from 'date-fns';
import OrderCard from './OrderCard';
import axios from 'axios';

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

interface Product {
  id: string;
  name: string;
  price: number;
  description: string;
  inStock: number;
}

interface CartItem extends Product {
  quantity: number;
}

interface Address {
  street: string;
  city: string;
  state: string;
  zipCode: string;
  [key: string]: any; // Allow additional properties
}

interface OrderTabProps {
  customerInfo?: {
    name?: string;
    email?: string;
    paymentMethod?: string;
    address?: Address;
    billingAddress?: string | Address; // Allow billingAddress to be either string or Address
  };
}

const services = [
  {
    id: 'totally-tasty',
    name: 'Totally Tasty',
    icon: <Package className="w-6 h-6 text-gray-600" />,
    description: 'Premium food and beverage services',
  },
  {
    id: 'cleaning-janitorial',
    name: 'Cleaning and Janitorial Supplies',
    icon: <Shield className="w-6 h-6 text-gray-600" />,
    description: 'Professional cleaning and maintenance supplies',
  },
  {
    id: 'business-supplies',
    name: 'Business Supplies',
    icon: <Briefcase className="w-6 h-6 text-gray-600" />,
    description: 'Essential office and business supplies',
  },
  {
    id: 'business-print',
    name: 'Business Print',
    icon: <Printer className="w-6 h-6 text-gray-600" />,
    description: 'Professional printing services',
  },
  {
    id: 'managed-print',
    name: 'Managed Print',
    icon: <Printer className="w-6 h-6 text-gray-600" />,
    description: 'Complete print management solutions',
  },
  {
    id: 'mailroom-equipment',
    name: 'Mailroom Equipment',
    icon: <Package className="w-6 h-6 text-gray-600" />,
    description: 'Mailroom and shipping equipment',
  },
  {
    id: 'secure-shredding',
    name: 'Secure Shredding',
    icon: <Scissors className="w-6 h-6 text-gray-600" />,
    description: 'Secure document destruction services',
  },
  {
    id: 'workspace',
    name: 'Workspace',
    icon: <Monitor className="w-6 h-6 text-gray-600" />,
    description: 'Complete workspace solutions',
  },
  {
    id: 'office-plants',
    name: 'Office Plants & Plant Displays',
    icon: <Leaf className="w-6 h-6 text-gray-600" />,
    description: 'Beautiful plants and displays for your office',
  },
  {
    id: 'workwear',
    name: 'Workwear',
    icon: <Shirt className="w-6 h-6 text-gray-600" />,
    description: 'Professional workwear and uniforms',
  },
  {
    id: 'defibrillators',
    name: 'Defibrillators',
    icon: <Heart className="w-6 h-6 text-gray-600" />,
    description: 'Life-saving medical equipment',
  },
];

const productsByService: Record<string, Product[]> = {
  'totally-tasty': [
    { id: 'tt-1', name: 'Premium Coffee Beans', price: 24.99, description: 'Organic fair-trade coffee beans', inStock: 50 },
    { id: 'tt-2', name: 'Gourmet Sandwich Platter', price: 89.99, description: 'Assorted gourmet sandwiches for events', inStock: 25 },
    { id: 'tt-3', name: 'Fresh Fruit Bowl', price: 34.99, description: 'Seasonal fresh fruit arrangement', inStock: 30 },
    { id: 'tt-4', name: 'Bottled Water (24-pack)', price: 12.99, description: 'Premium spring water', inStock: 100 }
  ],
  'cleaning-janitorial': [
    { id: 'cj-1', name: 'Multi-Surface Cleaner', price: 15.99, description: 'Professional-grade multi-surface cleaner', inStock: 75 },
    { id: 'cj-2', name: 'Microfiber Cleaning Cloths', price: 8.99, description: 'Pack of 12 premium microfiber cloths', inStock: 60 },
    { id: 'cj-3', name: 'Toilet Paper (36-roll)', price: 45.99, description: 'Commercial-grade toilet paper', inStock: 40 },
    { id: 'cj-4', name: 'Hand Sanitizer (1L)', price: 12.99, description: 'Antibacterial hand sanitizer', inStock: 80 }
  ],
  'business-supplies': [
    { id: 'bs-1', name: 'Copy Paper (5 Ream)', price: 39.99, description: 'High-quality white copy paper', inStock: 120 },
    { id: 'bs-2', name: 'Ballpoint Pens (12-pack)', price: 7.99, description: 'Professional blue ink pens', inStock: 200 },
    { id: 'bs-3', name: 'Sticky Notes Set', price: 12.99, description: 'Assorted sizes and colors', inStock: 150 },
    { id: 'bs-4', name: 'File Folders (25-pack)', price: 18.99, description: 'Manila file folders', inStock: 85 }
  ],
  'business-print': [
    { id: 'bp-1', name: 'Business Cards (500)', price: 49.99, description: 'Premium business card printing', inStock: 0 },
    { id: 'bp-2', name: 'Letterhead (250 sheets)', price: 89.99, description: 'Custom letterhead printing', inStock: 15 },
    { id: 'bp-3', name: 'Brochures (100)', price: 69.99, description: 'Tri-fold color brochures', inStock: 20 },
    { id: 'bp-4', name: 'Presentation Folders', price: 129.99, description: 'Custom presentation folders', inStock: 10 }
  ],
  'managed-print': [
    { id: 'mp-1', name: 'Printer Maintenance Kit', price: 199.99, description: 'Complete printer maintenance package', inStock: 12 },
    { id: 'mp-2', name: 'Toner Cartridge Set', price: 159.99, description: 'Full color toner cartridge set', inStock: 25 },
    { id: 'mp-3', name: 'Print Analytics Software', price: 299.99, description: 'One-year license for print management', inStock: 5 },
    { id: 'mp-4', name: 'Network Print Setup', price: 149.99, description: 'Professional network printer setup', inStock: 999 }
  ],
  'mailroom-equipment': [
    { id: 'me-1', name: 'Postage Scale', price: 89.99, description: 'Digital postage scale up to 10lbs', inStock: 15 },
    { id: 'me-2', name: 'Letter Opener (Electric)', price: 179.99, description: 'Automatic letter opening machine', inStock: 8 },
    { id: 'me-3', name: 'Mailbox Organizer', price: 45.99, description: 'Desktop mail sorting organizer', inStock: 35 },
    { id: 'me-4', name: 'Shipping Labels (500)', price: 24.99, description: 'Self-adhesive shipping labels', inStock: 70 }
  ],
  'secure-shredding': [
    { id: 'ss-1', name: 'Secure Shredding Service', price: 79.99, description: 'One-time secure document shredding', inStock: 999 },
    { id: 'ss-2', name: 'Security Bins (3-pack)', price: 149.99, description: 'Lockable document security bins', inStock: 20 },
    { id: 'ss-3', name: 'Certificate of Destruction', price: 25.99, description: 'Official destruction certificate', inStock: 999 },
    { id: 'ss-4', name: 'Monthly Shredding Plan', price: 199.99, description: 'Monthly pickup and shredding service', inStock: 999 }
  ],
  'workspace': [
    { id: 'ws-1', name: 'Ergonomic Office Chair', price: 299.99, description: 'Premium ergonomic desk chair', inStock: 18 },
    { id: 'ws-2', name: 'Standing Desk Converter', price: 249.99, description: 'Adjustable standing desk converter', inStock: 12 },
    { id: 'ws-3', name: 'Monitor Arm', price: 89.99, description: 'Dual monitor mounting arm', inStock: 25 },
    { id: 'ws-4', name: 'Desk Organizer Set', price: 34.99, description: 'Complete desk organization system', inStock: 45 }
  ],
  'office-plants': [
    { id: 'op-1', name: 'Pothos Plant', price: 29.99, description: 'Low-maintenance office plant', inStock: 30 },
    { id: 'op-2', name: 'Snake Plant', price: 39.99, description: 'Air-purifying desk plant', inStock: 25 },
    { id: 'op-3', name: 'Plant Care Service', price: 99.99, description: 'Monthly plant maintenance service', inStock: 999 },
    { id: 'op-4', name: 'Large Floor Plant Display', price: 199.99, description: 'Statement floor plant with planter', inStock: 8 }
  ],
  'workwear': [
    { id: 'ww-1', name: 'Professional Polo Shirt', price: 34.99, description: 'Branded polo shirt with logo', inStock: 100 },
    { id: 'ww-2', name: 'Safety Vest', price: 19.99, description: 'High-visibility safety vest', inStock: 80 },
    { id: 'ww-3', name: 'Work Pants', price: 45.99, description: 'Durable work pants', inStock: 60 },
    { id: 'ww-4', name: 'Steel Toe Boots', price: 129.99, description: 'Safety steel toe work boots', inStock: 35 }
  ],
  'defibrillators': [
    { id: 'df-1', name: 'AED Training Unit', price: 599.99, description: 'Training-only AED unit', inStock: 5 },
    { id: 'df-2', name: 'AED Wall Cabinet', price: 149.99, description: 'Secure wall-mounted AED cabinet', inStock: 12 },
    { id: 'df-3', name: 'AED Training Course', price: 299.99, description: 'Certified AED training course', inStock: 999 },
    { id: 'df-4', name: 'Replacement Pads', price: 89.99, description: 'AED electrode pads', inStock: 25 }
  ]
};

export const OrdersTab: React.FC<OrderTabProps> = (props) => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState<OrderStatus | 'all'>('all');
  const { toast } = useToast();

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
  const [selectedService, setSelectedService] = useState<string>('');
  const [cart, setCart] = useState<CartItem[]>([]);

  const addToCart = (product: Product) => {
    if (product.inStock === 0) {
      toast({
        title: 'Out of Stock',
        description: `${product.name} is currently out of stock.`,
        variant: 'destructive',
      });
      return;
    }

    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        if (existing.quantity >= product.inStock) {
          toast({
            title: 'Stock Limit Reached',
            description: `Maximum available quantity: ${product.inStock}`,
            variant: 'destructive',
          });
          return prev;
        }
        return prev.map(item =>
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, { ...product, quantity: 1 }];
    });
  };

  const updateQuantity = (productId: string, newQuantity: number) => {
    if (newQuantity === 0) {
      setCart(prev => prev.filter(item => item.id !== productId));
      return;
    }

    const product = cart.find(item => item.id === productId);
    if (product && newQuantity > product.inStock) {
      toast({
        title: 'Stock Limit Reached',
        description: `Maximum available quantity: ${product.inStock}`,
        variant: 'destructive',
      });
      return;
    }

    setCart(prev =>
      prev.map(item =>
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
      });
    }
  };

  const selectedProducts = selectedService
    ? productsByService[selectedService] || []
    : [];

  return (
  <div className="space-y-6">
    {!selectedService ? (
      <div>
        <h2 className="text-2xl font-semibold text-gray-700 mb-6">Select a Service</h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {services.map(service => (
            <Card
              key={service.id}
              className="bg-white border border-gray-200 cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => setSelectedService(service.id)}
            >
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-3">
                  {service.icon}
                  <h3 className="font-semibold text-gray-800">{service.name}</h3>
                </div>
                <p className="text-sm text-gray-500">{service.description}</p>
              </CardContent>
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
              {services.find(s => s.id === selectedService)?.name} Products
            </h2>
            <Button
              className="text-gray-700 border-gray-300 hover:bg-gray-100"
              variant="outline"
              onClick={() => setSelectedService('')}
            >
              Back to Services
            </Button>
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
                        className={`text-xs font-medium px-2 py-1 rounded ${
                          product.inStock > 0
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
                    className="w-full bg-gray-800 text-white hover:bg-gray-700"
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
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-gray-700 border-gray-300"
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      >
                        <Minus className="w-3 h-3" />
                      </Button>
                      <Input
                        type="number"
                        value={item.quantity}
                        onChange={e =>
                          updateQuantity(item.id, parseInt(e.target.value) || 0)
                        }
                        className="w-16 text-center text-gray-800 border-gray-300"
                        min="0"
                        max={item.inStock}
                      />
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-gray-700 border-gray-300"
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      >
                        <Plus className="w-3 h-3" />
                      </Button>
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
                  <Button className="w-full bg-gray-800 text-white hover:bg-gray-700"
                    onClick={placeOrder}>
                    Place Order
                  </Button>
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