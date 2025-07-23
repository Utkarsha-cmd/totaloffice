import React, { useState } from 'react';
import {
  Package,
  MapPin,
  CreditCard,
  Truck,
  CheckCircle,
  Clock,
  XCircle,
  AlertCircle,
  CalendarCheck,
  CalendarPlus
} from 'lucide-react';
import { Order } from '../hooks/order';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { Calendar } from '@/components/ui/calendar';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { orderService } from '@/services/orderService';

interface OrderCardProps {
  order: Order;
  onStatusUpdate?: (orderId: string, status: Order['status']) => void;
}

const OrderCard: React.FC<OrderCardProps> = ({ order, onStatusUpdate }) => {
  const [isSaving, setIsSaving] = useState(false);
  const [date, setDate] = useState<Date | undefined>(
    order.expectedDelivery ? new Date(order.expectedDelivery) : undefined
  );

  const handleDateChange = async (newDate: Date | undefined) => {
    if (!newDate) return;
    
    setDate(newDate);
    
    try {
      setIsSaving(true);
      await orderService.updateExpectedDeliveryDate(order._id, newDate);
    } catch (error) {
      console.error('Failed to update delivery date:', error);
      // Optionally show error toast here
    } finally {
      setIsSaving(false);
    }
  };
  const getStatusColor = (status: Order['status']) => {
    switch (status) {
      case 'pending':
        return 'bg-gray-100 text-gray-800 border border-gray-300';
      case 'processing':
        return 'bg-gray-200 text-gray-900 border border-gray-400';
      case 'shipped':
        return 'bg-gray-100 text-gray-900 border border-gray-300';
      case 'delivered':
        return 'bg-white text-gray-900 border border-gray-300';
      case 'cancelled':
        return 'bg-gray-100 text-gray-700 border border-gray-300 line-through';
      default:
        return 'bg-gray-100 text-gray-600 border border-gray-300';
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

  const handleMarkAsShipped = async () => {
    if (onStatusUpdate && order.status === 'processing') {
      try {
        await orderService.updateOrderStatus(order._id, 'shipped');
        onStatusUpdate(order._id, 'shipped');
      } catch (error) {
        console.error('Failed to update order status:', error);
        // Optionally show error toast here
      }
    }
  };

  const handleMarkAsDelivered = async () => {
    if (onStatusUpdate && order.status === 'shipped') {
      try {
        await orderService.updateOrderStatus(order._id, 'delivered');
        onStatusUpdate(order._id, 'delivered');
      } catch (error) {
        console.error('Failed to update order status:', error);
        // Optionally show error toast here
      }
    }
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
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Package className="h-4 w-4 text-gray-700" />
                <h4 className="font-medium text-gray-800">Order Items</h4>
              </div>
              
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className={cn(
                      'bg-white hover:bg-gray-100 justify-start text-left font-normal text-xs sm:text-sm h-8',
                      !date ? 'text-gray-500' : 'text-gray-900',
                      'border-gray-300 hover:border-gray-400 hover:bg-gray-50',
                      'focus:ring-1 focus:ring-gray-400 focus:ring-offset-1'
                    )}
                  >
                    <CalendarPlus className="mr-2 h-3.5 w-3.5 sm:h-4 sm:w-4 flex-shrink-0 text-gray-700" />
                    <span className="truncate">
                      {date ? format(date, 'PPP') : 'Set delivery date'}
                    </span>
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0 border-gray-200 shadow-lg" align="end">
                  <Calendar
                    mode="single"
                    selected={date}
                    onSelect={handleDateChange}
                    initialFocus
                    disabled={isSaving}
                    className="bg-white"
                    classNames={{
                      // Day cells
                      day: 'text-black hover:bg-gray-100',
                      day_selected: 'bg-gray-900 text-white hover:bg-gray-800',
                      day_today: 'bg-white border border-gray-400',
                      day_disabled: 'text-gray-300',
                      day_range_middle: 'bg-gray-100 text-black',
                      day_outside: 'text-gray-300',
                      
                      // Headers
                      head_cell: 'text-gray-700 font-medium',
                      caption: 'text-black',
                      caption_label: 'text-black font-medium',
                      
                      // Navigation
                      nav: 'text-black',
                      nav_button: 'hover:bg-gray-100 text-black',
                      nav_button_previous: 'text-black',
                      nav_button_next: 'text-black',
                      
                      // Interactive elements
                      button: 'hover:bg-gray-100 text-black focus:outline-none focus:ring-1 focus:ring-gray-400',
                      dropdown: 'border-gray-200',
                      
                      // Remove any yellow highlights
                      day_range_start: 'bg-gray-200',
                      day_range_end: 'bg-gray-200',
                      day_hidden: 'invisible',
                    }}
                  />
                </PopoverContent>
              </Popover>
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
                  <span className="text-gray-800 font-medium">Order Total:</span>
                  <span className="text-gray-700 font-medium">{formatCurrency(order.total)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Shipping & Details */}
          <div className="space-y-6">
            <div>
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-gray-700 flex-shrink-0" />
                  <h4 className="font-medium text-gray-800">Shipping Address</h4>
                </div>
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
                <Package className="h-4 w-4 text-gray-700" />
                <h4 className="font-medium text-gray-800">Order Details</h4>
              </div>
              <div className="space-y-2 text-sm">
                <div className="space-y-1">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Order Date:</span>
                    <span className="text-gray-800">{formatDate(order.orderDate)}</span>
                  </div>
                  {date && (
                    <div className="flex justify-between text-gray-700">
                      <span className="text-gray-500">Expected Delivery:</span>
                      <span>{format(date, 'PPP')}</span>
                    </div>
                  )}
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
              <button
                onClick={handleConfirmOrder}
                className="px-4 py-2 text-sm bg-black text-white rounded hover:bg-gray-800 transition-colors"
              >
                Confirm Order
              </button>
            )}

            {/* Mark as Shipped */}
            {order.status === 'processing' && (
              <button
                onClick={handleMarkAsShipped}
                className="px-4 py-2 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
              >
                Mark as Shipped
              </button>
            )}

            {/* Mark as Delivered */}
            {order.status === 'shipped' && (
              <button
                onClick={handleMarkAsDelivered}
                className="px-4 py-2 text-sm bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
              >
                Mark as Delivered
              </button>
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
