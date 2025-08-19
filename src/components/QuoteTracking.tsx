import React, { useState } from "react";
import { 
  FileText, 
  Eye, 
  Download, 
  Send, 
  Filter, 
  Search,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Quote as QuoteType } from '@/services/quoteService';

interface Quote extends Omit<QuoteType, '_id'> {
  id: string;
  _id?: string;
  status: 'draft' | 'sent' | 'accepted' | 'rejected' | 'expired';
}

interface LineItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

interface QuoteTrackingProps {
  quotes: Quote[];
  onUpdateQuoteStatus: (quoteId: string, newStatus: Quote['status']) => void;
}

const QuoteTracking: React.FC<QuoteTrackingProps> = ({ quotes, onUpdateQuoteStatus }) => {
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState("");

  const getStatusIcon = (status: string) => {
    const iconClass = "w-5 h-5";
    switch (status) {
      case "draft":
        return <AlertCircle className={`${iconClass} text-gray-500`} />;
      case "sent":
        return <Send className={`${iconClass} text-emerald-500`} />;
      case "accepted":
        return <CheckCircle className={`${iconClass} text-emerald-500`} />;
      case "rejected":
        return <XCircle className={`${iconClass} text-red-500`} />;
      case "expired":
        return <AlertCircle className={`${iconClass} text-amber-500`} />;
      default:
        return <AlertCircle className={`${iconClass} text-gray-500`} />;
    }
  };

  // Status badge component
  const StatusBadge = ({ status }: { status: Quote['status'] }) => {
    const statusConfig = {
      draft: { bg: 'bg-gray-100 text-gray-800', icon: Clock, label: 'Draft' },
      sent: { bg: 'bg-blue-100 text-blue-800', icon: Send, label: 'Sent' },
      accepted: { bg: 'bg-green-100 text-green-800', icon: CheckCircle, label: 'Accepted' },
      rejected: { bg: 'bg-red-100 text-red-800', icon: XCircle, label: 'Rejected' },
      expired: { bg: 'bg-amber-100 text-amber-800', icon: AlertCircle, label: 'Expired' },
    }[status] || { bg: 'bg-gray-100 text-gray-800', icon: Clock, label: 'Unknown' };

    const Icon = statusConfig.icon;

    return (
      <Badge 
        variant="outline"
        className={`${statusConfig.bg} transition-colors`}
      >
        <Icon size={14} className="mr-1" />
        {statusConfig.label}
      </Badge>
    );
  };

  const filteredQuotes = quotes.filter((quote) => {
    const matchesStatus = statusFilter === "all" || quote.status === statusFilter;
    const matchesSearch = 
      (quote.quoteNumber?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
      (quote.customerName?.toLowerCase() || '').includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const handleSendToCustomer = (quoteId: string) => {
    onUpdateQuoteStatus(quoteId, 'sent');
  };

  const handleDownloadPDF = (quote: Quote) => {
    toast.success(`Downloading PDF for Quote #${quote.quoteNumber}`);
  };

  const handleViewQuote = (quote: Quote) => {
    toast.info(`Viewing Quote #${quote.quoteNumber}`);
  };

  return (
    <>
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-800">Quote Tracking</h2>
        <p className="text-gray-600 mt-1">Monitor and manage all your quotes</p>
      </div>

      {/* Filters and Search */}
      <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg mb-6">
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
            <div className="flex flex-col sm:flex-row gap-4 items-center">
              <div className="flex items-center gap-2">
                <Filter size={16} className="text-gray-500" />
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-3 py-2 rounded-lg border border-gray-300 bg-white text-gray-800 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                >
                  <option value="all">All Status</option>
                  <option value="draft">Draft</option>
                  <option value="sent">Sent</option>
                  <option value="accepted">Accepted</option>
                  <option value="rejected">Rejected</option>
                  <option value="expired">Expired</option>
                </select>
              </div>
              <div className="relative">
                <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <Input
                  placeholder="Search by quote number or customer..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-white border-gray-300"
                />
              </div>
            </div>
            <div className="text-sm text-gray-600">
              {filteredQuotes.length} of {quotes.length} quotes
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quotes Table */}
      <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-gray-800">
            <FileText size={20} />
            All Quotes
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {filteredQuotes.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Quote
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Customer
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Amount
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredQuotes.map((quote) => (
                    <tr key={quote.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          {getStatusIcon(quote.status)}
                          <div className="ml-3">
                            <div className="text-sm font-medium text-gray-900">
                              #{quote.quoteNumber}
                            </div>
                            <div className="text-sm text-gray-500">
                              Expires: {new Date(quote.expiryDate).toLocaleDateString()}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {quote.customerName}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {new Date(quote.date).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-semibold text-gray-900">
                          ${quote.total?.toLocaleString()}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <StatusBadge status={quote.status} />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleViewQuote(quote)}
                            className="inline-flex items-center justify-center h-9 px-3 rounded-md text-sm font-medium border border-emerald-200 text-emerald-700 bg-white hover:bg-emerald-50 hover:text-emerald-800 transition-colors"
                          >
                            <Eye size={14} />
                          </button>
                          <button
                            onClick={() => handleDownloadPDF(quote)}
                            className="inline-flex items-center justify-center h-9 px-3 rounded-md text-sm font-medium border border-emerald-200 text-emerald-700 bg-white hover:bg-emerald-50 hover:text-emerald-800 transition-colors"
                          >
                            <Download size={14} />
                          </button>
                          {quote.status === "draft" && (
                            <Button
                              variant="default"
                              size="sm"
                              onClick={() => handleSendToCustomer(quote.id)}
                              className="bg-emerald-600 hover:bg-emerald-700 text-white"
                            >
                              <Send size={14} className="mr-1" />
                              Send to Customer
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-12 text-gray-500">
              <FileText size={48} className="mx-auto mb-4 opacity-50" />
              <p className="text-lg mb-2">No quotes found</p>
              <p className="text-sm">Try adjusting your filters or search criteria</p>
            </div>
          )}
        </CardContent>
      </Card>
    </>
  );
};

export default QuoteTracking;