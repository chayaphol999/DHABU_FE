import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    let message = error.response?.data?.message || error.message || 'เชื่อมต่อ Server ไม่ได้ค่ะ';
    
    // Translation Map
    const translations = {
      'Invalid credentials': 'รหัสผ่านไม่ถูกต้องค่ะ',
      'User not found': 'ไม่พบผู้ใช้งานในระบบค่ะ',
      'Network Error': 'การเชื่อมต่ออินเทอร์เน็ตมีปัญหาค่ะ'
    };

    message = translations[message] || message;
    return Promise.reject(new Error(message));
  }
);

// --- Auth ---
export const login = (username, password) => api.post('/auth/login', { username, password });

// --- Dashboard ---
export const getStats = () => api.get('/dashboard/stats');

// --- Tables ---
export const getTables = () => api.get('/tables');
export const createTable = (data) => api.post('/tables', data);
export const updateTable = (id, data) => api.put(`/tables/${id}`, data);
export const deleteTable = (id) => api.delete(`/tables/${id}`);

// --- Menu (Food Items) ---
export const getMenu = () => api.get('/food-items');
export const createFood = (data) => api.post('/food-items', data);
export const updateFood = (id, data) => api.put(`/food-items/${id}`, data);
export const deleteFood = (id) => api.delete(`/food-items/${id}`);

// --- Employees (Staff) ---
export const getEmployees = () => api.get('/employees');
export const createEmployee = (data) => api.post('/employees', data);
export const updateEmployee = (id, data) => api.put(`/employees/${id}`, data);
export const deleteEmployee = (id) => api.delete(`/employees/${id}`);

// --- Customers ---
export const getCustomers = () => api.get('/customers');
export const createCustomer = (data) => api.post('/customers', data);
export const updateCustomer = (id, data) => api.put(`/customers/${id}`, data);
export const deleteCustomer = (id) => api.delete(`/customers/${id}`);

// --- Orders ---
export const getActiveOrder = (tableNo) => api.get(`/orders/active/${tableNo}`);
export const createOrder = (data) => api.post('/orders', data);

// --- Receipts ---
export const getReceipts = () => api.get('/receipts');
export const createReceipt = (data) => api.post('/receipts', data);

export default api;
