import React, { useState, useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import NotFound from "./pages/NotFound";
import LoginPage from "./components/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import AdminDashboard from "./pages/AdminDashboard";
import StaffDashboard from "./pages/StaffDashboard";
import CustomerDetails from "./components/CustomerDetails";
import WarehouseDashboard from "./components/warehouse";  


const queryClient = new QueryClient();

// Dummy data for staff dashboard
const dummyCustomers = [
  {
    name: "Alice Johnson",
    company: "GreenTech Ltd.",
    duration: "12 months",
    services: {
      current: ["Web Hosting", "Email Services"],
      past: ["Domain Registration"],
    },
    contact: "alice.johnson@greentech.com",
    billingAddress: "1234 Elm Street, Springfield",
    paymentInfo: "Visa **** 4242",
  },
  {
    name: "Bob Smith",
    company: "BlueOcean Corp.",
    duration: "6 months",
    services: {
      current: ["Cloud Storage"],
      past: ["Data Migration"],
    },
    contact: "bob.smith@blueocean.com",
    billingAddress: "5678 Oak Avenue, Metropolis",
    paymentInfo: "Mastercard **** 5678",
  },
];

const App = () => {
  // Initialize state from localStorage if available
  const [userRole, setUserRole] = useState<'customer' | 'admin' | 'staff' | 'technician' | 'warehouse' | null>(
    () => {
      const savedRole = localStorage.getItem('userRole');
      return savedRole as 'customer' | 'admin' | 'staff' | 'technician' | 'warehouse' | null;
    }
  );
  const [username, setUsername] = useState<string>(
    () => localStorage.getItem('username') || ''
  );

  const handleLogin = (role: 'customer' | 'admin' | 'staff' | 'technician'| 'warehouse', username: string) => {
    console.log("User logged in:", role, username);
    // Save to state and localStorage
    setUserRole(role);
    setUsername(username);
    localStorage.setItem('userRole', role);
    localStorage.setItem('username', username);
  };

  const handleLogout = () => {
    setUserRole(null);
    setUsername("");
    localStorage.removeItem('userRole');
    localStorage.removeItem('username');
  };

  // Add a loading state to prevent premature redirects
  const [isLoading, setIsLoading] = useState(true);
  
  // Check for saved auth state on initial load
  useEffect(() => {
    const savedRole = localStorage.getItem('userRole');
    const savedUsername = localStorage.getItem('username');
    
    if (savedRole && savedUsername) {
      setUserRole(savedRole as any);
      setUsername(savedUsername);
    }
    setIsLoading(false);
  }, []);
  
  const getHomeComponent = () => {
    console.log('getHomeComponent - userRole:', userRole, 'username:', username);
    
    // Show loading state while checking auth
    if (isLoading) {
      return <div>Loading...</div>;
    }
    
    // If we're not logged in, redirect to login
    if (!userRole) {
      console.log('No user role, redirecting to login');
      return <Navigate to="/login" replace />;
    }
    
    console.log(`Rendering dashboard for role: ${userRole}`);
    switch (userRole) {
      case "admin":
        return <AdminDashboard username={username} userType={userRole} onLogout={handleLogout} />;
      case "staff":
        return (
          <StaffDashboard
            username={username}
            userType="staff"
            onLogout={handleLogout}
          />
        );
      case "customer":
        return <CustomerDetails username={username} userType={userRole} onLogout={handleLogout} />;
      case "technician":
        return <div className="p-6 text-xl font-medium text-green-700">Technician dashboard coming soon...</div>;
      default:
        return <Navigate to="/login" replace />;
    }
  };

  console.log('App render - userRole:', userRole, 'username:', username);
  
  // Log route rendering for debugging
  React.useEffect(() => {
    console.log('Rendering routes with userRole:', userRole);
  }, [userRole]);
  
  // Add a protected route component
  const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
    if (isLoading) {
      return <div>Loading...</div>;
    }
    
    if (!userRole) {
      return <Navigate to="/login" replace />;
    }
    
    return <>{children}</>;
  };

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            {/* <Route path="/login" element={
              userRole ? <Navigate to="/admin" replace /> : <LoginPage onLogin={handleLogin} />
            } /> */}
            <Route path="/login" element={
  userRole ? <Navigate to={`/${userRole}`} replace /> : <LoginPage onLogin={handleLogin} />
} />
            <Route path="/register" element={<RegisterPage />} />
            
            {/* Protected routes */}
            <Route path="/admin" element={
              <ProtectedRoute>
                {userRole === 'admin' ? (
                  <AdminDashboard username={username} userType={userRole} onLogout={handleLogout} />
                ) : (
                  <Navigate to="/login" replace />
                )}
              </ProtectedRoute>
            } />
            
            <Route path="/staff" element={
              <ProtectedRoute>
                {userRole === 'staff' ? (
                  <StaffDashboard
                    username={username}
                    userType="staff"
                    onLogout={handleLogout}
                  />
                ) : (
                  <Navigate to="/login" replace />
                )}
              </ProtectedRoute>
            } />
            
            <Route path="/customer" element={
              <ProtectedRoute>
                {userRole === 'customer' ? (
                  <CustomerDetails username={username} userType={userRole} onLogout={handleLogout} />
                ) : (
                  <Navigate to="/login" replace />
                )}
              </ProtectedRoute>
            } />
            <Route path="/warehouse" element={
  <ProtectedRoute>
    {userRole === 'warehouse' ? (
      <WarehouseDashboard
        username={username}
        userType={userRole}
        onLogout={handleLogout}
      />
    ) : (
      <Navigate to="/login" replace />
    )}
  </ProtectedRoute>
} />
            
            <Route path="/" element={
              isLoading ? (
                <div>Loading...</div>
              ) : userRole ? (
                <Navigate to={`/${userRole}`} replace />
              ) : (
                <Navigate to="/login" replace />
              )
            } />
            
            
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
