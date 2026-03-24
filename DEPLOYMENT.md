# تعليمات النشر - SHOSHO MAKEUP

هذا الملف يحتوي على تعليمات نشر الموقع على خوادم الإنتاج المختلفة.

## 📋 المتطلبات

- Node.js (الإصدار 16 أو أحدث)
- npm أو yarn
- خادم ويب (Nginx, Apache, أو أي خادم آخر)

## 🚀 خطوات النشر

### 1. التحضير المحلي

```bash
# تثبيت المكتبات
npm install

# بناء النسخة الإنتاجية
npm run build

# التحقق من البناء
npm run preview
```

### 2. نشر الملفات

بعد تشغيل `npm run build`، سيتم إنشاء مجلد `dist/` يحتوي على جميع الملفات الجاهزة للنشر.

#### الخيار الأول: استخدام Netlify

```bash
# تثبيت Netlify CLI
npm install -g netlify-cli

# تسجيل الدخول
netlify login

# نشر الموقع
netlify deploy --prod --dir=dist
```

#### الخيار الثاني: استخدام Vercel

```bash
# تثبيت Vercel CLI
npm install -g vercel

# نشر الموقع
vercel --prod
```

#### الخيار الثالث: نشر يدوي على خادم

```bash
# نسخ ملفات dist إلى خادمك
scp -r dist/* user@your-server:/var/www/shoshomakeup/

# أو استخدم FTP/SFTP لرفع الملفات
```

### 3. إعدادات الخادم

#### Nginx

```nginx
server {
    listen 80;
    server_name shoshomakeup.com www.shoshomakeup.com;

    root /var/www/shoshomakeup;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

#### Apache

```apache
<Directory /var/www/shoshomakeup>
    Options -MultiViews
    RewriteEngine On
    RewriteCond %{REQUEST_FILENAME} !-f
    RewriteRule ^ index.html [QSA,L]
</Directory>
```

### 4. شهادة SSL

استخدم Let's Encrypt للحصول على شهادة SSL مجانية:

```bash
# استخدام Certbot
sudo certbot certonly --webroot -w /var/www/shoshomakeup -d shoshomakeup.com -d www.shoshomakeup.com
```

### 5. التحقق من النشر

- تحقق من الموقع على المتصفح
- تحقق من سرعة التحميل
- تحقق من استجابة الموقع على الأجهزة المختلفة
- تحقق من وحدة التحكم (Console) للأخطاء

## 🔄 التحديثات المستقبلية

لتحديث الموقع:

```bash
# سحب التغييرات الجديدة
git pull

# تثبيت المكتبات الجديدة (إن وجدت)
npm install

# بناء النسخة الجديدة
npm run build

# نشر الملفات الجديدة
# (استخدم نفس طريقة النشر أعلاه)
```

## 📊 مراقبة الأداء

### Google Analytics

أضف الكود التالي إلى `index.html`:

```html
<!-- Google Analytics -->
<script async src="https://www.googletagmanager.com/gtag/js?id=GA_MEASUREMENT_ID"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'GA_MEASUREMENT_ID');
</script>
```

### Sentry (لتتبع الأخطاء)

```bash
npm install @sentry/react @sentry/tracing
```

## 🔒 الأمان

- استخدم HTTPS دائماً
- قم بتحديث المكتبات بانتظام
- استخدم Content Security Policy (CSP)
- قم بفحص الثغرات الأمنية بانتظام

## 📞 الدعم

للمساعدة في النشر أو حل المشاكل، يرجى التواصل مع فريق الدعم.

---

**آخر تحديث**: مارس 2025
