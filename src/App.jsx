import { useState, useEffect } from 'react'
import { LiveTableMap } from './components/TableMap';
import * as api from './services/api';
import { motion, AnimatePresence } from 'framer-motion';

// --- Shared Components ---
const SidebarItem = ({ icon, label, active, onClick, hidden }) => {
  if (hidden) return null;
  return (
    <motion.button
      whileHover={{ x: 4 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      style={active ? { backgroundColor: '#F26522', boxShadow: '0 20px 25px -5px rgba(242, 101, 34, 0.2)' } : {}}
      className={`w-full flex items-center gap-4 px-8 py-4 cursor-pointer relative transition-colors ${active ? 'rounded-r-full mr-4' : 'hover:bg-orange-50'}`}
    >
      <span
        style={active ? { color: '#ffffff' } : { color: '#64748b' }}
        className="text-xl flex-shrink-0"
      >
        {icon}
      </span>
      <span
        style={active ? { color: '#ffffff', opacity: 1, visibility: 'visible' } : { color: '#64748b' }}
        className={`font-bold text-sm whitespace-nowrap ${active ? 'text-white' : ''}`}
      >
        {label}
      </span>
      {active && <div className="ml-auto w-1.5 h-6 bg-white rounded-full flex-shrink-0"></div>}
    </motion.button>
  )
}

const Modal = ({ title, isOpen, onClose, children }) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-md z-50 flex items-center justify-center p-4"
        >
          <motion.div 
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="bg-white rounded-[2rem] shadow-2xl w-full max-w-2xl overflow-hidden"
          >
            <div className="px-8 py-6 border-b border-slate-100 flex justify-between items-center">
              <h3 className="text-xl font-bold text-slate-800">{title}</h3>
              <button onClick={onClose} className="text-slate-400 hover:text-slate-600 font-bold transition-transform hover:scale-125">✕</button>
            </div>
            <div className="p-8 max-h-[70vh] overflow-auto">
              {children}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

const Input = ({ label, ...props }) => (
  <div className="space-y-1.5 flex-1">
    <label className="text-[11px] font-bold text-slate-400 ml-1 uppercase tracking-wider">{label}</label>
    <input
      {...props}
      className="input-field"
    />
  </div>
)

const SQLBox = ({ query }) => {
  if (!query) return null;
  return (
    <div className="sql-box pt-8 mt-4 border-t border-slate-100/50">
      <div className="mb-2 flex items-center gap-2">
        <div className="w-1.5 h-1.5 bg-shabu-orange rounded-full"></div>
        <span className="uppercase tracking-[0.2em] text-[9px] font-black text-slate-400">Database Query</span>
      </div>
      <code className="whitespace-pre-wrap break-words leading-relaxed text-slate-500">
        {query}
      </code>
    </div>
  )
}

function App() {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('shabu_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [activeTab, setActiveTabState] = useState(() => {
    return localStorage.getItem('shabu_active_tab') || 'Dashboard';
  });

  const setActiveTab = (tab) => {
    setActiveTabState(tab);
    localStorage.setItem('shabu_active_tab', tab);
  };
  const [stats, setStats] = useState({ salesToday: 0, availableTables: 0, popularItems: [] });
  const [tables, setTables] = useState([]);
  const [menu, setMenu] = useState([]);
  const [staff, setStaff] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [receipts, setReceipts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  const [showCrudModal, setShowCrudModal] = useState(null);
  const [selectedTable, setSelectedTable] = useState(null);
  const [selectedItem, setSelectedItem] = useState(null);
  const [orderItems, setOrderItems] = useState([]);

  // Exact SQL Queries from PDF & Requirements
  const pdfQueries = {
    'Dashboard_Sales': 'SELECT SUM(จำนวนเงินรวม) AS ยอดขายรวมวันนี้\nFROM ใบเสร็จ\nWHERE DATE(วันที่ออกใบเสร็จ) = CURDATE();',
    'Dashboard_Tables': 'SELECT COUNT(*) AS โต๊ะที่ว่าง\nFROM โต๊ะ\nWHERE รหัสลูกค้า IS NULL;',
    'Dashboard_Popular': 'SELECT ชื่อเมนู, SUM(จำนวน) AS ยอดขาย\nFROM สั่งซื้อ\nJOIN รายการอาหาร ON สั่งซื้อ.รหัสเมนูอาหาร = รายการอาหาร.รหัสเมนูอาหาร\nGROUP BY ชื่อเมนู\nORDER BY ยอดขาย DESC\nLIMIT 3;',
    'Ordering': 'SELECT ชื่อเมนู, จำนวน, (จำนวน * ราคา) AS ราคารวม\nFROM สั่งซื้อ\nJOIN รายการอาหาร ON สั่งซื้อ.รหัสเมนูอาหาร = รายการอาหาร.รหัสเมนูอาหาร\nWHERE เลขที่โต๊ะ = ?;',
    'Live Map': 'SELECT * FROM โต๊ะ;',
    'Menu': 'SELECT รหัสเมนูอาหาร, ชื่อเมนู, ประเภทเมนู, ขนาด, ราคา\nFROM รายการอาหาร;',
    'Staff': 'SELECT รหัสพนักงาน, ชื่อพนักงาน, ตำแหน่ง, เงินเดือน, ที่อยู่\nFROM พนักงาน;',
    'Customers': 'SELECT รหัสลูกค้า, ชื่อ, เบอร์\nFROM ลูกค้า;',
    'Receipts': 'SELECT รหัสใบเสร็จ, วันที่ออกใบเสร็จ, รหัสลูกค้า, จำนวนเงินรวม\nFROM ใบเสร็จ\nORDER BY วันที่ออกใบเสร็จ DESC;',
    'Login': 'SELECT รหัสพนักงาน, ชื่อพนักงาน, ตำแหน่ง\nFROM พนักงาน\nWHERE รหัสพนักงาน = ? AND รหัสผ่าน = ?;',
    
    // CRUD - Menu
    'Menu_Insert': 'INSERT INTO รายการอาหาร (รหัสเมนูอาหาร, ชื่อเมนู, ประเภทเมนู, ขนาด, ราคา, image) \nVALUES (?, ?, ?, ?, ?, ?);',
    'Menu_Update': 'UPDATE รายการอาหาร \nSET ชื่อเมนู = ?, ประเภทเมนู = ?, ขนาด = ?, ราคา = ?, image = ? \nWHERE รหัสเมนูอาหาร = ?;',
    'Menu_Delete': 'DELETE FROM รายการอาหาร WHERE รหัสเมนูอาหาร = ?;',

    // CRUD - Staff
    'Staff_Insert': 'INSERT INTO พนักงาน (รหัสพนักงาน, ชื่อพนักงาน, ตำแหน่ง, เงินเดือน, ที่อยู่) \nVALUES (?, ?, ?, ?, ?);',
    'Staff_Update': 'UPDATE พนักงาน \nSET ชื่อพนักงาน = ?, ตำแหน่ง = ?, เงินเดือน = ?, ที่อยู่ = ? \nWHERE รหัสพนักงาน = ?;',
    'Staff_Delete': 'DELETE FROM พนักงาน WHERE รหัสพนักงาน = ?;',

    // CRUD - Customers
    'Customers_Insert': 'INSERT INTO ลูกค้า (รหัสลูกค้า, ชื่อ, เบอร์, รหัสผ่าน) \nVALUES (?, ?, ?, ?);',
    'Customers_Update': 'UPDATE ลูกค้า \nSET ชื่อ = ?, เบอร์ = ?, รหัสผ่าน = ? \nWHERE รหัสลูกค้า = ?;',
    'Customers_Delete': 'DELETE FROM ลูกค้า WHERE รหัสลูกค้า = ?;',

    // CRUD - Tables
    'Tables_Insert': 'INSERT INTO โต๊ะ (เลขที่โต๊ะ, ขนาดโต๊ะ) \nVALUES (?, ?);',
    'Tables_Update': 'UPDATE โต๊ะ \nSET ขนาดโต๊ะ = ? \nWHERE เลขที่โต๊ะ = ?;',

    // Transactions - Orders
    'Order_Insert': 'INSERT INTO ใบสั่งซื้อ (รหัสใบสั่งซื้อ, รหัสลูกค้า, เลขที่โต๊ะ, จำนวนรวม) \nVALUES (?, ?, ?, ?);',
    'OrderItem_Insert': 'INSERT INTO รายการสั่งซื้อ (รหัสใบสั่งซื้อ, รหัสเมนูอาหาร, จำนวน) \nVALUES (?, ?, ?);',
    'Table_Occupy': 'UPDATE โต๊ะ SET รหัสลูกค้า = ?, สถานะ = \'Occupied\' \nWHERE เลขที่โต๊ะ = ?;',

    // Transactions - Payments
    'Receipt_Insert': 'INSERT INTO ใบเสร็จ (รหัสใบเสร็จ, จำนวนเงินรวม, รหัสลูกค้า, รหัสพนักงาน, วันที่ออกใบเสร็จ) \nVALUES (?, ?, ?, ?, NOW());',
    'Table_Release': 'UPDATE โต๊ะ SET รหัสลูกค้า = NULL, สถานะ = \'Available\' \nWHERE เลขที่โต๊ะ = ?;'
  };

  useEffect(() => {
    if (user) { fetchData(); }
  }, [user, activeTab]);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Map tabs to their respective data requirements
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
          const tablesData = await api.getTables();
          setTables(Array.isArray(tablesData) ? tablesData : []);
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

      // Execute specific fetcher
      if (tabDataMap[activeTab]) {
        await tabDataMap[activeTab]();
      }

      // Maintain selected table state if needed without extra call if already fetched
      if (selectedTable && (activeTab === 'Tables' || activeTab === 'Dashboard' || activeTab === 'TablesData' || activeTab === 'Live Map')) {
        // Tables were already updated in the state by the specific fetchers above
        // We just need to find the updated object in the current 'tables' state (which will be updated after re-render)
        // or we can just rely on the next render if it's not critical to have it updated in the SAME function call.
        // For consistency, let's just make sure we don't do an EXTRA FETCH.
      }

    } catch (e) {
      console.error("Fetch Error:", e);
    } finally {
      setLoading(false);
    }
  };

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
        setActiveTab(initialTab);
      } else alert(data.message || 'เข้าสู่ระบบไม่สำเร็จค่ะ');
    } catch (e) { alert(e.message); }
    finally { setIsLoggingIn(false); }
  };

  const handleTableClick = async (table) => {
    if (!table || !table.id) return;

    if (user.role === 'Customer') {
      if (table.status === 'Available') {
        if (confirm(`คุณต้องการจองโต๊ะ ${table.tableNo} ใช่ไหมคะ?`)) {
          try {
            await api.updateTable(table.id, { status: 'Occupied', customerId: user.customerId });
            fetchData();
          } catch (e) { alert('จองโต๊ะผิดพลาดค่ะ'); }
        }
      }
      return;
    }

    setSelectedTable(table);
    if (activeTab !== 'Tables') setActiveTab('Tables');
    if (table.status !== 'Available') {
      try {
        const data = await api.getActiveOrder(table.tableNo);
        setOrderItems(data?.items?.map(i => ({ ...i.food, quantity: i.quantity })) || []);
      } catch (e) { setOrderItems([]); }
    } else {
      setOrderItems([]);
    }
  };

  const submitOrder = async () => {
    if (!orderItems.length) return alert('กรุณาเลือกอาหารก่อนค่ะ');
    try {
      await api.createOrder({
        orderId: `ORD-${Date.now()}`,
        customerId: customers[0]?.customerId || 'C001',
        tableNo: selectedTable.tableNo,
        items: orderItems.map(i => ({ foodId: i.foodId, quantity: i.quantity }))
      });
      fetchData();
      setShowCrudModal(null);
    } catch (e) { alert('สั่งอาหารผิดพลาดค่ะ'); }
  };

  const finalizePayment = async () => {
    const total = orderItems.reduce((sum, i) => sum + (i.price * i.quantity), 0);
    try {
      await api.createReceipt({
        receiptId: `REC-${Date.now()}`, totalAmount: total,
        customerId: selectedTable.customerId || 'C001',
        employeeId: user.employeeId || 'admin',
        tableNo: selectedTable.tableNo
      });
      setSelectedTable(null);
      setOrderItems([]);
      fetchData();
    } catch (e) { alert('ชำระเงินผิดพลาดค่ะ'); }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-shabu-bg flex items-center justify-center p-6 font-sans relative overflow-hidden">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 z-0">
          <motion.div 
            animate={{ 
              scale: [1, 1.2, 1],
              rotate: [0, 90, 180, 270, 360],
              opacity: [0.03, 0.05, 0.03] 
            }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            className="absolute -top-24 -left-24 w-96 h-96 bg-shabu-orange rounded-full blur-[100px]"
          />
          <motion.div 
            animate={{ 
              scale: [1, 1.5, 1],
              opacity: [0.02, 0.04, 0.02] 
            }}
            transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
            className="absolute -bottom-48 -right-48 w-[30rem] h-[30rem] bg-orange-400 rounded-full blur-[120px]"
          />
        </div>

        {/* Unified Premium Loader for Login */}
        <AnimatePresence>
          {isLoggingIn && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, transition: { duration: 0.4 } }}
              className="fixed inset-0 bg-shabu-bg/40 backdrop-blur-xl z-[100] flex items-center justify-center"
            >
              <motion.div 
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 1.1, opacity: 0 }}
                className="text-center p-16 rounded-[4rem] bg-white/80 shadow-2xl border border-white flex flex-col items-center"
              >
                <div className="relative mb-8">
                  <motion.div 
                    animate={{ y: [0, -15, 0], rotate: [0, 5, -5, 0] }}
                    transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
                    className="text-6xl"
                  >
                    🍲
                  </motion.div>
                  <motion.div 
                    animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.6, 0.3] }}
                    transition={{ repeat: Infinity, duration: 2 }}
                    className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-12 h-3 bg-slate-200/50 rounded-full blur-md"
                  />
                </div>
                <h3 className="font-black text-slate-800 text-lg uppercase tracking-[0.2em] mb-2">Anya is checking...</h3>
                <div className="flex gap-1">
                  {[0,1,2].map(i => (
                    <motion.div 
                      key={i} 
                      animate={{ opacity: [0.3, 1, 0.3] }} 
                      transition={{ repeat: Infinity, duration: 1, delay: i*0.2 }}
                      className="w-2 h-2 bg-shabu-orange rounded-full" 
                    />
                  ))}
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
        
        {/* Staggered Login Card */}
        <motion.div 
          initial={{ y: 60, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
          className="bg-white/70 backdrop-blur-2xl w-full max-w-md p-14 rounded-[4rem] shadow-[0_32px_80px_-20px_rgba(0,0,0,0.08)] border border-white flex flex-col items-center relative z-10"
        >
          <motion.div 
            initial={{ scale: 0, rotate: -45 }}
            animate={{ scale: 1, rotate: 12 }}
            transition={{ delay: 0.4, type: "spring", stiffness: 200, damping: 15 }}
            whileHover={{ rotate: 0, scale: 1.1 }}
            className="w-24 h-24 bg-shabu-orange rounded-3xl shadow-2xl shadow-orange-200 flex items-center justify-center text-4xl mb-8 cursor-pointer"
          >
            🍲
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="text-center"
          >
            <h1 className="text-4xl font-black text-slate-800 mb-2 uppercase tracking-tighter italic">SHABU PRO</h1>
            <p className="text-slate-400 font-bold text-[11px] mb-12 uppercase tracking-[0.3em]">ยินดีต้อนรับเข้าสู่ประสบการณ์พิเศษ</p>
          </motion.div>

          <form className="w-full space-y-8" onSubmit={handleLogin}>
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.8 }}>
              <Input label="USERNAME" name="username" required disabled={isLoggingIn} />
            </motion.div>
            
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.9 }}>
              <Input label="PASSWORD" name="password" type="password" required disabled={isLoggingIn} />
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1 }}>
              <motion.button 
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                disabled={isLoggingIn} 
                className="btn-primary w-full text-lg py-5 mt-4 shadow-[0_20px_40px_-10px_rgba(242,101,34,0.3)] hover:shadow-[0_25px_50px_-12px_rgba(242,101,34,0.4)] transition-all flex items-center justify-center gap-3"
              >
                <span>เข้าสู่ระบบ</span>
                <span className="text-xl">→</span>
              </motion.button>
            </motion.div>
          </form>

          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.2 }}
            className="w-full mt-14 pt-8 border-t border-slate-100/50"
          >
            <SQLBox query={pdfQueries['Login'].replace('?', "'admin'").replace('?', "'1234'")} />
          </motion.div>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-shabu-bg flex font-sans text-slate-800">
      <aside className="w-72 bg-white flex flex-col pt-12 shrink-0 border-r border-slate-100/50">
        <div className="flex items-center gap-3 mb-16 px-10">
          <div className="w-10 h-10 bg-[#F26522] rounded-xl flex items-center justify-center text-xl shadow-lg shadow-orange-100 transform -rotate-6">🍲</div>
          <span className="text-xl font-black tracking-tighter">SHABU</span>
        </div>

        <nav className="flex-grow space-y-1">
          <p className="px-10 text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Core</p>
          <SidebarItem icon="🏠" label="Dashboard" active={activeTab === 'Dashboard'} onClick={() => setActiveTab('Dashboard')} hidden={user.role === 'Customer'} />
          <SidebarItem icon="🪑" label="จัดการโต๊ะ" active={activeTab === 'Tables'} onClick={() => setActiveTab('Tables')} hidden={user.role === 'Customer'} />
          <SidebarItem icon="🍱" label="จองโต๊ะออนไลน์" active={activeTab === 'Live Map'} onClick={() => setActiveTab('Live Map')} hidden={user.role !== 'Customer'} />

          <div className="pt-8 mb-4 px-10 border-t border-slate-50 mt-4 h-0" />
          <SidebarItem icon="🍜" label="รายการอาหาร" active={activeTab === 'Menu'} onClick={() => setActiveTab('Menu')} hidden={user.role !== 'Manager'} />
          <SidebarItem icon="🪑" label="ข้อมูลโต๊ะ" active={activeTab === 'TablesData'} onClick={() => setActiveTab('TablesData')} hidden={user.role !== 'Manager'} />
          <SidebarItem icon="👥" label="พนักงาน" active={activeTab === 'Staff'} onClick={() => setActiveTab('Staff')} hidden={user.role !== 'Manager'} />
          <SidebarItem icon="👤" label="ข้อมูลลูกค้า" active={activeTab === 'Customers'} onClick={() => setActiveTab('Customers')} hidden={user.role !== 'Manager'} />
          <SidebarItem icon="🧾" label="ใบเสร็จ" active={activeTab === 'Receipts'} onClick={() => setActiveTab('Receipts')} hidden={user.role === 'Customer'} />
        </nav>

        <div className="p-10">
          <div className="bg-slate-50 rounded-2xl p-4 mb-4 flex items-center gap-3 border border-slate-100">
            <div className="w-8 h-8 rounded-lg bg-shabu-orange text-white flex items-center justify-center font-bold text-xs">{user.name?.charAt(0)}</div>
            <div className="flex-grow overflow-hidden">
              <p className="text-[11px] font-bold truncate leading-none">{user.name}</p>
              <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">{user.role}</p>
            </div>
          </div>
          <button onClick={() => {
            setUser(null);
            localStorage.removeItem('shabu_user');
            localStorage.removeItem('shabu_active_tab');
          }} className="w-full text-center text-[11px] font-bold text-slate-400 hover:text-red-500 transition-colors uppercase tracking-widest cursor-pointer">← ออกจากระบบ</button>
        </div>
      </aside>

      <main className="flex-grow flex flex-col overflow-auto h-screen relative">
        <header className="px-12 py-10 flex justify-between items-end shrink-0 sticky top-0 bg-shabu-bg/80 backdrop-blur-md z-30">
          <div className="text-left">
            <h2 className="text-2xl font-black text-slate-800 uppercase tracking-tight">{activeTab === 'Tables' ? 'การจัดการโต๊ะ' : activeTab}</h2>
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mt-1">สวัสดีค่ะ คุณ {user.name} 👋</p>
          </div>
          <div className="text-[11px] font-bold text-slate-400 bg-white px-4 py-2 rounded-full border border-slate-100 shadow-sm">
            18 ม.ค. 2569
          </div>
        </header>

        <div className="px-12 pb-24 flex-grow flex flex-col relative">
          <AnimatePresence mode="wait">
            {activeTab === 'Dashboard' && (
                  <motion.div 
                    key="dashboard"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.3, ease: "circOut" }}
                    className="space-y-12 text-left w-full"
                  >
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <motion.div 
                        whileHover={{ y: -8 }}
                        transition={{ type: "spring", damping: 15 }}
                        className="premium-card"
                      >
                        <div className="flex justify-between items-start mb-6">
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">ยอดขายวันนี้</p>
                          <span className="text-green-500 text-xs">📈</span>
                        </div>
                        <p className="text-4xl font-black text-slate-800">฿{(stats.salesToday || 0).toLocaleString()}</p>
                        <SQLBox query={pdfQueries['Dashboard_Sales']} />
                      </motion.div>
                      <motion.div 
                        whileHover={{ y: -8 }}
                        transition={{ type: "spring", damping: 15 }}
                        className="premium-card"
                      >
                        <div className="flex justify-between items-start mb-6">
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">โต๊ะที่ว่าง</p>
                          <span className="text-blue-500 text-xs">🪑</span>
                        </div>
                        <p className="text-4xl font-black text-slate-800">{stats.availableTables}</p>
                        <SQLBox query={pdfQueries['Dashboard_Tables']} />
                      </motion.div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                      <motion.div 
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.2 }}
                        className="lg:col-span-2 premium-card"
                      >
                        <h3 className="font-bold text-slate-800 mb-8 uppercase tracking-widest text-xs flex items-center gap-2">
                          <span className="w-2 h-2 bg-shabu-orange rounded-full"></span> แผนผังโต๊ะล่าสุด (Live Table Map)
                        </h3>
                        <div className="grid grid-cols-4 gap-4">
                          {tables.map((t, idx) => (
                            <motion.button 
                              initial={{ opacity: 0, scale: 0.8 }}
                              animate={{ opacity: 1, scale: 1 }}
                              transition={{ delay: 0.1 + (idx * 0.05) }}
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              key={t.id} 
                              onClick={() => handleTableClick(t)} 
                              className={`p-6 rounded-2xl border-2 transition-all flex flex-col items-center gap-2 group ${t.status === 'Available' ? 'bg-green-50/50 border-green-100' : 'bg-red-50/50 border-red-100 opacity-60'}`}
                            >
                              <p className="text-sm font-black text-slate-800">โต๊ะ {t.tableNo}</p>
                              <p className="text-[9px] font-bold text-slate-400 uppercase">ความจุ {t.capacity} ท่าน</p>
                              <div className={`mt-2 w-full h-1.5 rounded-full ${t.status === 'Available' ? 'bg-green-500' : 'bg-red-500'}`} />
                            </motion.button>
                          ))}
                        </div>
                        <SQLBox query={pdfQueries['Live Map']} />
                      </motion.div>
                      <motion.div 
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.2 }}
                        className="premium-card"
                      >
                        <h3 className="font-bold text-slate-800 mb-8 uppercase tracking-widest text-xs">เมนูมาแรงที่สุด</h3>
                        <div className="space-y-6">
                          {stats.popularItems.slice(0, 3).map((m, idx) => (
                            <div key={idx} className="flex flex-col gap-2">
                              <div className="flex justify-between items-center text-[11px] font-bold">
                                <span className="text-slate-800">🍜 {m.name}</span>
                                <span className="text-slate-400">{m.count} จาน</span>
                              </div>
                              <div className="w-full h-2 bg-slate-50 rounded-full overflow-hidden">
                                <motion.div 
                                  initial={{ width: 0 }}
                                  animate={{ width: `${(m.count / (stats.popularItems[0]?.count || 1)) * 100}%` }}
                                  transition={{ duration: 1, ease: "circOut" }}
                                  className="h-full bg-shabu-orange"
                                ></motion.div>
                              </div>
                            </div>
                          ))}
                        </div>
                        <SQLBox query={pdfQueries['Dashboard_Popular']} />
                      </motion.div>
                    </div>
                  </motion.div>
                )}

                {activeTab === 'Tables' && (
                  <motion.div 
                    key="tables-management"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.3, ease: "circOut" }}
                    className="grid grid-cols-1 lg:grid-cols-5 gap-10 items-start text-left w-full"
                  >
                    <div className="lg:col-span-3 premium-card">
                      <div className="flex justify-between items-center mb-10 pb-6 border-b border-slate-50">
                        <h3 className="font-bold text-slate-800 uppercase tracking-widest text-xs">ผังโต๊ะและการจัดการ</h3>
                        <div className="flex gap-6">
                          <div className="flex items-center gap-2 text-[9px] font-bold text-slate-400 uppercase">
                            <div className="w-2 h-2 bg-green-500 rounded-full"></div> ว่าง
                          </div>
                          <div className="flex items-center gap-2 text-[9px] font-bold text-slate-400 uppercase">
                            <div className="w-2 h-2 bg-red-500 rounded-full"></div> ไม่ว่าง
                          </div>
                        </div>
                      </div>
                      <div className="grid grid-cols-4 gap-4">
                        {tables.map((t, idx) => (
                          <motion.button 
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: idx * 0.03 }}
                            whileHover={{ y: -5 }}
                            whileTap={{ scale: 0.95 }}
                            key={t.id} 
                            onClick={() => handleTableClick(t)} 
                            className={`p-6 rounded-2xl border-2 transition-all flex flex-col items-center gap-2 group ${t.id === selectedTable?.id ? 'border-shabu-orange ring-4 ring-orange-50 bg-white' : (t.status === 'Available' ? 'bg-white border-slate-100' : 'bg-red-50/50 border-red-50 opacity-60')}`}
                          >
                            <p className="text-sm font-black text-slate-800">โต๊ะ {t.tableNo}</p>
                            <p className="text-[9px] font-bold text-slate-400 uppercase">ความจุ {t.capacity} ท่าน</p>
                            <div className={`mt-2 w-full h-1.5 rounded-full ${t.status === 'Available' ? 'bg-green-500' : 'bg-red-500'}`} />
                          </motion.button>
                        ))}
                      </div>
                      <SQLBox query={pdfQueries['Live Map']} />
                    </div>

                    <div className="lg:col-span-2 space-y-6">
                      {selectedTable ? (
                        <motion.div 
                          key={`order-${selectedTable.id}`}
                          initial={{ opacity: 0, x: 20 }}
                          animate={{ opacity: 1, x: 0 }}
                          className="premium-card !p-8 border-l-4 border-shabu-orange"
                        >
                          <div className="flex justify-between items-center mb-8">
                            <div>
                              <h3 className="text-2xl font-black text-slate-800">โต๊ะ: {selectedTable.tableNo}</h3>
                              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">เริ่มเปิดโต๊ะ: 12:30 น.</p>
                            </div>
                            <div className="text-right">
                              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">เวลาที่เหลือ</p>
                              <p className="text-2xl font-black text-shabu-orange tabular-nums tracking-tighter">1:15:30</p>
                            </div>
                          </div>

                          <div className="space-y-4 mb-10 max-h-[400px] overflow-auto pr-2">
                            <p className="text-[10px] font-bold text-slate-300 uppercase tracking-[0.2em] mb-4">รายการล่าสุด</p>
                            <AnimatePresence>
                              {orderItems.map((i, idx) => (
                                <motion.div 
                                  initial={{ opacity: 0, x: -10 }}
                                  animate={{ opacity: 1, x: 0 }}
                                  key={idx} 
                                  className="flex justify-between items-center py-2 group"
                                >
                                  <div className="flex items-center gap-3">
                                    <span className="font-bold text-[10px] text-slate-400">{i.quantity}x</span>
                                    <span className="font-bold text-slate-700 text-sm">{i.name}</span>
                                  </div>
                                  <span className="font-bold text-slate-800 tabular-nums text-sm">฿{(i.price * i.quantity).toLocaleString()}</span>
                                </motion.div>
                              ))}
                            </AnimatePresence>
                            {orderItems.length === 0 && <div className="py-12 text-center text-slate-300 italic text-xs">ยังไม่มีออเดอร์</div>}
                          </div>

                          <div className="space-y-4 pt-6 border-t border-slate-50">
                            <div className="flex justify-between items-center mb-6">
                              <span className="text-xs font-bold text-slate-400">ราคาสุทธิ</span>
                              <span className="text-3xl font-black text-shabu-orange">฿{orderItems.reduce((sum, i) => sum + (i.price * i.quantity), 0).toLocaleString()}</span>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                              <motion.button whileTap={{ scale: 0.95 }} onClick={() => setShowCrudModal('OrderModal')} className="py-4 bg-slate-100 text-slate-600 rounded-xl font-bold text-[11px] uppercase tracking-widest hover:bg-slate-200 transition-all">✚ สั่งอาหาร</motion.button>
                              <motion.button whileTap={{ scale: 0.95 }} onClick={() => alert("ฟีเจอร์ย้ายโต๊ะยังไม่พร้อมใช้งานค่ะ")} className="py-4 bg-slate-100 text-slate-600 rounded-xl font-bold text-[11px] uppercase tracking-widest hover:bg-slate-200 transition-all">⇄ ย้ายโต๊ะ</motion.button>
                            </div>
                            <motion.button 
                              whileHover={{ scale: 1.02 }}
                              whileTap={{ scale: 0.98 }}
                              onClick={finalizePayment} 
                              className="w-full py-5 bg-shabu-orange text-white rounded-xl font-bold text-[13px] uppercase tracking-[0.2em] shadow-lg bg-[#E65100] hover:opacity-90 transition-all mt-4"
                            >
                              🧾 เช็คบิล ({orderItems.reduce((sum, i) => sum + (i.price * i.quantity), 0).toLocaleString()})
                            </motion.button>
                          </div>
                          <div className="mt-8 space-y-4">
                            <SQLBox query={pdfQueries['Ordering'].replace('?', `'${selectedTable.tableNo}'`)} />
                            <SQLBox query={pdfQueries['Receipt_Insert']} />
                            <SQLBox query={pdfQueries['Table_Release']} />
                          </div>
                        </motion.div>
                      ) : (
                        <motion.div 
                          key="no-table-selected"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="premium-card py-32 flex flex-col items-center justify-center border-dashed border-2 border-slate-200 opacity-60"
                        >
                          <span className="text-4xl grayscale mb-6">🪑</span>
                          <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">เลือกโต๊ะเพื่อจัดการออเดอร์</p>
                        </motion.div>
                      )}
                    </div>
                  </motion.div>
                )}

                {activeTab === 'Live Map' && (
                  <motion.div
                    key="live-map"
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.98 }}
                    className="premium-card w-full h-[600px] overflow-hidden"
                  >
                    <LiveTableMap tables={tables} onTableClick={handleTableClick} />
                  </motion.div>
                )}

                {['Menu', 'Staff', 'Customers', 'Receipts', 'TablesData'].includes(activeTab) && (
                  <motion.div 
                    key={`data-table-${activeTab}`}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="premium-card !p-0 overflow-hidden text-left w-full"
                  >
                    <div className="overflow-x-auto">
                      <table className="w-full border-collapse">
                        <thead className="bg-slate-50 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
                          <tr>
                            {activeTab === 'Staff' && (
                              <>
                                <th className="px-8 py-6">ID / ชื่อพนักงาน</th>
                                <th className="px-8 py-6">ตำแหน่ง</th>
                                <th className="px-8 py-6">เงินเดือน</th>
                                <th className="px-8 py-6">ที่อยู่</th>
                                <th className="px-8 py-6 text-right">Actions</th>
                              </>
                            )}
                            {activeTab === 'TablesData' && (
                              <>
                                <th className="px-8 py-6">ID / เลขที่โต๊ะ</th>
                                <th className="px-8 py-6">ความจุ (ที่นั่ง)</th>
                                <th className="px-8 py-6">สถานะปัจจุบัน</th>
                                <th className="px-8 py-6 text-right">Actions</th>
                              </>
                            )}
                            {activeTab === 'Menu' && (
                              <>
                                <th className="px-8 py-6">ID / เมนู</th>
                                <th className="px-8 py-6">ประเภท</th>
                                <th className="px-8 py-6 text-center">ขนาด</th>
                                <th className="px-8 py-6 text-center">ราคา</th>
                                <th className="px-8 py-6 text-right">Actions</th>
                              </>
                            )}
                            {activeTab === 'Customers' && (
                              <>
                                <th className="px-8 py-6">รหัสลูกค้า</th>
                                <th className="px-8 py-6">ชื่อลูกค้า</th>
                                <th className="px-8 py-6 text-center">เบอร์โทร</th>
                                <th className="px-8 py-6 text-right">Actions</th>
                              </>
                            )}
                            {activeTab === 'Receipts' && (
                              <>
                                <th className="px-8 py-6">รหัสใบเสร็จ</th>
                                <th className="px-8 py-6 text-center">วันที่ออก</th>
                                <th className="px-8 py-6 text-center">รหัสลูกค้า</th>
                                <th className="px-8 py-6 text-right">ยอดรวม</th>
                              </>
                            )}
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50 text-sm">
                          {activeTab === 'Staff' && staff.map((s, idx) => (
                            <motion.tr 
                              initial={{ opacity: 0, x: -10 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: idx * 0.02 }}
                              key={s.id} 
                              className="hover:bg-slate-50/50 transition-colors"
                            >
                              <td className="px-8 py-6">
                                <div className="flex items-center gap-3">
                                  <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-400 text-[10px]">{s.name?.charAt(0)}</div>
                                  <div>
                                    <p className="font-bold text-slate-800">{s.name}</p>
                                    <p className="text-[9px] text-slate-400 font-bold uppercase">{s.employeeId}</p>
                                  </div>
                                </div>
                              </td>
                              <td className="px-8 py-6"><span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase ${s.position === 'Manager' ? 'bg-orange-100 text-shabu-orange' : 'bg-slate-100 text-slate-500'}`}>{s.position}</span></td>
                              <td className="px-8 py-6 font-bold tabular-nums">฿{s.salary?.toLocaleString()}</td>
                              <td className="px-8 py-6 text-slate-400 text-xs w-64 truncate">{s.address}</td>
                              <td className="px-8 py-6 text-right">
                                <button onClick={() => { setSelectedItem(s); setShowCrudModal('Staff'); }} className="p-2 text-slate-300 hover:text-shabu-orange transition-colors">✎</button>
                              </td>
                            </motion.tr>
                          ))}
                          {activeTab === 'Menu' && menu.map((m, idx) => (
                            <motion.tr 
                              initial={{ opacity: 0, x: -10 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: idx * 0.02 }}
                              key={m.id} 
                              className="hover:bg-slate-50/50 transition-colors"
                            >
                              <td className="px-8 py-6">
                                <div className="flex items-center gap-3">
                                  <div className="w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center text-lg">🍜</div>
                                  <div>
                                    <p className="font-bold text-slate-800">{m.name}</p>
                                    <p className="text-[9px] text-slate-400 font-bold uppercase">{m.foodId}</p>
                                  </div>
                                </div>
                              </td>
                              <td className="px-8 py-6 text-xs text-slate-400 font-bold">{m.category}</td>
                              <td className="px-8 py-6 text-center text-xs text-slate-400">{m.size}</td>
                              <td className="px-8 py-6 text-center font-bold text-shabu-orange">฿{m.price?.toLocaleString()}</td>
                              <td className="px-8 py-6 text-right">
                                <button onClick={() => { setSelectedItem(m); setShowCrudModal('Menu'); }} className="p-2 text-slate-300 hover:text-shabu-orange transition-colors">✎</button>
                              </td>
                            </motion.tr>
                          ))}
                          {activeTab === 'Customers' && customers.map((c, idx) => (
                            <motion.tr 
                              initial={{ opacity: 0, x: -10 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: idx * 0.02 }}
                              key={c.id} 
                              className="hover:bg-slate-50/50 transition-colors"
                            >
                              <td className="px-8 py-6 font-bold text-[11px] text-shabu-orange">{c.customerId}</td>
                              <td className="px-8 py-6 font-bold text-slate-800">{c.name}</td>
                              <td className="px-8 py-6 text-center font-bold text-slate-400 tabular-nums">{c.phone}</td>
                              <td className="px-8 py-6 text-right">
                                <button onClick={() => { setSelectedItem(c); setShowCrudModal('Customers'); }} className="p-2 text-slate-300 hover:text-shabu-orange transition-colors">✎</button>
                              </td>
                            </motion.tr>
                          ))}
                          {activeTab === 'Receipts' && receipts.map((r, idx) => (
                            <motion.tr 
                              initial={{ opacity: 0, x: -10 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: idx * 0.02 }}
                              key={r.id} 
                              className="hover:bg-slate-50/50 transition-colors"
                            >
                              <td className="px-8 py-6 font-bold text-[11px] text-shabu-orange">{r.receiptId}</td>
                              <td className="px-8 py-6 text-center text-xs font-bold text-slate-400">{r.issueDate ? new Date(r.issueDate).toLocaleDateString() : '-'}</td>
                              <td className="px-8 py-6 text-center font-bold text-slate-700 text-xs">{r.customerId}</td>
                              <td className="px-8 py-6 text-right font-black text-slate-800">฿{(r.totalAmount || 0).toLocaleString()}</td>
                            </motion.tr>
                          ))}
                          {activeTab === 'TablesData' && tables.map((t, idx) => (
                            <motion.tr 
                              initial={{ opacity: 0, x: -10 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: idx * 0.02 }}
                              key={t.id} 
                              className="hover:bg-slate-50/50 transition-colors"
                            >
                              <td className="px-8 py-6">
                                <div className="flex items-center gap-3">
                                  <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center font-black text-slate-600">t</div>
                                  <p className="font-bold text-slate-800">โต๊ะ {t.tableNo}</p>
                                </div>
                              </td>
                              <td className="px-8 py-6 font-bold text-slate-400">{t.capacity} ท่าน</td>
                              <td className="px-8 py-6">
                                <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase ${t.status === 'Available' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>{t.status}</span>
                              </td>
                              <td className="px-8 py-6 text-right">
                                <button onClick={() => { setSelectedItem(t); setShowCrudModal('Tables'); }} className="p-2 text-slate-300 hover:text-shabu-orange transition-colors">✎</button>
                              </td>
                            </motion.tr>
                          ))}
                        </tbody>
                      </table>
                      <div className="p-10">
                        <SQLBox query={pdfQueries[activeTab === 'TablesData' ? 'Live Map' : activeTab]} />
                      </div>
                    </div>
                  </motion.div>
                )}
          </AnimatePresence>

          {/* Premium Loading Overlay */}
          <AnimatePresence>
            {loading && (
              <motion.div 
                key="loading-overlay"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0, transition: { duration: 0.4, ease: "easeInOut" } }}
                className="fixed inset-0 md:left-72 flex items-center justify-center bg-shabu-bg/40 backdrop-blur-md z-[100]"
              >
                <motion.div 
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 1.1, opacity: 0 }}
                  className="text-center p-16 rounded-[4rem] bg-white/80 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.1)] border border-white flex flex-col items-center"
                >
                  <div className="relative mb-8">
                    <motion.div 
                      animate={{ 
                        y: [0, -15, 0],
                        rotate: [0, 5, -5, 0]
                      }}
                      transition={{ 
                        repeat: Infinity, 
                        duration: 2,
                        ease: "easeInOut" 
                      }}
                      className="text-6xl filter drop-shadow-lg"
                    >
                      🍲
                    </motion.div>
                    <motion.div 
                      animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.6, 0.3] }}
                      transition={{ repeat: Infinity, duration: 2 }}
                      className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-12 h-3 bg-slate-200/50 rounded-full blur-md"
                    />
                  </div>
                  <h3 className="font-black text-slate-800 text-lg uppercase tracking-[0.2em] mb-2">Anya is working</h3>
                  <div className="flex gap-1">
                    {[0, 1, 2].map(i => (
                      <motion.div
                        key={i}
                        animate={{ opacity: [0.3, 1, 0.3] }}
                        transition={{ repeat: Infinity, duration: 1, delay: i * 0.2 }}
                        className="w-1.5 h-1.5 bg-shabu-orange rounded-full"
                      />
                    ))}
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>

      {/* Adding Add New Buttons in Context */}
      {['Menu', 'Staff', 'Customers', 'TablesData'].includes(activeTab) && user.role === 'Manager' && (
        <button onClick={() => { setSelectedItem(null); setShowCrudModal(activeTab === 'TablesData' ? 'Tables' : activeTab); }} className="fixed bottom-12 right-12 w-16 h-16 bg-shabu-orange text-white rounded-full shadow-2xl shadow-orange-200 flex items-center justify-center text-3xl font-bold hover:scale-110 active:scale-95 transition-all z-40">
          +
        </button>
      )}

      {/* --- CRUD MODALS --- */}
      <Modal title={`จัดการข้อมูล ${showCrudModal}`} isOpen={!!showCrudModal && !showCrudModal.includes('Order')} onClose={() => { setShowCrudModal(null); setSelectedItem(null); }}>
        <form onSubmit={async (e) => {
          e.preventDefault();
          const formData = new FormData(e.target);
          const data = Object.fromEntries(formData.entries());
          let endpoint = '';
          if (showCrudModal === 'Menu') endpoint = '/food-items';
          else if (showCrudModal === 'Staff') endpoint = '/employees';
          else if (showCrudModal === 'Customers') endpoint = '/customers';
          else if (showCrudModal === 'Tables') endpoint = '/tables';

          try {
            if (selectedItem) {
              if (showCrudModal === 'Menu') await api.updateFood(selectedItem.id, data);
              else if (showCrudModal === 'Staff') await api.updateEmployee(selectedItem.id, data);
              else if (showCrudModal === 'Customers') await api.updateCustomer(selectedItem.id, data);
              else if (showCrudModal === 'Tables') await api.updateTable(selectedItem.id, data);
            } else {
              if (showCrudModal === 'Menu') await api.createFood(data);
              else if (showCrudModal === 'Staff') await api.createEmployee(data);
              else if (showCrudModal === 'Customers') await api.createCustomer(data);
              else if (showCrudModal === 'Tables') await api.createTable(data);
            }
            fetchData();
            setShowCrudModal(null);
            setSelectedItem(null);
          } catch (e) {
            alert(e.message || 'บันทึกข้อมูลไม่สำเร็จค่ะ');
          }
        }} className="space-y-8 text-left">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {showCrudModal === 'Menu' && (
              <>
                <Input label="รหัสเมนูอาหาร" name="foodId" defaultValue={selectedItem?.foodId} required />
                <Input label="ชื่อเมนู" name="name" defaultValue={selectedItem?.name} required />
                <Input label="ประเภทเมนู" name="category" defaultValue={selectedItem?.category} required />
                <Input label="ขนาด" name="size" defaultValue={selectedItem?.size} required />
                <Input label="ราคา" name="price" type="number" step="0.01" defaultValue={selectedItem?.price} required />
                <Input label="รูป (URL)" name="image" defaultValue={selectedItem?.image} />
              </>
            )}
            {showCrudModal === 'Staff' && (
              <>
                <Input label="รหัสพนักงาน" name="employeeId" defaultValue={selectedItem?.employeeId} required />
                <Input label="ชื่อพนักงาน" name="name" defaultValue={selectedItem?.name} required />
                <Input label="ตำแหน่ง" name="position" defaultValue={selectedItem?.position} required />
                <Input label="เงินเดือน" name="salary" type="number" step="0.1" defaultValue={selectedItem?.salary} required />
                <div className="md:col-span-2">
                  <Input label="ที่อยู่" name="address" defaultValue={selectedItem?.address} required />
                </div>
              </>
            )}
            {showCrudModal === 'Customers' && (
              <>
                <Input label="รหัสลูกค้า" name="customerId" defaultValue={selectedItem?.customerId} required />
                <Input label="ชื่อ" name="name" defaultValue={selectedItem?.name} required />
                <Input label="เบอร์" name="phone" defaultValue={selectedItem?.phone} required />
                <Input label="รหัสผ่าน" name="password" type="password" defaultValue={selectedItem?.password} />
              </>
            )}
            {showCrudModal === 'Tables' && (
              <>
                <Input label="เลขที่โต๊ะ" name="tableNo" defaultValue={selectedItem?.tableNo} required />
                <Input label="ขนาดโต๊ะ (จำนวนที่นั่ง)" name="capacity" type="number" defaultValue={selectedItem?.capacity} required />
              </>
            )}
          </div>
          <div className="flex gap-4">
            {selectedItem && (
              <button
                type="button"
                onClick={async () => {
                  if (confirm('คุณแน่ใจว่าต้องการลบข้อมูลนี้ใช่ไหมคะ?')) {
                    let endpoint = '';
                    if (showCrudModal === 'Menu') endpoint = '/food-items';
                    else if (showCrudModal === 'Staff') endpoint = '/employees';
                    else if (showCrudModal === 'Customers') endpoint = '/customers';
                    
                    try {
                      if (showCrudModal === 'Menu') await api.deleteFood(selectedItem.id);
                      else if (showCrudModal === 'Staff') await api.deleteEmployee(selectedItem.id);
                      else if (showCrudModal === 'Customers') await api.deleteCustomer(selectedItem.id);
                      else if (showCrudModal === 'Tables') await api.deleteTable(selectedItem.id);
                      
                      fetchData();
                      setShowCrudModal(null);
                      setSelectedItem(null);
                    } catch (e) { alert('ลบไม่สำเร็จค่ะ'); }
                  }
                }}
                className="flex-1 py-4 bg-red-50 text-red-500 rounded-2xl font-bold text-sm hover:bg-red-100 transition-all uppercase tracking-widest"
              >
                ลบข้อมูล
              </button>
            )}
            <button className="flex-[2] btn-primary text-lg shadow-xl shadow-orange-100">
              {selectedItem ? 'อัปเดตข้อมูล' : 'บันทึกข้อมูล'}
            </button>
          </div>
          
          <div className="pt-8 mt-8 border-t border-slate-100">
            <SQLBox query={selectedItem ? pdfQueries[`${showCrudModal}_Update`] : pdfQueries[`${showCrudModal}_Insert`]} />
            {selectedItem && (
               <div className="mt-4">
                 <SQLBox query={pdfQueries[`${showCrudModal}_Delete`]} />
               </div>
            )}
          </div>
        </form>
      </Modal>

      {/* --- QUICK ORDER MODAL --- */}
      <Modal title={`สั่งอาหาร - โต๊ะ ${selectedTable?.tableNo}`} isOpen={showCrudModal === 'OrderModal'} onClose={() => setShowCrudModal(null)}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[500px] overflow-auto pb-6">
          {menu.map(m => (
            <button key={m.id} onClick={() => {
              const existing = orderItems.find(o => o.foodId === m.foodId);
              if (existing) setOrderItems(orderItems.map(o => o.foodId === m.foodId ? { ...o, quantity: o.quantity + 1 } : o));
              else setOrderItems([...orderItems, { ...m, quantity: 1 }]);
            }} className="flex items-center justify-between p-5 bg-slate-50 rounded-2xl hover:bg-white border-2 border-transparent hover:border-shabu-orange transition-all text-left">
              <div>
                <p className="font-bold text-slate-800 text-sm">{m.name}</p>
                <p className="text-xs font-bold text-shabu-orange">฿{m.price}</p>
              </div>
              <span className="text-slate-300 font-bold">+</span>
            </button>
          ))}
        </div>
        <div className="mt-6 space-y-4">
           <SQLBox query={pdfQueries['Order_Insert']} />
           <SQLBox query={pdfQueries['OrderItem_Insert']} />
           <SQLBox query={pdfQueries['Table_Occupy']} />
        </div>
        <button onClick={submitOrder} className="btn-primary w-full mt-8 shadow-lg shadow-orange-100">ยืนยันการสั่งซื้อ</button>
      </Modal>
    </div>
  )
}

export default App
