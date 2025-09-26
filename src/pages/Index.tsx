import { useState, useEffect } from "react";
import { TradingDashboard } from "@/components/TradingDashboard";
import { LoginForm } from "@/components/LoginForm";
import { User } from "@/types/trading";

const Index = () => {
  const [user, setUser] = useState<User>({ username: "", isAuthenticated: false });
  const [isPublicMode, setIsPublicMode] = useState(true);

  // Check for saved authentication state
  useEffect(() => {
    const savedAuth = localStorage.getItem("tradingAuth");
    if (savedAuth) {
      const authData = JSON.parse(savedAuth);
      setUser(authData);
      setIsPublicMode(false);
    }
  }, []);

  const handleLogin = (username: string) => {
    const authData = { username, isAuthenticated: true };
    setUser(authData);
    setIsPublicMode(false);
    localStorage.setItem("tradingAuth", JSON.stringify(authData));
  };

  const handleLogout = () => {
    setUser({ username: "", isAuthenticated: false });
    setIsPublicMode(true);
    localStorage.removeItem("tradingAuth");
  };

  const handleLoginRequest = () => {
    setIsPublicMode(false);
  };

  // Show login form only if not authenticated and trying to access private features
  if (!user.isAuthenticated && !isPublicMode) {
    return <LoginForm onLogin={handleLogin} />;
  }

  return (
    <TradingDashboard 
      user={user} 
      onLogout={handleLogout} 
      isPublicMode={isPublicMode}
      onLoginRequest={handleLoginRequest}
    />
  );
};

export default Index;
