import { useState, useEffect } from 'react';
import { API } from '../services/api';
import { AuthService } from '../services/authService';
import { useNavigate } from 'react-router-dom';
import QRCode from "react-qr-code";
import { motion, AnimatePresence } from 'framer-motion';
import {
    Trash2, Edit, LogOut, Plus, X, Image, FileText,
    Settings, Tag, Loader, Eye, LayoutDashboard,
    Save, UploadCloud, ChevronDown, CheckCircle
} from 'lucide-react';

import BulkUploadForm from '../components/BulkUploadForm';

export default function AdminDashboard() {
    const navigate = useNavigate();
    const [data, setData] = useState([]);
    const [allCategories, setAllCategories] = useState([]);
    const [isEdit, setIsEdit] = useState(false);
    const [id, setId] = useState(null);

    // ✅ เปลี่ยน ageRange เป็น Array [] เพื่อรองรับหลายชั้น
    const [form, setForm] = useState({ title: '', ageRange: [], categories: [], imageUrl: '', pdfUrl: '' });

    const [fileImg, setFileImg] = useState(null);
    const [filePdf, setFilePdf] = useState(null);
    const [previewImgUrl, setPreviewImgUrl] = useState('');

    const [preview, setPreview] = useState(null);
    const [showCatModal, setShowCatModal] = useState(false);
    const [showBulkUpload, setShowBulkUpload] = useState(false);

    const [newCat, setNewCat] = useState('');
    const [targetGroup, setTargetGroup] = useState('2-3');
    const [loading, setLoading] = useState(false);

    // รายชื่อช่วงอายุทั้งหมด
    const ageOptionsList = ["2-3", "3-4", "4-5", "5-6", "เตรียมป1", "เสริมเชาว์", "บัตรคำ", "ตามหน่วย"];

    useEffect(() => { loadData(); }, []);

    const loadData = async () => {
        setLoading(true);
        try {
            const works = await API.getWorksheets();
            setData(works);
            const cats = await API.getCategories();
            setAllCategories(cats);
        } catch (error) {
            console.error("Connection Error:", error);
        }
        setLoading(false);
    };

    // ✅ กรองวิชา: แสดงวิชาที่ตรงกับ "ชั้นใดชั้นหนึ่ง" ที่เลือกไว้
    const availableCategories = allCategories.filter(c => form.ageRange.includes(c.ageGroup));

    // ✅ ฟังก์ชันเลือก/ยกเลิก "ระดับชั้น"
    const toggleAge = (age) => {
        if (form.ageRange.includes(age)) {
            // เอาออก (แต่ถ้าเหลือวิชาที่ไม่ตรงกับชั้นที่เหลือ ต้องเคลียร์วิชาทิ้งด้วย ถ้าต้องการ)
            setForm({ ...form, ageRange: form.ageRange.filter(a => a !== age) });
        } else {
            setForm({ ...form, ageRange: [...form.ageRange, age] });
        }
    };

    // ✅ ฟังก์ชันเลือก/ยกเลิก "วิชา"
    const toggleCategory = (catName) => {
        if (form.categories.includes(catName)) {
            setForm({ ...form, categories: form.categories.filter(c => c !== catName) });
        } else {
            setForm({ ...form, categories: [...form.categories, catName] });
        }
    };

    const handleFileChange = (e, type) => {
        const file = e.target.files[0];
        if (file) {
            if (type === 'img') {
                setFileImg(file);
                setPreviewImgUrl(URL.createObjectURL(file));
            } else {
                setFilePdf(file);
            }
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!form.title) return alert('กรุณากรอกชื่อใบงาน');
        
        // Validation
        if (form.ageRange.length === 0) return alert('กรุณาเลือกระดับชั้นอย่างน้อย 1 ระดับ');
        if (form.categories.length === 0) return alert('กรุณาเลือกวิชาอย่างน้อย 1 วิชา');
        if (!isEdit && (!fileImg || !filePdf)) return alert('กรุณาอัปโหลดรูปและ PDF ให้ครบ');

        setLoading(true);
        const formData = new FormData();
        formData.append('title', form.title);
        
        // ✅ รวมระดับชั้นเป็น string (เช่น "2-3,3-4")
        formData.append('ageRange', form.ageRange.join(','));
        
        // ✅ รวมวิชาเป็น string (เช่น "คณิต,ไทย")
        formData.append('category', form.categories.join(','));
        
        if (fileImg) formData.append('image', fileImg);
        if (filePdf) formData.append('pdf', filePdf);

        if (isEdit) {
            formData.append('existingImage', form.imageUrl);
            formData.append('existingPdf', form.pdfUrl);
        }

        try {
            if (isEdit) {
                await API.updateWorksheet(id, formData);
                setIsEdit(false);
            } else {
                await API.addWorksheet(formData);
            }
            // รีเซ็ตฟอร์ม
            setForm({ title: '', ageRange: [], categories: [], imageUrl: '', pdfUrl: '' });
            setFileImg(null); setFilePdf(null); setPreviewImgUrl('');
            await loadData();
        } catch (error) {
            alert("บันทึกไม่สำเร็จ: " + error.message);
        }
        setLoading(false);
    };

    const handleDelete = async (delId) => {
        if (confirm('ยืนยันการลบ?')) { await API.deleteWorksheet(delId); loadData(); }
    };

    const handleEditClick = (item) => {
        setIsEdit(true);
        setId(item.id);
        
        // แปลงข้อมูลจาก DB (ที่เป็น string) กลับมาเป็น Array เพื่อแสดงผลปุ่มที่ถูกเลือก
        const ageArray = item.ageRange ? item.ageRange.split(',') : [];
        const catArray = item.category ? item.category.split(',') : [];

        setForm({
            title: item.title, 
            ageRange: ageArray,
            categories: catArray, 
            imageUrl: item.imageUrl, 
            pdfUrl: item.pdfUrl
        });
        setPreviewImgUrl(item.imageUrl);
        setFileImg(null); setFilePdf(null);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleAddCat = async (e) => {
        e.preventDefault();
        if (newCat.trim()) {
            await API.addCategory(newCat.trim(), targetGroup);
            setNewCat('');
            loadData();
        }
    }

    const handleDeleteCat = async (catId) => {
        if (confirm(`ลบวิชานี้?`)) { await API.deleteCategory(catId); loadData(); }
    }

    // Dropdown options สำหรับ Modal จัดการวิชา (อันนี้ยังเป็น dropdown เหมือนเดิม เพราะจัดการทีละชั้น)
    const ageOptions = (
        <>
            <optgroup label="ช่วงอายุ">
                <option value="2-3">2-3 ปี</option>
                <option value="3-4">3-4 ปี</option>
                <option value="4-5">4-5 ปี</option>
                <option value="5-6">5-6 ปี</option>
            </optgroup>
            <optgroup label="หมวดพิเศษ">
                <option value="เตรียมป1">เตรียมขึ้น ป.1</option>
                <option value="เสริมเชาว์">เสริมเชาว์ฯ</option>
                <option value="บัตรคำ">บัตรคำ</option>
                <option value="ตามหน่วย">ใบงานตามหน่วย</option>
            </optgroup>
        </>
    );

    return (
        <div className="min-h-screen bg-[#F8FAFC] font-sans text-slate-800 pb-20">
            {/* --- Navbar --- */}
            <div className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-slate-200 shadow-sm">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        <div className="bg-indigo-600 p-2 rounded-xl text-white shadow-sm">
                            <LayoutDashboard size={22} />
                        </div>
                        <h1 className="text-xl font-bold text-slate-800 tracking-tight hidden sm:block">Admin Console</h1>
                    </div>
                    <div className="flex gap-2 sm:gap-3">
                        <button 
                            onClick={() => setShowBulkUpload(true)} 
                            className="flex items-center gap-2 bg-gradient-to-r from-blue-500 to-cyan-500 text-white px-3 sm:px-4 py-2 rounded-xl font-bold hover:shadow-lg hover:-translate-y-0.5 transition-all text-xs sm:text-sm shadow-md"
                        >
                            <UploadCloud size={18} /> <span className="hidden sm:inline">เพิ่มทีละหลายใบ</span>
                        </button>

                        <button onClick={() => setShowCatModal(true)} className="flex items-center gap-2 bg-white border border-slate-200 text-slate-600 px-3 sm:px-4 py-2 rounded-xl font-bold hover:bg-slate-50 hover:border-slate-300 transition-all text-xs sm:text-sm shadow-sm">
                            <Settings size={18} className="text-indigo-500" /> <span className="hidden sm:inline">จัดการวิชา</span>
                        </button>
                        <button onClick={() => { AuthService.logout(); navigate('/'); }} className="flex items-center gap-2 bg-rose-50 text-rose-600 border border-rose-100 px-3 sm:px-4 py-2 rounded-xl font-bold hover:bg-rose-100 transition-all text-xs sm:text-sm shadow-sm">
                            <LogOut size={18} /> <span className="hidden sm:inline">ออก</span>
                        </button>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* --- FORM (Left Side) --- */}
                <div className="lg:col-span-4">
                    <div className="bg-white rounded-[2rem] p-6 shadow-lg border border-slate-100 sticky top-24">
                        <h2 className="text-lg font-bold mb-6 flex gap-3 items-center text-slate-700 pb-4 border-b border-slate-100">
                            <div className={`p-2 rounded-full ${isEdit ? 'bg-orange-100 text-orange-500' : 'bg-indigo-100 text-indigo-500'}`}>
                                {isEdit ? <Edit size={20} /> : <Plus size={20} />}
                            </div>
                            {isEdit ? 'แก้ไขข้อมูลใบงาน' : 'เพิ่มใบงานใหม่ (ทีละใบ)'}
                        </h2>

                        <form onSubmit={handleSubmit} className="space-y-5">
                            <div>
                                <label className="text-xs font-bold text-slate-500 ml-1 mb-1.5 block uppercase tracking-wider">ชื่อใบงาน</label>
                                <input type="text" placeholder="ระบุชื่อใบงาน..." className="w-full p-3 bg-slate-50 border-2 border-slate-200 rounded-xl focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 outline-none text-sm font-medium transition-all" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} />
                            </div>

                            {/* ✅ ส่วนเลือก "ระดับชั้น" (Multi-Select) */}
                            <div>
                                <label className="text-xs font-bold text-slate-500 ml-1 mb-1.5 block uppercase tracking-wider">
                                    ระดับชั้น (เลือกได้มากกว่า 1)
                                </label>
                                <div className="bg-slate-50 p-3 rounded-xl border-2 border-slate-200">
                                    <div className="flex flex-wrap gap-2">
                                        {ageOptionsList.map(age => {
                                            const isSelected = form.ageRange.includes(age);
                                            return (
                                                <button
                                                    key={age}
                                                    type="button"
                                                    onClick={() => toggleAge(age)}
                                                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all border flex items-center gap-1 ${
                                                        isSelected 
                                                        ? 'bg-blue-500 text-white border-blue-600 shadow-md' 
                                                        : 'bg-white text-slate-600 border-slate-200 hover:border-blue-300'
                                                    }`}
                                                >
                                                    {isSelected && <CheckCircle size={12} />}
                                                    {age}
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>
                            </div>

                            {/* ✅ ส่วนเลือก "วิชา" (Multi-Select) */}
                            <div>
                                <label className="text-xs font-bold text-slate-500 ml-1 mb-1.5 block uppercase tracking-wider">
                                    วิชา (ตามระดับชั้นที่เลือก)
                                </label>
                                <div className="bg-slate-50 p-3 rounded-xl border-2 border-slate-200 min-h-[60px]">
                                    {availableCategories.length > 0 ? (
                                        <div className="flex flex-wrap gap-2">
                                            {availableCategories.map(cat => {
                                                const isSelected = form.categories.includes(cat.name);
                                                return (
                                                    <button
                                                        key={cat.id}
                                                        type="button"
                                                        onClick={() => toggleCategory(cat.name)}
                                                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all border flex items-center gap-1 ${
                                                            isSelected 
                                                            ? 'bg-indigo-500 text-white border-indigo-600 shadow-md transform scale-105' 
                                                            : 'bg-white text-slate-600 border-slate-200 hover:border-indigo-300'
                                                        }`}
                                                    >
                                                        {isSelected && <CheckCircle size={12} />}
                                                        {cat.name}
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    ) : (
                                        <p className="text-xs text-red-500 flex items-center justify-center gap-2 py-2">
                                            {form.ageRange.length === 0 ? 'กรุณาเลือกระดับชั้นก่อน' : 'ยังไม่มีวิชาในชั้นที่เลือก'}
                                        </p>
                                    )}
                                </div>
                            </div>

                            <div className="mt-2">
                                <label className="text-xs font-bold text-slate-500 ml-1 mb-1.5 block uppercase tracking-wider">รูปภาพปก</label>
                                <div className="relative border-2 border-dashed border-slate-300 rounded-2xl h-40 flex flex-col items-center justify-center text-center hover:border-indigo-500 hover:bg-indigo-50 transition-all group cursor-pointer overflow-hidden bg-slate-50">
                                    <input type="file" accept="image/*" className="absolute inset-0 opacity-0 cursor-pointer z-20" onChange={e => handleFileChange(e, 'img')} />
                                    {previewImgUrl ? (
                                        <img src={previewImgUrl} className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="text-slate-400 group-hover:text-indigo-500 transition-colors flex flex-col items-center">
                                            <div className="bg-white p-3 rounded-full shadow-sm mb-2 group-hover:shadow-md transition-all">
                                                <Image size={24} className="text-indigo-400" />
                                            </div>
                                            <p className="text-sm font-bold">คลิกเพื่อเลือกรูปภาพ</p>
                                            <p className="text-xs">PNG, JPG (แนะนำแนวตั้ง)</p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div>
                                <label className="text-xs font-bold text-slate-500 ml-1 mb-1.5 block uppercase tracking-wider">ไฟล์ PDF</label>
                                <div className={`relative border-2 border-slate-200 rounded-xl p-3 flex items-center justify-center cursor-pointer transition-all hover:border-indigo-400 hover:shadow-sm ${filePdf || (isEdit && form.pdfUrl) ? 'bg-indigo-50 border-indigo-200 text-indigo-700' : 'bg-slate-50'}`}>
                                    <input type="file" accept="application/pdf" className="absolute inset-0 opacity-0 cursor-pointer z-20" onChange={e => handleFileChange(e, 'pdf')} />
                                    <FileText size={20} className="mr-2" />
                                    <span className="text-sm font-bold truncate max-w-[200px]">
                                        {filePdf ? filePdf.name : (isEdit && form.pdfUrl) ? 'มีไฟล์เดิมแล้ว (คลิกเพื่อเปลี่ยน)' : 'คลิกเพื่อเลือกไฟล์ PDF'}
                                    </span>
                                </div>
                            </div>

                            <div className="pt-4 flex gap-3">
                                {isEdit && (
                                    <button type="button" onClick={() => { setIsEdit(false); setForm({ title: '', ageRange: [], categories: [], imageUrl: '', pdfUrl: '' }); setPreviewImgUrl(''); setFileImg(null); setFilePdf(null); }} className="flex-1 bg-slate-100 text-slate-600 py-3 rounded-xl font-bold text-sm hover:bg-slate-200 transition-all">ยกเลิก</button>
                                )}
                                <button disabled={loading} className={`flex-1 text-white py-3 rounded-xl font-bold shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-0.5 text-sm flex items-center justify-center gap-2 ${isEdit ? 'bg-gradient-to-r from-orange-400 to-pink-500' : 'bg-gradient-to-r from-indigo-500 to-purple-500'} disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none`}>
                                    {loading ? <Loader className="animate-spin" size={18} /> : (isEdit ? <><Save size={18} /> บันทึกการแก้ไข</> : <><Plus size={18} /> บันทึก</>)}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>

                {/* --- LIST (Right Side) --- */}
                <div className="lg:col-span-8">
                    <div className="flex justify-between items-center mb-6 bg-white p-4 rounded-2xl shadow-sm border border-slate-100">
                        <h2 className="text-base font-bold text-slate-700 flex items-center gap-2">
                            <LayoutDashboard className="text-indigo-500" size={20}/>
                            รายการใบงานทั้งหมด <span className="bg-indigo-100 text-indigo-600 px-2 py-0.5 rounded-md text-sm">{data.length}</span>
                        </h2>
                    </div>

                    {loading && !data.length ? (
                        <div className="flex flex-col items-center justify-center py-20 text-slate-400 bg-white rounded-[2rem] shadow-sm border border-slate-100">
                            <Loader className="animate-spin mb-4 text-indigo-400" size={40} />
                            <p className="font-medium">กำลังโหลดข้อมูล...</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
                            {data.map(d => (
                                <div key={d.id} className="bg-white p-3 rounded-[1.5rem] shadow-sm border border-slate-100 hover:shadow-md hover:border-indigo-200 transition-all group flex flex-col relative">
                                    <div
                                        onClick={() => setPreview(d)}
                                        className="relative w-full aspect-[3/4] rounded-xl bg-slate-100 overflow-hidden cursor-pointer mb-3"
                                    >
                                        <img src={d.imageUrl} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" onError={(e) => { e.target.onerror = null; e.target.src = "https://via.placeholder.com/300?text=No+Image"; }}/>
                                        <div className="absolute inset-0 bg-indigo-900/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
                                            <div className="bg-white/90 p-2 rounded-full shadow-sm backdrop-blur-sm">
                                                <Eye size={20} className="text-indigo-600" />
                                            </div>
                                        </div>
                                        <div className="absolute top-2 left-2 bg-white/95 backdrop-blur-sm px-2 py-1 rounded-lg text-[10px] font-bold text-indigo-600 shadow-sm flex items-center gap-1 border border-indigo-50">
                                            <Tag size={10}/> {d.ageRange}
                                        </div>
                                    </div>

                                    <div className="flex-1 min-w-0 flex flex-col">
                                        <div className="mb-1.5 flex flex-wrap gap-1">
                                            {/* แสดงวิชาเป็น Tags เล็กๆ (ถ้ามีหลายวิชา) */}
                                            {d.category.split(',').slice(0, 2).map((cat, idx) => (
                                                <span key={idx} className="text-[10px] bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded-md font-bold truncate block max-w-full border border-indigo-100">
                                                    {cat}
                                                </span>
                                            ))}
                                            {d.category.split(',').length > 2 && <span className="text-[9px] text-slate-400">+{d.category.split(',').length - 2}</span>}
                                        </div>
                                        <h3 className="font-bold text-slate-700 text-sm line-clamp-2 mb-3 leading-tight flex-1" title={d.title}>{d.title}</h3>

                                        <div className="flex gap-2 pt-3 border-t border-slate-50 mt-auto">
                                            <button onClick={() => handleEditClick(d)} className="flex-1 py-1.5 bg-slate-50 text-slate-500 rounded-lg hover:bg-orange-50 hover:text-orange-500 transition-all flex justify-center items-center border border-slate-100 hover:border-orange-200"><Edit size={16} /></button>
                                            <button onClick={() => handleDelete(d.id)} className="flex-1 py-1.5 bg-slate-50 text-slate-500 rounded-lg hover:bg-rose-50 hover:text-rose-500 transition-all flex justify-center items-center border border-slate-100 hover:border-rose-200"><Trash2 size={16} /></button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {!loading && data.length === 0 && (
                        <div className="text-center py-20 bg-white rounded-[2rem] border-2 border-dashed border-slate-200 text-slate-400">
                            <Image className="mx-auto mb-4 text-slate-300" size={60}/>
                            <p className="text-lg font-bold">ยังไม่มีข้อมูลในระบบ</p>
                            <p className="text-sm">เริ่มสร้างใบงานใหม่ได้ที่ฟอร์มฝั่งซ้ายมือ</p>
                        </div>
                    )}
                </div>
            </div>

            {/* --- MODAL จัดการวิชา --- */}
            <AnimatePresence>
                {showCatModal && (
                    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                        <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="bg-white p-6 rounded-[2rem] w-full max-w-md shadow-2xl relative border border-white/50">
                            <button onClick={() => setShowCatModal(false)} className="absolute top-5 right-5 bg-slate-100 p-2 rounded-full hover:bg-slate-200 transition-all text-slate-500"><X size={20} /></button>
                            <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-3 pb-4 border-b border-slate-100">
                                <div className="bg-indigo-100 p-2 rounded-xl text-indigo-500"><Settings size={24} /></div>
                                จัดการรายวิชา
                            </h2>

                            <div className="mb-5 bg-slate-50 p-4 rounded-2xl border border-slate-100">
                                <label className="text-xs font-bold text-slate-500 ml-1 mb-2 block uppercase tracking-wider">เลือกกลุ่มที่ต้องการจัดการ</label>
                                <div className="relative">
                                    <select className="w-full p-3 bg-white border-2 border-slate-200 rounded-xl focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 outline-none text-sm font-bold text-slate-700 appearance-none cursor-pointer transition-all" value={targetGroup} onChange={e => setTargetGroup(e.target.value)}>
                                        {ageOptions}
                                    </select>
                                    <ChevronDown className="absolute right-3 top-3.5 text-slate-400 pointer-events-none" size={16} />
                                </div>
                            </div>

                            <form onSubmit={handleAddCat} className="flex gap-3 mb-6">
                                <input type="text" placeholder={`ชื่อวิชาใหม่ของ ${targetGroup}...`} className="flex-1 p-3 bg-slate-50 border-2 border-slate-200 rounded-xl focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 outline-none text-sm font-medium" value={newCat} onChange={(e) => setNewCat(e.target.value)} />
                                <button type="submit" className="bg-indigo-600 text-white px-4 rounded-xl font-bold hover:bg-indigo-700 shadow-md flex items-center justify-center transition-all transform hover:scale-105"><Plus size={20} /></button>
                            </form>

                            <div className="max-h-[300px] overflow-y-auto space-y-2 pr-2 custom-scrollbar">
                                {allCategories.filter(c => c.ageGroup === targetGroup).map(cat => (
                                    <div key={cat.id} className="flex justify-between items-center p-3 bg-white rounded-xl border border-slate-100 text-sm hover:shadow-md transition-all group">
                                        <span className="font-bold text-slate-700 flex items-center gap-2"><Tag size={16} className="text-indigo-400 group-hover:text-indigo-600"/> {cat.name}</span>
                                        <button onClick={() => handleDeleteCat(cat.id)} className="text-slate-400 hover:text-red-500 bg-slate-50 p-2 rounded-lg transition-all hover:bg-red-50"><Trash2 size={18} /></button>
                                    </div>
                                ))}
                                {allCategories.filter(c => c.ageGroup === targetGroup).length === 0 && (
                                    <div className="text-center py-8 text-slate-400 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200">
                                        <Tag className="mx-auto mb-2 text-slate-300" size={32}/>
                                        <p className="font-medium">ยังไม่มีวิชาในกลุ่มนี้</p>
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* ✅ 4. เพิ่มส่วนแสดงผล Modal Bulk Upload */}
            <AnimatePresence>
                {showBulkUpload && (
                    <BulkUploadForm 
                        categories={allCategories}
                        onClose={() => setShowBulkUpload(false)}
                        onSuccess={() => {
                            loadData(); // โหลดข้อมูลใหม่หลังจากอัปโหลดเสร็จ
                        }}
                    />
                )}
            </AnimatePresence>

            {/* --- MODAL PREVIEW --- */}
            <AnimatePresence>
                {preview && (
                    <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-50 flex items-center justify-center p-4" onClick={() => setPreview(null)}>
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.9, opacity: 0, y: 20 }}
                            onClick={e => e.stopPropagation()}
                            className="bg-white p-2 rounded-[2.5rem] max-w-sm w-full relative shadow-2xl"
                        >
                            <button onClick={() => setPreview(null)} className="absolute -top-4 -right-4 bg-white text-slate-400 hover:text-red-500 w-11 h-11 flex items-center justify-center rounded-full shadow-lg transition-all cursor-pointer hover:rotate-90 z-20 border-4 border-slate-50"><X size={22} strokeWidth={2.5} /></button>

                            <div className="bg-white rounded-[2rem] p-6 border border-slate-100 shadow-inner relative overflow-hidden">
                                <div className="text-center mb-6 mt-2">
                                    <div className="inline-block px-3 py-1 bg-indigo-50 text-indigo-600 rounded-full text-xs font-bold mb-3 border border-indigo-100 shadow-sm">สำหรับน้อง {preview.ageRange}</div>
                                    <h3 className="font-bold text-xl text-slate-800 leading-tight px-2 font-display">{preview.title}</h3>
                                </div>
                                <div className="relative w-48 mx-auto aspect-[3/4] bg-slate-100 rounded-2xl shadow-xl border-4 border-white mb-8 overflow-hidden transform rotate-2 hover:rotate-0 transition-all duration-300">
                                    <img src={preview.imageUrl} className="w-full h-full object-cover" />
                                </div>
                                <div className="bg-slate-50 p-4 rounded-2xl border-2 border-dashed border-indigo-200 mb-6 flex items-center gap-4">
                                    <div className="bg-white p-2 rounded-xl shadow-sm border border-slate-100"><QRCode value={preview.pdfUrl || '#'} size={54} fgColor="#334155" bgColor="transparent" /></div>
                                    <div className="text-left">
                                        <p className="text-xs text-slate-500 font-bold uppercase tracking-wider mb-1">Scan QR Code</p>
                                        <p className="text-indigo-600 font-bold text-sm">เพื่อดาวน์โหลดไฟล์ PDF</p>
                                    </div>
                                </div>
                                <a href={preview.pdfUrl} target="_blank" className="flex items-center justify-center gap-2 w-full bg-gradient-to-r from-indigo-500 to-purple-500 text-white py-3.5 rounded-xl font-bold shadow-lg shadow-indigo-200 hover:shadow-xl hover:-translate-y-0.5 transition-all text-sm group">
                                    <UploadCloud size={20} className="group-hover:animate-bounce" /> เปิดไฟล์ PDF
                                </a>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}