import React, { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CheckCircle, Clock, AlertCircle, FileText, Paperclip } from 'lucide-react';
import { toast } from 'sonner';

// Mock data for tickets assigned to current technician
const mockAssignedTickets = [
  {
    id: 'TCKT-001',
    title: 'Printer not working',
    description: 'The printer in the admin block is not turning on.',
    category: 'Hardware',
    attachments: ['printer_power_issue.png'],
    priority: 'High',
    status: 'In Progress',
    assignedDate: '2024-01-15',
    customerName: 'John Doe',
    location: 'Admin Block - Room 101',
    estimatedTime: '2 hours',
  },
  {
    id: 'TCKT-002',
    title: 'Paper jam in printer',
    description: 'Printer in HR department shows frequent paper jam errors.',
    category: 'Hardware',
    attachments: ['paper_jam.jpg'],
    priority: 'Medium',
    status: 'Pending',
    assignedDate: '2024-01-16',
    customerName: 'Sarah Wilson',
    location: 'HR Department - Room 205',
    estimatedTime: '1 hour',
  },
  {
    id: 'TCKT-003',
    title: 'Software installation',
    description: 'Install new accounting software on 5 computers.',
    category: 'Software',
    attachments: [],
    priority: 'Low',
    status: 'Completed',
    assignedDate: '2024-01-14',
    customerName: 'Finance Team',
    location: 'Finance Department',
    estimatedTime: '4 hours',
    completedDate: '2024-01-16',
    resolution: 'Successfully installed accounting software on all 5 computers. Provided basic training to users.',
  },
];

