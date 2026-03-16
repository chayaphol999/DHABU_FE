import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as api from '../services/api';

export const useData = (user, activeTab) => {
  const queryClient = useQueryClient();

  // Queries
  const statsQuery = useQuery({
    queryKey: ['stats'],
    queryFn: api.getStats,
    enabled: !!user && activeTab === 'Dashboard',
    staleTime: 30000,
  });

  const tablesQuery = useQuery({
    queryKey: ['tables'],
    queryFn: api.getTables,
    enabled: !!user && ['Dashboard', 'Tables', 'Live Map', 'TablesData'].includes(activeTab),
  });

  const menuQuery = useQuery({
    queryKey: ['menu'],
    queryFn: api.getMenu,
    enabled: !!user && ['Tables', 'Menu'].includes(activeTab),
  });

  const staffQuery = useQuery({
    queryKey: ['employees'],
    queryFn: api.getEmployees,
    enabled: !!user && activeTab === 'Staff',
  });

  const customersQuery = useQuery({
    queryKey: ['customers'],
    queryFn: api.getCustomers,
    enabled: !!user && activeTab === 'Customers',
  });

  const receiptsQuery = useQuery({
    queryKey: ['receipts'],
    queryFn: api.getReceipts,
    enabled: !!user && activeTab === 'Receipts',
  });

  // Data helpers
  const stats = statsQuery.data || { salesToday: 0, availableTables: 0, popularItems: [] };
  const tables = Array.isArray(tablesQuery.data) ? tablesQuery.data : [];
  const menu = Array.isArray(menuQuery.data) ? menuQuery.data : [];
  const staff = Array.isArray(staffQuery.data) ? staffQuery.data : [];
  const customers = Array.isArray(customersQuery.data) ? customersQuery.data : [];
  const receipts = Array.isArray(receiptsQuery.data) ? receiptsQuery.data : [];
  
  const loading = statsQuery.isLoading || tablesQuery.isLoading || menuQuery.isLoading || 
                  staffQuery.isLoading || customersQuery.isLoading || receiptsQuery.isLoading;

  const fetchData = async () => {
    // Invalidate queries relevant to the current tab
    const keysToInvalidate = {
      'Dashboard': ['stats', 'tables'],
      'Tables': ['tables', 'menu'],
      'Live Map': ['tables'],
      'TablesData': ['tables'],
      'Menu': ['menu'],
      'Staff': ['employees'],
      'Customers': ['customers'],
      'Receipts': ['receipts']
    };
    
    const keys = keysToInvalidate[activeTab] || [];
    keys.forEach(key => queryClient.invalidateQueries({ queryKey: [key] }));
  };

  return {
    stats, tables, menu, staff, customers, receipts, loading,
    fetchData,
    // We export some mutation-friendly setters just in case, but usually we'd use useMutation
    setTables: (newData) => queryClient.setQueryData(['tables'], newData),
    setMenu: (newData) => queryClient.setQueryData(['menu'], newData),
    setStaff: (newData) => queryClient.setQueryData(['employees'], newData),
    setCustomers: (newData) => queryClient.setQueryData(['customers'], newData),
    setLoading: () => {} // Managed by React Query
  };
};
