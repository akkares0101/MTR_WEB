import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthService } from '../services/authService';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Lock, Smile, ArrowRight } from 'lucide-react';

export default function AuthPage() {
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true); // true = Login, false = Register
  
  // Form States
  const [name, setName] = useState(''); // ชื่อเล่น (สำหรับ Register)
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => { // ✅ เพิ่ม async
    e.preventDefault();
    setError('');

    if (isLogin) {
      // --- LOGIN LOGIC ---
      // ✅ เพิ่ม await
      const res = await AuthService.login(username, password); 
      if (res.success) {
        navigate(res.role === 'admin' ? '/admin' : '/app');
      } else {
        setError(res.message);
      }
    } else {
      // --- REGISTER LOGIC ---
      if (!name || !username || !password) return setError('กรุณากรอกข้อมูลให้ครบ');
      
      // ✅ เพิ่ม await
      const res = await AuthService.register(name, username, password);
      if (res.success) {
        alert('สมัครสมาชิกสำเร็จ! กรุณาเข้าสู่ระบบ');
        setIsLogin(true); 
        setError('');
        setPassword(''); // ล้างรหัสผ่าน
      } else {
        setError(res.message);
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-100 via-purple-100 to-pink-100 p-4">
      <div className="bg-white rounded-[2.5rem] shadow-2xl overflow-hidden max-w-4xl w-full grid grid-cols-1 md:grid-cols-2 min-h-[500px]">
        
        {/* Left Side: Image & Text */}
        <div className={`p-10 flex flex-col justify-center items-center text-center text-white transition-colors duration-500 ${isLogin ? 'bg-indigo-500' : 'bg-pink-500'}`}>
           <motion.div 
             key={isLogin ? 'login-img' : 'reg-img'}
             initial={{ opacity: 0, scale: 0.5 }} animate={{ opacity: 1, scale: 1 }}
             className="text-8xl mb-6"
           >
             {isLogin ? '🔐' : '🦄'}
           </motion.div>
           <h2 className="text-3xl font-bold font-display mb-4">
             {isLogin ? 'ยินดีต้อนรับกลับ!' : 'มาเป็นเพื่อนกันเถอะ!'}
           </h2>
           <p className="opacity-90 mb-8 font-medium">
             {isLogin ? 'เข้าสู่ระบบเพื่อดาวน์โหลดใบงานน่ารักๆ' : 'สมัครสมาชิกฟรี! เพื่อเข้าถึงใบงานมากมาย'}
           </p>
           <button 
             onClick={() => { setIsLogin(!isLogin); setError(''); }}
             className="px-8 py-3 rounded-full border-2 border-white font-bold hover:bg-white hover:text-indigo-600 transition-colors cursor-pointer"
           >
             {isLogin ? 'ยังไม่มีบัญชี? สมัครเลย' : 'มีบัญชีแล้ว? เข้าสู่ระบบ'}
           </button>
        </div>

        {/* Right Side: Form */}
        <div className="p-10 flex flex-col justify-center bg-white relative">
           <h2 className="text-3xl font-bold font-display text-gray-800 mb-6 text-center">
             {isLogin ? 'เข้าสู่ระบบ' : 'สมัครสมาชิก'}
           </h2>

           {error && (
             <motion.div initial={{opacity:0, y:-10}} animate={{opacity:1, y:0}} className="bg-red-50 text-red-500 p-3 rounded-xl text-sm mb-4 text-center font-bold">
               {error}
             </motion.div>
           )}

           <form onSubmit={handleSubmit} className="space-y-4">
             <AnimatePresence> 
               {!isLogin && (
                 <motion.div initial={{opacity:0, height:0}} animate={{opacity:1, height:'auto'}} exit={{opacity:0, height:0}} className="overflow-hidden">
                    <div className="relative mb-4">
                      <Smile className="absolute left-4 top-3.5 text-gray-400" size={20}/>
                      <input type="text" placeholder="ชื่อเล่นของคุณ" className="w-full pl-12 p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-pink-300 outline-none" value={name} onChange={e=>setName(e.target.value)} />
                    </div>
                 </motion.div>
               )}
             </AnimatePresence>

             <div className="relative">
               <User className="absolute left-4 top-3.5 text-gray-400" size={20}/>
               <input type="text" placeholder="ชื่อผู้ใช้ (Username)" className="w-full pl-12 p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-300 outline-none" value={username} onChange={e=>setUsername(e.target.value)} />
             </div>

             <div className="relative">
               <Lock className="absolute left-4 top-3.5 text-gray-400" size={20}/>
               <input type="password" placeholder="รหัสผ่าน (Password)" className="w-full pl-12 p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-300 outline-none" value={password} onChange={e=>setPassword(e.target.value)} />
             </div>

             <button className={`w-full py-4 rounded-xl font-bold text-white shadow-lg flex justify-center items-center gap-2 hover:scale-105 transition-transform cursor-pointer ${isLogin ? 'bg-indigo-600 hover:bg-indigo-700' : 'bg-pink-500 hover:bg-pink-600'}`}>
               {isLogin ? 'เข้าสู่ระบบ' : 'สมัครสมาชิก'} <ArrowRight size={20}/>
             </button>
           </form>

           {isLogin && (
             <p className="mt-6 text-center text-xs text-gray-400">
               Media & Training Co., Ltd. | Trang
             </p>
           )}
        </div>
      </div>
    </div>
  );
}