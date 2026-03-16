import { motion, AnimatePresence } from 'framer-motion';

export const Modal = ({ title, isOpen, onClose, children, raw = false }) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[100] flex items-center justify-center p-4 sm:p-8"
        >
          <motion.div 
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className={raw ? "relative w-full max-w-sm" : "bg-white rounded-[2rem] shadow-2xl w-full max-w-2xl overflow-hidden relative"}
          >
            {!raw ? (
              <div className="px-8 py-6 border-b border-slate-100 flex justify-between items-center">
                <h3 className="text-xl font-bold text-slate-800">{title}</h3>
                <button onClick={onClose} className="text-slate-400 hover:text-slate-600 font-bold transition-transform hover:scale-125">✕</button>
              </div>
            ) : (
              <button 
                onClick={onClose} 
                className="absolute -top-12 right-0 sm:-right-12 text-white/50 hover:text-white font-bold text-2xl transition-all"
              >
                ✕
              </button>
            )}
            <div className={raw ? "" : "p-8 max-h-[70vh] overflow-auto"}>
              {children}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
