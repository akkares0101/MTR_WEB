import { useState } from 'react';
import { API } from '../services/api';
import { X, UploadCloud, Check, FileText, Trash2, Image as ImageIcon } from 'lucide-react';

export default function BulkUploadForm({ categories, onClose, onSuccess }) {
    const [selectedAges, setSelectedAges] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState('');
    
    // ✅ เพิ่ม State สำหรับรูปปก
    const [coverFile, setCoverFile] = useState(null);
    const [coverPreview, setCoverPreview] = useState('');

    const [files, setFiles] = useState([]);
    const [uploading, setUploading] = useState(false);

    const optionsList = [
        { value: "เตรียมอนุบาล", label: "เตรียมอนุบาล" },
        { value: "2-3", label: "2-3 ปี" },
        { value: "3-4", label: "3-4 ปี" },
        { value: "4-5", label: "4-5 ปี" },
        { value: "5-6", label: "5-6 ปี" },
        { value: "เตรียมป1", label: "เตรียมขึ้น ป.1" },
        { value: "เสริมเชาว์", label: "เสริมเชาว์ฯ" },
        { value: "บัตรคำ", label: "บัตรคำ" },
        { value: "ตามหน่วย", label: "ใบงานตามหน่วย" }
    ];

    const toggleAge = (value) => {
        if (selectedAges.includes(value)) {
            setSelectedAges(selectedAges.filter(a => a !== value));
        } else {
            setSelectedAges([...selectedAges, value]);
        }
    };

    // ✅ จัดการรูปปก
    const handleCoverChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setCoverFile(file);
            setCoverPreview(URL.createObjectURL(file));
        }
    };

    const handleFileChange = (e) => {
        const newFiles = Array.from(e.target.files);
        setFiles((prevFiles) => [...prevFiles, ...newFiles]);
    };

    const removeFile = (indexToRemove) => {
        setFiles((prevFiles) => prevFiles.filter((_, index) => index !== indexToRemove));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!selectedCategory) return alert("กรุณาเลือกหมวดวิชา");
        if (selectedAges.length === 0) return alert("กรุณาเลือกระดับชั้น");
        if (files.length === 0) return alert("กรุณาเลือกไฟล์ใบงานอย่างน้อย 1 ไฟล์");
        // รูปปกจะเป็น Optional ก็ได้ แต่ถ้าอยากบังคับให้เปิด Comment ด้านล่าง
        // if (!coverFile) return alert("กรุณาเลือกรูปปก");

        setUploading(true);
        try {
            // ✅ ส่ง coverFile ไปด้วย
            await API.addBulkWorksheets(selectedAges, selectedCategory, files, coverFile);
            
            alert(`✅ อัปโหลดเสร็จสิ้น ${files.length} รายการ`);
            onSuccess();
            onClose();
        } catch (error) {
            console.error(error);
            alert("เกิดข้อผิดพลาด: " + (error.response?.data?.message || error.message));
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl w-full max-w-2xl p-6 shadow-2xl max-h-[90vh] overflow-y-auto flex flex-col">
                <div className="flex justify-between items-center mb-6 flex-shrink-0">
                    <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                        <div className="bg-blue-100 p-2 rounded-lg text-blue-600">
                            <UploadCloud size={24} />
                        </div>
                        อัปโหลดหลายไฟล์ + หน้าปก
                    </h2>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-500">
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6 flex-1 overflow-y-auto pr-1">
                    {/* 1. เลือกหมวดวิชา */}
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">หมวดวิชา <span className="text-red-500">*</span></label>
                        <select value={selectedCategory} onChange={e => setSelectedCategory(e.target.value)} className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 outline-none font-medium text-gray-700">
                            <option value="">-- เลือกหมวดวิชา --</option>
                            {categories.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                        </select>
                    </div>

                    {/* 2. เลือกระดับชั้น */}
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">ระดับชั้น <span className="text-red-500">*</span></label>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                            {optionsList.map((item) => (
                                <div key={item.value} onClick={() => toggleAge(item.value)} className={`cursor-pointer p-2 rounded-lg border-2 flex items-center gap-2 transition-all ${selectedAges.includes(item.value) ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-gray-200 hover:border-blue-300'}`}>
                                    <div className={`w-5 h-5 rounded border flex items-center justify-center flex-shrink-0 ${selectedAges.includes(item.value) ? 'bg-blue-500 border-blue-500' : 'border-gray-300 bg-white'}`}>
                                        {selectedAges.includes(item.value) && <Check size={14} className="text-white" />}
                                    </div>
                                    <span className="text-sm font-medium">{item.label}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        {/* 3. ✅ เลือกรูปปก (ซ้าย) */}
                        <div className="sm:col-span-1">
                            <label className="block text-sm font-bold text-gray-700 mb-2">รูปปก (ใช้รวมกัน)</label>
                            <div className="border-2 border-dashed border-gray-300 rounded-xl h-40 flex flex-col items-center justify-center bg-gray-50 hover:bg-gray-100 transition-all relative overflow-hidden group cursor-pointer">
                                <input type="file" accept="image/*" onChange={handleCoverChange} className="absolute inset-0 opacity-0 cursor-pointer z-10" />
                                {coverPreview ? (
                                    <img src={coverPreview} className="w-full h-full object-cover" />
                                ) : (
                                    <div className="text-center text-gray-400 group-hover:text-blue-500">
                                        <ImageIcon size={24} className="mx-auto mb-1" />
                                        <span className="text-xs font-bold">เลือกรูปปก</span>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* 4. เลือกไฟล์ใบงาน (ขวา - ใหญ่กว่า) */}
                        <div className="sm:col-span-2">
                            <label className="block text-sm font-bold text-gray-700 mb-2">ไฟล์ใบงาน (PDF/รูป) <span className="text-red-500">*</span></label>
                            <div className="border-2 border-dashed border-gray-300 rounded-xl h-40 flex flex-col items-center justify-center bg-gray-50 hover:bg-blue-50 transition-all relative group cursor-pointer">
                                <input type="file" multiple accept=".pdf, image/*" onChange={handleFileChange} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" />
                                <div className="flex flex-col items-center gap-2 text-gray-500 group-hover:text-blue-600">
                                    <UploadCloud size={32} />
                                    <span className="font-medium text-sm">คลิกเพื่อเพิ่มไฟล์ ({files.length})</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* แสดงรายการไฟล์ */}
                    {files.length > 0 && (
                        <div className="bg-gray-50 rounded-xl p-3 max-h-40 overflow-y-auto custom-scrollbar border border-gray-100">
                            {files.map((file, index) => (
                                <div key={index} className="flex items-center justify-between p-2 bg-white border border-gray-100 rounded-lg mb-2 last:mb-0 shadow-sm">
                                    <div className="flex items-center gap-3 overflow-hidden">
                                        <div className="bg-blue-50 p-1.5 rounded-lg text-blue-500"><FileText size={16} /></div>
                                        <p className="text-sm text-gray-700 truncate">{file.name}</p>
                                    </div>
                                    <button type="button" onClick={() => removeFile(index)} className="text-gray-400 hover:text-red-500"><Trash2 size={16} /></button>
                                </div>
                            ))}
                        </div>
                    )}

                    <button type="submit" disabled={uploading} className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3.5 rounded-xl font-bold text-lg hover:shadow-lg disabled:opacity-70 transition-all shadow-md shadow-blue-200 flex items-center justify-center gap-2">
                        {uploading ? 'กำลังอัปโหลด...' : <><UploadCloud size={20} /> ยืนยันการอัปโหลด</>}
                    </button>
                </form>
            </div>
        </div>
    );
}