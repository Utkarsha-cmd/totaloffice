import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { Save } from 'lucide-react';


interface Order {
  id: string;
  product: string;
  quantity: number;
  isDispatched: boolean;
  isDelivered?: boolean;
  customerName?: string;
   companyName?: string; 
  address?: string;
  phone?: string;
}

interface WarehouseDashboardProps {
  username: string;
  userType: 'warehouse_staff';
  onLogout: () => void;
}

const initialOrders: Order[] = [
  {
    id: 'ORD001',
    product: 'Printer',
    quantity: 2,
    isDispatched: false,
    companyName: 'Tech Solutions Ltd',
  },
  {
    id: 'ORD001',
    product: 'Printer Paper',
    quantity: 5,
    isDispatched: false,
    companyName: 'Tech Solutions Ltd',
  },
  {
    id: 'ORD001',
    product: 'Toner Cartridge',
    quantity: 1,
    isDispatched: false,
    companyName: 'Tech Solutions Ltd',
  },
  {
    id: 'ORD002',
    product: 'Desk Lamp',
    quantity: 3,
    isDispatched: false,
    companyName: 'Bright Office Pvt Ltd',
  },
  {
    id: 'ORD002',
    product: 'Extension Cord',
    quantity: 4,
    isDispatched: false,
    companyName: 'Bright Office Pvt Ltd',
  },
  {
    id: 'ORD003',
    product: 'Office Chair',
    quantity: 2,
    isDispatched: false,
    companyName: 'NextGen Workspace Inc',
  },
  {
    id: 'ORD003',
    product: 'Footrest',
    quantity: 2,
    isDispatched: false,
    companyName: 'NextGen Workspace Inc',
  },
  {
    id: 'ORD003',
    product: 'Desk Mat',
    quantity: 1,
    isDispatched: false,
    companyName: 'NextGen Workspace Inc',
  },
];




const deliveredOrders: Order[] = [
  {
    id: 'ORD004',
    product: 'Monitor Stand',
    quantity: 2,
    isDispatched: true,
    isDelivered: true,
    customerName: 'Amit Sharma',
    address: '123 Tech Street, Bengaluru',
    phone: '9876543210',
  },
  {
    id: 'ORD005',
    product: 'Printer Paper',
    quantity: 20,
    isDispatched: true,
    isDelivered: true,
    customerName: 'Rina Verma',
    address: '456 Market Road, Pune',
    phone: '9123456789',
  },
];

