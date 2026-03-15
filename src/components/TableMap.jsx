export const TableItem = ({ table, onClick }) => (
    <button
        onClick={() => onClick(table)}
        className={`relative p-6 rounded-3xl border-2 flex flex-col items-center justify-center gap-2 aspect-square transition-all duration-300 cursor-pointer group hover:-translate-y-2 ${
            table.status === 'Available'
                ? 'bg-white border-slate-100 hover:border-orange-200 shadow-xl shadow-slate-200/50 hover:shadow-orange-100'
                : 'bg-orange-50 border-orange-100 shadow-inner'
        }`}
    >
        {/* Table Number with Glass Style */}
        <div className="absolute -top-3 -right-3 w-10 h-10 glass rounded-xl flex items-center justify-center text-sm font-black text-slate-800 shadow-lg group-hover:bg-orange-500 group-hover:text-white transition-colors">
            {table.tableNo}
        </div>

        {/* Icon/Visual Representation */}
        <div className={`text-4xl mb-2 transition-transform duration-500 group-hover:scale-110 ${table.status !== 'Available' ? 'grayscale-[0.5] opacity-50' : ''}`}>
           {table.capacity <= 2 ? '☕' : table.capacity <= 4 ? '🍲' : '🍱'}
        </div>

        <div className="text-[10px] uppercase font-black tracking-[0.2em] text-slate-400 group-hover:text-slate-600">
            {table.capacity} Seats
        </div>

        {/* Status Badge */}
        <div className={`mt-2 flex items-center gap-2 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider transition-all ${
            table.status === 'Available' 
                ? 'bg-green-500 text-white shadow-lg shadow-green-100' 
                : 'bg-orange-500/10 text-orange-600 border border-orange-200'
        }`}>
            {table.status === 'Available' ? 'ว่าง' : 'มีลูกค้า'}
        </div>

        {/* Decorative elements */}
        {table.status === 'Available' && (
            <div className="absolute inset-0 bg-orange-500/5 opacity-0 group-hover:opacity-100 transition-opacity rounded-3xl"></div>
        )}
    </button>
);

export const LiveTableMap = ({ tables, onTableClick }) => (
    <div className="premium-card overflow-hidden relative">
        {/* Background Decoration */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-orange-500/5 rounded-full -mr-32 -mt-32 blur-3xl"></div>

        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12 relative z-10">
            <div>
                <h3 className="text-3xl font-black tracking-tight text-slate-800 mb-2">แผนผังร้าน (Live Map)</h3>
                <p className="text-slate-400 text-sm font-medium">คลิกที่โต๊ะเพื่อจองหรือจัดการออเดอร์ค่ะ</p>
            </div>
            
            <div className="flex items-center gap-4 bg-slate-50 p-2 rounded-2xl border border-slate-100">
                <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white shadow-sm border border-slate-100">
                    <div className="w-2.5 h-2.5 bg-green-500 rounded-full animate-pulse"></div>
                    <span className="text-[10px] font-black uppercase text-slate-500">Available</span>
                </div>
                <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white shadow-sm border border-slate-100">
                    <div className="w-2.5 h-2.5 bg-orange-500 rounded-full"></div>
                    <span className="text-[10px] font-black uppercase text-slate-500">Occupied</span>
                </div>
            </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-8 relative z-10">
            {tables.map(t => <TableItem key={t.id} table={t} onClick={onTableClick} />)}
        </div>
    </div>
);
