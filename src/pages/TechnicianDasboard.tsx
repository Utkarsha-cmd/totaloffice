import React, { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { getTechnicianTickets } from '@/services/ticketService';
import TechnicianTicketView from '../components/TechnicianTicketView';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import TicketsPage from '../components/TicketsPage';
import {
  CheckCircle,
  AlertTriangle,
  User,
  Loader2,
  Wrench,
  LayoutDashboard,
  ClipboardList,
  Clock,
  TrendingUp,
  Calendar,
  MapPin,
  LogOut
} from 'lucide-react';
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
  avgResolutionTime: string;
  completionRate: number;
}

interface RecentActivity {
  id: string;
  type: 'completed' | 'started' | 'updated';
  title: string;
  time: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
}

const TechnicianDashboard: React.FC<TechnicianDashboardProps> = ({
  username,
  userType,
  onLogout,
}) => {
 const { user } = useAuth();
 const [activeTab, setActiveTab] = useState('dashboard');

  const [stats, setStats] = useState<DashboardStats>({
    inProgress: 0,
    workingOn: 0,
    completed: 0,
    totalAssigned: 0,
    lastUpdated: Date.now(),
    avgResolutionTime: '2.5 hrs',
    completionRate: 92
  });
  const [isLoading, setIsLoading] = useState(true);
  const [recentActivity] = useState<RecentActivity[]>([
    { id: '1', type: 'completed', title: 'Server maintenance - Building A', time: '10 minutes ago', priority: 'high' },
    { id: '2', type: 'started', title: 'Network troubleshooting - Floor 3', time: '25 minutes ago', priority: 'medium' },
    { id: '3', type: 'updated', title: 'HVAC system check - Conference room', time: '1 hour ago', priority: 'low' }
  ]);

  const fetchTickets = async () => {
    if (!user?.id) return;
    try {
      setIsLoading(true);
      const tickets = await getTechnicianTickets(user.id);

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
        lastUpdated: Date.now(),
        avgResolutionTime: '2.5 hrs',
        completionRate: 92
      });
    } catch (error) {
      console.error('Error fetching tickets:', error);
      toast.error('Failed to load ticket data');
    } finally {
      setIsLoading(false);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'border-l-emerald-700 bg-emerald-50';
      case 'high': return 'border-l-emerald-600 bg-emerald-50';
      case 'medium': return 'border-l-emerald-500 bg-emerald-50';
      default: return 'border-l-emerald-400 bg-emerald-50';
    }
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'completed': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'started': return <Wrench className="h-4 w-4 text-blue-500" />;
      case 'updated': return <Clock className="h-4 w-4 text-yellow-500" />;
      default: return <Clock className="h-4 w-4 text-gray-400" />;
    }
  };
   useEffect(() => {
    fetchTickets();
    const intervalId = setInterval(fetchTickets, 30000);
    return () => clearInterval(intervalId);
  }, [user?.id]);

  useEffect(() => {
    const handleTicketUpdate = () => fetchTickets();
    window.addEventListener('ticketUpdated', handleTicketUpdate);
    return () => window.removeEventListener('ticketUpdated', handleTicketUpdate);
  }, []);

  return (
    <div className="flex min-h-screen  bg-white">
      {/* Sidebar */}
      <aside className="bg-[#0d3324] text-white px-6 py-8 space-y-8 min-h-screen shadow-md border-r border-green-800 flex flex-col">
        <div>
          <h1 className="text-2xl font-bold tracking-wide">Tech Portal</h1>
          <p className="text-sm text-green-200 mt-1">{username}</p>
        </div>

        <nav className="flex flex-col gap-1 flex-1 overflow-y-auto mt-8">
          {[
            { tab: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard className="w-4 h-4 mr-2 mt-0.5" /> },
            { tab: 'tickets', label: 'All Tickets', icon: <ClipboardList className="w-4 h-4 mr-2 mt-0.5" /> },
            { tab: 'in-progress', label: 'In Progress', icon: <AlertTriangle className="w-4 h-4 mr-2 mt-0.5" /> },
            { tab: 'completed', label: 'Completed', icon: <CheckCircle className="w-4 h-4 mr-2 mt-0.5" /> },
          ].map(item => (
            <button
              key={item.tab}
              onClick={() => setActiveTab(item.tab)}
              className={`flex items-start px-4 py-3 rounded-md text-sm font-medium transition duration-200 ${
                activeTab === item.tab
                  ? 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                  : 'hover:bg-emerald-800 hover:text-white text-gray-300'
              }`}
            >
              {item.icon}
              <div>{item.label}</div>
            </button>
          ))}
        </nav>

        <div className="sticky bottom-0 bg-[#0d3324] border-t border-green-800 p-4">
          <button
            onClick={onLogout}
            className="flex items-center gap-2 text-sm font-medium hover:text-red-400 transition"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content */}
     <main className="flex-1 bg-white p-6 shadow-sm text-gray-800">
  <div className="h-full overflow-auto p-6">
    {(activeTab === 'tickets' || activeTab === 'in-progress' || activeTab === 'completed') ? (
  <TicketsPage
    filterTab={
      activeTab === 'tickets'
        ? 'tickets'
        : activeTab === 'in-progress'
        ? 'in-progress'
        : activeTab === 'completed'
        ? 'completed'
        : 'all'
    }
    userId={user?.id}
    onTicketUpdate={fetchTickets}
  />
): (
      <div className="space-y-6 fade-in">
        {/* Welcome */}
        <div className="bg-white shadow-sm rounded-lg p-6 border border-emerald-300">
  <div className="flex items-center justify-between">
    <div>
      <h2 className="text-2xl font-bold text-gray-800">Welcome back, {username}</h2>
      <p className="text-gray-500 mt-1">Here's your dashboard overview for today</p>
    </div>
    <div className="flex items-center gap-4 text-sm text-gray-500">
      <div className="flex items-center gap-2">
        <Calendar className="h-4 w-4" /> {new Date().toLocaleDateString()}
      </div>
    </div>
  </div>
</div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { title: 'In Progress', value: stats.inProgress, icon: <AlertTriangle className="h-5 w-5 text-blue-500" />, subtitle: 'Active tickets' },
            { title: 'Working On', value: stats.workingOn, icon: <Wrench className="h-5 w-5 text-yellow-500" />, subtitle: 'Currently assigned' },
            { title: 'Completed Today', value: stats.completed, icon: <CheckCircle className="h-5 w-5 text-green-500" />, subtitle: 'Tasks resolved' },
            { title: 'Total Assigned', value: stats.totalAssigned, icon: <User className="h-5 w-5 text-primary" />, subtitle: 'All time' }
          ].map((item, i) => (
            <Card key={i} className="bg-white shadow-sm rounded-lg border border-emerald-300">
  <CardHeader className="flex flex-row items-center justify-between pb-2">
    <CardTitle className="text-sm font-medium text-gray-800">{item.title}</CardTitle>
    {item.icon}
  </CardHeader>
  <CardContent>
    <div className="text-3xl font-bold text-gray-800">
      {isLoading ? <Loader2 className="h-8 w-8 animate-spin text-gray-400" /> : item.value}
    </div>
    <p className="text-xs text-gray-600 mt-1">{item.subtitle}</p>
  </CardContent>
</Card>

          ))}
        </div>

        {/* Performance */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="bg-white shadow-sm rounded-lg border border-emerald-300">
  <CardHeader>
    <CardTitle className="flex items-center gap-2 text-gray-800">
      <TrendingUp className="h-5 w-5 text-emerald-600" />
      Performance Metrics
    </CardTitle>
  </CardHeader>
  <CardContent className="space-y-4">
    <div className="flex justify-between text-sm text-gray-800">
      <span>Average Resolution Time</span>
      <span className="font-semibold">{stats.avgResolutionTime}</span>
    </div>
    <div className="flex justify-between text-sm text-gray-800">
      <span>Completion Rate</span>
      <span className="font-semibold text-gray-800">{stats.completionRate}%</span>
    </div>
    <div className="w-full bg-gray-200 rounded-full h-2">
      <div
        className="bg-emerald-500 h-2 rounded-full"
        style={{ width: `${stats.completionRate}%` }}
      />
    </div>
  </CardContent>
</Card>


          <Card className="bg-white shadow-sm rounded-lg border border-emerald-500">
  <CardHeader>
    <CardTitle className="text-gray-900">Recent Activity</CardTitle>
  </CardHeader>
  <CardContent>
    <div className="space-y-3">
      {recentActivity.map(activity => (
        <div
          key={activity.id}
          className="flex items-start gap-3 p-3 rounded-lg border-l-4 border-emerald-600 bg-gray-50 hover:bg-gray-100 transition-colors"
        >
          <div className="text-emerald-700">{getActivityIcon(activity.type)}</div>
          <div className="flex-1">
            <p className="text-sm font-semibold text-gray-900 truncate">{activity.title}</p>
            <p className="text-xs text-gray-700">{activity.time}</p>
          </div>
        </div>
      ))}
    </div>
  </CardContent>
</Card>
        </div>

        {/* Quick Actions */}
       <Card className="bg-white shadow-sm rounded-lg border border-emerald-300">
  <CardHeader>
    <CardTitle className="text-gray-800">Quick Actions</CardTitle>
  </CardHeader>
  <CardContent>
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <Button
        variant="outline"
        className="h-auto p-4 flex flex-col gap-2 text-gray-800 bg-white border border-emerald-300 hover:bg-emerald-50"
        onClick={() => setActiveTab('tickets')}
      >
        <ClipboardList className="h-6 w-6 text-emerald-600" />
        <span>View All Tickets</span>
      </Button>
    </div>
  </CardContent>
</Card>
      </div>
    )}
  </div>
</main>
    </div>
  );
};

export default TechnicianDashboard;
