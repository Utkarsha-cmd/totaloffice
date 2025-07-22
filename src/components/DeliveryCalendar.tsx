import React, { useState } from 'react';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { format, isSameDay, parseISO } from 'date-fns';
import { CalendarIcon, Package, Clock, CheckCircle } from 'lucide-react';

export interface Delivery {
  id: string;
  deliveryDate: string;
  items: {
    id: string;
    product: string;
    quantity: number;
    price: number;
  }[];
  paymentMethod: string;
  paymentStatus: string;
  address: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
  };
  status: 'pending' | 'processing' | 'shipped' | 'out-for-delivery' | 'delivered' | 'cancelled';
  trackingNumber: string;
}

interface DeliveryCalendarProps {
  deliveries: Delivery[];
}

const getStatusColor = () => 'bg-gray-100 text-gray-800';

const getStatusIcon = (status: Delivery['status']) => {
  switch (status) {
    case 'delivered':
      return <CheckCircle className="w-4 h-4" />;
    case 'out-for-delivery':
    case 'shipped':
    case 'processing':
    case 'pending':
    default:
      return <Clock className="w-4 h-4" />;
  }
};

export const DeliveryCalendar: React.FC<DeliveryCalendarProps> = ({ deliveries }) => {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());

  const getDeliveriesForDate = (date: Date) =>
    deliveries.filter(delivery => isSameDay(parseISO(delivery.deliveryDate), date));

  const deliveryDates = deliveries.map(delivery => parseISO(delivery.deliveryDate));
  const selectedDeliveries = selectedDate ? getDeliveriesForDate(selectedDate) : [];

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_400px]">
      {/* Calendar */}
      <Card className="w-full text-gray-700 bg-white [&_.rdp-day]:text-gray-700 [&_.rdp-day_disabled]:text-gray-400 [&_.rdp-day_outside]:text-gray-400">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-gray-700">
            <CalendarIcon className="w-5 h-5 text-gray-600" />
            Delivery Calendar
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={setSelectedDate}
            className="w-full text-gray-700 bg-white"
            modifiers={{ hasDelivery: deliveryDates }}
            modifiersStyles={{
              hasDelivery: {
                backgroundColor: 'white',
                color: '#374151', // gray-700
                borderRadius: '9999px',
                border: '2px solid #374151',
              },
              selected: {
                backgroundColor: '#d1fae5', // light green
                color: '#065f46', // dark green
                borderRadius: '9999px',
                border: 'none',
              },
            }}
          />
          <div className="mt-4 flex items-center gap-4 text-sm text-gray-500">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-gray-700"></div>
              <span>Has deliveries</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Selected Date Deliveries */}
      <Card className="bg-white text-gray-800 border border-gray-200">
        <CardHeader>
          <CardTitle>
            {selectedDate ? format(selectedDate, 'MMMM d, yyyy') : 'Select a date'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {selectedDeliveries.length > 0 ? (
            <div className="space-y-4">
              {selectedDeliveries.map((delivery) => (
                <div key={delivery.id} className="border border-gray-200 rounded-lg p-4 space-y-3 bg-white">
                  <div className="flex items-center justify-between">
                    <div className="font-medium">Order #{delivery.id}</div>
                    <Badge className={getStatusColor()}>
                      <div className="flex items-center gap-1">
                        {getStatusIcon(delivery.status)}
                        {delivery.status.replace('-', ' ')}
                      </div>
                    </Badge>
                  </div>

                  <div className="space-y-2">
                    <div className="text-sm text-gray-600">
                      Tracking: {delivery.trackingNumber}
                    </div>

                    <div className="space-y-1">
                      <div className="text-sm font-medium text-gray-700">Items:</div>
                      {delivery.items.map((item) => (
                        <div key={item.id} className="text-sm text-gray-600 flex justify-between">
                          <span>{item.product} x{item.quantity}</span>
                          <span>${item.price.toFixed(2)}</span>
                        </div>
                      ))}
                    </div>

                    <div className="text-sm">
                      <div className="font-medium text-gray-700">Delivery Address:</div>
                      <div className="text-gray-600">
                        {delivery.address.street}<br />
                        {delivery.address.city}, {delivery.address.state} {delivery.address.zipCode}
                      </div>
                    </div>

                    <div className="flex justify-between items-center text-sm">
                      <span className="text-gray-600">Payment: {delivery.paymentMethod}</span>
                      <Badge className="bg-gray-100 text-gray-800">
                        {delivery.paymentStatus}
                      </Badge>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <Package className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No deliveries scheduled for this date</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
