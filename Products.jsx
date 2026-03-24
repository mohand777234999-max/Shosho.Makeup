import React from 'react';
import './Products.css';

export default function Products({ products, onAddToCart }) {
  return (
    <section id="products" className="products-section">
      <div className="container">
        <h2 className="section-title">منتجاتنا الفاخرة</h2>
        <div className="products-grid">
          {products.map(product => (
            <div key={product.id} className="product-card">
              <div className="product-img-container">
                <img src={product.image} alt={product.name} className="product-img" />
                <div className="product-badge">مخزون: {product.stock}</div>
              </div>
              <div className="product-info">
                <div className="product-category">{product.category}</div>
                <h3 className="product-name">{product.name}</h3>
                <p className="product-description">{product.description}</p>
                <div className="product-price-container">
                  <div className="product-price">{product.price} ﷼</div>
                </div>
                <button 
                  className="add-to-cart"
                  onClick={() => onAddToCart(product)}
                >
                  <span>🛒</span> أضف إلى السلة
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
