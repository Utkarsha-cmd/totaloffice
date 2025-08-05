import React, { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const mockTickets = [
  {
    id: 'TCKT-001',
    title: 'Printer not working',
    description: 'The printer in the admin block is not turning on.',
    category: 'Hardware',
    attachments: ['printer_power_issue.png'],
    priority: '',
    technician: '',
    assigned: false,
  },
  {
    id: 'TCKT-002',
    title: 'Paper jam in printer',
    description: 'Printer in HR department shows frequent paper jam errors.',
    category: 'Hardware',
    attachments: ['paper_jam.jpg'],
    priority: '',
    technician: '',
    assigned: false,
  },
  {
    id: 'TCKT-003',
    title: 'Printer driver installation issue',
    description: 'Unable to install drivers for the new printer in the accounts section.',
    category: 'Software',
    attachments: [],
    priority: '',
    technician: '',
    assigned: false,
  },
];

const TicketAssignment = () => {
  const [tickets, setTickets] = useState(mockTickets);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [priority, setPriority] = useState('');
  const [technician, setTechnician] = useState('');
  const [notes, setNotes] = useState('');

  const handleAssign = () => {
    if (!selectedTicket) return;

    const updatedTickets = tickets.map((ticket) =>
      ticket.id === selectedTicket.id
        ? {
            ...ticket,
            priority,
            technician,
            assigned: true,
          }
        : ticket
    );

    setTickets(updatedTickets);
    alert('Ticket assigned successfully!');
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <h2 className="text-2xl font-semibold mb-4 text-gray-800">Support Tickets</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Ticket List */}
        <div className="space-y-4">
          {tickets.map((ticket) => (
            <div
              key={ticket.id}
              onClick={() => {
                setSelectedTicket(ticket);
                setPriority(ticket.priority || '');
                setTechnician(ticket.technician || '');
              }}
              className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                selectedTicket?.id === ticket.id ? 'bg-green-50 border-green-400' : 'bg-white'
              } hover:bg-green-50`}
            >
              <h3 className="font-semibold text-gray-800">{ticket.title}</h3>
              <p className="text-sm text-gray-700">{ticket.description}</p>
              <p className="text-xs text-gray-600 mt-1">{ticket.category}</p>
            </div>
          ))}
        </div>

        {/* Ticket Details */}
        {selectedTicket && (
          <div className="p-4 border border-green-300 rounded-lg bg-white">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Ticket Details</h2>

            <p>
              <span className="font-semibold text-gray-700">Ticket ID:</span>{' '}
              <span className="text-gray-900">{selectedTicket.id}</span>
            </p>

            <p>
              <span className="font-semibold text-gray-700">Issue:</span>{' '}
              <span className="text-gray-900">{selectedTicket.title}</span>
            </p>

            <p>
              <span className="font-semibold text-gray-700">Description:</span>{' '}
              <span className="text-gray-900">{selectedTicket.description}</span>
            </p>

            <p>
              <span className="font-semibold text-gray-700">Category:</span>{' '}
              <span className="text-gray-900">{selectedTicket.category}</span>
            </p>

            {selectedTicket.attachments.length > 0 && (
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

            {selectedTicket.assigned && (
              <div className="mt-3 flex items-center gap-2">
                <Badge variant="outline" className="text-sm bg-blue-100 text-blue-800 border-blue-300">
                  Assigned to {selectedTicket.technician}
                </Badge>
                <Badge variant="outline" className="text-sm bg-red-100 text-red-800 border-red-300">
                  {selectedTicket.priority}
                </Badge>
              </div>
            )}

            {/* Priority Selector */}
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-800 mb-1">Assign Priority</label>
              <Select value={priority} onValueChange={setPriority}>
                <SelectTrigger className="bg-white text-gray-800 border border-gray-300 focus:ring-1 focus:ring-green-400">
                  <SelectValue placeholder="Select priority" />
                </SelectTrigger>
                <SelectContent className="bg-white text-gray-800 border border-gray-300">
                  <SelectItem value="High" className="text-gray-800 hover:bg-green-100 focus:bg-green-100">
                    High
                  </SelectItem>
                  <SelectItem value="Medium" className="text-gray-800 hover:bg-green-100 focus:bg-green-100">
                    Medium
                  </SelectItem>
                  <SelectItem value="Low" className="text-gray-800 hover:bg-green-100 focus:bg-green-100">
                    Low
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Technician Selector */}
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-800 mb-1">Assign Technician</label>
              <Select value={technician} onValueChange={setTechnician}>
                <SelectTrigger className="bg-white text-gray-800 border border-gray-300 focus:ring-1 focus:ring-green-400">
                  <SelectValue placeholder="Select technician" />
                </SelectTrigger>
                <SelectContent className="bg-white text-gray-800 border border-gray-300">
                  <SelectItem value="Sarah Johnson" className="text-gray-800 hover:bg-green-100 focus:bg-green-100">
                    Sarah Johnson
                  </SelectItem>
                  <SelectItem value="Mike Lee" className="text-gray-800 hover:bg-green-100 focus:bg-green-100">
                    Mike Lee
                  </SelectItem>
                  <SelectItem value="Anita Kumar" className="text-gray-800 hover:bg-green-100 focus:bg-green-100">
                    Anita Kumar
                  </SelectItem>
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
                className="w-full border border-gray-300 rounded px-3 py-2 text-sm text-gray-800 placeholder:text-gray-500"
              />
            </div>

            {/* Assign Button */}
            <Button
              onClick={handleAssign}
              className="mt-6 bg-green-600 hover:bg-green-700 text-white w-full"
            >
              Save & Assign
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default TicketAssignment;
