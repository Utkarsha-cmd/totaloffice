import React, { useState, useEffect } from 'react';
import { User, userService } from '../services/userService';

interface StaffDashboardProps {
  username: string;
  userType: 'staff';
  onLogout: () => void;
}

const StaffDashboard: React.FC<StaffDashboardProps> = ({ username, onLogout }) => {
  const [customers, setCustomers] = useState<User[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        setLoading(true);
        const data = await userService.getUsers();
        setCustomers(data);
      } catch (err) {
        setError('Failed to fetch customers');
        console.error('Error fetching customers:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchCustomers();
  }, []);

  const filteredCustomers = customers.filter(customer => 
    `${customer.firstName} ${customer.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.company?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 text-red-500">
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">Staff Dashboard</h1>
          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-600">Welcome, {username}</span>
            <button
              onClick={onLogout}
              className="px-3 py-1 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
        {/* Search and filter */}
        <div className="mb-6">
          <div className="flex justify-between items-center mb-4">
            <div className="relative w-1/3">
              <input
                type="text"
                placeholder="Search customers..."
                className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <div className="absolute left-3 top-2.5 text-gray-400">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>

          </div>
        </div>

        {/* Customer List */}
        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          {filteredCustomers.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500">No customers found</p>
            </div>
          ) : (
            <ul className="divide-y divide-gray-200">
              {filteredCustomers.map((customer) => (
                <li key={customer._id} className="hover:bg-gray-50">
                  <div className="px-4 py-4 sm:px-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
                          <span className="text-green-600 font-medium">
                            {customer.firstName?.[0]}{customer.lastName?.[0]}
                          </span>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {customer.firstName} {customer.lastName}
                          </div>
                          <div className="text-sm text-gray-500">{customer.company}</div>
                        </div>
                      </div>

                    </div>
                    
                    <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="font-medium text-gray-700">Contact Information</p>
                        <p className="text-gray-600">Email: {customer.email}</p>
                        <p className="text-gray-600">Phone: {customer.phone}</p>
                        <p className="text-gray-600">Company: {customer.company}</p>
                        {customer.vatCode && (
                          <p className="text-gray-600">VAT Code: {customer.vatCode}</p>
                        )}
                        <p className="text-gray-600">Duration: {customer.duration}</p>
                        {customer.billingAddress && (
                          <div className="mt-2">
                            <p className="font-medium text-gray-700">Billing Address</p>
                            <p className="text-gray-600">{customer.billingAddress}</p>
                          </div>
                        )}
                        {customer.paymentInfo && (
                          <div className="mt-2">
                            <p className="font-medium text-gray-700">Payment Information</p>
                            <p className="text-gray-600">{customer.paymentInfo}</p>
                          </div>
                        )}
                      </div>
                      <div>
                        <p className="font-medium text-gray-700">Current Services</p>
                        {customer.services?.current?.length > 0 ? (
                          <ul className="list-disc list-inside text-green-600">
                            {customer.services.current.map((service, i) => (
                              <li key={i} className="mb-1">{service}</li>
                            ))}
                          </ul>
                        ) : (
                          <p className="text-gray-500">No active services</p>
                        )}
                        
                        <div className="mt-4">
                          <p className="font-medium text-gray-700">Service History</p>
                          {customer.services?.past?.length > 0 ? (
                            <ul className="list-disc list-inside text-gray-500">
                              {customer.services.past.map((service, i) => (
                                <li key={`past-${i}`} className="text-sm">{service}</li>
                              ))}
                            </ul>
                          ) : (
                            <p className="text-gray-500 text-sm">No past services</p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </main>
    </div>
  );
};

export default StaffDashboard;
