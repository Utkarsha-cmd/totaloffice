import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { User, Shield, Users, Wrench, Mail } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

interface LoginPageProps {
  onLogin: (role: 'customer' | 'admin' | 'staff' | 'technician', username: string) => void;
}

const LoginPage: React.FC<LoginPageProps> = ({ onLogin }) => {
  const [selectedUserType, setSelectedUserType] = useState<'customer' | 'admin' | 'staff' | 'technician'>('customer');
  const [useremail, setUseremail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();
  const { login } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  interface LoginResponse {
    role: 'customer' | 'admin' | 'staff' | 'technician';
    // Add other properties that might be in the response
    [key: string]: any;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Clear any previous errors
    toast.dismiss();
    
    // Validate inputs
    if (!useremail.trim()) {
      toast.error('Please enter your email');
      return;
    }
    
    if (!password.trim()) {
      toast.error('Please enter your password');
      return;
    }

    try {
      setIsLoading(true);
      
      // Show loading toast
      const toastId = toast.loading('Signing in...');
      
      try {
        // Authenticate with the backend
        const response = await login(useremail, password);
        console.log('Login response:', response);
        
        if (!response) {
          throw new Error('No response from server');
        }
        
        // Get the role from response or use the selected user type as fallback
        const roleFromResponse = response.role?.toLowerCase();
        const allowedRoles = ['customer', 'admin', 'staff', 'technician'] as const;
        type AllowedRole = typeof allowedRoles[number];
        
        const userRole: AllowedRole = 
          allowedRoles.includes(roleFromResponse as AllowedRole) 
            ? roleFromResponse as AllowedRole 
            : selectedUserType;
        
        console.log('Determined user role:', userRole);
        
        // Call the onLogin callback with the user role and email
        // This will update the parent component's state and localStorage
        onLogin(userRole, useremail);
        
        // Show success message
        toast.success('Login successful!', { id: toastId });
        
        // Navigate to the appropriate dashboard based on user role
        // The timeout ensures the parent component has time to process the state change
        setTimeout(() => {
          console.log(`Navigating to /${userRole}`);
          // Force a full page reload to ensure all state is properly initialized
          window.location.href = `/${userRole}`;
        }, 100);
        
      } catch (error: any) {
        console.error('Login error:', error);
        
        // More specific error messages based on error type
        const errorMessage = error.message || 'Failed to sign in. Please try again.';
        toast.error(errorMessage, { id: toastId });
        
        // Clear password field on error
        setPassword('');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const userTypes = [
    { type: 'customer' as const, label: 'Customer', icon: User, color: 'from-green-50 to-emerald-50' },
    { type: 'admin' as const, label: 'Admin', icon: Shield, color: 'from-green-50 to-emerald-50' },
    { type: 'staff' as const, label: 'Staff', icon: Users, color: 'from-green-50 to-emerald-50' },
    { type: 'technician' as const, label: 'Technician', icon: Wrench, color: 'from-green-50 to-emerald-50' },
  ];

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-white/95 backdrop-blur-sm border border-green-50 shadow-lg">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-bold bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">
            Welcome
          </CardTitle>
          <p className="text-gray-500 mt-2">Please sign in to continue</p>
        </CardHeader>
        <CardContent className="space-y-6">

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="useremail" className="text-black font-semibold">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 bottom-3 text-gray-400" size={16} />
                <Input
                  id="useremail"
                  type="email"
                  value={useremail}
                  onChange={(e) => setUseremail(e.target.value)}
                  required
                  className="pl-9 bg-gray-50 border border-gray-300 focus:border-green-400 focus:ring-0 focus:outline-none text-black"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="password" className="text-black font-semibold">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="bg-gray-50 border border-gray-300 focus:border-green-400 focus:ring-0 focus:outline-none text-black"
              />
            </div>



            <Button 
              type="submit" 
              className="w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white font-semibold py-2 px-4 rounded-md transition duration-300"
              disabled={isLoading}
            >
              {isLoading ? 'Signing in...' : 'Sign In'}
            </Button>
          </form>

          <div className="text-center text-sm text-gray-500">
            New here?{' '}
            <button
              type="button"
              onClick={() => navigate('/register')}
              className="text-green-600 hover:underline font-medium"
            >
              Register New
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default LoginPage;
