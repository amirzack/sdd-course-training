# Research
## Persistence
JSON file: ساده اما کنترل نوشتن هم‌زمان سخت می‌شود.
PostgreSQL: مناسب محصول بزرگ ولی نیازمند نصب و تنظیم سرویس.
SQLite: یک فایل است و UPDATE شرطی را پشتیبانی می‌کند.
**انتخاب:** SQLite به دلیل کوچک بودن تمرین.
## Authentication / Authorization
توکن‌های ثابت سمت سرور فقط برای دمو. در تولید باید با ورود واقعی و بررسی مجوز جاری جایگزین شود.
## Concurrency
آخرین نوشتن برنده شود، باعث از دست رفتن تغییرات است. قفل‌گذاری پیچیدگی بیشتری دارد. نسخه‌گذاری خوش‌بینانه با UPDATE شرطی را انتخاب کردیم.
## Tools
Node.js 22، HTTP و node:test و node:sqlite داخلی. node:sqlite در نسخه 22 ممکن است Experimental Warning بدهد.
