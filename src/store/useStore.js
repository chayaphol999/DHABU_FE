import { create } from 'zustand';

export const useStore = create((set) => ({
  user: JSON.parse(localStorage.getItem('shabu_user')) || null,
  activeTab: localStorage.getItem('shabu_active_tab') || 'Dashboard',
  
  setUser: (user) => {
    if (user) localStorage.setItem('shabu_user', JSON.stringify(user));
    else localStorage.removeItem('shabu_user');
    set({ user });
  },
  
  setActiveTab: (tab) => {
    localStorage.setItem('shabu_active_tab', tab);
    set({ activeTab: tab });
  },
}));
