import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { User, Shield, Users, Wrench, Mail } from 'lucide-react'; // Added Mail icon

interface LoginPageProps {
  onLogin: (userType: 'customer' | 'admin' | 'staff' | 'technician', useremail: string) => void;
}

const LoginPage: React.FC<LoginPageProps> = ({ onLogin }) => {
  const [selectedUserType, setSelectedUserType] = useState<'customer' | 'admin' | 'staff' | 'technician'>('customer');
  const [useremail, setUseremail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (useremail.trim() && password.trim()) {
      onLogin(selectedUserType, useremail);
      navigate('/home');
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
          <p className="text-gray-500 mt-2">Please select your role and sign in</p>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Role Selector */}
          <div className="space-y-3">
            <Label className="text-sm font-semibold text-gray-600">Select Your Role</Label>
            <div className="grid grid-cols-1 gap-2">
              {userTypes.map(({ type, label, icon: Icon, color }) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => setSelectedUserType(type)}
                  className={`
                    p-3 rounded-lg border-2 transition-all duration-200 flex items-center gap-3
                    ${selectedUserType === type
                      ? `border-green-200 bg-gradient-to-r ${color} shadow-sm`
                      : 'border-gray-100 bg-white/70 hover:border-green-100'}
                  `}
                >
                  <Icon className={`w-5 h-5 ${selectedUserType === type ? 'text-green-600' : 'text-gray-400'}`} />
                  <span className={`font-medium ${selectedUserType === type ? 'text-green-700' : 'text-gray-500'}`}>
                    {label}
                  </span>
                </button>
              ))}
            </div>
          </div>

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

            <Button type="submit" className="w-full bg-green-100 hover:bg-green-200 text-green-700 font-semibold">
              Sign In as {userTypes.find((u) => u.type === selectedUserType)?.label}
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
