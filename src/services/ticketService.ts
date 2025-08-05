import api from './api';

const API_URL = '/support';

export interface Ticket {
  _id: string;
  id: string;
  title: string;
  description: string;
  category: string;
  attachments: string[];
  priority: string;
  status: string;
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

export const getAllTickets = async (): Promise<Ticket[]> => {
  const response = await api.get(`${API_URL}/tickets`);
  return response.data;
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
  // For now, return mock data since the endpoint doesn't exist
  // In a real app, you would make an API call like this:
  // const response = await api.get(`${API_URL}/technicians`);
  // return response.data;
  return MOCK_TECHNICIANS;
};
