import sqlite3 from 'sqlite3';
import bcryptjs from 'bcryptjs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const db = new sqlite3.Database(path.join(__dirname, 'shoshomakeup.db'));

async function initializeDatabase() {
  try {
    // Create tables
    db.serialize(() => {
      db.run(`CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        name TEXT NOT NULL,
        role TEXT DEFAULT 'admin',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )`);

      db.run(`CREATE TABLE IF NOT EXISTS products (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        category TEXT NOT NULL,
        price REAL NOT NULL,
        description TEXT,
        image TEXT,
        stock INTEGER DEFAULT 0,
        sold INTEGER DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )`);

      db.run(`CREATE TABLE IF NOT EXISTS orders (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        customer_name TEXT NOT NULL,
        customer_email TEXT NOT NULL,
        customer_phone TEXT,
        total_amount REAL NOT NULL,
        status TEXT DEFAULT 'pending',
        items TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )`);

      db.run(`CREATE TABLE IF NOT EXISTS transactions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        order_id INTEGER,
        type TEXT NOT NULL,
        amount REAL NOT NULL,
        description TEXT,
        payment_method TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY(order_id) REFERENCES orders(id)
      )`);

      db.run(`CREATE TABLE IF NOT EXISTS inventory_log (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        product_id INTEGER NOT NULL,
        quantity_change INTEGER NOT NULL,
        reason TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY(product_id) REFERENCES products(id)
      )`);
    });

    // Insert default admin user
    const hashedPassword = await bcryptjs.hash('admin123', 10);
    db.run(
      'INSERT OR IGNORE INTO users (email, password, name, role) VALUES (?, ?, ?, ?)',
      ['admin@shosho.com', hashedPassword, 'مدير SHOSHO', 'admin'],
      () => console.log('✅ Admin user created')
    );

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

    products.forEach(product => {
      db.run(
        'INSERT OR IGNORE INTO products (name, category, price, description, stock) VALUES (?, ?, ?, ?, ?)',
        [product.name, product.category, product.price, product.description, product.stock]
      );
    });

    console.log('✅ Database initialized successfully');
    db.close();
  } catch (error) {
    console.error('❌ Error initializing database:', error);
    process.exit(1);
  }
}

initializeDatabase();
