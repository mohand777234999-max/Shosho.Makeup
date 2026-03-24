import React from 'react';
import './About.css';

export default function About() {
  return (
    <section id="about" className="about-section">
      <div className="container">
        <h2 className="section-title">قصتنا الفاخرة</h2>
        <div className="about-content">
          <div className="about-text">
            <h3>منذ 2015، نرتقي بمعايير الجمال</h3>
            <p>SHOSHO MAKEUP ليست مجرد علامة تجارية، بل هي رؤية تحولت إلى واقع. بدأنا رحلتنا بمهمة واحدة: تقديم تجربة تجميل فاخرة تجمع بين الجودة العالمية واللمسة المحلية.</p>
            <p>نحن نؤمن بأن الجمال الحقيقي ينبع من الداخل، وهدفنا هو مساعدتك على إبراز هذا الجمال بمنتجات حصرية مصنوعة من أفضل المكونات وأكثرها أماناً.</p>
            <div className="stats">
              <div className="stat">
                <span className="stat-number">8+</span>
                <span className="stat-text">سنوات خبرة</span>
              </div>
              <div className="stat">
                <span className="stat-number">500+</span>
                <span className="stat-text">منتج فاخر</span>
              </div>
              <div className="stat">
                <span className="stat-number">10K+</span>
                <span className="stat-text">عميلة سعيدة</span>
              </div>
            </div>
          </div>
          <div className="about-image">
            <div className="image-frame">
              <img src="/assets/about.jpg" alt="SHOSHO MAKEUP Studio" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
