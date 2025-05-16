const express = require('express');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();
const multer = require('multer');
const nodemailer = require('nodemailer');
const path = require('path');
const fs = require('fs');
const bcrypt = require('bcryptjs');
const winston = require('winston');
require('dotenv').config();

const app = express();

// Logger setup
const logger = winston.createLogger({
    level: 'info',
    format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json()
    ),
    transports: [
        new winston.transports.File({ filename: path.join(process.env.DB_PATH || __dirname, 'server.log') }),
        new winston.transports.Console()
    ]
});

// Create directory if DB_PATH is set
logger.info(`DB_PATH from env: ${process.env.DB_PATH}`);
if (process.env.DB_PATH) {
    const dbDir = process.env.DB_PATH;
    logger.info(`Checking directory: ${dbDir}`);
    if (!fs.existsSync(dbDir)) {
        fs.mkdirSync(dbDir, { recursive: true });
        logger.info(`Created directory: ${dbDir}`);
    } else {
        logger.info(`Directory already exists: ${dbDir}`);
    }
} else {
    logger.warn('DB_PATH not set, falling back to __dirname');
}

// SQLite setup
const dbPath = process.env.DB_PATH ? path.join(process.env.DB_PATH, 'industrial.db') : path.join(__dirname, 'industrial.db');
logger.info(`Attempting to connect to database at ${dbPath}`);
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        logger.error(`Failed to connect to database: ${err.message}`);
        throw err;
    }
    logger.info(`Connected to SQLite database at ${dbPath}`);
});

// Middleware
app.use(cors({
    origin: process.env.NODE_ENV === 'production' ? false : '*',
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type']
}));
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'Uploads')));

// Multer setup for file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadDir = path.join(__dirname, 'Uploads');
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}-${file.originalname}`);
    }
});
const upload = multer({ storage });

// Nodemailer setup
const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.ethereal.email',
    port: process.env.SMTP_PORT || 587,
    auth: {
        user: process.env.SMTP_USER || 'your_ethereal_user',
        pass: process.env.SMTP_PASS || 'your_ethereal_pass'
    }
});

// DB Table Creation
db.serialize(() => {
    db.run(`CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE,
    password TEXT,
    name TEXT,
    role TEXT
  )`);
    db.run(`CREATE TABLE IF NOT EXISTS products (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    product_name TEXT NOT NULL,
    sku TEXT UNIQUE NOT NULL,
    category TEXT,
    material TEXT,
    size TEXT,
    thread_pitch TEXT,
    unit_price REAL
  )`);
    db.run(`CREATE TABLE IF NOT EXISTS product_versions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    product_id INTEGER,
    version INTEGER,
    specs TEXT,
    datasheet_url TEXT,
    uploaded_at TEXT
  )`);
    db.run(`CREATE TABLE IF NOT EXISTS orders (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    customer_name TEXT,
    product_id INTEGER,
    product_name TEXT,
    quantity INTEGER,
    status TEXT,
    created_at TEXT,
    updated_at TEXT
  )`);
    db.run(`CREATE TABLE IF NOT EXISTS inventory (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    product_id INTEGER,
    product_name TEXT,
    stock INTEGER,
    location TEXT,
    last_updated TEXT
  )`);
    db.run(`CREATE TABLE IF NOT EXISTS qc_reports (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    product_id INTEGER,
    batch_number TEXT,
    date TEXT,
    inspector TEXT,
    defects TEXT,
    units_inspected INTEGER,
    units_passed INTEGER,
    units_failed INTEGER,
    result TEXT,
    corrective_actions TEXT,
    approval_status TEXT,
    report_url TEXT
  )`);
    db.run(`CREATE TABLE IF NOT EXISTS compliance_docs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    product_id INTEGER,
    file_url TEXT,
    type TEXT,
    uploaded_at TEXT
  )`);
    // Demo users
    db.get("SELECT COUNT(*) as count FROM users", (err, row) => {
        if (err) {
            logger.error(`Error checking users table: ${err.message}`);
            return;
        }
        if (row.count === 0) {
            const adminPass = bcrypt.hashSync('admin123', 10);
            const managerPass = bcrypt.hashSync('manager123', 10);
            const userPass = bcrypt.hashSync('user123', 10);
            db.run(`INSERT INTO users (email, password, name, role) VALUES
        ('admin@example.com', ?, 'Admin', 'admin'),
        ('manager@example.com', ?, 'Manager', 'manager'),
        ('user@example.com', ?, 'User', 'employee')
      `, [adminPass, managerPass, userPass], (err) => {
                if (err) {
                    logger.error(`Error inserting demo users: ${err.message}`);
                } else {
                    logger.info('Demo users inserted successfully');
                }
            });
        }
    });
});

// Auth
app.post('/api/login', (req, res) => {
    const { email, password } = req.body;
    db.get("SELECT id, email, name, role, password FROM users WHERE email=?", [email], (err, user) => {
        if (err) {
            logger.error(`DB error during login: ${err.message}`);
            return res.status(500).json({ message: "DB error" });
        }
        if (!user) {
            logger.warn(`Login failed: No user found for ${email}`);
            return res.status(401).json({ message: "Invalid credentials" });
        }
        bcrypt.compare(password, user.password, (err, result) => {
            if (err || !result) {
                logger.warn(`Login failed: Invalid password for ${email}`);
                return res.status(401).json({ message: "Invalid credentials" });
            }
            const { password, ...userData } = user;
            logger.info(`Successful login for ${email}`);
            res.json(userData);
        });
    });
});

// Product & Catalog Management
app.get('/api/products', (req, res) => {
    const { search = "" } = req.query;
    let sql = "SELECT * FROM products";
    let params = [];
    if (search) {
        sql += " WHERE product_name LIKE ? OR sku LIKE ? OR category LIKE ? OR material LIKE ? OR size LIKE ?";
        params = Array(5).fill(`%${search}%`);
    }
    db.all(sql, params, (err, rows) => {
        if (err) {
            logger.error(`DB error fetching products: ${err.message}`);
            return res.status(500).json({ message: "DB error", error: err.message });
        }
        res.json(rows || []);
    });
});

app.post('/api/products', (req, res) => {
    const { product_name, sku, category, material, size, thread_pitch, unit_price } = req.body;
    db.run(
        `INSERT INTO products (product_name, sku, category, material, size, thread_pitch, unit_price)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [product_name, sku, category, material, size, thread_pitch, unit_price],
        function (err) {
            if (err) {
                logger.error(`DB error adding product: ${err.message}`);
                return res.status(500).json({ message: "DB error", error: err.message });
            }
            logger.info(`Added product: ${product_name}`);
            res.status(201).json({ id: this.lastID });
        }
    );
});

app.post('/api/products/upload-csv', express.json(), (req, res) => {
    const { products } = req.body;
    if (!Array.isArray(products)) {
        logger.error('Invalid CSV data: products is not an array');
        return res.status(400).json({ message: "Invalid CSV data" });
    }
    const stmt = db.prepare(
        "INSERT OR IGNORE INTO products (product_name, sku, category, material, size, thread_pitch, unit_price) VALUES (?, ?, ?, ?, ?, ?, ?)"
    );
    for (const p of products) {
        stmt.run([
            p["Product Name"],
            p["SKU / Part No."],
            p["Category"],
            p["Material"],
            p["Size / Dimension"],
            p["Thread Pitch"] || "",
            parseFloat(p["Unit Price (₹)"]) || 0
        ]);
    }
    stmt.finalize((err) => {
        if (err) {
            logger.error(`DB error finalizing CSV upload: ${err.message}`);
            return res.status(500).json({ message: "DB error" });
        }
        logger.info('CSV products uploaded successfully');
        res.json({ success: true });
    });
});

app.post('/api/products/:id/version', upload.single('datasheet'), (req, res) => {
    const { id } = req.params;
    const { specs } = req.body;
    const datasheet_url = req.file ? `/uploads/${req.file.filename}` : null;
    db.get("SELECT COALESCE(MAX(version), 0) as version FROM product_versions WHERE product_id=?", [id], (err, row) => {
        if (err) {
            logger.error(`DB error checking product version: ${err.message}`);
            return res.status(500).json({ message: "DB error" });
        }
        const newVersion = row.version + 1;
        db.run("INSERT INTO product_versions (product_id, version, specs, datasheet_url, uploaded_at) VALUES (?, ?, ?, ?, ?)",
            [id, newVersion, specs, datasheet_url, new Date().toISOString()],
            function (err) {
                if (err) {
                    logger.error(`DB error adding product version: ${err.message}`);
                    return res.status(500).json({ message: "DB error" });
                }
                logger.info(`Added version ${newVersion} for product ${id}`);
                res.json({ success: true, version: newVersion });
            }
        );
    });
});

app.get('/api/products/:id/versions', (req, res) => {
    db.all("SELECT * FROM product_versions WHERE product_id=? ORDER BY version DESC", [req.params.id], (err, rows) => {
        if (err) {
            logger.error(`DB error fetching product versions: ${err.message}`);
            return res.status(500).json({ message: "DB error" });
        }
        res.json(rows || []);
    });
});

// Orders
app.get('/api/orders', (req, res) => {
    db.all("SELECT * FROM orders ORDER BY created_at DESC", (err, rows) => {
        if (err) {
            logger.error(`DB error fetching orders: ${err.message}`);
            return res.status(500).json({ message: "DB error" });
        }
        res.json(rows || []);
    });
});

app.get('/api/orders/:id', (req, res) => {
    db.get("SELECT * FROM orders WHERE id=?", [req.params.id], (err, row) => {
        if (err) {
            logger.error(`DB error fetching order ${req.params.id}: ${err.message}`);
            return res.status(500).json({ message: "DB error" });
        }
        if (!row) {
            logger.warn(`Order ${req.params.id} not found`);
            return res.status(404).json({ message: "Order not found" });
        }
        res.json(row);
    });
});

app.post('/api/orders/customer', (req, res) => {
    const { customer_name, product_id, product_name, quantity } = req.body;
    const now = new Date().toISOString();
    db.run("INSERT INTO orders (customer_name, product_id, product_name, quantity, status, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?)",
        [customer_name, product_id, product_name, quantity, "Pending", now, now],
        function (err) {
            if (err) {
                logger.error(`DB error adding order: ${err.message}`);
                return res.status(500).json({ message: "DB error" });
            }
            transporter.sendMail({
                from: '"Fastener Portal" <no-reply@fasteners.com>',
                to: process.env.STAFF_EMAIL || "staff@company.com",
                subject: "New Customer Order",
                text: `A new order for ${quantity} x ${product_name} has been placed by ${customer_name}.`
            }, (err, info) => {
                if (err) {
                    logger.error(`Email error: ${err.message}`);
                } else {
                    logger.info(`Email sent: ${info.response}`);
                }
            });
            logger.info(`Added order for ${product_name} by ${customer_name}`);
            res.status(201).json({ id: this.lastID });
        }
    );
});

// Inventory
app.get('/api/inventory', (req, res) => {
    db.all("SELECT * FROM inventory", (err, rows) => {
        if (err) {
            logger.error(`DB error fetching inventory: ${err.message}`);
            return res.status(500).json({ message: "DB error" });
        }
        res.json(rows || []);
    });
});

app.get('/api/inventory/alerts', (req, res) => {
    db.all("SELECT * FROM inventory WHERE stock < 20", (err, rows) => {
        if (err) {
            logger.error(`DB error fetching inventory alerts: ${err.message}`);
            return res.status(500).json({ message: "DB error" });
        }
        res.json({ lowStock: rows });
    });
});

app.get('/api/inventory/forecast', (req, res) => {
    db.all("SELECT product_id, product_name, stock FROM inventory", (err, rows) => {
        if (err) {
            logger.error(`DB error fetching inventory forecast: ${err.message}`);
            return res.status(500).json({ message: "DB error" });
        }
        const forecast = rows.map(r => ({
            product_id: r.product_id,
            product_name: r.product_name,
            forecast: Math.max(0, r.stock - Math.floor(Math.random() * 10 + 5))
        }));
        res.json(forecast);
    });
});

