import React, { useState } from 'react';
import Login from '../components/Auth/Login';
import Signup from '../components/Auth/Signup';

const AuthPage = () => {
  const [isLogin, setIsLogin] = useState(true);

  const toggleMode = () => {
    setIsLogin(!isLogin);
  };

  return isLogin ? (
    <Login onToggleMode={toggleMode} />
  ) : (
    <Signup onToggleMode={toggleMode} />
  );
};

export default AuthPage;