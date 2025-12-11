const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const app = express();

// ✅ CORS: อนุญาตให้ทุกที่เข้าถึงได้
app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

// ✅ Static Files
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
    db.query(
        'SELECT * FROM users WHERE username = ? AND password = ?',
        [username, password],
        (err, result) => {
            if (err) return res.status(500).json(err);

            if (result.length > 0) {
                const user = result[0];
                res.json({
                    success: true,
                    user: {
                        id: user.id,
                        username: user.username,
                        name: user.name,
                        role: user.role
                    }
                });
            } else {
                res.json({ success: false, message: 'ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง' });
            }
        }
    );
});

app.post('/api/register', (req, res) => {
    const { username, password, name } = req.body;
    db.query(
        'INSERT INTO users (username, password, name, role) VALUES (?, ?, ?, "user")',
        [username, password, name],
        (err) => {
            if (err) {
                if (err.errno === 1062) {
                    return res.json({ success: false, message: 'ชื่อผู้ใช้นี้มีคนใช้แล้ว' });
                }
                return res.status(500).json(err);
            }
            res.json({ success: true });
        }
    );
});

// ==========================================
// 👶 API ระดับชั้น (Age Groups)
// ==========================================

// 1. Get Age Groups
app.get('/api/age-groups', (req, res) => {
    db.query(
        'SELECT * FROM age_groups ORDER BY sort_order ASC, id ASC',
        (err, result) => {
            if (err) return res.status(500).json(err);
            res.json(result);
        }
    );
});

// 2. Add Age Group
app.post('/api/age-groups', (req, res) => {
    const { ageValue, label, desc, color, icon, sortOrder } = req.body;

    const finalAgeValue = (ageValue && String(ageValue).trim()) || label || '';
    const parsedSort = parseInt(sortOrder, 10);
    const finalSort = Number.isNaN(parsedSort) ? 0 : parsedSort;

    const sql = `
      INSERT INTO age_groups (age_value, label, description, color, icon_name, sort_order)
      VALUES (?, ?, ?, ?, ?, ?)
    `;
    db.query(
        sql,
        [finalAgeValue, label, desc || '', color || '', icon || '', finalSort],
        (err, result) => {
            if (err) {
                console.error('Error insert age_groups:', err);
                return res.status(500).json(err);
            }
            res.json({ message: 'Added', id: result.insertId });
        }
    );
});

// 3. Update Age Group
app.put('/api/age-groups/:id', (req, res) => {
    const { ageValue, label, desc, color, icon, sortOrder } = req.body;

    const finalAgeValue = (ageValue && String(ageValue).trim()) || label || '';
    const parsedSort = parseInt(sortOrder, 10);
    const finalSort = Number.isNaN(parsedSort) ? 0 : parsedSort;

    const sql = `
      UPDATE age_groups
      SET age_value=?, label=?, description=?, color=?, icon_name=?, sort_order=?
      WHERE id=?
    `;
    db.query(
        sql,
        [finalAgeValue, label, desc || '', color || '', icon || '', finalSort, req.params.id],
        (err) => {
            if (err) {
                console.error('Error update age_groups:', err);
                return res.status(500).json(err);
            }
            res.json({ message: 'Updated' });
        }
    );
});

// 4. Delete Age Group
app.delete('/api/age-groups/:id', (req, res) => {
    db.query(
        'DELETE FROM age_groups WHERE id = ?',
        [req.params.id],
        (err) => {
            if (err) {
                console.error('Error delete age_group:', err);
                return res.status(500).json(err);
            }
            res.json({ message: 'Deleted' });
        }
    );
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

// 2. Add Worksheet
app.post('/api/worksheets', cpUpload, (req, res) => {
    const { title, ageRange, category } = req.body;

    const baseUrl = '/uploads/';
    const imageUrl = (req.files && req.files['image']) ? baseUrl + req.files['image'][0].filename : '';
    const pdfUrl = (req.files && req.files['pdf']) ? baseUrl + req.files['pdf'][0].filename : '';

    const categoryList = category ? category.split(',') : [];

    if (categoryList.length === 0) {
        return res.status(400).json({ message: 'Category is required' });
    }

    const values = categoryList.map(cat => [
        title,
        ageRange,
        cat.trim(),
        imageUrl,
        pdfUrl
    ]);

    const sql = 'INSERT INTO worksheets (title, age_range, category, image_url, pdf_url) VALUES ?';

    db.query(sql, [values], (err, result) => {
        if (err) {
            console.error(err);
            return res.status(500).json(err);
        }
        res.json({ message: `Success! Added to ${result.affectedRows} categories.`, id: result.insertId });
    });
});

// 3. Update Worksheet
app.put('/api/worksheets/:id', cpUpload, (req, res) => {
    const id = req.params.id;
    const { title, ageRange, category, existingImage, existingPdf } = req.body;

    const baseUrl = '/uploads/';
    const cleanUrl = (url) => {
        if (!url) return '';
        if (url.includes('/uploads/')) {
            return url.substring(url.indexOf('/uploads/'));
        }
        return url;
    };

    const imageUrl = (req.files && req.files['image'])
        ? baseUrl + req.files['image'][0].filename
        : cleanUrl(existingImage);

    const pdfUrl = (req.files && req.files['pdf'])
        ? baseUrl + req.files['pdf'][0].filename
        : cleanUrl(existingPdf);

    const sql = 'UPDATE worksheets SET title=?, age_range=?, category=?, image_url=?, pdf_url=? WHERE id=?';
    db.query(sql, [title, ageRange, category, imageUrl, pdfUrl, id], (err) => {
        if (err) return res.status(500).json(err);
        res.json({ message: 'Updated' });
    });
});

// 4. Delete Worksheet
app.delete('/api/worksheets/:id', (req, res) => {
    db.query('DELETE FROM worksheets WHERE id = ?', [req.params.id], (err) => {
        if (err) return res.status(500).json(err);
        res.json({ message: 'Deleted' });
    });
});

// ==========================================
// 🏷️ API หมวดวิชา (Categories)
// ==========================================

app.get('/api/categories', (req, res) => {
    db.query(
        'SELECT * FROM categories ORDER BY age_group ASC, sort_order ASC, id ASC',
        (err, result) => {
            if (err) return res.status(500).json(err);
            res.json(result);
        }
    );
});

app.post('/api/categories', (req, res) => {
    const { name, age_group, sort_order } = req.body;

    const parsedSort = parseInt(sort_order, 10);
    const finalSort = Number.isNaN(parsedSort) ? 0 : parsedSort;

    db.query(
        'INSERT INTO categories (name, age_group, sort_order) VALUES (?, ?, ?)',
        [name, age_group, finalSort],
        (err, result) => {
            if (err) {
                if (err.errno === 1062) {
                    return res.status(409).json({ message: 'Duplicate category' });
                }
                return res.status(500).json(err);
            }
            res.json({ message: 'Added', id: result.insertId });
        }
    );
});

app.delete('/api/categories/:id', (req, res) => {
    db.query('DELETE FROM categories WHERE id = ?', [req.params.id], (err) => {
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
    const baseUrl = '/uploads/';

    const values = files.map(file => {
        const fileName = path.parse(file.originalname).name;
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
