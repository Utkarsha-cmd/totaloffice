import axios from 'axios';
import { authService } from './authService';

const API_URL = 'http://localhost:5000/api/user-profiles';

export interface UserProfile {
  _id: string;
  firstName: string;
  lastName: string;
  company: string;
  email: string;
  phone: string;
  vatCode?: string;
  billingAddress: string;
  paymentInfo: string;
  duration: string;
  services: {
    current: string[];
    past: string[];
  };
  document?: string;
  user?: string;
  createdAt?: string;
  updatedAt?: string;
  fullName?: string;
}

// Get all user profiles
const getUserProfiles = async (search = ''): Promise<UserProfile[]> => {
  try {
    const token = authService.getCurrentUser()?.token;
    const response = await axios.get(
      search ? `${API_URL}?search=${encodeURIComponent(search)}` : API_URL,
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      }
    );
    return response.data || [];
  } catch (error: any) {
    console.error('Error fetching user profiles:', error);
    if (error.response?.status === 401 || error.response?.status === 403) {
      console.warn('Authentication or authorization error');
      return [];
    }
    throw new Error(error.response?.data?.message || 'Failed to fetch user profiles');
  }
};

export const userProfileService = {
  getUserProfiles,
};
