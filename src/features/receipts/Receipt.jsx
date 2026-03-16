import { motion } from 'framer-motion';

export const Receipt = ({ receipt }) => {
  if (!receipt) return null;

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-white p-8 sm:p-12 w-full max-w-sm mx-auto shadow-[0_20px_50px_rgba(0,0,0,0.1)] relative overflow-hidden"
      style={{
        backgroundImage: 'radial-gradient(#000 0.5px, transparent 0.5px)',
        backgroundSize: '20px 20px',
        backgroundColor: '#fafafa'
      }}
    >
      {/* Receipt Top Edge */}
      <div className="absolute top-0 left-0 right-0 h-2 bg-white flex justify-between px-1">
        {[...Array(20)].map((_, i) => (
          <div key={i} className="w-2 h-2 bg-slate-100 rounded-full -mt-1" />
        ))}
      </div>

      <div className="text-center mb-10">
        <div className="w-16 h-16 bg-shabu-orange rounded-2xl mx-auto flex items-center justify-center text-3xl mb-4 shadow-lg shadow-orange-100 transform -rotate-6">🍲</div>
        <h2 className="text-2xl font-black text-slate-800 tracking-tighter italic">SHABU PRO</h2>
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.3em] mt-1">Premium Dining Experience</p>
      </div>

      <div className="space-y-4 border-t border-b border-dashed border-slate-200 py-8 mb-8">
        <div className="flex justify-between text-[10px] font-bold text-slate-400 uppercase tracking-widest">
          <span>Receipt ID</span>
          <span className="text-slate-800">{receipt.receiptId}</span>
        </div>
        <div className="flex justify-between text-[10px] font-bold text-slate-400 uppercase tracking-widest">
          <span>Date</span>
          <span className="text-slate-800">{receipt.issueDate ? new Date(receipt.issueDate).toLocaleString() : '-'}</span>
        </div>
        <div className="flex justify-between text-[10px] font-bold text-slate-400 uppercase tracking-widest">
          <span>Table No.</span>
          <span className="text-slate-800">{receipt.tableNo || '-'}</span>
        </div>
        <div className="flex justify-between text-[10px] font-bold text-slate-400 uppercase tracking-widest">
          <span>Customer</span>
          <span className="text-slate-800">{receipt.customerId || '-'}</span>
        </div>
        <div className="flex justify-between text-[10px] font-bold text-slate-400 uppercase tracking-widest">
          <span>Staff ID</span>
          <span className="text-slate-800">{receipt.employeeId || 'admin'}</span>
        </div>
      </div>

      <div className="space-y-6">
        <p className="text-[10px] font-bold text-slate-300 uppercase tracking-[0.2em] mb-4">Summary</p>
        <div className="flex justify-between items-end">
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Subtotal</p>
            <p className="text-sm font-bold text-slate-600">฿{(receipt.totalAmount || 0).toLocaleString()}</p>
          </div>
          <div className="text-right">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">VAT (7%)</p>
            <p className="text-sm font-bold text-slate-600 italic">Included</p>
          </div>
        </div>
        
        <div className="pt-6 border-t border-slate-200">
          <div className="flex justify-between items-center">
            <span className="text-xs font-black text-slate-800 uppercase tracking-widest">Total Amount</span>
            <span className="text-3xl font-black text-shabu-orange">฿{(receipt.totalAmount || 0).toLocaleString()}</span>
          </div>
        </div>
      </div>

      <div className="mt-12 text-center">
        <div className="w-full h-8 bg-slate-100 rounded flex items-center justify-center mb-4 overflow-hidden opacity-30">
          <div className="w-full h-1 bg-slate-800 flex justify-between">
             {[...Array(50)].map((_, i) => (
               <div key={i} className={`h-full bg-black ${i % 3 === 0 ? 'w-2' : 'w-0.5'}`} />
             ))}
          </div>
        </div>
        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-[0.2em]">Thank you for dining with us</p>
        <p className="text-[8px] font-medium text-slate-300 mt-2">นายชยพล อินแก้ว | 66143206002-7</p>
      </div>

      {/* Receipt Bottom Jagged Edge */}
      <div className="absolute bottom-0 left-0 right-0 h-4 bg-transparent flex justify-between overflow-hidden">
        {[...Array(30)].map((_, i) => (
          <div key={i} className="w-4 h-4 bg-shabu-bg rounded-full -mb-2 shrink-0" />
        ))}
      </div>
    </motion.div>
  );
};
