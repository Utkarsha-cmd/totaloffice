import api from './api';
// Define User type locally since it's not exported from AuthContext
interface User {
  _id: string;
  name: string;
  email: string;
  role: string;
}

const API_URL = '/support';

// Map backend statuses to frontend display values
const statusMap = {
  'open': 'Pending',
  'in_progress': 'In Progress',
  'working_on': 'Working On',
  'resolved': 'Resolved',
  'closed': 'Closed'
} as const;

type BackendStatus = keyof typeof statusMap;
export type FrontendStatus = typeof statusMap[BackendStatus];

export interface Ticket {
  _id: string;
  id: string;
  title: string;
  description: string;
  category: string;
  attachments: string[];
  priority: string;
  status: FrontendStatus;
  assignedTo?: {
    _id: string;
    name: string;
  };
  assigned: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AssignTicketData {
  ticketId: string;
  technicianId: string;
  priority: string;
  notes?: string;
}

export const getAllTickets = async (status?: string): Promise<Ticket[]> => {
  const params = new URLSearchParams();
  if (status) {
    params.append('status', status);
  }
  const response = await api.get(`${API_URL}/tickets?${params.toString()}`);
  
  // Map the backend status to frontend display status
  const tickets = response.data.map((ticket: any) => ({
    ...ticket,
    status: statusMap[ticket.status as BackendStatus] || ticket.status,
    id: ticket._id,
    assigned: !!ticket.assignedTo
  }));
  
  return tickets;
};

export const getTicketById = async (ticketId: string): Promise<Ticket> => {
  const response = await api.get(`${API_URL}/tickets/${ticketId}`);
  return response.data;
};

export const assignTicket = async (data: AssignTicketData): Promise<Ticket> => {
  const response = await api.put(
    `${API_URL}/tickets/${data.ticketId}/assign`,
    {
      technicianId: data.technicianId,
      priority: data.priority.toLowerCase(), // Convert to lowercase to match backend enum
      notes: data.notes,
    }
  );
  return response.data;
};

// Temporary mock data for technicians
const MOCK_TECHNICIANS = [
  { _id: '1', name: 'John Doe' },
  { _id: '2', name: 'Jane Smith' },
  { _id: '3', name: 'Mike Johnson' },
];

export const getTechnicians = async (): Promise<Array<{ _id: string; name: string }>> => {
  try {
    const response = await api.get(`${API_URL}/technicians`);
    return response.data;
  } catch (error) {
    console.error('Error fetching technicians:', error);
    // Fallback to mock data if API call fails
    return MOCK_TECHNICIANS;
  }
};

export interface Note {
  _id: string;
  content: string;
  createdBy: {
    _id: string;
    name: string;
    email?: string;
  };
  createdAt: string;
}

export interface TechnicianTicket extends Omit<Ticket, 'status'> {
  status: FrontendStatus;
  customerName: string;
  customerEmail: string;
  location: string;
  estimatedTime: string;
  completedDate?: string;
  resolution?: string;
  notes?: Note[];
}

export const getTechnicianTickets = async (technicianId: string): Promise<TechnicianTicket[]> => {
  try {
    console.log(`Fetching tickets for technician: ${technicianId}`);
    const response = await api.get(`${API_URL}/tickets/technician/${technicianId}`, {
      params: { status: 'open,in_progress,working_on,resolved' }
    });
    
    console.log('Raw API response:', response.data);
    
    if (!Array.isArray(response.data)) {
      console.error('Expected an array of tickets but got:', response.data);
      return [];
    }
    
    const mappedTickets = response.data.map((ticket: any) => {
      const mappedTicket = {
        ...ticket,
        status: statusMap[ticket.status as BackendStatus] || ticket.status,
        id: ticket._id || ticket.id,
        customerName: ticket.customerName || ticket.customerId?.name || 'Unknown',
        customerEmail: ticket.customerEmail || ticket.customerId?.email || '',
        location: ticket.location || 'Not specified',
        assignedTo: ticket.assignedTo ? {
          _id: ticket.assignedTo._id || ticket.assignedTo,
          name: ticket.assignedTo.name || 'Unknown Technician'
        } : undefined,
        attachments: ticket.attachments?.map((a: any) => a.url || a) || []
      };
      
      console.log(`Mapped ticket ${mappedTicket.id}:`, mappedTicket);
      return mappedTicket;
    });
    
    console.log(`Mapped ${mappedTickets.length} tickets`);
    return mappedTickets;
  } catch (error) {
    console.error('Error fetching technician tickets:', error);
    throw error;
  }
};

export const updateTicketStatus = async (
  ticketId: string, 
  status: FrontendStatus,
  resolution?: string
): Promise<TechnicianTicket> => {
  try {
    // Find the backend status key that matches our frontend status
    const backendStatus = Object.entries(statusMap).find(
      ([_, value]) => value === status
    )?.[0] as BackendStatus;

    const response = await api.put(`${API_URL}/tickets/${ticketId}`, {
      status: backendStatus,
      ...(resolution && { resolution })
    });

    return {
      ...response.data,
      status: statusMap[response.data.status as BackendStatus] || response.data.status,
      id: response.data._id
    };
  } catch (error) {
    console.error('Error updating ticket status:', error);
    throw error;
  }
};

// Add a note to a ticket
export const addTicketNote = async (ticketId: string, content: string): Promise<{message: string}> => {
  try {
    const response = await api.post(`${API_URL}/tickets/${ticketId}/notes`, {
      content
    });
    return response.data;
  } catch (error) {
    console.error('Error adding note to ticket:', error);
    throw error;
  }
};
