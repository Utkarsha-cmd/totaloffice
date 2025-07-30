import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Edit3, Save, X, LogOut, User, Mail, Phone, MapPin, AlertCircle, FilePlus, Building2, Search, Filter  } from 'lucide-react';
import axios from 'axios';
import { authService } from '@/services/authService';
import { DeliveryCalendar, type Delivery } from "../components/DeliveryCalendar";
import { OrdersTab } from "../components/OrderTab";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
 
// Mock data for deliveries
const deliveriesMock: Delivery[] = [
  {
    id: 'DLV123456',
    deliveryDate: '2025-07-30T00:00:00.000Z',
    items: [
      {
        id: 'itm001',
        product: 'Wireless Mouse',
        quantity: 1,
        price: 25.99,
      },
      {
        id: 'itm002',
        product: 'Mechanical Keyboard',
        quantity: 1,
        price: 75.49,
      },
    ],
    paymentMethod: 'Credit Card',
    paymentStatus: 'paid',
    address: {
      street: '123 Main Street',
      city: 'Bangalore',
      state: 'Karnataka',
      zipCode: '560001',
    },
    status: 'processing',
    trackingNumber: 'TRACK123456789',
    isUpcoming: true, // Added missing required property
  },
];

interface CustomerDetailsProps {
  username: string;
  userType: 'customer' | 'admin' | 'staff';
  onLogout: () => void;
}
 
interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: string;
  token: string;
}
 
interface CustomerInfo {
  name: string;
  email: string;
  phone: string;
  paymentMethod?: string;
  billingAddress: string;
  address?: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
  };
}
 
interface UserProfile {
  _id?: string;
  name: string;
  company: string;
  duration: string;
  services: {
    current: string[];
    past: string[];
  };
  document?: string | null;
  contact: string; 
  billingAddress: string;
  paymentInfo: string;
  createdAt?: Date;
}
 
