import React from 'react';
import './Footer.css';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container footer-container">
        <div className="footer-about">
          <div className="footer-logo">SHOSHO <span>MAKEUP</span></div>
          <p>نحن نقدم تجربة تجميل فاخرة تجمع بين الجودة العالمية واللمسة المحلية. كل منتج في مجموعتنا مصمم ليعزز جمالك الطبيعي.</p>
          <div className="social-icons">
            <a href="#" className="social-icon" title="Instagram">📷</a>
            <a href="#" className="social-icon" title="Snapchat">👻</a>
            <a href="#" className="social-icon" title="TikTok">🎵</a>
            <a href="#" className="social-icon" title="WhatsApp">💬</a>
          </div>
        </div>

        <div className="footer-links">
          <h4>روابط سريعة</h4>
          <ul>
            <li><a href="#home">الرئيسية</a></li>
            <li><a href="#products">منتجاتنا</a></li>
            <li><a href="#about">قصتنا</a></li>
            <li><a href="#contact">تواصل معنا</a></li>
          </ul>
        </div>

        <div className="footer-contact">
          <h4>معلومات الاتصال</h4>
          <p>📞 +967 782 190 400</p>
          <p>✉️ info@shoshomakeup.com</p>
          <p>📍 صنعاء - شارع الرباط</p>
        </div>
      </div>
      <div className="copyright">
        <p>جميع الحقوق محفوظة &copy; 2025 SHOSHO MAKEUP</p>
      </div>
    </footer>
  );
}