const TechnicianTicketView = () => {
  const [tickets, setTickets] = useState(mockAssignedTickets);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [resolution, setResolution] = useState('');
  const [newStatus, setNewStatus] = useState('');

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'High': return 'bg-red-100 text-red-800 border-red-300';
      case 'Medium': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'Low': return 'bg-green-100 text-green-800 border-green-300';
      default: return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Pending': return 'bg-orange-100 text-orange-800 border-orange-300';
      case 'In Progress': return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'Completed': return 'bg-green-100 text-green-800 border-green-300';
      default: return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Pending': return <Clock className="w-4 h-4" />;
      case 'In Progress': return <AlertCircle className="w-4 h-4" />;
      case 'Completed': return <CheckCircle className="w-4 h-4" />;
      default: return <FileText className="w-4 h-4" />;
    }
  };

  const handleUpdateTicket = () => {
    if (!selectedTicket) return;

    const updatedTickets = tickets.map((ticket) =>
      ticket.id === selectedTicket.id
        ? {
            ...ticket,
            status: newStatus || ticket.status,
            resolution: newStatus === 'Completed' ? resolution : ticket.resolution,
            completedDate: newStatus === 'Completed' ? new Date().toISOString().split('T')[0] : ticket.completedDate,
          }
        : ticket
    );

    setTickets(updatedTickets);
    setResolution('');
    setNewStatus('');
    
    toast.success('Ticket updated successfully!');
  };

  const handleStartWork = (ticketId) => {
    const updatedTickets = tickets.map((ticket) =>
      ticket.id === ticketId
        ? { ...ticket, status: 'In Progress' }
        : ticket
    );
    setTickets(updatedTickets);
    toast.success('Started working on ticket!');
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">My Assigned Tickets</h1>
        <p className="text-gray-600">Manage and update your assigned support tickets</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Tickets List */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Ticket Queue</h2>
          
          {tickets.map((ticket) => (
            <Card
              key={ticket.id}
              onClick={() => {
                setSelectedTicket(ticket);
                setNewStatus(ticket.status);
                setResolution(ticket.resolution || '');
              }}
              className={`cursor-pointer transition-all duration-200 hover:shadow-md ${
                selectedTicket?.id === ticket.id 
                  ? 'ring-2 ring-primary shadow-md' 
                  : 'hover:bg-gray-50'
              }`}
            >
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h3 className="font-semibold text-gray-900">{ticket.title}</h3>
                    <p className="text-sm text-gray-600 mt-1">{ticket.description}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    {getStatusIcon(ticket.status)}
                  </div>
                </div>
                
                <div className="flex items-center gap-2 mb-2">
                  <Badge variant="outline" className={getPriorityColor(ticket.priority)}>
                    {ticket.priority}
                  </Badge>
                  <Badge variant="outline" className={getStatusColor(ticket.status)}>
                    {ticket.status}
                  </Badge>
                </div>
                
                <div className="text-xs text-gray-500 space-y-1">
                  <p><span className="font-medium">Customer:</span> {ticket.customerName}</p>
                  <p><span className="font-medium">Location:</span> {ticket.location}</p>
                  <p><span className="font-medium">Assigned:</span> {ticket.assignedDate}</p>
                  <p><span className="font-medium">Est. Time:</span> {ticket.estimatedTime}</p>
                </div>

                {ticket.status === 'Pending' && (
                  <Button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleStartWork(ticket.id);
                    }}
                    size="sm"
                    className="mt-3 bg-blue-600 hover:bg-blue-700"
                  >
                    Start Work
                  </Button>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Ticket Details */}
        {selectedTicket && (
          <div className="lg:sticky lg:top-6 h-fit p-4 border border-green-300 rounded-lg bg-white">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 ">
                  <FileText className="w-5 h-5 " />
                  Ticket Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 p-4 border border-green-300 rounded-lg bg-white">
                <div className="p-4 border border-green-300 rounded-lg bg-white">
                  <h3 className="font-semibold text-gray-900 mb-2">{selectedTicket.title}</h3>
                  <p className="text-gray-700 mb-4">{selectedTicket.description}</p>
                  
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-medium text-gray-600">Ticket ID:</span>
                      <p className="text-gray-900">{selectedTicket.id}</p>
                    </div>
                    <div>
                      <span className="font-medium text-gray-600">Category:</span>
                      <p className="text-gray-900">{selectedTicket.category}</p>
                    </div>
                    <div>
                      <span className="font-medium text-gray-600">Customer:</span>
                      <p className="text-gray-900">{selectedTicket.customerName}</p>
                    </div>
                    <div>
                      <span className="font-medium text-gray-600">Location:</span>
                      <p className="text-gray-900">{selectedTicket.location}</p>
                    </div>
                    <div>
                      <span className="font-medium text-gray-600">Assigned Date:</span>
                      <p className="text-gray-900">{selectedTicket.assignedDate}</p>
                    </div>
                    <div>
                      <span className="font-medium text-gray-600">Est. Time:</span>
                      <p className="text-gray-900">{selectedTicket.estimatedTime}</p>
                    </div>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Badge variant="outline" className={getPriorityColor(selectedTicket.priority)}>
                    {selectedTicket.priority} Priority
                  </Badge>
                  <Badge variant="outline" className={getStatusColor(selectedTicket.status)}>
                    {selectedTicket.status}
                  </Badge>
                </div>

                {selectedTicket.attachments.length > 0 && (
                  <div>
                    <span className="font-medium text-gray-600 mb-2 block">Attachments:</span>
                    <div className="space-y-1">
                      {selectedTicket.attachments.map((file, idx) => (
                        <div key={idx} className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800 cursor-pointer">
                          <Paperclip className="w-4 h-4" />
                          {file}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {selectedTicket.status !== 'Completed' && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Update Status
                      </label>
                      <Select value={newStatus} onValueChange={setNewStatus}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Pending">Pending</SelectItem>
                          <SelectItem value="In Progress">In Progress</SelectItem>
                          <SelectItem value="Completed">Completed</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {newStatus === 'Completed' ? 'Resolution Details' : 'Work Notes'}
                      </label>
                      <Textarea
                        value={resolution}
                        onChange={(e) => setResolution(e.target.value)}
                        placeholder={
                          newStatus === 'Completed' 
                            ? "Describe how the issue was resolved..." 
                            : "Add notes about your progress..."
                        }
                        rows={4}
                      />
                    </div>

                    <Button 
                      onClick={handleUpdateTicket} 
                      className="w-full bg-green-600 hover:bg-green-700"
                      disabled={newStatus === 'Completed' && !resolution.trim()}
                    >
                      {newStatus === 'Completed' ? 'Mark as Completed' : 'Update Ticket'}
                    </Button>
                  </>
                )}

                {selectedTicket.status === 'Completed' && selectedTicket.resolution && (
                  <div className="bg-green-50 p-4 rounded-lg">
                    <h4 className="font-medium text-green-800 mb-2">Resolution</h4>
                    <p className="text-green-700 text-sm">{selectedTicket.resolution}</p>
                    {selectedTicket.completedDate && (
                      <p className="text-green-600 text-xs mt-2">
                        Completed on: {selectedTicket.completedDate}
                      </p>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export default TechnicianTicketView;