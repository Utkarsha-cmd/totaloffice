import { Order } from '../hooks/order';


const mockOrders: Order[] = [
  {
    _id: '1',
    orderNumber: 'ORD-2024-001',
    customerId: '1',
    customerName: 'John Smith',
    customerEmail: 'john.smith@company.com',
    items: [
      {
        id: '1',
        name: 'Office Cleaning Supplies Bundle',
        category: 'Cleaning and Janitorial Supplies',
        quantity: 2,
        price: 145.99,
        description: 'Complete office cleaning supplies including sanitizers, paper towels, and disinfectants'
      },
      {
        id: '2',
        name: 'Business Print Package',
        category: 'Business Print',
        quantity: 1,
        price: 89.50,
        description: 'Monthly business printing package - 1000 pages'
      }
    ],
    subtotal: 381.48,
    tax: 45.78,
    shipping: 15.00,
    total: 442.26,
    status: 'shipped',
    shippingAddress: {
      firstName: 'John',
      lastName: 'Smith',
      company: 'Tech Solutions Ltd',
      street: '123 Business Park Drive',
      city: 'Manchester',
      state: 'Greater Manchester',
      postalCode: 'M3 1SH',
      country: 'United Kingdom',
      phone: '+44 161 123 4567'
    },
    billingAddress: {
      firstName: 'John',
      lastName: 'Smith',
      company: 'Tech Solutions Ltd',
      street: '123 Business Park Drive',
      city: 'Manchester',
      state: 'Greater Manchester',
      postalCode: 'M3 1SH',
      country: 'United Kingdom',
      phone: '+44 161 123 4567'
    },
    paymentMethod: 'Company Credit Card ending in 4567',
    trackingNumber: 'TRK123456789',
    orderDate: '2024-01-15T10:30:00Z',
    estimatedDelivery: '2024-01-18T17:00:00Z',
    notes: 'Please deliver to reception desk'
  },
  {
    _id: '2',
    orderNumber: 'ORD-2024-002',
    customerId: '2',
    customerName: 'Sarah Johnson',
    customerEmail: 'sarah.johnson@innovate.co.uk',
    items: [
      {
        id: '3',
        name: 'Totally Tasty Catering Package',
        category: 'Totally Tasty',
        quantity: 1,
        price: 295.00,
        description: 'Monthly office catering package for 50 employees'
      },
      {
        id: '4',
        name: 'Workwear Uniform Set',
        category: 'Workwear',
        quantity: 10,
        price: 45.99,
        description: 'Company branded polo shirts and trousers'
      }
    ],
    subtotal: 754.90,
    tax: 90.59,
    shipping: 0.00,
    total: 845.49,
    status: 'delivered',
    shippingAddress: {
      firstName: 'Sarah',
      lastName: 'Johnson',
      company: 'Innovate Solutions',
      street: '456 Innovation Way',
      city: 'Birmingham',
      state: 'West Midlands',
      postalCode: 'B1 2AA',
      country: 'United Kingdom',
      phone: '+44 121 456 7890'
    },
    billingAddress: {
      firstName: 'Sarah',
      lastName: 'Johnson',
      company: 'Innovate Solutions',
      street: '456 Innovation Way',
      city: 'Birmingham',
      state: 'West Midlands',
      postalCode: 'B1 2AA',
      country: 'United Kingdom',
      phone: '+44 121 456 7890'
    },
    paymentMethod: 'Bank Transfer',
    orderDate: '2024-01-10T14:45:00Z',
    estimatedDelivery: '2024-01-13T16:00:00Z'
  },
  {
    _id: '3',
    orderNumber: 'ORD-2024-003',
    customerId: '3',
    customerName: 'Michael Brown',
    customerEmail: 'michael.brown@startup.io',
    items: [
      {
        id: '5',
        name: 'Defibrillator AED Package',
        category: 'Defibrillators',
        quantity: 1,
        price: 1299.99,
        description: 'Professional grade AED with training and maintenance package'
      }
    ],
    subtotal: 1299.99,
    tax: 156.00,
    shipping: 25.00,
    total: 1480.99,
    status: 'processing',
    shippingAddress: {
      firstName: 'Michael',
      lastName: 'Brown',
      company: 'Startup Innovations',
      street: '789 Tech Hub Lane',
      city: 'London',
      state: 'Greater London',
      postalCode: 'EC1A 1BB',
      country: 'United Kingdom',
      phone: '+44 20 7123 4567'
    },
    billingAddress: {
      firstName: 'Michael',
      lastName: 'Brown',
      company: 'Startup Innovations',
      street: '789 Tech Hub Lane',
      city: 'London',
      state: 'Greater London',
      postalCode: 'EC1A 1BB',
      country: 'United Kingdom',
      phone: '+44 20 7123 4567'
    },
    paymentMethod: 'PayPal Business Account',
    orderDate: '2024-01-16T09:15:00Z',
    estimatedDelivery: '2024-01-19T15:30:00Z'
  },
  {
    _id: '4',
    orderNumber: 'ORD-2024-004',
    customerId: '4',
    customerName: 'Emma Wilson',
    customerEmail: 'emma.wilson@consulting.com',
    items: [
      {
        id: '6',
        name: 'Secure Shredding Service',
        category: 'Secure Shredding',
        quantity: 1,
        price: 89.99,
        description: 'Monthly document shredding service'
      },
      {
        id: '7',
        name: 'Office Plants Package',
        category: 'Office Plants & Plant Displays',
        quantity: 1,
        price: 199.99,
        description: 'Selection of office plants with monthly maintenance'
      }
    ],
    subtotal: 289.98,
    tax: 34.80,
    shipping: 12.50,
    total: 337.28,
    status: 'pending',
    shippingAddress: {
      firstName: 'Emma',
      lastName: 'Wilson',
      company: 'Wilson Consulting',
      street: '321 Professional Plaza',
      city: 'Leeds',
      state: 'West Yorkshire',
      postalCode: 'LS1 3EX',
      country: 'United Kingdom',
      phone: '+44 113 234 5678'
    },
    billingAddress: {
      firstName: 'Emma',
      lastName: 'Wilson',
      company: 'Wilson Consulting',
      street: '321 Professional Plaza',
      city: 'Leeds',
      state: 'West Yorkshire',
      postalCode: 'LS1 3EX',
      country: 'United Kingdom',
      phone: '+44 113 234 5678'
    },
    paymentMethod: 'Company Credit Card ending in 9876',
    orderDate: '2024-01-17T11:20:00Z',
    estimatedDelivery: '2024-01-20T14:00:00Z'
  }
];

export const orderService = {
  getOrders: async (searchTerm?: string): Promise<Order[]> => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    if (!searchTerm) {
      return mockOrders;
    }
    
    const searchLower = searchTerm.toLowerCase();
    return mockOrders.filter(order => 
      order.customerName.toLowerCase().includes(searchLower) ||
      order.orderNumber.toLowerCase().includes(searchLower) ||
      order.customerEmail.toLowerCase().includes(searchLower) ||
      order.status.toLowerCase().includes(searchLower)
    );
  },

  getOrderById: async (id: string): Promise<Order | null> => {
    await new Promise(resolve => setTimeout(resolve, 300));
    return mockOrders.find(order => order._id === id) || null;
  },

  updateOrderStatus: async (id: string, status: Order['status']): Promise<void> => {
    await new Promise(resolve => setTimeout(resolve, 500));
    const orderIndex = mockOrders.findIndex(order => order._id === id);
    if (orderIndex !== -1) {
      mockOrders[orderIndex].status = status;
    }
  }
};