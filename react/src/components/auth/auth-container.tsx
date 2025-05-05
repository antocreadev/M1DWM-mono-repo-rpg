import React, { useState } from "react";
import Login from "./login";
import Register from "./register";

interface AuthContainerProps {
  onAuthSuccess: () => void;
}

export const AuthContainer: React.FC<AuthContainerProps> = ({
  onAuthSuccess,
}) => {
  const [showLogin, setShowLogin] = useState(true);

  const switchToLogin = () => setShowLogin(true);
  const switchToRegister = () => {
    console.log("switchToRegister appelé");
    setShowLogin(false);
    console.log("Nouvel état showLogin:", false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900 p-4">
      <div className="w-full max-w-md">
        {showLogin ? (
          <Login
            onLoginSuccess={onAuthSuccess}
            onRegisterClick={switchToRegister}
          />
        ) : (
          <Register
            onRegisterSuccess={switchToLogin}
            onLoginClick={switchToLogin}
          />
        )}
      </div>
    </div>
  );
};

export default AuthContainer;
