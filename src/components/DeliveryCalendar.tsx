import React, { useState, useMemo, useEffect } from 'react';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { format, isSameDay, parseISO, isDate } from 'date-fns';
import { CalendarIcon, Package, Clock, CheckCircle } from 'lucide-react';
import { orderService, type Order } from '@/services/orderService';
import { useToast } from '@/hooks/use-toast';

export interface Delivery {
  id: string;
  orderNumber?: string;
  deliveryDate: string | Date;
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
  trackingNumber?: string;
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

const parseDeliveryDate = (date: string | Date): Date => {
  if (date instanceof Date) return date;
  return parseISO(date);
};

export const DeliveryCalendar: React.FC<DeliveryCalendarProps> = ({ deliveries: initialDeliveries = [] }) => {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [deliveries, setDeliveries] = useState<Delivery[]>(initialDeliveries);
  const [isLoading, setIsLoading] = useState(!initialDeliveries.length);
  const { toast } = useToast();

  useEffect(() => {
    const fetchOrders = async () => {
      if (initialDeliveries.length > 0) return; // Skip if we have initial data
      
      try {
        setIsLoading(true);
        console.log('Fetching orders...');
        const orders = await orderService.getOrders();
        console.log('Fetched orders:', orders);
        
        // Filter for shipped and delivered orders
        const filteredOrders = orders.filter(
          order => order.status === 'shipped' || order.status === 'delivered'
        );
        console.log('Filtered orders (shipped/delivered):', filteredOrders);

        // Transform orders to Delivery format
        const deliveryData: Delivery[] = filteredOrders.map(order => {
          const deliveryDate = (order as any).expectedDelivery || order.orderDate;
          console.log(`Order ${order._id} (${order.status}):`, {
            orderDate: order.orderDate,
            expectedDelivery: (order as any).expectedDelivery,
            usingDate: deliveryDate
          });
          
          return {
            id: order._id,
            orderNumber: order.orderNumber,
            deliveryDate: deliveryDate,
            items: order.items.map(item => ({
              id: item.id,
              product: item.name,
              quantity: item.quantity,
              price: item.price
            })),
            paymentMethod: order.paymentMethod,
            paymentStatus: 'completed',
            address: {
              street: order.shippingAddress.street,
              city: order.shippingAddress.city,
              state: order.shippingAddress.state,
              zipCode: order.shippingAddress.postalCode
            },
            status: order.status,
            trackingNumber: order.trackingNumber
          };
        });

        console.log('Processed delivery data:', deliveryData);
        setDeliveries(deliveryData);
      } catch (error) {
        console.error('Failed to fetch orders:', error);
        toast({
          title: 'Error',
          description: 'Failed to load delivery data',
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrders();
  }, [initialDeliveries.length, toast]);

  const parsedDeliveries = useMemo(() => {
    return deliveries.map(delivery => ({
      ...delivery,
      deliveryDate: parseDeliveryDate(delivery.deliveryDate)
    }));
  }, [deliveries]);

  const getDeliveriesForDate = (date: Date) => {
    const deliveries = parsedDeliveries.filter(delivery => {
      const isMatch = isSameDay(delivery.deliveryDate, date);
      console.log(`Checking delivery ${delivery.id} (${delivery.status}) on ${delivery.deliveryDate} against ${date}:`, isMatch);
      return isMatch;
    });
    console.log(`Found ${deliveries.length} deliveries for ${date}`);
    return deliveries;
  };

  const shippedDeliveries = useMemo(() => {
    const shipped = parsedDeliveries.filter(d => d.status === 'shipped');
    console.log('Shipped deliveries:', shipped);
    return shipped;
  }, [parsedDeliveries]);

  const deliveredDeliveries = useMemo(() => {
    const delivered = parsedDeliveries.filter(d => d.status === 'delivered');
    console.log('Delivered deliveries:', delivered);
    return delivered;
  }, [parsedDeliveries]);

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
            modifiers={{
              shipped: shippedDeliveries.map(d => d.deliveryDate),
              delivered: deliveredDeliveries.map(d => d.deliveryDate)
            }}
            modifiersStyles={{
              shipped: {
                backgroundColor: 'white',
                color: '#374151',
                borderRadius: '9999px',
                border: '2px solid #3b82f6', // blue border for shipped
              },
              delivered: {
                backgroundColor: 'white',
                color: '#374151',
                borderRadius: '9999px',
                border: '2px solid #10b981', // green border for delivered
              },
              selected: {
                backgroundColor: '#d1fae5',
                color: '#065f46',
                borderRadius: '9999px',
                border: 'none',
              },
            }}
          />
          <div className="mt-4 flex items-center gap-4 text-sm text-gray-500">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full border-2 border-blue-500"></div>
              <span>Shipped</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full border-2 border-green-500"></div>
              <span>Delivered</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Selected Date Deliveries */}
      <Card className="bg-white text-gray-800 border border-gray-200">
        <CardHeader>
          <CardTitle>
            {selectedDate ? format(selectedDate, 'MMMM d, yyyy') : 'Select a date'}
            {selectedDeliveries.length > 0 && (
              <span className="ml-2 text-sm font-normal text-gray-500">
                ({selectedDeliveries.length} {selectedDeliveries.length === 1 ? 'delivery' : 'deliveries'})
              </span>
            )}
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
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">
                        Order #{delivery.orderNumber || delivery.id.substring(0, 8)}
                      </span>
                      <Badge className={delivery.status === 'delivered' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'}>
                        {delivery.status}
                      </Badge>
                    </div>
                    {delivery.trackingNumber && (
                      <div className="text-sm text-gray-600">
                        Tracking: {delivery.trackingNumber}
                      </div>
                    )}

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
