import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthService } from '../services/authService';
import { LogOut, ArrowLeft } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// Import Components
import AgeSelection from '../components/AgeSelection';
import CategorySelection from '../components/CategorySelection'; // <-- นำกลับมา
// import UserUpload from '../components/UserUpload'; // <-- ลบทิ้ง หรือ คอมเมนต์ไว้
import ResultsPage from './ResultsPage'; // <-- นำกลับมา (ต้องแน่ใจว่าไฟล์นี้ยังมีอยู่นะครับ)

export default function UserFlow() {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState(null);
  
  // State ควบคุม Flow
  const [step, setStep] = useState(1);
  const [age, setAge] = useState('');
  const [cats, setCats] = useState([]);
  
  useEffect(() => {
    const user = AuthService.getCurrentUser();
    if (user) setCurrentUser(user);
  }, []);

  const handleLogout = () => {
    AuthService.logout();
    navigate('/');
  };

  return (
    <div className="min-h-screen p-6 relative overflow-x-hidden pt-20">
      
      {/* Navbar User */}
      <div className="absolute top-0 left-0 right-0 p-4 flex justify-between items-center bg-white/50 backdrop-blur-sm z-20">
        <div className="flex items-center gap-2 px-4">
            <div className="w-10 h-10 bg-gradient-to-br from-indigo-200 to-purple-200 rounded-full flex items-center justify-center text-xl shadow-inner border-2 border-white">😊</div>
            <div>
                <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Welcome</p>
                <p className="text-indigo-900 font-bold leading-none">{currentUser?.username || 'เพื่อนใหม่'}</p>
            </div>
        </div>
        <button onClick={handleLogout} className="flex items-center gap-2 text-gray-500 hover:text-red-500 font-bold text-sm bg-white px-4 py-2 rounded-full shadow-sm hover:shadow transition cursor-pointer">
            <LogOut size={16}/> ออก
        </button>
      </div>

      <div className="max-w-5xl mx-auto mt-4 md:mt-10">
        <AnimatePresence mode='wait'>
          
          {/* Step 1: เลือกอายุ */}
          {step === 1 && (
            <motion.div key="1" initial={{opacity:0, x:20}} animate={{opacity:1, x:0}} exit={{opacity:0, x:-20}}>
               <AgeSelection onSelectAge={(a) => { setAge(a); setStep(2); }} />
            </motion.div>
          )}

          {/* Step 2: เลือกวิชา (กลับมาแล้ว!) */}
          {step === 2 && (
            <motion.div key="2" initial={{opacity:0, x:20}} animate={{opacity:1, x:0}} exit={{opacity:0, x:-20}}>
               <CategorySelection 
                  ageRange={age} 
                  onBack={() => setStep(1)} 
                  onSearch={(selectedCats) => { setCats(selectedCats); setStep(3); }} 
               />
            </motion.div>
          )}

          {/* Step 3: ผลลัพธ์ (รายการใบงาน) */}
          {step === 3 && (
             <motion.div key="3" initial={{opacity:0, y:50}} animate={{opacity:1, y:0}} exit={{opacity:0, y:-50}}>
                <ResultsPage 
                    age={age} 
                    categories={cats} 
                    onBack={() => setStep(2)} 
                />
             </motion.div>
          )}

        </AnimatePresence>
      </div>
    </div>
  );
}