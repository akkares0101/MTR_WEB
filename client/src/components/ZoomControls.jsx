import { ZoomIn, ZoomOut, RefreshCcw } from 'lucide-react';

export default function ZoomControls({ value, onZoomChange }) {
  
  const handleSliderChange = (e) => {
    onZoomChange(parseFloat(e.target.value));
  };

  const handleZoomOut = () => {
    onZoomChange(prev => Math.max(prev - 0.1, 0.5));
  };

  const handleZoomIn = () => {
    onZoomChange(prev => Math.min(prev + 0.1, 2.0));
  };

  const handleReset = () => {
    onZoomChange(1.0);
  };

  return (
    // ปรับตำแหน่งให้ชิดมุมมากขึ้น (bottom-6 left-6)
    <div className="fixed bottom-6 left-6 z-[9999] flex flex-col items-start gap-2">
      
      {/* ลด Padding (p-2) และความโค้ง (rounded-2xl) */}
      <div className="bg-white/90 backdrop-blur-md p-2 rounded-2xl shadow-xl border-2 border-slate-200 flex items-center gap-3 select-none">
        
        {/* ปุ่มลดขนาด: ปรับเหลือ w-10 h-10 (40px) */}
        <button onClick={handleZoomOut} className="w-10 h-10 bg-indigo-50 text-indigo-500 rounded-xl flex items-center justify-center hover:bg-indigo-500 hover:text-white active:scale-90 transition-all shadow-sm border border-indigo-100">
          <ZoomOut size={20} strokeWidth={2.5} />
        </button>

        {/* Slider: ลดความกว้างและความสูงเส้น */}
        <div className="flex flex-col items-center w-32 md:w-40">
            <span className="text-[10px] font-bold text-slate-400 mb-0.5 tracking-wide uppercase">
                ซูม {Math.round(value * 100)}%
            </span>
            <input 
                type="range" min="0.5" max="1.5" step="0.05" 
                value={value} 
                onChange={handleSliderChange}
                className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-rose-500 hover:accent-rose-600"
            />
        </div>

        {/* ปุ่มเพิ่มขนาด: ปรับเหลือ w-10 h-10 (40px) */}
        <button onClick={handleZoomIn} className="w-10 h-10 bg-rose-50 text-rose-500 rounded-xl flex items-center justify-center hover:bg-rose-500 hover:text-white active:scale-90 transition-all shadow-sm border border-rose-100">
          <ZoomIn size={20} strokeWidth={2.5} />
        </button>
      </div>

      {/* ปุ่มรีเซ็ต: ปรับให้เล็กลง */}
      {value !== 1.0 && (
        <button onClick={handleReset} className="flex items-center gap-2 px-3 py-1.5 bg-slate-700 text-white rounded-full shadow-lg hover:bg-slate-600 active:scale-95 transition-all animate-bounce">
            <RefreshCcw size={14} strokeWidth={2.5} />
            <span className="font-bold text-xs">คืนค่าเดิม</span>
        </button>
      )}

      {/* ปรับแต่งหัว Slider ให้เล็กลง (20px) */}
      <style>{`
        input[type=range]::-webkit-slider-thumb {
          -webkit-appearance: none; 
          height: 20px; 
          width: 20px; 
          border-radius: 50%; 
          background: #F43F5E; 
          cursor: pointer; 
          margin-top: -6px; /* จัดกึ่งกลางกับเส้น */
          box-shadow: 0 2px 4px rgba(0,0,0,0.2); 
          border: 2px solid white;
        }
        input[type=range]::-webkit-slider-runnable-track { 
          width: 100%; 
          height: 8px; /* เส้นหนาขึ้นนิดนึงเพื่อให้ลากง่าย */
          cursor: pointer; 
          background: #E2E8F0; 
          border-radius: 4px; 
        }
      `}</style>
    </div>
  );
}