import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import logo from '@/assets/logo.png';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { User, Shield,Building2, CheckCircle, Users, Wrench, Mail, Lock, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import './LoginPage.css';

interface LoginPageProps {
  onLogin: (role: 'customer' | 'admin' | 'staff' | 'technician' | 'warehouse_staff' |'sales', username: string) => void;
}

const LoginPage: React.FC<LoginPageProps> = ({ onLogin }) => {
  const [selectedUserType, setSelectedUserType] = useState<'customer' | 'admin' | 'staff' | 'technician' | 'warehouse_staff' | 'sales'>('customer');
  const [useremail, setUseremail] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [password, setPassword] = useState('');
  const [darkMode, setDarkMode] = useState(false);
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

    // 🚀 MOCK LOGIN for Sales
    if (useremail.toLowerCase() === 'sales@mail.com') {
      onLogin('sales', useremail);
      toast.success('Login successful!', { id: toastId });

      setTimeout(() => {
        console.log(`Navigating to /SalesDashboard`);
        window.location.href = `/SalesDashboard`;
      }, 100);
      return; // Skip backend for sales
    }

    let response: LoginResponse;
    try {
      response = await login(useremail, password);
      console.log('Login response:', response);

      if (!response) {
        throw new Error('No response from server');
      }
    } catch (error) {
      console.error('Login error:', error);
      if (selectedUserType === 'technician') {
        throw new Error('Invalid technician credentials. Please try again.');
      }
      throw error; 
    }

    const roleFromResponse = response.role?.toLowerCase();
    const allowedRoles = [
      'customer',
      'admin',
      'staff',
      'technician',
      'warehouse_staff',
      'sales'
    ] as const;
    type AllowedRole = typeof allowedRoles[number];

    const userRole: AllowedRole =
      roleFromResponse === 'technician'
        ? 'technician'
        : allowedRoles.includes(roleFromResponse as AllowedRole)
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
    const errorMessage =
      error.message || 'Failed to sign in. Please try again.';
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
    { type: 'warehouse' as const, label: 'Warehouse Staff', icon: Users, color: 'from-green-50 to-emerald-50' },
    { type: 'sales' as const, label: ' Sales', icon: Users, color: 'from-green-50 to-emerald-50' },
  ];

  return (
    <div
  className="min-h-screen flex transition-colors duration-300"
  style={{
    backgroundImage: `url('/Desktop-2.png')`,
    backgroundSize: "cover",
    backgroundPosition: "center",
    backgroundRepeat: "no-repeat",
  }}
>
  {/* Left Panel */}
  <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden px-12 py-16">
    <div className="relative z-10 flex flex-col justify-center text-green-900 dark:text-white w-full max-w-md mx-auto">
      <div className="flex justify-center mb-6">
        <img src={logo} alt="MV Total Office Solutions" className="h-20 w-auto" />
      </div>
      <h1 className="text-4xl font-bold mb-4">Total Office Solutions</h1>
      <p className="text-lg mb-8 text-green-800 dark:text-gray-300">
        "Everything your business needs to succeed"
      </p>
      <div className="space-y-4">
        <div className="flex items-center space-x-3">
          <CheckCircle className="w-5 h-5 text-green-800 dark:text-green-300" />
          <span>Sustainably focused solutions</span>
        </div>
        <div className="flex items-center space-x-3">
          <CheckCircle className="w-5 h-5 text-green-800 dark:text-green-300" />
          <span>Cost-effective business operations</span>
        </div>
        <div className="flex items-center space-x-3">
          <CheckCircle className="w-5 h-5 text-green-800 dark:text-green-300" />
          <span>Trusted since 1961</span>
        </div>
      </div>
      <div className="mt-12 pt-8 border-t border-green-900/20 dark:border-green-300/30">
        <p className="text-sm text-green-800 dark:text-gray-400">
          Secure access to your business management platform
        </p>
      </div>
    </div>
  </div>

  {/* Right Panel - Login */}
  <div className="flex flex-col items-center justify-center px-12 py-16 lg:w-1/2">
    <div className="w-full max-w-md">
      <div className="lg:hidden text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-green-700 dark:bg-green-600 rounded-xl mb-6 shadow-corporate">
          <Building2 className="w-8 h-8 text-white" />
        </div>
        <h1 className="text-2xl font-bold text-green-900 dark:text-white mb-2">
          Total Office Solutions
        </h1>
      </div>

      {/* Login Card */}
      <Card className="bg-white dark:bg-gray-800 backdrop-blur-sm border border-green-700 dark:border-green-400 shadow-xl transition-colors duration-300">
        <CardHeader className="text-center pb-6">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-green-100 dark:bg-green-800 rounded-lg mb-4 mx-auto">
            <Shield className="w-6 h-6 text-green-700 dark:text-green-300" />
          </div>
          <CardTitle className="text-2xl font-semibold text-green-900 dark:text-white">
            Secure Access
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-6">
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email */}
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium text-green-900 dark:text-white">
                Email Address
              </Label>
              <div className="relative">
                <Mail
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-green-600 dark:text-green-300"
                  size={16}
                />
                <Input
                  id="useremail"
                  type="email"
                  value={useremail}
                  onChange={(e) => setUseremail(e.target.value)}
                  className="pl-9 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-green-600 
                    focus:outline-none focus:ring-0 focus:border-green-600 focus:ring-0 focus:ring-offset-0
                    text-black dark:text-white ring-0 ring-offset-0"
                  required
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-medium text-green-900 dark:text-white">
                Password
              </Label>
              <div className="relative">
                <Lock
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-green-600 dark:text-green-300"
                  size={16}
                />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-green-600 
                    focus:border-green-600 focus:ring-0 focus:ring-offset-0 text-black dark:text-white pl-9
                    ring-0 ring-offset-0"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-green-600 dark:text-green-300 hover:text-green-800 transition-colors"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Submit */}
            <Button
              type="submit"
              className="w-full bg-green-700 hover:bg-green-800 dark:bg-green-600 dark:hover:bg-green-500 text-white font-medium py-3 rounded-lg transition-all duration-200 shadow-corporate"
              disabled={isLoading}
            >
              {isLoading ? (
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  <span>Authenticating...</span>
                </div>
              ) : (
                <span>Sign In</span>
              )}
            </Button>
          </form>

          <div className="text-center">
            <p className="text-sm text-green-800 dark:text-green-300">
              Need here?{" "}
              <button
                type="button"
                onClick={() => navigate("/register")}
                className="text-green-700 dark:text-green-200 hover:text-green-800 font-medium transition-colors"
              >
                Register New
              </button>
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Footer */}
      <div className="text-center mt-6">
        <p className="text-xs text-green-800 dark:text-gray-400">
          © 2024 Total Office Solutions. All rights reserved.
        </p>
      </div>
    </div>
  </div>
</div>

  );
};

export default LoginPage;