// server/index.js

const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const app = express();
app.use(cors());
app.use(express.json());

// 1. เปิดให้เข้าถึงไฟล์รูป/PDF ที่อัปโหลดได้
app.use('/uploads', express.static('uploads'));

// 2. ตั้งค่า Database MySQL
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',      
    password: '',      
    database: 'kids_db' 
});

db.connect(err => {
    if (err) {
        console.error('❌ Connect MySQL Fail:', err);
    } else {
        console.log('✅ Connect MySQL Success!');
    }
});

// 3. ตั้งค่าการอัปโหลดไฟล์ (Multer)
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const dir = './uploads';
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir); 
        }
        cb(null, dir);
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});
const upload = multer({ storage: storage });
const cpUpload = upload.fields([{ name: 'image' }, { name: 'pdf' }]);


// --- API ROUTES ---

// 1. ดึงใบงานทั้งหมด
app.get('/api/worksheets', (req, res) => {
    db.query('SELECT * FROM worksheets ORDER BY created_at DESC', (err, result) => {
        if (err) return res.status(500).json(err);
        res.json(result);
    });
});

// 2. เพิ่มใบงานใหม่ (พร้อมรูปและ PDF)
app.post('/api/worksheets', cpUpload, (req, res) => {
    const { title, ageRange, category } = req.body;
    
    // สร้าง URL ของไฟล์เพื่อเก็บใน DB
    const baseUrl = 'http://localhost:3000/uploads/';
    const imageUrl = req.files['image'] ? baseUrl + req.files['image'][0].filename : '';
    const pdfUrl = req.files['pdf'] ? baseUrl + req.files['pdf'][0].filename : '';

    // ใช้ age_range ในการ INSERT
    const sql = 'INSERT INTO worksheets (title, age_range, category, image_url, pdf_url) VALUES (?, ?, ?, ?, ?)';
    db.query(sql, [title, ageRange, category, imageUrl, pdfUrl], (err, result) => {
        if (err) {
            console.error('SQL Error:', err);
            return res.status(500).json(err);
        }
        res.json({ message: 'Success', id: result.insertId });
    });
});

// 3. แก้ไขใบงาน
app.put('/api/worksheets/:id', cpUpload, (req, res) => {
    const id = req.params.id;
    const { title, ageRange, category, existingImage, existingPdf } = req.body;
    const baseUrl = 'http://localhost:3000/uploads/';

    // ถ้าอัปไฟล์ใหม่ ใช้ไฟล์ใหม่ ถ้าไม่ ใช้ลิงก์เดิมที่ส่งมา
    const imageUrl = req.files['image'] ? baseUrl + req.files['image'][0].filename : existingImage;
    const pdfUrl = req.files['pdf'] ? baseUrl + req.files['pdf'][0].filename : existingPdf;

    const sql = 'UPDATE worksheets SET title=?, age_range=?, category=?, image_url=?, pdf_url=? WHERE id=?';
    db.query(sql, [title, ageRange, category, imageUrl, pdfUrl, id], (err, result) => {
        if (err) return res.status(500).json(err);
        res.json({ message: 'Updated' });
    });
});


// 4. ลบใบงาน
app.delete('/api/worksheets/:id', (req, res) => {
    const id = req.params.id;
    db.query('DELETE FROM worksheets WHERE id = ?', [id], (err, result) => {
        if (err) return res.status(500).json(err);
        res.json({ message: 'Deleted' });
    });
});

// --- API สำหรับหมวดวิชา (Categories) ---

// 5. ดึงหมวดวิชา (✅ FIX: ดึง id และ age_group มาด้วย)
app.get('/api/categories', (req, res) => {
    db.query('SELECT * FROM categories', (err, result) => {
        if (err) return res.status(500).json(err);
        // ไม่ต้อง map array ถ้า select *
        res.json(result); 
    });
});

// 6. เพิ่มหมวดวิชา (✅ FIX: รับ age_group มาจาก Frontend)
app.post('/api/categories', (req, res) => {
    const { name, age_group } = req.body; // รับ age_group มาจาก Frontend
    db.query('INSERT INTO categories (name, age_group) VALUES (?, ?)', [name, age_group], (err, result) => {
        if (err) return res.status(500).json(err);
        res.json({ message: 'Added', id: result.insertId });
    });
});

// 7. ลบหมวดวิชา (✅ FIX: ลบด้วย ID)
app.delete('/api/categories/:id', (req, res) => {
    const id = req.params.id;
    db.query('DELETE FROM categories WHERE id = ?', [id], (err, result) => {
        if (err) return res.status(500).json(err);
        res.json({ message: 'Deleted' });
    });
});


// เริ่มเซิร์ฟเวอร์ที่ Port 3000
const PORT = 3000;
app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
});