import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthService } from '../services/authService';
import { Lock, User } from 'lucide-react';

export default function LoginPage() {
  const navigate = useNavigate();
  const [u, setU] = useState('');
  const [p, setP] = useState('');
  const [err, setErr] = useState('');

  const handleLogin = (e) => {
    e.preventDefault();
    if (AuthService.login(u, p)) navigate('/admin');
    else setErr('ชื่อผู้ใช้หรือรหัสผ่านผิด');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-indigo-50">
      <div className="bg-white p-8 rounded-3xl shadow-xl w-full max-w-sm">
        <h1 className="text-2xl font-bold text-center mb-6 font-display text-indigo-900">แอดมินล็อกอิน</h1>
        {err && <div className="bg-red-50 text-red-500 p-2 text-sm rounded mb-4 text-center">{err}</div>}
        <form onSubmit={handleLogin} className="space-y-4">
          <div className="relative">
            <User className="absolute left-3 top-3 text-gray-400" size={20}/>
            <input type="text" placeholder="Username" className="w-full pl-10 p-3 border rounded-xl" value={u} onChange={e=>setU(e.target.value)} />
          </div>
          <div className="relative">
            <Lock className="absolute left-3 top-3 text-gray-400" size={20}/>
            <input type="password" placeholder="Password" className="w-full pl-10 p-3 border rounded-xl" value={p} onChange={e=>setP(e.target.value)} />
          </div>
          <button className="w-full bg-indigo-600 text-white py-3 rounded-xl font-bold hover:bg-indigo-700 cursor-pointer">เข้าสู่ระบบ</button>
        </form>
        <button onClick={() => navigate('/')} className="w-full mt-4 text-sm text-gray-400 hover:text-indigo-600 underline">กลับหน้าหลัก</button>
      </div>
    </div>
  );
}