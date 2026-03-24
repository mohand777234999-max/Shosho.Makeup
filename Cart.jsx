import React from 'react';
import './Cart.css';

export default function Cart({ isOpen, items, onClose, onRemove, onUpdateQuantity }) {
  const total = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  return (
    <>
      {isOpen && <div className="cart-overlay" onClick={onClose}></div>}
      <div className={`cart-modal ${isOpen ? 'active' : ''}`}>
        <div className="cart-header">
          <h3>🛒 سلة التسوق</h3>
          <button className="close-cart" onClick={onClose}>✕</button>
        </div>
        <div className="cart-items">
          {items.length === 0 ? (
            <div className="empty-cart">
              <div className="empty-icon">🛒</div>
              <p>السلة فارغة</p>
            </div>
          ) : (
            items.map(item => (
              <div key={item.id} className="cart-item">
                <img src={item.image} alt={item.name} className="cart-item-img" />
                <div className="cart-item-info">
                  <div className="cart-item-name">{item.name}</div>
                  <div className="cart-item-price">{item.price} ﷼</div>
                  <div className="cart-item-actions">
                    <button 
                      className="quantity-btn"
                      onClick={() => onUpdateQuantity(item.id, item.quantity - 1)}
                    >
                      −
                    </button>
                    <span className="item-quantity">{item.quantity}</span>
                    <button 
                      className="quantity-btn"
                      onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
                    >
                      +
                    </button>
                    <button 
                      className="remove-item"
                      onClick={() => onRemove(item.id)}
                      title="حذف"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
        <div className="cart-footer">
          <div className="cart-total">
            <span>الإجمالي:</span>
            <span>{total} ﷼</span>
          </div>
          <button className="btn btn-primary" style={{ width: '100%' }}>إتمام الشراء</button>
        </div>
      </div>
    </>
  );
}
