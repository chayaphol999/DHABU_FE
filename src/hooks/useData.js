import { useState, useCallback } from 'react';
import * as api from '../services/api';

export const useData = (user, activeTab) => {
  const [stats, setStats] = useState({ salesToday: 0, availableTables: 0, popularItems: [] });
  const [tables, setTables] = useState([]);
  const [menu, setMenu] = useState([]);
  const [staff, setStaff] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [receipts, setReceipts] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchData = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const tabDataMap = {
        'Dashboard': async () => {
          const [statsData, tablesData] = await Promise.all([api.getStats(), api.getTables()]);
          setStats({
            salesToday: statsData.salesToday || 0,
            availableTables: statsData.availableTables || 0,
            popularItems: statsData.popularItems || []
          });
          setTables(Array.isArray(tablesData) ? tablesData : []);
        },
        'Tables': async () => {
          const [tablesData, menuData] = await Promise.all([api.getTables(), api.getMenu()]);
          setTables(Array.isArray(tablesData) ? tablesData : []);
          setMenu(Array.isArray(menuData) ? menuData : []);
        },
        'Live Map': async () => {
          const tablesData = await api.getTables();
          setTables(Array.isArray(tablesData) ? tablesData : []);
        },
        'TablesData': async () => {
          const tablesData = await api.getTables();
          setTables(Array.isArray(tablesData) ? tablesData : []);
        },
        'Menu': async () => {
          const menuData = await api.getMenu();
          setMenu(Array.isArray(menuData) ? menuData : []);
        },
        'Staff': async () => {
          const staffData = await api.getEmployees();
          setStaff(Array.isArray(staffData) ? staffData : []);
        },
        'Customers': async () => {
          const customersData = await api.getCustomers();
          setCustomers(Array.isArray(customersData) ? customersData : []);
        },
        'Receipts': async () => {
          const receiptsData = await api.getReceipts();
          setReceipts(Array.isArray(receiptsData) ? receiptsData : []);
        }
      };

      if (tabDataMap[activeTab]) {
        await tabDataMap[activeTab]();
      }
    } catch (e) {
      console.error("Fetch Error:", e);
    } finally {
      setLoading(false);
    }
  }, [user, activeTab]);

  return {
    stats, tables, menu, staff, customers, receipts, loading,
    fetchData, setTables, setMenu, setStaff, setCustomers, setLoading
  };
};
