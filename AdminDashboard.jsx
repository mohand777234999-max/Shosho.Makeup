import React, { useState, useEffect } from 'react';
import './AdminDashboard.css';

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [summary, setSummary] = useState({});
  const [newProduct, setNewProduct] = useState({
    name: '',
    category: '',
    price: 0,
    description: '',
    stock: 0
  });
  const [token, setToken] = useState(localStorage.getItem('adminToken'));
  const [loginData, setLoginData] = useState({ email: '', password: '' });
  const [isLoggedIn, setIsLoggedIn] = useState(!!token);

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

  // Login
  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(loginData)
      });
      const data = await response.json();
      if (data.token) {
        localStorage.setItem('adminToken', data.token);
        setToken(data.token);
        setIsLoggedIn(true);
        setLoginData({ email: '', password: '' });
        fetchDashboardData(data.token);
      }
    } catch (error) {
      alert('خطأ في تسجيل الدخول: ' + error.message);
    }
  };

  // Fetch dashboard data
  const fetchDashboardData = async (authToken) => {
    try {
      const headers = { 'Authorization': `Bearer ${authToken}` };

      // Fetch summary
      const summaryRes = await fetch(`${API_URL}/reports/summary`, { headers });
      setSummary(await summaryRes.json());

      // Fetch products
      const productsRes = await fetch(`${API_URL}/products`);
      setProducts(await productsRes.json());

      // Fetch orders
      const ordersRes = await fetch(`${API_URL}/orders`, { headers });
      setOrders(await ordersRes.json());

      // Fetch transactions
      const transRes = await fetch(`${API_URL}/transactions`, { headers });
      setTransactions(await transRes.json());
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  useEffect(() => {
    if (isLoggedIn && token) {
      fetchDashboardData(token);
      const interval = setInterval(() => fetchDashboardData(token), 30000);
      return () => clearInterval(interval);
    }
  }, [isLoggedIn, token]);

  // Add product
  const handleAddProduct = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`${API_URL}/products`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(newProduct)
      });
      if (response.ok) {
        alert('تم إضافة المنتج بنجاح');
        setNewProduct({ name: '', category: '', price: 0, description: '', stock: 0 });
        fetchDashboardData(token);
      }
    } catch (error) {
      alert('خطأ: ' + error.message);
    }
  };

  // Delete product
  const handleDeleteProduct = async (id) => {
    if (confirm('هل تريد حذف هذا المنتج؟')) {
      try {
        await fetch(`${API_URL}/products/${id}`, {
          method: 'DELETE',
          headers: { 'Authorization': `Bearer ${token}` }
        });
        fetchDashboardData(token);
      } catch (error) {
        alert('خطأ: ' + error.message);
      }
    }
  };

  // Logout
  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    setToken(null);
    setIsLoggedIn(false);
  };

  if (!isLoggedIn) {
    return (
      <div className="admin-login">
        <div className="login-container">
          <h1>🔐 لوحة الإدارة</h1>
          <form onSubmit={handleLogin}>
            <input
              type="email"
              placeholder="البريد الإلكتروني"
              value={loginData.email}
              onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
              required
            />
            <input
              type="password"
              placeholder="كلمة المرور"
              value={loginData.password}
              onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
              required
            />
            <button type="submit">تسجيل الدخول</button>
          </form>
          <p>البريد الافتراضي: admin@shosho.com | كلمة المرور: admin123</p>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-dashboard">
      <div className="admin-header">
        <h1>🎛️ لوحة التحكم - SHOSHO MAKEUP</h1>
        <button onClick={handleLogout} className="logout-btn">تسجيل الخروج</button>
      </div>

      <div className="admin-tabs">
        <button 
          className={`tab ${activeTab === 'dashboard' ? 'active' : ''}`}
          onClick={() => setActiveTab('dashboard')}
        >
          📊 لوحة التحكم
        </button>
        <button 
          className={`tab ${activeTab === 'products' ? 'active' : ''}`}
          onClick={() => setActiveTab('products')}
        >
          📦 المنتجات
        </button>
        <button 
          className={`tab ${activeTab === 'orders' ? 'active' : ''}`}
          onClick={() => setActiveTab('orders')}
        >
          🛒 الطلبات
        </button>
        <button 
          className={`tab ${activeTab === 'finance' ? 'active' : ''}`}
          onClick={() => setActiveTab('finance')}
        >
          💰 المحاسبة
        </button>
      </div>

      <div className="admin-content">
        {/* Dashboard Tab */}
        {activeTab === 'dashboard' && (
          <div className="dashboard-section">
            <h2>ملخص الأداء</h2>
            <div className="stats-grid">
              <div className="stat-card">
                <h3>إجمالي الطلبات</h3>
                <p className="stat-value">{summary.total_orders || 0}</p>
              </div>
              <div className="stat-card">
                <h3>إجمالي الإيرادات</h3>
                <p className="stat-value">{(summary.total_revenue || 0).toFixed(2)} ﷼</p>
              </div>
              <div className="stat-card">
                <h3>متوسط الطلب</h3>
                <p className="stat-value">{(summary.average_order_value || 0).toFixed(2)} ﷼</p>
              </div>
              <div className="stat-card">
                <h3>عدد المنتجات</h3>
                <p className="stat-value">{products.length}</p>
              </div>
            </div>

            <div className="recent-orders">
              <h3>آخر الطلبات</h3>
              <table>
                <thead>
                  <tr>
                    <th>رقم الطلب</th>
                    <th>العميل</th>
                    <th>المبلغ</th>
                    <th>الحالة</th>
                    <th>التاريخ</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.slice(0, 5).map(order => (
                    <tr key={order.id}>
                      <td>#{order.id}</td>
                      <td>{order.customer_name}</td>
                      <td>{order.total_amount} ﷼</td>
                      <td><span className={`status ${order.status}`}>{order.status}</span></td>
                      <td>{new Date(order.created_at).toLocaleDateString('ar-SA')}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Products Tab */}
        {activeTab === 'products' && (
          <div className="products-section">
            <h2>إدارة المنتجات</h2>
            
            <form onSubmit={handleAddProduct} className="add-product-form">
              <h3>إضافة منتج جديد</h3>
              <input
                type="text"
                placeholder="اسم المنتج"
                value={newProduct.name}
                onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                required
              />
              <input
                type="text"
                placeholder="الفئة"
                value={newProduct.category}
                onChange={(e) => setNewProduct({ ...newProduct, category: e.target.value })}
                required
              />
              <input
                type="number"
                placeholder="السعر"
                value={newProduct.price}
                onChange={(e) => setNewProduct({ ...newProduct, price: parseFloat(e.target.value) })}
                required
              />
              <textarea
                placeholder="الوصف"
                value={newProduct.description}
                onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
              ></textarea>
              <input
                type="number"
                placeholder="المخزون"
                value={newProduct.stock}
                onChange={(e) => setNewProduct({ ...newProduct, stock: parseInt(e.target.value) })}
                required
              />
              <button type="submit">إضافة المنتج</button>
            </form>

            <div className="products-list">
              <h3>قائمة المنتجات</h3>
              <table>
                <thead>
                  <tr>
                    <th>المنتج</th>
                    <th>الفئة</th>
                    <th>السعر</th>
                    <th>المخزون</th>
                    <th>المبيعات</th>
                    <th>الإجراءات</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map(product => (
                    <tr key={product.id}>
                      <td>{product.name}</td>
                      <td>{product.category}</td>
                      <td>{product.price} ﷼</td>
                      <td>{product.stock}</td>
                      <td>{product.sold}</td>
                      <td>
                        <button onClick={() => handleDeleteProduct(product.id)} className="delete-btn">
                          حذف
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Orders Tab */}
        {activeTab === 'orders' && (
          <div className="orders-section">
            <h2>إدارة الطلبات</h2>
            <table>
              <thead>
                <tr>
                  <th>رقم الطلب</th>
                  <th>العميل</th>
                  <th>البريد</th>
                  <th>المبلغ</th>
                  <th>عدد العناصر</th>
                  <th>الحالة</th>
                  <th>التاريخ</th>
                </tr>
              </thead>
              <tbody>
                {orders.map(order => (
                  <tr key={order.id}>
                    <td>#{order.id}</td>
                    <td>{order.customer_name}</td>
                    <td>{order.customer_email}</td>
                    <td>{order.total_amount} ﷼</td>
                    <td>{order.items?.length || 0}</td>
                    <td><span className={`status ${order.status}`}>{order.status}</span></td>
                    <td>{new Date(order.created_at).toLocaleDateString('ar-SA')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Finance Tab */}
        {activeTab === 'finance' && (
          <div className="finance-section">
            <h2>المحاسبة والتقارير المالية</h2>
            
            <div className="finance-summary">
              <div className="finance-card">
                <h3>إجمالي الإيرادات</h3>
                <p className="amount">{(summary.total_revenue || 0).toFixed(2)} ﷼</p>
              </div>
              <div className="finance-card">
                <h3>عدد المبيعات</h3>
                <p className="amount">{summary.total_orders || 0}</p>
              </div>
              <div className="finance-card">
                <h3>متوسط قيمة الطلب</h3>
                <p className="amount">{(summary.average_order_value || 0).toFixed(2)} ﷼</p>
              </div>
            </div>

            <div className="transactions-list">
              <h3>سجل المعاملات</h3>
              <table>
                <thead>
                  <tr>
                    <th>رقم المعاملة</th>
                    <th>النوع</th>
                    <th>المبلغ</th>
                    <th>طريقة الدفع</th>
                    <th>التاريخ</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.map(trans => (
                    <tr key={trans.id}>
                      <td>#{trans.id}</td>
                      <td>{trans.type}</td>
                      <td>{trans.amount} ﷼</td>
                      <td>{trans.payment_method}</td>
                      <td>{new Date(trans.created_at).toLocaleDateString('ar-SA')}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
