import React, { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { getAllTickets, getTicketById, assignTicket, getTechnicians, type Ticket } from '@/services/ticketService';
import { userService } from '../services/userService';
import { toast } from 'sonner';



const TicketAssignment = () => {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [priority, setPriority] = useState('');
  const [technician, setTechnician] = useState('');
  const [notes, setNotes] = useState('');
  const [technicians, setTechnicians] = useState<Array<{ _id: string; name: string }>>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Format priority for display (capitalize first letter)
  const formatPriority = (priority: string | undefined): string => {
    if (!priority) return '';
    return priority.charAt(0).toUpperCase() + priority.slice(1).toLowerCase();
  };

  // Format status for display
  const formatStatus = (status: string) => {
    if (!status) return 'Pending';
    return status
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  // Check if ticket is resolved or closed
  const isResolved = (status: string) => status?.toLowerCase() === 'resolved' || status?.toLowerCase() === 'closed';

  // Check if priority is explicitly set (not empty)
  const isPrioritySet = (priority: string | undefined): boolean => {
    return !!priority;
  };

  // Reset form when selectedTicket changes
  useEffect(() => {
    if (selectedTicket) {
      setTechnician(selectedTicket.assignedTo?._id || '');
      setPriority(formatPriority(selectedTicket.priority || ''));
    } else {
      setTechnician('');
      setPriority('');
    }
    setNotes('');
  }, [selectedTicket]);

  const fetchTickets = async (status?: string) => {
    try {
      setLoading(true);
      const ticketsData = await getAllTickets(status);
      setTickets(ticketsData);
      setError('');
    } catch (err) {
      setError('Failed to fetch tickets. Please try again.');
      console.error('Error fetching tickets:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // Fetch technicians
        const techData = await userService.getTechnicians();
        setTechnicians(techData);

        // Fetch all tickets including resolved ones
        await fetchTickets(statusFilter === 'all' ? undefined : statusFilter);
      } catch (err) {
        setError('Failed to fetch data. Please try again.');
        console.error('Error fetching data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [statusFilter]);

  const handleTicketSelect = async (ticketId: string) => {
    try {
      setLoading(true);
      const ticket = await getTicketById(ticketId);
      setSelectedTicket(ticket);
    } catch (err) {
      setError('Failed to fetch ticket details');
      console.error('Error fetching ticket:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAssign = async () => {
    if (!selectedTicket) return;

    try {
      setLoading(true);
      const updatedTicket = await assignTicket({
        ticketId: selectedTicket._id,
        technicianId: technician,
        priority,
        notes,
      });

      // Create an updated ticket object with assigned flag set to true
      const updatedTicketWithAssigned = {
        ...updatedTicket,
        assigned: true, // Ensure assigned flag is set
      };

      // Filter tickets based on status filter
      const filteredTickets = statusFilter === 'all'
        ? tickets
        : tickets.filter(ticket => ticket.status.toLowerCase() === statusFilter.toLowerCase());

      // Show unassigned tickets by default, or all tickets if status filter is applied
      const visibleTickets = statusFilter === 'all'
        ? filteredTickets
        : filteredTickets.filter(ticket => !ticket.assignedTo);

      // Update the tickets list with the updated ticket
      setTickets(visibleTickets.map(ticket =>
        ticket._id === updatedTicket._id ? updatedTicketWithAssigned : ticket
      ));

      // Update the selected ticket
      setSelectedTicket(updatedTicketWithAssigned);

      toast.success('Ticket assigned successfully!');
    } catch (err) {
      console.error('Error assigning ticket:', err);
      toast.error('Failed to assign ticket. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <h1 className="text-2xl font-semibold mb-4 text-gray-800">Support Tickets</h1>
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}
      {loading && !selectedTicket ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Ticket List */}
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="font-semibold text-gray-800">Tickets</h3>
              <Select
                value={statusFilter}
                onValueChange={(value) => setStatusFilter(value)}
                disabled={loading}
              >
                <SelectTrigger className="w-[180px] bg-white text-black border-emerald-300 hover:border-emerald-500 focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 focus:outline-none active:border-emerald-500 active:ring-emerald-500 active:outline-none" style={{ outline: 'none', boxShadow: 'none' }}>
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent className="bg-white border-emerald-200">
                  <SelectItem value="all" className="text-black bg-white hover:bg-emerald-50 focus:bg-emerald-100 focus:text-emerald-900">All Tickets</SelectItem>
                  <SelectItem value="open" className="text-black hover:bg-emerald-50 focus:bg-emerald-100 focus:text-emerald-900">Open</SelectItem>
                  <SelectItem value="in_progress" className="text-black hover:bg-emerald-50 focus:bg-emerald-100 focus:text-emerald-900">In Progress</SelectItem>
                  <SelectItem value="working_on" className="text-black hover:bg-emerald-50 focus:bg-emerald-100 focus:text-emerald-900">Working On</SelectItem>
                  <SelectItem value="resolved" className="text-black hover:bg-emerald-50 focus:bg-emerald-100 focus:text-emerald-900">Resolved</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            {loading ? (
              <div className="flex justify-center items-center h-32">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-green-500"></div>
              </div>
            ) : tickets.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No tickets found
              </div>
            ) : (
              tickets.map((ticket) => (
                <div
                  key={ticket._id}
                  onClick={() => {
                    setSelectedTicket(ticket);
                    setPriority(ticket.priority || '');
                    setTechnician(ticket.assignedTo?._id || '');
                  }}
                  className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                    selectedTicket?._id === ticket._id ? 'bg-green-50 border-green-400' : 'bg-white'
                  } hover:bg-green-50`}
                >
                  <div className="flex justify-between items-start">
                    <h3 className="font-semibold text-gray-800">{ticket.title}</h3>
                    <div className="flex gap-2">
                      <Badge 
                        variant="outline"
                        className={`text-xs ${
                          ticket.status?.toLowerCase() === 'resolved' ? 'bg-green-100 text-green-800 border-green-200' :
                          ticket.status?.toLowerCase() === 'closed' ? 'bg-gray-100 text-gray-800 border-gray-200' :
                          'bg-blue-100 text-blue-800 border-blue-200'
                        }`}
                      >
                        {ticket.status || 'Open'}
                      </Badge>
                      {ticket.priority && (
                        <Badge 
                          variant="outline" 
                          className={`text-xs ${
                            ticket.priority.toLowerCase() === 'high' ? 'bg-red-100 text-red-800 border-red-200' :
                            ticket.priority.toLowerCase() === 'urgent' ? 'bg-purple-100 text-purple-800 border-purple-200' :
                            ticket.priority.toLowerCase() === 'medium' ? 'bg-yellow-100 text-yellow-800 border-yellow-200' :
                            'bg-blue-100 text-blue-800 border-blue-200'
                          }`}
                        >
                          {ticket.priority}
                        </Badge>
                      )}
                    </div>
                  </div>
                  <p className="text-sm text-gray-700 mt-1 line-clamp-2">{ticket.description}</p>
                  <div className="flex justify-between items-center mt-2">
                    <span className="text-xs px-2 py-1 bg-gray-100 text-gray-700 rounded">
                      {ticket.category}
                    </span>
                    <span className="text-xs text-gray-500">
                      {new Date(ticket.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Ticket Details */}
          {selectedTicket && (
            <div className="p-4 border border-green-300 rounded-lg bg-white">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">Ticket Details</h2>
              
              <div className="mb-4">
                <span className="font-semibold text-gray-700">Ticket ID:</span>{' '}
                <span className="text-gray-900">{selectedTicket.id || selectedTicket._id}</span>
                <span className="ml-3 text-sm px-2 py-1 bg-gray-100 text-gray-700 rounded">
                  {selectedTicket.status}
                </span>
              </div>

              <p>
                <span className="font-semibold text-gray-700">Issue:</span>{' '}
                <span className="text-gray-900">{selectedTicket.title}</span>
              </p>

              <p className="mt-2">
                <span className="font-semibold text-gray-700">Description:</span>{' '}
                <span className="text-gray-900">{selectedTicket.description}</span>
              </p>

              <p className="mt-2">
                <span className="font-semibold text-gray-700">Category:</span>{' '}
                <span className="text-gray-900">{selectedTicket.category}</span>
              </p>

              {selectedTicket.attachments && selectedTicket.attachments.length > 0 && (
                <div className="mt-3">
                  <p className="font-semibold text-gray-700">Attachments:</p>
                  {selectedTicket.attachments.map((file, idx) => (
                    <div
                      key={idx}
                      className="text-sm text-gray-800 border rounded px-2 py-1 inline-block mt-1 bg-gray-50"
                    >
                      📎 {file}
                    </div>
                  ))}
                </div>
              )}

              {selectedTicket.assigned && selectedTicket.assignedTo && (
                <div className="mt-3 flex items-center gap-2">
                  <Badge variant="outline" className="text-sm bg-blue-100 text-blue-800 border-blue-300">
                    Assigned to {selectedTicket.assignedTo.name}
                  </Badge>
                  {selectedTicket.priority && (
                    <Badge 
                      variant="outline" 
                      className={`text-sm ${
                        selectedTicket.priority.toLowerCase() === 'high' ? 'bg-red-100 text-red-800 border-red-200' :
                        selectedTicket.priority.toLowerCase() === 'medium' ? 'bg-yellow-100 text-yellow-800 border-yellow-200' :
                        'bg-blue-100 text-blue-800 border-blue-200'
                      }`}
                    >
                      {formatPriority(selectedTicket.priority)}
                    </Badge>
                  )}
                </div>
              )}

              {/* Priority Selector */}
              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-800 mb-1">Assign Priority</label>
                <Select 
                  value={priority || ''}
                  onValueChange={setPriority}
                  disabled={loading || isResolved(selectedTicket.status)}
                >
                  <SelectTrigger className="bg-yellow-100 text-black border-yellow-300 focus:ring-1 focus:ring-yellow-400">
                    <SelectValue placeholder="Select priority" className="text-black" />
                  </SelectTrigger>
                  <SelectContent className="bg-yellow-100 text-black border-yellow-300">
                    <SelectItem 
                      value="High" 
                      className="text-black hover:bg-yellow-200 focus:bg-yellow-200"
                    >
                      <span className="flex items-center">
                        <span className="w-2 h-2 bg-red-500 rounded-full mr-2"></span>
                        High
                      </span>
                    </SelectItem>
                    <SelectItem 
                      value="Medium" 
                      className="text-black hover:bg-yellow-200 focus:bg-yellow-200"
                    >
                      <span className="flex items-center">
                        <span className="w-2 h-2 bg-yellow-500 rounded-full mr-2"></span>
                        Medium
                      </span>
                    </SelectItem>
                    <SelectItem 
                      value="Low" 
                      className="text-black hover:bg-yellow-200 focus:bg-yellow-200"
                    >
                      <span className="flex items-center">
                        <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                        Low
                      </span>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Technician Selector */}
              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-800 mb-1">Assign Technician</label>
                <Select 
                  value={technician} 
                  onValueChange={setTechnician}
                  disabled={loading || isResolved(selectedTicket.status)}
                >
                  <SelectTrigger className="bg-white text-gray-800 border border-gray-300 focus:ring-1 focus:ring-green-400">
                    <SelectValue placeholder="Select technician" />
                  </SelectTrigger>
                  <SelectContent className="bg-white text-gray-800 border border-gray-300">
                    {technicians.map((tech) => (
                      <SelectItem 
                        key={tech._id} 
                        value={tech._id}
                        className="text-gray-800 hover:bg-green-100 focus:bg-green-100"
                      >
                        {tech.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Additional Notes - Show for non-resolved tickets */}
              {!isResolved(selectedTicket.status) && (
                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-800 mb-1">Additional Notes</label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Additional notes..."
                    disabled={loading}
                    className="w-full border border-gray-300 rounded px-3 py-2 text-sm text-gray-800 placeholder:text-gray-500"
                  />
                </div>
              )}

              {/* Assign/Edit Button - Show for non-resolved tickets */}
              {!isResolved(selectedTicket.status) && (
                <Button
                  onClick={handleAssign}
                  disabled={!priority || !technician || loading}
                  className={`mt-6 w-full ${
                    selectedTicket.assigned 
                      ? 'bg-blue-600 hover:bg-blue-700' 
                      : 'bg-green-600 hover:bg-green-700'
                  } text-white`}
                >
                  {loading ? 'Processing...' : selectedTicket.assigned ? 'Update Assignment' : 'Assign'}
                </Button>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default TicketAssignment;
