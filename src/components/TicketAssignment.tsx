import React, { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { getAllTickets, getTicketById, assignTicket, Ticket } from '../services/ticketService';
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

  // Format priority for display (capitalize first letter)
  const formatPriority = (priority: string | undefined): string => {
    if (!priority || priority === 'medium') return ''; // Don't show default 'medium' as selected
    return priority.charAt(0).toUpperCase() + priority.slice(1).toLowerCase();
  };
  
  // Check if priority is explicitly set (not default)
  const isPrioritySet = (priority: string | undefined): boolean => {
    return !!priority && priority !== 'medium';
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

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // Fetch tickets and technicians in parallel
        const [ticketsData, techData] = await Promise.all([
          getAllTickets(),
          userService.getTechnicians()
        ]);
        setTickets(ticketsData);
        setTechnicians(techData);
      } catch (err) {
        setError('Failed to fetch data. Please try again.');
        console.error('Error fetching data:', err);
      } finally {
        setLoading(false);
      }
    };

    const handleTicketSelect = async (ticketId: string) => {
      try {
        setLoading(true);
        const ticket = await getTicketById(ticketId);
        setSelectedTicket(ticket);
        // The useEffect above will handle setting the priority and technician
      } catch (err) {
        setError('Failed to fetch ticket details');
        console.error('Error fetching ticket:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleAssign = async () => {
    if (!selectedTicket) return;
    
    try {
      setLoading(true);
      const updatedTicket = await assignTicket({
        ticketId: selectedTicket._id,
        technicianId: technician,
        priority,
        notes
      });
      
      // Create an updated ticket object with assigned flag set to true
      const updatedTicketWithAssigned = {
        ...updatedTicket,
        assigned: true // Ensure assigned flag is set
      };
      
      // Update the tickets list with the updated ticket
      setTickets(tickets.map(ticket => 
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
      <h2 className="text-2xl font-semibold mb-4 text-gray-800">Support Tickets</h2>
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
            {tickets.length === 0 ? (
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
                    {ticket.priority && ticket.priority.toLowerCase() !== 'medium' && (
                      <Badge 
                        variant="outline" 
                        className={`text-xs ${
                          ticket.priority.toLowerCase() === 'high' ? 'bg-red-100 text-red-800 border-red-200' :
                          ticket.priority.toLowerCase() === 'urgent' ? 'bg-purple-100 text-purple-800 border-purple-200' :
                          'bg-blue-100 text-blue-800 border-blue-200'
                        }`}
                      >
                        {ticket.priority}
                      </Badge>
                    )}
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
                  {isPrioritySet(selectedTicket.priority) && (
                    <Badge 
                      variant="outline" 
                      className={`text-sm ${
                        selectedTicket.priority.toLowerCase() === 'high' ? 'bg-red-100 text-red-800 border-red-200' :
                        selectedTicket.priority.toLowerCase() === 'medium' ? 'bg-yellow-100 text-yellow-800 border-yellow-200' :
                        'bg-blue-100 text-blue-800 border-blue-200'
                      }`}
                    >
                      {formatPriority(selectedTicket.priority) || 'Medium'}
                    </Badge>
                  )}
                </div>
              )}

              {/* Priority Selector */}
              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-800 mb-1">Assign Priority</label>
                <Select 
                  value={isPrioritySet(priority) ? priority : ''}
                  onValueChange={setPriority}
                  disabled={loading}
                >
                  <SelectTrigger className="bg-white text-gray-800 border border-gray-300 focus:ring-1 focus:ring-green-400">
                    <SelectValue placeholder={priority ? formatPriority(priority) : 'Select priority'}>
                      {isPrioritySet(priority) ? formatPriority(priority) : 'Select priority'}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent className="bg-white text-gray-800 border border-gray-300">
                    <SelectItem 
                      value="High" 
                      className="text-red-800 hover:bg-red-50 focus:bg-red-50"
                    >
                      <span className="flex items-center">
                        <span className="w-2 h-2 bg-red-500 rounded-full mr-2"></span>
                        High
                      </span>
                    </SelectItem>
                    <SelectItem 
                      value="Medium" 
                      className="text-yellow-800 hover:bg-yellow-50 focus:bg-yellow-50"
                    >
                      <span className="flex items-center">
                        <span className="w-2 h-2 bg-yellow-500 rounded-full mr-2"></span>
                        Medium
                      </span>
                    </SelectItem>
                    <SelectItem 
                      value="Low" 
                      className="text-blue-800 hover:bg-blue-50 focus:bg-blue-50"
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
                  disabled={loading}
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

              {/* Notes */}
              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-800 mb-1">Additional Notes</label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Additional notes..."
                  disabled={loading}
                  className="w-full border border-gray-300 rounded px-3 py-2 text-sm text-gray-800 placeholder:text-gray-500 disabled:bg-gray-50 disabled:cursor-not-allowed"
                />
              </div>

              {/* Assign/Edit Button */}
              <Button
                onClick={handleAssign}
                disabled={!priority || !technician || loading}
                className={`mt-6 w-full ${
                  selectedTicket.assigned 
                    ? 'bg-blue-600 hover:bg-blue-700' 
                    : 'bg-green-600 hover:bg-green-700'
                } text-white disabled:bg-gray-300 disabled:cursor-not-allowed`}
              >
                {loading ? 'Processing...' : selectedTicket.assigned ? 'Update Assignment' : 'Assign'}
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default TicketAssignment;
