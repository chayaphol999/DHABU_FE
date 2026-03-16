import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion';

// API
import * as api from './services/api';

// Shared Components
import { SidebarItem } from './components/layout/SidebarItem';
import { Modal } from './components/ui/Modal';
import { Input } from './components/ui/Input';
import { Receipt } from './features/receipts/Receipt';
import { SQLBox } from './components/ui/SQLBox';

// Features
import { Login } from './features/auth/Login';
import { Dashboard } from './features/dashboard/Dashboard';
import { TablesManagement } from './features/management/TablesManagement';
import { ManagementTable } from './features/management/ManagementTable';
import { LiveTableMap } from './components/TableMap';

// Hooks
import { useAuth } from './hooks/useAuth';
import { useToast } from './hooks/useToast';
import { useData } from './hooks/useData';

// Utils
import { pdfQueries } from './utils/queries';
import { useStore } from './store/useStore';

function App() {
  const { toasts, addToast } = useToast();
  const { activeTab, setActiveTab } = useStore();
  const { user, isLoggingIn, handleLogin, handleLogout } = useAuth(addToast);

  const {
    stats, tables, menu, staff, customers, receipts, loading,
    fetchData
  } = useData(user, activeTab);

  const [showCrudModal, setShowCrudModal] = useState(null);
  const [selectedTable, setSelectedTable] = useState(null);
  const [selectedItem, setSelectedItem] = useState(null);
  const [orderItems, setOrderItems] = useState([]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const onLogin = async (e) => {
    const initialTab = await handleLogin(e);
    if (initialTab) {
      setActiveTab(initialTab);
    }
  };

  const onTableClick = async (table) => {
    if (!table || !table.id) return;

    if (user.role === 'Customer') {
      if (table.status === 'Available') {
        if (confirm(`คุณต้องการจองโต๊ะ ${table.tableNo} ใช่ไหม?`)) {
          try {
            await api.updateTable(table.id, { status: 'Occupied', customerId: user.customerId });
            addToast(`จองโต๊ะ ${table.tableNo} เรียบร้อยแล้ว!`, 'success');
            fetchData();
          } catch (e) { addToast('จองโต๊ะผิดพลาด', 'error'); }
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
    if (!orderItems.length) return addToast('กรุณาเลือกอาหารก่อน', 'info');
    try {
      await api.createOrder({
        orderId: `ORD-${Date.now()}`,
        customerId: customers[0]?.customerId || 'C001',
        tableNo: selectedTable.tableNo,
        items: orderItems.map(i => ({ foodId: i.foodId, quantity: i.quantity }))
      });
      addToast('สั่งอาหารเรียบร้อยแล้ว!', 'success');
      fetchData();
      setShowCrudModal(null);
    } catch (e) { addToast('สั่งอาหารผิดพลาด', 'error'); }
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
      addToast('ชำระเงินสำเร็จแล้ว ขอบคุณที่ใช้บริการ! 🍲🙏', 'success');
      setSelectedTable(null);
      setOrderItems([]);
      fetchData();
    } catch (e) { addToast('ชำระเงินผิดพลาด', 'error'); }
  };

  return (
    <>
      {!user ? (
        <Login handleLogin={onLogin} isLoggingIn={isLoggingIn} pdfQueries={pdfQueries} />
      ) : (
        <div className="min-h-screen bg-shabu-bg flex font-sans text-slate-800 relative">
          {/* Mobile Sidebar Overlay */}
          <AnimatePresence>
            {isSidebarOpen && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setIsSidebarOpen(false)}
                className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[60] lg:hidden"
              />
            )}
          </AnimatePresence>

          <aside className={`
            fixed lg:static inset-y-0 left-0 w-72 bg-white flex flex-col pt-12 shrink-0 border-r border-slate-100/50 z-[70] transition-transform duration-300 ease-in-out
            ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
          `}>
            <div className="flex items-center justify-between px-10 mb-16">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-[#F26522] rounded-xl flex items-center justify-center text-xl shadow-lg shadow-orange-100 transform -rotate-6">🍲</div>
                <span className="text-xl font-black tracking-tighter">SHABU</span>
              </div>
              <button onClick={() => setIsSidebarOpen(false)} className="lg:hidden text-slate-400 p-2">✕</button>
            </div>

            <nav className="flex-grow space-y-1 overflow-y-auto">
              <p className="px-10 text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Core</p>
              <SidebarItem icon="🏠" label="Dashboard" active={activeTab === 'Dashboard'} onClick={() => { setActiveTab('Dashboard'); setIsSidebarOpen(false); }} hidden={user.role === 'Customer'} />
              <SidebarItem icon="🪑" label="จัดการโต๊ะ" active={activeTab === 'Tables'} onClick={() => { setActiveTab('Tables'); setIsSidebarOpen(false); }} hidden={user.role === 'Customer'} />
              <SidebarItem icon="🍱" label="จองโต๊ะออนไลน์" active={activeTab === 'Live Map'} onClick={() => { setActiveTab('Live Map'); setIsSidebarOpen(false); }} hidden={user.role !== 'Customer'} />

              <div className="pt-8 mb-4 px-10 border-t border-slate-50 mt-4 h-0" />
              <SidebarItem icon="🍜" label="รายการอาหาร" active={activeTab === 'Menu'} onClick={() => { setActiveTab('Menu'); setIsSidebarOpen(false); }} hidden={user.role !== 'Manager'} />
              <SidebarItem icon="🪑" label="ข้อมูลโต๊ะ" active={activeTab === 'TablesData'} onClick={() => { setActiveTab('TablesData'); setIsSidebarOpen(false); }} hidden={user.role !== 'Manager'} />
              <SidebarItem icon="👥" label="พนักงาน" active={activeTab === 'Staff'} onClick={() => { setActiveTab('Staff'); setIsSidebarOpen(false); }} hidden={user.role !== 'Manager'} />
              <SidebarItem icon="👤" label="ข้อมูลลูกค้า" active={activeTab === 'Customers'} onClick={() => { setActiveTab('Customers'); setIsSidebarOpen(false); }} hidden={user.role !== 'Manager'} />
              <SidebarItem icon="🧾" label="ใบเสร็จ" active={activeTab === 'Receipts'} onClick={() => { setActiveTab('Receipts'); setIsSidebarOpen(false); }} hidden={user.role === 'Customer'} />
            </nav>

            <div className="p-10">
              <div className="bg-slate-50 rounded-2xl p-4 mb-4 flex items-center gap-3 border border-slate-100">
                <div className="w-8 h-8 rounded-lg bg-shabu-orange text-white flex items-center justify-center font-bold text-xs">{user.name?.charAt(0)}</div>
                <div className="flex-grow overflow-hidden">
                  <p className="text-[11px] font-bold truncate leading-none">{user.name}</p>
                  <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">{user.role}</p>
                </div>
              </div>
              <button onClick={handleLogout} className="w-full text-center text-[11px] font-bold text-slate-400 hover:text-red-500 transition-colors uppercase tracking-widest cursor-pointer">← ออกจากระบบ</button>
            </div>
          </aside>

          <main className="flex-grow flex flex-col overflow-hidden h-screen relative">
            <header className="px-6 lg:px-12 py-10 flex justify-between items-end shrink-0 sticky top-0 bg-shabu-bg/80 backdrop-blur-md z-30">
              <div className="text-left flex items-center gap-4">
                <button onClick={() => setIsSidebarOpen(true)} className="lg:hidden p-2 -ml-2 bg-white rounded-xl shadow-sm border border-slate-100 p-2.5">
                  <div className="w-5 h-0.5 bg-slate-800 mb-1"></div>
                  <div className="w-5 h-0.5 bg-slate-800 mb-1"></div>
                  <div className="w-5 h-0.5 bg-slate-800"></div>
                </button>
                <div>
                  <h2 className="text-xl lg:text-2xl font-black text-slate-800 uppercase tracking-tight">{activeTab === 'Tables' ? 'การจัดการโต๊ะ' : activeTab}</h2>
                  <p className="text-[9px] lg:text-[11px] font-bold text-slate-400 uppercase tracking-widest mt-1">สวัสดี คุณ {user.name} 👋</p>
                </div>
              </div>
              <div className="text-[9px] lg:text-[11px] font-bold text-slate-400 bg-white px-4 py-2 rounded-full border border-slate-100 shadow-sm hidden sm:block">
                18 ม.ค. 2569
              </div>
            </header>

            <div className="px-6 lg:px-12 pb-24 flex-grow flex flex-col relative overflow-y-auto lg:overflow-hidden scrollbar-hide">
              <AnimatePresence mode="wait">
                {activeTab === 'Dashboard' && (
                  <Dashboard stats={stats} tables={tables} handleTableClick={onTableClick} pdfQueries={pdfQueries} />
                )}
                {activeTab === 'Tables' && (
                  <TablesManagement
                    tables={tables} selectedTable={selectedTable} handleTableClick={onTableClick}
                    orderItems={orderItems} finalizePayment={finalizePayment}
                    setShowCrudModal={setShowCrudModal} pdfQueries={pdfQueries}
                  />
                )}
                {activeTab === 'Live Map' && (
                  <motion.div
                    key="live-map"
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.98 }}
                    className="premium-card w-full h-[600px] overflow-hidden"
                  >
                    <LiveTableMap tables={tables} onTableClick={onTableClick} />
                  </motion.div>
                )}
                {['Menu', 'Staff', 'Customers', 'Receipts', 'TablesData'].includes(activeTab) && (
                  <ManagementTable
                    activeTab={activeTab} staff={staff} menu={menu} customers={customers}
                    receipts={receipts} tables={tables} setSelectedItem={setSelectedItem}
                    setShowCrudModal={setShowCrudModal} pdfQueries={pdfQueries}
                  />
                )}
              </AnimatePresence>

              {/* Student Credit */}
              <div className="mt-auto pt-8 pb-4 text-center">
                <p className="text-[10px] font-medium text-slate-300 uppercase tracking-widest opacity10">
                  นายชยพล อินแก้ว | รหัสนักศึกษา: 66143206002-7
                </p>
              </div>

              {/* Premium Loading Overlay */}
              <AnimatePresence>
                {loading && user && (
                  <motion.div
                    key="loading-bar"
                    initial={{ scaleX: 0, opacity: 0 }}
                    animate={{ scaleX: 1, opacity: 1 }}
                    exit={{ opacity: 0 }}
                    style={{ originX: 0 }}
                    transition={{ duration: 0.5, ease: "easeOut" }}
                    className="fixed top-0 left-0 right-0 h-1 bg-gradient-to-r from-shabu-orange via-orange-400 to-shabu-orange z-[100] shadow-[0_2px_10px_rgba(242,101,34,0.3)]"
                  >
                    <motion.div
                      animate={{ opacity: [0.4, 0.8, 0.4] }}
                      transition={{ repeat: Infinity, duration: 1.5 }}
                      className="w-full h-full bg-white/20 blur-sm"
                    />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </main>

          {/* Floating Action Button */}
          {['Menu', 'Staff', 'Customers', 'TablesData'].includes(activeTab) && user.role === 'Manager' && (
            <button onClick={() => { setSelectedItem(null); setShowCrudModal(activeTab === 'TablesData' ? 'Tables' : activeTab); }} className="fixed bottom-12 right-12 w-16 h-16 bg-shabu-orange text-white rounded-full shadow-2xl shadow-orange-200 flex items-center justify-center text-3xl font-bold hover:scale-110 active:scale-95 transition-all z-40">
              +
            </button>
          )}

          {/* CRUD & Detail Modals */}
          <Modal 
            title={showCrudModal === 'ReceiptDetail' ? 'ใบเสร็จรับเงิน' : `จัดการข้อมูล ${showCrudModal}`} 
            isOpen={!!showCrudModal && !showCrudModal.includes('Order')} 
            onClose={() => { setShowCrudModal(null); setSelectedItem(null); }}
            raw={showCrudModal === 'ReceiptDetail'}
          >
            {showCrudModal === 'ReceiptDetail' ? (
              <Receipt receipt={selectedItem} />
            ) : (
              <form onSubmit={async (e) => {
              e.preventDefault();
              const formData = new FormData(e.target);
              const data = Object.fromEntries(formData.entries());
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
                addToast(e.message || 'บันทึกข้อมูลไม่สำเร็จ', 'error');
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
                      if (confirm('คุณแน่ใจว่าต้องการลบข้อมูลนี้ใช่ไหม?')) {
                        try {
                          if (showCrudModal === 'Menu') await api.deleteFood(selectedItem.id);
                          else if (showCrudModal === 'Staff') await api.deleteEmployee(selectedItem.id);
                          else if (showCrudModal === 'Customers') await api.deleteCustomer(selectedItem.id);
                          else if (showCrudModal === 'Tables') await api.deleteTable(selectedItem.id);
                          fetchData();
                          setShowCrudModal(null);
                          setSelectedItem(null);
                        } catch (e) { addToast('ลบไม่สำเร็จ', 'error'); }
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
                {selectedItem && <div className="mt-4"><SQLBox query={pdfQueries[`${showCrudModal}_Delete`]} /></div>}
              </div>
            </form>
          )}
        </Modal>

          {/* Quick Order Modal */}
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
      )}

      {/* Toast Notifications */}
      <div className="fixed top-8 right-8 z-[200] flex flex-col gap-3 pointer-events-none">
        <AnimatePresence>
          {toasts.map(toast => (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, x: 50, scale: 0.8 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8, x: 20, transition: { duration: 0.2 } }}
              className={`pointer-events-auto px-8 py-4 rounded-3xl shadow-[0_40px_80px_-20px_rgba(0,0,0,0.15)] border border-white/50 backdrop-blur-xl flex items-center gap-4 min-w-[320px] ${toast.type === 'success' ? 'bg-shabu-orange/90 text-white shadow-orange-200/50' : toast.type === 'error' ? 'bg-red-500/90 text-white shadow-red-200/50' : 'bg-slate-800/90 text-white shadow-slate-200/50'}`}
            >
              <div className="text-2xl drop-shadow-md">{toast.type === 'success' ? '✅' : toast.type === 'error' ? '❌' : 'ℹ️'}</div>
              <div className="font-black tracking-tight text-sm drop-shadow-sm">{toast.message}</div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </>
  );
}

export default App;
