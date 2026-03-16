import { motion, AnimatePresence } from 'framer-motion';
import { Input } from '../../components/ui/Input';
import { SQLBox } from '../../components/ui/SQLBox';

export const Login = ({ handleLogin, isLoggingIn, pdfQueries }) => {
  return (
    <div className="min-h-screen bg-shabu-bg flex items-center justify-center p-6 font-sans relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 z-0">
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            rotate: [0, 90, 180, 270, 360],
            opacity: [0.03, 0.05, 0.03]
          }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="absolute -top-24 -left-24 w-96 h-96 bg-shabu-orange rounded-full blur-[100px]"
        />
        <motion.div
          animate={{
            scale: [1, 1.5, 1],
            opacity: [0.02, 0.04, 0.02]
          }}
          transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -bottom-48 -right-48 w-[30rem] h-[30rem] bg-orange-400 rounded-full blur-[120px]"
        />
      </div>

      {/* Unified Premium Loader for Login */}
      <AnimatePresence>
        {isLoggingIn && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, transition: { duration: 0.4 } }}
            className="fixed inset-0 bg-shabu-bg/40 backdrop-blur-xl z-[100] flex items-center justify-center"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 1.1, opacity: 0 }}
              className="text-center p-16 rounded-[4rem] bg-white/80 shadow-2xl border border-white flex flex-col items-center"
            >
              <div className="relative mb-8">
                <motion.div
                  animate={{ y: [0, -15, 0], rotate: [0, 5, -5, 0] }}
                  transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
                  className="text-6xl"
                >
                  🍲
                </motion.div>
                <motion.div
                  animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.6, 0.3] }}
                  transition={{ repeat: Infinity, duration: 2 }}
                  className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-12 h-3 bg-slate-200/50 rounded-full blur-md"
                />
              </div>
              <h3 className="font-black text-slate-800 text-lg uppercase tracking-[0.2em] mb-2">กำลังตรวจสอบข้อมูล...</h3>
              <div className="flex gap-1">
                {[0, 1, 2].map(i => (
                  <motion.div
                    key={i}
                    animate={{ opacity: [0.3, 1, 0.3] }}
                    transition={{ repeat: Infinity, duration: 1, delay: i * 0.2 }}
                    className="w-2 h-2 bg-shabu-orange rounded-full"
                  />
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Staggered Login Card */}
      <motion.div
        initial={{ y: 60, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
        className="bg-white/70 backdrop-blur-2xl w-full max-w-md p-8 sm:p-14 rounded-[2rem] sm:rounded-[4rem] shadow-[0_32px_80px_-20px_rgba(0,0,0,0.08)] border border-white flex flex-col items-center relative z-10"
      >
        <motion.div
          initial={{ scale: 0, rotate: -45 }}
          animate={{ scale: 1, rotate: 12 }}
          transition={{ delay: 0.4, type: "spring", stiffness: 200, damping: 15 }}
          whileHover={{ rotate: 0, scale: 1.1 }}
          className="w-24 h-24 bg-shabu-orange rounded-3xl shadow-2xl shadow-orange-200 flex items-center justify-center text-4xl mb-8 cursor-pointer"
        >
          🍲
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="text-center"
        >
          <h1 className="text-4xl font-black text-slate-800 mb-2 uppercase tracking-tighter italic">SHABU PRO</h1>
          <p className="text-slate-400 font-bold text-[11px] mb-12 uppercase tracking-[0.3em]">ยินดีต้อนรับเข้าสู่ประสบการณ์พิเศษ</p>
        </motion.div>

        <form className="w-full space-y-8" onSubmit={handleLogin}>
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.8 }}>
            <Input label="USERNAME" name="username" required disabled={isLoggingIn} />
          </motion.div>

          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.9 }}>
            <Input label="PASSWORD" name="password" type="password" required disabled={isLoggingIn} />
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1 }}>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              disabled={isLoggingIn}
              className="btn-primary w-full text-lg py-5 mt-4 shadow-[0_20px_40px_-10px_rgba(242,101,34,0.3)] hover:shadow-[0_25px_50px_-12px_rgba(242,101,34,0.4)] transition-all flex items-center justify-center gap-3"
            >
              <span>เข้าสู่ระบบ</span>
              <span className="text-xl">→</span>
            </motion.button>
          </motion.div>
        </form>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2 }}
          className="w-full mt-14 pt-8 border-t border-slate-100/50"
        >
          <SQLBox query={pdfQueries['Login'].replace('?', "'admin'").replace('?', "'1234'")} />
        </motion.div>
      </motion.div>

      {/* Student Credit */}
      <div className="absolute bottom-6 left-0 right-0 text-center z-10">
        <p className="text-[10px] font-medium text-slate-40/40 uppercase tracking-widest">
          นายชยพล อินแก้ว | รหัสนักศึกษา: 66143206002-7
        </p>
      </div>
    </div>
  )
}
