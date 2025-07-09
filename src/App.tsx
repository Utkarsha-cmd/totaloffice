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
import StaffDashboard from "./pages/StaffDashboard";
import CustomerDetails from "./components/CustomerDetails";

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
  const [userRole, setUserRole] = useState<'customer' | 'admin' | 'staff' | 'technician' | null>(null);
  const [username, setUsername] = useState<string>("");

  const handleLogin = (role: 'customer' | 'admin' | 'staff' | 'technician', username: string) => {
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
      case "staff":
        return (
          <StaffDashboard
            username={username}
            userType="staff"
            onLogout={handleLogout}
            customers={dummyCustomers}
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
