import React, { useState } from 'react';
import {Package, MapPin, CreditCard, Truck, CheckCircle, Clock, XCircle, AlertCircle, CalendarCheck, CalendarPlus, Download, Mail} from 'lucide-react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { Calendar } from '@/components/ui/calendar';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

// Order interface (keeping your original structure)
export interface Order {
  _id: string;
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  orderDate: string;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  total: number;
  subtotal: number;
  tax: number;
  items: Array<{
    id: string;
    name: string;
    price: number;
    quantity: number;
    category: string;
    description?: string;
  }>;
  shippingAddress: {
    firstName: string;
    lastName: string;
    company?: string;
    street: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
    phone?: string;
  };
  paymentMethod: string;
  trackingNumber?: string;
  estimatedDelivery?: string;
  expectedDelivery?: string;
  notes?: string;
}

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
    setIsSaving(true);
    // Your API call here
    setTimeout(() => setIsSaving(false), 1000);
  };

  const getStatusColor = (status: Order['status']) => {
    switch (status) {
      case 'pending':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'processing':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'shipped':
        return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'delivered':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'cancelled':
        return 'bg-red-50 text-red-700 border-red-200';
      default:
        return 'bg-gray-50 text-gray-700 border-gray-200';
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

  const handleStatusUpdate = async (newStatus: Order['status']) => {
    if (!onStatusUpdate) return;
    onStatusUpdate(order._id, newStatus);
  };

  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition-shadow duration-200 overflow-hidden">
      {/* Professional Header */}
      <div className="bg-gradient-to-r from-emerald-50 to-green-50 px-6 py-5 border-b border-gray-100">
        <div className="flex justify-between items-start">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <h3 className="text-xl font-bold text-gray-900">{order.orderNumber}</h3>
              <span className={cn(
                'inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium border',
                getStatusColor(order.status)
              )}>
                {getStatusIcon(order.status)}
                {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
              </span>
            </div>
            <p className="text-gray-600 font-medium">
              {order.customerName} • {order.customerEmail}
            </p>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold text-emerald-600">{formatCurrency(order.total)}</p>
            <p className="text-sm text-gray-500">Total</p>
          </div>
        </div>
      </div>

      <div className="p-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column - Order Items */}
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Package className="h-5 w-5 text-emerald-600" />
                <h4 className="text-lg font-semibold text-gray-900">Order Items</h4>
              </div>
              
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-2 bg-emerald-600 hover:bg-emerald-700 text-white"
                    disabled={isSaving}
                  >
                    <CalendarPlus className="h-4 w-4 " />
                    {date ? format(date, 'MMM dd') : 'Set delivery'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="end">
                  <Calendar
                    mode="single"
                    selected={date}
                    onSelect={handleDateChange}
                    initialFocus
                    disabled={isSaving}
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-3">
              {order.items.map((item) => (
                <div key={item.id} className="flex justify-between items-center p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                  <div className="flex-1">
                    <p className="font-medium text-gray-900 mb-1">{item.name}</p>
                    <div className="flex items-center gap-3 text-sm text-gray-600">
                      <span className="bg-emerald-100 text-emerald-700 px-2 py-1 rounded text-xs font-medium">
                        {item.category}
                      </span>
                      <span>Qty: {item.quantity}</span>
                    </div>
                    {item.description && (
                      <p className="text-sm text-gray-500 mt-1">{item.description}</p>
                    )}
                  </div>
                  <div className="text-right ml-4">
                    <p className="font-semibold text-gray-900">{formatCurrency(item.price)}</p>
                    <p className="text-sm text-gray-500">each</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Order Summary */}
            <div className="bg-emerald-50 p-4 rounded-lg border border-emerald-100">
              <h5 className="font-semibold text-gray-900 mb-3">Order Summary</h5>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Subtotal:</span>
                  <span className="text-gray-900">{formatCurrency(order.subtotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Tax:</span>
                  <span className="text-gray-900">{formatCurrency(order.tax)}</span>
                </div>
                <div className="border-t border-emerald-200 pt-2 mt-2">
                  <div className="flex justify-between text-base font-semibold">
                    <span className="text-gray-900">Total:</span>
                    <span className="text-emerald-600">{formatCurrency(order.total)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Details */}
          <div className="space-y-6">
            {/* Shipping Address */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <MapPin className="h-5 w-5 text-emerald-600" />
                <h4 className="text-lg font-semibold text-gray-900">Shipping Address</h4>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg">
                <div className="space-y-1 text-sm">
                  <p className="font-medium text-gray-900">
                    {order.shippingAddress.firstName} {order.shippingAddress.lastName}
                  </p>
                  {order.shippingAddress.company && (
                    <p className="text-gray-600">{order.shippingAddress.company}</p>
                  )}
                  <p className="text-gray-600">{order.shippingAddress.street}</p>
                  <p className="text-gray-600">
                    {order.shippingAddress.city}, {order.shippingAddress.state}
                  </p>
                  <p className="text-gray-600">
                    {order.shippingAddress.postalCode}, {order.shippingAddress.country}
                  </p>
                  {order.shippingAddress.phone && (
                    <p className="text-gray-600 mt-2">{order.shippingAddress.phone}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Payment Method */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <CreditCard className="h-5 w-5 text-emerald-600" />
                <h4 className="text-lg font-semibold text-gray-900">Payment</h4>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-sm font-medium text-gray-900">{order.paymentMethod}</p>
              </div>
            </div>

            {/* Order Details */}
            <div>
              <h4 className="text-lg font-semibold text-gray-900 mb-3">Order Details</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Order Date:</span>
                  <span className="text-gray-900">{formatDate(order.orderDate)}</span>
                </div>
                {date && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Expected Delivery:</span>
                    <span className="text-gray-900 font-medium">{format(date, 'PPP')}</span>
                  </div>
                )}
                {order.trackingNumber && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Tracking:</span>
                    <span className="text-emerald-600 font-medium">{order.trackingNumber}</span>
                  </div>
                )}
              </div>
            </div>

            {order.notes && (
              <div>
                <h4 className="text-lg font-semibold text-gray-900 mb-3">Notes</h4>
                <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
                  <p className="text-sm text-amber-800">{order.notes}</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        {onStatusUpdate && (
          <div className="mt-8 pt-6 border-t border-gray-200">
            <div className="flex flex-col lg:flex-row gap-4 lg:items-center lg:justify-between">
              {/* Status Actions */}
              <div className="flex flex-wrap gap-3">
                {order.status === 'pending' && (
                  <Button
                    onClick={() => handleStatusUpdate('processing')}
                    className="bg-blue-600 hover:bg-blue-700 text-white gap-2"
                  >
                    <AlertCircle className="h-4 w-4" />
                    Confirm Order
                  </Button>
                )}

                {order.status === 'processing' && (
                  <Button
                    onClick={() => handleStatusUpdate('shipped')}
                    className="bg-purple-600 hover:bg-purple-700 text-white gap-2"
                  >
                    <Truck className="h-4 w-4" />
                    Mark as Shipped
                  </Button>
                )}

                {order.status === 'shipped' && (
                  <Button
                    onClick={() => handleStatusUpdate('delivered')}
                    className="bg-purple-600 hover:bg-purple-700text-white gap-2"
                  >
                    <CheckCircle className="bg-purple-600 hover:bg-purple-700 h-4 w-4" />
                    Mark as Delivered
                  </Button>
                )}
              </div>

              {/* Invoice Actions */}
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={() => console.log('Download invoice')}
                  className="gap-2 bg-emerald-600 hover:bg-emerald-700 text-white"
                >
                  <Download className="h-4 w-4" />
                  Download Invoice
                </Button>
                <Button
                  variant="outline"
                  onClick={() => console.log('Email invoice')}
                  className="gap-2 bg-emerald-600 hover:bg-emerald-700 text-white"
                >
                  <Mail className="h-4 w-4" />
                  Email Invoice
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default OrderCard;