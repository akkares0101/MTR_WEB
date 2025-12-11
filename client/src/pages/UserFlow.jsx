// src/pages/UserFlow.jsx
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { AuthService } from "../services/authService";
import { motion, AnimatePresence } from "framer-motion";
import logo from "../assets/logo/MTR.jpg";

import AgeSelection from "../components/AgeSelection";
import CategorySelection from "../components/CategorySelection";
import ResultsPage from "./ResultsPage";
import ZoomControls from "../components/ZoomControls";
import { ChevronRight } from "lucide-react";

export default function UserFlow() {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState(null);

  // Flow
  const [step, setStep] = useState(1);
  const [age, setAge] = useState("");
  const [cats, setCats] = useState([]);

  // Zoom
  const [zoom, setZoom] = useState(1.0);

  useEffect(() => {
    const user = AuthService.getCurrentUser();
    if (user) setCurrentUser(user);
  }, []);

  const handleLogout = () => {
    AuthService.logout();
    navigate("/");
  };

  return (
    // 🔹 Background Wrapper: gradient เต็มจอ
    <div className="h-screen w-screen overflow-hidden bg-gradient-to-br from-sky-50 via-white to-pink-50 relative flex items-center justify-center">
      {/* 🌈 Soft gradient blobs */}
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-24 -left-10 w-56 sm:w-60 h-56 sm:h-60 rounded-full bg-sky-100/70 blur-3xl" />
        <div className="absolute -bottom-24 -right-16 w-64 sm:w-72 h-64 sm:h-72 rounded-full bg-pink-100/70 blur-3xl" />
        <div className="absolute top-1/3 -right-10 w-32 sm:w-40 h-32 sm:h-40 rounded-full bg-emerald-100/60 blur-2xl" />
        <div className="absolute bottom-10 left-1/4 w-28 sm:w-32 h-28 sm:h-32 rounded-full bg-indigo-100/60 blur-2xl" />
      </div>

      {/* 🔍 ปุ่ม Zoom – มุมซ้ายล่าง */}
      <div className="absolute left-3 bottom-3 z-30">
        <ZoomControls value={zoom} onZoomChange={setZoom} />
      </div>

      {/* ==================== ส่วนเนื้อหาที่จะถูกย่อ/ขยาย ==================== */}
      <div
        style={{
          transform: `scale(${zoom})`,
          transformOrigin: "center center",
          transition: "transform 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94)",
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
        }}
      >
        {/* 🔹 Navbar */}
        <div className="flex-none h-14 sm:h-16 px-4 sm:px-6 md:px-12 flex justify-between items-center bg-white/90 backdrop-blur-md shadow-sm z-20 border-b border-slate-100/70">
          <div className="flex items-center gap-3 sm:gap-4">
            {/* โลโก้จาก assets */}
            <div className="relative flex-shrink-0">
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl shadow-inner shadow-indigo-100 border-[3px] border-white bg-white overflow-hidden flex items-center justify-center">
                <img
                  src={logo}
                  alt="Kids Learning Logo"
                  className="w-full h-full object-contain"
                />
              </div>
              <div className="absolute -bottom-1 -right-1 px-1.5 py-[1px] rounded-full bg-emerald-500 text-[8px] sm:text-[9px] font-bold text-white shadow-sm">
                LIVE
              </div>
            </div>

            <div>
              <p className="text-[9px] sm:text-[10px] text-slate-400 font-bold uppercase tracking-[0.2em] sm:tracking-[0.25em]">
                Kids Learning • Media &amp; Training
              </p>
              <p className="text-sm md:text-base text-slate-900 font-black leading-tight">
                ยินดีต้อนรับ,{" "}
                <span className="text-indigo-600">
                  {currentUser?.username || "ผู้ใช้งาน"}
                </span>
              </p>
            </div>
          </div>

          {/* ปุ่ม Logout (เปิดใช้ภายหลังได้) */}
          {/*
          <button
            onClick={handleLogout}
            className="hidden md:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-rose-100 bg-rose-50 text-[10px] font-bold text-rose-500 hover:bg-rose-100 hover:border-rose-200 transition-all"
          >
            ออกจากระบบ
          </button>
          */}
        </div>

        {/* 🔹 Content Area */}
        <div className="flex-1 flex justify-center items-center overflow-hidden relative p-3 sm:p-4 md:p-6">
          {/* เฟรมหลักของเนื้อหา */}
          <div className="w-full h-full flex flex-col justify-center relative">
            {/* แถบหัวข้อด้านบนของจอหลัก */}
            <div className="flex items-center justify-between mb-2 sm:mb-3 md:mb-4 px-2 sm:px-4 md:px-8 lg:px-12">
              <div className="inline-flex items-center gap-2 bg-white/90 px-3 py-1.5 rounded-full border border-slate-100 shadow-sm">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-[10px] sm:text-[11px] font-semibold text-slate-600 tracking-[0.16em] sm:tracking-[0.18em] uppercase">
                  Student View
                </span>
                <span className="hidden sm:inline text-[10px] sm:text-[11px] text-slate-400 ml-1.5">
                  เลือกห้องเรียนตามช่วงอายุของเด็ก
                </span>
              </div>

              <div className="hidden md:inline-flex items-center gap-2 text-[11px] text-slate-400 mr-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
                <span>รองรับโหมดคุณครูสอนผ่านจอทีวี</span>
              </div>
            </div>

            {/* แพเนลหลักของเด็ก (เป็น "จอ" กลาง) */}
            <div className="flex-1 w-full px-1 sm:px-2 md:px-4 lg:px-8 pb-2 md:pb-3">
              {/* ⬇ ปรับให้จอกว้างขึ้น: max-w-[1440px] เหมาะกับทีวี Full HD */}
              <div className="w-full h-full max-w-[1440px] mx-auto bg-white/80 border border-slate-100 rounded-[1.6rem] sm:rounded-[1.8rem] shadow-[0_16px_40px_rgba(15,23,42,0.14)] overflow-hidden flex flex-col">
                <div className="flex-1 p-2 sm:p-3 md:p-4 lg:p-6">
                  <AnimatePresence mode="wait">
                    {step === 1 && (
                      <motion.div
                        key="1"
                        className="w-full h-full flex flex-col justify-center"
                        initial={{ opacity: 0, scale: 0.97, y: 10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 1.03, y: -10 }}
                        transition={{ duration: 0.35 }}
                      >
                        <AgeSelection
                          onSelectAge={(a) => {
                            setAge(a);
                            setStep(2);
                          }}
                        />
                      </motion.div>
                    )}

                    {step === 2 && (
                      <motion.div
                        key="2"
                        className="w-full h-full flex flex-col justify-center"
                        initial={{ opacity: 0, x: 40 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -40 }}
                        transition={{ duration: 0.35 }}
                      >
                        <CategorySelection
                          ageRange={age}
                          onBack={() => setStep(1)}
                          onSearch={(selectedCats) => {
                            setCats(selectedCats);
                            setStep(3);
                          }}
                        />
                      </motion.div>
                    )}

                    {step === 3 && (
                      <motion.div
                        key="3"
                        className="w-full h-full flex flex-col justify-center"
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -30 }}
                        transition={{ duration: 0.35 }}
                      >
                        <div className="h-full w-full">
                          <ResultsPage
                            age={age}
                            categories={cats}
                            onBack={() => setStep(2)}
                          />
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </div>

            {/* 🔹 ปุ่ม Teacher Mode – มุมขวาล่าง, คลิกง่าย, อยู่บนสุด */}
            <div className="absolute bottom-3 right-3 md:bottom-4 md:right-6 z-40 pointer-events-none">
              <motion.button
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                onClick={() => navigate("/teacher")}
                aria-label="เข้าสู่โหมดสำหรับคุณครูสอนเด็กอนุบาล"
                className="
                  pointer-events-auto
                  flex items-center gap-3
                  px-4 md:px-5 py-2.5 md:py-3
                  rounded-2xl md:rounded-3xl
                  bg-white/95
                  border border-emerald-200
                  shadow-lg shadow-emerald-100
                  hover:shadow-xl
                  hover:border-emerald-400
                  active:translate-y-[1px]
                  transition-all
                  min-w-[220px] sm:min-w-[230px]
                "
              >
                <div className="w-8 h-8 md:w-9 md:h-9 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center shadow-inner shadow-emerald-200">
                  <span className="text-[10px] md:text-xs font-black text-white tracking-[0.14em]">
                    TE
                  </span>
                </div>

                <div className="flex flex-col items-start leading-tight">
                  <span className="text-[10px] md:text-[11px] font-semibold text-emerald-500 tracking-[0.16em] uppercase">
                    Teacher Mode
                  </span>
                  <span className="text-[11px] md:text-xs lg:text-sm font-bold text-slate-800">
                    โหมดสำหรับคุณครูสอนเด็กอนุบาล
                  </span>
                  <span className="hidden md:inline text-[10px] text-slate-400 mt-0.5">
                    คลิกเพื่อเปิดหน้าจอสอนบนทีวีในห้องเรียน
                  </span>
                </div>

                <ChevronRight className="w-4 h-4 text-emerald-500 md:w-5 md:h-5" />
              </motion.button>
            </div>
          </div>
        </div>
      </div>
      {/* =================================================================== */}
    </div>
  );
}
