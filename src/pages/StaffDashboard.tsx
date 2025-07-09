import React from 'react';

interface StaffDashboardProps {
  username: string;
  userType: 'staff';
  onLogout: () => void;
  customers: {
    name: string;
    company: string;
    duration: string;
    services: {
      current: string[];
      past: string[];
    };
    contact: string;
    billingAddress: string;
    paymentInfo: string;
  }[];
}

const StaffDashboard: React.FC<StaffDashboardProps> = ({ username, userType, onLogout, customers }) => {
  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-green-700">Staff Dashboard</h1>
        <button
          onClick={onLogout}
          className="text-sm text-red-600 border border-red-200 rounded px-3 py-1 hover:bg-red-50"
        >
          Logout ({username})
        </button>
      </div>

      <div className="grid gap-6">
        {customers.map((customer, index) => (
          <div key={index} className="border border-green-100 p-4 rounded-lg shadow-md bg-white">
            <h2 className="text-xl font-semibold text-green-800">{customer.name}</h2>
            <p className="text-sm text-gray-600">Company: {customer.company}</p>
            <p className="text-sm text-gray-500">Service Duration: {customer.duration}</p>
            <p className="text-sm text-gray-500">Contact: {customer.contact}</p>
            <p className="text-sm text-gray-500">Billing Address: {customer.billingAddress}</p>
            <p className="text-sm text-gray-500 mb-2">Payment Info: {customer.paymentInfo}</p>

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="font-medium text-gray-700 mb-1">Current Services:</p>
                <ul className="list-disc list-inside text-green-700">
                  {customer.services.current.map((service, i) => (
                    <li key={i}>{service}</li>
                  ))}
                </ul>
              </div>
              <div>
                <p className="font-medium text-gray-700 mb-1">Past Services:</p>
                <ul className="list-disc list-inside text-gray-500">
                  {customer.services.past.map((service, i) => (
                    <li key={i}>{service}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default StaffDashboard;
