import React, { useState, useRef, useEffect } from 'react';
import { LayoutDashboard, Users, Clock, Menu, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AdminDashboardProps {
  username: string;
  userType: 'admin' | 'staff' | 'customer';
  onLogout: () => void;
}

import { User, userService } from '../services/userService';

// Extended User interface for frontend use
interface UserWithFile extends Omit<User, 'document'> {
  document?: File | null;
  _id?: string;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ username, userType, onLogout }) => {
  const [customers, setCustomers] = useState<UserWithFile[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [activeTab, setActiveTab] = useState<'details' | 'history'>('details');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [newCustomer, setNewCustomer] = useState<UserWithFile>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    company: '',
    vatCode: '',
    duration: '',
    services: { current: [], past: [] },
    document: null,
    billingAddress: '',
    paymentInfo: '',
  });
  
  const [editingCustomer, setEditingCustomer] = useState<UserWithFile | null>(null);
  const [showEditForm, setShowEditForm] = useState(false);
  
  const [postcode, setPostcode] = useState('');
  const [addressSuggestions, setAddressSuggestions] = useState<string[]>([]);
  const [isLoadingAddress, setIsLoadingAddress] = useState(false);
  const [addressError, setAddressError] = useState('');
  const [serviceDropdownOpen, setServiceDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement | null>(null);

useEffect(() => {
  const handleClickOutside = (event: MouseEvent) => {
    if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
      setServiceDropdownOpen(false);
    }
  };
  document.addEventListener('mousedown', handleClickOutside);
  return () => document.removeEventListener('mousedown', handleClickOutside);
}, []);

  const handlePostcodeLookup = async () => {
    if (!postcode.trim()) {
      setAddressError('Please enter a postcode');
      return;
    }
    
    setIsLoadingAddress(true);
    setAddressError('');
    
    try {
      const formattedPostcode = postcode.replace(/\s+/g, '').toUpperCase();
      const apiKey = 'pdSw7G1TEk6kghR1DNzddQ41182';
      
      // First get the full address details for the postcode
      const lookupResponse = await fetch(
        `https://api.getaddress.io/find/${encodeURIComponent(formattedPostcode)}?api-key=${apiKey}&expand=true`
      );
      
      if (!lookupResponse.ok) {
        throw new Error('Address lookup failed');
      }
      
      const data = await lookupResponse.json();
      
      // Format the addresses for display
      if (data.addresses && data.addresses.length > 0) {
        const formattedAddresses = data.addresses.map((addr: any) => {
          // Format address components into a readable string
          const parts = [
            addr.line_1,
            addr.line_2,
            addr.line_3,
            addr.town_or_city,
            addr.county,
            formattedPostcode
          ].filter(Boolean);
          
          return parts.join(', ');
        });
        
        setAddressSuggestions(formattedAddresses);
      } else {
        // Fallback to autocomplete if no direct matches
        const autoCompleteResponse = await fetch(
          `https://api.getaddress.io/autocomplete/${encodeURIComponent(formattedPostcode)}?api-key=${apiKey}`
        );
        
        if (!autoCompleteResponse.ok) {
          throw new Error('Address lookup failed');
        }
        
        const autoCompleteData = await autoCompleteResponse.json();
        
        if (autoCompleteData.suggestions && autoCompleteData.suggestions.length > 0) {
          setAddressSuggestions(autoCompleteData.suggestions);
        } else {
          setAddressError('No addresses found for this postcode');
          setAddressSuggestions([]);
        }
      }
    } catch (error) {
      console.error('Error fetching address:', error);
      setAddressError('Failed to fetch addresses. Please try again.');
      setAddressSuggestions([]);
    } finally {
      setIsLoadingAddress(false);
    }
  };
  
  const handleAddressSelect = (address: string) => {
    setNewCustomer(prev => ({
      ...prev,
      billingAddress: address
    }));
    setAddressSuggestions([]);
  };

  const navigation = [
    { name: 'User Details', icon: Users, tab: 'details', current: activeTab === 'details' },
    { name: 'User History', icon: Clock, tab: 'history', current: activeTab === 'history' },
  ];

  const handleDownloadCSV = async () => {
    try {
      await userService.exportUsersCSV();
    } catch (err: any) {
      setError(err.message || 'Failed to export CSV');
    }
  };

  const handleAddCustomer = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Basic validation
    if (!newCustomer.firstName || !newCustomer.email) {
      setError('First name and email are required');
      return;
    }
    
    try {
      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(newCustomer.email)) {
        setError('Please enter a valid email address');
        return;
      }

      // Create FormData for file upload
      const formData = new FormData();
      formData.append('firstName', newCustomer.firstName);
      // Ensure lastName is always sent, default to empty string if not provided
      formData.append('lastName', newCustomer.lastName || '');
      formData.append('email', newCustomer.email);
      formData.append('phone', newCustomer.phone || '');
      formData.append('company', newCustomer.company || '');
      formData.append('vatCode', newCustomer.vatCode || '');
      formData.append('duration', newCustomer.duration || '');
      formData.append('services', JSON.stringify(newCustomer.services || { current: [], past: [] }));
      formData.append('billingAddress', newCustomer.billingAddress || '');
      formData.append('paymentInfo', newCustomer.paymentInfo || '');
      
      if (newCustomer.document) {
        formData.append('document', newCustomer.document);
      }
      
      await userService.createUser(formData);
      
      // Refresh customer list
      fetchCustomers();
      
      // Reset form
      setNewCustomer({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        company: '',
        vatCode: '',
        duration: '',
        services: { current: [], past: [] },
        document: null,
        billingAddress: '',
        paymentInfo: '',
      });
      setPostcode('');
      setAddressSuggestions([]);
      setShowAddForm(false);
    } catch (err: any) {
      console.error('Error adding customer:', err);
      setError(err.message || 'Failed to add user');
    }
  };

  const handleEditCustomer = (customer: UserWithFile) => {
    setEditingCustomer({
      ...customer,
      firstName: customer.firstName || '',
      lastName: customer.lastName || '',
      email: customer.email || '',
      phone: customer.phone || '',
      company: customer.company || '',
      vatCode: customer.vatCode || '',
      duration: customer.duration || '',
      services: {
        current: [...(customer.services?.current || [])],
        past: [...(customer.services?.past || [])]
      },
      billingAddress: customer.billingAddress || '',
      paymentInfo: customer.paymentInfo || '',
      document: customer.document || null
    });
    setShowEditForm(true);
    setShowAddForm(false);
  };

  const handleUpdateCustomer = async () => {
    if (!editingCustomer) return;
    
    try {
      setLoading(true);
      setError('');
      
      const formData = new FormData();
      
      // Add all user fields to form data
      const { document: doc, services, ...rest } = editingCustomer;
      
      // Ensure required fields are always included
      const userData = {
        ...rest,
        // Ensure lastName is always included, default to empty string if not provided
        lastName: rest.lastName || '',
        // Ensure other required fields have defaults if needed
        services: services || { current: [], past: [] }
      };
      
      // Add all non-null/undefined fields to form data
      Object.entries(userData).forEach(([key, value]) => {
        if (value !== null && value !== undefined) {
          if (key === 'services') {
            formData.append(key, JSON.stringify(value));
          } else {
            formData.append(key, String(value));
          }
        }
      });
      
      // Add document file if it exists and is a File object
      if (doc && doc instanceof File) {
        formData.append('document', doc);
      }
      
      await userService.updateUser(editingCustomer._id, formData);
      
      // Refresh customer list
      fetchCustomers();
      
      // Reset form
      setEditingCustomer(null);
      setShowEditForm(false);
    } catch (err: any) {
      console.error('Error updating customer:', err);
      setError(err.message || 'Failed to update user');
    } finally {
      setLoading(false);
    }
  };

  // Fetch users from API
  const fetchCustomers = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await userService.getUsers(searchTerm);
      
      // Ensure data is always an array
      if (Array.isArray(data)) {
        setCustomers(data);
      } else {
        console.warn('API returned non-array data:', data);
        setCustomers([]);
      }
    } catch (err: any) {
      console.error('Error in fetchCustomers:', err);
      setError(err.message || 'Failed to fetch users');
      setCustomers([]); // Set empty array on error
    } finally {
      setLoading(false);
    }
  };

  // Delete user
  const handleDeleteCustomer = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        await userService.deleteUser(id);
        fetchCustomers(); // Refresh list after deletion
      } catch (err: any) {
        setError(err.message || 'Failed to delete user');
      }
    }
  };

  // Effect to fetch customers on component mount and when search term changes
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchCustomers();
    }, 500);
    
    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm]);

  const filteredCustomers = customers.filter(customer => {
    const searchLower = searchTerm.toLowerCase();
    const fullName = `${customer.firstName || ''} ${customer.lastName || ''}`.toLowerCase();
    
    return (
      fullName.includes(searchLower) ||
      (customer.email || '').toLowerCase().includes(searchLower) ||
      (customer.phone || '').toLowerCase().includes(searchLower) ||
      (customer.company || '').toLowerCase().includes(searchLower) ||
      (customer.billingAddress || '').toLowerCase().includes(searchLower)
    );
  });

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <div
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out",
          sidebarOpen ? 'translate-x-0' : '-translate-x-full',
          "md:relative md:translate-x-0"
        )}
      >
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-between h-16 px-4 bg-green-700 text-white">
            <div className="flex items-center space-x-2">
              <LayoutDashboard className="h-6 w-6" />
              <span className="text-xl font-semibold">Admin Panel</span>
            </div>
            <button
              onClick={() => setSidebarOpen(false)}
              className="md:hidden p-1 rounded-md text-green-200 hover:text-white focus:outline-none"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <nav className="flex-1 px-2 py-4 space-y-1">
            {navigation.map((item) => (
              <button
                key={item.name}
                onClick={() => setActiveTab(item.tab as 'details' | 'history')}
                className={cn(
                  item.current
                    ? 'bg-green-50 text-green-700 border-r-4 border-green-600'
                    : 'text-gray-600 hover:bg-gray-100',
                  'group flex items-center w-full px-4 py-3 text-sm font-medium rounded-md transition-colors duration-200'
                )}
              >
                <item.icon
                  className={cn(
                    item.current ? 'text-green-600' : 'text-gray-400 group-hover:text-gray-500',
                    'mr-3 flex-shrink-0 h-5 w-5'
                  )}
                  aria-hidden="true"
                />
                {item.name}
              </button>
            ))}
          </nav>

          <div className="p-4 border-t border-gray-200">
            <div className="flex items-center">
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-700">{username}</p>
                <p className="text-xs font-medium text-gray-500">{userType}</p>
              </div>
              <button
                onClick={onLogout}
                className="ml-auto text-sm text-red-600 hover:text-red-800"
              >
                Sign out
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top navigation */}
        <div className="bg-white shadow-sm">
          <div className="px-4 py-3 flex items-center justify-between">
            <div className="flex items-center">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="md:hidden p-2 rounded-md text-gray-500 hover:text-gray-600 hover:bg-gray-100"
              >
                <Menu className="h-5 w-5" />
              </button>
              <h1 className="ml-2 text-xl font-semibold text-gray-900">
                {activeTab === 'details' ? 'Customer Details' : 'Customer History'}
              </h1>
            </div>

            <div className="flex items-center space-x-3">
              <button
                onClick={() => setShowAddForm(true)}
                className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
              >
                Add Customer
              </button>
              <button
                onClick={handleDownloadCSV}
                className="inline-flex items-center px-3 py-1.5 border border-gray-300 text-xs font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
              >
                Export CSV
              </button>
            </div>
          </div>
        </div>

        {/* Page content */}
        <div className="flex-1 overflow-y-auto p-4">
          {error && (
            <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md">
              {error}
              <button 
                onClick={() => setError('')} 
                className="ml-2 text-red-500 hover:text-red-700"
              >
                ×
              </button>
            </div>
          )}
          
          <div className="mb-4">
            <input
              type="text"
              placeholder="Search by name or company..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full md:w-1/3 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
            />
          </div>

          {showAddForm && (
  <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
    <div className="bg-white rounded-lg p-6 w-full max-w-2xl shadow-lg">
      <h2 className="text-xl font-semibold mb-4 text-blue-700">Add New Customer</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">

        {/* 1. Postcode + Address */}
        <div className="md:col-span-2 space-y-2">
          <div className="relative">
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Enter UK Postcode (e.g., M3 1SH)"
                value={postcode}
                onChange={e => setPostcode(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handlePostcodeLookup()}
                className="flex-1 p-2 border border-black focus:outline-none font-semibold text-gray-800 rounded"
              />
              <button
                type="button"
                onClick={handlePostcodeLookup}
                disabled={isLoadingAddress}
                className="px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 whitespace-nowrap"
              >
                {isLoadingAddress ? 'Looking...' : 'Find'}
              </button>
            </div>

            {isLoadingAddress ? (
              <div className="absolute z-10 mt-1 w-full bg-white border border-gray-300 rounded-md shadow-lg p-2">
                <div className="text-sm text-gray-600 py-1">Searching for addresses...</div>
              </div>
            ) : addressSuggestions.length > 0 ? (
              <div className="absolute z-10 mt-1 w-full bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto">
                <div className="px-3 py-2 text-xs text-gray-500 bg-gray-50 border-b">
                  Found {addressSuggestions.length} addresses:
                </div>
                {addressSuggestions.map((address, index) => (
                  <div
                    key={index}
                    className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer border-b border-gray-100 last:border-b-0"
                    onClick={() => {
                      handleAddressSelect(address);
                      setAddressSuggestions([]);
                    }}
                  >
                    {address}
                  </div>
                ))}
              </div>
            ) : null}
          </div>

          {addressError && (
            <p className="text-red-500 text-sm">{addressError}</p>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Billing Address</label>
            <input
              type="text"
              placeholder="Address will appear here after selection"
              value={newCustomer.billingAddress}
              onChange={e => setNewCustomer({ ...newCustomer, billingAddress: e.target.value })}
              className="w-full p-2 border border-black focus:outline-none font-semibold text-gray-800 rounded"
            />
          </div>
        </div>

        {/* 2. First Name */}
        <input
          type="text"
          placeholder="First Name"
          value={newCustomer.firstName}
          onChange={e => setNewCustomer({ ...newCustomer, firstName: e.target.value })}
          className="p-2 border border-black focus:outline-none font-semibold text-gray-800 rounded"
        />

        {/* 3. Last Name */}
        <input
          type="text"
          placeholder="Last Name"
          value={newCustomer.lastName || ''}
          onChange={e => setNewCustomer({ ...newCustomer, lastName: e.target.value })}
          className="p-2 border border-black focus:outline-none font-semibold text-gray-800 rounded"
        />

        {/* 4. Company */}
        <input
          type="text"
          placeholder="Company"
          value={newCustomer.company}
          onChange={e => setNewCustomer({ ...newCustomer, company: e.target.value })}
          className="p-2 border border-black focus:outline-none font-semibold text-gray-800 rounded"
        />

        {/* 5. Duration */}
        <input
          type="text"
          placeholder="Duration (e.g. 2 years)"
          value={newCustomer.duration}
          onChange={e => setNewCustomer({ ...newCustomer, duration: e.target.value })}
          className="p-2 border border-black focus:outline-none font-semibold text-gray-800 rounded"
        />

        {/* 6. Email */}
        <input
          type="text"
          placeholder="Email Address"
          value={newCustomer.email}
          onChange={e => setNewCustomer({ ...newCustomer, email: e.target.value })}
          className="p-2 border border-black focus:outline-none font-semibold text-gray-800 rounded"
        />

        {/* 7. Phone */}
        <input
          type="text"
          placeholder="Phone Number"
          value={newCustomer.phone}
          onChange={e => setNewCustomer({ ...newCustomer, phone: e.target.value })}
          className="p-2 border border-black focus:outline-none font-semibold text-gray-800 rounded"
        />

        {/* 8. Payment Info */}
        <input
          type="text"
          placeholder="Payment Info"
          value={newCustomer.paymentInfo}
          onChange={e => setNewCustomer({ ...newCustomer, paymentInfo: e.target.value })}
          className="p-2 border border-black focus:outline-none font-semibold text-gray-800 rounded"
        />

        {/* 9. VAT Code */}
        <input
          type="text"
          placeholder="Customer VAT Code"
          value={newCustomer.vatCode}
          onChange={e => setNewCustomer({ ...newCustomer, vatCode: e.target.value })}
          className="p-2 border border-black focus:outline-none font-semibold text-gray-800 rounded"
        />

        {/* 10. Services (multi-select) */}
                <div className="md:col-span-2 relative">
  <label className="block text-sm font-medium text-gray-700 mb-1">Services</label>
  <div
    className="p-2 border border-black rounded cursor-pointer bg-white text-gray-900 font-semibold"
    onClick={() => setServiceDropdownOpen(!serviceDropdownOpen)}
  >
    {newCustomer.services.current.length > 0
      ? newCustomer.services.current.join(', ')
      : 'Select services'}
  </div>

  {serviceDropdownOpen && (
    <div
      ref={dropdownRef}
      className="absolute z-10 mt-1 w-full bg-gray-100 border border-gray-600 text-sm text-gray-900 font-semibold rounded shadow-xl shadow-gray-700 max-h-60 overflow-auto"
    >
      {[
        "Totally Tasty",
        "Cleaning and Janitorial Supplies",
        "Business Supplies",
        "Business Print",
        "Managed Print",
        "Mailroom Equipment",
        "Secure Shredding",
        "Workspace",
        "Office Plants & Plant Displays",
        "Workwear",
        "Defibrillators",
      ].map((service) => (
        <label key={service} className="flex items-center px-4 py-2 text-sm text-gray-800 hover:bg-gray-200 cursor-pointer"
        >
          <input
            type="checkbox"
            className="mr-2"
            checked={newCustomer.services.current.includes(service)}
            onChange={() => {
              const isChecked = newCustomer.services.current.includes(service);
              const updated = isChecked
                ? newCustomer.services.current.filter((s) => s !== service)
                : [...newCustomer.services.current, service];
              setNewCustomer({
                ...newCustomer,
                services: {
                  ...newCustomer.services,
                  current: updated,
                },
              });
            }}
          />
          {service}
        </label>
      ))}
    </div>
  )}
</div>

        {/* 11. Past Services */}
        <input
          type="text"
          placeholder="Past Services (comma separated)"
          onChange={e =>
            setNewCustomer({
              ...newCustomer,
              services: {
                ...newCustomer.services,
                past: e.target.value.split(',').map(s => s.trim()),
              },
            })
          }
          className="p-2 border border-black focus:outline-none font-semibold text-gray-800 rounded md:col-span-2"
        />

        {/* 12. Document Upload */}
        <input
          type="file"
          accept="application/pdf,image/*"
          onChange={e =>
            setNewCustomer({
              ...newCustomer,
              document: e.target.files ? e.target.files[0] : null,
            })
          }
          className="p-2 border border-black focus:outline-none font-semibold text-gray-800 rounded md:col-span-2"
        />
      </div>

      {/* Action Buttons */}
      <div className="flex justify-end gap-3">
        <button
          onClick={() => setShowAddForm(false)}
          className="text-sm text-gray-600 border border-gray-300 rounded px-4 py-2 hover:bg-gray-100"
        >
          Cancel
        </button>
        <button
          onClick={handleAddCustomer}
          className="text-sm text-white bg-blue-600 px-4 py-2 rounded hover:bg-blue-700"
        >
          Add Customer
        </button>
      </div>
    </div>
  </div>
)}


          {showEditForm && editingCustomer && (
            <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
              <div className="bg-white rounded-lg p-6 w-full max-w-2xl shadow-lg">
                <h2 className="text-xl font-semibold mb-4 text-blue-700">Edit Customer</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  {/* Postcode Lookup */}
                  <div className="space-y-2">
                    <div className="relative">
                      <div className="flex gap-2">
                        <input
                          type="text"
                          placeholder="Enter UK Postcode (e.g., M3 1SH)"
                          value={postcode}
                          onChange={e => setPostcode(e.target.value)}
                          onKeyDown={e => e.key === 'Enter' && handlePostcodeLookup()}
                          className="flex-1 p-2 border border-black focus:outline-none font-semibold text-gray-800 rounded"
                        />
                        <button
                          type="button"
                          onClick={handlePostcodeLookup}
                          disabled={isLoadingAddress}
                          className="px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 whitespace-nowrap"
                        >
                          {isLoadingAddress ? 'Looking...' : 'Find'}
                        </button>
                      </div>
                      
                      {/* Address Dropdown */}
                      {isLoadingAddress ? (
                        <div className="absolute z-10 mt-1 w-full bg-white border border-gray-300 rounded-md shadow-lg p-2">
                          <div className="text-sm text-gray-600 py-1">Searching for addresses...</div>
                        </div>
                      ) : addressSuggestions.length > 0 ? (
                        <div className="absolute z-10 mt-1 w-full bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto">
                          <div className="px-3 py-2 text-xs text-gray-500 bg-gray-50 border-b">
                            Found {addressSuggestions.length} addresses:
                          </div>
                          {addressSuggestions.map((address, index) => (
                            <div
                              key={index}
                              className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer border-b border-gray-100 last:border-b-0"
                              onClick={() => {
                                setEditingCustomer({...editingCustomer, billingAddress: address});
                                setAddressSuggestions([]);
                              }}
                            >
                              {address}
                            </div>
                          ))}
                        </div>
                      ) : null}
                    </div>
                    
                    {addressError && (
                      <p className="text-red-500 text-sm">{addressError}</p>
                    )}
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Billing Address</label>
                      <input
                        type="text"
                        placeholder="Address will appear here after selection"
                        value={editingCustomer.billingAddress}
                        onChange={e => setEditingCustomer({ ...editingCustomer, billingAddress: e.target.value })}
                        className="w-full p-2 border border-black focus:outline-none font-semibold text-gray-800 rounded"
                      />
                    </div>
                  </div>
                   {/* 2. First Name */}
        <input
          type="text"
          placeholder="First Name"
          value={editingCustomer.firstName || ''}
          onChange={e => setEditingCustomer({ ...editingCustomer, firstName: e.target.value })}
          className="p-2 border border-black focus:outline-none font-semibold text-gray-800 rounded"
        />

        {/* 3. Last Name */}
        <input
          type="text"
          placeholder="Last Name"
          value={editingCustomer.lastName || ''}
          onChange={e => setEditingCustomer({ ...editingCustomer, lastName: e.target.value })}
          className="p-2 border border-black focus:outline-none font-semibold text-gray-800 rounded"
        />

        {/* 4. Company */}
        <input
          type="text"
          placeholder="Company"
          value={editingCustomer.company}
          onChange={e => setEditingCustomer({ ...editingCustomer, company: e.target.value })}
          className="p-2 border border-black focus:outline-none font-semibold text-gray-800 rounded"
        />

        {/* 5. Duration */}
        <input
          type="text"
          placeholder="Duration (e.g. 2 years)"
          value={editingCustomer.duration}
          onChange={e => setEditingCustomer({ ...editingCustomer, duration: e.target.value })}
          className="p-2 border border-black focus:outline-none font-semibold text-gray-800 rounded"
        />

        {/* 6. Email */}
        <input
          type="text"
          placeholder="Email Address"
          value={editingCustomer.email}
          onChange={e => setEditingCustomer({ ...editingCustomer, email: e.target.value })}
          className="p-2 border border-black focus:outline-none font-semibold text-gray-800 rounded"
        />

        {/* 7. Phone */}
        <input
          type="text"
          placeholder="Phone Number"
          value={editingCustomer.phone}
          onChange={e => setEditingCustomer({ ...editingCustomer, phone: e.target.value })}
          className="p-2 border border-black focus:outline-none font-semibold text-gray-800 rounded"
        />

        {/* 8. Payment Info */}
        <input
          type="text"
          placeholder="Payment Info"
          value={editingCustomer.paymentInfo}
          onChange={e => setEditingCustomer({ ...editingCustomer, paymentInfo: e.target.value })}
          className="p-2 border border-black focus:outline-none font-semibold text-gray-800 rounded"
        />

        {/* 9. VAT Code */}
        <input
          type="text"
          placeholder="Customer VAT Code"
          value={editingCustomer.vatCode}
          onChange={e => setEditingCustomer({ ...editingCustomer, vatCode: e.target.value })}
          className="p-2 border border-black focus:outline-none font-semibold text-gray-800 rounded"
        />

        {/* 10. Services (Multi-select Dropdown) */}
        <div className="md:col-span-2 relative">
          <label className="block text-sm font-medium text-gray-700 mb-1">Services</label>
          <div
            className="p-2 border border-black rounded cursor-pointer bg-white text-gray-900 font-semibold"
            onClick={() => setServiceDropdownOpen(!serviceDropdownOpen)}
          >
            {editingCustomer.services.current.length > 0
              ? editingCustomer.services.current.join(', ')
              : 'Select services'}
          </div>

          {serviceDropdownOpen && (
            <div
              ref={dropdownRef}
              className="absolute z-10 mt-1 w-full bg-gray-100 border border-gray-600 text-sm text-gray-900 font-semibold rounded shadow-xl shadow-gray-700 max-h-60 overflow-auto"
            >
              {[
                "Totally Tasty",
                "Cleaning and Janitorial Supplies",
                "Business Supplies",
                "Business Print",
                "Managed Print",
                "Mailroom Equipment",
                "Secure Shredding",
                "Workspace",
                "Office Plants & Plant Displays",
                "Workwear",
                "Defibrillators",
              ].map((service) => (
                <label key={service} className="flex items-center px-4 py-2 text-sm text-gray-800 hover:bg-gray-200 cursor-pointer">
                  <input
                    type="checkbox"
                    className="mr-2"
                    checked={editingCustomer.services.current.includes(service)}
                    onChange={() => {
                      const isChecked = editingCustomer.services.current.includes(service);
                      const updated = isChecked
                        ? editingCustomer.services.current.filter((s) => s !== service)
                        : [...editingCustomer.services.current, service];
                      setEditingCustomer({
                        ...editingCustomer,
                        services: {
                          ...editingCustomer.services,
                          current: updated,
                        },
                      });
                    }}
                  />
                  {service}
                </label>
              ))}
            </div>
          )}
        </div>
                  {/* {[
                    ['Full Name', 'name'],
                    ['Company', 'company'],
                    ['Duration (e.g. 2 years)', 'duration'],
                    ['Email Address', 'email'],
                    ['Phone Number', 'phone'],
                    ['Payment Info', 'paymentInfo'],
                    ['Customer VAT Code', 'vatCode'],
                  ].map(([placeholder, field]) => (
                    <input
                      key={field}
                      type="text"
                      placeholder={placeholder}
                      value={editingCustomer[field as keyof Customer] as string}
                      onChange={e => setEditingCustomer({ ...editingCustomer, [field]: e.target.value })}
                      className="p-2 border border-black focus:outline-none font-semibold text-gray-800 rounded"
                    />
                  ))} */}

                  
                  <input
                    type="text"
                    placeholder="Past Services (comma separated)"
                    value={editingCustomer.services.past.join(', ')}
                    onChange={e =>
                      setEditingCustomer({
                        ...editingCustomer,
                        services: {
                          ...editingCustomer.services,
                          past: e.target.value.split(',').map(s => s.trim()),
                        },
                      })
                    }
                    className="p-2 border border-black focus:outline-none font-semibold text-gray-800 rounded"
                  />
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Document Upload</label>
                    <input
                      type="file"
                      accept="application/pdf,image/*"
                      onChange={e =>
                        setEditingCustomer({
                          ...editingCustomer,
                          document: e.target.files ? e.target.files[0] : editingCustomer.document,
                        })
                      }
                      className="p-2 border border-black focus:outline-none font-semibold text-gray-800 rounded w-full"
                    />
                    {typeof editingCustomer.document === 'string' && (
                      <div className="mt-2">
                        <p className="text-sm text-gray-600">Current document:</p>
                        <a 
                          href={`http://localhost:5000${editingCustomer.document}`} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-sm text-blue-600 hover:underline"
                        >
                          View Current Document
                        </a>
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex justify-end gap-3">
                  <button
                    onClick={() => {
                      setShowEditForm(false);
                      setEditingCustomer(null);
                    }}
                    className="text-sm text-gray-600 border border-gray-300 rounded px-4 py-2 hover:bg-gray-100"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleUpdateCustomer}
                    className="text-sm text-white bg-blue-600 px-4 py-2 rounded hover:bg-blue-700"
                  >
                    Update Customer
                  </button>
                </div>
              </div>
            </div>
          )}

          {loading ? (
            <div className="flex justify-center items-center h-40">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
            </div>
          ) : filteredCustomers.length === 0 ? (
            <div className="text-center py-10 text-gray-500">
              No customers found. Add a new customer to get started.
            </div>
          ) : (
            <div className="grid gap-6">
              {filteredCustomers.map((customer) => (
              <div key={customer._id} className="border border-green-100 p-4 rounded-lg shadow-md bg-white relative">
                {activeTab === 'details' ? (
                  <>
                    <h2 className="text-xl font-semibold text-green-800">{customer.firstName} {customer.lastName}</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                      <div>
                        <p className="text-sm font-medium text-gray-700">Company</p>
                        <p className="text-sm text-gray-600 mb-2">{customer.company || 'N/A'}</p>
                        
                        <p className="text-sm font-medium text-gray-700">Email</p>
                        <p className="text-sm text-gray-600 mb-2">{customer.email || 'N/A'}</p>
                        
                        <p className="text-sm font-medium text-gray-700">Phone</p>
                        <p className="text-sm text-gray-600 mb-2">{customer.phone || 'N/A'}</p>
                        
                        <p className="text-sm font-medium text-gray-700">VAT Code</p>
                        <p className="text-sm text-gray-600">{customer.vatCode || 'N/A'}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-700">Payment Info</p>
                        <p className="text-sm text-gray-600 mb-2">{customer.paymentInfo || 'N/A'}</p>
                        
                        <p className="text-sm font-medium text-gray-700">Billing Address</p>
                        <p className="text-sm text-gray-600">{customer.billingAddress || 'N/A'}</p>
                      </div>
                    </div>
                    <div className="mt-4">
                      <p className="text-sm font-medium text-gray-700 mb-2">Services</p>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm font-medium text-green-700 mb-1">Current Services</p>
                          <ul className="list-disc list-inside">
                            {customer.services && customer.services.current && customer.services.current.length > 0 ? (
                              customer.services.current.map((service, i) => (
                                <li key={i} className="text-sm text-gray-700">{service}</li>
                              ))
                            ) : (
                              <li className="text-sm text-gray-400">No current services</li>
                            )}
                          </ul>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-700 mb-1">Past Services</p>
                          <ul className="list-disc list-inside">
                            {customer.services && customer.services.past && customer.services.past.length > 0 ? (
                              customer.services.past.map((service, i) => (
                                <li key={i} className="text-sm text-gray-500">{service}</li>
                              ))
                            ) : (
                              <li className="text-sm text-gray-400">No past services</li>
                            )}
                          </ul>
                        </div>
                      </div>
                    </div>
                    {customer.document && (
                      <div className="mt-4">
                        <p className="text-sm font-medium text-gray-700">Document</p>
                        {typeof customer.document === 'string' ? (
                          <a 
                            href={`http://localhost:5000${customer.document}`} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-sm text-blue-600 hover:underline"
                          >
                            View Document
                          </a>
                        ) : (
                          <p className="text-sm text-blue-600">{customer.document.name}</p>
                        )}
                      </div>
                    )}
                    
                    <div className="absolute top-4 right-4 flex space-x-2">
                      <button
                        onClick={() => handleEditCustomer(customer)}
                        className="text-blue-500 hover:text-blue-700 text-sm mr-2"
                        title="Edit Customer"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteCustomer(customer._id || '')}
                        className="text-red-500 hover:text-red-700 text-sm"
                        title="Delete Customer"
                      >
                        Delete
                      </button>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="flex justify-between items-start">
                      <div>
                        <h2 className="text-lg font-semibold text-gray-800">{customer.firstName} {customer.lastName}</h2>
                        <p className="text-sm text-gray-600">{customer.company || 'No company'}</p>
                      </div>
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        {customer.duration}
                      </span>
                    </div>
                    
                    <div className="mt-4 space-y-3">
                      <div>
                            <p className="text-sm font-medium text-gray-700">Payment Information</p>
                            <p className="text-sm text-gray-600">{customer.paymentInfo}</p>
                          </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm font-medium text-green-700">Current Services</p>
                          <ul className="mt-1 space-y-1">
                            {customer.services.current.map((service, i) => (
                              <li key={i} className="text-sm text-gray-700">• {service}</li>
                            ))}
                          </ul>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-700">Service History</p>
                          <ul className="mt-1 space-y-1">
                            {customer.services.past.map((service, i) => (
                              <li key={i} className="text-sm text-gray-500">• {service}</li>
                            ))}
                            {customer.services.past.length === 0 && (
                              <li className="text-sm text-gray-400">No past services</li>
                            )}
                          </ul>
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;