import { TableItem } from './TableItem';

export const TableMap = ({ tables, onTableClick }) => (
    <div className="premium-card overflow-hidden relative">
        {/* Background Decoration */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-orange-500/5 rounded-full -mr-40 -mt-40 blur-[100px]"></div>

        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-16 relative z-10">
            <div>
                <h3 className="text-3xl font-black tracking-tighter text-slate-800 mb-2 uppercase">Live Table Map 🗺️</h3>
                <p className="text-slate-400 text-sm font-bold flex items-center gap-2">
                   คลิกที่โต๊ะเพื่อจัดการออเดอร์หรือจองได้เลย <span className="animate-pulse">🍱</span>
                </p>
            </div>
            
            <div className="flex items-center gap-4 bg-slate-50/50 p-3 rounded-3xl border border-slate-100">
                <div className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-white shadow-sm border border-slate-100">
                    <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse shadow-[0_0_10px_rgba(34,197,94,0.5)]"></div>
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Available</span>
                </div>
                <div className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-white shadow-sm border border-slate-100">
                    <div className="w-3 h-3 bg-orange-500 rounded-full shadow-[0_0_10px_rgba(242,101,34,0.5)]"></div>
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Occupied</span>
                </div>
            </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-7 gap-10 relative z-10">
            {tables.map(t => <TableItem key={t.id} table={t} onClick={onTableClick} />)}
        </div>
    </div>
);
