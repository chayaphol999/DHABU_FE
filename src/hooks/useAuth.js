import { useState } from 'react';
import * as api from '../services/api';
import { useStore } from '../store/useStore';

export const useAuth = (addToast) => {
  const { user, setUser } = useStore();
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
  };

  return { user, isLoggingIn, handleLogin, handleLogout, setUser };
};
