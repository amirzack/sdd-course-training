# Data Model
جدول requests:
- id: INTEGER PRIMARY KEY
- title: TEXT NOT NULL
- description: TEXT NOT NULL
- reason: TEXT NOT NULL
- requester_id: TEXT NOT NULL
- status: Draft | PendingReview | ChangesRequested | Approved
- version: INTEGER NOT NULL (شروع 1)
- created_at, updated_at: TEXT
فعلا جدول کاربران نداریم. نقش‌های دمو در سرور تعریف شده‌اند.
