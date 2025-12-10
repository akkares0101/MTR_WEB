import { useState } from 'react';
import { API } from '../services/api';
import { X, UploadCloud, Check } from 'lucide-react';

export default function BulkUploadForm({ categories, onClose, onSuccess }) {
    // เก็บอายุเป็น Array (เพราะเลือกได้หลายอัน)
    const [selectedAges, setSelectedAges] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState('');
    const [files, setFiles] = useState(null);
    const [uploading, setUploading] = useState(false);

    // รายชื่อตัวเลือกอายุ
    const ageOptions = ["เตรียมอนุบาล", "2-3", "3-4", "4-5", "5-6"];

    const toggleAge = (age) => {
        if (selectedAges.includes(age)) {
            setSelectedAges(selectedAges.filter(a => a !== age)); // เอาออก
        } else {
            setSelectedAges([...selectedAges, age]); // ใส่เพิ่ม
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!selectedCategory || !files || files.length === 0 || selectedAges.length === 0) {
            alert("กรุณากรอกข้อมูลให้ครบ (อายุ, หมวด, ไฟล์)");
            return;
        }

        setUploading(true);
        try {
            await API.addBulkWorksheets(selectedAges, selectedCategory, files);
            alert(`✅ อัปโหลดเสร็จสิ้น ${files.length} รายการ`);
            onSuccess();
            onClose();
        } catch (error) {
            console.error(error);
            alert("เกิดข้อผิดพลาดในการอัปโหลด");
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl w-full max-w-lg p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                        <UploadCloud className="text-blue-600" /> อัปโหลดทีละหลายใบ
                    </h2>
                    <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-full"><X /></button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* 1. เลือกหมวดวิชา */}
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">หมวดวิชา</label>
                        <select 
                            value={selectedCategory} 
                            onChange={e => setSelectedCategory(e.target.value)} 
                            className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 outline-none"
                        >
                            <option value="">-- เลือกหมวดวิชา --</option>
                            {categories.map(c => (
                                <option key={c.id} value={c.name}>{c.name}</option>
                            ))}
                        </select>
                    </div>

                    {/* 2. เลือกช่วงอายุ (Multi-select Checkbox) */}
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">ระดับชั้น (เลือกได้มากกว่า 1)</label>
                        <div className="grid grid-cols-2 gap-2">
                            {ageOptions.map(age => (
                                <div 
                                    key={age}
                                    onClick={() => toggleAge(age)}
                                    className={`cursor-pointer p-2 rounded-lg border-2 flex items-center gap-2 transition-all ${
                                        selectedAges.includes(age) 
                                        ? 'border-blue-500 bg-blue-50 text-blue-700' 
                                        : 'border-gray-200 hover:border-gray-300'
                                    }`}
                                >
                                    <div className={`w-5 h-5 rounded border flex items-center justify-center ${
                                        selectedAges.includes(age) ? 'bg-blue-500 border-blue-500' : 'border-gray-300'
                                    }`}>
                                        {selectedAges.includes(age) && <Check size={14} className="text-white" />}
                                    </div>
                                    <span className="text-sm font-medium">{age} ปี</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* 3. เลือกไฟล์ */}
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">เลือกรูปภาพ</label>
                        <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center bg-gray-50 hover:bg-gray-100 transition-colors relative">
                            <input 
                                type="file" 
                                multiple 
                                accept="image/*"
                                onChange={e => setFiles(e.target.files)}
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                            />
                            <div className="flex flex-col items-center gap-2 text-gray-500">
                                <UploadCloud size={32} />
                                <span className="font-medium">
                                    {files && files.length > 0 
                                        ? `เลือกแล้ว ${files.length} ไฟล์` 
                                        : 'คลิกเพื่อเลือก หรือลากไฟล์มาวางที่นี่'}
                                </span>
                            </div>
                        </div>
                    </div>

                    <button 
                        type="submit" 
                        disabled={uploading}
                        className="w-full bg-blue-600 text-white py-3 rounded-xl font-bold text-lg hover:bg-blue-700 disabled:bg-gray-400 transition-all shadow-lg shadow-blue-200"
                    >
                        {uploading ? 'กำลังอัปโหลด...' : 'ยืนยันการอัปโหลด'}
                    </button>
                </form>
            </div>
        </div>
    );
}