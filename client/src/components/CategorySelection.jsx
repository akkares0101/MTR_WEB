import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
// นำเข้าไอคอนสวยๆ จาก Lucide
import { 
  ArrowLeft, Search, Loader, 
  BookOpen, Calculator, FlaskConical, Palette, 
  Music, Dumbbell, Languages, Globe, Puzzle, Shapes, Sparkles, Tag 
} from 'lucide-react';
import { API } from '../services/api'; 

// ฟังก์ชันเลือกธีมสีและไอคอนตามลำดับ (เพื่อให้แต่ละวิชาดูไม่ซ้ำกัน)
const getStyle = (index) => {
  const styles = [
    { color: 'purple', icon: BookOpen, bg: 'bg-purple-50', border: 'border-purple-200', text: 'text-purple-700', iconColor: 'text-purple-500', iconBg: 'bg-purple-100' },
    { color: 'blue', icon: Calculator, bg: 'bg-sky-50', border: 'border-sky-200', text: 'text-sky-700', iconColor: 'text-sky-500', iconBg: 'bg-sky-100' },
    { color: 'green', icon: FlaskConical, bg: 'bg-emerald-50', border: 'border-emerald-200', text: 'text-emerald-700', iconColor: 'text-emerald-500', iconBg: 'bg-emerald-100' },
    { color: 'pink', icon: Palette, bg: 'bg-rose-50', border: 'border-rose-200', text: 'text-rose-700', iconColor: 'text-rose-500', iconBg: 'bg-rose-100' },
    { color: 'yellow', icon: Shapes, bg: 'bg-amber-50', border: 'border-amber-200', text: 'text-amber-700', iconColor: 'text-amber-500', iconBg: 'bg-amber-100' },
    { color: 'orange', icon: Puzzle, bg: 'bg-orange-50', border: 'border-orange-200', text: 'text-orange-700', iconColor: 'text-orange-500', iconBg: 'bg-orange-100' },
    { color: 'teal', icon: Globe, bg: 'bg-teal-50', border: 'border-teal-200', text: 'text-teal-700', iconColor: 'text-teal-500', iconBg: 'bg-teal-100' },
    { color: 'indigo', icon: Languages, bg: 'bg-indigo-50', border: 'border-indigo-200', text: 'text-indigo-700', iconColor: 'text-indigo-500', iconBg: 'bg-indigo-100' },
  ];
  return styles[index % styles.length];
};

