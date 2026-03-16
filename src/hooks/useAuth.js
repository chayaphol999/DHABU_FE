import { useState } from 'react';
import * as api from '../services/api';

export const useAuth = (addToast) => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('shabu_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    const username = e.target.username.value;
    const password = e.target.password.value;

    setIsLoggingIn(true);
    try {
      const data = await api.login(username, password);
      if (data.success) {
        setUser(data.user);
        localStorage.setItem('shabu_user', JSON.stringify(data.user));
        
        const initialTab = data.user.role === 'Customer' ? 'Live Map' : 'Dashboard';
        return initialTab;
      } else {
        addToast(data.message || 'เข้าสู่ระบบไม่สำเร็จ', 'error');
      }
    } catch (e) {
      addToast(e.message, 'error');
    } finally {
      setIsLoggingIn(false);
    }
    return null;
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('shabu_user');
    localStorage.removeItem('shabu_active_tab');
  };

  return { user, isLoggingIn, handleLogin, handleLogout, setUser };
};
