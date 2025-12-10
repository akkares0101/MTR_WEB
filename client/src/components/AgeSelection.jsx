import { motion } from 'framer-motion';
// ใช้ไอคอนจาก Lucide แทนอิโมจิ
import { 
  Baby, Shapes, Rocket, Star, 
  Backpack, Brain, Layers, FolderOpen,
  Cloud, Sun, Sparkles 
} from 'lucide-react';

const ageOptions = [
  // แถวที่ 1
  { id: '2-3', label: '2-3 ปี', desc: 'วัยเตาะแตะ', color: 'green', icon: Baby },
  { id: '3-4', label: '3-4 ปี', desc: 'อนุบาล 1', color: 'orange', icon: Shapes },
  { id: '4-5', label: '4-5 ปี', desc: 'อนุบาล 2', color: 'blue', icon: Rocket },
  { id: '5-6', label: '5-6 ปี', desc: 'อนุบาล 3', color: 'pink', icon: Star },
  // แถวที่ 2
  { id: 'เตรียมป1', label: 'เตรียมขึ้น ป.1', desc: 'สอบเข้า', color: 'red', icon: Backpack },
  { id: 'เสริมเชาว์', label: 'เสริมเชาว์ฯ', desc: 'ฝึกสมอง', color: 'purple', icon: Brain },
  { id: 'บัตรคำ', label: 'บัตรคำ', desc: 'คำศัพท์', color: 'yellow', icon: Layers },
  { id: 'ตามหน่วย', label: 'ใบงานตามหน่วย', desc: 'การเรียนรู้', color: 'teal', icon: FolderOpen },
];

const AgeCard = ({ id, label, desc, color, icon: Icon, onClick }) => {
  const colorMap = {
    green: { bg: 'bg-emerald-50/80', border: 'border-emerald-200', text: 'text-emerald-800', desc: 'text-emerald-600', icon: 'text-emerald-500', shadow: 'shadow-emerald-100', iconBg: 'bg-emerald-100' },
    orange: { bg: 'bg-orange-50/80', border: 'border-orange-200', text: 'text-orange-800', desc: 'text-orange-600', icon: 'text-orange-500', shadow: 'shadow-orange-100', iconBg: 'bg-orange-100' },
    blue: { bg: 'bg-sky-50/80', border: 'border-sky-200', text: 'text-sky-800', desc: 'text-sky-600', icon: 'text-sky-500', shadow: 'shadow-sky-100', iconBg: 'bg-sky-100' },
    pink: { bg: 'bg-rose-50/80', border: 'border-rose-200', text: 'text-rose-800', desc: 'text-rose-600', icon: 'text-rose-500', shadow: 'shadow-rose-100', iconBg: 'bg-rose-100' },
    purple: { bg: 'bg-purple-50/80', border: 'border-purple-200', text: 'text-purple-800', desc: 'text-purple-600', icon: 'text-purple-500', shadow: 'shadow-purple-100', iconBg: 'bg-purple-100' },
    yellow: { bg: 'bg-amber-50/80', border: 'border-amber-200', text: 'text-amber-800', desc: 'text-amber-600', icon: 'text-amber-500', shadow: 'shadow-amber-100', iconBg: 'bg-amber-100' },
    red: { bg: 'bg-red-50/80', border: 'border-red-200', text: 'text-red-800', desc: 'text-red-600', icon: 'text-red-500', shadow: 'shadow-red-100', iconBg: 'bg-red-100' },
    teal: { bg: 'bg-teal-50/80', border: 'border-teal-200', text: 'text-teal-800', desc: 'text-teal-600', icon: 'text-teal-500', shadow: 'shadow-teal-100', iconBg: 'bg-teal-100' },
  };
  const c = colorMap[color];

  return (
    <motion.div
      whileHover={{ scale: 1.03, y: -3 }}
      whileTap={{ scale: 0.98 }}
      onClick={() => onClick(id)}
      className={`
        relative flex flex-col items-center justify-center p-4 h-full
        ${c.bg} backdrop-blur-sm rounded-2xl cursor-pointer 
        border-2 ${c.border}
        shadow-md ${c.shadow} hover:shadow-lg
        transition-all duration-300 group
      `}
    >
      <div className={`absolute top-0 right-0 w-20 h-20 ${c.iconBg} opacity-20 rounded-full -mr-8 -mt-8 blur-xl transition-transform group-hover:scale-150`}></div>
      
      <div className={`mb-3 p-3 ${c.iconBg} rounded-xl shadow-sm group-hover:shadow-md transition-all duration-300 group-hover:-translate-y-1 ring-2 ring-white`}>
        <Icon size={32} className={`${c.icon} stroke-[1.5px]`} />
      </div>
      
      <div className="text-center z-10">
        <h3 className={`text-lg md:text-xl font-bold font-display ${c.text} mb-1 tracking-tight`}>
            {label}
        </h3>
        <p className={`text-xs font-bold ${c.desc} opacity-80 uppercase tracking-wide`}>
            {desc}
        </p>
      </div>
    </motion.div>
  );
};

export default function AgeSelection({ onSelectAge }) {
  return (
    <div className="flex flex-col items-center justify-center h-screen w-full px-4 relative overflow-hidden bg-slate-50/50">
      
      {/* Background Elements (ใช้ SVG Icons จางๆ) */}
      <div className="absolute top-10 left-[5%] text-slate-200 animate-pulse hidden md:block"><Cloud size={100} strokeWidth={0.5} /></div>
      <div className="absolute bottom-10 right-[5%] text-slate-200 animate-bounce duration-[4000ms] hidden md:block"><Sun size={80} strokeWidth={0.5} /></div>
      
      <div className="w-full max-w-5xl flex flex-col items-center justify-center h-full max-h-[800px]">
        
        <div className="text-center mb-6 relative z-10 shrink-0">
            <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 bg-white px-4 py-1.5 rounded-full shadow-sm mb-3 border border-slate-100"
            >
                <span className="flex h-2 w-2 relative">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                </span>
                <span className="text-slate-500 font-bold text-[10px] tracking-widest uppercase">Kids Learning Media & Training Co., Ltd. | Trang</span>
            </motion.div>
            
            <h1 className="text-3xl md:text-5xl font-bold font-display text-slate-800 mb-2 tracking-tight drop-shadow-sm">
            ห้องเรียนแห่งการเรียนรู้
            </h1>
            <p className="text-slate-500 text-sm md:text-base font-medium opacity-80">
            เลือกห้องเรียนที่เหมาะสมกับน้องๆ ได้เลย
            </p>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-5 w-full z-10 grow-0">
            {ageOptions.map((opt, index) => (
            <motion.div
                key={opt.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.05, duration: 0.3 }}
                className="aspect-[4/3] lg:aspect-auto lg:h-40"
            >
                <AgeCard 
                    id={opt.id}
                    label={opt.label} 
                    desc={opt.desc}
                    color={opt.color} 
                    icon={opt.icon} 
                    onClick={onSelectAge} 
                />
            </motion.div>
            ))}
        </div>

      </div>
    </div>
  );
}