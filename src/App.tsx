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
import CustomerHistoryPage from "./pages/CustomerHistoryPage";
import TechnicianDashboard from "./components/TechnicianDasboard";
import SalesDashboard from "./components/SalesDashboard"; 

const queryClient = new QueryClient();


const App = () => {
  const [userRole, setUserRole] = useState<'customer' | 'admin' | 'staff' | 'technician' | 'warehouse_staff' | 'sales' | null>(
    () => {
      const savedRole = localStorage.getItem('userRole');
      return savedRole as 'customer' | 'admin' | 'staff' | 'technician' | 'warehouse_staff' | 'sales' | null;
    }
  );
  const [username, setUsername] = useState<string>(
    () => localStorage.getItem('username') || ''
  );

  const handleLogin = (role: 'customer' | 'admin' | 'staff' | 'technician' | 'warehouse_staff' | 'sales', username: string) => {
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
      // Convert 'warehouse' to 'warehouse_staff' for backward compatibility
      const role = savedRole === 'warehouse' ? 'warehouse_staff' : savedRole;
      setUserRole(role as any);
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
         return (
    <TechnicianDashboard
      username={username}
      userType={userRole}
      onLogout={handleLogout}
    />
  );
      case "warehouse_staff":
        return (
          <WarehouseDashboard
            username={username}
            userType={userRole}
            onLogout={handleLogout}
          />
        );
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

            {/* Admin */}
            <Route path="/admin" element={
              <ProtectedRoute>
                {userRole === 'admin' ? <AdminDashboard username={username} userType={userRole} onLogout={handleLogout} /> : <Navigate to="/login" replace />}
              </ProtectedRoute>
            } />

            {/* Staff */}
            <Route path="/staff" element={
              <ProtectedRoute>
                {userRole === 'staff' ? <StaffDashboard username={username} userType="staff" onLogout={handleLogout} /> : <Navigate to="/login" replace />}
              </ProtectedRoute>
            } />

            {/* Customer */}
            <Route path="/customer" element={
              <ProtectedRoute>
                {userRole === 'customer' ? <CustomerDetails username={username} userType={userRole} onLogout={handleLogout} /> : <Navigate to="/login" replace />}
              </ProtectedRoute>
            } />

            {/* Technician */}
            <Route path="/technician" element={
              <ProtectedRoute>
                {userRole === 'technician' ? <TechnicianDashboard username={username} userType={userRole} onLogout={handleLogout} /> : <Navigate to="/login" replace />}
              </ProtectedRoute>
            } />

            {/* Warehouse */}
            <Route path="/warehouse_staff" element={
              <ProtectedRoute>
                {userRole === 'warehouse_staff' ? <WarehouseDashboard username={username} userType={userRole} onLogout={handleLogout} /> : <Navigate to="/login" replace />}
              </ProtectedRoute>
            } />

            {/* Sales */}
            <Route path="/sales" element={
              <ProtectedRoute>
                {userRole === 'sales' ? <SalesDashboard username={username} userType={userRole} onLogout={handleLogout} /> : <Navigate to="/login" replace />}
              </ProtectedRoute>
            } />

            {/* Customer history */}
            <Route path="/customer-history/:customerId" element={
              <ProtectedRoute>
                {userRole === 'admin' || userRole === 'staff' ? <CustomerHistoryPage /> : <Navigate to="/login" replace />}
              </ProtectedRoute>
            } />

            {/* Default */}
            <Route path="/" element={
              isLoading ? <div>Loading...</div> : userRole ? <Navigate to={`/${userRole}`} replace /> : <Navigate to="/login" replace />
            } />
            
            
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
