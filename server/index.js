const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const app = express();

// ✅ CORS: อนุญาตให้ทุกที่เข้าถึงได้ (จำเป็นสำหรับ Cloudflare/Tunnel)
app.use(cors({
    origin: '*', 
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

// ✅ Static Files: ระบุ path ของโฟลเดอร์ uploads ให้แม่นยำ
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ✅ Database: เชื่อมต่อ MySQL
const db = mysql.createConnection({
    host: '127.0.0.1',
    user: 'root',
    password: '', 
    database: 'kids_db' 
});

db.connect(err => {
    if (err) console.error('❌ Connect MySQL Fail:', err);
    else console.log('✅ Connect MySQL Success!');
});

// ✅ Multer: ตั้งค่าการอัปโหลดไฟล์
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const dir = './uploads';
        if (!fs.existsSync(dir)) fs.mkdirSync(dir);
        cb(null, dir);
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});
const upload = multer({ storage: storage });
const cpUpload = upload.fields([{ name: 'image' }, { name: 'pdf' }]);

// ==========================================
// 🔥 API ระบบสมาชิก (Login/Register)
// ==========================================

app.post('/api/login', (req, res) => {
    const { username, password } = req.body;
    db.query('SELECT * FROM users WHERE username = ? AND password = ?', [username, password], (err, result) => {
        if (err) return res.status(500).json(err);
        
        if (result.length > 0) {
            const user = result[0];
            res.json({ 
                success: true, 
                user: { id: user.id, username: user.username, name: user.name, role: user.role } 
            });
        } else {
            res.json({ success: false, message: 'ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง' });
        }
    });
});

app.post('/api/register', (req, res) => {
    const { username, password, name } = req.body;
    db.query('INSERT INTO users (username, password, name, role) VALUES (?, ?, ?, "user")', [username, password, name], (err, result) => {
        if (err) {
            if (err.errno === 1062) return res.json({ success: false, message: 'ชื่อผู้ใช้นี้มีคนใช้แล้ว' });
            return res.status(500).json(err);
        }
        res.json({ success: true });
    });
});

// ==========================================
// 📄 API ใบงาน (Worksheets)
// ==========================================

// 1. Get Worksheets
app.get('/api/worksheets', (req, res) => {
    db.query('SELECT * FROM worksheets ORDER BY created_at DESC', (err, result) => {
        if (err) return res.status(500).json(err);
        res.json(result);
    });
});

// 2. Add Worksheet (รองรับหลายวิชา)
app.post('/api/worksheets', cpUpload, (req, res) => {
    // รับค่า category มาเป็นข้อความ (เช่น "คณิตศาสตร์,ภาษาไทย")
    const { title, ageRange, category } = req.body;
    
    // ✅ FIX: ใช้ path สั้นๆ
    const baseUrl = '/uploads/';
    const imageUrl = (req.files && req.files['image']) ? baseUrl + req.files['image'][0].filename : '';
    const pdfUrl = (req.files && req.files['pdf']) ? baseUrl + req.files['pdf'][0].filename : '';

    // 1. แยกชื่อวิชาด้วยลูกน้ำ (,) ให้เป็น Array
    // ถ้าไม่มีการเลือก (เช่น category เป็น undefined) ให้กัน Error ไว้
    const categoryList = category ? category.split(',') : [];

    if (categoryList.length === 0) {
         return res.status(400).json({ message: 'Category is required' });
    }

    // 2. สร้างข้อมูลสำหรับบันทึกหลายแถวพร้อมกัน
    const values = categoryList.map(cat => [
        title, 
        ageRange, 
        cat.trim(), // ตัดช่องว่างหน้าหลังออก
        imageUrl, 
        pdfUrl
    ]);

    // 3. ใช้คำสั่ง INSERT แบบ Bulk
    const sql = 'INSERT INTO worksheets (title, age_range, category, image_url, pdf_url) VALUES ?';
    
    db.query(sql, [values], (err, result) => {
        if (err) {
            console.error(err);
            return res.status(500).json(err);
        }
        res.json({ message: `Success! Added to ${result.affectedRows} categories.`, id: result.insertId });
    });
});

// ✅ 3. Update Worksheet (นี่คือส่วนที่หายไป! ผมเติมให้แล้วครับ)
app.put('/api/worksheets/:id', cpUpload, (req, res) => {
    const id = req.params.id;
    const { title, ageRange, category, existingImage, existingPdf } = req.body;
    
    // ✅ FIX: ใช้ path สั้นๆ
    const baseUrl = '/uploads/';

    // 🔥 ฟังก์ชันวิเศษ: ตัดชื่อเว็บ Cloudflare ทิ้ง ให้เหลือแค่ /uploads/xxx.jpg
    const cleanUrl = (url) => {
        if (!url) return '';
        if (url.includes('/uploads/')) {
            return url.substring(url.indexOf('/uploads/'));
        }
        return url;
    };

    // เช็คว่ามีไฟล์ใหม่ไหม? ถ้ามีใช้ไฟล์ใหม่ ถ้าไม่มีใช้ไฟล์เดิม(ที่ผ่านการตัดชื่อเว็บออกแล้ว)
    const imageUrl = (req.files && req.files['image']) 
        ? baseUrl + req.files['image'][0].filename 
        : cleanUrl(existingImage);

    const pdfUrl = (req.files && req.files['pdf']) 
        ? baseUrl + req.files['pdf'][0].filename 
        : cleanUrl(existingPdf);

    const sql = 'UPDATE worksheets SET title=?, age_range=?, category=?, image_url=?, pdf_url=? WHERE id=?';
    db.query(sql, [title, ageRange, category, imageUrl, pdfUrl, id], (err, result) => {
        if (err) return res.status(500).json(err);
        res.json({ message: 'Updated' });
    });
});

// 4. Delete Worksheet
app.delete('/api/worksheets/:id', (req, res) => {
    db.query('DELETE FROM worksheets WHERE id = ?', [req.params.id], (err, result) => {
        if (err) return res.status(500).json(err);
        res.json({ message: 'Deleted' });
    });
});

// ==========================================
// 🏷️ API หมวดวิชา (Categories)
// ==========================================

app.get('/api/categories', (req, res) => {
    db.query('SELECT * FROM categories', (err, result) => {
        if (err) return res.status(500).json(err);
        res.json(result);
    });
});

app.post('/api/categories', (req, res) => {
    const { name, age_group } = req.body;
    db.query('INSERT INTO categories (name, age_group) VALUES (?, ?)', [name, age_group], (err, result) => {
        if (err) {
            if (err.errno === 1062) return res.status(409).json({ message: 'Duplicate category' });
            return res.status(500).json(err);
        }
        res.json({ message: 'Added', id: result.insertId });
    });
});

app.delete('/api/categories/:id', (req, res) => {
    db.query('DELETE FROM categories WHERE id = ?', [req.params.id], (err, result) => {
        if (err) return res.status(500).json(err);
        res.json({ message: 'Deleted' });
    });
});

// ✅ API: อัปโหลดทีเดียวหลายรูป (Bulk Upload)
app.post('/api/worksheets/bulk', upload.array('files'), (req, res) => {
    const { ageRange, category } = req.body;
    const files = req.files;

    if (!files || files.length === 0) {
        return res.status(400).json({ message: 'กรุณาเลือกไฟล์อย่างน้อย 1 ไฟล์' });
    }

    const sql = 'INSERT INTO worksheets (title, age_range, category, image_url, pdf_url) VALUES ?';
    const baseUrl = '/uploads/'; // ใช้ path สั้น
    
    const values = files.map(file => {
        let fileName = path.parse(file.originalname).name;
        const fileUrl = baseUrl + file.filename;
        return [fileName, ageRange, category, fileUrl, fileUrl];
    });

    db.query(sql, [values], (err, result) => {
        if (err) {
            console.error(err);
            return res.status(500).json(err);
        }
        res.json({ message: `เพิ่มสำเร็จ ${result.affectedRows} รายการ` });
    });
});

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`🚀 Server running on http://127.0.0.1:${PORT}`);
});