import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { User, Shield, Users } from 'lucide-react';

interface LoginPageProps {
  onLogin: (userType: 'customer' | 'admin' | 'staff', username: string) => void;
}

const LoginPage = ({ onLogin }: LoginPageProps) => {
  const [selectedUserType, setSelectedUserType] = useState<'customer' | 'admin' | 'staff'>('customer');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (username.trim() && password.trim()) {
      onLogin(selectedUserType, username);
    }
  };

  const userTypes = [
    { type: 'customer' as const, label: 'Customer', icon: User, color: 'from-purple-50 to-pink-50' },
    { type: 'admin' as const, label: 'Admin', icon: Shield, color: 'from-blue-50 to-cyan-50' },
    { type: 'staff' as const, label: 'Staff', icon: Users, color: 'from-green-50 to-emerald-50' }
  ];

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-white/95 backdrop-blur-sm border border-purple-50 shadow-lg">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
            Welcome 
          </CardTitle>
          <p className="text-gray-500 mt-2">Please select your role and sign in</p>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* User Type Selection */}
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
                      ? `border-purple-200 bg-gradient-to-r ${color} shadow-sm` 
                      : 'border-gray-100 bg-white/70 hover:border-purple-100'
                    }
                  `}
                >
                  <Icon className={`w-5 h-5 ${selectedUserType === type ? 'text-purple-600' : 'text-gray-400'}`} />
                  <span className={`font-medium ${selectedUserType === type ? 'text-purple-700' : 'text-gray-500'}`}>
                    {label}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username" className="text-gray-600">Username</Label>
              <Input
                id="username"
                type="text"
                placeholder="Enter your username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className={`bg-white/80 border-purple-100 focus:border-purple-200 focus:ring-purple-100 
                  ${username ? 'text-purple-700' : 'text-gray-500'}`}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password" className="text-gray-600">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={`bg-white/80 border-purple-100 focus:border-purple-200 focus:ring-purple-100 
                  ${password ? 'text-purple-700' : 'text-gray-500'}`}
                required
              />
            </div>

            <Button 
              type="submit" 
              className="w-full bg-gradient-to-r from-purple-100 to-pink-100 hover:from-purple-150 hover:to-pink-150 text-purple-700 border-none shadow-sm font-semibold py-2.5"
            >
              Sign In as {userTypes.find(u => u.type === selectedUserType)?.label}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default LoginPage;
