import { Input } from '../components/ui/Input';
import { SQLBox } from '../components/ui/SQLBox';
import { pdfQueries } from '../utils/queries';

export const Login = ({ onLogin }) => {
  return (
    <div className="min-h-screen bg-shabu-bg flex items-center justify-center p-6 font-sans">
      <div className="bg-white w-full max-w-md p-12 rounded-[3.5rem] shadow-2xl border border-slate-100 flex flex-col items-center">
        <div className="w-20 h-20 bg-[#F26522] rounded-3xl shadow-xl flex items-center justify-center text-3xl mb-6 transform rotate-12">🍲</div>
        <h1 className="text-3xl font-black text-slate-800 mb-2 uppercase tracking-tighter">SHABU PRO</h1>
        <p className="text-slate-400 font-bold text-sm mb-12">ยินดีต้อนรับเข้าสู่ระบบ</p>

        <form className="w-full space-y-6" onSubmit={onLogin}>
          <Input label="USERNAME" name="username" required />
          <Input label="PASSWORD" name="password" type="password" required />

          <button className="btn-primary w-full text-lg py-4 mt-4 shadow-xl shadow-orange-100">เข้าสู่ระบบ</button>
        </form>

        <div className="w-full mt-12 pt-8 border-t border-slate-50">
          <SQLBox query={pdfQueries['Login'].replace('?', "'admin'").replace('?', "'1234'")} />
        </div>
      </div>
    </div>
  )
}
