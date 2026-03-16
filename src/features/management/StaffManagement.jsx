import { motion } from 'framer-motion';

export const StaffManagement = ({ staff, onEdit }) => (
  <div className="premium-card !p-0 overflow-hidden text-left w-full">
    <div className="overflow-x-auto">
      <table className="w-full border-collapse">
        <thead className="bg-slate-50 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
          <tr>
            <th className="px-8 py-6 text-left">ID / ชื่อพนักงาน</th>
            <th className="px-8 py-6 text-left">ตำแหน่ง</th>
            <th className="px-8 py-6 text-left">เงินเดือน</th>
            <th className="px-8 py-6 text-left">ที่อยู่</th>
            <th className="px-8 py-6 text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-50 text-sm">
          {staff.map((s, idx) => (
            <motion.tr 
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.02 }}
              key={s.id} 
              className="hover:bg-slate-50/50 transition-colors"
            >
              <td className="px-8 py-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-slate-100 flex items-center justify-center font-bold text-slate-400 text-[11px] shadow-inner">{s.name?.charAt(0)}</div>
                  <div>
                    <p className="font-bold text-slate-800">{s.name}</p>
                    <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">{s.employeeId}</p>
                  </div>
                </div>
              </td>
              <td className="px-8 py-6">
                <span className={`px-4 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest ${
                  s.position === 'Manager' ? 'bg-orange-50 text-shabu-orange border border-orange-100' : 'bg-slate-50 text-slate-500 border border-slate-100'
                }`}>
                  {s.position}
                </span>
              </td>
              <td className="px-8 py-6 font-bold tabular-nums text-slate-700">฿{s.salary?.toLocaleString()}</td>
              <td className="px-8 py-6 text-slate-400 text-xs w-64 truncate">{s.address}</td>
              <td className="px-8 py-6 text-right">
                <button onClick={() => onEdit(s)} className="w-10 h-10 rounded-xl bg-slate-50 text-slate-300 hover:bg-shabu-orange hover:text-white transition-all duration-300 flex items-center justify-center">✎</button>
              </td>
            </motion.tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
);
