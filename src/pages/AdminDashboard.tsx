import React, { useState, useEffect } from 'react';
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
    name: '',
    company: '',
    duration: '',
    services: { current: [], past: [] },
    document: null,
    contact: '',
    billingAddress: '',
    paymentInfo: '',
  });
  
  const [editingCustomer, setEditingCustomer] = useState<UserWithFile | null>(null);
  const [showEditForm, setShowEditForm] = useState(false);
  
  const [postcode, setPostcode] = useState('');
  const [addressSuggestions, setAddressSuggestions] = useState<string[]>([]);
  const [isLoadingAddress, setIsLoadingAddress] = useState(false);
  const [addressError, setAddressError] = useState('');

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

  const handleAddCustomer = async () => {
    try {
      // Validate email if contact is provided
      if (newCustomer.contact) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(newCustomer.contact)) {
          setError('Please enter a valid email address for contact');
          return;
        }
      }

      // Create FormData for file upload
      const formData = new FormData();
      formData.append('name', newCustomer.name);
      formData.append('company', newCustomer.company);
      formData.append('duration', newCustomer.duration);
      formData.append('services', JSON.stringify(newCustomer.services));
      formData.append('contact', newCustomer.contact);
      formData.append('billingAddress', newCustomer.billingAddress);
      formData.append('paymentInfo', newCustomer.paymentInfo);
      
      if (newCustomer.document) {
        formData.append('document', newCustomer.document);
      }
      
      await userService.createUser(formData);
      
      // Refresh customer list
      fetchCustomers();
      
      // Reset form
      setNewCustomer({
        name: '',
        company: '',
        duration: '',
        services: { current: [], past: [] },
        document: null,
        contact: '',
        billingAddress: '',
        paymentInfo: '',
      });
      setPostcode('');
      setAddressSuggestions([]);
      setShowAddForm(false);
    } catch (err: any) {
      setError(err.message || 'Failed to add user');
    }
  };

  const handleEditCustomer = (customer: UserWithFile) => {
    setEditingCustomer({
      ...customer,
      services: {
        current: [...(customer.services?.current || [])],
        past: [...(customer.services?.past || [])]
      }
    });
    setShowEditForm(true);
    setShowAddForm(false);
  };

  const handleUpdateCustomer = async () => {
    if (!editingCustomer || !editingCustomer._id) return;

    try {
      // Validate email if contact is provided
      if (editingCustomer.contact) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(editingCustomer.contact)) {
          setError('Please enter a valid email address for contact');
          return;
        }
      }

      // Create FormData for file upload
      const formData = new FormData();
      formData.append('name', editingCustomer.name);
      formData.append('company', editingCustomer.company);
      formData.append('duration', editingCustomer.duration);
      formData.append('services', JSON.stringify(editingCustomer.services));
      formData.append('contact', editingCustomer.contact);
      formData.append('billingAddress', editingCustomer.billingAddress);
      formData.append('paymentInfo', editingCustomer.paymentInfo);
      
      if (editingCustomer.document && editingCustomer.document instanceof File) {
        formData.append('document', editingCustomer.document);
      }
      
      await userService.updateUser(editingCustomer._id, formData);
      
      // Refresh customer list
      fetchCustomers();
      
      // Reset form
      setEditingCustomer(null);
      setShowEditForm(false);
    } catch (err: any) {
      setError(err.message || 'Failed to update user');
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

  const filteredCustomers = customers.filter(customer =>
    customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.contact.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
                  {[
                    ['Full Name', 'name'],
                    ['Company', 'company'],
                    ['Duration (e.g. 2 years)', 'duration'],
                    ['Contact Email or Phone', 'contact'],
                    ['Payment Info', 'paymentInfo'],
                  ].map(([placeholder, field]) => (
                    <input
                      key={field}
                      type="text"
                      placeholder={placeholder}
                      value={newCustomer[field as keyof Customer] as string}
                      onChange={e => setNewCustomer({ ...newCustomer, [field]: e.target.value })}
                      className="p-2 border border-black focus:outline-none font-semibold text-gray-800 rounded"
                    />
                  ))}

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
                      {addressSuggestions.length > 0 && (
                        <div className="absolute z-10 mt-1 w-full bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-auto">
                          {addressSuggestions.map((suggestion, index) => (
                            <div
                              key={index}
                              className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer"
                              onClick={() => handleAddressSelect(suggestion)}
                            >
                              {suggestion}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  <input
                    type="text"
                    placeholder="Current Services (comma separated)"
                    onChange={e =>
                      setNewCustomer({
                        ...newCustomer,
                        services: {
                          ...newCustomer.services,
                          current: e.target.value.split(',').map(s => s.trim()),
                        },
                      })
                    }
                    className="p-2 border border-black focus:outline-none font-semibold text-gray-800 rounded"
                  />
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
                    className="p-2 border border-black focus:outline-none font-semibold text-gray-800 rounded"
                  />
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
                  {[
                    ['Full Name', 'name'],
                    ['Company', 'company'],
                    ['Duration (e.g. 2 years)', 'duration'],
                    ['Contact Email or Phone', 'contact'],
                    ['Payment Info', 'paymentInfo'],
                  ].map(([placeholder, field]) => (
                    <input
                      key={field}
                      type="text"
                      placeholder={placeholder}
                      value={editingCustomer[field as keyof Customer] as string}
                      onChange={e => setEditingCustomer({ ...editingCustomer, [field]: e.target.value })}
                      className="p-2 border border-black focus:outline-none font-semibold text-gray-800 rounded"
                    />
                  ))}

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

                  <input
                    type="text"
                    placeholder="Current Services (comma separated)"
                    value={editingCustomer.services.current.join(', ')}
                    onChange={e =>
                      setEditingCustomer({
                        ...editingCustomer,
                        services: {
                          ...editingCustomer.services,
                          current: e.target.value.split(',').map(s => s.trim()),
                        },
                      })
                    }
                    className="p-2 border border-black focus:outline-none font-semibold text-gray-800 rounded"
                  />
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
                    <h2 className="text-xl font-semibold text-green-800">{customer.name}</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                      <div>
                        <p className="text-sm font-medium text-gray-700">Company</p>
                        <p className="text-sm text-gray-600">{customer.company}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-700">Service Duration</p>
                        <p className="text-sm text-gray-600">{customer.duration}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-700">Contact</p>
                        <p className="text-sm text-gray-600">{customer.contact}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-700">Billing Address</p>
                        <p className="text-sm text-gray-600">{customer.billingAddress}</p>
                      </div>
                      <div className="md:col-span-2">
                        <p className="text-sm font-medium text-gray-700">Payment Info</p>
                        <p className="text-sm text-gray-600">{customer.paymentInfo}</p>
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
                        <h2 className="text-lg font-semibold text-gray-800">{customer.name}</h2>
                        <p className="text-sm text-gray-600">{customer.company}</p>
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