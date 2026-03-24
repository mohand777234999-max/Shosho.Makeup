import React from 'react';
import './Contact.css';

export default function Contact() {
  return (
    <section id="contact" className="contact-section">
      <div className="container contact-container">
        <div className="contact-info">
          <h3>تواصلوا معنا</h3>
          
          <div className="contact-detail">
            <div className="contact-icon">📞</div>
            <div className="contact-text">
              <h4>الهاتف</h4>
              <p>+967 782 190 400</p>
            </div>
          </div>

          <div className="contact-detail">
            <div className="contact-icon">✉️</div>
            <div className="contact-text">
              <h4>البريد الإلكتروني</h4>
              <p>info@shoshomakeup.com</p>
            </div>
          </div>

          <div className="contact-detail">
            <div className="contact-icon">📍</div>
            <div className="contact-text">
              <h4>العنوان</h4>
              <p>صنعاء - شارع الرباط - بجوار الجامعة الوطنية</p>
            </div>
          </div>

          <div className="contact-detail">
            <div className="contact-icon">🕐</div>
            <div className="contact-text">
              <h4>ساعات العمل</h4>
              <p>السبت - الخميس: 9 صباحاً - 10 مساءً</p>
            </div>
          </div>
        </div>

        <div className="map-frame">
          <div className="map-icon">🗺️</div>
          <h3>موقعنا في صنعاء</h3>
          <p>شارع الرباط بجوار الجامعة الوطنية<br/>زيارتنا تجربة فاخرة بحد ذاتها</p>
          <a href="https://maps.google.com" target="_blank" rel="noopener noreferrer" className="btn btn-secondary">عرض على الخريطة</a>
        </div>
      </div>
    </section>
  );
}
