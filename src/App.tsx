import { useState } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import NotFound from "./pages/NotFound";
import LoginPage from "./components/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import AdminDashboard from "./pages/AdminDashboard";
//import StaffDashboard from "./pages/StaffDashboard";
import CustomerDetails from "./components/CustomerDetails";

const queryClient = new QueryClient();

const App = () => {
  const [userRole, setUserRole] = useState<'customer' | 'admin' | 'staff' | null>(null);
  const [username, setUsername] = useState<string>("");

  const handleLogin = (role: 'customer' | 'admin' | 'staff', username: string) => {
    console.log("User logged in:", role, username);
    setUserRole(role);
    setUsername(username);
  };

  const handleLogout = () => {
    setUserRole(null);
    setUsername("");
  };

  const getHomeComponent = () => {
    switch (userRole) {
      case "admin":
        return <AdminDashboard username={username} userType={userRole} onLogout={handleLogout} />;
      // case "staff":
      //   return <StaffDashboard username={username} userType={userRole} onLogout={handleLogout} />;
      case "customer":
        return <CustomerDetails username={username} userType={userRole} onLogout={handleLogout} />;
      default:
        return <Navigate to="/login" replace />;
    }
  };

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Navigate to="/login" replace />} />
            <Route path="/login" element={<LoginPage onLogin={handleLogin} />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/home" element={getHomeComponent()} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
