import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import logo from '@/assets/logo.png';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { User, Shield, Users, Wrench, Mail, Lock, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

interface LoginPageProps {
  onLogin: (role: 'customer' | 'admin' | 'staff' | 'technician' | 'warehouse', username: string) => void;
}

const LoginPage: React.FC<LoginPageProps> = ({ onLogin }) => {
  const [selectedUserType, setSelectedUserType] = useState<'customer' | 'admin' | 'staff' | 'technician' | 'warehouse'>('customer');
  const [useremail, setUseremail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();
  const { login } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  interface LoginResponse {
    role: string; 
    [key: string]: any;
}

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    toast.dismiss();

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
      const toastId = toast.loading('Signing in...');
      let response: LoginResponse;
      if (useremail.includes('warehouse')) {
        response = { role: 'warehouse' };
      } else {
        response = await login(useremail, password);
      }

      console.log('Login response:', response);

      if (!response) {
        throw new Error('No response from server');
      }

      const roleFromResponse = response.role?.toLowerCase();
      const allowedRoles = ['customer', 'admin', 'staff', 'technician', 'warehouse'] as const;
      type AllowedRole = typeof allowedRoles[number];

      const userRole: AllowedRole =
        allowedRoles.includes(roleFromResponse as AllowedRole)
          ? (roleFromResponse as AllowedRole)
          : selectedUserType;

      console.log('Determined user role:', userRole);

      onLogin(userRole, useremail);

      toast.success('Login successful!', { id: toastId });

      setTimeout(() => {
        console.log(`Navigating to /${userRole}`);
        window.location.href = `/${userRole}`;
      }, 100);
    } catch (error: any) {
      console.error('Login error:', error);
      const errorMessage = error.message || 'Failed to sign in. Please try again.';
      toast.error(errorMessage);
      setPassword('');
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
    <div className="w-full max-w-md">
      <div className="text-center mb-8">
        <div className="flex justify-center mb-6">
          <img
            src={logo}
            alt="MV Total Office Solutions"
            className="h-20 w-auto"
          />
        </div>
        {/* <h1 className="text-2xl font-bold text-gray-900 mb-2">Welcome Back</h1>
        <p className="text-gray-500">Please sign in to your account</p> */}
      </div> 

      <Card className="w-full max-w-md bg-white/95 backdrop-blur-sm border border-green-50 shadow-lg">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-bold bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">
            Sign In
          </CardTitle>
          {/* <p className="text-gray-500 mt-2">Please sign in to continue</p> */}
        </CardHeader>

        <CardContent className="space-y-6">
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
  </div>
);
};

export default LoginPage;