import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import bcryptjs from 'bcryptjs';
import jwt from 'jsonwebtoken';
import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || 'shosho-makeup-secret-2025';

app.use(cors());
app.use(express.json());

const db = new Database(path.join(__dirname, 'shoshomakeup.db'));

db.exec(`
  CREATE TABLE IF NOT EXISTS users (id INTEGER PRIMARY KEY, email TEXT UNIQUE, password TEXT, name TEXT, role TEXT DEFAULT 'admin', created_at DATETIME DEFAULT CURRENT_TIMESTAMP);
  CREATE TABLE IF NOT EXISTS products (id INTEGER PRIMARY KEY, name TEXT, category TEXT, price REAL, description TEXT, image TEXT, stock INTEGER DEFAULT 0, sold INTEGER DEFAULT 0, created_at DATETIME DEFAULT CURRENT_TIMESTAMP);
  CREATE TABLE IF NOT EXISTS orders (id INTEGER PRIMARY KEY, customer_name TEXT, customer_email TEXT, customer_phone TEXT, total_amount REAL, status TEXT DEFAULT 'pending', items TEXT, created_at DATETIME DEFAULT CURRENT_TIMESTAMP);
  CREATE TABLE IF NOT EXISTS transactions (id INTEGER PRIMARY KEY, order_id INTEGER, type TEXT, amount REAL, description TEXT, payment_method TEXT, created_at DATETIME DEFAULT CURRENT_TIMESTAMP);
  CREATE TABLE IF NOT EXISTS inventory_log (id INTEGER PRIMARY KEY, product_id INTEGER, quantity_change INTEGER, reason TEXT, created_at DATETIME DEFAULT CURRENT_TIMESTAMP);
`);

try {
  const hashedPassword = bcryptjs.hashSync('admin123', 10);
  const stmt = db.prepare('INSERT OR IGNORE INTO users (email, password, name, role) VALUES (?, ?, ?, ?)');
  stmt.run('admin@shosho.com', hashedPassword, 'مدير SHOSHO', 'admin');
} catch (e) {}

const products = [
  ['أحمر شفاه فاخر', 'شفاه', 85, 'أحمر شفاه سائل طويل الأمد', null, 50],
  ['كونسيلر عالي التغطية', 'وجه', 120, 'يغطي العيوب بشكل كامل', null, 30],
  ['ماسكارا فاخرة', 'عيون', 95, 'ماسكارا تطول وتكثف الرموش', null, 40],
  ['ظلال عيون احترافية', 'عيون', 110, 'تشكيلة ألوان متدرجة', null, 25],
  ['أساس سائل فاخر', 'وجه', 150, 'أساس سائل عالي الجودة', null, 35],
  ['فرش تجميل احترافية', 'أدوات', 200, 'مجموعة فرش احترافية', null, 15],
  ['مرطب البشرة الفاخر', 'عناية', 130, 'مرطب غني بالمكونات الطبيعية', null, 45],
  ['ماسك الذهب', 'عناية', 175, 'ماسك فاخر بجزيئات الذهب', null, 20],
  ['مصل فيتامين سي', 'عناية', 140, 'مصل مركز بفيتامين سي', null, 30],
  ['طلاء أظافر فاخر', 'أظافر', 65, 'طلاء أظافر بألوان حصرية', null, 60],
];

try {
  const stmt = db.prepare('INSERT OR IGNORE INTO products (name, category, price, description, image, stock) VALUES (?, ?, ?, ?, ?, ?)');
  products.forEach(p => stmt.run(...p));
} catch (e) {}

const verifyToken = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'No token' });
  try {
    req.user = jwt.verify(token, JWT_SECRET);
    next();
  } catch (e) {
    res.status(401).json({ error: 'Invalid token' });
  }
};

app.post('/api/auth/login', (req, res) => {
  try {
    const { email, password } = req.body;
    const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email);
    if (!user || !bcryptjs.compareSync(password, user.password)) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: '24h' });
    res.json({ token, user: { id: user.id, email: user.email, name: user.name } });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.get('/api/products', (req, res) => {
  try {
    res.json(db.prepare('SELECT * FROM products').all());
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.post('/api/products', verifyToken, (req, res) => {
  try {
    const { name, category, price, description, stock } = req.body;
    const result = db.prepare('INSERT INTO products (name, category, price, description, stock) VALUES (?, ?, ?, ?, ?)').run(name, category, price, description, stock);
    res.json({ id: result.lastInsertRowid });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.put('/api/products/:id', verifyToken, (req, res) => {
  try {
    const { name, category, price, description, stock } = req.body;
    db.prepare('UPDATE products SET name=?, category=?, price=?, description=?, stock=? WHERE id=?').run(name, category, price, description, stock, req.params.id);
    res.json({ message: 'Updated' });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.delete('/api/products/:id', verifyToken, (req, res) => {
  try {
    db.prepare('DELETE FROM products WHERE id=?').run(req.params.id);
    res.json({ message: 'Deleted' });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.post('/api/orders', (req, res) => {
  try {
    const { customer_name, customer_email, customer_phone, total_amount, items } = req.body;
    const result = db.prepare('INSERT INTO orders (customer_name, customer_email, customer_phone, total_amount, items) VALUES (?, ?, ?, ?, ?)').run(customer_name, customer_email, customer_phone, total_amount, JSON.stringify(items));
    items.forEach(item => {
      db.prepare('UPDATE products SET stock=stock-?, sold=sold+? WHERE id=?').run(item.quantity, item.quantity, item.id);
      db.prepare('INSERT INTO inventory_log (product_id, quantity_change, reason) VALUES (?, ?, ?)').run(item.id, -item.quantity, 'Order #' + result.lastInsertRowid);
    });
    db.prepare('INSERT INTO transactions (order_id, type, amount, payment_method) VALUES (?, ?, ?, ?)').run(result.lastInsertRowid, 'sale', total_amount, 'pending');
    res.json({ id: result.lastInsertRowid });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.get('/api/orders', verifyToken, (req, res) => {
  try {
    const orders = db.prepare('SELECT * FROM orders ORDER BY created_at DESC').all();
    res.json(orders.map(o => ({ ...o, items: JSON.parse(o.items) })));
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.get('/api/reports/summary', verifyToken, (req, res) => {
  try {
    res.json(db.prepare('SELECT COUNT(*) as total_orders, SUM(total_amount) as total_revenue, AVG(total_amount) as average_order_value FROM orders WHERE status="completed"').get());
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.get('/api/transactions', verifyToken, (req, res) => {
  try {
    res.json(db.prepare('SELECT * FROM transactions ORDER BY created_at DESC LIMIT 100').all());
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.get('/api/health', (req, res) => {
  res.json({ status: 'OK' });
});

app.listen(PORT, () => {
  console.log(`🚀 Server on http://localhost:${PORT}`);
  console.log(`📊 Admin: admin@shosho.com / admin123`);
});
