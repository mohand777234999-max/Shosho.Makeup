import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import bcryptjs from 'bcryptjs';
import jwt from 'jsonwebtoken';
import sqlite3 from 'sqlite3';
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
const db = new sqlite3.Database(path.join(__dirname, 'shoshomakeup.db'));

// Create tables
db.serialize(() => {
  // Users table
  db.run(`CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    name TEXT NOT NULL,
    role TEXT DEFAULT 'admin',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  // Products table
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

  // Orders table
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

  // Transactions table (محاسبة)
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

  // Inventory log table
  db.run(`CREATE TABLE IF NOT EXISTS inventory_log (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    product_id INTEGER NOT NULL,
    quantity_change INTEGER NOT NULL,
    reason TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(product_id) REFERENCES products(id)
  )`);
});

// ============ Authentication Routes ============

// Register
app.post('/api/auth/register', async (req, res) => {
  try {
    const { email, password, name } = req.body;
    
    if (!email || !password || !name) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const hashedPassword = await bcryptjs.hash(password, 10);

    db.run(
      'INSERT INTO users (email, password, name, role) VALUES (?, ?, ?, ?)',
      [email, hashedPassword, name, 'admin'],
      function(err) {
        if (err) {
          return res.status(400).json({ error: 'Email already exists' });
        }
        res.json({ message: 'User registered successfully' });
      }
    );
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Login
app.post('/api/auth/login', (req, res) => {
  try {
    const { email, password } = req.body;

    db.get('SELECT * FROM users WHERE email = ?', [email], async (err, user) => {
      if (err || !user) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      const validPassword = await bcryptjs.compare(password, user.password);
      if (!validPassword) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      const token = jwt.sign(
        { id: user.id, email: user.email, role: user.role },
        JWT_SECRET,
        { expiresIn: '24h' }
      );

      res.json({ token, user: { id: user.id, email: user.email, name: user.name } });
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

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

// ============ Products Routes ============

// Get all products
app.get('/api/products', (req, res) => {
  db.all('SELECT * FROM products', (err, products) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(products);
  });
});

// Get single product
app.get('/api/products/:id', (req, res) => {
  db.get('SELECT * FROM products WHERE id = ?', [req.params.id], (err, product) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(product);
  });
});

// Create product (admin only)
app.post('/api/products', verifyToken, (req, res) => {
  try {
    const { name, category, price, description, image, stock } = req.body;

    db.run(
      'INSERT INTO products (name, category, price, description, image, stock) VALUES (?, ?, ?, ?, ?, ?)',
      [name, category, price, description, image, stock],
      function(err) {
        if (err) {
          return res.status(500).json({ error: err.message });
        }
        res.json({ id: this.lastID, message: 'Product created successfully' });
      }
    );
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update product (admin only)
app.put('/api/products/:id', verifyToken, (req, res) => {
  try {
    const { name, category, price, description, image, stock } = req.body;

    db.run(
      'UPDATE products SET name = ?, category = ?, price = ?, description = ?, image = ?, stock = ? WHERE id = ?',
      [name, category, price, description, image, stock, req.params.id],
      function(err) {
        if (err) {
          return res.status(500).json({ error: err.message });
        }
        res.json({ message: 'Product updated successfully' });
      }
    );
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete product (admin only)
app.delete('/api/products/:id', verifyToken, (req, res) => {
  db.run('DELETE FROM products WHERE id = ?', [req.params.id], function(err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json({ message: 'Product deleted successfully' });
  });
});

// ============ Orders Routes ============

// Create order
app.post('/api/orders', (req, res) => {
  try {
    const { customer_name, customer_email, customer_phone, total_amount, items } = req.body;

    db.run(
      'INSERT INTO orders (customer_name, customer_email, customer_phone, total_amount, items) VALUES (?, ?, ?, ?, ?)',
      [customer_name, customer_email, customer_phone, total_amount, JSON.stringify(items)],
      function(err) {
        if (err) {
          return res.status(500).json({ error: err.message });
        }

        // Update product stock
        items.forEach(item => {
          db.run(
            'UPDATE products SET stock = stock - ?, sold = sold + ? WHERE id = ?',
            [item.quantity, item.quantity, item.id]
          );

          // Log inventory change
          db.run(
            'INSERT INTO inventory_log (product_id, quantity_change, reason) VALUES (?, ?, ?)',
            [item.id, -item.quantity, 'Order #' + this.lastID]
          );
        });

        // Create transaction record
        db.run(
          'INSERT INTO transactions (order_id, type, amount, payment_method) VALUES (?, ?, ?, ?)',
          [this.lastID, 'sale', total_amount, 'pending']
        );

        res.json({ id: this.lastID, message: 'Order created successfully' });
      }
    );
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get all orders (admin only)
app.get('/api/orders', verifyToken, (req, res) => {
  db.all('SELECT * FROM orders ORDER BY created_at DESC', (err, orders) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(orders.map(order => ({
      ...order,
      items: JSON.parse(order.items)
    })));
  });
});

// Get order details
app.get('/api/orders/:id', (req, res) => {
  db.get('SELECT * FROM orders WHERE id = ?', [req.params.id], (err, order) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json({
      ...order,
      items: JSON.parse(order.items)
    });
  });
});

// Update order status (admin only)
app.put('/api/orders/:id/status', verifyToken, (req, res) => {
  const { status } = req.body;
  db.run('UPDATE orders SET status = ? WHERE id = ?', [status, req.params.id], function(err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json({ message: 'Order status updated' });
  });
});

// ============ Financial Reports Routes ============

// Get financial summary
app.get('/api/reports/summary', verifyToken, (req, res) => {
  db.all(
    `SELECT 
      COUNT(*) as total_orders,
      SUM(total_amount) as total_revenue,
      AVG(total_amount) as average_order_value
    FROM orders WHERE status = 'completed'`,
    (err, result) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      res.json(result[0]);
    }
  );
});

// Get transactions
app.get('/api/transactions', verifyToken, (req, res) => {
  db.all('SELECT * FROM transactions ORDER BY created_at DESC LIMIT 100', (err, transactions) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(transactions);
  });
});

// Get inventory log
app.get('/api/inventory-log', verifyToken, (req, res) => {
  db.all(
    `SELECT il.*, p.name as product_name 
     FROM inventory_log il
     JOIN products p ON il.product_id = p.id
     ORDER BY il.created_at DESC
     LIMIT 100`,
    (err, logs) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      res.json(logs);
    }
  );
});

// ============ Health Check ============

app.get('/api/health', (req, res) => {
  res.json({ status: 'Server is running' });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
