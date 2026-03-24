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
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

// Middleware
app.use(cors());
app.use(express.json());

// Initialize SQLite Database
const db = new Database(path.join(__dirname, 'shoshomakeup.db'));

// Create tables
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    name TEXT NOT NULL,
    role TEXT DEFAULT 'admin',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS products (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    category TEXT NOT NULL,
    price REAL NOT NULL,
    description TEXT,
    image TEXT,
    stock INTEGER DEFAULT 0,
    sold INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS orders (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    customer_name TEXT NOT NULL,
    customer_email TEXT NOT NULL,
    customer_phone TEXT,
    total_amount REAL NOT NULL,
    status TEXT DEFAULT 'pending',
    items TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS transactions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    order_id INTEGER,
    type TEXT NOT NULL,
    amount REAL NOT NULL,
    description TEXT,
    payment_method TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(order_id) REFERENCES orders(id)
  );

  CREATE TABLE IF NOT EXISTS inventory_log (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    product_id INTEGER NOT NULL,
    quantity_change INTEGER NOT NULL,
    reason TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(product_id) REFERENCES products(id)
  );
`);

// Insert default admin user
try {
  const hashedPassword = bcryptjs.hashSync('admin123', 10);
  const stmt = db.prepare('INSERT OR IGNORE INTO users (email, password, name, role) VALUES (?, ?, ?, ?)');
  stmt.run('admin@shosho.com', hashedPassword, 'مدير SHOSHO', 'admin');
  console.log('✅ Admin user ready');
} catch (error) {
  console.log('Admin user already exists');
}

// Insert sample products
const products = [
  { name: 'أحمر شفاه فاخر', category: 'شفاه', price: 85, description: 'أحمر شفاه سائل طويل الأمد', stock: 50 },
  { name: 'كونسيلر عالي التغطية', category: 'وجه', price: 120, description: 'يغطي العيوب بشكل كامل', stock: 30 },
  { name: 'ماسكارا فاخرة', category: 'عيون', price: 95, description: 'ماسكارا تطول وتكثف الرموش', stock: 40 },
  { name: 'ظلال عيون احترافية', category: 'عيون', price: 110, description: 'تشكيلة ألوان متدرجة', stock: 25 },
  { name: 'أساس سائل فاخر', category: 'وجه', price: 150, description: 'أساس سائل عالي الجودة', stock: 35 },
  { name: 'فرش تجميل احترافية', category: 'أدوات', price: 200, description: 'مجموعة فرش احترافية', stock: 15 },
  { name: 'مرطب البشرة الفاخر', category: 'عناية', price: 130, description: 'مرطب غني بالمكونات الطبيعية', stock: 45 },
  { name: 'ماسك الذهب', category: 'عناية', price: 175, description: 'ماسك فاخر بجزيئات الذهب', stock: 20 },
  { name: 'مصل فيتامين سي', category: 'عناية', price: 140, description: 'مصل مركز بفيتامين سي', stock: 30 },
  { name: 'طلاء أظافر فاخر', category: 'أظافر', price: 65, description: 'طلاء أظافر بألوان حصرية', stock: 60 },
];

try {
  const stmt = db.prepare('INSERT OR IGNORE INTO products (name, category, price, description, stock) VALUES (?, ?, ?, ?, ?)');
  products.forEach(product => {
    stmt.run(product.name, product.category, product.price, product.description, product.stock);
  });
  console.log('✅ Sample products loaded');
} catch (error) {
  console.log('Products already exist');
}

// Middleware to verify token
const verifyToken = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Invalid token' });
  }
};

// ============ Authentication Routes ============

app.post('/api/auth/register', async (req, res) => {
  try {
    const { email, password, name } = req.body;
    
    if (!email || !password || !name) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const hashedPassword = bcryptjs.hashSync(password, 10);
    const stmt = db.prepare('INSERT INTO users (email, password, name, role) VALUES (?, ?, ?, ?)');
    
    try {
      stmt.run(email, hashedPassword, name, 'admin');
      res.json({ message: 'User registered successfully' });
    } catch (err) {
      res.status(400).json({ error: 'Email already exists' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/auth/login', (req, res) => {
  try {
    const { email, password } = req.body;
    const stmt = db.prepare('SELECT * FROM users WHERE email = ?');
    const user = stmt.get(email);

    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const validPassword = bcryptjs.compareSync(password, user.password);
    if (!validPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({ token, user: { id: user.id, email: user.email, name: user.name } });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ============ Products Routes ============

app.get('/api/products', (req, res) => {
  try {
    const stmt = db.prepare('SELECT * FROM products');
    const products = stmt.all();
    res.json(products);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/products/:id', (req, res) => {
  try {
    const stmt = db.prepare('SELECT * FROM products WHERE id = ?');
    const product = stmt.get(req.params.id);
    res.json(product);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/products', verifyToken, (req, res) => {
  try {
    const { name, category, price, description, image, stock } = req.body;
    const stmt = db.prepare('INSERT INTO products (name, category, price, description, image, stock) VALUES (?, ?, ?, ?, ?, ?)');
    const result = stmt.run(name, category, price, description, image, stock);
    res.json({ id: result.lastInsertRowid, message: 'Product created successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/products/:id', verifyToken, (req, res) => {
  try {
    const { name, category, price, description, image, stock } = req.body;
    const stmt = db.prepare('UPDATE products SET name = ?, category = ?, price = ?, description = ?, image = ?, stock = ? WHERE id = ?');
    stmt.run(name, category, price, description, image, stock, req.params.id);
    res.json({ message: 'Product updated successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/products/:id', verifyToken, (req, res) => {
  try {
    const stmt = db.prepare('DELETE FROM products WHERE id = ?');
    stmt.run(req.params.id);
    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ============ Orders Routes ============

app.post('/api/orders', (req, res) => {
  try {
    const { customer_name, customer_email, customer_phone, total_amount, items } = req.body;
    const stmt = db.prepare('INSERT INTO orders (customer_name, customer_email, customer_phone, total_amount, items) VALUES (?, ?, ?, ?, ?)');
    const result = stmt.run(customer_name, customer_email, customer_phone, total_amount, JSON.stringify(items));

    // Update product stock
    items.forEach(item => {
      const updateStmt = db.prepare('UPDATE products SET stock = stock - ?, sold = sold + ? WHERE id = ?');
      updateStmt.run(item.quantity, item.quantity, item.id);

      const logStmt = db.prepare('INSERT INTO inventory_log (product_id, quantity_change, reason) VALUES (?, ?, ?)');
      logStmt.run(item.id, -item.quantity, 'Order #' + result.lastInsertRowid);
    });

    const transStmt = db.prepare('INSERT INTO transactions (order_id, type, amount, payment_method) VALUES (?, ?, ?, ?)');
    transStmt.run(result.lastInsertRowid, 'sale', total_amount, 'pending');

    res.json({ id: result.lastInsertRowid, message: 'Order created successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/orders', verifyToken, (req, res) => {
  try {
    const stmt = db.prepare('SELECT * FROM orders ORDER BY created_at DESC');
    const orders = stmt.all();
    res.json(orders.map(order => ({
      ...order,
      items: JSON.parse(order.items)
    })));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/orders/:id', (req, res) => {
  try {
    const stmt = db.prepare('SELECT * FROM orders WHERE id = ?');
    const order = stmt.get(req.params.id);
    res.json({
      ...order,
      items: JSON.parse(order.items)
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/orders/:id/status', verifyToken, (req, res) => {
  try {
    const { status } = req.body;
    const stmt = db.prepare('UPDATE orders SET status = ? WHERE id = ?');
    stmt.run(status, req.params.id);
    res.json({ message: 'Order status updated' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ============ Financial Reports Routes ============

app.get('/api/reports/summary', verifyToken, (req, res) => {
  try {
    const stmt = db.prepare(`
      SELECT 
        COUNT(*) as total_orders,
        SUM(total_amount) as total_revenue,
        AVG(total_amount) as average_order_value
      FROM orders WHERE status = 'completed'
    `);
    const result = stmt.get();
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/transactions', verifyToken, (req, res) => {
  try {
    const stmt = db.prepare('SELECT * FROM transactions ORDER BY created_at DESC LIMIT 100');
    const transactions = stmt.all();
    res.json(transactions);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/inventory-log', verifyToken, (req, res) => {
  try {
    const stmt = db.prepare(`
      SELECT il.*, p.name as product_name 
      FROM inventory_log il
      JOIN products p ON il.product_id = p.id
      ORDER BY il.created_at DESC
      LIMIT 100
    `);
    const logs = stmt.all();
    res.json(logs);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ============ Health Check ============

app.get('/api/health', (req, res) => {
  res.json({ status: 'Server is running' });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📊 Admin: admin@shosho.com / admin123`);
});
