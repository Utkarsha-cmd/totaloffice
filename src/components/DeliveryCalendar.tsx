import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from "@/lib/utils";
import { DayPicker } from 'react-day-picker';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { format, isSameDay, parseISO, isAfter, isBefore } from 'date-fns';
import { CalendarIcon, Package, Clock, CheckCircle, Truck, AlertCircle, UserCheck, Shield, ChevronLeft, ChevronRight } from 'lucide-react';
import { orderService, type Order } from '@/services/orderService';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

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
  isUpcoming: boolean;
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
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date());
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const navigate = useNavigate();
  const { user } = useAuth();

  const fetchOrders = useCallback(async () => {
    if (!user) {
      setError('Please log in to view your orders');
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      
      // Use different service method based on user role
      const orders = user.role === 'admin' || user.role === 'staff'
        ? await orderService.getOrders()
        : await orderService.getCustomerOrders();
      
      // Transform orders to Delivery format
      const deliveryData: Delivery[] = orders.map(order => {
        const deliveryDate = order.estimatedDelivery || order.orderDate;
        const isUpcoming = deliveryDate && isAfter(parseISO(deliveryDate), new Date());
        
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
            street: order.shippingAddress?.street || 'N/A',
            city: order.shippingAddress?.city || 'N/A',
            state: order.shippingAddress?.state || 'N/A',
            zipCode: order.shippingAddress?.postalCode || 'N/A'
          },
          status: order.status,
          trackingNumber: order.trackingNumber,
          isUpcoming
        };
      });

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
  }, [toast, user]);

  // Initial fetch
  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  // Set up polling for real-time updates (every 30 seconds)
  useEffect(() => {
    const interval = setInterval(fetchOrders, 30000);
    return () => clearInterval(interval);
  }, [fetchOrders]);

  const parsedDeliveries = useMemo(() => {
    return deliveries
      .filter(delivery => delivery.deliveryDate) // Filter out deliveries without a date
      .map(delivery => ({
        ...delivery,
        deliveryDate: parseDeliveryDate(delivery.deliveryDate)
      }))
      .sort((a, b) => a.deliveryDate.getTime() - b.deliveryDate.getTime()); // Sort by date
  }, [deliveries]);

  const getDeliveriesForDate = (date: Date) => {
    return parsedDeliveries.filter(delivery => 
      isSameDay(delivery.deliveryDate, date)
    );
  };

  const shippedDeliveries = useMemo(() => 
    parsedDeliveries.filter(d => d.status === 'shipped'), 
    [parsedDeliveries]
  );

  const deliveredDeliveries = useMemo(() => 
    parsedDeliveries.filter(d => d.status === 'delivered'), 
    [parsedDeliveries]
  );

  const upcomingDeliveries = useMemo(() => 
    parsedDeliveries.filter(d => 
      d.status !== 'delivered' && 
      d.deliveryDate >= new Date()
    ).slice(0, 5), // Show next 5 upcoming deliveries
    [parsedDeliveries]
  );

  const selectedDeliveries = selectedDate ? getDeliveriesForDate(selectedDate) : [];
  
  const handleMonthChange = (date: Date) => {
    setCurrentMonth(date);
    // Optionally fetch more data when month changes
    fetchOrders();
  };

  const isAdmin = useMemo(() => {
    return user && (user.role === 'admin' || user.role === 'staff');
  }, [user]);

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center">
        <AlertCircle className="w-12 h-12 text-yellow-500 mb-4" />
        <h2 className="text-xl font-semibold mb-2">Authentication Required</h2>
        <p className="text-muted-foreground mb-6">
          Please log in to view your delivery calendar.
        </p>
        <div className="flex gap-4">
          <Button onClick={() => navigate('/login')}>
            Log In
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_400px]">
      {/* Calendar */}
      <Card className="w-full text-gray-600 bg-white border border-gray-200 [&_.rdp-day]:text-gray-700 [&_.rdp-day]:hover:bg-gray-50 [&_.rdp-button:hover:not([disabled])]:bg-gray-50 [&_.rdp-day_disabled]:text-gray-300 [&_.rdp-day_outside]:text-gray-300">
        <CardHeader className="pb-3">
          <div className="flex justify-between items-center">
            <CardTitle className="flex items-center gap-2">
              <CalendarIcon className="w-5 h-5" />
              {isAdmin ? 'Delivery Management' : 'My Deliveries'}
            </CardTitle>
            <div className="flex items-center gap-2 text-sm">
              {isAdmin ? (
                <span className="flex items-center gap-1 px-2 py-1 bg-gray-100 text-gray-700 rounded-md">
                  <Shield className="w-4 h-4" /> Admin View
                </span>
              ) : (
                <span className="flex items-center gap-1 px-2 py-1 bg-emerald-50 text-emerald-700 rounded-md">
                  <UserCheck className="w-4 h-4" /> Customer View
                </span>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="p-4 relative">
            <div className="absolute left-4 right-4 top-4 flex justify-center">
              <span className="text-sm font-medium">
                {currentMonth.toLocaleString('default', { month: 'long' })} {currentMonth.getFullYear()}
              </span>
            </div>
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={setSelectedDate}
              onMonthChange={handleMonthChange}
              month={currentMonth}
              className="w-full"
              modifiers={{
                shipped: shippedDeliveries.map(d => d.deliveryDate),
                delivered: deliveredDeliveries.map(d => d.deliveryDate),
                today: new Date()
              }}
              classNames={{
                months: 'w-full',
                month: 'w-full space-y-2',
                caption: 'relative flex items-center justify-between py-1 mb-2 h-6',
                caption_label: 'hidden',
                nav: 'flex items-center justify-between w-full',
                nav_button: 'h-6 w-6 p-0 rounded-full flex items-center justify-center hover:bg-gray-100',
                table: 'w-full',
                head_row: 'grid grid-cols-7 gap-0',
                head_cell: 'text-xs text-gray-400 font-normal h-6 flex items-center justify-center',
                row: 'grid grid-cols-7 gap-0 mt-1',
                cell: 'text-center p-0',
                day: 'h-8 w-8 rounded-full flex items-center justify-center mx-auto text-sm hover:bg-gray-100',
                day_selected: '!bg-emerald-600 !text-white',
                day_today: '!bg-emerald-100 !text-emerald-900',
                day_outside: 'text-gray-300',
                day_disabled: 'text-gray-200',
                day_range_middle: '!bg-transparent',
                day_hidden: 'invisible',
              }}
              formatters={{
                formatWeekdayName: (date) => ['S', 'M', 'T', 'W', 'T', 'F', 'S'][date.getDay()]
              }}
              modifiersStyles={{
                ...(shippedDeliveries.length > 0 && {
                  shipped: {
                    backgroundColor: 'white',
                    color: '#374151',
                    borderRadius: '9999px',
                    border: '1px solid #d1fae5',
                    fontWeight: 400
                  }
                }),
                ...(deliveredDeliveries.length > 0 && {
                  delivered: {
                    backgroundColor: 'white',
                    color: '#374151',
                    borderRadius: '9999px',
                    border: '1px solid #a7f3d0',
                    fontWeight: 400
                  }
                })
              }}
            />
          </div>
          <div className="mt-4 flex flex-wrap items-center gap-4 text-sm text-gray-500">
            <div className="flex items-center gap-2">
              <span className="inline-block w-3 h-3 rounded-full bg-emerald-200"></span>
              <span>Shipped</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="inline-block w-3 h-3 rounded-full bg-emerald-400"></span>
              <span>Delivered</span>
            </div>
          </div>
          
          {/* Upcoming Deliveries */}
          <div className="mt-6">
            <h3 className="text-sm font-medium text-gray-700 mb-2">Upcoming Deliveries</h3>
            {upcomingDeliveries.length > 0 ? (
              <div className="space-y-2">
                {upcomingDeliveries.map(delivery => (
                  <div 
                    key={delivery.id}
                    className="p-3 bg-white border rounded-lg shadow-sm hover:shadow transition-shadow cursor-pointer"
                    onClick={() => setSelectedDate(parseDeliveryDate(delivery.deliveryDate))}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-medium text-gray-900">
                          {delivery.orderNumber}
                        </p>
                        <p className="text-sm text-gray-500">
                          {delivery.items.length} items • {format(parseDeliveryDate(delivery.deliveryDate), 'MMM d, yyyy')}
                        </p>
                      </div>
                      <Badge 
                      variant={delivery.status === 'shipped' ? 'secondary' : 'outline'}
                      className={`ml-2 ${delivery.status === 'shipped' ? 'bg-emerald-100 text-emerald-800 border-emerald-200' : 'bg-white text-gray-700 border-gray-200'}`}
                    >
                      {delivery.status === 'shipped' ? (
                        <Truck className="h-3 w-3 mr-1" />
                      ) : (
                        <Clock className="h-3 w-3 mr-1" />
                      )}
                      {delivery.status}
                    </Badge>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500">No upcoming deliveries</p>
            )}
          </div>
          
          {/* Delivery Stats */}
          <div className="mt-6">
            <h3 className="text-sm font-medium text-gray-700 mb-2">Delivery Stats</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gray-50 p-3 rounded-lg border border-gray-100">
                <p className="text-sm text-gray-600">Shipped</p>
                <p className="text-xl font-bold text-gray-700">{shippedDeliveries.length}</p>
              </div>
              <div className="bg-emerald-50 p-3 rounded-lg border border-emerald-100">
                <p className="text-sm text-gray-600">Delivered</p>
                <p className="text-xl font-bold text-emerald-700">{deliveredDeliveries.length}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Selected Date Deliveries Panel */}
      <Card className="bg-white text-gray-700 border border-gray-200">
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
                    <div className="font-medium">Order #{delivery.orderNumber || delivery.id.substring(0, 8)}</div>
                    <Badge 
                      className={`${delivery.status === 'delivered' ? 'bg-emerald-100 text-emerald-800 border-emerald-200' : 'bg-gray-100 text-gray-800 border-gray-200'} border`}
                    >
                      <div className="flex items-center gap-1">
                        {getStatusIcon(delivery.status)}
                        {delivery.status.replace('-', ' ')}
                      </div>
                    </Badge>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">
                        {delivery.items.length} items • {delivery.paymentMethod}
                      </span>
                      <Badge className={delivery.status === 'delivered' ? 'bg-emerald-100 text-emerald-800 border-emerald-200' : 'bg-gray-100 text-gray-800 border-gray-200'}>
                        {delivery.status}
                      </Badge>
                    </div>
                    
                    {delivery.trackingNumber && (
                      <div className="text-sm text-emerald-600">
                        Tracking: {delivery.trackingNumber}
                      </div>
                    )}

                    <div className="space-y-1 pt-2">
                      <div className="text-sm font-medium text-gray-700">Items:</div>
                      {delivery.items.map((item) => (
                        <div key={item.id} className="text-sm text-gray-600 flex justify-between">
                          <span>{item.product} x{item.quantity}</span>
                          <span>${item.price.toFixed(2)}</span>
                        </div>
                      ))}
                    </div>

                    <div className="text-sm pt-2 border-t">
                      <div className="font-medium text-gray-700">Delivery Address:</div>
                      <div className="text-gray-600">
                        {delivery.address.street}<br />
                        {delivery.address.city}, {delivery.address.state} {delivery.address.zipCode}
                      </div>
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
