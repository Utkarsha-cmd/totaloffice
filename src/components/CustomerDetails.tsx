import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Edit3, Save, X, LogOut, User, Mail, Phone, MapPin, AlertCircle, 
FilePlus, Building2, Search, Filter, Ticket, Plus, Clock, 
CheckCircle, XCircle, AlertTriangle, MessageSquare,Home,
Package,Calendar,FileText,HeadphonesIcon, Box, CalendarDays } from 'lucide-react';
import axios from 'axios';
import { authService } from '@/services/authService';
import { supportTicketApi } from '@/services/api';
import ActiveContract from './ActiveContract';
import { DeliveryCalendar, type Delivery } from "./DeliveryCalendar";
import { OrdersTab } from "./OrderTab";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";

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

interface SupportTicket {
  _id?: string;
  ticketId: string;
  customerId: string;
  customerName: string;
  customerEmail: string;
  title: string;
  description: string;
  category: 'billing' | 'technical' | 'account' | 'service' | 'other';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'open' | 'in-progress' | 'resolved' | 'closed';
  assignedTo?: string | { _id: string; name: string; email: string } | null;
  createdAt: Date;
  updatedAt: Date;
  attachments?: Array<{ url: string; name: string; type: string }>;
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
  const [activeTab, setActiveTab] = useState<'profile' | 'deliveries' | 'orders' |'activecontract'| 'support'>('profile');
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

  // Support ticket states
  const [supportTickets, setSupportTickets] = useState<SupportTicket[]>([]);
  const [isCreatingTicket, setIsCreatingTicket] = useState(false);
  const [ticketForm, setTicketForm] = useState({
    title: '',
    description: '',
    category: 'technical',
    priority: 'medium',
  });
  const [ticketSearchTerm, setTicketSearchTerm] = useState("");
  const [ticketStatusFilter, setTicketStatusFilter] = useState<string>("all");
  const [ticketAttachments, setTicketAttachments] = useState<File[]>([]);

