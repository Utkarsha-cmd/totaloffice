import axios from 'axios';
import { authService } from './authService';

const API_URL = 'http://localhost:5000/api/users';

// Define User interface to match backend model
export interface User {
  _id?: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  company: string;
  vatCode?: string;
  duration: string;
  services: {
    current: string[];
    past: string[];
  };
  document?: string | null;
  billingAddress: string;
  paymentInfo: string;
  createdAt?: Date;
  updatedAt?: Date;
}

// Configure axios with auth headers
const getAuthHeader = () => {
  try {
    const user = authService.getCurrentUser();
    console.log('Current user from auth service:', user ? {
      id: user.id,
      name: user.name,
      role: user.role,
      hasToken: !!user.token
    } : 'No user');
    
    if (user && user.token) {
      return { Authorization: `Bearer ${user.token}` };
    }
    
    console.warn('No authentication token available');
    return {};
  } catch (error) {
    console.error('Error getting auth header:', error);
    return {};
  }
};

// Get all users
const getUsers = async (search = '') => {
  try {
    const headers = getAuthHeader();
    console.log('Auth headers for request:', headers);
    const response = await axios.get(
      search ? `${API_URL}?search=${encodeURIComponent(search)}` : API_URL,
      { headers }
    );
    return response.data || [];
  } catch (error: any) {
    console.error('Error fetching users:', {
      message: error.message,
      status: error.response?.status,
      data: error.response?.data,
      url: error.config?.url
    });
    
    // Return empty array instead of throwing to prevent UI errors
    if (error.response?.status === 401 || error.response?.status === 403) {
      console.warn('Authentication or authorization error. Returning empty array.');
      return [];
    }
    
    throw new Error(error.response?.data?.message || 'Failed to fetch users');
  }
};

// Get user by ID
const getUserById = async (id: string) => {
  try {
    const response = await axios.get(`${API_URL}/${id}`, {
      headers: getAuthHeader()
    });
    return response.data;
  } catch (error: any) {
    console.error(`Error fetching user ${id}:`, error);
    throw new Error(error.response?.data?.message || 'Failed to fetch user details');
  }
};

// Create new user
const createUser = async (userData: FormData) => {
  try {
    const response = await axios.post(API_URL, userData, {
      headers: {
        ...getAuthHeader(),
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data;
  } catch (error: any) {
    console.error('Error creating user:', error);
    throw new Error(error.response?.data?.message || 'Failed to create user');
  }
};

// Update user
const updateUser = async (id: string, userData: FormData) => {
  try {
    const response = await axios.put(`${API_URL}/${id}`, userData, {
      headers: {
        ...getAuthHeader(),
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data;
  } catch (error: any) {
    console.error(`Error updating user ${id}:`, error);
    throw new Error(error.response?.data?.message || 'Failed to update user');
  }
};

// Delete user
const deleteUser = async (id: string) => {
  try {
    const response = await axios.delete(`${API_URL}/${id}`, {
      headers: getAuthHeader()
    });
    return response.data;
  } catch (error: any) {
    console.error(`Error deleting user ${id}:`, error);
    throw new Error(error.response?.data?.message || 'Failed to delete user');
  }
};

// Get user by email
const getUserByEmail = async (email: string) => {
  try {
    const response = await axios.get(`${API_URL}?email=${encodeURIComponent(email)}`, {
      headers: getAuthHeader()
    });
    
    // Return the first user that matches the email
    return response.data[0] || null;
  } catch (error: any) {
    console.error(`Error fetching user by email ${email}:`, error);
    throw new Error(error.response?.data?.message || 'Failed to fetch user details');
  }
};

// Export CSV
const exportUsersCSV = async () => {
  try {
    const response = await axios.get(`${API_URL}/export/csv`, {
      headers: getAuthHeader(),
      responseType: 'blob'
    });
    
    // Create a download link and trigger download
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'users-export.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    return true;
  } catch (error: any) {
    console.error('Error exporting users CSV:', error);
    throw new Error(error.response?.data?.message || 'Failed to export users');
  }
};

export const userService = {
  getUsers,
  getUserById,
  getUserByEmail,
  createUser,
  updateUser,
  deleteUser,
  exportUsersCSV
};