import { ZoomIn, ZoomOut, RefreshCcw } from "lucide-react";

export default function ZoomControls({ value, onZoomChange }) {
  const handleSliderChange = (e) => {
    onZoomChange(parseFloat(e.target.value));
  };

  const handleZoomOut = () => {
    onZoomChange((prev) => Math.max(prev - 0.1, 0.5));
  };

  const handleZoomIn = () => {
    onZoomChange((prev) => Math.min(prev + 0.1, 1.5));
  };

  const handleReset = () => {
    onZoomChange(1.0);
  };

  return (
    <div className="flex flex-col items-center gap-1.5 select-none scale-90 md:scale-95">
      {/* การ์ดหลักของปุ่มซูม – แนวตั้ง & ขนาดเล็กลง */}
      <div className="bg-white/90 backdrop-blur-md p-1.5 rounded-xl shadow-lg border border-slate-200 flex flex-col items-center gap-1.5">
        {/* Zoom In ด้านบน – ปุ่มเล็กลง */}
        <button
          onClick={handleZoomIn}
          className="w-8 h-8 bg-rose-50 text-rose-500 rounded-lg flex items-center justify-center hover:bg-rose-500 hover:text-white active:scale-90 transition-all shadow-sm border border-rose-100"
        >
          <ZoomIn size={16} strokeWidth={2.5} />
        </button>

        {/* Slider แนวตั้ง – เตี้ยลง / เล็กลง */}
        <div className="flex flex-col items-center gap-1">
          <input
            type="range"
            min="0.5"
            max="1.5"
            step="0.05"
            value={value}
            onChange={handleSliderChange}
            className="vertical-slider h-24 md:h-28"
          />
          <span className="text-[9px] font-semibold text-slate-500 tracking-wide">
            {Math.round(value * 100)}%
          </span>
        </div>

        {/* Zoom Out ด้านล่าง – ปุ่มเล็กลง */}
        <button
          onClick={handleZoomOut}
          className="w-8 h-8 bg-indigo-50 text-indigo-500 rounded-lg flex items-center justify-center hover:bg-indigo-500 hover:text-white active:scale-90 transition-all shadow-sm border border-indigo-100"
        >
          <ZoomOut size={16} strokeWidth={2.5} />
        </button>
      </div>

      {/* ปุ่มรีเซ็ต – เล็กลงให้สมดุล */}
      {value !== 1.0 && (
        <button
          onClick={handleReset}
          className="mt-1 flex items-center gap-1.5 px-2.5 py-1 bg-slate-700 text-white rounded-full shadow-lg hover:bg-slate-600 active:scale-95 transition-all"
        >
          <RefreshCcw size={12} strokeWidth={2.4} />
          <span className="font-bold text-[10px]">คืนค่าเดิม</span>
        </button>
      )}

      {/* CSS ทำ Slider แนวตั้ง + เล็กลง */}
      <style>{`
        input.vertical-slider {
          writing-mode: bt-lr;
          -webkit-appearance: slider-vertical;
          width: 6px;
        }
        input.vertical-slider::-webkit-slider-runnable-track {
          width: 6px;
          height: 100%;
          cursor: pointer;
          background: #E2E8F0;
          border-radius: 999px;
        }
        input.vertical-slider::-webkit-slider-thumb {
          -webkit-appearance: none;
          height: 16px;
          width: 16px;
          border-radius: 50%;
          background: #F43F5E;
          cursor: pointer;
          box-shadow: 0 2px 4px rgba(0,0,0,0.2);
          border: 2px solid white;
        }
      `}</style>
    </div>
  );
}
