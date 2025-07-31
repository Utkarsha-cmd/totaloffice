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
      } catch (e) {
        console.error('Failed to parse user from localStorage', e);
      }
    }
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
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

export default api;
