import axios from 'axios';

// Use environment variables if available (set by Create React App), otherwise use default
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Set up axios instance with credentials
const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor to include auth token
api.interceptors.request.use(
  (config) => {
    // Try to get token from user object in localStorage
    const userStr = localStorage.getItem('user');
    let token = '';
    
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        token = user.token || '';
        console.log('Found user token in localStorage');
      } catch (e) {
        console.error('Failed to parse user from localStorage', e);
      }
    } else {
      console.warn('No user found in localStorage');
    }
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log('Authorization header set with token');
    } else {
      console.warn('No auth token available for request');
    }
    
    console.log('Sending request to:', config.url);
    console.log('Request headers:', config.headers);
    
    return config;
  },
  (error) => {
    console.error('Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// Add response interceptor to handle 403 errors
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response) {
      console.error('Response error:', {
        status: error.response.status,
        statusText: error.response.statusText,
        data: error.response.data,
        headers: error.response.headers,
        config: {
          url: error.config.url,
          method: error.config.method,
          headers: error.config.headers
        }
      });
      
      if (error.response.status === 403) {
        console.error('403 Forbidden - Possible authentication/authorization issue');
        // Optionally redirect to login or show a message
        // window.location.href = '/login';
      }
    } else if (error.request) {
      console.error('No response received:', error.request);
    } else {
      console.error('Request setup error:', error.message);
    }
    
    return Promise.reject(error);
  }
);

// Services API
export const serviceApi = {
  // Get all services with their products
  getServices: async () => {
    const response = await api.get('/services');
    return response.data;
  },

  // Create a new service with products
  createService: async (serviceData: { serviceName: string; products: Array<{ name: string; stock: number; price: number }> }) => {
    const response = await api.post('/services', serviceData);
    return response.data;
  },

  // Update a product
  updateProduct: async (productId: string, productData: { name?: string; stock?: number; price?: number }) => {
    const response = await api.put(`/services/product/${productId}`, productData);
    return response.data;
  },

  // Delete a service and its products
  deleteService: async (serviceId: string) => {
    const response = await api.delete(`/services/${serviceId}`);
    return response.data;
  },
  
  // Add products to an existing service
  addProductsToService: async (serviceId: string, products: Array<{ name: string; stock: number; price: number }>) => {
    const response = await api.post(`/services/${serviceId}/products`, { products });
    return response.data;
  },
  
  // Delete a product from a service
  deleteProduct: async (serviceId: string, productId: string) => {
    const response = await api.delete(`/services/${serviceId}/products/${productId}`);
    return response.data;
  },
};

// Support Ticket API
export const supportTicketApi = {
  // Create a new support ticket
  createTicket: async (ticketData: {
    title: string;
    description: string;
    category: 'billing' | 'technical' | 'account' | 'service' | 'other';
    priority: 'low' | 'medium' | 'high' | 'urgent';
    attachments?: Array<File | { name: string; type: string; url: string }>;
  }) => {
    const formData = new FormData();
    formData.append('title', ticketData.title);
    formData.append('description', ticketData.description);
    formData.append('category', ticketData.category);
    formData.append('priority', ticketData.priority);
    
    if (ticketData.attachments) {
      // Handle both File objects and attachment objects with url
      ticketData.attachments.forEach((file) => {
        if (file instanceof File) {
          formData.append('attachments', file);
        } else if (file && typeof file === 'object' && 'url' in file) {
          // Convert URL to File object if needed, or handle as is
          // For now, we'll just send the URL as a string
          formData.append('attachmentUrls', JSON.stringify({
            name: file.name,
            type: file.type,
            url: file.url
          }));
        }
      });
    }
    
    const response = await api.post('/support/tickets', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // Get all tickets for the current user
  getTickets: async (status?: string) => {
    const url = status ? `/support/tickets?status=${status}` : '/support/tickets';
    const response = await api.get(url);
    return response.data;
  },

  // Alias for getTickets to maintain backward compatibility
  getMyTickets: async (status?: string) => {
    return supportTicketApi.getTickets(status);
  },

  // Get a single ticket by ID
  getTicketById: async (ticketId: string) => {
    const response = await api.get(`/support/tickets/${ticketId}`);
    return response.data;
  },

  // Update a ticket
  updateTicket: async (ticketId: string, updateData: {
    status?: 'open' | 'in-progress' | 'resolved' | 'closed';
    assignedTo?: string;
    response?: string;
  }) => {
    const response = await api.put(`/support/tickets/${ticketId}`, updateData);
    return response.data;
  },

  // Add a response to a ticket
  addResponse: async (ticketId: string, message: string, attachments?: File[]) => {
    const formData = new FormData();
    formData.append('message', message);
    
    if (attachments) {
      attachments.forEach((file, index) => {
        formData.append(`attachments`, file);
      });
    }
    
    const response = await api.post(
      `/support/tickets/${ticketId}/responses`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    return response.data;
  },

  // Get ticket responses
  getTicketResponses: async (ticketId: string) => {
    const response = await api.get(`/support/tickets/${ticketId}/responses`);
    return response.data;
  },

  // Close a ticket
  closeTicket: async (ticketId: string) => {
    const response = await api.patch(`/support/tickets/${ticketId}/close`);
    return response.data;
  },

  // Reopen a ticket
  reopenTicket: async (ticketId: string) => {
    const response = await api.patch(`/support/tickets/${ticketId}/reopen`);
    return response.data;
  },
};

export default api;
