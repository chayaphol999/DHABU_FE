import { motion } from 'framer-motion';
import { SQLBox } from '../../components/ui/SQLBox';

export const Dashboard = ({ stats, tables, handleTableClick, pdfQueries }) => {
  return (
    <motion.div 
      key="dashboard"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.3, ease: "circOut" }}
      className="space-y-12 text-left w-full"
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 lg:gap-8">
        <motion.div 
          whileHover={{ y: -8 }}
          transition={{ type: "spring", damping: 15 }}
          className="premium-card !p-6 lg:!p-10"
        >
          <div className="flex justify-between items-start mb-6">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">ยอดขายวันนี้</p>
            <span className="text-green-500 text-xs">📈</span>
          </div>
          <p className="text-3xl lg:text-4xl font-black text-slate-800">฿{(stats.salesToday || 0).toLocaleString()}</p>
          <SQLBox query={pdfQueries['Dashboard_Sales']} />
        </motion.div>
        <motion.div 
          whileHover={{ y: -8 }}
          transition={{ type: "spring", damping: 15 }}
          className="premium-card !p-6 lg:!p-10"
        >
          <div className="flex justify-between items-start mb-6">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">โต๊ะที่ว่าง</p>
            <span className="text-blue-500 text-xs">🪑</span>
          </div>
          <p className="text-3xl lg:text-4xl font-black text-slate-800">{stats.availableTables}</p>
          <SQLBox query={pdfQueries['Dashboard_Tables']} />
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="lg:col-span-2 premium-card !p-6 lg:!p-10"
        >
          <h3 className="font-bold text-slate-800 mb-8 uppercase tracking-widest text-[10px] lg:text-xs flex items-center gap-2">
            <span className="w-2 h-2 bg-shabu-orange rounded-full"></span> แผนผังโต๊ะล่าสุด (Live Table Map)
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {tables.map((t, idx) => (
              <motion.button 
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.1 + (idx * 0.05) }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                key={t.id} 
                onClick={() => handleTableClick(t)} 
                className={`p-4 lg:p-6 rounded-2xl border-2 transition-all flex flex-col items-center gap-2 group ${t.status === 'Available' ? 'bg-green-50/50 border-green-100' : 'bg-red-50/50 border-red-100 opacity-60'}`}
              >
                <p className="text-xs lg:text-sm font-black text-slate-800">โต๊ะ {t.tableNo}</p>
                <p className="text-[8px] lg:text-[9px] font-bold text-slate-400 uppercase">ความจุ {t.capacity} ท่าน</p>
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
  )
}
