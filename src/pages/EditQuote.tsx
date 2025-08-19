import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Save, 
  X,
  Plus,
  Trash2,
  Loader2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import quoteService, { Quote, LineItem } from '@/services/quoteService';

const EditQuote = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [quote, setQuote] = useState<Partial<Quote>>({
    customerName: '',
    quoteNumber: '',
    date: new Date().toISOString().split('T')[0],
    expiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    lineItems: [],
    subtotal: 0,
    taxRate: 0,
    taxAmount: 0,
    total: 0,
    terms: 'Payment due within 30 days',
    notes: '',
    status: 'draft'
  });

  // Set background and text colors on mount
  useEffect(() => {
    document.body.classList.add('bg-white', 'text-black');
    return () => {
      document.body.classList.remove('bg-white', 'text-black');
    };
  }, []);

  useEffect(() => {
    const fetchQuote = async () => {
      try {
        if (id) {
          const data = await quoteService.getQuote(id);
          setQuote({
            ...data,
            date: typeof data.date === 'string' ? data.date.split('T')[0] : data.date.toISOString().split('T')[0],
            expiryDate: typeof data.expiryDate === 'string' ? data.expiryDate.split('T')[0] : data.expiryDate.toISOString().split('T')[0],
          });
        }
      } catch (error) {
        console.error('Error fetching quote:', error);
        toast.error('Failed to load quote');
      } finally {
        setIsLoading(false);
      }
    };

    fetchQuote();
  }, [id]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setQuote(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleLineItemChange = (index: number, field: keyof LineItem, value: string | number) => {
    const updatedItems = [...(quote.lineItems || [])];
    updatedItems[index] = {
      ...updatedItems[index],
      [field]: field === 'quantity' || field === 'unitPrice' ? Number(value) : value
    };
    
    // Recalculate line item total
    if (field === 'quantity' || field === 'unitPrice') {
      updatedItems[index].total = (updatedItems[index].quantity || 0) * (updatedItems[index].unitPrice || 0);
    }

    // Recalculate quote totals
    const subtotal = updatedItems.reduce((sum, item) => sum + (item.total || 0), 0);
    const taxAmount = subtotal * ((quote.taxRate || 0) / 100);
    const total = subtotal + taxAmount;

    setQuote(prev => ({
      ...prev,
      lineItems: updatedItems,
      subtotal,
      taxAmount,
      total
    }));
  };

  const addLineItem = () => {
    setQuote(prev => ({
      ...prev,
      lineItems: [
        ...(prev.lineItems || []),
        {
          id: `item-${Date.now()}`,
          description: '',
          quantity: 1,
          unitPrice: 0,
          total: 0
        }
      ]
    }));
  };

  const removeLineItem = (index: number) => {
    const updatedItems = [...(quote.lineItems || [])];
    updatedItems.splice(index, 1);
    
    // Recalculate totals
    const subtotal = updatedItems.reduce((sum, item) => sum + (item.total || 0), 0);
    const taxAmount = subtotal * ((quote.taxRate || 0) / 100);
    const total = subtotal + taxAmount;

    setQuote(prev => ({
      ...prev,
      lineItems: updatedItems,
      subtotal,
      taxAmount,
      total
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!quote.customerName || !quote.quoteNumber) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      setIsSaving(true);
      if (id) {
        await quoteService.updateQuote(id, quote as Quote);
        toast.success('Quote updated successfully');
      } else {
        await quoteService.createQuote(quote as Omit<Quote, 'id'>);
        toast.success('Quote created successfully');
      }
      navigate('/sales');
    } catch (error) {
      console.error('Error saving quote:', error);
      toast.error('Failed to save quote');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-white">
        <Loader2 className="h-8 w-8 animate-spin text-black" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center mb-6">
        <Button 
          variant="outline" 
          onClick={() => navigate(-1)}
          className="mr-4 border-black hover:bg-gray-100"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Quotes
        </Button>
        <h1 className="text-2xl font-bold">
          {id ? 'Edit Quote' : 'Create New Quote'}
        </h1>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Customer Details */}
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle className="text-lg">Customer & Quote Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="customerName">Customer Name *</Label>
                  <Input
                    id="customerName"
                    name="customerName"
                    value={quote.customerName}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="quoteNumber">Quote Number *</Label>
                  <Input
                    id="quoteNumber"
                    name="quoteNumber"
                    value={quote.quoteNumber}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="date">Date</Label>
                  <Input
                    type="date"
                    id="date"
                    name="date"
                    value={typeof quote.date === 'string' ? quote.date : quote.date?.toISOString().split('T')[0]}
                    onChange={handleInputChange}
                  />
                </div>
                <div>
                  <Label htmlFor="expiryDate">Expiry Date</Label>
                  <Input
                    type="date"
                    id="expiryDate"
                    name="expiryDate"
                    value={typeof quote.expiryDate === 'string' ? quote.expiryDate : quote.expiryDate?.toISOString().split('T')[0]}
                    onChange={handleInputChange}
                  />
                </div>
                <div>
                  <Label htmlFor="status">Status</Label>
                  <Select
                    value={quote.status}
                    onValueChange={(value) => setQuote(prev => ({ ...prev, status: value as Quote['status'] }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="draft">Draft</SelectItem>
                      <SelectItem value="sent">Sent</SelectItem>
                      <SelectItem value="accepted">Accepted</SelectItem>
                      <SelectItem value="rejected">Rejected</SelectItem>
                      <SelectItem value="expired">Expired</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Summary */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span>${quote.subtotal?.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Tax Rate:</span>
                  <div className="flex items-center gap-2">
                    <Input
                      type="number"
                      value={quote.taxRate}
                      onChange={(e) => {
                        const taxRate = parseFloat(e.target.value) || 0;
                        const taxAmount = (quote.subtotal || 0) * (taxRate / 100);
                        setQuote(prev => ({
                          ...prev,
                          taxRate,
                          taxAmount,
                          total: (prev.subtotal || 0) + taxAmount
                        }));
                      }}
                      className="w-20 text-right"
                      min="0"
                      step="0.1"
                    />
                    <span>%</span>
                  </div>
                </div>
                <div className="flex justify-between">
                  <span>Tax Amount:</span>
                  <span>${quote.taxAmount?.toFixed(2)}</span>
                </div>
                <div className="border-t pt-3 mt-2">
                  <div className="flex justify-between font-bold">
                    <span>Total:</span>
                    <span>${quote.total?.toFixed(2)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="space-y-4">
              <Button 
                type="submit" 
                variant="outline"
                className="w-full border-black hover:bg-gray-100"
                disabled={isSaving}
              >
                {isSaving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Save Quote
                  </>
                )}
              </Button>
              <Button 
                type="button" 
                variant="outline" 
                className="w-full border-black hover:bg-gray-100 text-black"
                onClick={() => navigate('/sales')}
              >
                <X className="mr-2 h-4 w-4" />
                Cancel
              </Button>
            </div>
          </div>
        </div>

        {/* Line Items */}
        <Card className="mt-6">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg">Line Items</CardTitle>
            <Button 
              type="button" 
              variant="outline"
              size="sm"
              className="border-black hover:bg-gray-100 text-black"
              onClick={addLineItem}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Item
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {quote.lineItems?.map((item, index) => (
                <div key={item.id} className="grid grid-cols-12 gap-4 items-start">
                  <div className="col-span-6">
                    <Label>Description</Label>
                    <Input
                      value={item.description}
                      onChange={(e) => handleLineItemChange(index, 'description', e.target.value)}
                      placeholder="Item description"
                    />
                  </div>
                  <div className="col-span-2">
                    <Label>Quantity</Label>
                    <Input
                      type="number"
                      min="1"
                      value={item.quantity}
                      onChange={(e) => handleLineItemChange(index, 'quantity', e.target.value)}
                    />
                  </div>
                  <div className="col-span-2">
                    <Label>Unit Price</Label>
                    <div className="relative">
                      <span className="absolute left-3 top-2.5 text-gray-500">$</span>
                      <Input
                        type="number"
                        min="0"
                        step="0.01"
                        value={item.unitPrice}
                        onChange={(e) => handleLineItemChange(index, 'unitPrice', e.target.value)}
                        className="pl-8"
                      />
                    </div>
                  </div>
                  <div className="col-span-1 flex items-end">
                    <div>
                      <Label>Total</Label>
                      <div className="h-10 flex items-center">
                        ${item.total?.toFixed(2)}
                      </div>
                    </div>
                  </div>
                  <div className="col-span-1 flex items-end">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="hover:bg-gray-100"
                      onClick={() => removeLineItem(index)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Terms & Notes */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
          <div>
            <Label htmlFor="terms">Terms & Conditions</Label>
            <Textarea
              id="terms"
              name="terms"
              value={quote.terms}
              onChange={handleInputChange}
              rows={4}
              placeholder="Payment terms and conditions..."
            />
          </div>
          <div>
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              name="notes"
              value={quote.notes || ''}
              onChange={handleInputChange}
              rows={4}
              placeholder="Internal notes..."
            />
          </div>
        </div>
      </form>
    </div>
  );
};

export default EditQuote;
