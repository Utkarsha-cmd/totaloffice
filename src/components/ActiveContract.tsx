import type React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Handshake, Calendar, FileText, Download, Package, Clock } from "lucide-react"

interface LineItem {
  id: string
  description: string
  quantity: number
  unitPrice: number
  total: number
}

interface Contract {
  id: string
  quoteId: string
  contractNumber: string
  customerName: string
  startDate: string
  endDate: string
  value: number
  status: string
  signedDate: string
}

interface Quote {
  id: string
  customerId: string
  customerName: string
  quoteNumber: string
  date: string
  expiryDate: string
  lineItems: LineItem[]
  subtotal: number
  taxRate: number
  taxAmount: number
  total: number
  terms: string
  notes: string
  status: string
  salesRep: string
}

interface ActiveContractProps {
  customerInfo: {
    id: string
    name: string
    email: string
  } | null
}

const ActiveContract: React.FC<ActiveContractProps> = ({ customerInfo }) => {
  if (!customerInfo) {
    return (
      <div className="space-y-6">
        <Card className="bg-white/95 backdrop-blur-sm border border-gray-200 shadow-sm">
          <CardContent className="p-12 text-center">
            <Handshake size={48} className="mx-auto mb-4 text-gray-400" />
            <h3 className="text-lg font-medium text-gray-700 mb-2">Loading Customer Information</h3>
            <p className="text-gray-500">Please wait while we load your customer details...</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Sample active contracts data - in real app, this would come from API
  const activeContracts: Contract[] = [
    {
      id: "C-001",
      quoteId: "Q-001",
      contractNumber: "CON-001",
      customerName: customerInfo.name,
      startDate: "2024-01-01",
      endDate: "2024-12-31",
      value: 1627.5,
      status: "active",
      signedDate: "2023-12-28",
    },
    {
      id: "C-002",
      quoteId: "Q-003",
      contractNumber: "CON-002",
      customerName: customerInfo.name,
      startDate: "2024-02-01",
      endDate: "2025-01-31",
      value: 2712.5,
      status: "active",
      signedDate: "2024-01-15",
    },
  ]

  // Sample quotes data to get service details - in real app, this would come from API
  const quotes: Quote[] = [
    {
      id: "Q-001",
      customerId: customerInfo.id,
      customerName: customerInfo.name,
      quoteNumber: "Q-001",
      date: "2024-01-15",
      expiryDate: "2024-02-15",
      lineItems: [
        {
          id: "item-1",
          description: "Professional Services Consultation",
          quantity: 10,
          unitPrice: 150,
          total: 1500,
        },
      ],
      subtotal: 1500,
      taxRate: 8.5,
      taxAmount: 127.5,
      total: 1627.5,
      terms: "Payment due within 30 days of invoice date.",
      notes: "Initial consultation package",
      status: "active_contract",
      salesRep: "John Smith",
    },
    {
      id: "Q-003",
      customerId: customerInfo.id,
      customerName: customerInfo.name,
      quoteNumber: "Q-003",
      date: "2024-01-13",
      expiryDate: "2024-02-13",
      lineItems: [
        {
          id: "item-3",
          description: "Marketing Campaign Setup",
          quantity: 1,
          unitPrice: 2500,
          total: 2500,
        },
      ],
      subtotal: 2500,
      taxRate: 8.5,
      taxAmount: 212.5,
      total: 2712.5,
      terms: "Payment due within 15 days",
      notes: "Q1 campaign setup",
      status: "active_contract",
      salesRep: "Mike Brown",
    },
  ]

  const getContractServices = (contract: Contract) => {
    const relatedQuote = quotes.find((q) => q.id === contract.quoteId)
    return relatedQuote?.lineItems || []
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  const calculateDaysRemaining = (endDate: string) => {
    // Create date objects for today and end date
    const today = new Date();
    const end = new Date(endDate);
    
    // Reset time components to midnight for accurate day comparison
    today.setHours(0, 0, 0, 0);
    end.setHours(0, 0, 0, 0);
    
    // Calculate difference in days
    const diffTime = end.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return diffDays;
  }

  const downloadContract = (contract: Contract) => {
    try {
      // Create a contract document
      const contractDoc = `
        CONTRACT #${contract.contractNumber}
        ==============================

        Customer: ${customerInfo?.name || 'N/A'}
        Email: ${customerInfo?.email || 'N/A'}

        Contract Period:
        - Start Date: ${formatDate(contract.startDate)}
        - End Date: ${formatDate(contract.endDate)}
        - Status: ${contract.status}

        Contract Value: $${contract.value.toLocaleString()}

        Services Included:
        ${getContractServices(contract).map(service => 
          `- ${service.description}: ${service.quantity} x $${service.unitPrice} = $${service.total}`
        ).join('\n')}

        Signed on: ${formatDate(contract.signedDate)}

        Terms and Conditions:
        This is a legally binding agreement between ${customerInfo?.name || 'Customer'} and TotalOffice.
        All services are subject to the terms outlined in this document.
      `;

      // Create a Blob with the contract text
      const blob = new Blob([contractDoc], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      
      // Create a temporary anchor element to trigger the download
      const a = document.createElement('a');
      a.href = url;
      a.download = `Contract-${contract.contractNumber}.txt`;
      document.body.appendChild(a);
      a.click();
      
      // Clean up
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
    } catch (error) {
      console.error('Error generating contract:', error);
      alert('Failed to generate contract. Please try again.');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-700">Active Contracts</h1>
          <p className="text-gray-600 mt-1">View your active service contracts and details</p>
        </div>
        <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100">
          <Handshake size={12} className="mr-1" />
          {activeContracts.length} Active
        </Badge>
      </div>

      {activeContracts.length > 0 ? (
        <div className="space-y-6">
          {activeContracts.map((contract) => {
            const services = getContractServices(contract)
            const daysRemaining = calculateDaysRemaining(contract.endDate)

            return (
              <Card
                key={contract.id}
                className="bg-white/95 backdrop-blur-sm border border-green-50 shadow-lg hover:shadow-xl transition-all duration-200"
              >
                <CardHeader className="bg-gradient-to-r from-emerald-50 to-green-50 border-b border-emerald-100">
                  <div className="flex justify-between items-start">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-green-600 rounded-xl flex items-center justify-center text-white shadow-lg">
                        <Handshake size={20} />
                      </div>
                      <div>
                        <CardTitle className="text-xl text-gray-800">Contract #{contract.contractNumber}</CardTitle>
                        <p className="text-sm text-gray-600 mt-1">Based on Quote #{contract.quoteId}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-gray-800">${contract.value.toLocaleString()}</div>
                      <Badge className="mt-2 bg-emerald-50 text-emerald-700 border-emerald-200">
                        <Handshake size={12} className="mr-1" />
                        Active
                      </Badge>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="p-6 space-y-6">
                  {/* Contract Timeline */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                    <div className="flex items-center space-x-3 p-4 bg-purple-50 rounded-lg border border-purple-100">
                      <Clock className="w-5 h-5 text-purple-600" />
                      <div>
                        <p className="text-sm font-medium text-gray-700">Contract Period</p>
                        <p className="text-sm text-gray-600">
                          {formatDate(contract.startDate)} - {formatDate(contract.endDate)}
                        </p>
                        <p className="text-xs mt-1">
                          {daysRemaining > 0 ? (
                            <span className="text-green-600">{daysRemaining} days remaining</span>
                          ) : daysRemaining === 0 ? (
                            <span className="text-amber-600">Ends today</span>
                          ) : (
                            <span className="text-gray-500">Ended {Math.abs(daysRemaining)} days ago</span>
                          )}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Services Included */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                      <Package className="w-5 h-5 text-green-600 mr-2" />
                      Services Included
                    </h3>

                    {services.length > 0 ? (
                      <div className="space-y-3">
                        {services.map((service) => (
                          <div
                            key={service.id}
                            className="flex justify-between items-center p-4 bg-gray-50 rounded-lg border border-gray-100 hover:bg-gray-100 transition-colors"
                          >
                            <div className="flex-1">
                              <h4 className="font-medium text-gray-800">{service.description}</h4>
                              <p className="text-sm text-gray-600 mt-1">
                                Quantity: {service.quantity} × ${service.unitPrice.toLocaleString()}
                              </p>
                            </div>
                            <div className="text-right">
                              <div className="font-semibold text-gray-800">${service.total.toLocaleString()}</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-500 italic">No service details available</p>
                    )}
                  </div>

                  {/* Contract Actions */}
                  <div className="flex justify-between items-center pt-4 border-t border-gray-200">
                    <div className="text-sm text-gray-600">
                      <span className="font-medium">Signed:</span> {formatDate(contract.signedDate)}
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      className="border-green-200 bg-green-50 text-green-700 hover:bg-green-100"
                      onClick={() => downloadContract(contract)}
                    >
                      <Download size={14} className="mr-1" />
                      Download Contract
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      ) : (
        <Card className="bg-white/95 backdrop-blur-sm border border-gray-200 shadow-sm">
          <CardContent className="p-12 text-center">
            <Handshake size={48} className="mx-auto mb-4 text-gray-400" />
            <h3 className="text-lg font-medium text-gray-700 mb-2">No Active Contracts</h3>
            <p className="text-gray-500">
              You don't have any active contracts at the moment. Active contracts will appear here once approved by our
              team.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

export default ActiveContract;
