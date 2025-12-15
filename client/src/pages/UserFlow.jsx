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

        {/* 🔍 ปุ่ม Zoom – ติดขอบขวากลางจอ เห็นชัดทุกหน้า */}
     <div className="fixed left-2 sm:left-3 md:left-4 top-1/2 -translate-y-0.5/2 z-[9999] pointer-events-auto">
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
              <div className="w-11 h-11 sm:w-15 sm:h-15 rounded-2xl shadow-inner shadow-indigo-100 border-[3px] border-white bg-white overflow-hidden flex items-center justify-center">
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
                •Kids Learning By:Media &amp; Training
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
          {/* ... */}
        </div>

        {/* 🔹 Content Area */}
        <div className="flex-1 flex justify-center items-center overflow-hidden relative p-3 sm:p-4 md:p-6">
          {/* เฟรมหลักของเนื้อหา */}
          <div className="w-full h-full flex flex-col justify-center relative">
           

            {/* แพเนลหลักของเด็ก */}
            <div className="flex-1 w-full px-1 sm:px-2 md:px-4 lg:px-8 pb-2 md:pb-3">
              <div className="w-full h-full mx-auto bg-white/80 border border-slate-100 rounded-[1.6rem] sm:rounded-[1.8rem] shadow-[0_16px_40px_rgba(15,23,42,0.14)] overflow-hidden flex flex-col">
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
          </div>
        </div>
      </div>
      {/* =================================================================== */}
    </div>
  );
}
