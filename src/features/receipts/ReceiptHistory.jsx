import { motion } from 'framer-motion';

export const ReceiptHistory = ({ receipts }) => (
  <div className="premium-card !p-0 overflow-hidden text-left w-full">
    <div className="overflow-x-auto">
      <table className="w-full border-collapse">
        <thead className="bg-slate-50 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
          <tr>
            <th className="px-8 py-6 text-left">รหัสใบเสร็จ</th>
            <th className="px-8 py-6 text-center">วันที่สั่งซื้อ</th>
            <th className="px-8 py-6 text-center">รหัสลูกค้า</th>
            <th className="px-8 py-6 text-right">ยอดเงินรวม</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-50 text-sm">
          {receipts.map((r, idx) => (
            <motion.tr 
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.02 }}
              key={r.id} 
              className="hover:bg-slate-50/50 transition-colors"
            >
              <td className="px-8 py-6">
                 <div className="flex items-center gap-3">
                   <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-lg">📄</div>
                   <span className="font-black text-slate-800 tracking-tight">{r.receiptId}</span>
                 </div>
              </td>
              <td className="px-8 py-6 text-center text-slate-400 font-bold text-xs tabular-nums">
                {new Date(r.วันที่ออกใบเสร็จ).toLocaleString()}
              </td>
              <td className="px-8 py-6 text-center">
                 <span className="px-3 py-1 bg-slate-50 border border-slate-100 rounded-lg text-[9px] font-black text-slate-400">{r.customerId}</span>
              </td>
              <td className="px-8 py-6 text-right font-black text-slate-800 text-lg tabular-nums">
                ฿{r.จำนวนเงินรวม?.toLocaleString()}
              </td>
            </motion.tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
);
