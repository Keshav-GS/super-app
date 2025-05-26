const express = require('express');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();
const multer = require('multer');
const nodemailer = require('nodemailer');
const path = require('path');
const fs = require('fs');
const bcrypt = require('bcryptjs');
const winston = require('winston');
const csvParser = require('csv-parser');
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
const upload = multer({
    dest: 'uploads/csv/',
    fileFilter: (req, file, cb) => {
        if (file.mimetype === 'text/csv' || file.originalname.endsWith('.csv')) {
            cb(null, true);
        } else {
            cb(new Error('Only CSV files are allowed'));
        }
    }
});

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
    // Inventory movements table - references existing products table by product_id
    db.run(`CREATE TABLE IF NOT EXISTS inventory_movements (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    product_id INTEGER NOT NULL,
    quantity INTEGER NOT NULL,
    movement_type TEXT NOT NULL CHECK(movement_type IN (
      'procurement', 
      'sale', 
      'adjustment', 
      'return', 
      'transfer_in', 
      'transfer_out', 
      'damage'
    )),
    reason TEXT,
    timestamp TEXT DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(product_id) REFERENCES products(id)
  )`, (err) => {
        if (err) console.error("Error creating inventory_movements table:", err.message);
    });

    // Inventory control parameters table (optional)
    // To store min_stock_level, safety_stock, lead_time_days per product
    db.run(`CREATE TABLE IF NOT EXISTS inventory_controls (
    product_id INTEGER PRIMARY KEY,
    min_stock_level INTEGER DEFAULT 0,
    safety_stock INTEGER DEFAULT 0,
    lead_time_days INTEGER DEFAULT 0,
    FOREIGN KEY(product_id) REFERENCES products(id)
  )`, (err) => {
        if (err) console.error("Error creating inventory_controls table:", err.message);
    });
    db.run(`
    CREATE TABLE IF NOT EXISTS suppliers (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      contact_email TEXT,
      phone TEXT,
      address TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP
    )
  `);

    // Create Orders Table
    db.run(`
    CREATE TABLE IF NOT EXISTS orders (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      supplier_id INTEGER NOT NULL,
      order_date TEXT NOT NULL,
      status TEXT NOT NULL, -- e.g. 'pending', 'approved', 'received'
      total_amount REAL NOT NULL,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (supplier_id) REFERENCES suppliers(id) ON DELETE CASCADE
    )
  `);

    // Create Order Items Table
    db.run(`
    CREATE TABLE IF NOT EXISTS order_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      order_id INTEGER NOT NULL,
      product_id INTEGER NOT NULL,
      quantity INTEGER NOT NULL,
      unit_price REAL NOT NULL,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE
      FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
    )
  `);

    //     db.run(`CREATE TABLE IF NOT EXISTS qc_reports (
    //     id INTEGER PRIMARY KEY AUTOINCREMENT,
    //     product_id INTEGER,
    //     batch_number TEXT,
    //     date TEXT,
    //     inspector TEXT,
    //     defects TEXT,
    //     units_inspected INTEGER,
    //     units_passed INTEGER,
    //     units_failed INTEGER,
    //     result TEXT,
    //     corrective_actions TEXT,
    //     approval_status TEXT,
    //     report_url TEXT
    //   )`);
    //     db.run(`CREATE TABLE IF NOT EXISTS compliance_docs (
    //     id INTEGER PRIMARY KEY AUTOINCREMENT,
    //     product_id INTEGER,
    //     file_url TEXT,
    //     type TEXT,
    //     uploaded_at TEXT
    //   )`);
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
// Update product (PUT)
app.put('/api/products/:id', express.json(), (req, res) => {
    const { id } = req.params;
    const { product_name, sku, category, material, size, thread_pitch, unit_price } = req.body;

    db.run(
        `UPDATE products SET 
      product_name = ?, 
      sku = ?, 
      category = ?, 
      material = ?, 
      size = ?, 
      thread_pitch = ?, 
      unit_price = ? 
     WHERE id = ?`,
        [product_name, sku, category, material, size, thread_pitch || '', unit_price, id],
        function (err) {
            if (err) {
                logger.error(`DB error updating product ${id}: ${err.message}`);
                return res.status(500).json({ message: "DB error", error: err.message });
            }
            if (this.changes === 0) {
                return res.status(404).json({ message: "Product not found" });
            }
            logger.info(`Updated product ${id}`);
            res.json({ success: true });
        }
    );
});

// Delete product (DELETE)
app.delete('/api/products/:id', (req, res) => {
    const { id } = req.params;
    db.run(
        `DELETE FROM products WHERE id = ?`,
        [id],
        function (err) {
            if (err) {
                logger.error(`DB error deleting product ${id}: ${err.message}`);
                return res.status(500).json({ message: "DB error", error: err.message });
            }
            if (this.changes === 0) {
                return res.status(404).json({ message: "Product not found" });
            }
            logger.info(`Deleted product ${id}`);
            res.json({ success: true });
        }
    );
});


app.post('/api/products/upload-csv', upload.single('csvfile'), (req, res) => {
    if (!req.file) return res.status(400).json({ message: 'No CSV file uploaded' });

    const results = [];
    const filePath = path.resolve(req.file.path);

    fs.createReadStream(filePath)
        .pipe(csvParser())
        .on('data', (data) => results.push(data))
        .on('end', () => {
            const stmt = db.prepare(`INSERT OR IGNORE INTO products 
        (product_name, sku, category, material, size, thread_pitch, unit_price) 
        VALUES (?, ?, ?, ?, ?, ?, ?)`);

            db.serialize(() => {
                for (const p of results) {
                    // LOG for debugging
                    logger.info('Inserting product:', p);

                    stmt.run([
                        p.product_name,
                        p.sku,
                        p.category,
                        p.material,
                        p.size,
                        (p.thread_pitch && p.thread_pitch !== 'N/A') ? p.thread_pitch : '',
                        parseFloat(p.unit_price) || 0
                    ]);
                }
                stmt.finalize((err) => {
                    fs.unlink(filePath, () => { });
                    if (err) {
                        logger.error('DB error on CSV insert:', err);
                        return res.status(500).json({ message: 'Database error', error: err.message });
                    }
                    logger.info('CSV products uploaded successfully');
                    res.json({ success: true, inserted: results.length });
                });
            });
        })
        .on('error', (err) => {
            fs.unlink(filePath, () => { });
            logger.error('CSV parsing error:', err);
            res.status(400).json({ message: 'CSV parsing error', error: err.message });
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

// ORDER MANAGEMENT APIS
// Get all orders (with optional search/status)
app.get('/api/orders', (req, res) => {
    const { search = "", status = "" } = req.query;
    let sql = `
    SELECT o.id, s.name AS supplier_name, o.order_date, o.status,
      IFNULL(SUM(oi.quantity * oi.unit_price), 0) AS total_amount
    FROM orders o
    JOIN suppliers s ON o.supplier_id = s.id
    LEFT JOIN order_items oi ON o.id = oi.order_id
    WHERE 1=1
  `;
    const params = [];
    if (search) {
        sql += " AND (s.name LIKE ? OR o.id LIKE ?)";
        params.push(`%${search}%`, `%${search}%`);
    }
    if (status) {
        sql += " AND o.status = ?";
        params.push(status);
    }
    sql += " GROUP BY o.id ORDER BY o.order_date DESC";

    db.all(sql, params, (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

// --- Get order details by id (with product_id and product_name for each item) ---
app.get('/api/orders/:id', (req, res) => {
    const orderId = req.params.id;
    db.get(
        `SELECT o.id, o.supplier_id, s.name AS supplier_name, o.order_date, o.status
     FROM orders o JOIN suppliers s ON o.supplier_id = s.id WHERE o.id = ?`,
        [orderId],
        (err, order) => {
            if (err) return res.status(500).json({ error: err.message });
            if (!order) return res.status(404).json({ error: "Order not found" });

            db.all(
                `SELECT oi.id, oi.product_id, p.product_name, oi.quantity, oi.unit_price
         FROM order_items oi
         JOIN products p ON oi.product_id = p.id
         WHERE oi.order_id = ?`,
                [orderId],
                (err, items) => {
                    if (err) return res.status(500).json({ error: err.message });
                    const total_amount = items.reduce((sum, i) => sum + i.quantity * i.unit_price, 0);
                    res.json({ ...order, items, total_amount });
                }
            );
        }
    );
});

// --- Save (create or update) order, with status ---
app.post('/api/orders', (req, res) => {
    const { id, supplier_id, order_date, status, items } = req.body;
    if (!supplier_id || !order_date || !Array.isArray(items) || items.length === 0) {
        return res.status(400).json({ error: "Missing required fields" });
    }

    // Validate items structure
    for (const item of items) {
        if (!item || typeof item !== 'object' ||
            !('quantity' in item) || !('unit_price' in item) ||
            isNaN(parseFloat(item.quantity)) || isNaN(parseFloat(item.unit_price))) {
            return res.status(400).json({ error: "Each item must have valid quantity and unit_price" });
        }
    }

    // Calculate total_amount with explicit number conversion
    const total_amount = items.reduce((sum, item) => {
        const qty = parseFloat(item.quantity);
        const price = parseFloat(item.unit_price);
        return sum + qty * price;
    }, 0);


    console.log("/api/orders", req.body, "total amount", total_amount);
    if (id) {
        console.log("Updating order", id);
        // Fetch current status
        db.get(`SELECT status FROM orders WHERE id = ?`, [id], (err, row) => {
            if (err) return res.status(500).json({ error: err.message });
            const prevStatus = row ? row.status : null;
            db.run(
                `UPDATE orders SET supplier_id = ?, order_date = ?, status = ?, total_amount = ? WHERE id = ?`,
                [supplier_id, order_date, status, total_amount, id],
                (err) => {
                    if (err) return res.status(500).json({ error: err.message });
                    db.run(`DELETE FROM order_items WHERE order_id = ?`, [id], (err) => {
                        if (err) return res.status(500).json({ error: err.message });
                        const stmt = db.prepare(`INSERT INTO order_items (order_id, product_id, quantity, unit_price) VALUES (?, ?, ?, ?)`);
                        for (const item of items) {
                            stmt.run(id, item.product_id, item.quantity, item.unit_price);
                        }
                        stmt.finalize((err) => {
                            if (err) return res.status(500).json({ error: err.message });

                            // If status changed to 'received' and was not 'received' before, insert inventory movements
                            if (status === 'received' && prevStatus !== 'received') {
                                console.log("Inserting inventory movements for received order");
                                items.forEach((item) => {
                                    db.run(
                                        "INSERT INTO inventory_movements (product_id, quantity, movement_type, reason) VALUES (?, ?, 'procurement', ?)",
                                        [item.product_id, item.quantity, `Order #${id} received`],
                                        (err) => { if (err) console.error(err); }
                                    );
                                });
                            }

                            res.json({ success: true });
                        });
                    });
                }
            );
        });
    } else {
        // Insert new order
        console.log("Inserting new order");
        db.run(
            `INSERT INTO orders (supplier_id, order_date, status, total_amount) VALUES (?, ?, ?, ?)`,
            [supplier_id, order_date, status, total_amount],
            function (err) {
                if (err) {
                    console.error("Failed to insert order:", err);
                    console.log(total_amount);
                    return res.status(500).json({ error: err.message });
                }
                const orderId = this.lastID;
                const stmt = db.prepare(`INSERT INTO order_items (order_id, product_id, quantity, unit_price) VALUES (?, ?, ?, ?)`);
                for (const item of items) {
                    stmt.run(orderId, item.product_id, item.quantity, item.unit_price);
                    if (err) {
                        console.error("Failed to insert order item:", err);
                        return res.status(500).json({ error: err.message });
                    }
                }
                stmt.finalize((err) => {
                    if (err) {
                        console.error("Failed to finalize order_items insert:", err);
                        return res.status(500).json({ error: err.message });
                    }

                    // If new order is immediately 'received', insert inventory movements
                    if (status === 'received') {
                        items.forEach((item) => {
                            db.run(
                                "INSERT INTO inventory_movements (product_id, quantity, movement_type, reason) VALUES (?, ?, 'procurement', ?)",
                                [item.product_id, item.quantity, `Order #${orderId} received`],
                                (err) => { if (err) console.error(err); }
                            );
                        });
                    }
                    logger.info(`Inserted new order ${orderId}`);
                    res.json({ success: true, id: orderId });
                });
            }
        );
    }
});


// --- Mark order as received and update inventory ---
app.post('/api/orders/:id/receive', (req, res) => {
    const orderId = req.params.id;
    db.all(
        "SELECT product_id, quantity FROM order_items WHERE order_id = ?",
        [orderId],
        (err, items) => {
            if (err) {
                console.error("api/orders/receive-Failed to fetch order items:", err);
                return res.status(500).json({ error: err.message });
            }
            items.forEach((item) => {
                db.run(
                    "INSERT INTO inventory_movements (product_id, quantity, movement_type, reason) VALUES (?, ?, 'procurement', ?)",
                    [item.product_id, item.quantity, `Order #${orderId} received`],
                    (err) => { if (err) console.error(err); }
                );
            });
            db.run(
                "UPDATE orders SET status = 'received' WHERE id = ?",
                [orderId],
                (err) => {
                    if (err) return res.status(500).json({ error: err.message });
                    res.json({ success: true });
                }
            );
        }
    );
});
// Delete order (DELETE)
// Delete an order if not received
// app.delete('/api/orders/:id', (req, res) => {
//     const orderId = req.params.id;
//     console.log("Deleting order", orderId);
//     db.serialize(() => {
//         db.get('SELECT status FROM orders WHERE id = ?', [orderId], (err, row) => {
//             if (err) return res.status(500).json({ error: err.message });
//             if (!row) return res.status(404).json({ error: 'Order not found' });
//             if (row.status === 'received') {
//                 return res.status(400).json({ error: "Cannot delete a received order." });
//             }

//             // First delete order items
//             db.run('DELETE FROM order_items WHERE order_id = ?', [orderId], function (err) {
//                 if (err) return res.status(500).json({ error: err.message });

//                 // Then delete the order itself
//                 db.run('DELETE FROM orders WHERE id = ?', [orderId], function (err) {
//                     if (err) return res.status(500).json({ error: err.message });
//                     logger.info(`Deleted order ${orderId} and its items`);
//                     res.json({ success: true });
//                 });
//             });
//         });
//     });
// });



// Get suppliers list
app.get('/api/suppliers', (req, res) => {
    db.all("SELECT * FROM suppliers ORDER BY name ASC", [], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

// Add supplier
app.post('/api/suppliers', (req, res) => {
    const { name, contact_email, phone, address } = req.body;
    if (!name) return res.status(400).json({ error: "Name is required" });
    db.run(
        `INSERT INTO suppliers (name, contact_email, phone, address) VALUES (?, ?, ?, ?)`,
        [name, contact_email, phone, address],
        function (err) {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ success: true, id: this.lastID });
        }
    );
});


// Record a sale (customer order) and update inventory
app.post('/api/sales', (req, res) => {
    const { product_id, quantity, customer_name, order_note } = req.body;
    if (!product_id || !quantity || quantity <= 0)
        return res.status(400).json({ error: 'Invalid product or quantity' });

    db.get(
        "SELECT COALESCE(SUM(quantity), 0) AS stock FROM inventory_movements WHERE product_id = ?",
        [product_id],
        (err, row) => {
            if (err) return res.status(500).json({ error: err.message });
            if (row.stock < quantity) {
                return res.status(400).json({ error: "Insufficient stock" });
            }
            db.run(
                `INSERT INTO inventory_movements (product_id, quantity, movement_type, reason)
         VALUES (?, ?, 'sale', ?)`,
                [product_id, -quantity, `Sold to ${customer_name || "customer"}${order_note ? " - " + order_note : ""}`],
                function (err) {
                    if (err) return res.status(500).json({ error: err.message });
                    res.json({ success: true, id: this.lastID });
                }
            );
        }
    );
});

// Get recent sales movements (for history)
app.get('/api/sales', (req, res) => {
    db.all(`
    SELECT im.id, p.product_name, im.quantity, im.reason, im.timestamp
    FROM inventory_movements im
    JOIN products p ON im.product_id = p.id
    WHERE im.movement_type = 'sale'
    ORDER BY im.timestamp DESC
    LIMIT 50
  `, [], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});


// --- INVENTORY MANAGEMENT APIS ---

// GET /api/inventory - current stock with low stock flag
app.get('/api/inventory', (req, res) => {
    const sql = `
    SELECT p.id, p.product_name, p.sku, p.category, p.material, p.size, p.thread_pitch, p.unit_price,
      COALESCE(SUM(im.quantity), 0) AS quantity_on_hand,
      COALESCE(ic.min_stock_level, 0) AS min_stock_level,
      CASE WHEN COALESCE(SUM(im.quantity), 0) <= COALESCE(ic.min_stock_level, 0) THEN 1 ELSE 0 END AS low_stock
    FROM products p
    LEFT JOIN inventory_movements im ON p.id = im.product_id
    LEFT JOIN inventory_controls ic ON p.id = ic.product_id
    GROUP BY p.id
    ORDER BY p.product_name ASC
  `;
    db.all(sql, [], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});


// GET /api/inventory/reorder-suggestions
app.get('/api/inventory/reorder-suggestions', (req, res) => {
    const sql = `
        SELECT p.id, p.product_name, COALESCE(SUM(im.quantity), 0) AS quantity_on_hand,
            COALESCE(ic.min_stock_level, 0) AS min_stock_level,
            COALESCE(ic.safety_stock, 0) AS safety_stock,
            COALESCE(ic.lead_time_days, 0) AS lead_time_days,
            AVG(CASE WHEN im.movement_type = 'sale' THEN ABS(im.quantity) ELSE 0 END) AS avg_daily_sales
        FROM products p
        LEFT JOIN inventory_movements im ON p.id = im.product_id
        LEFT JOIN inventory_controls ic ON p.id = ic.product_id
        GROUP BY p.id
        HAVING quantity_on_hand <= (safety_stock + (lead_time_days * avg_daily_sales))
    `;
    db.all(sql, [], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        const suggestions = rows.map(item => {
            const reorder_qty = Math.max(
                0,
                Math.ceil((item.lead_time_days + 3) * item.avg_daily_sales) - item.quantity_on_hand + item.safety_stock
            );
            return { ...item, reorder_qty };
        });
        res.json(suggestions);
    });
});

// GET /api/inventory/forecast?productId=ID
app.get('/api/inventory/forecast', (req, res) => {
    const productId = req.query.productId;
    if (!productId) return res.status(400).json({ error: 'productId required' });

    db.all(
        `SELECT date(timestamp) AS date, ABS(quantity) AS quantity
         FROM inventory_movements 
         WHERE product_id = ? AND movement_type = 'sale' 
         ORDER BY date ASC`,
        [productId],
        (err, sales) => {
            if (err) return res.status(500).json({ error: err.message });
            if (!sales.length) return res.json([]);
            const windowSize = 7;
            const forecast = [];
            for (let i = 0; i <= sales.length - windowSize; i++) {
                const window = sales.slice(i, i + windowSize);
                const avg = window.reduce((sum, s) => sum + s.quantity, 0) / windowSize;
                forecast.push({ date: window[windowSize - 1].date, forecast: avg });
            }
            res.json(forecast);
        }
    );
});

// POST /api/inventory/movement
app.post('/api/inventory/movement', (req, res) => {
    const { product_id, quantity, movement_type, reason } = req.body;
    if (!product_id || !quantity || !movement_type)
        return res.status(400).json({ error: 'Missing required fields' });

    db.run(
        `INSERT INTO inventory_movements (product_id, quantity, movement_type, reason) VALUES (?, ?, ?, ?)`,
        [product_id, quantity, movement_type, reason || null],
        function (err) {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ success: true, id: this.lastID });
        }
    );
});
app.get('/api/inventory-controls', (req, res) => {
    const productId = req.query.productId;
    db.get(
        `SELECT min_stock_level, safety_stock, lead_time_days FROM inventory_controls WHERE product_id = ?`,
        [productId],
        (err, row) => {
            if (err) return res.status(500).json({ error: err.message });
            res.json(row || null);
        }
    );
});

// POST /api/inventory-controls (upsert inventory control parameters)
app.post('/api/inventory-controls', (req, res) => {
    const { product_id, min_stock_level, safety_stock, lead_time_days } = req.body;
    if (!product_id) return res.status(400).json({ error: 'product_id required' });

    db.run(
        `INSERT INTO inventory_controls (product_id, min_stock_level, safety_stock, lead_time_days)
         VALUES (?, ?, ?, ?)
         ON CONFLICT(product_id) DO UPDATE SET
           min_stock_level=excluded.min_stock_level,
           safety_stock=excluded.safety_stock,
           lead_time_days=excluded.lead_time_days`,
        [product_id, min_stock_level || 0, safety_stock || 0, lead_time_days || 0],
        function (err) {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ success: true });
        }
    );
});


// Quality Control & Compliance
// app.post('/api/qc_reports', upload.single('report'), (req, res) => {
//     const { product_id, batch_number, inspector, defects, units_inspected, units_passed, units_failed, result, corrective_actions, approval_status } = req.body;
//     const report_url = req.file ? `/uploads/${req.file.filename}` : null;
//     db.run(`INSERT INTO qc_reports (product_id, batch_number, date, inspector, defects, units_inspected, units_passed, units_failed, result, corrective_actions, approval_status, report_url)
//         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
//         [product_id, batch_number, new Date().toISOString(), inspector, defects, units_inspected, units_passed, units_failed, result, corrective_actions, approval_status, report_url],
//         function (err) {
//             if (err) {
//                 logger.error(`DB error adding QC report: ${err.message}`);
//                 return res.status(500).json({ message: "DB error" });
//             }
//             logger.info(`Added QC report for product ${product_id}`);
//             res.status(201).json({ id: this.lastID });
//         });
// });

// app.get('/api/qc_reports', (req, res) => {
//     db.all("SELECT * FROM qc_reports ORDER BY date DESC", (err, rows) => {
//         if (err) {
//             logger.error(`DB error fetching QC reports: ${err.message}`);
//             return res.status(500).json({ message: "DB error" });
//         }
//         res.json(rows || []);
//     });
// });

// app.post('/api/compliance_docs', upload.single('file'), (req, res) => {
//     const { product_id, type } = req.body;
//     const file_url = req.file ? `/Uploads/${req.file.filename}` : null;
//     db.run("INSERT INTO compliance_docs (product_id, file_url, type, uploaded_at) VALUES (?, ?, ?, ?)",
//         [product_id, file_url, type, new Date().toISOString()],
//         function (err) {
//             if (err) {
//                 logger.error(`DB error adding compliance doc: ${err.message}`);
//                 return res.status(500).json({ message: "DB error" });
//             }
//             logger.info(`Added compliance doc for product ${product_id}`);
//             res.status(201).json({ id: this.lastID });
//         });
// });

// app.get('/api/compliance_docs', (req, res) => {
//     db.all("SELECT * FROM compliance_docs ORDER BY uploaded_at DESC", (err, rows) => {
//         if (err) {
//             logger.error(`DB error fetching compliance docs: ${err.message}`);
//             return res.status(500).json({ message: "DB error" });
//         }
//         res.json(rows || []);
//     });
// });

// Analytics
app.get('/api/ai/forecast/:productId', (req, res) => {
    const productId = req.params.productId;
    db.all(
        `SELECT date(timestamp) as date, ABS(quantity) as quantity
         FROM inventory_movements
         WHERE product_id = ? AND movement_type = 'sale'
         ORDER BY date ASC`,
        [productId],
        async (err, sales) => {
            if (err) return res.status(500).json({ error: err.message });
            // console.log("Sales data for AI:", sales);
            try {
                const fetchRes = await fetch('http://localhost:8000/forecast', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ sales_history: sales }),
                });
                if (!fetchRes.ok) throw new Error(`AI service error: ${fetchRes.status}`);
                const data = await fetchRes.json();
                res.json(data.forecast);
            } catch (e) {
                res.status(500).json({ error: e.message || "AI service error" });
            }
        }
    );
});

app.get('/api/ai/anomaly/:productId', (req, res) => {
    const productId = req.params.productId;
    db.all(
        `SELECT date(timestamp) as date, quantity
         FROM inventory_movements
         WHERE product_id = ?
         ORDER BY date ASC`,
        [productId],
        async (err, movements) => {
            if (err) return res.status(500).json({ error: err.message });
            try {
                const fetchRes = await fetch('http://localhost:8000/anomaly', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ inventory_movements: movements }),
                });
                if (!fetchRes.ok) throw new Error(`AI service error: ${fetchRes.status}`);
                const data = await fetchRes.json();
                res.json(data.anomalies);
            } catch (e) {
                res.status(500).json({ error: e.message || "AI service error" });
            }
        }
    );
});

app.post('/api/ai/nlq', async (req, res) => {
    const { productId } = req.body;
    console.log("NLQ request for productId:", productId);

    try {
        // Inline Promises for DB queries
        const getProduct = () =>
            new Promise((resolve, reject) => {
                db.get("SELECT * FROM products WHERE id = ?", [productId], (err, row) => {
                    if (err) reject(err);
                    else resolve(row);
                });
            });

        const getSales = () =>
            new Promise((resolve, reject) => {
                db.all("SELECT * FROM inventory_movements WHERE product_id = ?", [productId], (err, rows) => {
                    if (err) reject(err);
                    else resolve(rows);
                });
            });

        const getInventory = () =>
            new Promise((resolve, reject) => {
                db.get("SELECT * FROM inventory_controls WHERE product_id = ?", [productId], (err, row) => {
                    if (err) reject(err);
                    else resolve(row);
                });
            });

        const [product, sales, inventory] = await Promise.all([
            getProduct(),
            getSales(),
            getInventory()
        ]);
        // console.log("Fetched product data:", product);
        const salesQuantity = Array.isArray(sales) ? (sales.filter(s => s.movement_type === 'sale').map(s => `${Math.abs(s.quantity)}`)) : 0;
        const orderQuantity = Array.isArray(sales) ? (sales.filter(s => s.movement_type === 'procurement').map(s => `${Math.abs(s.quantity)}`)) : 0;
        console.log("Sales quantity:", Number(salesQuantity[0]));
        // Construct the prompt for the LLM
        const prompt = `
            Analyze this industrial product data and provide insights:

            Product: ${product?.product_name || "N/A"} (SKU: ${product?.sku || "N/A"})
            Current Stock: ${Number(orderQuantity[0]) - Number(salesQuantity[0])}
            Unit Price: ${product?.unit_price || 0} in INR
            Min Stock Level: ${inventory?.min_stock_level || 0}
            Safety Stock: ${inventory?.safety_stock || 0}
            Sales History: ${salesQuantity != 0 ? salesQuantity.join('\n') : ""}
            Procurement History: ${orderQuantity != 0 ? orderQuantity.join('\n') : ""}

            Provide concise insights and recommendations in bullet points.
        `;
        // Prepare fetch options
        const fetchOptions = {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${process.env.HF_TOKEN}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                inputs: prompt,
                parameters: {
                    max_new_tokens: 500,
                    temperature: 0.3
                }
            })
        };

        // Call HuggingFace Inference API with Fetch
        const response = await fetch(
            "https://api-inference.huggingface.co/models/mistralai/Mixtral-8x7B-Instruct-v0.1",
            fetchOptions
        );
        console.log("HF API response status:", response.status);
        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`HF API error: ${response.status} ${errorText}`);
        }

        const data = await response.json();
        const aiResponse = data[0]?.generated_text || "No insight generated.";
        const splitPrompt = "Provide concise insights and recommendations in bullet points.";
        const promptIndex = aiResponse.indexOf(splitPrompt);
        const afterPrompt = promptIndex !== -1
            ? aiResponse.slice(promptIndex + splitPrompt.length)
            : aiResponse;
        console.log("AI response:", afterPrompt);
        res.json({ insight: afterPrompt.trim() });

    } catch (err) {
        console.error('NLQ error:', err);
        res.status(500).json({ error: "AI insight generation failed" });
    }
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