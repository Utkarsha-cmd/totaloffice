import React from 'react';
import TechnicianTicketView from './TechnicianTicketView';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Clock, CheckCircle, AlertTriangle, User } from 'lucide-react';

interface TechnicianDashboardProps {
  username: string;
  userType: string;
  onLogout: () => void;
}

const TechnicianDashboard: React.FC<TechnicianDashboardProps> = ({ username, userType, onLogout }) => {
  const stats = {
    pending: 2,
    inProgress: 1,
    completed: 3,
    totalAssigned: 8,
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Technician Dashboard</h1>
              <p className="text-gray-600">Welcome back, Sarah Johnson</p>
            </div>
            <div className="flex items-center gap-2">
              <User className="w-5 h-5 text-gray-500" />
              <span className="text-gray-700">Technician</span>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="max-w-7xl mx-auto px-6 py-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="bg-white text-gray-800 hover:bg-green-100 transition-colors duration-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Tickets</CardTitle>
              <Clock className="h-4 w-4 text-orange-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-700">{stats.pending}</div>
              <p className="text-xs text-gray-500">Awaiting your attention</p>
            </CardContent>
          </Card>

          <Card className="bg-white text-gray-800 hover:bg-green-100 transition-colors duration-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">In Progress</CardTitle>
              <AlertTriangle className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-700">{stats.inProgress}</div>
              <p className="text-xs text-gray-500">Currently working on</p>
            </CardContent>
          </Card>

          <Card className="bg-white text-gray-800 hover:bg-green-100 transition-colors duration-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Completed Today</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-700">{stats.completed}</div>
              <p className="text-xs text-gray-500">Tickets resolved today</p>
            </CardContent>
          </Card>

          <Card className="bg-white text-gray-800 hover:bg-green-100 transition-colors duration-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Assigned</CardTitle>
              <User className="h-4 w-4 text-purple-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-700">{stats.totalAssigned}</div>
              <p className="text-xs text-gray-500">All time assignments</p>
            </CardContent>
          </Card>
        </div>

        {/* Tickets Section */}
        <TechnicianTicketView />
      </div>
    </div>
  );
};

export default TechnicianDashboard;
