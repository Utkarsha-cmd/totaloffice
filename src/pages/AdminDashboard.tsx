import React, { useState } from 'react';

interface AdminDashboardProps {
  username: string;
  userType: 'admin' | 'staff' | 'customer';
  onLogout: () => void;
}

interface Customer {
  name: string;
  company: string;
  duration: string;
  services: {
    current: string[];
    past: string[];
  };
  document?: File | null;
  contact: string;
  billingAddress: string;
  paymentInfo: string;
}

const initialCustomers: Customer[] = [
  {
    name: 'John Doe',
    company: 'Tech Supplies Ltd.',
    duration: '2 years',
    services: {
      current: ['Business Supplies', 'Manage Print'],
      past: ['Secure Shredding', 'Workwear'],
    },
    document: null,
    contact: 'john@example.com',
    billingAddress: '123 Tech Lane, Silicon Valley, CA',
    paymentInfo: 'Credit Card - **** 1234',
  },
  {
    name: 'Jane Smith',
    company: 'Design Co.',
    duration: '1.5 years',
    services: {
      current: ['Mailroom Equipment', 'Business Print'],
      past: ['Business Supplies'],
    },
    document: null,
    contact: 'jane@example.com',
    billingAddress: '456 Design Blvd, Creative City, NY',
    paymentInfo: 'PayPal - jane@paypal.com',
  },
];

const AdminDashboard: React.FC<AdminDashboardProps> = ({ username, userType, onLogout }) => {
  const [customers, setCustomers] = useState<Customer[]>(initialCustomers);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [newCustomer, setNewCustomer] = useState<Customer>({
    name: '',
    company: '',
    duration: '',
    services: { current: [], past: [] },
    document: null,
    contact: '',
    billingAddress: '',
    paymentInfo: '',
  });

  const filteredCustomers = customers.filter(c =>
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.company.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDownloadCSV = () => {
    const csv = [
      ['Name', 'Company', 'Duration', 'Current Services', 'Past Services', 'Contact', 'Billing Address', 'Payment Info'],
      ...customers.map(c => [
        c.name,
        c.company,
        c.duration,
        c.services.current.join(', '),
        c.services.past.join(', '),
        c.contact,
        c.billingAddress,
        c.paymentInfo,
      ]),
    ]
      .map(row => row.map(value => `"${value}"`).join(','))
      .join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'customers.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleAddCustomer = () => {
    setCustomers([...customers, newCustomer]);
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
    setShowAddForm(false);
  };

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-green-700">Admin Dashboard</h1>
        <div className="flex gap-3 items-center">
          <button
            onClick={() => setShowAddForm(true)}
            className="text-sm text-blue-600 border border-blue-200 rounded px-3 py-1 hover:bg-blue-50"
          >
            Add Customer
          </button>
          <button
            onClick={handleDownloadCSV}
            className="text-sm text-green-700 border border-green-200 rounded px-3 py-1 hover:bg-green-50"
          >
            Download CSV
          </button>
          <button
            onClick={onLogout}
            className="text-sm text-red-600 border border-red-200 rounded px-3 py-1 hover:bg-red-50"
          >
            Logout ({username})
          </button>
        </div>
      </div>

      <input
        type="text"
        placeholder="Search by name or company..."
        value={searchTerm}
        onChange={e => setSearchTerm(e.target.value)}
        className="mb-6 p-2 border border-gray-200 rounded w-full"
      />

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
                ['Billing Address', 'billingAddress'],
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

      <div className="grid gap-6">
        {filteredCustomers.map((customer, index) => (
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
            {customer.document && (
              <p className="text-sm text-blue-600 mt-2">Document: {customer.document.name}</p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminDashboard;