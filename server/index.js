const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const app = express();

// CORS: อนุญาตให้ทุกที่เข้าถึงได้
app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(express.json());

// Static Files
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Database: เชื่อมต่อ MySQL
const db = mysql.createConnection({
  host: "127.0.0.1",
  user: "root",
  password: "",
  database: "kids_db",
});

db.connect((err) => {
  if (err) console.error("❌ Connect MySQL Fail:", err);
  else console.log("✅ Connect MySQL Success!");
});

// ==========================================
//  Multer: ตั้งค่าการอัปโหลดไฟล์ (ใบงาน)
// ==========================================
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = path.join(__dirname, "uploads");
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

const upload = multer({ storage });
const cpUpload = upload.fields([{ name: "image" }, { name: "pdf" }]);

// ==========================================
//  Multer: Upload logo สำหรับ Age Group
// ==========================================
const ageLogoStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = path.join(__dirname, "uploads", "age-logos");
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `age_${req.params.id}_${Date.now()}${ext}`);
  },
});

const uploadAgeLogo = multer({
  storage: ageLogoStorage,
  limits: { fileSize: 2 * 1024 * 1024 }, // 2MB
  fileFilter: (req, file, cb) => {
    if (!file.mimetype.startsWith("image/")) return cb(new Error("Only image files are allowed"));
    cb(null, true);
  },
});

const uploadAgeLogoSingle = (fieldName) => (req, res, next) => {
  uploadAgeLogo.single(fieldName)(req, res, (err) => {
    if (err) return res.status(400).json({ message: err.message || "Upload error" });
    next();
  });
};

// ==========================================
//  Multer: Upload Cate Cover สำหรับ Age Group
// ==========================================
const ageCateCoverStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = path.join(__dirname, "uploads", "age-cate-covers");
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `cate_${req.params.id}_${Date.now()}${ext}`);
  },
});

const uploadAgeCateCover = multer({
  storage: ageCateCoverStorage,
  limits: { fileSize: 4 * 1024 * 1024 }, // 4MB
  fileFilter: (req, file, cb) => {
    if (!file.mimetype.startsWith("image/")) return cb(new Error("Only image files are allowed"));
    cb(null, true);
  },
});

const uploadAgeCateCoverSingle = (fieldName) => (req, res, next) => {
  uploadAgeCateCover.single(fieldName)(req, res, (err) => {
    if (err) return res.status(400).json({ message: err.message || "Upload error" });
    next();
  });
};

// ==========================================
//  Multer: Upload ICON สำหรับ Categories (NEW)
// ==========================================
const categoryIconStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = path.join(__dirname, "uploads", "category-icons");
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `cat_${req.params.id}_${Date.now()}${ext}`);
  },
});

const uploadCategoryIcon = multer({
  storage: categoryIconStorage,
  limits: { fileSize: 2 * 1024 * 1024 }, // 2MB
  fileFilter: (req, file, cb) => {
    if (!file.mimetype.startsWith("image/")) return cb(new Error("Only image files are allowed"));
    cb(null, true);
  },
});

const uploadCategoryIconSingle = (fieldName) => (req, res, next) => {
  uploadCategoryIcon.single(fieldName)(req, res, (err) => {
    if (err) return res.status(400).json({ message: err.message || "Upload error" });
    next();
  });
};

// ==========================================
//  API ระบบสมาชิก (Login/Register)
// ==========================================
app.post("/api/login", (req, res) => {
  const { username, password } = req.body;
  db.query(
    "SELECT * FROM users WHERE username = ? AND password = ?",
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
            role: user.role,
          },
        });
      } else {
        res.json({ success: false, message: "ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง" });
      }
    }
  );
});

app.post("/api/register", (req, res) => {
  const { username, password, name } = req.body;
  db.query(
    'INSERT INTO users (username, password, name, role) VALUES (?, ?, ?, "user")',
    [username, password, name],
    (err) => {
      if (err) {
        if (err.errno === 1062) {
          return res.json({ success: false, message: "ชื่อผู้ใช้นี้มีคนใช้แล้ว" });
        }
        return res.status(500).json(err);
      }
      res.json({ success: true });
    }
  );
});

// ==========================================
//  API ระดับชั้น (Age Groups)
// ==========================================

// 1) Get Age Groups
app.get("/api/age-groups", (req, res) => {
  db.query("SELECT * FROM age_groups ORDER BY sort_order ASC, id ASC", (err, result) => {
    if (err) return res.status(500).json(err);
    res.json(result);
  });
});

app.get("/api/age-groups/:id", (req, res) => {
  db.query("SELECT * FROM age_groups WHERE id = ?", [req.params.id], (err, rows) => {
    if (err) return res.status(500).json(err);
    if (!rows || rows.length === 0) return res.status(404).json({ message: "Not found" });
    res.json(rows[0]);
  });
});

app.post("/api/age-groups", (req, res) => {
  const { ageValue, label, desc, color, icon, sortOrder } = req.body;

  const finalAgeValue = (ageValue && String(ageValue).trim()) || label || "";
  const parsedSort = parseInt(sortOrder, 10);
  const finalSort = Number.isNaN(parsedSort) ? 0 : parsedSort;

  const sql = `
    INSERT INTO age_groups (age_value, label, description, color, icon_name, sort_order)
    VALUES (?, ?, ?, ?, ?, ?)
  `;
  db.query(sql, [finalAgeValue, label, desc || "", color || "", icon || "", finalSort], (err, result) => {
    if (err) return res.status(500).json(err);
    res.json({ message: "Added", id: result.insertId });
  });
});

app.put("/api/age-groups/:id", (req, res) => {
  const { ageValue, label, desc, color, icon, sortOrder } = req.body;

  const finalAgeValue = (ageValue && String(ageValue).trim()) || label || "";
  const parsedSort = parseInt(sortOrder, 10);
  const finalSort = Number.isNaN(parsedSort) ? 0 : parsedSort;

  const sql = `
    UPDATE age_groups
    SET age_value=?, label=?, description=?, color=?, icon_name=?, sort_order=?
    WHERE id=?
  `;
  db.query(sql, [finalAgeValue, label, desc || "", color || "", icon || "", finalSort, req.params.id], (err) => {
    if (err) return res.status(500).json(err);
    res.json({ message: "Updated" });
  });
});

app.delete("/api/age-groups/:id", (req, res) => {
  db.query("DELETE FROM age_groups WHERE id = ?", [req.params.id], (err) => {
    if (err) return res.status(500).json(err);
    res.json({ message: "Deleted" });
  });
});

