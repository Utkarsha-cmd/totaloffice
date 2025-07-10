import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import {
  Edit3,
  Save,
  X,
  LogOut,
  User,
  Mail,
  Phone,
  MapPin,
  FilePlus,
} from 'lucide-react';

interface CustomerDetailsProps {
  username: string;
  userType: 'customer' | 'admin' | 'staff';
  onLogout: () => void;
}

interface CustomerInfo {
  name: string;
  email: string;
  phone: string;
  address: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
  };
}

const CustomerDetails: React.FC<CustomerDetailsProps> = ({
  username,
  userType,
  onLogout,
}) => {
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [uploadedDocs, setUploadedDocs] = useState<File[]>([]);

  const [customerInfo, setCustomerInfo] = useState<CustomerInfo>({
    name: username,
    email: `${username.toLowerCase()}@example.com`,
    phone: '+1 (555) 123-4567',
    address: {
      street: '123 Main Street',
      city: 'Springfield',
      state: 'CA',
      zipCode: '90210',
    },
  });

  const [editedInfo, setEditedInfo] = useState<CustomerInfo>(customerInfo);

  const handleEdit = () => {
    setEditedInfo(customerInfo);
    setIsEditing(true);
  };

  const handleSave = () => {
    setCustomerInfo(editedInfo);
    setIsEditing(false);
    toast({
      title: 'Profile Updated',
      description: 'Your information has been successfully updated.',
      duration: 3000,
    });
  };

  const handleCancel = () => {
    setEditedInfo(customerInfo);
    setIsEditing(false);
    setUploadedDocs([]); // clear uploaded files if cancelled
  };

  const updateField = (field: keyof CustomerInfo, value: string) => {
    setEditedInfo(prev => ({ ...prev, [field]: value }));
  };

  const updateAddressField = (
    field: keyof CustomerInfo['address'],
    value: string
  ) => {
    setEditedInfo(prev => ({
      ...prev,
      address: { ...prev.address, [field]: value },
    }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const fileArray = Array.from(e.target.files);
      setUploadedDocs(fileArray);
    }
  };

  return (
    <div className="min-h-screen p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-gradient-to-r from-green-100 to-emerald-100 flex items-center justify-center">
              <User className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-700">Welcome, {customerInfo.name}!</h1>
              <span className="inline-block px-3 py-1 rounded-full text-sm font-medium bg-gradient-to-r from-green-50 to-emerald-50 text-green-700 mt-1">
                {userType.charAt(0).toUpperCase() + userType.slice(1)}
              </span>
            </div>
          </div>
          <Button
            onClick={onLogout}
            variant="outline"
            className="text-gray-500 border-gray-200 hover:bg-red-25 hover:border-red-200 hover:text-red-500"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Logout
          </Button>
        </div>

        {/* Contact Information */}
        <Card className="bg-white/95 backdrop-blur-sm border border-green-50 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-xl text-gray-700">
              <Mail className="w-5 h-5 text-green-500" />
              Contact Information
            </CardTitle>
            {!isEditing ? (
              <Button
                onClick={handleEdit}
                className="bg-gradient-to-r from-green-100 to-emerald-100 hover:from-green-150 hover:to-emerald-150 text-green-700 border-none shadow-sm"
              >
                <Edit3 className="w-4 h-4 mr-2" />
                Edit
              </Button>
            ) : (
              <div className="flex gap-2">
                <Button
                  onClick={handleSave}
                  className="bg-green-50 hover:bg-green-100 text-green-700 border-green-100"
                >
                  <Save className="w-4 h-4 mr-2" />
                  Save
                </Button>
                <Button
                  onClick={handleCancel}
                  variant="outline"
                  className="border-gray-200 text-gray-500"
                >
                  <X className="w-4 h-4 mr-2" />
                  Cancel
                </Button>
              </div>
            )}
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Name */}
              <div className="space-y-2">
                <Label htmlFor="name" className="flex items-center gap-2 text-gray-600">
                  <User className="w-4 h-4 text-green-500" />
                  Full Name
                </Label>
                {isEditing ? (
                  <Input
                    id="name"
                    value={editedInfo.name}
                    onChange={(e) => updateField('name', e.target.value)}
                    className="bg-white/80 border-green-100 focus:border-green-200 focus:ring-green-100"
                  />
                ) : (
                  <p className="p-2 bg-gray-25 rounded-md text-gray-600">{customerInfo.name}</p>
                )}
              </div>

              {/* Email */}
              <div className="space-y-2">
                <Label htmlFor="email" className="flex items-center gap-2 text-gray-600">
                  <Mail className="w-4 h-4 text-green-500" />
                  Email
                </Label>
                {isEditing ? (
                  <Input
                    id="email"
                    type="email"
                    value={editedInfo.email}
                    onChange={(e) => updateField('email', e.target.value)}
                    className="bg-white/80 border-green-100 focus:border-green-200 focus:ring-green-100"
                  />
                ) : (
                  <p className="p-2 bg-gray-25 rounded-md text-gray-600">{customerInfo.email}</p>
                )}
              </div>

              {/* Phone */}
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="phone" className="flex items-center gap-2 text-gray-600">
                  <Phone className="w-4 h-4 text-green-500" />
                  Phone Number
                </Label>
                {isEditing ? (
                  <Input
                    id="phone"
                    value={editedInfo.phone}
                    onChange={(e) => updateField('phone', e.target.value)}
                    className="bg-white/80 border-green-100 focus:border-green-200 focus:ring-green-100"
                  />
                ) : (
                  <p className="p-2 bg-gray-25 rounded-md text-gray-600">{customerInfo.phone}</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Address Information */}
        <Card className="bg-white/95 backdrop-blur-sm border border-green-50 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl text-gray-700">
              <MapPin className="w-5 h-5 text-green-500" />
              Address Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Street */}
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="street" className="text-gray-600">Street Address</Label>
                {isEditing ? (
                  <Input
                    id="street"
                    value={editedInfo.address.street}
                    onChange={(e) => updateAddressField('street', e.target.value)}
                    className="bg-white/80 border-green-100 focus:border-green-200 focus:ring-green-100"
                  />
                ) : (
                  <p className="p-2 bg-gray-25 rounded-md text-gray-600">{customerInfo.address.street}</p>
                )}
              </div>

              {/* City */}
              <div className="space-y-2">
                <Label htmlFor="city" className="text-gray-600">City</Label>
                {isEditing ? (
                  <Input
                    id="city"
                    value={editedInfo.address.city}
                    onChange={(e) => updateAddressField('city', e.target.value)}
                    className="bg-white/80 border-green-100 focus:border-green-200 focus:ring-green-100"
                  />
                ) : (
                  <p className="p-2 bg-gray-25 rounded-md text-gray-600">{customerInfo.address.city}</p>
                )}
              </div>

              {/* State */}
              <div className="space-y-2">
                <Label htmlFor="state" className="text-gray-600">State</Label>
                {isEditing ? (
                  <Input
                    id="state"
                    value={editedInfo.address.state}
                    onChange={(e) => updateAddressField('state', e.target.value)}
                    className="bg-white/80 border-green-100 focus:border-green-200 focus:ring-green-100"
                  />
                ) : (
                  <p className="p-2 bg-gray-25 rounded-md text-gray-600">{customerInfo.address.state}</p>
                )}
              </div>

              {/* ZIP Code */}
              <div className="space-y-2">
                <Label htmlFor="zipCode" className="text-gray-600">ZIP Code</Label>
                {isEditing ? (
                  <Input
                    id="zipCode"
                    value={editedInfo.address.zipCode}
                    onChange={(e) => updateAddressField('zipCode', e.target.value)}
                    className="bg-white/80 border-green-100 focus:border-green-200 focus:ring-green-100"
                  />
                ) : (
                  <p className="p-2 bg-gray-25 rounded-md text-gray-600">{customerInfo.address.zipCode}</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Document Upload */}
        <Card className="bg-white/95 backdrop-blur-sm border border-green-50 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl text-gray-700">
              <FilePlus className="w-5 h-5 text-green-500" />
              Attach Documents (KYC, etc.)
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="kycDocs" className="text-gray-600">Upload Files</Label>
              {isEditing ? (
                <>
                  <Input
                    id="kycDocs"
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png"
                    multiple
                    onChange={handleFileChange}
                    className="bg-white/80 border-green-100 focus:border-green-200 focus:ring-green-100"
                  />
                  {uploadedDocs.length > 0 && (
                    <ul className="text-sm text-gray-500 mt-2 list-disc pl-5">
                      {uploadedDocs.map((file, index) => (
                        <li key={index}>{file.name}</li>
                      ))}
                    </ul>
                  )}
                </>
              ) : (
                <p className="p-2 bg-gray-25 rounded-md text-gray-500 italic">
                  No documents attached
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CustomerDetails;
