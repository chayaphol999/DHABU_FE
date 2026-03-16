import { SQLBox } from '../components/ui/SQLBox';
import { pdfQueries } from '../utils/queries';

export const Dashboard = ({ stats, tables, onTableClick }) => (
  <div className="space-y-12 text-left animate-in fade-in duration-500">
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
      <div className="premium-card">
        <div className="flex justify-between items-start mb-6">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">ยอดขายวันนี้</p>
          <span className="text-green-500 text-xs">📈</span>
        </div>
        <p className="text-4xl font-black text-slate-800">฿{(stats?.salesToday || 0).toLocaleString()}</p>
        <SQLBox query={pdfQueries['Dashboard_Sales']} />
      </div>
      <div className="premium-card">
        <div className="flex justify-between items-start mb-6">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">โต๊ะที่ว่าง</p>
          <span className="text-blue-500 text-xs">🪑</span>
        </div>
        <p className="text-4xl font-black text-slate-800">{stats?.availableTables || 0}</p>
        <SQLBox query={pdfQueries['Dashboard_Tables']} />
      </div>
    </div>

    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div className="lg:col-span-2 premium-card">
        <h3 className="font-bold text-slate-800 mb-8 uppercase tracking-widest text-xs flex items-center gap-2">
          <span className="w-2 h-2 bg-shabu-orange rounded-full"></span> แผนผังโต๊ะล่าสุด (Live Table Map)
        </h3>
        <div className="grid grid-cols-4 gap-4">
          {tables.map(t => (
            <button key={t.id} onClick={() => onTableClick(t)} className={`p-6 rounded-2xl border-2 transition-all flex flex-col items-center gap-2 group ${t.status === 'Available' ? 'bg-green-50/50 border-green-100' : 'bg-red-50/50 border-red-100 opacity-60'}`}>
              <p className="text-sm font-black text-slate-800 transition-transform group-hover:scale-110">โต๊ะ {t.tableNo}</p>
              <p className="text-[9px] font-bold text-slate-400 uppercase">ความจุ {t.capacity} ท่าน</p>
              <div className={`mt-2 w-full h-1.5 rounded-full ${t.status === 'Available' ? 'bg-green-500' : 'bg-red-500'}`} />
            </button>
          ))}
        </div>
        <SQLBox query={pdfQueries['Live Map']} />
      </div>
      <div className="premium-card">
        <h3 className="font-bold text-slate-800 mb-8 uppercase tracking-widest text-xs">เมนูมาแรงที่สุด</h3>
        <div className="space-y-6">
          {(stats?.popularItems || []).slice(0, 3).map((m, idx) => (
            <div key={idx} className="flex flex-col gap-2">
              <div className="flex justify-between items-center text-[11px] font-bold">
                <span className="text-slate-800">🍜 {m.name}</span>
                <span className="text-slate-400">{m.count} จาน</span>
              </div>
              <div className="w-full h-2 bg-slate-50 rounded-full overflow-hidden">
                <div className="h-full bg-shabu-orange transition-all duration-1000" style={{ width: `${(m.count / (stats.popularItems[0]?.count || 1)) * 100}%` }}></div>
              </div>
            </div>
          ))}
        </div>
        <SQLBox query={pdfQueries['Dashboard_Popular']} />
      </div>
    </div>
  </div>
)
