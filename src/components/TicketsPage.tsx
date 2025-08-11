import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Search,
  Clock,
  MapPin,
  User,
  AlertTriangle,
  CheckCircle,
  Play,
  Pause
} from 'lucide-react';
import { getTechnicianTickets } from '@/services/ticketService';
import { toast } from 'sonner';

interface Ticket {
  id: string;
  title: string;
  description: string;
  status: 'pending' | 'in_progress' | 'working_on' | 'completed' | 'urgent';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  location?: string;
  assignedBy?: string;
  createdAt: string;
  estimatedTime?: string;
}

interface TicketsPageProps {
  filterTab: 'all' | 'tickets' | 'in-progress' | 'completed';
  onTicketUpdate?: () => void;
  userId: string | undefined;
}

const TicketsPage: React.FC<TicketsPageProps> = ({ filterTab, onTicketUpdate, userId }) => {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!userId) return;

    const fetchTickets = async () => {
      try {
        setIsLoading(true);
        const data = await getTechnicianTickets(userId);

        const mappedTickets: Ticket[] = data.map(t => ({
  id: t.id,
  title: t.title,
  description: t.description,
  status: t.status as Ticket['status'],
  priority: t.priority as Ticket['priority'],
  location: t.location || 'Unknown location',
  assignedBy: typeof t.assigned === 'string' ? t.assigned : (t.assigned ? 'Assigned' : 'Unassigned'),
  createdAt: t.createdAt,
  estimatedTime: t.estimatedTime || 'N/A',
}));


        setTickets(mappedTickets);
      } catch (error) {
        console.error('Error fetching tickets:', error);
        toast.error('Failed to load tickets');
      } finally {
        setIsLoading(false);
      }
    };

    fetchTickets();
  }, [userId]);

   useEffect(() => {
    const mockTickets: Ticket[] = [
      {
        id: 'TK001',
        title: 'Network connectivity issue - Building A, Floor 3',
        description: 'Multiple users reporting intermittent connection drops in the east wing.',
        status: 'in_progress',
        priority: 'high',
        location: 'Building A, Floor 3',
        assignedBy: 'Sarah Johnson',
        createdAt: '2024-01-15T09:30:00Z',
        estimatedTime: '2-3 hours'
      },
      {
        id: 'TK002',
        title: 'HVAC system maintenance - Conference Room B',
        description: 'Scheduled maintenance for air conditioning unit and filter replacement.',
        status: 'working_on',
        priority: 'medium',
        location: 'Conference Room B',
        assignedBy: 'Mike Chen',
        createdAt: '2024-01-15T08:00:00Z',
        estimatedTime: '1-2 hours'
      },
      {
        id: 'TK003',
        title: 'Printer malfunction - Marketing Department',
        description: 'Printer not responding to print jobs, paper jam indicators active.',
        status: 'pending',
        priority: 'low',
        location: 'Marketing Department',
        assignedBy: 'Alex Rivera',
        createdAt: '2024-01-15T10:15:00Z',
        estimatedTime: '30-45 minutes'
      },
      {
        id: 'TK004',
        title: 'Security camera system check - Parking Lot C',
        description: 'Weekly security camera maintenance and recording system verification.',
        status: 'completed',
        priority: 'medium',
        location: 'Parking Lot C',
        assignedBy: 'David Kim',
        createdAt: '2024-01-14T14:00:00Z',
        estimatedTime: '1 hour'
      },
      {
        id: 'TK005',
        title: 'Emergency lighting inspection - Stairwell B',
        description: 'Monthly inspection of emergency lighting systems and battery backup.',
        status: 'urgent',
        priority: 'urgent',
        location: 'Stairwell B',
        assignedBy: 'Lisa Wong',
        createdAt: '2024-01-15T11:45:00Z',
        estimatedTime: '45 minutes'
      }
    ];

    setTimeout(() => {
      setTickets(mockTickets);
      setIsLoading(false);
    }, 1000);
  }, []);


