import axios from 'axios';

// ลิงก์ Cloudflare backend
const API_URL = 'https://moisture-primary-replacement-starts.trycloudflare.com/api';


const BASE_URL = API_URL.replace('/api', '');

export const API = {
  addBulkWorksheets: async (ageRanges, category, fileList) => {
    const formData = new FormData();
    
    // ageRanges จะมาเป็น Array ["2-3", "3-4"] 
    // เราจะรวมให้เป็นก้อนเดียวคั่นด้วยลูกน้ำ เช่น "2-3,3-4"
    formData.append('ageRange', ageRanges.join(',')); 
    
    formData.append('category', category);
    
    // วนลูปเอาไฟล์ทั้งหมดใส่เข้าไป
    for (let i = 0; i < fileList.length; i++) {
        formData.append('files', fileList[i]);
    }

    await axios.post(`${API_URL}/worksheets/bulk`, formData, { 
        headers: { 'Content-Type': 'multipart/form-data' } 
    });
  },
  // --- ใบงาน ---
  getWorksheets: async () => {
    const res = await axios.get(`${API_URL}/worksheets`);
    
    return res.data.map(item => {
        // ✅ สูตรวิเศษ: จัดการลิงก์รูปภาพและ PDF
        let img = item.image_url;
        let pdf = item.pdf_url;

        // ถ้าใน DB เป็นลิงก์สั้น (ขึ้นต้นด้วย /uploads/...) ให้เติมชื่อเว็บปัจจุบันเข้าไป
        // เพื่อให้เพื่อนเปิดดูรูปได้ ไม่ว่าลิงก์จะเปลี่ยนไปเป็นอะไร
        if (img && !img.startsWith('http')) {
            img = `${BASE_URL}${img}`;
        }
        if (pdf && !pdf.startsWith('http')) {
            pdf = `${BASE_URL}${pdf}`;
        }

        return {
            id: item.id,
            title: item.title,
            ageRange: item.age_range, // แปลงจาก DB snake_case เป็น camelCase
            category: item.category,
            imageUrl: img,            
            pdfUrl: pdf               
        };
    });
  },

  addWorksheet: async (formData) => {
    // ✅ ส่งแบบ multipart/form-data เพื่ออัปโหลดไฟล์
    await axios.post(`${API_URL}/worksheets`, formData, { headers: { 'Content-Type': 'multipart/form-data' } });
  },

  updateWorksheet: async (id, formData) => {
    // Backend คาดหวัง formData ที่มีไฟล์และ Existing URL
    await axios.put(`${API_URL}/worksheets/${id}`, formData, { headers: { 'Content-Type': 'multipart/form-data' } });
  },

  deleteWorksheet: async (id) => {
    await axios.delete(`${API_URL}/worksheets/${id}`);
  },

  // --- หมวดวิชา ---
  getCategories: async () => {
    const res = await axios.get(`${API_URL}/categories`);
    return res.data.map(c => ({
        id: c.id,
        name: c.name,
        ageGroup: c.age_group // แปลงจาก DB snake_case เป็น camelCase
    }));
  },
  
  addCategory: async (name, ageGroup) => {
    // ✅ ส่ง age_group เป็น snake_case กลับไปให้ Backend
    await axios.post(`${API_URL}/categories`, { name, age_group: ageGroup });
  },
  
  deleteCategory: async (id) => {
    await axios.delete(`${API_URL}/categories/${id}`);
  }
};