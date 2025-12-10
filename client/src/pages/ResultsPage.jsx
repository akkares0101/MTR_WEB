import { useEffect, useState } from 'react';
import { API } from '../services/api';
import { motion, AnimatePresence } from 'framer-motion';
import { Download, ArrowLeft, SearchX, Loader, Eye, X, FileText, UploadCloud, Sparkles, ExternalLink, Tag } from 'lucide-react';
import QRCode from "react-qr-code";

export default function ResultsPage({ age, categories, onBack }) {
  const [worksheets, setWorksheets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [preview, setPreview] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // 1. ดึงข้อมูลทั้งหมดจาก API
        const allData = await API.getWorksheets();
        
        // 2. กรองข้อมูล (แก้ Logic ตรงนี้)
        const filtered = allData.filter(item => {
            // ดึงค่าอายุจากใบงาน (อาจจะเป็น "2-3" หรือ "2-3,3-4" ถ้าอัปโหลดหลายชั้น)
            const itemAgeString = String(item.ageRange || '').trim();
            
            // ดึงค่าอายุที่ User เลือกหน้าแรก (เช่น "2-3")
            const selectedAge = String(age || '').trim();

            // ✅ แก้ไข: ใช้ .includes แทน === 
            // แปลว่า: ถ้าในข้อมูลใบงาน "มีคำว่า 2-3 อยู่" ให้ถือว่าผ่าน
            const ageMatch = itemAgeString.includes(selectedAge);
            
            // เช็คหมวดวิชา
            const catMatch = categories.includes(item.category);
            
            return ageMatch && catMatch;
        });

        setWorksheets(filtered);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [age, categories]);

  return (
    <div className="min-h-screen bg-rose-50/50 pt-8 pb-24 px-4 relative">
        
        {/* Background Decor (Pink/Rose tone) */}
        <div className="absolute top-10 right-[5%] text-rose-100 hidden lg:block"><Sparkles size={1} strokeWidth={0.5}/></div>
        <div className="absolute bottom-0 left-[10%] text-sky-100 hidden lg:block"><Sparkles size={100} strokeWidth={0.5}/></div>

        <div className="max-w-7xl mx-auto">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                <div>
                    <button 
                        onClick={onBack} 
                        className="flex items-center text-slate-500 hover:text-rose-600 font-bold mb-3 transition-colors bg-white px-4 py-2 rounded-full shadow-md border border-rose-100 text-sm group"
                    >
                        <ArrowLeft size={18} className="mr-2 group-hover:-translate-x-1 transition-transform"/> เลือกวิชาใหม่
                    </button>
                    <h2 className="text-3xl font-bold font-display text-slate-800 flex items-center gap-2">
                        คลังใบงานน้อง <span className="text-rose-600">{age}</span>
                    </h2>
                </div>
                
                {/* Tags แสดงวิชาที่เลือก */}
                <div className="flex flex-wrap gap-2 max-w-md justify-start md:justify-end">
                    {categories.map(c => (
                        <span key={c} className="px-3 py-1.5 bg-rose-50/80 text-rose-700 rounded-lg text-xs font-bold border border-rose-200 shadow-sm flex items-center gap-1">
                            <Tag size={12} className="mr-1"/>
                            {c}
                        </span>
                    ))}
                </div>
            </div>

            {/* LOADING STATE / EMPTY STATE / LIST STATE */}
            {loading ? (
                <div className="flex flex-col items-center justify-center py-32">
                    <div className="relative">
                        <div className="w-16 h-16 border-4 border-rose-200 border-t-rose-500 rounded-full animate-spin"></div>
                        <div className="absolute inset-0 flex items-center justify-center">
                            <Loader size={24} className="text-rose-500 animate-pulse"/>
                        </div>
                    </div>
                    <p className="text-slate-400 font-medium mt-6 animate-pulse">กำลังค้นหาใบงานน่ารักๆ...</p>
                </div>
            ) : worksheets.length === 0 ? (
                <div className="text-center py-24 bg-white/60 rounded-[2.5rem] border-2 border-dashed border-rose-200 mx-auto max-w-2xl shadow-xl">
                    <div className="bg-rose-50 p-6 rounded-full inline-block mb-4 border border-rose-100">
                        <SearchX className="text-rose-300" size={48}/>
                    </div>
                    <h3 className="text-slate-600 font-bold text-xl mb-1">ไม่พบใบงานที่ตรงกับที่เลือก</h3>
                    <p className="text-rose-400 text-sm">ลองเลือกหมวดวิชาอื่นๆ หรือแจ้งคุณครูให้เพิ่มใบงานดูนะ</p>
                </div>
            ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6">
                    {worksheets.map((sheet, i) => (
                        <motion.div 
                            key={sheet.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.05 }}
                            className="bg-white p-3 rounded-3xl shadow-xl border-4 border-white hover:border-rose-100 transition-all group flex flex-col h-full"
                        >
                            <div 
                                className="relative aspect-[3/4] overflow-hidden bg-rose-50 rounded-2xl cursor-pointer mb-3"
                                onClick={() => setPreview(sheet)}
                            >
                                <img 
                                    src={sheet.imageUrl} 
                                    alt={sheet.title} 
                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                    onError={(e) => { e.target.onerror = null; e.target.src = "https://via.placeholder.com/600x800?text=No+Preview"; }}
                                />
                                
                                <div className="absolute top-2 left-2 bg-white/90 backdrop-blur-md px-2 py-0.5 rounded-full text-[10px] font-bold text-rose-600 shadow-sm border border-rose-100 z-10">
                                    {sheet.category}
                                </div>
                                <div className="absolute inset-0 bg-rose-900/10 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                    <div className="bg-white p-2.5 rounded-full shadow-lg transform translate-y-4 group-hover:translate-y-0 transition-transform">
                                        <Eye className="text-rose-600" size={20}/>
                                    </div>
                                </div>
                            </div>

                            <div className="flex flex-col flex-1">
                                <h3 
                                    className="font-bold text-sm text-slate-700 mb-3 line-clamp-2 leading-tight cursor-pointer hover:text-rose-600 transition-colors"
                                    onClick={() => setPreview(sheet)}
                                >
                                    {sheet.title}
                                </h3>
                                
                                <div className="mt-auto pt-2 border-t border-slate-50">
                                    <button 
                                        className="flex items-center justify-center gap-2 w-full bg-rose-50 text-rose-600 py-2.5 rounded-xl font-bold hover:bg-rose-500 hover:text-white transition-all cursor-pointer text-xs border border-rose-100"
                                        onClick={() => setPreview(sheet)}
                                    >
                                        <Eye size={16}/> ดูตัวอย่าง
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            )}
        </div>

        {/* ✅ MODAL PREVIEW (Rose/Orange Theme) */}
        <AnimatePresence>
            {preview && (
            <div 
                className="fixed inset-0 bg-black/70 backdrop-blur-md z-50 flex items-center justify-center p-0" 
                onClick={() => setPreview(null)}
            >
                <motion.div 
                    initial={{ scale: 0.9, opacity: 0, y: 20 }} 
                    animate={{ scale: 1, opacity: 1, y: 0 }} 
                    exit={{ scale: 0.9, opacity: 0, y: 20 }} 
                    onClick={(e) => e.stopPropagation()}
                    className="bg-white p-1 rounded-[2rem] w-full max-w-5xl relative shadow-2xl flex flex-col max-h-[98vh] h-full" 
                >
                    {/* ปุ่มปิด */}
                    <button 
                        onClick={() => setPreview(null)} 
                        className="absolute -top-2 -right-2 bg-white text-slate-500 hover:text-red-500 w-9 h-9 flex items-center justify-center rounded-full shadow-lg transition-all cursor-pointer hover:rotate-90 z-20 border-4 border-rose-50"
                    >
                        <X size={18} strokeWidth={2.5}/>
                    </button>
                
                    {/* ภายใน Modal: Compact inner padding p-3 */}
                    <div className="bg-white rounded-[1.5rem] p-3 border-4 border-rose-50 shadow-sm flex flex-col h-full overflow-hidden">
                        
                        {/* Header: ลด Padding แนวตั้ง */}
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-2 gap-2 pb-2 border-b border-rose-100 shrink-0">
                            <div>
                                <div className="inline-block px-3 py-1 bg-rose-50 text-rose-600 rounded-full text-xs font-bold mb-1 border border-rose-100">
                                    {preview.ageRange} • {preview.category}
                                </div>
                                <h3 className="font-bold text-xl text-slate-800 leading-tight font-display">
                                    {preview.title}
                                </h3>
                            </div>
                            
                            {/* ปุ่มดาวน์โหลดหลัก */}
                            <a 
                                href={preview.pdfUrl} 
                                target="_blank" 
                                rel="noreferrer"
                                className="flex items-center gap-2 bg-gradient-to-r from-rose-500 to-orange-500 text-white px-4 py-1.5 rounded-xl font-bold shadow-md hover:shadow-lg transition-all text-xs shrink-0"
                            >
                                <Download size={16}/> ดาวน์โหลดไฟล์
                            </a>
                        </div>

                        {/* PDF Viewer Area: flex-1 ขยายเต็มที่ */}
                        <div className="flex-1 bg-slate-100 rounded-xl border-2 border-rose-200 overflow-hidden relative mb-1 group">
                            {preview.pdfUrl ? (
                                <iframe 
                                    src={preview.pdfUrl} 
                                    className="w-full h-full" 
                                    title="PDF Preview"
                                ></iframe>
                            ) : (
                                <div className="flex items-center justify-center h-full text-slate-400">
                                    ไม่พบไฟล์ PDF
                                </div>
                            )}
                            
                            {/* Fullscreen Button */}
                            <a href={preview.pdfUrl} target="_blank" className="absolute bottom-4 right-4 bg-black/50 text-white p-2 rounded-lg backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/70">
                                <ExternalLink size={20}/>
                            </a>
                        </div>

                        {/* Footer: QR Code */}
                        <div className="mt-auto flex items-center justify-between bg-rose-50 p-1 rounded-xl border border-rose-200 shrink-0">
                            <div className="flex items-center gap-3">
                                <div className="bg-white p-1.5 rounded-lg shadow-sm border border-rose-100">
                                    <QRCode value={preview.pdfUrl || '#'} size={40} fgColor="#7C3AED" bgColor="transparent"/>
                                </div>
                                <div>
                                    <p className="text-xs text-rose-500 font-bold uppercase tracking-wider">QR Code</p>
                                    <p className="text-rose-700 font-bold text-xs">สแกนเพื่อดูบนมือถือ</p>
                                </div>
                            </div>
                            <p className="text-xs text-slate-400 hidden sm:block">
                                * หากแสดงผลไม่สมบูรณ์ ให้กดปุ่มดาวน์โหลด
                            </p>
                        </div>
                    </div>
                </motion.div>
            </div>
            )}
        </AnimatePresence>
    </div>
  );
}