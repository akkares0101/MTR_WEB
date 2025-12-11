// src/pages/TeacherModePage.jsx
import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, PenLine, Eraser, QrCode } from "lucide-react";
import QRCode from "react-qr-code";

const AGE_OPTIONS = [
  { id: "2-3", label: "2-3 ปี" },
  { id: "3-4", label: "3-4 ปี" },
  { id: "4-5", label: "4-5 ปี" },
  { id: "5-6", label: "5-6 ปี" },
];

// 🔹 กระดาษ 1 ใบ (สำหรับให้น้องเขียน / วาด)
function DrawingPaper({
  index,
  label,
  penColor,
  penSize,
  toolMode,
  paperSize,
  paperCount,       
  onRegisterClear,
}) {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const resize = () => {
      const rect = container.getBoundingClientRect();
      const ctx = canvas.getContext("2d");

      // ขนาดจริงของ canvas = ขนาดที่เห็นบนหน้าจอ (1:1)
      canvas.width = rect.width;
      canvas.height = rect.height;

      ctx.lineCap = "round";
      ctx.lineJoin = "round";
    };

    resize();
    window.addEventListener("resize", resize);
    return () => window.removeEventListener("resize", resize);
  }, [paperSize, paperCount]);

  const getPos = (e) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();

    if (e.touches && e.touches[0]) {
      return {
        x: e.touches[0].clientX - rect.left,
        y: e.touches[0].clientY - rect.top,
      };
    }

    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };
  };

  const setupTool = (ctx) => {
    if (toolMode === "eraser") {
      ctx.globalCompositeOperation = "destination-out";
      ctx.globalAlpha = 1;
      ctx.lineWidth = penSize * 2;
    } else if (toolMode === "pen") {
      ctx.globalCompositeOperation = "source-over";
      ctx.globalAlpha = 1;
      ctx.strokeStyle = penColor;
      ctx.lineWidth = penSize;
    } else if (toolMode === "highlighter") {
      ctx.globalCompositeOperation = "multiply";
      ctx.globalAlpha = 0.35;
      ctx.strokeStyle = "#facc15";
      ctx.lineWidth = penSize * 2;
    }
  };

  const handleStart = (e) => {
    e.preventDefault();
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const { x, y } = getPos(e);

    setupTool(ctx);
    ctx.beginPath();
    ctx.moveTo(x, y);
    setIsDrawing(true);
  };

  const handleMove = (e) => {
    if (!isDrawing) return;
    e.preventDefault();
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const { x, y } = getPos(e);
    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const handleEnd = (e) => {
    if (e) e.preventDefault();
    setIsDrawing(false);
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    ctx.globalAlpha = 1;
    ctx.globalCompositeOperation = "source-over";
  };

  const clearPaper = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    ctx.globalCompositeOperation = "source-over";
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  };

  // ลงทะเบียนฟังก์ชันลบ ให้พ่อเรียก "ลบทุกใบ"
  useEffect(() => {
    if (onRegisterClear) onRegisterClear(clearPaper);
    // register ตอน mount ครั้งเดียว
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleDownload = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const link = document.createElement("a");
    link.download = `board-${index + 1}.png`;
    link.href = canvas.toDataURL("image/png");
    link.click();
  };

  // ✅ ความสูงกระดาษ (เท่ากันทุกใบ / แต่ต่างกันชัดเจนตามขนาดที่เลือก)
  const baseHeightBySize = {
    s: 180, // เล็ก
    m: 260, // กลาง
    l: 340, // ใหญ่
  };
  const minHeight = baseHeightBySize[paperSize] || 260;

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden flex flex-col">
      {/* แถบหัวกระดาษ */}
      <div className="px-3 py-1 bg-sky-50 border-b border-sky-100 text-[10px] font-bold text-sky-700 flex items-center justify-between">
        <span>{label}</span>
        <span className="text-[9px] text-slate-400">เขียนด้วยมือ / วาดรูป</span>
      </div>

      {/* พื้นที่วาด (ลายจุดแบบกระดาษโน้ต) */}
      <div
        ref={containerRef}
        className="flex-1 touch-none relative bg-[radial-gradient(circle,_rgba(148,163,184,0.18)_1px,_transparent_1px)] bg-[length:12px_12px]"
        style={{ minHeight }}
      >
        <canvas
          ref={canvasRef}
          className="w-full h-full cursor-crosshair"
          onMouseDown={handleStart}
          onMouseMove={handleMove}
          onMouseUp={handleEnd}
          onMouseLeave={handleEnd}
          onTouchStart={handleStart}
          onTouchMove={handleMove}
          onTouchEnd={handleEnd}
        />
      </div>

      {/* ปุ่มล่างของแต่ละใบ */}
      <div className="px-3 py-1.5 bg-slate-50 border-t border-slate-100 flex justify-between gap-2">
        <button
          type="button"
          onClick={clearPaper}
          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-rose-50 text-rose-500 border border-rose-100 hover:bg-rose-100 text-[10px] font-bold"
        >
          <Eraser size={12} />
          ลบใบนี้
        </button>

        <button
          type="button"
          onClick={handleDownload}
          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-indigo-50 text-indigo-600 border border-indigo-100 hover:bg-indigo-100 text-[10px] font-bold"
        >
          ⬇️ ดาวน์โหลด
        </button>
      </div>
    </div>
  );
}

