import { SQLBox } from '../components/ui/SQLBox';
import { pdfQueries } from '../utils/queries';

export const TableManagement = ({ 
  tables, 
  selectedTable, 
  orderItems, 
  onTableClick, 
  onOpenOrderModal, 
  onFinalizePayment 
}) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-5 gap-10 items-start text-left animate-in fade-in duration-500">
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
          {tables.map(t => (
            <button key={t.id} onClick={() => onTableClick(t)} className={`p-6 rounded-2xl border-2 transition-all flex flex-col items-center gap-2 group ${t.id === selectedTable?.id ? 'border-shabu-orange ring-4 ring-orange-50 bg-white' : (t.status === 'Available' ? 'bg-white border-slate-100' : 'bg-red-50/50 border-red-50 opacity-60')}`}>
              <p className="text-sm font-black text-slate-800">โต๊ะ {t.tableNo}</p>
              <p className="text-[9px] font-bold text-slate-400 uppercase">ความจุ {t.capacity} ท่าน</p>
              <div className={`mt-2 w-full h-1.5 rounded-full ${t.status === 'Available' ? 'bg-green-500' : 'bg-red-500'}`} />
            </button>
          ))}
        </div>
        <SQLBox query={pdfQueries['Live Map']} />
      </div>

      <div className="lg:col-span-2 space-y-6 animate-in slide-in-from-right-10 duration-500">
        {selectedTable ? (
          <div className="premium-card !p-8 border-l-4 border-shabu-orange">
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
              {orderItems.map((i, idx) => (
                <div key={idx} className="flex justify-between items-center py-2 group">
                  <div className="flex items-center gap-3">
                    <span className="font-bold text-[10px] text-slate-400">{i.quantity}x</span>
                    <span className="font-bold text-slate-700 text-sm">{i.name}</span>
                  </div>
                  <span className="font-bold text-slate-800 tabular-nums text-sm">฿{(i.price * i.quantity).toLocaleString()}</span>
                </div>
              ))}
              {orderItems.length === 0 && <div className="py-12 text-center text-slate-300 italic text-xs">ยังไม่มีออเดอร์</div>}
            </div>

            <div className="space-y-4 pt-6 border-t border-slate-50">
              <div className="flex justify-between items-center mb-6">
                <span className="text-xs font-bold text-slate-400">ราคาสุทธิ</span>
                <span className="text-3xl font-black text-shabu-orange">฿{orderItems.reduce((sum, i) => sum + (i.price * i.quantity), 0).toLocaleString()}</span>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <button onClick={onOpenOrderModal} className="py-4 bg-slate-100 text-slate-600 rounded-xl font-bold text-[11px] uppercase tracking-widest hover:bg-slate-200 transition-all">✚ สั่งอาหาร</button>
                <button onClick={() => alert("ฟีเจอร์ย้ายโต๊ะยังไม่พร้อมใช้งานค่ะ")} className="py-4 bg-slate-100 text-slate-600 rounded-xl font-bold text-[11px] uppercase tracking-widest hover:bg-slate-200 transition-all">⇄ ย้ายโต๊ะ</button>
              </div>
              <button onClick={onFinalizePayment} className="w-full py-5 bg-shabu-orange text-white rounded-xl font-bold text-[13px] uppercase tracking-[0.2em] shadow-lg bg-[#E65100] hover:opacity-90 transition-all mt-4">🧾 เช็คบิล ({orderItems.reduce((sum, i) => sum + (i.price * i.quantity), 0).toLocaleString()})</button>
            </div>
            <div className="mt-8 space-y-4">
              <SQLBox query={pdfQueries['Ordering'].replace('?', `'${selectedTable.tableNo}'`)} />
              <SQLBox query={pdfQueries['Receipt_Insert']} />
              <SQLBox query={pdfQueries['Table_Release']} />
            </div>
          </div>
        ) : (
          <div className="premium-card py-32 flex flex-col items-center justify-center border-dashed border-2 border-slate-200 opacity-60">
            <span className="text-4xl grayscale mb-6">🪑</span>
            <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">เลือกโต๊ะเพื่อจัดการออเดอร์</p>
          </div>
        )}
      </div>
    </div>
  )
}
