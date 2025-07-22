import React from 'react';
import {
  Package,
  MapPin,
  CreditCard,
  Calendar,
  Truck,
  CheckCircle,
  Clock,
  XCircle,
  AlertCircle
} from 'lucide-react';
import { Order } from '../hooks/order';
import { cn } from '@/lib/utils';

interface OrderCardProps {
  order: Order;
  onStatusUpdate?: (orderId: string, status: Order['status']) => void;
}

const OrderCard: React.FC<OrderCardProps> = ({ order, onStatusUpdate }) => {
  const getStatusColor = (status: Order['status']) => {
    switch (status) {
      case 'pending':
        return 'bg-gray-200 text-gray-700';
      case 'processing':
        return 'bg-gray-400 text-white';
      case 'shipped':
        return 'bg-blue-100 text-blue-800';
      case 'delivered':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-200 text-gray-600';
    }
  };

  const getStatusIcon = (status: Order['status']) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-4 w-4" />;
      case 'processing':
        return <AlertCircle className="h-4 w-4" />;
      case 'shipped':
        return <Truck className="h-4 w-4" />;
      case 'delivered':
        return <CheckCircle className="h-4 w-4" />;
      case 'cancelled':
        return <XCircle className="h-4 w-4" />;
      default:
        return <Package className="h-4 w-4" />;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: 'GBP'
    }).format(amount);
  };

  const handleConfirmOrder = () => {
    if (onStatusUpdate && order.status === 'pending') {
      onStatusUpdate(order._id, 'processing');
    }
  };

  const handleDownloadInvoice = () => {
    const invoiceContent = `
      Order Invoice
      -------------
      Order Number: ${order.orderNumber}
      Customer: ${order.customerName}
      Email: ${order.customerEmail}
      Total: ${formatCurrency(order.total)}
      Status: ${order.status}
      Items:
      ${order.items.map((item) => `- ${item.name} (x${item.quantity})`).join('\n')}
    `;

    const blob = new Blob([invoiceContent], { type: 'text/plain' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `Invoice_${order.orderNumber}.txt`;
    link.click();
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
      {/* Header */}
      <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="text-lg font-semibold text-gray-800">{order.orderNumber}</h3>
            <p className="text-sm text-gray-500">
              {order.customerName} • {order.customerEmail}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <span
              className={cn(
                'inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium',
                getStatusColor(order.status)
              )}
            >
              {getStatusIcon(order.status)}
              {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
            </span>
            <div className="text-right">
              <p className="text-lg font-bold text-gray-700">{formatCurrency(order.total)}</p>
              <p className="text-xs text-gray-500">Total</p>
            </div>
          </div>
        </div>
      </div>

      <div className="p-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Order Items */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-3">
              <Package className="h-4 w-4 text-gray-700" />
              <h4 className="font-medium text-gray-800">Order Items</h4>
            </div>
            <div className="space-y-3">
              {order.items.map((item) => (
                <div key={item.id} className="flex justify-between items-start p-3 bg-gray-100 rounded-md">
                  <div className="flex-1">
                    <p className="font-medium text-sm text-gray-800">{item.name}</p>
                    <p className="text-xs text-gray-500">{item.category}</p>
                    {item.description && (
                      <p className="text-xs text-gray-500 mt-1">{item.description}</p>
                    )}
                    <p className="text-xs text-gray-500 mt-1">Qty: {item.quantity}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-sm text-gray-800">{formatCurrency(item.price)}</p>
                    <p className="text-xs text-gray-500">each</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Summary */}
            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Subtotal:</span>
                  <span className="text-gray-800">{formatCurrency(order.subtotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Tax:</span>
                  <span className="text-gray-800">{formatCurrency(order.tax)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Shipping:</span>
                  <span className="text-gray-800">{formatCurrency(order.shipping)}</span>
                </div>
                <div className="flex justify-between font-medium text-base border-t border-gray-200 pt-2">
                  <span className="text-gray-800">Total:</span>
                  <span className="text-gray-700">{formatCurrency(order.total)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Shipping & Details */}
          <div className="space-y-6">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <MapPin className="h-4 w-4 text-gray-700" />
                <h4 className="font-medium text-gray-800">Shipping Address</h4>
              </div>
              <div className="p-3 bg-gray-100 rounded-md text-sm">
                <p className="font-medium text-gray-800">
                  {order.shippingAddress.firstName} {order.shippingAddress.lastName}
                </p>
                {order.shippingAddress.company && (
                  <p className="text-gray-500">{order.shippingAddress.company}</p>
                )}
                <p className="text-gray-500">{order.shippingAddress.street}</p>
                <p className="text-gray-500">
                  {order.shippingAddress.city}, {order.shippingAddress.state}
                </p>
                <p className="text-gray-500">
                  {order.shippingAddress.postalCode}, {order.shippingAddress.country}
                </p>
                {order.shippingAddress.phone && (
                  <p className="text-gray-500 mt-1">{order.shippingAddress.phone}</p>
                )}
              </div>
            </div>

            <div>
              <div className="flex items-center gap-2 mb-3">
                <Calendar className="h-4 w-4 text-gray-700" />
                <h4 className="font-medium text-gray-800">Order Details</h4>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Order Date:</span>
                  <span className="text-gray-800">{formatDate(order.orderDate)}</span>
                </div>
                {order.estimatedDelivery && (
                  <div className="flex justify-between">
                    <span className="text-gray-500">Est. Delivery:</span>
                    <span className="text-gray-800">{formatDate(order.estimatedDelivery)}</span>
                  </div>
                )}
                {order.trackingNumber && (
                  <div className="flex justify-between">
                    <span className="text-gray-500">Tracking:</span>
                    <span className="text-gray-700 font-medium">{order.trackingNumber}</span>
                  </div>
                )}
              </div>
            </div>

            <div>
              <div className="flex items-center gap-2 mb-3">
                <CreditCard className="h-4 w-4 text-gray-700" />
                <h4 className="font-medium text-gray-800">Payment Method</h4>
              </div>
              <div className="p-3 bg-gray-100 rounded-md text-sm">
                <p className="text-gray-800">{order.paymentMethod}</p>
              </div>
            </div>

            {order.notes && (
              <div>
                <h4 className="font-medium text-gray-800 mb-2">Special Instructions</h4>
                <div className="p-3 bg-gray-100 rounded-md text-sm">
                  <p className="text-gray-500">{order.notes}</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Status Update Section */}
        {onStatusUpdate && (
          <div className="mt-6 pt-4 border-t border-gray-200 space-y-4">
            {/* Confirm Order */}
            {order.status === 'pending' && (
              <div>
                <button
                  onClick={handleConfirmOrder}
                  className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700 transition-colors"
                >
                  Confirm Order
                </button>
              </div>
            )}

            {/* Download Invoice */}
            <div>
              <button
                onClick={handleDownloadInvoice}
                className="bg-gray-100 text-gray-800 px-4 py-2 rounded-md text-sm font-medium hover:bg-gray-200 transition-colors"
              >
                Download Invoice
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default OrderCard;
