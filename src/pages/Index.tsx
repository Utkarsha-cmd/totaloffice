
import React, { useState } from 'react';
import LoginPage from '@/components/LoginPage';
import CustomerDetails from '@/components/CustomerDetails';

const Index = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentUser, setCurrentUser] = useState<{
    username: string;
    userType: 'customer' | 'admin' | 'staff';
  } | null>(null);

  const handleLogin = (userType: 'customer' | 'admin' | 'staff', username: string) => {
    setCurrentUser({ username, userType });
    setIsLoggedIn(true);
    console.log(`User logged in: ${username} as ${userType}`);
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setIsLoggedIn(false);
    console.log('User logged out');
  };

  if (!isLoggedIn || !currentUser) {
    return <LoginPage onLogin={handleLogin} />;
  }

  return (
    <CustomerDetails 
      username={currentUser.username}
      userType={currentUser.userType}
      onLogout={handleLogout}
    />
  );
};

export default Index;
