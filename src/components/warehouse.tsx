import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';

interface Order {
  id: string;
  product: string;
  quantity: number;
  isDispatched: boolean;
  isPicked: boolean;
}

interface WarehouseDashboardProps {
  username: string;
  userType: 'warehouse';
  onLogout: () => void;
}

const initialOrders: Order[] = [
  { id: 'ORD001', product: 'Office Chair', quantity: 5, isDispatched: false, isPicked: false },
  { id: 'ORD002', product: 'Desk Lamp', quantity: 10, isDispatched: false, isPicked: false },
  { id: 'ORD003', product: 'Filing Cabinet', quantity: 3, isDispatched: false, isPicked: false },
];

const WarehouseDashboard: React.FC<WarehouseDashboardProps> = ({ username, userType, onLogout }) => {
  const [orders, setOrders] = useState<Order[]>(initialOrders);

  const handleToggle = (orderId: string, field: 'isDispatched' | 'isPicked') => {
    setOrders(prev =>
      prev.map(order =>
        order.id === orderId ? { ...order, [field]: !order[field] } : order
      )
    );
  };

  const handleSave = () => {
    console.log('Saving status:', orders);
    alert('Order statuses updated!');
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-emerald-600">Warehouse Dashboard</h2>
          <p className="text-sm text-gray-600">Logged in as <strong>{username}</strong> ({userType})</p>
        </div>
        <Button onClick={onLogout} className="bg-red-500 hover:bg-red-600 text-white">
          Logout
        </Button>
      </div>

      <Card className="shadow-lg bg-white">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-gray-800">Order Status</CardTitle>
        </CardHeader>

        <CardContent className="overflow-x-auto">
          <table className="min-w-full border border-gray-300 shadow-md rounded-lg overflow-hidden">
            <thead className="bg-green-100 text-gray-900 font-semibold border-b border-gray-300">
              <tr>
                <th className="py-2 px-4 border border-gray-300">Order ID</th>
                <th className="py-2 px-4 border border-gray-300">Product</th>
                <th className="py-2 px-4 border border-gray-300">Quantity</th>
                <th className="py-2 px-4 border text-center border-gray-300">Dispatched</th>
                <th className="py-2 px-4 border text-center border-gray-300">Picked Up</th>
              </tr>
            </thead>
            <tbody>
              {orders.map(order => (
                <tr key={order.id} className="border-t  text-gray-800">
                  <td className="py-2 px-4 border border-gray-300">{order.id}</td>
                  <td className="py-2 px-4 border border-gray-300">{order.product}</td>
                  <td className="py-2 px-4 border border-gray-300">{order.quantity}</td>
                  <td className="py-2 px-4 border border-gray-300 text-center">
                    <Checkbox
                      checked={order.isDispatched}
                      onCheckedChange={() => handleToggle(order.id, 'isDispatched')}
                    />
                  </td>
                  <td className="py-2 px-4 border border-gray-300 text-center">
                    <Checkbox
                      checked={order.isPicked}
                      onCheckedChange={() => handleToggle(order.id, 'isPicked')}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="mt-6 text-center">
            <Button onClick={handleSave} className="bg-emerald-500 hover:bg-emerald-600 text-white">
              Save Changes
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default WarehouseDashboard;