  // Handle ticket form input changes
  const handleTicketInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setTicketForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle file attachment
  const handleFileAttach = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      setTicketAttachments(prev => [...prev, ...files]);
    }
  };

  // Remove an attachment
  const removeAttachment = (index: number) => {
    setTicketAttachments(prev => prev.filter((_, i) => i !== index));
  };

  // Fetch support tickets for the current user
  const fetchUserTickets = async () => {
    try {
      setLoading(true);
      
      // Debug: Log authentication state
      const userStr = localStorage.getItem('user');
      console.log('Current user from localStorage:', userStr);
      
      if (userStr) {
        try {
          const user = JSON.parse(userStr);
          console.log('Parsed user data:', {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            hasToken: !!user.token,
            tokenPrefix: user.token ? user.token.substring(0, 10) + '...' : 'No token'
          });
        } catch (e) {
          console.error('Error parsing user data:', e);
        }
      } else {
        console.warn('No user data found in localStorage');
      }
      
      const tickets = await supportTicketApi.getMyTickets();
      setSupportTickets(tickets);
    } catch (error) {
      console.error('Error fetching support tickets:', error);
      toast({
        title: "Error",
        description: "Failed to load support tickets",
        variant: "destructive"
      });
      
      // If 403, suggest re-login
      if (error.response?.status === 403) {
        toast({
          title: "Session Expired",
          description: "Your session has expired. Please log in again.",
          variant: "destructive",
          action: (
            <Button variant="ghost" onClick={onLogout}>
              Log In Again
            </Button>
          )
        });
      }
    } finally {
      setLoading(false);
    }
  };

  // Load support tickets when the support tab is active
  useEffect(() => {
    if (activeTab === 'support') {
      fetchUserTickets();
    }
  }, [activeTab]);

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

  // Filter support tickets
  const filteredTickets = supportTickets.filter((ticket) => {
    const matchesSearch =
      ticket.ticketId.toLowerCase().includes(ticketSearchTerm.toLowerCase()) ||
      ticket.title.toLowerCase().includes(ticketSearchTerm.toLowerCase()) ||
      ticket.description.toLowerCase().includes(ticketSearchTerm.toLowerCase());

    const matchesStatus = ticketStatusFilter === "all" || ticket.status === ticketStatusFilter;

    return matchesSearch && matchesStatus;
  });

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
            setUserProfile(userData);
            const fullName = (userData.firstName || '') + (userData.lastName ? ` ${userData.lastName}` : '');
            const userEmail = userData.email || userData.contact || customerInfo.email || '';
            setCustomerInfo(prev => ({
              ...prev, 
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
            setError('User profile not found.');
          }
        } catch (err: any) {
          console.error('Error fetching user profile:', err);
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


  useEffect(() => {
    if (currentUser) {
      fetchSupportTickets();
    }
  }, [currentUser]);

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

  const fetchSupportTickets = async () => {
    if (!currentUser) return;

    try {
      const tickets = await supportTicketApi.getMyTickets();
      setSupportTickets(tickets);
    } catch (err: any) {
      console.error('Error fetching support tickets:', err);
      toast({
        title: "Error",
        description: "Failed to load support tickets",
        variant: "destructive"
      });
    }
  };

  const handleCreateTicket = async () => {
    if (!currentUser) {
      toast({
        title: 'Authentication Error',
        description: 'You must be logged in to create a support ticket.',
        duration: 3000,
        className: 'bg-gray-100 border border-gray-200 text-gray-800',
      });
      return;
    }

    if (!ticketForm.title.trim() || !ticketForm.description.trim()) {
      toast({
        title: 'Validation Error',
        description: 'Please fill in both title and description.',
        duration: 3000,
        className: 'bg-gray-100 border border-gray-200 text-gray-800',
      });
      return;
    }

    try {
      const ticketData = {
        title: ticketForm.title,
        description: ticketForm.description,
        category: ticketForm.category as SupportTicket['category'],
        priority: ticketForm.priority as SupportTicket['priority'],
        attachments: ticketAttachments.map(file => ({
          name: file.name,
          type: file.type,
          url: URL.createObjectURL(file)
        }))
      };

      const newTicket = await supportTicketApi.createTicket(ticketData);

      // Add the new ticket to the local state
      setSupportTickets(prev => [newTicket, ...prev]);

      // Reset form
      setTicketForm({
        title: '',
        description: '',
        category: 'technical',
        priority: 'medium',
      });
      setTicketAttachments([]);
      setIsCreatingTicket(false);

      toast({
        title: 'Success',
        description: `Support ticket ${newTicket.ticketId} created successfully!`,
        duration: 3000,
        className: 'bg-green-50 border-green-100 text-green-700',
      });
    } catch (err: any) {
      console.error('Error creating support ticket:', err);
      toast({
        title: 'Error',
        description: err.response?.data?.message || 'Failed to create support ticket. Please try again.',
        duration: 3000,
        className: 'bg-red-50 border-red-100 text-red-700',
      });
    }
  };
  
   const menuItems = [
    { id: 'profile', label: 'Profile Overview', icon: User},
    { id: 'orders', label: 'Place Order', icon: Package },
    { id: 'deliveries', label: 'Deliveries', icon: Calendar},
    { id: 'support', label: 'Support Center', icon: HeadphonesIcon },
    { id: 'activecontract', label: 'Active Contract', icon: FileText},
  ];

  const getStatusBadgeVariant = (status: SupportTicket['status']) => {
    switch (status) {
      case 'open':return 'default';
      case 'in-progress':return 'secondary';
      case 'resolved': return 'outline';
      case 'closed':return 'destructive';
      default:return 'default';
    }
  };

  const getPriorityBadgeVariant = (priority: SupportTicket['priority']) => {
    switch (priority) {
      case 'low':return 'outline';
      case 'medium':return 'secondary';
      case 'high': return 'default';
      case 'urgent': return 'destructive';
      default: return 'default';
    }
  };

  const getStatusIcon = (status: SupportTicket['status']) => {
    switch (status) {
      case 'open':return <AlertCircle className="w-4 h-4" />;
      case 'in-progress': return <Clock className="w-4 h-4" />;
      case 'resolved': return <CheckCircle className="w-4 h-4" />;
      case 'closed':return <XCircle className="w-4 h-4" />;
      default:return <AlertCircle className="w-4 h-4" />;
    }
  };

  const handleEdit = () => {
    if (!currentUser) {
      toast({
        title: 'Authentication Error',
        description: 'You must be logged in to edit your profile.',
        duration: 3000,
      });
      return;
    }
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
    const nameParts = editedInfo.name.trim().split(' ');
    const firstName = nameParts[0] || '';
    const lastName = nameParts.length > 1 ? nameParts.slice(1).join(' ') : '';

    try {
      const formData = new FormData();
      formData.append('firstName', firstName);
      formData.append('lastName', lastName);
      formData.append('company', editedInfo.phone); 
      formData.append('duration', userProfile?.duration);
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
      formData.append('contact', editedInfo.email);
      const formattedBillingAddress = editedInfo.billingAddress
        .split(',')
        .map(part => part.trim())
        .filter(part => part.length > 0)
        .join(', ');
      formData.append('billingAddress', formattedBillingAddress);
      formData.append('paymentInfo', userProfile?.paymentInfo || '');

      if (document) {
        formData.append('document', document);
      }

      const response = await axios.put(`http://localhost:5000/api/users/${userProfile._id}`, formData, {
        headers: {
          'Authorization': `Bearer ${currentUser.token}`,
          'Content-Type': 'multipart/form-data'
        }
      });

  
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
      if (axios.isAxiosError(err)) {
        if (err.response) {
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

  const handleTicketAttachmentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const fileArray = Array.from(e.target.files);
      setTicketAttachments(fileArray);
    }
  };

  return (
    <div className="min-h-screen bg-[#f3fdf7] text-gray-800 flex overflow-hidden">
      <aside className="bg-[#0d3324] text-white px-4 py-4 w-64 h-screen flex flex-col shadow-md border-r border-green-800 flex-shrink-0 fixed left-0 top-0">
        {/* Header */}
        <div className="flex-shrink-0">
          <h1 className="text-2xl font-bold text-white tracking-wide">Customer Portal</h1>
          <p className="text-sm text-green-200 mt-1">{username}</p>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-4">
          <div className="space-y-1">
            <button
              onClick={() => setActiveTab('profile')}
              className={`flex items-start w-full px-4 py-3 rounded-md text-sm font-medium transition duration-200 ${
                activeTab === 'profile'
                  ? 'bg-green-100 text-green-900'
                  : 'hover:bg-green-800 hover:text-white text-green-200'
              }`}
            >
              <User className="w-4 h-4 mr-2 mt-0.5" />
              <div>Profile Overview</div>
            </button>

            <button
              onClick={() => setActiveTab('orders')}
              className={`flex items-start w-full px-4 py-3 rounded-md text-sm font-medium transition duration-200 ${
                activeTab === 'orders'
                  ? 'bg-green-100 text-green-900'
                  : 'hover:bg-green-800 hover:text-white text-green-200'
              }`}
            >
              <Package className="w-4 h-4 mr-2 mt-0.5" />
              <div>Place Order</div>
            </button>

            <button
              onClick={() => setActiveTab('deliveries')}
              className={`flex items-start w-full px-4 py-3 rounded-md text-sm font-medium transition duration-200 ${
                activeTab === 'deliveries'
                  ? 'bg-green-100 text-green-900'
                  : 'hover:bg-green-800 hover:text-white text-green-200'
              }`}
            >
              <Calendar className="w-4 h-4 mr-2 mt-0.5" />
              <div>Deliveries</div>
            </button>
            <button
              onClick={() => setActiveTab('activecontract')}
              className={`flex items-start w-full px-4 py-3 rounded-md text-sm font-medium transition duration-200 ${
                activeTab === 'activecontract'
                  ? 'bg-green-100 text-green-900'
                  : 'hover:bg-green-800 hover:text-white text-green-200'
              }`}
            >
              <Calendar className="w-4 h-4 mr-2 mt-0.5" />
              <div>Active Contract</div>
            </button>

            <button
              onClick={() => setActiveTab('support')}
              className={`flex items-start w-full px-4 py-3 rounded-md text-sm font-medium transition duration-200 ${
                activeTab === 'support'
                  ? 'bg-green-100 text-green-900'
                  : 'hover:bg-green-800 hover:text-white text-green-200'
              }`}
            >
              <Ticket className="w-4 h-4 mr-2 mt-0.5" />
              <div>Support Tickets</div>
            </button>
          </div>
        </nav>

        {/* Sign Out Button - Fixed at Bottom */}
        <div className="border-t border-green-800 pt-2 pb-2">
          <button
            onClick={onLogout}
            className="w-full flex items-center justify-center gap-2 text-sm font-medium text-white hover:bg-green-800/80 transition-colors py-2 px-4 rounded-md"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
        </div>
    </aside>
      
    {/* Main Content */}
    <main className="flex-1 p-6 pl-8 pr-8 overflow-auto ml-64">
      <div className="max-w-5xl mx-auto">
  {activeTab === 'support' ? (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-700">Support Tickets</h1>
        <Button
          onClick={() => setIsCreatingTicket(true)}
          className="bg-emerald-600 hover:bg-emerald-700 text-white"
        >
          <Plus className="w-4 h-4 mr-2" />
          Create Ticket
        </Button>
      </div>

      {/* Create Ticket Modal/Form */}
      {isCreatingTicket && (
        <Card className="bg-white border border-emerald-100 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl text-gray-700">
              <Plus className="w-5 h-5 text-emerald-500" />
              Create New Support Ticket
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Title */}
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="ticketTitle" className="text-gray-700">Issue Title *</Label>
                <Input
                  id="ticketTitle"
                  value={ticketForm.title}
                  onChange={(e) => setTicketForm(prev => ({ ...prev, title: e.target.value }))}
                  className="bg-white border-gray-200 focus:border-gray-300 focus:ring-0 text-gray-700"
                />
              </div>

              {/* Category */}
              <div className="space-y-2">
                <Label className="text-gray-700">Category</Label>
                <Select
                  value={ticketForm.category}
                  onValueChange={(value: SupportTicket['category']) =>
                    setTicketForm(prev => ({ ...prev, category: value }))
                  }
                >
                  <SelectTrigger className="bg-white border-emerald-100 text-gray-700 hover:bg-emerald-50">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-white">
                    <SelectItem value="technical" className="hover:bg-emerald-50 text-gray-700">Technical Issue</SelectItem>
                    <SelectItem value="billing" className="hover:bg-emerald-50 text-gray-700">Billing Question</SelectItem>
                    <SelectItem value="account" className="hover:bg-emerald-50 text-gray-700">Account Help</SelectItem>
                    <SelectItem value="service" className="hover:bg-emerald-50 text-gray-700">Service Request</SelectItem>
                    <SelectItem value="other" className="hover:bg-emerald-50 text-gray-700">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Priority - Hidden but set to medium by default */}
              <input type="hidden" value="medium" />

              {/* Description */}
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="ticketDescription" className="text-gray-700">Description *</Label>
                <Textarea
                  id="ticketDescription"
                  value={ticketForm.description}
                  onChange={(e) => setTicketForm(prev => ({ ...prev, description: e.target.value }))}
                  className="bg-white border-gray-200 focus:border-gray-300 focus:ring-0 min-h-[120px] text-gray-700"
                />
              </div>

              {/* Attachments */}
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="ticketAttachments" className="text-gray-700">Attachments</Label>
                <Input
                  id="ticketAttachments"
                  type="file"
                  multiple
                  accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                  onChange={handleTicketAttachmentChange}
                  className="bg-white border-gray-200 focus:border-gray-300 focus:ring-0 text-gray-700"
                />
                {ticketAttachments.length > 0 && (
                  <ul className="text-sm text-gray-500 mt-2 list-disc pl-5">
                    {ticketAttachments.map((file, index) => (
                      <li key={index}>{file.name}</li>
                    ))}
                  </ul>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-2 pt-4">
              <Button
                onClick={handleCreateTicket}
                className="bg-emerald-600 hover:bg-emerald-700 text-white"
              >
                <Ticket className="w-4 h-4 mr-2" />
                Create Ticket
              </Button>
              <Button
                onClick={() => {
                  setIsCreatingTicket(false);
                  setTicketForm({
                    title: '',
                    description: '',
                    category: 'technical',
                    priority: 'medium',
                  });
                  setTicketAttachments([]);
                }}
                style={{
                  backgroundColor: '#ecfdf5',
                  color: '#059669',
                  borderColor: '#059669'
                }}
                className="hover:bg-emerald-100 hover:text-emerald-700 hover:border-emerald-600"
              >
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Search and Filter */}
      <Card className="bg-white border border-gray-100 shadow-sm">
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-700 w-4 h-4" />
                <Input
                  value={ticketSearchTerm}
                  onChange={(e) => setTicketSearchTerm(e.target.value)}
                  className="pl-10 bg-white text-gray-700 border-gray-700"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Select
                value={ticketStatusFilter}
                onValueChange={setTicketStatusFilter}
              >
                <SelectTrigger className=" bg-white border-gray-200 text-gray-700">
                  <Filter className="w-4 h-4 mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all" className="bg-white text-gray-700">All Status</SelectItem>
                  <SelectItem value="open" className="bg-white text-gray-700">Open</SelectItem>
                  <SelectItem value="in-progress" className="bg-white text-gray-700">In Progress</SelectItem>
                  <SelectItem value="resolved" className="bg-white text-gray-700">Resolved</SelectItem>
                  <SelectItem value="closed" className="bg-white text-gray-700">Closed</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tickets List */}
      <div className="space-y-4">
        {filteredTickets.length === 0 ? (
          <Card className="bg-white border border-gray-100 shadow-sm">
            <CardContent className="p-8 text-center">
              <Ticket className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-500 mb-2">No Support Tickets</h3>
              <p className="text-gray-400 mb-4">
                {ticketSearchTerm || ticketStatusFilter !== 'all'
                  ? 'No tickets match your search criteria.'
                  : 'You haven\'t created any support tickets yet.'
                }
              </p>
              {!ticketSearchTerm && ticketStatusFilter === 'all' && (
                <Button
                  onClick={() => setIsCreatingTicket(true)}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Create Your First Ticket
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          filteredTickets.map((ticket) => (
            <Card key={ticket.ticketId || String(ticket._id)} className="bg-white border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="text-lg font-semibold text-gray-800">{ticket.title}</h3>
                      <Badge variant="outline" className="text-xs text-black">
                        {ticket.ticketId}
                      </Badge>
                    </div>
                    <p className="text-gray-600 mb-3 line-clamp-2">{ticket.description}</p>
                    <div className="flex flex-wrap gap-2 text-sm text-gray-500">
                      <span className="flex items-center gap-1">
                        <Building2 className="w-3 h-3" />
                        {ticket.category.charAt(0).toUpperCase() + ticket.category.slice(1)}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {new Date(ticket.createdAt).toLocaleDateString()}
                      </span>
                      {ticket.assignedTo && (
                        <span className="flex items-center gap-1">
                          <User className="w-3 h-3" />
                          Assigned to: {
                            ticket.assignedTo && typeof ticket.assignedTo === 'object' 
                              ? (ticket.assignedTo as { name?: string }).name || 'Unassigned'
                              : String(ticket.assignedTo || 'Unassigned')
                          }
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-1 ml-4">
                    {getStatusIcon(ticket.status)}
                    <Badge variant={getStatusBadgeVariant(ticket.status)} className="text-black">
                      {ticket.status.replace('-', ' ').toUpperCase()}
                    </Badge>
                  </div>
                </div>

                {ticket.attachments && ticket.attachments.length > 0 && (
                  <div className="text-gray-800 file:text-gray-800 file:border-0 file:mr-4 file:py-1.5 file:px-3 file:bg-gray-100 file:rounded-md">
                    <FilePlus className="w-3 h-3 text-gray-800" />
                    {ticket.attachments.length} attachment(s)
                  </div>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  ) :
           activeTab === 'orders' ? (
            <div className="space-y-4">
              <h1 className="text-3xl font-bold text-gray-700">Place a New Order</h1>
              <OrdersTab customerInfo={customerInfo} />
            </div>
            
          ) : activeTab === 'profile' ? (
            <div className="space-y-4">
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
              </div>

              {/* Contact Information */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
              <div className="rounded-xl bg-gradient-to-br from-green-50 to-green-100 p-4 shadow-sm border border-green-100 flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Active Orders</p>
                  <h2 className="text-2xl font-bold text-green-700">{customerInfo.activeOrders || 0}</h2>
                </div>
                <Box className="w-8 h-8 text-green-600" />
              </div>

              <div className="rounded-xl bg-gradient-to-br from-blue-50 to-blue-100 p-4 shadow-sm border border-blue-100 flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Deliveries</p>
                  <h2 className="text-2xl font-bold text-blue-700">{deliveriesMock.length}</h2>
                </div>
                <CalendarDays className="w-8 h-8 text-blue-600" />
              </div>

              <div className="rounded-xl bg-gradient-to-br from-yellow-50 to-yellow-100 p-4 shadow-sm border border-yellow-100 flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Open Tickets</p>
                  <h2 className="text-2xl font-bold text-yellow-600">{supportTickets.length}</h2>
                </div>
                <Ticket className="w-8 h-8 text-yellow-500" />
              </div>

              <div className="rounded-xl bg-gradient-to-br from-emerald-50 to-emerald-100 p-4 shadow-sm border border-emerald-100 flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Account Status</p>
                  <h2 className="text-2xl font-bold text-emerald-700">Active</h2>
                </div>
                <CheckCircle className="w-8 h-8 text-emerald-600" />
              </div>
            </div>
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
                        className="bg-white border border-emerald-200 text-emerald-600 hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-300"
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
                          className="bg-white/80 border-green-100 focus:border-green-200 focus:ring-green-100 text-black placeholder-gray-300"
                          placeholder="Enter full name"
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
                          className="bg-white/80 border-green-100 focus:border-green-200 focus:ring-green-100 text-black placeholder-gray-300"
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
                          className="bg-white/80 border-green-100 focus:border-green-200 focus:ring-green-100 text-black placeholder-gray-300"
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
                          className="bg-white/80 border-green-100 focus:border-green-200 focus:ring-green-100 text-black placeholder-gray-300"
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
                      <Textarea
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
          ) 
           : activeTab === 'activecontract' ? (
              <ActiveContract
                customerInfo={customerInfo ? {
                  id: currentUser?.id || '',
                  name: customerInfo.name,
                  email: customerInfo.email
                } : null}
              />
            ) : null}  
      </div>
      </main>
    </div>
  );
};

export default CustomerDetails;



