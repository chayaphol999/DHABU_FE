import { motion } from 'framer-motion';

export const CustomerManagement = ({ customers, onEdit }) => (
  <div className="premium-card !p-0 overflow-hidden text-left w-full">
    <div className="overflow-x-auto">
      <table className="w-full border-collapse">
        <thead className="bg-slate-50 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
          <tr>
            <th className="px-8 py-6 text-left">รหัสลูกค้า</th>
            <th className="px-8 py-6 text-left">ชื่อลูกค้า</th>
            <th className="px-8 py-6 text-center">เบอร์โทรศัพท์</th>
            <th className="px-8 py-6 text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-50 text-sm">
          {customers.map((c, idx) => (
            <motion.tr 
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.02 }}
              key={c.id} 
              className="hover:bg-slate-50/50 transition-colors"
            >
              <td className="px-8 py-6">
                <span className="px-3 py-1 bg-orange-50 text-shabu-orange border border-orange-100 rounded-lg font-black text-[10px] uppercase tracking-wider">{c.customerId}</span>
              </td>
              <td className="px-8 py-6">
                 <div className="flex items-center gap-3">
                   <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-[10px] font-black text-slate-400">{c.name?.charAt(0)}</div>
                   <span className="font-bold text-slate-800">{c.name}</span>
                 </div>
              </td>
              <td className="px-8 py-6 text-center font-bold text-slate-400 tabular-nums tracking-widest">{c.phone}</td>
              <td className="px-8 py-6 text-right">
                <button onClick={() => onEdit(c)} className="w-10 h-10 rounded-xl bg-slate-50 text-slate-300 hover:bg-shabu-orange hover:text-white transition-all duration-300 ml-auto flex items-center justify-center">✎</button>
              </td>
            </motion.tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
);