const WarehouseDashboard: React.FC<WarehouseDashboardProps> = ({ username, userType, onLogout }) => {
  const [orders, setOrders] = useState<Order[]>(initialOrders);
  const [activeTab, setActiveTab] = useState<'new' | 'delivered'>('new');

  const handleToggle = (orderId: string, field: 'isDispatched', product: string) => {
  setOrders(prev =>
    prev.map(order =>
      order.id === orderId && order.product === product
        ? { ...order, [field]: !order[field] }
        : order
    )
  );
};


  const handleSave = () => {
    console.log('Saving status:', orders);
    alert('Order statuses updated!');
  };
  
  const handleSaveOrder = (orderId: string) => {
  const updatedOrders = orders.filter(order => order.id === orderId);
  console.log('Saved order update:', updatedOrders);
  alert(`Saved updates for Order ${orderId}`);
};


  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <div className="w-64 bg-white shadow-md flex flex-col justify-between">
        <div className="p-6">
          <h2 className="text-xl font-bold text-emerald-600 mb-6">Warehouse</h2>
          <div className="space-y-2">
            <button
              onClick={() => setActiveTab('new')}
              className={`w-full text-left px-4 py-2 rounded-md font-medium ${
                activeTab === 'new'
                  ? 'bg-emerald-500 text-white'
                  : 'hover:bg-gray-100 text-gray-800'
              }`}
            >
              New Orders
            </button>
            <button
              onClick={() => setActiveTab('delivered')}
              className={`w-full text-left px-4 py-2 rounded-md font-medium ${
                activeTab === 'delivered'
                  ? 'bg-emerald-500 text-white'
                  : 'hover:bg-gray-100 text-gray-800'
              }`}
            >
              Orders Delivered
            </button>
          </div>
        </div>

        {/* Logout section at the bottom */}
        <div className="p-6 border-t text-sm text-gray-600">
          <p className="mb-2">Logged in as <strong>{username}</strong></p>
          <Button onClick={onLogout} className="bg-red-500 hover:bg-red-600 text-white w-full">
            Logout
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-6">
        {activeTab === 'new' ? (
  <Card className="shadow-lg bg-white">
    <CardHeader>
      <CardTitle className="text-lg font-semibold text-gray-800">New Orders</CardTitle>
    </CardHeader>
    <CardContent className="overflow-x-auto">
      {Object.entries(
        orders.reduce<Record<string, Order[]>>((acc, order) => {
          if (!acc[order.id]) acc[order.id] = [];
          acc[order.id].push(order);
          return acc;
        }, {})
      ).map(([orderId, orderItems]) => (
        <div key={orderId} className="mb-6 border border-gray-200 rounded-md p-4 relative">
  <div className="flex justify-between items-center mb-1">
    <div>
      <h3 className="text-md font-bold text-emerald-600">Order ID: {orderId}</h3>
      <p className="text-sm text-gray-600">Company: <strong>{orderItems[0].companyName}</strong></p>
    </div>
    <Button
      variant="ghost"
      className="text-emerald-600 hover:text-emerald-800"
      onClick={() => handleSaveOrder(orderId)}
    >
      <Save className="w-5 h-5 mr-1" />
      <span className="text-sm">Save</span>
    </Button>
  </div>

  <table className="min-w-full border border-gray-300 shadow-sm rounded-lg overflow-hidden">
    <thead className="bg-green-100 text-gray-900 font-semibold border-b border-gray-300">
      <tr>
        <th className="py-2 px-4 border border-gray-300">Product</th>
        <th className="py-2 px-4 border border-gray-300">Quantity</th>
        <th className="py-2 px-4 border text-center border-gray-300">Dispatched</th>
      </tr>
    </thead>
    <tbody>
      {orderItems.map(order => (
        <tr key={order.product} className="border-t text-gray-800">
          <td className="py-2 px-4 border border-gray-300">{order.product}</td>
          <td className="py-2 px-4 border border-gray-300">{order.quantity}</td>
          <td className="py-2 px-4 border border-gray-300 text-center">
            <Checkbox
              checked={order.isDispatched}
              onCheckedChange={() => handleToggle(order.id, 'isDispatched', order.product)}
            />
          </td>
        </tr>
      ))}
    </tbody>
  </table>
</div>

      ))}
      <div className="mt-6 text-center">
        <Button onClick={handleSave} className="bg-emerald-500 hover:bg-emerald-600 text-white">
          Save Changes
        </Button>
      </div>
    </CardContent>
  </Card>
) : (
          <Card className="shadow-lg bg-white">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-gray-800">Orders Delivered</CardTitle>
            </CardHeader>
            <CardContent className="overflow-x-auto">
              <table className="min-w-full border border-gray-300 shadow-md rounded-lg overflow-hidden">
                <thead className="bg-green-100 text-gray-900 font-semibold border-b border-gray-300">
                  <tr>
                    <th className="py-2 px-4 border border-gray-300">Order ID</th>
                    <th className="py-2 px-4 border border-gray-300">Product</th>
                    <th className="py-2 px-4 border border-gray-300">Quantity</th>
                    <th className="py-2 px-4 border border-gray-300">Customer Name</th>
                    <th className="py-2 px-4 border border-gray-300">Address</th>
                    <th className="py-2 px-4 border border-gray-300">Phone</th>
                  </tr>
                </thead>
                <tbody>
                  {deliveredOrders.map(order => (
                    <tr key={order.id} className="border-t text-gray-800">
                      <td className="py-2 px-4 border border-gray-300">{order.id}</td>
                      <td className="py-2 px-4 border border-gray-300">{order.product}</td>
                      <td className="py-2 px-4 border border-gray-300">{order.quantity}</td>
                      <td className="py-2 px-4 border border-gray-300">{order.customerName}</td>
                      <td className="py-2 px-4 border border-gray-300">{order.address}</td>
                      <td className="py-2 px-4 border border-gray-300">{order.phone}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default WarehouseDashboard;
