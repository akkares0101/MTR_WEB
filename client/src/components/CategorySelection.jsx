import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  Search,
  Loader,
  BookOpen,
  Calculator,
  FlaskConical,
  Palette,
  Languages,
  Globe,
  Puzzle,
  Shapes,
  Sparkles,
  CheckCircle2,
  Cloud,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { API } from "../services/api";

// ฟังก์ชันเลือกธีมสี
const getStyle = (index) => {
  const styles = [
    {
      color: "purple",
      icon: BookOpen,
      border: "border-purple-200",
      text: "text-purple-600",
      subText: "text-purple-500",
      iconBg: "bg-purple-50",
      hover: "hover:border-purple-400",
    },
    {
      color: "blue",
      icon: Calculator,
      border: "border-sky-200",
      text: "text-sky-600",
      subText: "text-sky-500",
      iconBg: "bg-sky-50",
      hover: "hover:border-sky-400",
    },
    {
      color: "green",
      icon: FlaskConical,
      border: "border-emerald-200",
      text: "text-emerald-600",
      subText: "text-emerald-500",
      iconBg: "bg-emerald-50",
      hover: "hover:border-emerald-400",
    },
    {
      color: "pink",
      icon: Palette,
      border: "border-rose-200",
      text: "text-rose-600",
      subText: "text-rose-500",
      iconBg: "bg-rose-50",
      hover: "hover:border-rose-400",
    },
    {
      color: "yellow",
      icon: Shapes,
      border: "border-amber-200",
      text: "text-amber-600",
      subText: "text-amber-500",
      iconBg: "bg-amber-50",
      hover: "hover:border-amber-400",
    },
    {
      color: "orange",
      icon: Puzzle,
      border: "border-orange-200",
      text: "text-orange-600",
      subText: "text-orange-500",
      iconBg: "bg-orange-50",
      hover: "hover:border-orange-400",
    },
    {
      color: "teal",
      icon: Globe,
      border: "border-teal-200",
      text: "text-teal-600",
      subText: "text-teal-500",
      iconBg: "bg-teal-50",
      hover: "hover:border-teal-400",
    },
    {
      color: "indigo",
      icon: Languages,
      border: "border-indigo-200",
      text: "text-indigo-600",
      subText: "text-indigo-500",
      iconBg: "bg-indigo-50",
      hover: "hover:border-indigo-400",
    },
  ];
  return styles[index % styles.length];
};