const CustomerDetails: React.FC<CustomerDetailsProps> = ({
  username,
  userType,
  onLogout,
}) => {
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [uploadedDocs, setUploadedDocs] = useState<File[]>([]);
  const [activeTab, setActiveTab] = useState<'profile' |  'deliveries' | 'orders'>('profile')
  const [customerInfo, setCustomerInfo] = useState<CustomerInfo>({
    name: username,
    email: '',
    phone: '',
    billingAddress: '',
    address: {
      street: '',
      city: '',
      state: '',
      zipCode: ''
    }
  });
  const [deliveries] = useState<Delivery[]>(deliveriesMock);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const filteredDeliveries = deliveries.filter((delivery) => {
  const matchesSearch =
    delivery.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    delivery.trackingNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
    delivery.items.some(item =>
      item.product.toLowerCase().includes(searchTerm.toLowerCase())
    );

  const matchesStatus = statusFilter === "all" || delivery.status === statusFilter;

  return matchesSearch && matchesStatus;
});

const upcomingDeliveries = filteredDeliveries.filter(
  d => d.status !== "delivered" && d.status !== "cancelled"
);

const recentDeliveries = filteredDeliveries.filter(
  d => d.status === "delivered" || d.status === "cancelled"
);
 
  const [editedInfo, setEditedInfo] = useState<CustomerInfo>({
    ...customerInfo,
    billingAddress: customerInfo.billingAddress || ''
  });
  const [document, setDocument] = useState<File | undefined>(undefined);
  
  // Fetch current authenticated user and their profile
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setLoading(true);
        setError('');
       
        // Get current authenticated user from localStorage
        const authUser = authService.getCurrentUser();
        if (!authUser) {
          setError('Not authenticated. Please log in again.');
          return;
        }
       
        setCurrentUser(authUser);
       
        try {
          // First try to get user profile using their email
          const response = await axios.get(`http://localhost:5000/api/users?search=${encodeURIComponent(authUser.email)}`, {
            headers: {
              Authorization: `Bearer ${authUser.token}`
            }
          });
         
          // Find the exact match for the logged-in user's email
          const userData = Array.isArray(response.data) 
            ? response.data.find(user => 
                (user.email && user.email.toLowerCase() === authUser.email.toLowerCase()) ||
                (user.contact && user.contact.toLowerCase() === authUser.email.toLowerCase())
              )
            : null;

          console.log('User profile data:', userData);
         
          if (userData) {
            // Set the complete user profile
            setUserProfile(userData);
           
            // Combine firstName and lastName for display
            const fullName = (userData.firstName || '') + (userData.lastName ? ` ${userData.lastName}` : '');
              
            // Get the correct email (prioritize email over contact)
            const userEmail = userData.email || userData.contact || customerInfo.email || '';
            
            // Update customer info with the profile data
            setCustomerInfo(prev => ({
              ...prev, // Keep any existing values
              name: fullName,
              email: userEmail,
              phone: userData.phone || userData.company || prev.phone || '',
              address: {
                street: userData.billingAddress ? (Array.isArray(userData.billingAddress) ? userData.billingAddress[0] || '' : userData.billingAddress.split(',')[0] || '') : prev.address.street,
                city: userData.billingAddress ? (Array.isArray(userData.billingAddress) ? userData.billingAddress[1] || '' : userData.billingAddress.split(',')[1] || '') : prev.address.city,
                state: userData.billingAddress ? (Array.isArray(userData.billingAddress) ? userData.billingAddress[2] || '' : userData.billingAddress.split(',')[2] || '') : prev.address.state,
                zipCode: userData.billingAddress ? (Array.isArray(userData.billingAddress) ? userData.billingAddress[3] || '' : userData.billingAddress.split(',')[3] || '') : prev.address.zipCode,
              },
            }));
          } else {
            setError('User profile not found. Please contact support.');
          }
        } catch (err: any) {
          console.error('Error fetching user profile:', err);
          // Handle different error cases
          if (err.response?.status === 401) {
            setError('Authentication failed. Please log in again.');
          } else if (err.response?.status === 403) {
            setError('Access denied. Please contact support.');
          } else if (err.response?.status === 404) {
            setError('User profile not found. Please contact support.');
          } else {
            setError('Failed to load profile. Please try again.');
          }
        }
      } catch (err) {
        console.error('Error fetching user data:', err);
        setError(err.message || 'Failed to load user data');
      } finally {
        setLoading(false);
      }
    };
   
    fetchUserData();
  }, []);
 
  // Update editedInfo when customerInfo changes
  useEffect(() => {
    setEditedInfo(prev => ({
      ...prev,
      ...customerInfo,
      address: {
        ...prev.address,
        ...customerInfo.address
      }
    }));
  }, [customerInfo]);
 
  const handleEdit = () => {
    // Verify the user is editing their own profile
    if (!currentUser) {
      toast({
        title: 'Authentication Error',
        description: 'You must be logged in to edit your profile.',
        duration: 3000,
      });
      return;
    }
 
    // Set the edited info to match current customer info
    setEditedInfo({
      name: customerInfo.name,
      email: customerInfo.email,
      phone: customerInfo.phone,
      billingAddress: customerInfo.billingAddress,
      address: {
        street: customerInfo.address?.street || '',
        city: customerInfo.address?.city || '',
        state: customerInfo.address?.state || '',
        zipCode: customerInfo.address?.zipCode || ''
      }
    });
   
    setIsEditing(true);
  };
 
  const handleSave = async () => {
    if (!currentUser || !userProfile?._id) {
      toast({
        title: 'Error',
        description: 'Unable to update profile. Authentication information missing.',
        duration: 3000,
      });
      return;
    }
    
    // Split name into first and last name
    const nameParts = editedInfo.name.trim().split(' ');
    const firstName = nameParts[0] || '';
    const lastName = nameParts.length > 1 ? nameParts.slice(1).join(' ') : '';
   
    try {
      // Prepare the updated user data
      const formData = new FormData();
      formData.append('firstName', firstName);
      formData.append('lastName', lastName);
      formData.append('company', editedInfo.phone); // Using phone for company field
      formData.append('duration', userProfile?.duration);
     
      // Preserve existing services
      if (userProfile?.services?.current?.length > 0) {
        userProfile.services.current.forEach(service => {
          formData.append('currentServices', service);
        });
      }
     
      if (userProfile?.services?.past?.length > 0) {
        userProfile.services.past.forEach(service => {
          formData.append('pastServices', service);
        });
      }
     
      // Update contact (email)
      formData.append('contact', editedInfo.email);
     
      // Format and clean the billing address before saving
      const formattedBillingAddress = editedInfo.billingAddress
        .split(',')
        .map(part => part.trim())
        .filter(part => part.length > 0)
        .join(', ');
      
      // Use the formatted billing address
      formData.append('billingAddress', formattedBillingAddress);
      formData.append('paymentInfo', userProfile?.paymentInfo || '');
     
      // If editing document
      if (document) {
        formData.append('document', document);
      }
     
      // Send update request
      const response = await axios.put(`http://localhost:5000/api/users/${userProfile._id}`, formData, {
        headers: {
          'Authorization': `Bearer ${currentUser.token}`,
          'Content-Type': 'multipart/form-data'
        }
      });
 
      // Update local state with new data
      setUserProfile(response.data);
      setCustomerInfo({
        name: editedInfo.name,
        email: editedInfo.email,
        phone: editedInfo.phone,
        billingAddress: editedInfo.billingAddress,
        address: {
          street: '',
          city: '',
          state: '',
          zipCode: '',
        },
      });
 
      // Reset edited info and document
      setEditedInfo({
        ...editedInfo,
        billingAddress: editedInfo.billingAddress
      });
      setDocument(undefined);
 
      setIsEditing(false);
     
      toast({
        title: 'Success',
        description: 'Profile updated successfully!',
        duration: 3000,
        className: 'bg-green-50 border-green-100 text-green-700',
        style: {
          backgroundColor: 'rgba(22, 163, 74, 0.1)',
          color: '#16a34a',
          borderColor: '#16a34a',
        },
      });
    } catch (err: any) {
      console.error('Profile update error:', err);
     
      // Handle different types of errors
      if (axios.isAxiosError(err)) {
        // Handle Axios errors
        if (err.response) {
          // The request was made and the server responded with a status code
          // that falls out of the range of 2xx
          const errorMessage = err.response.data?.message ||
            `Server error: ${err.response.status}`;
          toast({
            title: 'Error',
            description: errorMessage,
            duration: 3000,
            className: 'bg-red-50 border-red-100 text-red-700',
            style: {
              backgroundColor: 'rgba(239, 68, 68, 0.1)',
              color: '#ef4444',
              borderColor: '#ef4444',
            },
          });
        } else if (err.request) {
          // The request was made but no response was received
          toast({
            title: 'Error',
            description: 'No response from server. Please try again later.',
            duration: 3000,
            className: 'bg-red-50 border-red-100 text-red-700',
            style: {
              backgroundColor: 'rgba(239, 68, 68, 0.1)',
              color: '#ef4444',
              borderColor: '#ef4444',
            },
          });
        } else {
          // Something happened in setting up the request that triggered an Error
          toast({
            title: 'Error',
            description: 'Request failed. Please check your internet connection.',
            duration: 3000,
            className: 'bg-red-50 border-red-100 text-red-700',
            style: {
              backgroundColor: 'rgba(239, 68, 68, 0.1)',
              color: '#ef4444',
              borderColor: '#ef4444',
            },
          });
        }
      } else {
        // Handle other errors
          toast({
            title: 'Error',
            description: err.message || 'An unexpected error occurred. Please try again.',
            duration: 3000,
            className: 'bg-red-50 border-red-100 text-red-700',
            style: {
              backgroundColor: 'rgba(239, 68, 68, 0.1)',
              color: '#ef4444',
              borderColor: '#ef4444',
            },
          });
      }
    }
  };
 
  const handleCancel = () => {
    // ... rest of the code remains the same ...
    setEditedInfo(customerInfo);
    setIsEditing(false);
    setUploadedDocs([]); 
  };
 
  const updateField = (field: keyof Omit<CustomerInfo, 'address'>, value: string) => {
    setEditedInfo(prev => ({
      ...prev,
      [field]: value
    }));
  };
 
  const updateBillingAddress = (value: string) => {
    setEditedInfo(prev => ({
      ...prev,
      billingAddress: value
    }));
  };
 
  const handleDocumentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setDocument(file);
    }
  };
 
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const fileArray = Array.from(e.target.files);
      setUploadedDocs(fileArray);
    }
  };
 
  return (
    <div className="min-h-screen p-4 bg-gray-50">
    <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-[220px_1fr] gap-6">
      {/* Sidebar */}
      <aside className="bg-white rounded-xl border shadow-sm p-4 space-y-4">
        <h2 className="text-lg font-semibold text-gray-800">Menu</h2>
        <nav className="flex flex-col gap-2">
          <button
            onClick={() => setActiveTab('profile')}
            className={`text-left px-4 py-2 rounded-md font-medium text-sm ${
              activeTab === 'profile'
                ? 'bg-green-100 text-green-800'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            Profile
          </button>
          <button
            onClick={() => setActiveTab('orders')}
            className={`text-left px-4 py-2 rounded-md font-medium text-sm ${
              activeTab === 'orders'
                ? 'bg-green-100 text-green-800'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >  
            Place Order
          </button>
          <button
            onClick={() => setActiveTab('deliveries')}
            className={`text-left px-4 py-2 rounded-md font-medium text-sm ${
              activeTab === 'deliveries'
                ? 'bg-green-100 text-green-800'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            Deliveries
          </button>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="space-y-6">
        {activeTab === 'orders' ? (
          <div className="space-y-6 max-w-4xl mx-auto">
            <h1 className="text-3xl font-bold text-gray-700">Place a New Order</h1>
            <OrdersTab customerInfo={customerInfo} />
          </div>
        ) : activeTab === 'profile' ? (
          <div className="space-y-6 max-w-4xl mx-auto">
            {/* Error message */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-md p-4 flex items-center gap-3 text-red-700">
                <AlertCircle className="w-5 h-5" />
                <p>{error}</p>
              </div>
            )}

            {/* Loading indicator */}
            {loading && (
              <div className="text-center py-8">
                <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-green-500 border-r-transparent"></div>
                <p className="mt-2 text-gray-600">Loading your profile...</p>
              </div>
            )}

            {/* Header */}
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-gradient-to-r from-green-100 to-emerald-100 flex items-center justify-center">
                  <User className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-gray-700">Welcome, {customerInfo.name}!</h1>
                  <span className="inline-block px-3 py-1 rounded-full text-sm font-medium bg-gradient-to-r from-green-50 to-emerald-50 text-green-700 mt-1">
                    {userType.charAt(0).toUpperCase() + userType.slice(1)}
                  </span>
                </div>
              </div>
              <Button
                onClick={onLogout}
                variant="outline"
                className="text-gray-500 border-gray-200 hover:bg-red-25 hover:border-red-200 hover:text-red-500"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </Button>
            </div>

            {/* Contact Information */}
            <Card className="bg-white/95 backdrop-blur-sm border border-green-50 shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="flex items-center gap-2 text-xl text-black">
                  <Mail className="w-5 h-5 text-green-500" />
                  Contact Information
                </CardTitle>
                {!isEditing ? (
                  <Button
                    onClick={handleEdit}
                    className="bg-gradient-to-r from-green-100 to-emerald-100 hover:from-green-150 hover:to-emerald-150 text-green-700 border-none shadow-sm"
                  >
                    <Edit3 className="w-4 h-4 mr-2" />
                    Edit
                  </Button>
                ) : (
                  <div className="flex gap-2">
                    <Button
                      onClick={handleSave}
                      className="bg-green-50 hover:bg-green-100 text-green-700 border-green-100"
                    >
                      <Save className="w-4 h-4 mr-2" />
                      Save
                    </Button>
                    <Button
                      onClick={handleCancel}
                      variant="outline"
                      className="border-gray-200 text-gray-500"
                    >
                      <X className="w-4 h-4 mr-2" />
                      Cancel
                    </Button>
                  </div>
                )}
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Name */}
                  <div className="space-y-2">
                    <Label htmlFor="name" className="flex items-center gap-2 text-black">
                      <User className="w-4 h-4 text-green-500" />
                      Full Name
                    </Label>
                    {isEditing ? (
                      <Input
                        id="name"
                        value={editedInfo.name}
                        onChange={(e) => updateField('name', e.target.value)}
                        className="bg-white/80 border-green-100 focus:border-green-200 focus:ring-green-100 text-black"
                      />
                    ) : (
                      <p className="p-2 bg-gray-25 rounded-md text-black">{customerInfo.name}</p>
                    )}
                  </div>

                  {/* Email */}
                  <div className="space-y-2">
                    <Label htmlFor="email" className="flex items-center gap-2 text-gray-700">
                      <Mail className="w-4 h-4 text-green-500" />
                      Email
                    </Label>
                    {isEditing ? (
                      <Input
                        id="email"
                        type="email"
                        value={editedInfo.email}
                        onChange={(e) => updateField('email', e.target.value)}
                        className="bg-white/80 border-green-100 focus:border-green-200 focus:ring-green-100 text-black"
                        disabled
                      />
                    ) : (
                      <p className="p-2 bg-gray-25 rounded-md text-black">{customerInfo.email}</p>
                    )}
                  </div>

                  {/* Company */}
                  <div className="space-y-2">
                    <Label htmlFor="company" className="flex items-center gap-2 text-black">
                      <Building2 className="w-4 h-4 text-green-500" />
                      Company
                    </Label>
                    {isEditing ? (
                      <Input
                        id="company"
                        value={userProfile?.company || ''}
                        onChange={(e) => {
                          if (userProfile) {
                            setUserProfile({ ...userProfile, company: e.target.value });
                          }
                        }}
                        className="bg-white/80 border-green-100 focus:border-green-200 focus:ring-green-100 text-black"
                        placeholder="Enter company name"
                      />
                    ) : (
                      <p className="p-2 bg-gray-25 rounded-md text-black">
                        {userProfile?.company || 'Not specified'}
                      </p>
                    )}
                  </div>

                  {/* Phone */}
                  <div className="space-y-2">
                    <Label htmlFor="phone" className="flex items-center gap-2 text-black">
                      <Phone className="w-4 h-4 text-green-500" />
                      Phone
                    </Label>
                    {isEditing ? (
                      <Input
                        id="phone"
                        value={editedInfo.phone}
                        onChange={(e) => updateField('phone', e.target.value)}
                        className="bg-white/80 border-green-100 focus:border-green-200 focus:ring-green-100 text-black"
                        placeholder="Enter phone number"
                      />
                    ) : (
                      <p className="p-2 bg-gray-25 rounded-md text-black">
                        {customerInfo.phone || 'Not specified'}
                      </p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Address Information */}
            <Card className="bg-white/95 backdrop-blur-sm border border-green-50 shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-xl text-black">
                  <MapPin className="w-5 h-5 text-green-500" />
                  Address Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {isEditing ? (
                  <div className="space-y-2">
                    <Label htmlFor="billingAddress" className="text-black">Billing Address</Label>
                    <textarea
                      id="billingAddress"
                      value={userProfile?.billingAddress || ''}
                      onChange={(e) => updateBillingAddress(e.target.value)}
                      className="w-full p-2 bg-white/80 border border-green-100 rounded-md focus:border-green-200 focus:ring-green-100 text-black min-h-[100px]"
                      placeholder="Enter full billing address"
                    />
                  </div>
                ) : (
                  <div className="space-y-2">
                    <Label className="text-black">Billing Address</Label>
                    <p className="p-2 bg-gray-25 rounded-md text-black">
                      {userProfile?.billingAddress || 'No address available'}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Document Upload */}
            <Card className="bg-white/95 backdrop-blur-sm border border-green-50 shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-xl text-gray-700">
                  <FilePlus className="w-5 h-5 text-green-500" />
                  Attach Documents (KYC, etc.)
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="kycDocs" className="text-gray-600">Upload Files</Label>
                  {isEditing ? (
                    <>
                      <Input
                        id="kycDocs"
                        type="file"
                        accept=".pdf,.jpg,.jpeg,.png"
                        multiple
                        onChange={handleFileChange}
                        className="bg-white/80 border-green-100 focus:border-green-200 focus:ring-green-100"
                      />
                      {uploadedDocs.length > 0 && (
                        <ul className="text-sm text-gray-500 mt-2 list-disc pl-5">
                          {uploadedDocs.map((file, index) => (
                            <li key={index}>{file.name}</li>
                          ))}
                        </ul>
                      )}
                    </>
                  ) : (
                    <p className="p-2 bg-gray-25 rounded-md text-gray-500 italic">
                      No documents attached
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        ) : activeTab === 'deliveries' ? (
          <div className="mt-10 space-y-6">
            {/* Header */}
            <h2 className="text-2xl font-semibold text-gray-700">Delivery Calendar</h2>
            <DeliveryCalendar deliveries={deliveriesMock} />
          </div>
        ) : activeTab === 'orders' ? (
          <div className="space-y-6 max-w-4xl mx-auto">
            <h1 className="text-3xl font-bold text-gray-700">Place a New Order</h1>
            <OrdersTab customerInfo={customerInfo} />
          </div>
        ) : null}
      </main>
    </div>
  </div>

    // <div className="min-h-screen p-4">
    //   <div className="max-w-4xl mx-auto space-y-6">
    //     {/* Error message */}
    //     {error && (
    //       <div className="bg-red-50 border border-red-200 rounded-md p-4 flex items-center gap-3 text-red-700">
    //         <AlertCircle className="w-5 h-5" />
    //         <p>{error}</p>
    //       </div>
    //     )}
       
    //     {/* Loading indicator */}
    //     {loading && (
    //       <div className="text-center py-8">
    //         <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-green-500 border-r-transparent"></div>
    //         <p className="mt-2 text-gray-600">Loading your profile...</p>
    //       </div>
    //     )}
    //     {/* Header */}
    //     <div className="flex justify-between items-center">
    //       <div className="flex items-center gap-4">
    //         <div className="w-12 h-12 rounded-full bg-gradient-to-r from-green-100 to-emerald-100 flex items-center justify-center">
    //           <User className="w-6 h-6 text-green-600" />
    //         </div>
    //         <div>
    //           <h1 className="text-3xl font-bold text-gray-700">Welcome, {customerInfo.name}!</h1>
    //           <span className="inline-block px-3 py-1 rounded-full text-sm font-medium bg-gradient-to-r from-green-50 to-emerald-50 text-green-700 mt-1">
    //             {userType.charAt(0).toUpperCase() + userType.slice(1)}
    //           </span>
    //         </div>
    //       </div>
    //       <Button
    //         onClick={onLogout}
    //         variant="outline"
    //         className="text-gray-500 border-gray-200 hover:bg-red-25 hover:border-red-200 hover:text-red-500"
    //       >
    //         <LogOut className="w-4 h-4 mr-2" />
    //         Logout
    //       </Button>
    //     </div>
 
    //     {/* Contact Information */}
    //     <Card className="bg-white/95 backdrop-blur-sm border border-green-50 shadow-sm">
    //       <CardHeader className="flex flex-row items-center justify-between">
    //         <CardTitle className="flex items-center gap-2 text-xl text-black">
    //           <Mail className="w-5 h-5 text-green-500" />
    //           Contact Information
    //         </CardTitle>
    //         {!isEditing ? (
    //           <Button
    //             onClick={handleEdit}
    //             className="bg-gradient-to-r from-green-100 to-emerald-100 hover:from-green-150 hover:to-emerald-150 text-green-700 border-none shadow-sm"
    //           >
    //             <Edit3 className="w-4 h-4 mr-2" />
    //             Edit
    //           </Button>
    //         ) : (
    //           <div className="flex gap-2">
    //             <Button
    //               onClick={handleSave}
    //               className="bg-green-50 hover:bg-green-100 text-green-700 border-green-100"
    //             >
    //               <Save className="w-4 h-4 mr-2" />
    //               Save
    //             </Button>
    //             <Button
    //               onClick={handleCancel}
    //               variant="outline"
    //               className="border-gray-200 text-gray-500"
    //             >
    //               <X className="w-4 h-4 mr-2" />
    //               Cancel
    //             </Button>
    //           </div>
    //         )}
    //       </CardHeader>
    //       <CardContent className="space-y-4">
    //         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
    //           {/* Name */}
    //           <div className="space-y-2">
    //             <Label htmlFor="name" className="flex items-center gap-2 text-black">
    //               <User className="w-4 h-4 text-green-500" />
    //               Full Name
    //             </Label>
    //             {isEditing ? (
    //               <Input
    //                 id="name"
    //                 value={editedInfo.name}
    //                 onChange={(e) => updateField('name', e.target.value)}
    //                 className="bg-white/80 border-green-100 focus:border-green-200 focus:ring-green-100 text-black"
    //               />
    //             ) : (
    //               <p className="p-2 bg-gray-25 rounded-md text-black">{customerInfo.name}</p>
    //             )}
    //           </div>
 
    //           {/* Email */}
    //           <div className="space-y-2">
    //             <Label htmlFor="email" className="flex items-center gap-2 text-gray-700">
    //               <Mail className="w-4 h-4 text-green-500" />
    //               Email
    //             </Label>
    //             {isEditing ? (
    //               <Input
    //                 id="email"
    //                 type="email"
    //                 value={editedInfo.email}
    //                 onChange={(e) => updateField('email', e.target.value)}
    //                 className="bg-white/80 border-green-100 focus:border-green-200 focus:ring-green-100 text-black"
    //                 disabled // Disable email field as it's used for authentication
    //               />
    //             ) : (
    //               <p className="p-2 bg-gray-25 rounded-md text-black">{customerInfo.email}</p>
    //             )}
    //           </div>

    //           {/* Company - Full width */}
    //           <div className="space-y-2">
    //             <Label htmlFor="company" className="flex items-center gap-2 text-black">
    //               <Building2 className="w-4 h-4 text-green-500" />
    //               Company
    //             </Label>
    //             {isEditing ? (
    //               <Input
    //                 id="company"
    //                 value={userProfile?.company || ''}
    //                 onChange={(e) => {
    //                   if (userProfile) {
    //                     setUserProfile({...userProfile, company: e.target.value});
    //                   }
    //                 }}
    //                 className="bg-white/80 border-green-100 focus:border-green-200 focus:ring-green-100 text-black"
    //                 placeholder="Enter company name"
    //               />
    //             ) : (
    //               <p className="p-2 bg-gray-25 rounded-md text-black">{userProfile?.company || 'Not specified'}</p>
    //             )}
    //           </div>

    //           {/* Phone - Full width */}
    //           <div className="space-y-2">
    //             <Label htmlFor="phone" className="flex items-center gap-2 text-black">
    //               <Phone className="w-4 h-4 text-green-500" />
    //               Phone
    //             </Label>
    //             {isEditing ? (
    //               <Input
    //                 id="phone"
    //                 value={editedInfo.phone}
    //                 onChange={(e) => updateField('phone', e.target.value)}
    //                 className="bg-white/80 border-green-100 focus:border-green-200 focus:ring-green-100 text-black"
    //                 placeholder="Enter phone number"
    //               />
    //             ) : (
    //               <p className="p-2 bg-gray-25 rounded-md text-black">{customerInfo.phone || 'Not specified'}</p>
    //             )}
    //           </div>
    //         </div>
    //       </CardContent>
    //     </Card>
 
    //     {/* Address Information */}
    //     <Card className="bg-white/95 backdrop-blur-sm border border-green-50 shadow-sm">
    //       <CardHeader>
    //         <CardTitle className="flex items-center gap-2 text-xl text-black">
    //           <MapPin className="w-5 h-5 text-green-500" />
    //           Address Information
    //         </CardTitle>
    //       </CardHeader>
    //       <CardContent className="space-y-4">
    //         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
    //           {/* Street */}
    //           <div className="space-y-2 md:col-span-2">
    //             <Label htmlFor="street" className="text-black">Street Address</Label>
    //             {isEditing ? (
    //               <Input
    //                 id="street"
    //                 value={editedInfo.address.street}
    //                 onChange={(e) => updateAddressField('street', e.target.value)}
    //                 className="bg-white/80 border-green-100 focus:border-green-200 focus:ring-green-100 text-black"
    //               />
    //             ) : (
    //               <p className="p-2 bg-gray-25 rounded-md text-black">{customerInfo.address.street}</p>
    //             )}
    //           </div>
 
    //           {/* City */}
    //           <div className="space-y-2">
    //             <Label htmlFor="city" className="text-black">City</Label>
    //             {isEditing ? (
    //               <Input
    //                 id="city"
    //                 value={editedInfo.address.city}
    //                 onChange={(e) => updateAddressField('city', e.target.value)}
    //                 className="bg-white/80 border-green-100 focus:border-green-200 focus:ring-green-100 text-black"
    //               />
    //             ) : (
    //               <p className="p-2 bg-gray-25 rounded-md text-black">{customerInfo.address.city}</p>
    //             )}
    //           </div>
 
    //           {/* State */}
    //           <div className="space-y-2">
    //             <Label htmlFor="state" className="text-black">State</Label>
    //             {isEditing ? (
    //               <Input
    //                 id="state"
    //                 value={editedInfo.address.state}
    //                 onChange={(e) => updateAddressField('state', e.target.value)}
    //                 className="bg-white/80 border-green-100 focus:border-green-200 focus:ring-green-100 text-black"
    //               />
    //             ) : (
    //               <p className="p-2 bg-gray-25 rounded-md text-black">{customerInfo.address.state}</p>
    //             )}
    //           </div>
 
    //           {/* ZIP Code */}
    //           <div className="space-y-2">
    //             <Label htmlFor="zipCode" className="text-black">ZIP Code</Label>
    //             {isEditing ? (
    //               <Input
    //                 id="zipCode"
    //                 value={editedInfo.address.zipCode}
    //                 onChange={(e) => updateAddressField('zipCode', e.target.value)}
    //                 className="bg-white/80 border-green-100 focus:border-green-200 focus:ring-green-100 text-black"
    //               />
    //             ) : (
    //               <p className="p-2 bg-gray-25 rounded-md text-black">{customerInfo.address.zipCode}</p>
    //             )}
    //           </div>
    //         </div>
    //       </CardContent>
    //     </Card>
 
    //     {/* Document Upload */}
    //     <Card className="bg-white/95 backdrop-blur-sm border border-green-50 shadow-sm">
    //       <CardHeader>
    //         <CardTitle className="flex items-center gap-2 text-xl text-gray-700">
    //           <FilePlus className="w-5 h-5 text-green-500" />
    //           Attach Documents (KYC, etc.)
    //         </CardTitle>
    //       </CardHeader>
    //       <CardContent className="space-y-4">
    //         <div className="space-y-2">
    //           <Label htmlFor="kycDocs" className="text-gray-600">Upload Files</Label>
    //           {isEditing ? (
    //             <>
    //               <Input
    //                 id="kycDocs"
    //                 type="file"
    //                 accept=".pdf,.jpg,.jpeg,.png"
    //                 multiple
    //                 onChange={handleFileChange}
    //                 className="bg-white/80 border-green-100 focus:border-green-200 focus:ring-green-100"
    //               />
    //               {uploadedDocs.length > 0 && (
    //                 <ul className="text-sm text-gray-500 mt-2 list-disc pl-5">
    //                   {uploadedDocs.map((file, index) => (
    //                     <li key={index}>{file.name}</li>
    //                   ))}
    //                 </ul>
    //               )}
    //             </>
    //           ) : (
    //             <p className="p-2 bg-gray-25 rounded-md text-gray-500 italic">
    //               No documents attached
    //             </p>
    //           )}
    //         </div>
    //       </CardContent>
    //     </Card>
    //   </div>
    // </div>
  );
};
 
export default CustomerDetails;
 
 

