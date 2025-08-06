import React, { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { getTechnicianTickets, type TechnicianTicket } from '@/services/ticketService';
import TechnicianTicketView from './TechnicianTicketView';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, AlertTriangle, User, Loader2, Wrench } from 'lucide-react';
import { toast } from 'sonner';

interface TechnicianDashboardProps {
  username: string;
  userType: string;
  onLogout: () => void;
}

interface DashboardStats {
  inProgress: number;
  workingOn: number;
  completed: number;
  totalAssigned: number;
  lastUpdated: number;
}

const TechnicianDashboard: React.FC<TechnicianDashboardProps> = ({ username, userType, onLogout }) => {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats>({
    inProgress: 0,
    workingOn: 0,
    completed: 0,
    totalAssigned: 0,
    lastUpdated: Date.now()
  });
  const [isLoading, setIsLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);

  // Function to fetch and update ticket data
  const fetchTickets = async () => {
    if (!user?.id) return;
    
    try {
      setIsLoading(true);
      const tickets = await getTechnicianTickets(user.id);
      
      // Calculate stats
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      
      const completedToday = tickets.filter(ticket => {
        const ticketDate = new Date(ticket.updatedAt || ticket.createdAt);
        const status = ticket.status.toLowerCase();
        return (status === 'completed' || status === 'resolved') && ticketDate >= today;
      }).length;

      setStats({
        inProgress: tickets.filter(t => t.status.toLowerCase() === 'in_progress' || t.status.toLowerCase() === 'in progress').length,
        workingOn: tickets.filter(t => t.status.toLowerCase() === 'working_on' || t.status.toLowerCase() === 'working on').length,
        completed: completedToday,
        totalAssigned: tickets.length,
        lastUpdated: Date.now()
      });
    } catch (error) {
      console.error('Error fetching tickets:', error);
      toast.error('Failed to load ticket data');
    } finally {
      setIsLoading(false);
    }
  };

  // Initial data fetch
  useEffect(() => {
    fetchTickets();
    
    // Set up refresh interval (every 30 seconds)
    const intervalId = setInterval(fetchTickets, 30000);
    
    // Clean up interval on component unmount
    return () => clearInterval(intervalId);
  }, [user?.id]);
  
  // Listen for custom events to trigger refresh
  useEffect(() => {
    const handleTicketUpdate = () => {
      fetchTickets();
    };
    
    // Listen for custom events from other components
    window.addEventListener('ticketUpdated', handleTicketUpdate);
    
    return () => {
      window.removeEventListener('ticketUpdated', handleTicketUpdate);
    };
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Technician Dashboard</h1>
              <p className="text-gray-600">Welcome back, {username}</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <User className="w-5 h-5 text-gray-500" />
                <span className="text-gray-700">Technician</span>
              </div>
              <button 
                onClick={onLogout}
                className="px-3 py-1.5 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-colors"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="max-w-7xl mx-auto px-6 py-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">

          <Card className="bg-white text-gray-800 hover:bg-green-100 transition-colors duration-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">In Progress</CardTitle>
              <AlertTriangle className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-700">
                {isLoading ? <Loader2 className="h-6 w-6 animate-spin text-gray-400" /> : stats.inProgress}
              </div>
              <p className="text-xs text-gray-500">Currently in progress</p>
            </CardContent>
          </Card>

          <Card className="bg-white text-gray-800 hover:bg-green-100 transition-colors duration-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Working On</CardTitle>
              <Wrench className="h-4 w-4 text-amber-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-700">
                {isLoading ? <Loader2 className="h-6 w-6 animate-spin text-gray-400" /> : stats.workingOn}
              </div>
              <p className="text-xs text-gray-500">Actively working on</p>
            </CardContent>
          </Card>

          <Card className="bg-white text-gray-800 hover:bg-green-100 transition-colors duration-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Resolved Today</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-700">
                {isLoading ? <Loader2 className="h-6 w-6 animate-spin text-gray-400" /> : stats.completed}
              </div>
              <p className="text-xs text-gray-500">Tickets resolved or completed today</p>
            </CardContent>
          </Card>

          <Card className="bg-white text-gray-800 hover:bg-green-100 transition-colors duration-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Assigned</CardTitle>
              <User className="h-4 w-4 text-purple-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-700">
                {isLoading ? <Loader2 className="h-6 w-6 animate-spin text-gray-400" /> : stats.totalAssigned}
              </div>
              <p className="text-xs text-gray-500">All time assignments</p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Tickets View */}
      <div className="max-w-7xl mx-auto px-6 py-6">
        <TechnicianTicketView onTicketUpdate={() => fetchTickets()} />
      </div>
    </div>
  );
};

export default TechnicianDashboard;
