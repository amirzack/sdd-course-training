# API Contracts
Authorization: Bearer <token>. توکن‌های دمو: requester-token (ali)، reviewer-token (sara)، both-token (reza).
| Method | Path | Body | کار |
|---|---|---|---|
| GET | /health | - | سلامت |
| POST | /requests | title, description, reason | ایجاد Draft |
| GET | /requests | - | فهرست |
| GET | /requests/:id | - | جزئیات |
| PATCH | /requests/:id | version + fields | ویرایش |
| POST | /requests/:id/submit | version | ارسال |
| POST | /requests/:id/approve | version | تایید |
| POST | /requests/:id/request-changes | version | برگشت برای اصلاح |
پاسخ‌ها: 200/201 موفق، 400 ورودی، 401 هویت، 403 مجوز، 404 نبودن رکورد، 409 وضعیت یا نسخه ناسازگار.
نمونه POST: `{"title":"New report","description":"Add report","reason":"Team needs it"}`
