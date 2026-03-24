import React, { useState } from 'react';
import './App.css';
import Header from './components/Header';
import Hero from './components/Hero';
import Products from './components/Products';
import About from './components/About';
import Contact from './components/Contact';
import Footer from './components/Footer';
import Cart from './components/Cart';
import AdminDashboard from './components/AdminDashboard';

function App() {
  const [cartOpen, setCartOpen] = useState(false);
  const [cart, setCart] = useState([]);
  const [showAdmin, setShowAdmin] = useState(false);
  const [products] = useState([
    { id: 1, name: 'أحمر شفاه فاخر', category: 'شفاه', price: 85, description: 'أحمر شفاه سائل طويل الأمد بألوان حصرية', image: '/assets/products/lipstick.jpg', stock: 50 },
    { id: 2, name: 'كونسيلر عالي التغطية', category: 'وجه', price: 120, description: 'يغطي العيوب بشكل كامل مع ثبات طويل', image: '/assets/products/concealer.jpg', stock: 30 },
    { id: 3, name: 'ماسكارا فاخرة', category: 'عيون', price: 95, description: 'ماسكارا تطول وتكثف الرموش بشكل مذهل', image: '/assets/products/mascara.jpg', stock: 40 },
    { id: 4, name: 'ظلال عيون احترافية', category: 'عيون', price: 110, description: 'تشكيلة ألوان متدرجة للعيون الساحرة', image: '/assets/products/eyeshadow.jpg', stock: 25 },
    { id: 5, name: 'أساس سائل فاخر', category: 'وجه', price: 150, description: 'أساس سائل عالي الجودة بتغطية طبيعية', image: '/assets/products/foundation.jpg', stock: 35 },
    { id: 6, name: 'فرش تجميل احترافية', category: 'أدوات', price: 200, description: 'مجموعة فرش تجميل احترافية من أفضل الخامات', image: '/assets/products/brushes.jpg', stock: 15 },
    { id: 7, name: 'مرطب البشرة الفاخر', category: 'عناية', price: 130, description: 'مرطب غني بالمكونات الطبيعية والفيتامينات', image: '/assets/products/moisturizer.jpg', stock: 45 },
    { id: 8, name: 'ماسك الذهب', category: 'عناية', price: 175, description: 'ماسك فاخر بجزيئات الذهب الحقيقي', image: '/assets/products/gold-mask.jpg', stock: 20 },
    { id: 9, name: 'مصل فيتامين سي', category: 'عناية', price: 140, description: 'مصل مركز بفيتامين سي لتفتيح البشرة', image: '/assets/products/vitamin-c.jpg', stock: 30 },
    { id: 10, name: 'طلاء أظافر فاخر', category: 'أظافر', price: 65, description: 'طلاء أظافر بألوان حصرية وثبات طويل', image: '/assets/products/nail-polish.jpg', stock: 60 },
  ]);

  const addToCart = (product) => {
    const existing = cart.find(item => item.id === product.id);
    if (existing) {
      if (existing.quantity < product.stock) {
        setCart(cart.map(item =>
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        ));
      }
    } else {
      setCart([...cart, { ...product, quantity: 1 }]);
    }
  };

  const removeFromCart = (productId) => {
    setCart(cart.filter(item => item.id !== productId));
  };

  const updateQuantity = (productId, quantity) => {
    if (quantity <= 0) {
      removeFromCart(productId);
    } else {
      setCart(cart.map(item =>
        item.id === productId ? { ...item, quantity } : item
      ));
    }
  };

  if (showAdmin) {
    return (
      <div className="app">
        <button 
          className="back-to-store-btn"
          onClick={() => setShowAdmin(false)}
        >
          ← العودة للمتجر
        </button>
        <AdminDashboard />
      </div>
    );
  }

  return (
    <div className="app">
      <Header cartCount={cart.length} onCartClick={() => setCartOpen(!cartOpen)} />
      <button 
        className="admin-access-btn"
        onClick={() => setShowAdmin(true)}
        title="لوحة الإدارة"
      >
        🔐
      </button>
      <Hero />
      <Products products={products} onAddToCart={addToCart} />
      <About />
      <Contact />
      <Cart
        isOpen={cartOpen}
        items={cart}
        onClose={() => setCartOpen(false)}
        onRemove={removeFromCart}
        onUpdateQuantity={updateQuantity}
      />
      <Footer />
    </div>
  );
}

export default App;