// Quality Control & Compliance
app.post('/api/qc_reports', upload.single('report'), (req, res) => {
    const { product_id, batch_number, inspector, defects, units_inspected, units_passed, units_failed, result, corrective_actions, approval_status } = req.body;
    const report_url = req.file ? `/uploads/${req.file.filename}` : null;
    db.run(`INSERT INTO qc_reports (product_id, batch_number, date, inspector, defects, units_inspected, units_passed, units_failed, result, corrective_actions, approval_status, report_url)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [product_id, batch_number, new Date().toISOString(), inspector, defects, units_inspected, units_passed, units_failed, result, corrective_actions, approval_status, report_url],
        function (err) {
            if (err) {
                logger.error(`DB error adding QC report: ${err.message}`);
                return res.status(500).json({ message: "DB error" });
            }
            logger.info(`Added QC report for product ${product_id}`);
            res.status(201).json({ id: this.lastID });
        });
});

app.get('/api/qc_reports', (req, res) => {
    db.all("SELECT * FROM qc_reports ORDER BY date DESC", (err, rows) => {
        if (err) {
            logger.error(`DB error fetching QC reports: ${err.message}`);
            return res.status(500).json({ message: "DB error" });
        }
        res.json(rows || []);
    });
});

app.post('/api/compliance_docs', upload.single('file'), (req, res) => {
    const { product_id, type } = req.body;
    const file_url = req.file ? `/Uploads/${req.file.filename}` : null;
    db.run("INSERT INTO compliance_docs (product_id, file_url, type, uploaded_at) VALUES (?, ?, ?, ?)",
        [product_id, file_url, type, new Date().toISOString()],
        function (err) {
            if (err) {
                logger.error(`DB error adding compliance doc: ${err.message}`);
                return res.status(500).json({ message: "DB error" });
            }
            logger.info(`Added compliance doc for product ${product_id}`);
            res.status(201).json({ id: this.lastID });
        });
});

app.get('/api/compliance_docs', (req, res) => {
    db.all("SELECT * FROM compliance_docs ORDER BY uploaded_at DESC", (err, rows) => {
        if (err) {
            logger.error(`DB error fetching compliance docs: ${err.message}`);
            return res.status(500).json({ message: "DB error" });
        }
        res.json(rows || []);
    });
});

// Analytics
app.get('/api/analytics', (req, res) => {
    db.get("SELECT COUNT(*) as totalOrders FROM orders", (err, row1) => {
        if (err) {
            logger.error(`DB error fetching analytics (totalOrders): ${err.message}`);
            return res.status(500).json({ message: "DB error" });
        }
        db.get("SELECT COUNT(*) as pendingOrders FROM orders WHERE status='Pending'", (err, row2) => {
            if (err) {
                logger.error(`DB error fetching analytics (pendingOrders): ${err.message}`);
                return res.status(500).json({ message: "DB error" });
            }
            db.get("SELECT SUM(stock) as totalStock FROM inventory", (err, row3) => {
                if (err) {
                    logger.error(`DB error fetching analytics (totalStock): ${err.message}`);
                    return res.status(500).json({ message: "DB error" });
                }
                res.json({
                    totalOrders: row1.totalOrders,
                    pendingOrders: row2.pendingOrders,
                    totalStock: row3.totalStock
                });
            });
        });
    });
});

app.get('/api/analytics/insights', (req, res) => {
    res.json([
        { message: "Stock of Bolt has been depleting 20% faster this quarter." },
        { message: "QC pass rate improved by 5% in last month." }
    ]);
});

// Ping endpoint for server readiness
app.get('/api/ping', (req, res) => res.json({ status: 'ok' }));

// Start server
const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () => {
    const address = server.address();
    const actualPort = typeof address === 'object' ? address.port : PORT;
    logger.info(`API running on http://localhost:${actualPort}`);
    process.send?.({ port: actualPort });
});

server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
        logger.error(`Port ${PORT} is in use, retrying on another port...`);
        server.listen(0);
    } else {
        logger.error(`Server error: ${err.message}`);
        throw err;
    }
});

// Graceful shutdown
process.on('SIGTERM', () => {
    logger.info('SIGTERM received. Closing server...');
    server.close(() => {
        db.close((err) => {
            if (err) {
                logger.error(`Error closing database: ${err.message}`);
            }
            logger.info('Database closed.');
            process.exit(0);
        });
    });
});