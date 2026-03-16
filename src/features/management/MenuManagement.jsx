import { motion } from 'framer-motion';

export const MenuManagement = ({ menu, onEdit }) => (
  <div className="premium-card !p-0 overflow-hidden text-left w-full">
    <div className="overflow-x-auto">
      <table className="w-full border-collapse">
        <thead className="bg-slate-50 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
          <tr>
            <th className="px-8 py-6 text-left">ID / เมนู</th>
            <th className="px-8 py-6 text-left">ประเภท</th>
            <th className="px-8 py-6 text-center">ขนาด</th>
            <th className="px-8 py-6 text-center">ราคา</th>
            <th className="px-8 py-6 text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-50 text-sm">
          {menu.map((m, idx) => (
            <motion.tr 
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.02 }}
              key={m.id} 
              className="hover:bg-slate-50/50 transition-colors"
            >
              <td className="px-8 py-6">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-orange-50/50 flex items-center justify-center text-2xl shadow-sm border border-orange-100/50">🍜</div>
                  <div>
                    <p className="font-bold text-slate-800">{m.name}</p>
                    <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">{m.foodId}</p>
                  </div>
                </div>
              </td>
              <td className="px-8 py-6">
                 <span className="px-3 py-1 bg-slate-50 border border-slate-100 rounded-lg text-[9px] font-black uppercase text-slate-400">{m.category}</span>
              </td>
              <td className="px-8 py-6 text-center">
                 <span className="text-xs text-slate-500 font-bold">{m.size}</span>
              </td>
              <td className="px-8 py-6 text-center font-black text-shabu-orange tabular-nums">฿{m.price?.toLocaleString()}</td>
              <td className="px-8 py-6 text-right">
                <button onClick={() => onEdit(m)} className="w-10 h-10 rounded-xl bg-slate-50 text-slate-300 hover:bg-shabu-orange hover:text-white transition-all duration-300 ml-auto flex items-center justify-center">✎</button>
              </td>
            </motion.tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
);