export default function TeacherModePage() {
  const navigate = useNavigate();

  const [age, setAge] = useState("4-5");
  const [topic, setTopic] = useState("ทบทวนตัวอักษร A–Z");

  const [tool, setTool] = useState("pen");
  const [penColor, setPenColor] = useState("#0f172a");
  const [penSize, setPenSize] = useState(4);

  const [paperCount, setPaperCount] = useState(4); // 1–4 ใบ
  const [paperSize, setPaperSize] = useState("m"); // s | m | l

  const [clearFns, setClearFns] = useState([]);
  const [showQR, setShowQR] = useState(false);
  const [qrValue, setQrValue] = useState("");

  useEffect(() => {
    if (typeof window !== "undefined") {
      setQrValue(window.location.href);
    }
  }, []);

  const registerClearFn = (index) => (fn) => {
    setClearFns((prev) => {
      const next = [...prev];
      next[index] = fn;
      return next;
    });
  };

  const clearAll = () => {
    clearFns.slice(0, paperCount).forEach(
      (fn) => typeof fn === "function" && fn()
    );
  };

  const penColors = [
    "#0f172a",
    "#6b7280",
    "#dc2626",
    "#ea580c",
    "#ca8a04",
    "#16a34a",
    "#0ea5e9",
    "#6366f1",
    "#db2777",
  ];

  return (
    <div className="min-h-screen w-full bg-[#FDFBF7] flex flex-col">
      {/* Header ด้านบนสำหรับครู */}
      <header className="h-14 px-4 md:px-8 flex items-center justify-between bg-white/85 backdrop-blur-md shadow-sm border-b border-slate-100">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="hidden sm:inline-flex items-center gap-2 text-[11px] font-bold text-slate-400 hover:text-indigo-500 px-3 py-1.5 rounded-full border border-slate-200 hover:border-indigo-200 bg-white transition-all"
          >
            <ArrowLeft size={14} />
            <span>กลับไปหน้าเด็ก</span>
          </button>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-sky-100 to-emerald-100 flex items-center justify-center text-lg shadow-inner border-2 border-white">
              👩‍🏫
            </div>
            <div>
              <p className="text-[9px] text-emerald-500 font-bold uppercase tracking-[0.22em]">
                Teacher TV Mode
              </p>
              <p className="text-sm font-black text-slate-800 leading-tight">
                กระดานสำหรับเด็กอนุบาลขึ้นมาเขียน
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={() => setShowQR(true)}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-100 hover:bg-emerald-100 text-[11px] font-bold"
        >
          <QrCode size={14} />
          QR ดาวน์โหลด
        </button>
      </header>

      {/* แถวเลือกช่วงอายุ + หัวข้อวันนี้ */}
      <section className="px-4 md:px-8 pt-3">
        <div className="bg-white/90 rounded-2xl border border-slate-100 px-4 py-3 md:px-6 md:py-3.5 shadow-sm flex flex-col md:flex-row gap-3 md:gap-6 items-start md:items-center justify-between">
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.3em] mb-1">
              ช่วงอายุ
            </p>
            <div className="flex flex-wrap gap-1.5">
              {AGE_OPTIONS.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setAge(item.id)}
                  className={`px-2.5 py-1 rounded-full text-[11px] font-bold border ${
                    age === item.id
                      ? "bg-emerald-500 text-white border-emerald-500"
                      : "bg-slate-50 text-slate-600 border-slate-200 hover:border-emerald-300 hover:bg-emerald-50"
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex-1 min-w-[200px]">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.3em] mb-1">
              หัวข้อวันนี้
            </p>
            <input
              type="text"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              className="w-full text-sm md:text-[15px] font-bold text-slate-700 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400"
              placeholder="เช่น ฝึกนับเลข 1–10 / ทบทวน A–Z"
            />
          </div>

          <div className="text-[10px] text-slate-400">
            * ครูเลือกจำนวนกระดาษตามจำนวนน้องที่จะขึ้นมาเขียน
          </div>
        </div>
      </section>

      {/* พื้นที่หลัก: กระดาษหลายใบ + กระดานห้องเรียน */}
      <main className="flex-1 px-4 md:px-8 pb-3 md:pb-4 mt-2 flex flex-col justify-between">
        <div className="flex-1 flex items-center">
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            className="w-[97%] max-w-7xl mx-auto bg-gradient-to-br from-sky-50 via-white to-emerald-50 rounded-[2rem] shadow-[0_18px_50px_rgba(15,23,42,0.15)] border border-slate-100 p-3 md:p-4 lg:p-5 flex flex-col h-[68vh]"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="inline-flex items-center gap-2 bg-white/90 rounded-full px-3 py-1 border border-slate-100 shadow-sm">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-[11px] font-semibold text-slate-600 tracking-[0.18em] uppercase">
                  กระดานห้องเรียน
                </span>
                <span className="text-[11px] text-slate-400 ml-2">
                  ช่วงอายุ {age} ปี
                </span>
              </div>
              <div className="hidden md:flex items-center gap-2 text-[11px] text-slate-500">
                <PenLine size={14} />
                <span>ใช้เมาส์ หรือจอสัมผัสเขียนได้เลย</span>
              </div>
            </div>

            {/* กริดกระดาษ: จำนวนใบกำหนดคอลัมน์ */}
            <div
              className={
                paperCount === 1
                  ? "grid grid-cols-1 gap-3 md:gap-4 h-full"
                  : paperCount === 2
                  ? "grid grid-cols-2 gap-3 md:gap-4 h-full"
                  : paperCount === 3
                  ? "grid grid-cols-3 gap-3 md:gap-4 h-full"
                  : "grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 h-full"
              }
            >
              {Array.from({ length: paperCount }).map((_, index) => (
                <DrawingPaper
                  key={index}
                  index={index}
                  label={`กระดาษของน้องคนที่ ${index + 1}`}
                  penColor={penColor}
                  penSize={penSize}
                  toolMode={tool}
                  paperSize={paperSize}
                  paperCount={paperCount}   
                  onRegisterClear={registerClearFn(index)}
                />
              ))}
            </div>
          </motion.div>
        </div>

        {/* Toolbar ล่าง */}
        <div className="mt-3 bg-white/95 rounded-2xl md:rounded-full px-3 md:px-6 py-2.5 flex flex-wrap items-center gap-3 border border-slate-100 shadow-sm">
          {/* เครื่องมือ */}
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-semibold text-slate-500 mr-1">
              เครื่องมือ:
            </span>
            <button
              type="button"
              onClick={() => setTool("pen")}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-bold border ${
                tool === "pen"
                  ? "bg-slate-900 text-white border-slate-900"
                  : "bg-white text-slate-600 border-slate-200 hover:bg-slate-100"
              }`}
            >
              <PenLine size={14} />
              ปากกา
            </button>
            <button
              type="button"
              onClick={() => setTool("highlighter")}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-bold border ${
                tool === "highlighter"
                  ? "bg-amber-400 text-white border-amber-500"
                  : "bg-white text-slate-600 border-slate-200 hover:bg-amber-50"
              }`}
            >
              🖍 ไฮไลท์
            </button>
            <button
              type="button"
              onClick={() => setTool("eraser")}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-bold border ${
                tool === "eraser"
                  ? "bg-rose-500 text-white border-rose-500"
                  : "bg-white text-slate-600 border-slate-200 hover:bg-rose-50"
              }`}
            >
              <Eraser size={14} />
              ยางลบ
            </button>
          </div>

          {/* สีปากกา */}
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-semibold text-slate-500 mr-1">
              สี:
            </span>
            {penColors.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setPenColor(c)}
                className={`w-7 h-7 rounded-full border-2 transition-transform ${
                  penColor === c
                    ? "border-slate-900 scale-110"
                    : "border-slate-200 hover:scale-105"
                }`}
                style={{ backgroundColor: c }}
              />
            ))}
          </div>

          {/* ขนาดเส้น */}
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-semibold text-slate-500">
              เส้น:
            </span>
            {[3, 6].map((size) => (
              <button
                key={size}
                type="button"
                onClick={() => setPenSize(size)}
                className={`px-3 py-1 rounded-full text-[11px] font-bold border flex items-center gap-1 ${
                  penSize === size
                    ? "bg-slate-900 text-white border-slate-900"
                    : "bg-white text-slate-500 border-slate-200 hover:bg-slate-100"
                }`}
              >
                <span
                  className="inline-block rounded-full bg-slate-500"
                  style={{
                    width: size / 2 + 4,
                    height: size / 2 + 4,
                  }}
                />
                {size === 3 ? "เล็ก" : "ใหญ่"}
              </button>
            ))}
          </div>


          {/* จำนวนกระดาษ */}
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-semibold text-slate-500">
              จำนวนกระดาษ:
            </span>
            {[1, 2, 3, 4].map((n) => (
              <button
                key={n}
                type="button"
                onClick={() => setPaperCount(n)}
                className={`px-3 py-1 rounded-full text-[11px] font-bold border ${
                  paperCount === n
                    ? "bg-emerald-500 text-white border-emerald-500"
                    : "bg-white text-slate-500 border-slate-200 hover:bg-emerald-50"
                }`}
              >
                {n} ใบ
              </button>
            ))}
          </div>

          {/* ลบทั้งหมด */}
          <button
            type="button"
            onClick={clearAll}
            className="ml-auto inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-[11px] font-bold bg-rose-50 text-rose-500 border border-rose-100 hover:bg-rose-100"
          >
            <Eraser size={14} />
            ลบกระดาษทั้งหมด
          </button>
        </div>
      </main>

      {/* QR Modal */}
      <AnimatePresence>
        {showQR && (
          <motion.div
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowQR(false)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 10, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.9, y: 10, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl p-6 shadow-xl max-w-sm w-full border border-slate-100 text-center"
            >
              <h2 className="text-base font-bold text-slate-800 mb-2">
                สแกน QR เพื่อเปิดบนมือถือ
              </h2>
              <p className="text-[11px] text-slate-500 mb-4">
                ผู้ปกครอง / ครูสามารถสแกนเพื่อเปิดหน้านี้บนมือถือ
                แล้วกดดาวน์โหลดภาพจากแต่ละกระดาษได้
              </p>
              <div className="bg-slate-50 rounded-2xl p-4 mb-4 inline-block">
                {qrValue && (
                  <QRCode
                    value={qrValue}
                    size={180}
                    fgColor="#0f172a"
                    bgColor="#f8fafc"
                  />
                )}
              </div>
              <button
                type="button"
                onClick={() => setShowQR(false)}
                className="mt-1 inline-flex items-center justify-center px-4 py-2 rounded-full bg-slate-900 text-white text-xs font-bold hover:bg-slate-800"
              >
                ปิดหน้าต่าง
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
