import { motion } from 'framer-motion';
import { SQLBox } from '../../components/ui/SQLBox';

export const ManagementTable = ({ 
  activeTab, staff, menu, customers, receipts, tables, 
  setSelectedItem, setShowCrudModal, pdfQueries 
}) => {
  return (
    <motion.div 
      key={`data-table-${activeTab}`}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="premium-card !p-0 overflow-hidden text-left w-full flex flex-col h-[calc(100vh-250px)]"
    >
      <div className="overflow-auto flex-grow relative custom-scrollbar">
        <table className="w-full border-collapse">
          <thead className="bg-slate-50 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 sticky top-0 z-10 shadow-sm">
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
  )
}