app.post("/api/age-groups/:id/logo", uploadAgeLogoSingle("logo"), (req, res) => {
  const id = req.params.id;
  if (!req.file) return res.status(400).json({ message: "กรุณาอัปโหลดไฟล์โลโก้" });

  const logoUrl = `/uploads/age-logos/${req.file.filename}`;

  db.query("SELECT id, logo_url FROM age_groups WHERE id=?", [id], (err, rows) => {
    if (err) return res.status(500).json(err);

    if (!rows || rows.length === 0) {
      const newPath = path.join(__dirname, "uploads", "age-logos", req.file.filename);
      if (fs.existsSync(newPath)) fs.unlink(newPath, () => {});
      return res.status(404).json({ message: "ไม่พบ Age Group นี้" });
    }

    const oldLogo = rows[0].logo_url;

    db.query("UPDATE age_groups SET logo_url=? WHERE id=?", [logoUrl, id], (err2) => {
      if (err2) return res.status(500).json(err2);

      if (oldLogo && typeof oldLogo === "string" && oldLogo.startsWith("/uploads/age-logos/")) {
        const oldPath = path.join(__dirname, oldLogo.replace(/^\//, ""));
        if (fs.existsSync(oldPath)) fs.unlink(oldPath, () => {});
      }

      res.json({ message: "อัปโหลดโลโก้สำเร็จ", logoUrl });
    });
  });
});

app.post("/api/age-groups/:id/cate-cover", uploadAgeCateCoverSingle("cover"), (req, res) => {
  const id = req.params.id;
  if (!req.file) return res.status(400).json({ message: "กรุณาอัปโหลดไฟล์ปก" });

  const cateCoverUrl = `/uploads/age-cate-covers/${req.file.filename}`;

  db.query("SELECT id, cate_cover_url FROM age_groups WHERE id=?", [id], (err, rows) => {
    if (err) return res.status(500).json(err);

    if (!rows || rows.length === 0) {
      const newPath = path.join(__dirname, "uploads", "age-cate-covers", req.file.filename);
      if (fs.existsSync(newPath)) fs.unlink(newPath, () => {});
      return res.status(404).json({ message: "ไม่พบ Age Group นี้" });
    }

    const oldCover = rows[0].cate_cover_url;

    db.query("UPDATE age_groups SET cate_cover_url=? WHERE id=?", [cateCoverUrl, id], (err2) => {
      if (err2) return res.status(500).json(err2);

      if (oldCover && typeof oldCover === "string" && oldCover.startsWith("/uploads/age-cate-covers/")) {
        const oldPath = path.join(__dirname, oldCover.replace(/^\//, ""));
        if (fs.existsSync(oldPath)) fs.unlink(oldPath, () => {});
      }

      res.json({ message: "อัปโหลดปก Cate สำเร็จ", cateCoverUrl });
    });
  });
});

app.delete("/api/age-groups/:id/cate-cover", (req, res) => {
  const id = req.params.id;

  db.query("SELECT cate_cover_url FROM age_groups WHERE id=?", [id], (err, rows) => {
    if (err) return res.status(500).json(err);
    if (!rows || rows.length === 0) return res.status(404).json({ message: "ไม่พบ Age Group นี้" });

    const oldCover = rows[0].cate_cover_url;

    db.query("UPDATE age_groups SET cate_cover_url=NULL WHERE id=?", [id], (err2) => {
      if (err2) return res.status(500).json(err2);

      if (oldCover && typeof oldCover === "string" && oldCover.startsWith("/uploads/age-cate-covers/")) {
        const oldPath = path.join(__dirname, oldCover.replace(/^\//, ""));
        if (fs.existsSync(oldPath)) fs.unlink(oldPath, () => {});
      }

      res.json({ message: "ลบปก Cate แล้ว" });
    });
  });
});

// ==========================================
//  API ใบงาน (Worksheets)
// ==========================================
app.get("/api/worksheets", (req, res) => {
  db.query("SELECT * FROM worksheets ORDER BY created_at DESC", (err, result) => {
    if (err) return res.status(500).json(err);
    res.json(result);
  });
});

app.post("/api/worksheets", cpUpload, (req, res) => {
  const { title, ageRange, category } = req.body;

  const baseUrl = "/uploads/";
  const imageUrl = req.files && req.files["image"] ? baseUrl + req.files["image"][0].filename : "";
  const pdfUrl = req.files && req.files["pdf"] ? baseUrl + req.files["pdf"][0].filename : "";

  const categoryList = category ? category.split(",") : [];
  if (categoryList.length === 0) return res.status(400).json({ message: "Category is required" });

  const values = categoryList.map((cat) => [title, ageRange, cat.trim(), imageUrl, pdfUrl]);

  const sql = "INSERT INTO worksheets (title, age_range, category, image_url, pdf_url) VALUES ?";
  db.query(sql, [values], (err, result) => {
    if (err) return res.status(500).json(err);
    res.json({ message: `Success! Added to ${result.affectedRows} categories.`, id: result.insertId });
  });
});

app.put("/api/worksheets/:id", cpUpload, (req, res) => {
  const id = req.params.id;
  const { title, ageRange, category, existingImage, existingPdf } = req.body;

  const baseUrl = "/uploads/";
  const cleanUrl = (url) => {
    if (!url) return "";
    if (url.includes("/uploads/")) return url.substring(url.indexOf("/uploads/"));
    return url;
  };

  const imageUrl =
    req.files && req.files["image"] ? baseUrl + req.files["image"][0].filename : cleanUrl(existingImage);

  const pdfUrl = req.files && req.files["pdf"] ? baseUrl + req.files["pdf"][0].filename : cleanUrl(existingPdf);

  const sql = "UPDATE worksheets SET title=?, age_range=?, category=?, image_url=?, pdf_url=? WHERE id=?";
  db.query(sql, [title, ageRange, category, imageUrl, pdfUrl, id], (err) => {
    if (err) return res.status(500).json(err);
    res.json({ message: "Updated" });
  });
});

app.delete("/api/worksheets/:id", (req, res) => {
  db.query("DELETE FROM worksheets WHERE id = ?", [req.params.id], (err) => {
    if (err) return res.status(500).json(err);
    res.json({ message: "Deleted" });
  });
});

// ==========================================
//  API หมวดวิชา (Categories)
// ==========================================
app.get("/api/categories", (req, res) => {
  db.query("SELECT * FROM categories ORDER BY age_group ASC, sort_order ASC, id ASC", (err, result) => {
    if (err) return res.status(500).json(err);
    res.json(result);
  });
});

app.post("/api/categories", (req, res) => {
  const { name, age_group, sort_order } = req.body;

  const parsedSort = parseInt(sort_order, 10);
  const finalSort = Number.isNaN(parsedSort) ? 0 : parsedSort;

  db.query(
    "INSERT INTO categories (name, age_group, sort_order) VALUES (?, ?, ?)",
    [name, age_group, finalSort],
    (err, result) => {
      if (err) {
        if (err.errno === 1062) return res.status(409).json({ message: "Duplicate category" });
        return res.status(500).json(err);
      }
      res.json({ message: "Added", id: result.insertId });
    }
  );
});

//  NEW: Upload รูปไอคอนของหมวดวิชา
app.post("/api/categories/:id/icon", uploadCategoryIconSingle("icon"), (req, res) => {
  const id = req.params.id;
  if (!req.file) return res.status(400).json({ message: "กรุณาอัปโหลดไฟล์รูปไอคอน" });

  const iconUrl = `/uploads/category-icons/${req.file.filename}`;

  db.query("SELECT id, icon_url FROM categories WHERE id=?", [id], (err, rows) => {
    if (err) return res.status(500).json(err);

    if (!rows || rows.length === 0) {
      const newPath = path.join(__dirname, "uploads", "category-icons", req.file.filename);
      if (fs.existsSync(newPath)) fs.unlink(newPath, () => {});
      return res.status(404).json({ message: "ไม่พบหมวดวิชานี้" });
    }

    const oldIcon = rows[0].icon_url;

    db.query("UPDATE categories SET icon_url=? WHERE id=?", [iconUrl, id], (err2) => {
      if (err2) return res.status(500).json(err2);

      if (oldIcon && typeof oldIcon === "string" && oldIcon.startsWith("/uploads/category-icons/")) {
        const oldPath = path.join(__dirname, oldIcon.replace(/^\//, ""));
        if (fs.existsSync(oldPath)) fs.unlink(oldPath, () => {});
      }

      res.json({ message: "อัปโหลดรูปไอคอนวิชาสำเร็จ", iconUrl });
    });
  });
});

app.delete("/api/categories/:id", (req, res) => {
  db.query("DELETE FROM categories WHERE id = ?", [req.params.id], (err) => {
    if (err) return res.status(500).json(err);
    res.json({ message: "Deleted" });
  });
});

// ==========================================
//  Bulk Upload Worksheets
// ==========================================
app.post(
  "/api/worksheets/bulk",
  upload.fields([
    { name: "cover", maxCount: 1 },
    { name: "files", maxCount: 20 },
  ]),
  (req, res) => {
    const { ageRange, category } = req.body;

    const files = req.files["files"];
    const coverFile = req.files["cover"] ? req.files["cover"][0] : null;

    if (!files || files.length === 0) {
      return res.status(400).json({ message: "กรุณาเลือกไฟล์ใบงานอย่างน้อย 1 ไฟล์" });
    }

    const baseUrl = "/uploads/";
    const coverUrl = coverFile ? baseUrl + coverFile.filename : null;

    const sql = "INSERT INTO worksheets (title, age_range, category, image_url, pdf_url) VALUES ?";

    const values = files.map((file) => {
      const fileName = path.parse(file.originalname).name;
      const fileUrl = baseUrl + file.filename;
      const finalImageUrl = coverUrl || fileUrl;
      return [fileName, ageRange, category, finalImageUrl, fileUrl];
    });

    db.query(sql, [values], (err, result) => {
      if (err) return res.status(500).json(err);
      res.json({ message: `เพิ่มสำเร็จ ${result.affectedRows} รายการ` });
    });
  }
);

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://127.0.0.1:${PORT}`);
});