export default function CategorySelection({ ageRange, onBack, onSearch }) {
  const [categories, setCategories] = useState([]);
  const [selected, setSelected] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCategories = async () => {
      setLoading(true);
      try {
        // 1. ดึงข้อมูลวิชาทั้งหมดจาก MySQL
        const allCats = await API.getCategories();
        
        // 2. กรองเฉพาะวิชาของชั้นเรียนที่เลือก (ageRange)
        const filteredCats = allCats.filter(c => {
             // รองรับทั้ง ageGroup (จาก api.js) และ age_group (จาก db ตรงๆ) กันเหนียว
             const catAge = c.ageGroup || c.age_group; 
             return catAge === ageRange;
        });

        setCategories(filteredCats);
      } catch (error) {
        console.error("Failed to fetch categories:", error);
      }
      setLoading(false);
    };

    fetchCategories();
  }, [ageRange]);

  const toggleCat = (catName) => {
    setSelected(prev => prev.includes(catName) ? prev.filter(x => x !== catName) : [...prev, catName]);
  };

  return (
    <div className="flex flex-col items-center min-h-[90vh] w-full px-4 py-12 relative overflow-hidden bg-rose-50/50">
      
      {/* Background Decor */}
      <div className="absolute top-20 right-[10%] text-rose-100 animate-pulse hidden md:block"><Sparkles size={80} strokeWidth={0.5} /></div>
      <div className="absolute bottom-10 left-[10%] text-sky-100 hidden md:block"><Shapes size={100} strokeWidth={0.5} /></div>

      {/* Header */}
      <div className="w-full max-w-5xl mb-8 relative z-10">
        <button 
            onClick={onBack} 
            className="flex items-center text-slate-500 hover:text-rose-600 font-bold mb-6 transition-colors bg-white px-4 py-2 rounded-full shadow-md border border-rose-100 w-fit text-sm group"
        >
            <ArrowLeft size={18} className="mr-2 group-hover:-translate-x-1 transition-transform" /> ย้อนกลับ
        </button>
        
        <div className="text-center">
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-2 bg-rose-100/80 px-4 py-1.5 rounded-full mb-4 border border-rose-200"
            >
                <span className="w-2 h-2 rounded-full bg-rose-400"></span>
                <span className="text-rose-600 font-bold text-xs tracking-wide">ห้องเรียนน้อง {ageRange}</span>
            </motion.div>
            
            <h1 className="text-3xl md:text-5xl font-extrabold font-display text-slate-800 mb-3 tracking-tight">
                สนใจฝึกทักษะด้านไหน?
            </h1>
            <p className="text-slate-500 text-base md:text-lg font-medium">
                เลือกวิชาที่ต้องการได้เลย (เลือกได้มากกว่า 1 วิชานะ)
            </p>
        </div>
      </div>

      {/* Grid Layout */}
      <div className="w-full max-w-5xl z-10 flex-1 flex flex-col items-center">
        {loading ? (
            <div className="flex flex-col items-center justify-center py-20 text-slate-400">
                <Loader className="animate-spin mb-4 text-rose-400" size={40} />
                <p>กำลังค้นหาวิชา...</p>
            </div>
        ) : categories.length === 0 ? (
            <div className="text-center py-20 bg-white/60 rounded-[2rem] border-2 border-dashed border-slate-200 w-full max-w-lg shadow-xl">
                <div className="bg-rose-50 p-4 rounded-full inline-block mb-4 border border-rose-100">
                    <Search size={40} className="text-rose-300"/>
                </div>
                <p className="text-slate-500 font-bold text-lg">ยังไม่มีวิชาในหมวดนี้</p>
                <p className="text-slate-400 text-sm mt-1">แจ้งคุณครูหรือแอดมินให้เพิ่มวิชาหน่อยนะ</p>
            </div>
        ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 w-full">
                {categories.map((cat, index) => {
                    const isActive = selected.includes(cat.name);
                    const style = getStyle(index); // สุ่มธีมสี
                    const Icon = style.icon;

                    return (
                        <motion.div
                            key={cat.id}
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: index * 0.05 }}
                            onClick={() => toggleCat(cat.name)}
                            className={`
                                relative p-5 rounded-2xl cursor-pointer 
                                flex flex-col items-center justify-center min-h-[140px] text-center
                                transition-all duration-300 border-2
                                ${isActive 
                                    ? `bg-white border-4 border-rose-300 shadow-2xl shadow-rose-200 scale-105 ring-2 ring-rose-100` 
                                    : `${style.bg} border-transparent hover:shadow-lg hover:-translate-y-1 shadow-md`
                                }
                            `}
                        >
                            {/* ไอคอนวิชา */}
                            <div className={`mb-3 p-3 rounded-xl w-fit shadow-md ${style.iconBg} transition-colors border border-white/50`}>
                                <Icon size={30} className={style.iconColor} strokeWidth={2}/>
                            </div>
                            
                            {/* ชื่อวิชา */}
                            <h3 className={`text-lg font-bold font-display leading-tight ${isActive ? 'text-rose-800' : 'text-slate-700'}`}>
                                {cat.name}
                            </h3>

                            {/* เครื่องหมายถูกตอนเลือก */}
                            {isActive && (
                                <motion.div 
                                    initial={{ scale: 0 }} animate={{ scale: 1 }}
                                    className={`absolute top-3 right-3 w-6 h-6 rounded-full bg-rose-500 flex items-center justify-center shadow-md`}
                                >
                                    <Tag size={16} className={`text-white`}/>
                                </motion.div>
                            )}
                        </motion.div>
                    );
                })}
            </div>
        )}
      </div>

      {/* Footer / Search Button (Fixed at Bottom) */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-white/90 backdrop-blur-md border-t border-rose-100 z-20 flex justify-center shadow-2xl">
        <button
          onClick={() => onSearch(selected)}
          disabled={selected.length === 0}
          className={`
            w-full max-w-xl py-3.5 rounded-2xl text-lg font-bold shadow-2xl transition-all transform flex items-center justify-center gap-3
            ${selected.length > 0 
              ? 'bg-gradient-to-r from-rose-500 to-pink-500 text-white hover:shadow-rose-300 hover:-translate-y-1 cursor-pointer' 
              : 'bg-slate-200 text-slate-400 cursor-not-allowed'
            }
          `}
        >
          {selected.length > 0 ? (
             <>
               <Search size={20} strokeWidth={3} /> 
               <span>ค้นหาใบงาน ({selected.length})</span>
             </>
          ) : (
             'เลือกวิชาก่อนนะ'
          )}
        </button>
      </div>
      
      <div className="h-20"></div>
    </div>
  );
}