const getStatusBadge = (status: string) => {
  switch (status) {
    case 'pending':
      return (
        <Badge className="bg-emerald-500 hover:bg-emerald-600 text-white">
          Pending
        </Badge>
      );
    case 'in_progress':
      return (
        <Badge className="bg-emerald-500 hover:bg-emerald-600 text-white">
          In Progress
        </Badge>
      );
    case 'working_on':
      return (
        <Badge className="bg-emerald-500 hover:bg-emerald-600 text-white">
          Working On
        </Badge>
      );
    case 'completed':
      return (
        <Badge className="bg-emerald-700 text-white">
          Completed
        </Badge>
      );
    case 'urgent':
      return (
        <Badge className="bg-red-600 hover:bg-red-700 text-white">
          Urgent
        </Badge>
      );
    default:
      return (
        <Badge className="bg-gray-400 text-white">
          {status}
        </Badge>
      );
  }
};


  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'border-l-red-500 bg-red-500/5';
      case 'high': return 'border-l-yellow-500 bg-yellow-500/5';
      case 'medium': return 'border-l-blue-500 bg-blue-500/5';
      default: return 'border-l-gray-400 bg-gray-400/5';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'in_progress':
      case 'working_on':
        return <Play className="h-5 w-5 text-blue-500" />;
      case 'urgent':
        return <AlertTriangle className="h-5 w-5 text-red-500" />;
      default:
        return <Pause className="h-5 w-5 text-yellow-500" />;
    }
  };

  const updateTicketStatus = (ticketId: string, newStatus: string) => {
    setTickets(prev =>
      prev.map(ticket =>
        ticket.id === ticketId ? { ...ticket, status: newStatus as Ticket['status'] } : ticket
      )
    );
    onTicketUpdate?.();
    window.dispatchEvent(new CustomEvent('ticketUpdated'));
  };

  const filteredTickets = tickets.filter(ticket => {
    const matchesSearch =
      ticket.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (ticket.location?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false);

    if (filterTab === 'in-progress') {
      return (
        matchesSearch &&
        (ticket.status.toLowerCase() === 'in_progress' || ticket.status.toLowerCase() === 'working_on')
      );
    }
    if (filterTab === 'completed') {
      return matchesSearch && ticket.status.toLowerCase() === 'completed';
    }
    if (filterTab === 'tickets') {
      return matchesSearch;
    }

    return matchesSearch;
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin h-8 w-8 border-b-2 border-emerald-600 rounded-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="rounded-lg p-6 border border-emerald-300 bg-white shadow-sm">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">My Tickets</h2>

        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400"  />
          <Input
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="pl-10 bg-white text-gray-700 border border-gray-300 hover:border-emerald-500 focus:border-emerald-500 focus:ring-emerald-500 focus:ring-1 focus:outline-none transition-colors"
          />
        </div>
      </div>

      <div className="grid gap-4">
        {filteredTickets.length > 0 ? (
          filteredTickets.map(ticket => (
            <Card
              key={ticket.id}
              className={`rounded-lg border-l-4 ${getPriorityColor(ticket.priority)} bg-white shadow-sm`}
            >
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    {getStatusIcon(ticket.status)}
                    <div>
                      <CardTitle className="text-lg text-gray-800">{ticket.title}</CardTitle>
                      <p className="text-sm text-gray-600 mt-1">{ticket.description}</p>
                    </div>
                  </div>
                  {getStatusBadge(ticket.status)}
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4 text-gray-600 text-sm">
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    {ticket.location}
                  </div>
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4" />
                    Assigned by {ticket.assignedBy}
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    Est. {ticket.estimatedTime}
                  </div>
                </div>

                <div className="flex items-center justify-between">
  <div className="flex gap-2">
    {ticket.status === 'pending' && (
      <Button
        size="sm"
        className="bg-emerald-600 hover:bg-emerald-700 text-white"
        onClick={() => updateTicketStatus(ticket.id, 'in_progress')}
      >
        Start Work
      </Button>
    )}
    {(ticket.status === 'in_progress' || ticket.status === 'working_on') && (
      <Button
        size="sm"
        className="bg-emerald-600 hover:bg-emerald-700 text-white"
        onClick={() => updateTicketStatus(ticket.id, 'completed')}
      >
        Mark Complete
      </Button>
    )}
    {ticket.status === 'completed' && (
      <Button
        size="sm"
        className="bg-emerald-600 hover:bg-emerald-700 text-white"
        disabled
      >
        Completed
      </Button>
    )}
  </div>
</div>
              </CardContent>
            </Card>
          ))
        ) : (
          <Card className="rounded-lg bg-white shadow-sm border border-emerald-300">
            <CardContent className="text-center py-12 text-gray-600">
              <Search className="h-12 w-12 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No tickets found</h3>
              <p>
                {searchTerm
                  ? 'Try adjusting your search criteria.'
                  : 'No tickets assigned to you at the moment.'}
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default TicketsPage;
