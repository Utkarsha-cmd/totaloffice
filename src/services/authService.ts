import axios from 'axios';

const API_URL = 'http://localhost:5000/api/auth';

// Configure axios defaults
const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Register user
const register = async (userData: {
  name: string;
  email: string;
  password: string;
  phone: string;
  role: string;
}) => {
  const response = await api.post('/register', userData);
  if (response.data.token) {
    localStorage.setItem('user', JSON.stringify(response.data));
  }
  return response.data;
};

// Login user
const login = async (email: string, password: string) => {
  try {
    // Basic validation
    if (!email || !password) {
      throw new Error('Email and password are required');
    }

    const loginData = { 
      email: email.trim().toLowerCase(),
      password: password
    };

    console.log('Attempting login with data:', {
      email: loginData.email,
      passwordLength: loginData.password ? loginData.password.length : 0
    });
    
    const response = await api.post('/login', loginData, {
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      validateStatus: (status) => status < 500 // Don't throw for 4xx errors
    });

    console.log('Login response status:', response.status, 'data:', response.data);
    
    // Check for error response
    if (!response.data.success) {
      throw new Error(response.data.message || 'Login failed. Please try again.');
    }

    // If login successful, prepare user data with full profile
    const userData = {
      id: response.data._id,
      name: response.data.name,
      email: response.data.email,
      role: response.data.role,
      permissions: response.data.permissions || {},
      token: response.data.token,
      // Include full user profile data
      profile: {
        name: response.data.name,
        company: '', // Empty company field for customers
        duration: '',
        services: { current: [], past: [] },
        document: null,
        contact: response.data.email, // Use email as contact
        billingAddress: response.data.billingAddress || '',
        paymentInfo: response.data.paymentInfo || '',
        createdAt: new Date()
      }
    };
    
    // Store user data in localStorage
    localStorage.setItem('user', JSON.stringify(userData));
    
    return userData;
    
  } catch (error: any) {
    console.error('Login error:', error);
    
    // Handle different types of errors
    if (error.response) {
      // The request was made and the server responded with a status code
      console.error('Login error response:', error.response.data);
      const errorMessage = error.response.data?.message || 'Login failed. Please check your credentials and try again.';
      throw new Error(errorMessage);
    } else if (error.request) {
      // The request was made but no response was received
      console.error('No response received:', error.request);
      throw new Error('Unable to connect to the server. Please check your internet connection.');
    } else {
      // Something happened in setting up the request
      console.error('Error setting up login request:', error.message);
      throw new Error(error.message || 'Failed to process login request. Please try again.');
    }
  }
};

// Logout user
const logout = () => {
  localStorage.removeItem('user');
};

// Get current user from localStorage
const getCurrentUser = () => {
  const userStr = localStorage.getItem('user');
  return userStr ? JSON.parse(userStr) : null;
};

// Get auth token from localStorage
const getAuthToken = () => {
  if (typeof window === 'undefined') return null;
  const userStr = localStorage.getItem('user');
  if (!userStr) return null;
  try {
    const user = JSON.parse(userStr);
    return user?.token || null;
  } catch (error) {
    console.error('Error parsing user from localStorage:', error);
    return null;
  }
};

// Get current user profile from backend
const getCurrentUserProfile = async () => {
  try {
    const user = getCurrentUser();
    if (!user) {
      throw new Error('Not authenticated');
    }

    // Return the stored user data directly
    return {
      name: user.name,
      company: '', // Empty company field for customers
      duration: '',
      services: { current: [], past: [] },
      document: null,
      contact: user.email, // Use email as contact
      billingAddress: '',
      paymentInfo: '',
      _id: user.id,
      createdAt: new Date()
    };
  } catch (error: any) {
    console.error('Error fetching user profile:', error);
    throw new Error('Failed to fetch user profile');
  }
};

export const authService = {
  register,
  login,
  logout,
  getCurrentUser,
  getCurrentUserProfile,
  getAuthToken
};
