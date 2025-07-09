import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { User, Phone, Shield, Lock, Mail } from 'lucide-react'; // added Mail icon

const countryCodes = [
  { code: '+1', label: '🇺🇸' },
  { code: '+91', label: '🇮🇳' },
  { code: '+44', label: '🇬🇧' },
  { code: '+61', label: '🇦🇺' },
  { code: '+81', label: '🇯🇵' },
];

const RegisterPage = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '', // added email
    phone: '',
    countryCode: '+1',
    role: 'customer',
    password: '',
    confirmPassword: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (form.password !== form.confirmPassword) {
      alert('Passwords do not match');
      return;
    }

    const fullPhone = `${form.countryCode} ${form.phone}`;
    console.log('Registering:', { ...form, phone: fullPhone });
    navigate('/');
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
              <div className="relative">
                <Label htmlFor="firstName" className="text-black font-semibold">First Name</Label>
                <User className="absolute left-3 bottom-3 text-gray-400" size={16} />
                <Input
                  id="firstName"
                  name="firstName"
                  value={form.firstName}
                  onChange={handleChange}
                  required
                  className="pl-9 bg-gray-50 border border-gray-300 text-black focus:outline-none focus:ring-0 focus:border-green-500"
                />
              </div>
              <div className="relative">
                <Label htmlFor="lastName" className="text-black font-semibold">Last Name</Label>
                <User className="absolute left-3 bottom-3 text-gray-400" size={16} />
                <Input
                  id="lastName"
                  name="lastName"
                  value={form.lastName}
                  onChange={handleChange}
                  required
                  className="pl-9 bg-gray-50 border border-gray-300 text-black focus:outline-none focus:ring-0 focus:border-green-500"
                />
              </div>
            </div>

            {/* Email */}
            <div className="relative">
              <Label htmlFor="email" className="text-black font-semibold">Email</Label>
              <Mail className="absolute left-3 bottom-3 text-gray-400" size={16} />
              <Input
                id="email"
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                required
                className="pl-9 bg-gray-50 border border-gray-300 text-black focus:outline-none focus:ring-0 focus:border-green-500"
              />
            </div>

            {/* Phone */}
            <div>
              <Label htmlFor="phone" className="text-black font-semibold">Phone Number</Label>
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
              <Label htmlFor="role" className="text-black font-semibold">Select Role</Label>
              <div className="relative">
                <Shield className="absolute left-3 bottom-3 text-gray-400" size={16} />
                <select
                  id="role"
                  name="role"
                  value={form.role}
                  onChange={handleChange}
                  className="w-full pl-9 p-2 rounded bg-gray-50 border border-gray-300 text-black focus:outline-none focus:ring-0 focus:border-green-500"
                >
                  <option value="customer">Customer</option>
                  <option value="admin">Admin</option>
                  <option value="staff">Staff</option>
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
            <Button type="submit" className="w-full bg-green-100 hover:bg-green-200 text-green-700 font-semibold">
              Register
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
