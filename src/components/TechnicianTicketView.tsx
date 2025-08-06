import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { getTechnicianTickets, updateTicketStatus, addTicketNote, type TechnicianTicket, type FrontendStatus } from '@/services/ticketService';
import { Loader2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
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
  Wrench,
} from 'lucide-react';
import { toast } from 'sonner';

interface TechnicianTicketViewProps {
  onTicketUpdate?: () => void;
}

const TechnicianTicketView: React.FC<TechnicianTicketViewProps> = ({ onTicketUpdate }) => {
  const { user } = useAuth();
  const [tickets, setTickets] = useState<TechnicianTicket[]>([]);
  const [selectedTicket, setSelectedTicket] = useState<TechnicianTicket | null>(null);
  const [resolution, setResolution] = useState('');
  const [newStatus, setNewStatus] = useState<FrontendStatus>('In Progress' as FrontendStatus);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [isAddingComment, setIsAddingComment] = useState(false);

  const fetchTickets = async () => {
    if (!user?.id) {
      console.log('No user ID available');
      return;
    }
    
    console.log('=== Starting to fetch tickets ===');
    console.log('User ID:', user.id);
    console.log('User role:', user.role);
    
    try {
      setIsLoading(true);
      console.log('Calling getTechnicianTickets with user ID:', user.id);
      const data = await getTechnicianTickets(user.id);
      console.log('=== Tickets data received ===');
      console.log('Data type:', typeof data);
      console.log('Is array:', Array.isArray(data));
      console.log('Ticket count:', data?.length || 0);
      
      if (!data || !Array.isArray(data)) {
        console.error('Invalid data received:', data);
        toast.error('Invalid data received from server');
        return;
      }
      
      console.log('Tickets before setting state:', data);
      setTickets(data);
    } catch (error) {
      console.error('Error fetching tickets:', error);
      toast.error('Failed to load tickets');
    } finally {
      setIsLoading(false);
    }
  };

  // Initial load
  useEffect(() => {
    fetchTickets();
  }, [user?.id]);

  const getPriorityColor = (priority: 'High' | 'Medium' | 'Low' | string) => {
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'In Progress':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'Working On':
        return 'bg-purple-100 text-purple-800 border-purple-300';
      case 'Resolved':
      case 'Closed':
        return 'bg-green-100 text-green-800 border-green-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'In Progress':
        return <AlertCircle className="text-blue-700" />;
      case 'Working On':
        return <Wrench className="text-purple-700" />;
      case 'Resolved':
      case 'Closed':
        return <CheckCircle className="text-green-700" />;
      default:
        return <FileText className="text-gray-800" />;
    }
  };

  const handleStatusUpdate = async (ticketId: string, newStatus: FrontendStatus, resolution?: string) => {
    try {
      setIsUpdating(true);
      const updatedTicket = await updateTicketStatus(
        ticketId,
        newStatus,
        newStatus === 'Resolved' ? resolution : undefined
      );
      
      // Update local state with the updated ticket
      setTickets(prevTickets => 
        prevTickets.map(ticket => 
          ticket.id === updatedTicket.id ? updatedTicket : ticket
        )
      );
      
      // Notify parent component about the update
      if (onTicketUpdate) {
        onTicketUpdate();
      }
      
      // Also dispatch a custom event for other components to listen to
      window.dispatchEvent(new Event('ticketUpdated'));
      
      toast.success(`Ticket marked as ${newStatus}`);
    } catch (error) {
      console.error('Error updating ticket status:', error);
      toast.error('Failed to update ticket status');
    } finally {
      setIsUpdating(false);
    }
  };

  const columns = ['In Progress', 'Working On', 'Resolved'] as const;

  if (isLoading) {
    console.log('Loading tickets...');
    return (
      <div className="flex flex-col justify-center items-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500 mb-2" />
        <p className="text-gray-600">Loading tickets...</p>
      </div>
    );
  }

  if (!tickets || tickets.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <FileText className="w-12 h-12 text-gray-400 mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-1">No tickets found</h3>
        <p className="text-gray-500">You don't have any assigned tickets yet.</p>
      </div>
    );
  }

  console.log('Rendering with tickets:', tickets);

  return (
    <div className="p-6 max-w-full mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">My Assigned Tickets</h1>
        <Button 
          variant="outline"
          size="sm"
          onClick={() => window.location.reload()}
          disabled={isLoading}
          className="bg-white text-black border-black hover:bg-gray-100 hover:text-black"
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Refreshing...
            </>
          ) : 'Refresh'}
        </Button>
      </div>
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
                          <p className="text-sm text-gray-600 line-clamp-2">{ticket.description}</p>
                        </div>
                        {getStatusIcon(ticket.status)}
                      </div>
                      <div className="flex gap-2 mb-2 flex-wrap">
                        <Badge variant="outline" className={getPriorityColor(ticket.priority)}>
                          {ticket.priority}
                        </Badge>
                        <Badge variant="outline" className={getStatusColor(ticket.status)}>
                          {ticket.status}
                        </Badge>
                      </div>
                      <div className="mt-3 space-y-2">
                        {ticket.status === 'In Progress' && (
                          <Button 
                            size="sm" 
                            className="w-full bg-purple-600 hover:bg-purple-700 text-white"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleStatusUpdate(ticket.id, 'Working On');
                            }}
                            disabled={isUpdating}
                          >
                            Start Working
                          </Button>
                        )}
                        
                        {ticket.status === 'Working On' && (
                          <Button 
                            size="sm" 
                            variant="outline" 
                            className="w-full border-green-500 text-green-700 hover:bg-green-50"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleStatusUpdate(ticket.id, 'Resolved', 'Completed by technician');
                            }}
                            disabled={isUpdating}
                          >
                            Mark as Resolved
                          </Button>
                        )}
                      </div>
                      <p className="text-xs text-gray-500 mt-2">
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
              <span className="text-gray-600 font-medium">Category:</span>
              <p className="text-gray-800">{selectedTicket.category}</p>
            </div>
            <div>
              <span className="text-gray-600 font-medium">Customer:</span>
              <p className="text-gray-800">{selectedTicket.customerName}</p>
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
              <strong className="text-gray-800">Attachments:</strong>
              <ul className="mt-1 space-y-1 text-blue-600 text-sm">
                {selectedTicket.attachments.map((file, i) => (
                  <li key={i} className="flex items-center gap-2 cursor-pointer hover:underline">
                    <Paperclip className="w-4 h-4" /> {file}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {selectedTicket.status === 'Working On' && (
            <div className="mt-4">
              <Button 
                onClick={() => handleStatusUpdate(selectedTicket.id, 'Resolved', 'Completed by technician')}
                className="w-full bg-green-600 hover:bg-green-700"
                disabled={isUpdating}
              >
                {isUpdating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Updating...
                  </>
                ) : (
                  'Mark as Resolved'
                )}
              </Button>
            </div>
          )}

          {/* Comments Section */}
          <div className="mt-6 border-t border-gray-200 pt-4">
            <h4 className="text-lg font-semibold text-gray-900 mb-4">Comments</h4>
            
            {/* Comments List */}
            {selectedTicket.notes?.length > 0 ? (
              <div className="space-y-4 mb-6">
                {selectedTicket.notes.map((note, index) => (
                  <div key={index} className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {note.createdBy?.name || 'Technician'}
                        </p>
                        <p className="text-xs text-gray-500 mb-2">
                          {new Date(note.createdAt).toLocaleString()}
                        </p>
                      </div>
                    </div>
                    <p className="text-sm text-gray-700">{note.content}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500 italic mb-6">No comments yet</p>
            )}
            
            {/* Add Comment Form */}
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
              <h5 className="text-sm font-medium text-gray-700 mb-2">Add a comment</h5>
              <Textarea
                placeholder="Type your comment here..."
                className="w-full mb-3 bg-white border-gray-300 focus:border-gray-500 focus:ring-gray-500 text-black placeholder-gray-500"
                rows={3}
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                disabled={isAddingComment}
              />
              <div className="flex justify-end">
                <Button 
                  onClick={async () => {
                    if (!newComment.trim()) return;
                    
                    try {
                      setIsAddingComment(true);
                      await addTicketNote(selectedTicket.id, newComment);
                      
                      // Refresh the ticket to show the new comment
                      const updatedTickets = await getTechnicianTickets(user.id);
                      setTickets(updatedTickets);
                      
                      // Update the selected ticket to show the new comment
                      const updatedTicket = updatedTickets.find(t => t.id === selectedTicket.id);
                      if (updatedTicket) {
                        setSelectedTicket(updatedTicket);
                      }
                      
                      setNewComment('');
                      toast.success('Comment added successfully');
                    } catch (error) {
                      console.error('Error adding comment:', error);
                      toast.error('Failed to add comment');
                    } finally {
                      setIsAddingComment(false);
                    }
                  }}
                  disabled={!newComment.trim() || isAddingComment}
                  size="sm"
                  className="bg-gray-800 hover:bg-gray-900 text-white"
                >
                  {isAddingComment ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Adding...
                    </>
                  ) : 'Post Comment'}
                </Button>
              </div>
            </div>
          </div>

          {(selectedTicket.status === 'Resolved' || selectedTicket.status === 'Closed') && selectedTicket.resolution && (
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