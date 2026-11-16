# ChangeFlow
نمونه ساده HTTP API برای مدیریت درخواست تغییر (تمرین جلسه اول).

## Stack
Node.js 22.13+، HTTP داخلی و SQLite داخلی. نیاز به نصب پکیج npm ندارد.

## اجرا
از پوشه `changeflow`:
```bash
npm run build
npm test
npm start
```
آدرس: http://localhost:3000
پایگاه داده در فایل `changeflow.sqlite` ساخته می‌شود. مسیر دیتابیس با `DB_FILE` قابل تنظیم است.

## حساب‌های دمو
- `requester-token`: ali، Requester
- `reviewer-token`: sara، Reviewer
- `both-token`: reza، هر دو نقش

درخواست نمونه:
```bash
curl -X POST http://localhost:3000/requests -H "Authorization: Bearer requester-token" -H "Content-Type: application/json" -d '{"title":"New feature","description":"Add report","reason":"Needed"}'
```
خروجی دارای id و version است؛ برای Submit از `POST /requests/1/submit` با بدنه `{"version":1}` استفاده کنید.
همه مسیرها در `specs/001-changeflow/contracts/api.md` نوشته شده‌اند.

## تصمیم‌ها و محدودیت‌ها
SQLite برای کم کردن پیش‌نیازها انتخاب شد. کنترل نسخه از بازنویسی تغییرات جدیدتر جلوگیری می‌کند. معماری به عمد کوچک است.
ورود واقعی، لغو مجوز، گزارش تاریخچه و UI نداریم. توکن‌های ثابت فقط برای دمو هستند و نباید در محصول واقعی استفاده شوند.

## نقش دستیار
این نسخه با کمک ChatGPT به عنوان Coding Agent ساخته و در محیط اجرایی آن تست شد. **دستورهای رسمی Spec Kit، Analyze و Converge اجرا نشده‌اند** و مستندات این مراحل به صورت دستی نوشته شده‌اند. این محدودیت در گزارش‌ها نیز ذکر شده است.
گزارش‌ها: `docs/reports/` و جواب سوال‌ها: `docs/answers/session-01.md`.
