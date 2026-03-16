import { motion } from 'framer-motion';

export const TablesDataManagement = ({ tables, onEdit }) => (
  <div className="premium-card !p-0 overflow-hidden text-left w-full">
    <div className="overflow-x-auto">
      <table className="w-full border-collapse">
        <thead className="bg-slate-50 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
          <tr>
            <th className="px-8 py-6 text-left">ID / เลขที่โต๊ะ</th>
            <th className="px-8 py-6 text-left">ความจุ (ที่นั่ง)</th>
            <th className="px-8 py-6 text-left">สถานะปัจจุบัน</th>
            <th className="px-8 py-6 text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-50 text-sm">
          {tables.map((t, idx) => (
            <motion.tr 
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.02 }}
              key={t.id} 
              className="hover:bg-slate-50/50 transition-colors"
            >
              <td className="px-8 py-6">
                 <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-slate-100 flex items-center justify-center font-black text-slate-400 text-xs">#{t.tableNo}</div>
                    <span className="font-bold text-slate-800">โต๊ะหมายเลข {t.tableNo}</span>
                 </div>
              </td>
              <td className="px-8 py-6">
                 <span className="px-3 py-1 bg-slate-50 border border-slate-100 rounded-lg text-xs font-bold text-slate-500">{t.capacity} ที่นั่ง</span>
              </td>
              <td className="px-8 py-6">
                 <span className={`px-4 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest ${
                   t.status === 'Available' ? 'bg-green-50 text-green-600 border border-green-100' : 'bg-orange-50 text-shabu-orange border border-orange-100'
                 }`}>
                   {t.status === 'Available' ? 'ว่าง (Available)' : 'มีลูกค้า (Occupied)'}
                 </span>
              </td>
              <td className="px-8 py-6 text-right">
                <button onClick={() => onEdit(t)} className="w-10 h-10 rounded-xl bg-slate-50 text-slate-300 hover:bg-shabu-orange hover:text-white transition-all duration-300 ml-auto flex items-center justify-center">✎</button>
              </td>
            </motion.tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
);