export default function CategorySelection({ ageRange, onBack, onSearch }) {
  const [categories, setCategories] = useState([]);
  const [selectedIds, setSelectedIds] = useState([]); // ✅ เก็บเป็น id กันชื่อซ้ำ
  const [loading, setLoading] = useState(true);

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  useEffect(() => {
    const fetchCategories = async () => {
      setLoading(true);
      try {
        const allCats = await API.getCategories();

        const filteredCats = (allCats || []).filter((c) => {
          const catAge = c.ageGroup ?? c.age_group;
          return catAge === ageRange;
        });

        setCategories(filteredCats);
        setSelectedIds([]); // ✅ เปลี่ยนอายุแล้วล้างการเลือก
        setCurrentPage(1);
      } catch (error) {
        console.error("Failed to fetch categories:", error);
      }
      setLoading(false);
    };

    fetchCategories();
  }, [ageRange]);

  const toggleCat = (catId) => {
    setSelectedIds((prev) =>
      prev.includes(catId) ? prev.filter((x) => x !== catId) : [...prev, catId]
    );
  };

  // Pagination Logic
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = categories.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(categories.length / itemsPerPage) || 1;

  const goToNextPage = () => {
    if (currentPage < totalPages) setCurrentPage((prev) => prev + 1);
  };
  const goToPrevPage = () => {
    if (currentPage > 1) setCurrentPage((prev) => prev - 1);
  };
  const goToPage = (n) => setCurrentPage(n);

  const pageNumbers = useMemo(() => {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }, [totalPages]);

  // ✅ ส่งออกเป็น "ชื่อวิชา" ให้เหมือนเดิม (แต่ปลอดภัยกว่าด้วยการเก็บ id ภายใน)
  const selectedNames = useMemo(() => {
    const map = new Map(categories.map((c) => [c.id, c.name]));
    return selectedIds.map((id) => map.get(id)).filter(Boolean);
  }, [selectedIds, categories]);

  return (
    <div className="h-full w-full flex flex-col relative bg-[#FDFBF7] overflow-hidden font-body">
      {/* Background Decor หลัก */}
      <div className="absolute top-0 right-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-10 right-[5%] text-rose-200/40 animate-pulse hidden md:block">
          <Sparkles size={100} strokeWidth={1} />
        </div>
        <div className="absolute bottom-20 left-[5%] text-sky-200/40 hidden md:block animate-[bounce_8s_infinite]">
          <Cloud size={120} fill="currentColor" strokeWidth={0} />
        </div>
      </div>

      {/* 1. Header Section */}
      <div className="flex-none pt-3 pb-2 px-4 sm:px-6 md:px-10 z-10">
        <div className="w-full flex flex-col md:flex-row justify-between items-center gap-3 md:gap-4">
          {/* Title & Back Button */}
          <div className="flex flex-row md:flex-row items-center md:items-start gap-3 md:gap-4 w-full md:w-auto">
            <button
              onClick={onBack}
              className="group flex items-center justify-center w-10 h-10 sm:w-11 sm:h-11 md:w-12 md:h-12 rounded-full bg-white border-[3px] border-slate-100 text-slate-400 hover:text-rose-500 hover:border-rose-200 shadow-sm transition-all hover:scale-110 flex-shrink-0"
            >
              <ArrowLeft size={22} strokeWidth={3} className="sm:w-6 sm:h-6" />
            </button>

            <div className="text-center md:text-left">
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="inline-flex items-center gap-2 bg-white px-3 py-1 rounded-full border border-slate-100 shadow-sm mb-1"
              >
                <div className="w-2 h-2 rounded-full bg-rose-400 animate-pulse"></div>
                <span className="text-slate-500 font-bold text-[11px] sm:text-xs font-sans">
                  ห้องเรียนน้อง {ageRange}
                </span>
              </motion.div>

              {/* ✅ บังคับใช้ Kanit ชัวร์ ๆ */}
              <h1 className="font-sans text-2xl sm:text-3xl md:text-4xl font-black text-slate-700 leading-tight">
                <span className="text-indigo-500">อยากเก่ง</span>
                <span className="text-rose-400">วิชา</span>
                <span className="text-teal-500">ไหนบ้าง?</span>
              </h1>
            </div>
          </div>

          {/* Counter Badge */}
          <div className="mt-2 md:mt-0 bg-white/80 backdrop-blur-sm px-4 sm:px-5 py-1.5 sm:py-2 rounded-2xl border-[3px] border-slate-100 flex items-center gap-2 sm:gap-3 shadow-sm">
            <span className="text-[10px] sm:text-xs font-bold text-slate-400 uppercase tracking-wider font-sans">
              เลือกแล้ว
            </span>
            <span className="font-sans text-2xl sm:text-3xl font-black text-rose-500">
              {selectedIds.length}
            </span>
            <span className="text-[10px] sm:text-xs font-bold text-slate-400 font-sans">
              วิชา
            </span>
          </div>
        </div>
      </div>

      {/* 2. Scrollable Content Area */}
      <div className="flex-1 overflow-y-auto px-3 sm:px-4 md:px-8 pb-24 pt-1 md:pt-2">
        <div className="w-full h-full flex flex-col items-center">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-10 h-full">
              <Loader size={40} className="text-rose-400 animate-spin mb-4" />
              <p className="text-slate-400 font-bold text-base sm:text-lg animate-pulse font-sans">
                กำลังจัดเตรียมห้องเรียน...
              </p>
            </div>
          ) : categories.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 text-center opacity-70">
              <div className="bg-slate-100 p-5 rounded-full mb-4">
                <Search size={40} className="text-slate-300" />
              </div>
              <h3 className="font-sans text-slate-500 font-bold text-lg sm:text-xl">
                ยังไม่มีวิชาในหมวดนี้
              </h3>
            </div>
          ) : (
            <div className="w-full max-w-[1200px] md:max-w-[1400px] xl:max-w-[1600px] relative flex-1 flex flex-col justify-center">
              {/* เลเยอร์ฉากหลัง */}
              <div className="absolute inset-0 pointer-events-none -z-10">
                <div className="hidden lg:block absolute -left-6 top-1/2 -translate-y-1/2 w-40 h-40 xl:w-52 xl:h-52 rounded-[2rem] bg-gradient-to-br from-sky-50 to-indigo-50 border border-slate-100 shadow-md opacity-80" />
                <div className="hidden md:block absolute -right-4 bottom-4 w-36 h-36 lg:w-44 lg:h-44 rounded-full bg-gradient-to-tr from-emerald-50 via-teal-50 to-white border border-emerald-50 shadow-md opacity-80" />

                <div className="hidden sm:flex absolute left-2 bottom-1 lg:left-4 lg:bottom-3 items-center gap-2 bg-white/95 px-3 py-2 rounded-2xl border border-slate-100 shadow-sm max-w-[280px]">
                  <div className="w-8 h-8 rounded-xl bg-indigo-50 flex items-center justify-center border border-indigo-100">
                    <BookOpen className="w-4 h-4 text-indigo-500" />
                  </div>
                  <p className="text-[11px] leading-snug text-slate-500 font-semibold text-left">
                    เลือกได้มากกว่าหนึ่งวิชา เพื่อให้ระบบค้นหาใบงานตามความสนใจของน้อง ๆ
                  </p>
                </div>
              </div>

              <AnimatePresence mode="wait">
                <motion.div
                  key={currentPage}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                  className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 w-full content-center pb-2"
                >
                  {currentItems.map((cat, index) => {
                    const isActive = selectedIds.includes(cat.id);

                    // ✅ ใช้ globalIndex กันสี/ไอคอนเปลี่ยนไปมาเวลาเปลี่ยนหน้า
                    const globalIndex = indexOfFirstItem + index;
                    const style = getStyle(globalIndex);
                    const Icon = style.icon;

                    return (
                      <motion.div
                        key={cat.id}
                        whileHover={{ scale: 1.03, y: -4 }}
                        whileTap={{ scale: 0.96 }}
                        onClick={() => toggleCat(cat.id)}
                        className={`
                          relative p-3 sm:p-4 rounded-[1.6rem] cursor-pointer 
                          flex flex-col items-center justify-center text-center
                          bg-white border-[2.5px] group aspect-[4/3]
                          transition-all duration-300 shadow-sm hover:shadow-lg
                          ${
                            isActive
                              ? "border-rose-400 shadow-xl ring-4 ring-rose-100 z-10"
                              : `${style.border} ${style.hover}`
                          }
                        `}
                      >
                        <AnimatePresence>
                          {isActive && (
                            <motion.div
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              exit={{ scale: 0 }}
                              className="absolute top-2 right-2 sm:top-3 sm:right-3 text-rose-500 bg-white rounded-full p-0.5 shadow-sm z-20"
                            >
                              <CheckCircle2
                                size={22}
                                strokeWidth={3}
                                className="text-rose-500"
                                fill="currentColor"
                              />
                            </motion.div>
                          )}
                        </AnimatePresence>

                        <div
                          className={`
                            mb-2 sm:mb-3 p-2.5 sm:p-3 rounded-full shadow-inner 
                            transition-transform duration-300 border-2 border-white
                            ${
                              isActive
                                ? "bg-rose-100 scale-110"
                                : `${style.iconBg} group-hover:scale-110`
                            }
                          `}
                        >
                          <Icon
                            className={`${
                              isActive ? "text-rose-500" : style.text
                            } w-8 h-8 sm:w-9 sm:h-9 md:w-10 md:h-10 stroke-[2.5px]`}
                          />
                        </div>

                        {/* ✅ ชื่อวิชาใช้ Kanit */}
                        <h3
                          className={`
                            font-sans text-sm sm:text-base md:text-lg font-black leading-tight
                            ${isActive ? "text-rose-600" : "text-slate-700"}
                          `}
                        >
                          {cat.name}
                        </h3>
                      </motion.div>
                    );
                  })}
                </motion.div>
              </AnimatePresence>
            </div>
          )}
        </div>
      </div>

      {/* Pagination */}
      {!loading && totalPages > 1 && (
        <div className="absolute bottom-4 sm:bottom-5 left-0 right-0 z-30 flex justify-center pointer-events-none">
          <div className="pointer-events-auto flex items-center gap-3 sm:gap-4 bg-white/95 backdrop-blur px-4 sm:px-6 py-1.5 sm:py-2 rounded-[1.6rem] sm:rounded-[2rem] shadow-md sm:shadow-lg border border-slate-100">
            <button
              onClick={goToPrevPage}
              disabled={currentPage === 1}
              className={`
                flex items-center justify-center rounded-full transition-all border-2
                w-9 h-9 sm:w-11 sm:h-11
                ${
                  currentPage === 1
                    ? "text-slate-300 border-slate-100 cursor-not-allowed"
                    : "text-rose-400 border-rose-100 hover:bg-rose-50 hover:text-rose-600 hover:border-rose-300"
                }
              `}
            >
              <ChevronLeft size={18} strokeWidth={3} className="sm:w-6 sm:h-6" />
            </button>

            <div className="flex items-center gap-1.5 sm:gap-3">
              {pageNumbers.map((number) => (
                <button
                  key={number}
                  onClick={() => goToPage(number)}
                  className={`
                    font-sans rounded-full font-black transition-all border-2
                    w-9 h-9 sm:w-11 sm:h-11 text-sm sm:text-base
                    ${
                      currentPage === number
                        ? "bg-[#FF3366] text-white border-[#FF3366] shadow-md shadow-rose-200 scale-105 sm:scale-110"
                        : "bg-white text-slate-400 border-slate-100 hover:text-rose-500 hover:border-rose-100"
                    }
                  `}
                >
                  {number}
                </button>
              ))}
            </div>

            <button
              onClick={goToNextPage}
              disabled={currentPage === totalPages}
              className={`
                flex items-center justify-center rounded-full transition-all border-2
                w-9 h-9 sm:w-11 sm:h-11
                ${
                  currentPage === totalPages
                    ? "text-slate-300 border-slate-100 cursor-not-allowed"
                    : "text-rose-400 border-rose-100 hover:bg-rose-50 hover:text-rose-600 hover:border-rose-300"
                }
              `}
            >
              <ChevronRight size={18} strokeWidth={3} className="sm:w-6 sm:h-6" />
            </button>
          </div>
        </div>
      )}

      {/* Action Button */}
      <AnimatePresence>
        {selectedIds.length > 0 && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            className="absolute bottom-16 sm:bottom-20 right-3 sm:right-6 z-40"
          >
            <button
              onClick={() => onSearch(selectedNames)} // ✅ ส่งชื่อเหมือนเดิม
              className="
                font-sans flex items-center gap-2 sm:gap-2.5
                bg-gradient-to-r from-rose-500 to-indigo-600
                text-white text-sm sm:text-base md:text-lg font-bold
                py-2.5 sm:py-3 px-4 sm:px-6
                rounded-full
                shadow-2xl shadow-rose-500/40
                border-[2.5px] border-white/70 backdrop-blur-md
                hover:scale-105 hover:-translate-y-1 active:scale-95
                transition-all
                min-w-[180px] sm:min-w-[210px]
              "
            >
              <Search size={20} className="sm:w-6 sm:h-6" strokeWidth={3} />
              <span>ค้นหาใบงาน</span>
              <span className="bg-white/20 px-2 py-0.5 rounded-lg text-xs sm:text-sm font-black min-w-[24px] text-center">
                {selectedIds.length}
              </span>
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
