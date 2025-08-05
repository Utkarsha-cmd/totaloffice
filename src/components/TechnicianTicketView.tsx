import React, { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  CheckCircle,
  Clock,
  AlertCircle,
  FileText,
  Paperclip,
} from 'lucide-react';
import { toast } from 'sonner';

// Mock ticket data
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
    resolution:
      'Successfully installed accounting software on all 5 computers. Provided basic training to users.',
  },
];

const TechnicianTicketView = () => {
  const [tickets, setTickets] = useState(mockAssignedTickets);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [resolution, setResolution] = useState('');
  const [newStatus, setNewStatus] = useState('');

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'High':
        return 'bg-red-100 text-red-800 border-red-300';
      case 'Medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'Low':
        return 'bg-green-100 text-green-800 border-green-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Pending':
        return 'bg-orange-100 text-orange-800 border-orange-300';
      case 'In Progress':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'Completed':
        return 'bg-green-100 text-green-800 border-green-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Pending':
        return <Clock  className="text-green-700" />;
      case 'In Progress':
        return <AlertCircle  className="text-green-700" />;
      case 'Completed':
        return <CheckCircle  className="text-green-700"/>;
      default:
        return <FileText className="text-gray-800" />;
    }
  };

  const handleUpdateTicket = () => {
    if (!selectedTicket) return;

    const updatedTickets = tickets.map((ticket) =>
      ticket.id === selectedTicket.id
        ? {
            ...ticket,
            status: newStatus || ticket.status,
            resolution:
              newStatus === 'Completed' ? resolution : ticket.resolution,
            completedDate:
              newStatus === 'Completed'
                ? new Date().toISOString().split('T')[0]
                : ticket.completedDate,
          }
        : ticket
    );

    setTickets(updatedTickets);
    setResolution('');
    setNewStatus('');
    setSelectedTicket(null);
    toast.success('Ticket updated successfully!');
  };

  const columns = ['Pending', 'In Progress', 'Completed'];

  return (
    <div className="p-6 max-w-full mx-auto">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">My Assigned Tickets</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {columns.map((col) => (
          <div key={col}>
            <h2 className="text-xl font-semibold text-gray-800 mb-4">{col}</h2>
            <div className="space-y-4">
              {tickets
                .filter((ticket) => ticket.status === col)
                .map((ticket) => (
                  <Card
                    key={ticket.id}
                    onClick={() => {
                      setSelectedTicket(ticket);
                      setNewStatus(ticket.status);
                      setResolution(ticket.resolution || '');
                    }}
                    className="cursor-pointer hover:shadow-md bg-white hover:bg-gray-50"
                  >
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h3 className="font-semibold text-gray-900">{ticket.title}</h3>
                          <p className="text-sm text-gray-600">{ticket.description}</p>
                        </div>
                        {getStatusIcon(ticket.status)}
                      </div>
                      <div className="flex gap-2 mb-2">
                        <Badge variant="outline" className={getPriorityColor(ticket.priority)}>
                          {ticket.priority}
                        </Badge>
                        <Badge variant="outline" className={getStatusColor(ticket.status)}>
                          {ticket.status}
                        </Badge>
                      </div>
                      <p className="text-xs text-gray-500">
                        <strong>Location:</strong> {ticket.location}
                      </p>
                    </CardContent>
                  </Card>
                ))}
            </div>
          </div>
        ))}
      </div>

      {/* Side Panel for Ticket Details */}
      {selectedTicket && (
        <div className="fixed top-0 right-0 w-full md:w-[400px] h-full bg-white border-l border-gray-300 shadow-lg z-50 overflow-y-auto p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Ticket Details</h3>
            <button onClick={() => setSelectedTicket(null)} className="text-gray-500 hover:text-black text-sm">
              Close
            </button>
          </div>

          <h4 className="font-bold text-gray-800">{selectedTicket.title}</h4>
          <p className="text-gray-700 mb-2">{selectedTicket.description}</p>

          <div className="grid grid-cols-2 gap-3 text-sm mb-3">
  <div>
    <span className="text-gray-600 font-medium">ID:</span>
    <p className="text-gray-800">{selectedTicket.id}</p>
  </div>
  <div>
    <span className="text-gray-600 font-medium">Category:</span>
    <p className="text-gray-800">{selectedTicket.category}</p>
  </div>
  <div>
    <span className="text-gray-600 font-medium">Customer:</span>
    <p className="text-gray-800">{selectedTicket.customerName}</p>
  </div>
  <div>
    <span className="text-gray-600 font-medium">Location:</span>
    <p className="text-gray-800">{selectedTicket.location}</p>
  </div>
  <div>
    <span className="text-gray-600 font-medium">Assigned:</span>
    <p className="text-gray-800">{selectedTicket.assignedDate}</p>
  </div>
  <div>
    <span className="text-gray-600 font-medium">Est. Time:</span>
    <p className="text-gray-800">{selectedTicket.estimatedTime}</p>
  </div>
</div>

          <div className="flex gap-2 mb-3">
            <Badge variant="outline" className={getPriorityColor(selectedTicket.priority)}>
              {selectedTicket.priority}
            </Badge>
            <Badge variant="outline" className={getStatusColor(selectedTicket.status)}>
              {selectedTicket.status}
            </Badge>
          </div>

          {selectedTicket.attachments.length > 0 && (
            <div className="mb-4">
              <strong  className="text-gray-800">Attachments:</strong>
              <ul className="mt-1 space-y-1 text-blue-600 text-sm">
                {selectedTicket.attachments.map((file, i) => (
                  <li key={i} className="flex items-center gap-2 cursor-pointer hover:underline">
                    <Paperclip className="w-4 h-4" /> {file}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {selectedTicket.status !== 'Completed' && (
            <>
              <label className="block text-sm font-medium mb-2  text-gray-800">Update Status</label>
              <Select value={newStatus} onValueChange={setNewStatus}>
                <SelectTrigger className="bg-white text-gray-800 focus:ring-0 focus:outline-none">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem className="bg-white text-gray-800" value="Pending">Pending</SelectItem>
                  <SelectItem  className="bg-white text-gray-800" value="In Progress">In Progress</SelectItem>
                  <SelectItem  className="bg-white text-gray-800" value="Completed">Completed</SelectItem>
                </SelectContent>
              </Select>

              <div className="mt-4">
                <label className="block text-sm font-medium mb-2 text-gray-800">
                  {newStatus === 'Completed' ? 'Resolution Details' : 'Work Notes'}
                </label>
                <Textarea
                  rows={4}
                  className="bg-white text-gray-800 placeholder-gray-500 focus:ring-0 focus:outline-none"
                  placeholder={
                    newStatus === 'Completed'
                      ? 'Describe the resolution...'
                      : 'Add notes on your progress...'
                  }
                  value={resolution}
                  onChange={(e) => setResolution(e.target.value)}
                />
              </div>

              <Button
                onClick={handleUpdateTicket}
                className="w-full mt-4 bg-green-600 hover:bg-green-700"
                disabled={newStatus === 'Completed' && !resolution.trim()}
              >
                {newStatus === 'Completed' ? 'Mark as Completed' : 'Update Ticket'}
              </Button>
            </>
          )}

          {selectedTicket.status === 'Completed' && selectedTicket.resolution && (
            <div className="mt-4 p-3 bg-green-50 border border-green-300 rounded">
              <h4 className="font-semibold text-green-700 mb-1">Resolution</h4>
              <p className="text-green-800 text-sm">{selectedTicket.resolution}</p>
              {selectedTicket.completedDate && (
                <p className="text-green-600 text-xs mt-2">Completed on: {selectedTicket.completedDate}</p>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default TechnicianTicketView;
