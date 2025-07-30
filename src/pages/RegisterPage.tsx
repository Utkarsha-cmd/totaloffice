import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { User, Phone, Shield, Lock, Mail } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

const countryCodes = [
  { code: '+1', label: '🇺🇸' },
  { code: '+91', label: '🇮🇳' },
  { code: '+44', label: '🇬🇧' },
  { code: '+61', label: '🇦🇺' },
  { code: '+81', label: '🇯🇵' },
];

const RegisterPage = () => {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    countryCode: '+91',
    role: 'customer',
    password: '',
    confirmPassword: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (form.password !== form.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    if (form.password.length < 6) {
      toast.error('Password must be at least 6 characters long');
      return;
    }

    try {
      setIsLoading(true);
      const phoneNumber = `${form.countryCode}${form.phone}`;
      
      await register({
        name: form.name,
        email: form.email,
        password: form.password,
        phone: phoneNumber,
        role: form.role,
      });
      
      toast.success('Registration successful! Please log in.');
      navigate('/login');
    } catch (error) {
      console.error('Registration error:', error);
      toast.error(error.response?.data?.message || 'Registration failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50">
      <Card className="w-full max-w-md bg-white border border-green-100 shadow-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-green-700">
            Create a New Account
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name" className="text-gray-700">
                  Full Name
                </Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                  <Input
                    id="name"
                    name="name"
                    type="text"
                    value={form.name}
                    onChange={handleChange}
                    required
                    className="pl-10 bg-white text-yellow-600 placeholder-yellow-400"
                  />
                </div>
              </div>
            </div>

            {/* Email */}
            <div className="relative">
              <Label htmlFor="email" className="text-gray-700">
                Email
              </Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                <Input
                  id="email"
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  required
                  className="pl-10 bg-white text-yellow-600 placeholder-yellow-400"
                />
              </div>
            </div>

            {/* Phone */}
            <div>
              <Label htmlFor="phone" className="text-gray-700">
                Phone Number
              </Label>
              <div className="flex">
                <select
                  name="countryCode"
                  value={form.countryCode}
                  onChange={handleChange}
                  className="p-2 rounded-l bg-gray-50 border border-gray-300 text-black focus:outline-none focus:ring-0 focus:border-green-500"
                >
                  {countryCodes.map((country) => (
                    <option key={country.code} value={country.code}>
                      {country.label} {country.code}
                    </option>
                  ))}
                </select>
                <div className="relative w-full">
                  <Phone className="absolute left-3 bottom-3 text-gray-400" size={16} />
                  <Input
                    id="phone"
                    type="tel"
                    name="phone"
                    value={form.phone}
                    onChange={handleChange}
                    required
                    className="pl-9 rounded-l-none bg-gray-50 border border-gray-300 text-black focus:outline-none focus:ring-0 focus:border-green-500"
                  />
                </div>
              </div>
            </div>

            {/* Role */}
            <div>
              <Label htmlFor="role" className="text-gray-700">
                Role
              </Label>
              <div className="relative">
                <Shield className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                <select
                  id="role"
                  name="role"
                  value={form.role}
                  onChange={handleChange}
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent text-black"
                  required
                >
                  <option value="customer">Customer</option>
                  <option value="staff">Staff</option>
                  <option value="technician">Technician</option>
                  <option value="warehouse_staff">Warehouse Staff</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
            </div>

            {/* Password */}
            <div className="relative">
              <Label htmlFor="password" className="text-black font-semibold">Password</Label>
              <Lock className="absolute left-3 bottom-3 text-gray-400" size={16} />
              <Input
                id="password"
                type="password"
                name="password"
                value={form.password}
                onChange={handleChange}
                required
                className="pl-9 bg-gray-50 border border-gray-300 text-black focus:outline-none focus:ring-0 focus:border-green-500"
              />
            </div>

            {/* Confirm Password */}
            <div className="relative">
              <Label htmlFor="confirmPassword" className="text-black font-semibold">Confirm Password</Label>
              <Lock className="absolute left-3 bottom-3 text-gray-400" size={16} />
              <Input
                id="confirmPassword"
                type="password"
                name="confirmPassword"
                value={form.confirmPassword}
                onChange={handleChange}
                required
                className="pl-9 bg-gray-50 border border-gray-300 text-black focus:outline-none focus:ring-0 focus:border-green-500"
              />
            </div>

            {/* Submit */}
            <Button 
              type="submit" 
              className="w-full bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-md transition duration-300"
              disabled={isLoading}
            >
              {isLoading ? 'Creating Account...' : 'Create Account'}
            </Button>

            <div className="text-center text-sm mt-3 text-gray-600">
              Already have an account?{' '}
              <button onClick={() => navigate('/')} className="text-green-600 hover:underline">
                Login here
              </button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default RegisterPage;
