import axios from 'axios';

const API_URL = 'http://localhost:5000/api/orders';

// Create axios instance with default config
const api = axios.create({
  baseURL: 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add a request interceptor to include the auth token
api.interceptors.request.use(
  (config) => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    if (user?.token) {
      config.headers.Authorization = `Bearer ${user.token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export interface OrderItem {
  id: string;
  name: string;
  category: string;
  quantity: number;
  price: number;
  description?: string;
}

export interface ShippingAddress {
  firstName: string;
  lastName: string;
  company?: string;
  street: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  phone?: string;
}

export interface Order {
  _id: string;
  orderNumber: string;
  customerId: string;
  customerName: string;
  customerEmail: string;
  items: OrderItem[];
  subtotal: number;
  tax: number;
  shipping: number;
  total: number;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  shippingAddress: ShippingAddress;
  billingAddress: ShippingAddress;
  paymentMethod: string;
  trackingNumber?: string;
  orderDate: string;
  estimatedDelivery?: string;
  notes?: string;
}

const mapBackendOrderToFrontend = (backendOrder: any): Order => {
  return {
    _id: backendOrder._id,
    orderNumber: backendOrder.orderNumber,
    customerId: backendOrder.user?._id || '',
    customerName: backendOrder.customerName,
    customerEmail: backendOrder.user?.email || 'guest@example.com',
    items: backendOrder.items.map((item: any) => ({
      id: item.productId || item.id,
      name: item.name,
      category: item.category || 'Uncategorized',
      quantity: item.quantity,
      price: item.price,
      description: item.description
    })),
    subtotal: backendOrder.items.reduce((sum: number, item: any) => sum + (item.price * item.quantity), 0),
    tax: 0, // Not provided by backend
    shipping: 0, // Not provided by backend
    total: backendOrder.totalAmount,
    status: backendOrder.status,
    shippingAddress: typeof backendOrder.shippingAddress === 'string' ? {
      street: backendOrder.shippingAddress,
      city: '',
      state: '',
      postalCode: '',
      country: '',
      firstName: backendOrder.customerName?.split(' ')[0] || '',
      lastName: backendOrder.customerName?.split(' ').slice(1).join(' ') || ''
    } : {
      ...backendOrder.shippingAddress,
      state: backendOrder.shippingAddress.state || '',
      phone: backendOrder.shippingAddress.phone || ''
    },
    billingAddress: (backendOrder.billingAddress && typeof backendOrder.billingAddress === 'object') 
      ? { ...backendOrder.billingAddress }
      : (backendOrder.shippingAddress ? {
        street: typeof backendOrder.shippingAddress === 'string' ? backendOrder.shippingAddress : '',
        city: '',
        state: '',
        postalCode: '',
        country: '',
        firstName: backendOrder.customerName?.split(' ')[0] || '',
        lastName: backendOrder.customerName?.split(' ').slice(1).join(' ') || ''
      } : {
        street: '',
        city: '',
        state: '',
        postalCode: '',
        country: '',
        firstName: '',
        lastName: ''
      }),
    paymentMethod: backendOrder.paymentMethod,
    orderDate: backendOrder.createdAt || new Date().toISOString(),
    estimatedDelivery: backendOrder.estimatedDelivery,
    trackingNumber: backendOrder.trackingNumber,
    notes: backendOrder.notes
  };
};

export const orderService = {
  // Get all orders (for admin/staff)
  async getOrders(): Promise<Order[]> {
    try {
      const response = await api.get('/orders/admin/orders');
      return Array.isArray(response.data) 
        ? response.data.map(mapBackendOrderToFrontend)
        : [];
    } catch (error) {
      console.error('Error fetching admin orders:', error);
      this.handleAuthError(error);
      throw error;
    }
  },

  // Get orders for the current customer
  async getCustomerOrders(): Promise<Order[]> {
    try {
      const response = await api.get('/orders');
      return Array.isArray(response.data) 
        ? response.data.map(mapBackendOrderToFrontend)
        : [];
    } catch (error) {
      console.error('Error fetching customer orders:', error);
      this.handleAuthError(error);
      throw error;
    }
  },

  // Get a single order by ID
  async getOrderById(orderId: string): Promise<Order | null> {
    try {
      const response = await api.get(`/orders/${orderId}`);
      return response.data ? mapBackendOrderToFrontend(response.data) : null;
    } catch (error) {
      console.error('Error fetching order:', error);
      this.handleAuthError(error);
      throw error;
    }
  },

  // Handle authentication errors
  private handleAuthError(error: any): void {
    if (error.response?.status === 401 || error.response?.status === 403) {
      // Handle unauthorized/forbidden errors
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      if (user?.token) {
        // If we have a token but still get auth error, it might be expired
        localStorage.removeItem('user');
        window.location.href = '/login';
      }
    }
  },

  async updateOrderStatus(orderId: string, status: Order['status']): Promise<Order> {
    try {
      const response = await api.put<any>(`/orders/${orderId}/status`, { status });
      return mapBackendOrderToFrontend(response.data);
    } catch (error) {
      console.error('Error updating order status:', error);
      if (error.response?.status === 401) {
        // Handle unauthorized error (e.g., redirect to login)
        localStorage.removeItem('user');
        window.location.href = '/login';
      }
      throw error;
    }
  },

  async updateExpectedDeliveryDate(orderId: string, date: Date): Promise<Order> {
    try {
      const response = await api.put(`/orders/${orderId}/delivery-date`, { 
        expectedDelivery: date.toISOString() 
      });
      return mapBackendOrderToFrontend(response.data);
    } catch (error) {
      console.error('Error updating expected delivery date:', error);
      if (error.response?.status === 401) {
        localStorage.removeItem('user');
        window.location.href = '/login';
      }
      throw error;
    }
  },
};
