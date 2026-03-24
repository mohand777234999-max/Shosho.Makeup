import React from 'react';
import './Hero.css';

export default function Hero() {
  return (
    <section className="hero" id="home">
      <div className="hero-background"></div>
      <div className="hero-content">
        <h1>SHOSHO MAKEUP</h1>
        <p>اكتشفي عالم الجمال الفاخر مع تشكيلتنا الحصرية من مستحضرات التجميل والعناية بالبشرة</p>
        <a href="#products" className="btn btn-primary">استكشف المجموعة الفاخرة</a>
      </div>
    </section>
  );
}
