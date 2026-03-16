import { motion } from 'framer-motion';

export const TableItem = ({ table, onClick }) => (
    <motion.button
        whileHover={{ y: -8, scale: 1.02 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => onClick(table)}
        className={`relative p-6 rounded-[2.5rem] border-2 flex flex-col items-center justify-center gap-2 aspect-square transition-all duration-300 cursor-pointer group shadow-xl ${
            table.status === 'Available'
                ? 'bg-white border-slate-100/50 hover:border-orange-200 shadow-slate-200/40 hover:shadow-orange-100'
                : 'bg-orange-50 border-orange-100/50 shadow-inner'
        }`}
    >
        {/* Table Number with Glass Style */}
        <div className="absolute -top-3 -right-3 w-12 h-12 bg-white/80 backdrop-blur-md border border-white rounded-[1rem] flex items-center justify-center text-sm font-black text-slate-800 shadow-lg group-hover:bg-shabu-orange group-hover:text-white group-hover:border-shabu-orange transition-all duration-300">
            {table.tableNo}
        </div>

        {/* Icon/Visual Representation */}
        <div className={`text-5xl mb-2 transition-transform duration-500 group-hover:rotate-12 ${table.status !== 'Available' ? 'grayscale-[0.5] opacity-50' : ''}`}>
           {table.capacity <= 2 ? '☕' : table.capacity <= 4 ? '🍲' : '🍱'}
        </div>

        <div className="text-[10px] uppercase font-black tracking-[0.2em] text-slate-400 group-hover:text-slate-600">
            {table.capacity} Seats
        </div>

        {/* Status Badge */}
        <div className={`mt-2 flex items-center gap-2 px-5 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider transition-all ${
            table.status === 'Available' 
                ? 'bg-green-500 text-white shadow-lg shadow-green-100' 
                : 'bg-orange-500/10 text-orange-600 border border-orange-200'
        }`}>
            {table.status === 'Available' ? 'ว่าง' : 'มีลูกค้า'}
        </div>

        {/* Decorative elements */}
        {table.status === 'Available' && (
            <div className="absolute inset-0 bg-orange-500/5 opacity-0 group-hover:opacity-100 transition-opacity rounded-[2.5rem]"></div>
        )}
    </motion.button>
);
