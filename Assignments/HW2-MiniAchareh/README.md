# راهنمای تست سناریوهای مینی آچاره

این مستند نحوه تست کردن سناریوهای تعریف شده در تمرین دوم را با استفاده از APIهای سیستم توضیح می‌دهد.

**پیش‌فرض‌ها:**
*   آدرس پایه سرور: http://localhost:8000/api
*   برای تست‌ها می‌توانید از ابزارهایی مانند Postman یا `curl` استفاده کنید.
*   در تمام درخواست‌های نیازمند احراز هویت، هدر `Authorization` را به صورت `Session` ارسال کنید (لاگین کردن کوکی ست می‌کند).
*   نقش‌های کاربری: `customer`, `contractor`, `support`, `admin`
* آدرس Swagger: http://localhost:8000/api/schema/swagger-ui/

---

## ۱. روند ثبت‌نام و ورود (بخش ۲.۵)

### ثبت‌نام کاربر جدید
*   **کاربر:** مهمان (بدون لاگین)
*   **API:** `POST /users/`
*   **Body:**
    ```json
    {
        "username": "customer1",
        "password": "password123",
        "email": "customer1@example.com",
        "phone_number": "09123456789"
    }
    ```
*   **توضیح:** کاربر به صورت پیش‌فرض با نقش `customer` ساخته می‌شود.
*   **Permission:** `AllowAny`

### ورود به سامانه
*   **کاربر:** همه کاربران
*   **API:** `POST /login/`
*   **Body:**
    ```json
    {
        "username": "customer1",
        "password": "password123"
    }
    ```
*   **پاسخ موفق (200):** اطلاعات کاربر + کوکی session
*   **پاسخ خطا (401):** اطلاعات ورود نادرست
*   **Permission:** `AllowAny`

### تغییر نقش کاربر (توسط ادمین)
برای داشتن کاربر پیمانکار یا پشتیبان، ادمین باید نقش آن‌ها را تغییر دهد.
*   **کاربر:** ادمین (Admin)
*   **API:** `POST /users/{user_id}/change_role/`
*   **Body:**
    ```json
    {
        "role": "contractor"
    }
    ```
    *(مقادیر مجاز: `customer`, `contractor`, `support`, `admin`)*
*   **Permission:** `IsAdmin`

---

## ۲. ایجاد آگهی توسط مشتری (بخش ۲.۷)

*   **کاربر:** مشتری (Customer)
*   **API:** `POST /advertisements/`
*   **Body:**
    ```json
    {
        "title": "تعمیر لوله آب",
        "description": "لوله آشپزخانه چکه می‌کند",
        "category": "lule-kashi",
        "location": "تهران، خیابان آزادی",
        "execution_time": "2025-01-01T10:00:00Z"
    }
    ```
*   **نتیجه:** آگهی با وضعیت `open` ایجاد می‌شود و `owner` به صورت خودکار تنظیم می‌شود.
*   **Permission:** `IsAuthenticated + IsOwnerOrAssignedContractor`
*   **چک اضافی:** فقط کاربران با نقش `Customer` می‌توانند آگهی ایجاد کنند (در `perform_create` چک می‌شود).

### ویرایش آگهی توسط مشتری یا پیمانکار
*   **کاربر:** صاحب آگهی یا پیمانکار تخصیص داده شده
*   **API:** `PATCH /advertisements/{ad_id}/` یا `PUT /advertisements/{ad_id}/`
*   **محدودیت برای پیمانکار:** فقط می‌تواند `execution_time` و `location` را ویرایش کند
*   **چک‌های اضافی:**
    - پیمانکار فقط می‌تواند فیلدهای `execution_time` و `location` را تغییر دهد
    - **چک تداخل زمانی:** اگر `execution_time` تغییر کند، سیستم چک می‌کند پیمانکار در آن زمان (±2 ساعت) آگهی دیگری نداشته باشد

---

## ۳. درخواست اخذ کار توسط پیمانکار (بخش ۲.۸)

*   **کاربر:** پیمانکار (Contractor)
*   **API:** `POST /bids/`
*   **Body:**
    ```json
    {
        "advertisement": 1
    }
    ```
*   **Permission:** `IsAuthenticated + IsContractor`
*   **چک‌های اضافی:**
    - فقط کاربران با نقش `Contractor` می‌توانند bid ثبت کنند (در `perform_create` چک می‌شود).
    - هر پیمانکار فقط یک بار می‌تواند برای یک آگهی bid ثبت کند (unique constraint و چک در `perform_create`).

---

## ۴. انتخاب پیمانکار توسط مشتری (بخش ۲.۹)

*   **کاربر:** مشتری (Customer - صاحب آگهی)
*   **API:** `POST /advertisements/{ad_id}/assign/`
*   **Body:**
    ```json
    {
        "contractor_id": 2
    }
    ```
*   **نتیجه:** وضعیت آگهی به `assigned` تغییر می‌کند.
*   **Permission:** `IsCustomer + IsOwnerOrReadOnly`
*   **چک‌های اضافی:**
    - پیمانکار باید وجود داشته باشد و نقش او `contractor` باشد.
    - پیمانکار باید برای این آگهی Bid ثبت کرده باشد.
    - **چک تداخل زمانی:** اگر آگهی دارای `execution_time` باشد، سیستم چک می‌کند که پیمانکار در آن زمان (±2 ساعت) آگهی دیگری نداشته باشد.

---

## ۵. اعلام پایان کار توسط پیمانکار (بخش ۲.۱۰)

*   **کاربر:** پیمانکار (Contractor - تخصیص داده شده به آگهی)
*   **API:** `POST /advertisements/{ad_id}/mark_done/`
*   **Body:** `{}` (خالی)
*   **نتیجه:** فیلد `contractor_done` برابر `True` می‌شود.
*   **Permission:** `IsContractor`
*   **چک اضافی:** درخواست‌دهنده باید پیمانکار تخصیص داده شده به این آگهی باشد (`ad.assigned_contractor == request.user`).

---

## ۶. تایید پایان کار توسط مشتری (بخش ۲.۱۱)

*   **کاربر:** مشتری (Customer - صاحب آگهی)
*   **API:** `POST /advertisements/{ad_id}/confirm_done/`
*   **Body:** `{}` (خالی)
*   **نتیجه:** وضعیت آگهی به `done` تغییر می‌کند و `customer_confirmed = True`.
*   **Permission:** `IsCustomer + IsOwnerOrReadOnly`
*   **چک اضافی:** پیمانکار باید اول `mark_done` کرده باشد (`contractor_done` باید `True` باشد).

---

## ۷. لغو آگهی توسط مشتری (بخش ۲.۱۲)

*   **کاربر:** مشتری (Customer - صاحب آگهی)
*   **API:** `POST /advertisements/{ad_id}/cancel/`
*   **Body:** `{}` (خالی)
*   **شرط:** آگهی نباید در وضعیت `done` باشد.
*   **نتیجه:** وضعیت آگهی به `cancelled` تغییر می‌کند.
*   **Permission:** `IsCustomer + IsOwnerOrReadOnly`

---

## ۸. ثبت نظر و امتیاز (بخش ۲.۱۳)

*   **کاربر:** مشتری (Customer - صاحب آگهی)
*   **API:** `POST /comments/`
*   **Body:**
    ```json
    {
        "advertisement": 1,
        "contractor": 2,
        "score": 5,
        "text": "کارش عالی بود"
    }
    ```
*   **شرط:** آگهی باید در وضعیت `done` باشد.
*   **Permission:** `IsAuthenticated`
*   **چک‌های اضافی:**
    - فقط کاربران با نقش `Customer` می‌توانند نظر ثبت کنند.
    - فقط می‌تواند برای آگهی‌های خودش نظر ثبت کند (`ad.owner == request.user`).
    - آگهی باید در وضعیت `done` باشد.

---

## ۹. مشاهده پروفایل پیمانکار (بخش ۲.۱۴)

*   **کاربر:** همه کاربران (با محدودیت دسترسی)
*   **API:** `GET /users/{contractor_id}/profile/`
*   **نتیجه:** برگرداندن اطلاعات پیمانکار شامل:
    - میانگین امتیاز (`avg_score`)
    - تعداد کارهای انجام شده (`done_ads_count`)
    - تعداد کارهای در حال انجام (`in_progress_count`)
    - تعداد کارهای انجام نشده (`not_done_count`)
    - لیست نظرات (`comments`)
*   **Permission:** `IsAuthenticated`
*   **قوانین دسترسی:**
    - **Admin و Support:** می‌توانند هر پروفایلی را مشاهده کنند.
    - **Customer:** می‌تواند پروفایل Contractorها و خودش را مشاهده کند.
    - **Contractor:** فقط می‌تواند پروفایل Contractorها را مشاهده کند.

---

## ۱۰. مشاهده پروفایل مشتری (بخش ۲.۱۵)

*   **کاربر:** همه کاربران (با محدودیت دسترسی)
*   **API:** `GET /users/{customer_id}/profile/`
*   **نتیجه:** برگرداندن اطلاعات مشتری و لیست آگهی‌های ثبت شده توسط او (`ads`).
*   **Permission:** `IsAuthenticated`
*   **قوانین دسترسی:**
    - **Admin و Support:** می‌توانند هر پروفایلی را مشاهده کنند.
    - **Customer:** فقط می‌تواند خودش را مشاهده کند (نمی‌تواند Customer دیگری را ببیند مگر Admin/Support باشد).
    - **Contractor:** نمی‌تواند پروفایل Customer را مشاهده کند.

---

## ۱۱. فیلتر و مرتب‌سازی پیمانکاران (بخش ۲.۱۶ و ۲.۱۷)

*   **کاربر:** همه کاربران احراز هویت شده
*   **API:** `GET /users/contractors/`
*   **Query Params:**
    *   `min_score=4`: حداقل امتیاز ۴
    *   `min_comments=10`: حداقل ۱۰ نظر
    *   `sort_by=score`: مرتب‌سازی بر اساس امتیاز (نزولی)
    *   `sort_by=comments`: مرتب‌سازی بر اساس تعداد نظرات (نزولی)
*   **مثال:** `GET /users/contractors/?min_score=3&sort_by=score`
*   **خروجی:** لیست پیمانکاران با فیلدهای `avg_score` و `comment_count`
*   **Permission:** `IsAuthenticated`

---

## ۱۲. ثبت تیکت (بخش ۲.۱۸)

*   **کاربر:** مشتری یا پیمانکار
*   **API:** `POST /tickets/`
*   **Body:**
    ```json
    {
        "title": "مشکل در پرداخت",
        "message": "پولم رو ندادن",
        "related_advertisement": 1
    }
    ```
*   **توضیح:** `related_advertisement` اختیاری است.
*   **نتیجه:** تیکت با وضعیت `open` ایجاد می‌شود.
*   **Permission:** `IsAuthenticated`

---

## ۱۳. پاسخگویی به تیکت (بخش ۲.۱۹)

*   **کاربر:** پشتیبان (Support)
*   **API:** `POST /tickets/{ticket_id}/reply/`
*   **Body:**
    ```json
    {
        "response": "پیگیری می‌شود."
    }
    ```
*   **نتیجه:** وضعیت تیکت به `closed` تغییر می‌کند و پاسخ ثبت می‌شود.
*   **Permission:** `IsSupport`
*   **نکته:** برای مشاهده لیست تیکت‌ها: `GET /tickets/`
    - Support تمام تیکت‌ها را می‌بیند.
    - سایر کاربران فقط تیکت‌های خودشان را می‌بینند.

---

## ۱۴. بخش امتیازی (بخش ۳)

### ۱. فیلتر کردن نظرات یک پیمانکار بر اساس امتیاز (بخش ۳.۱)
*   **کاربر:** همه کاربران احراز هویت شده
*   **API:** `GET /comments/`
*   **Query Params:**
    *   `contractor`: شناسه پیمانکار (مثلاً `contractor=2`)
    *   `min_score`: حداقل امتیاز (مثلاً `min_score=4`)
    *   `max_score`: حداکثر امتیاز (مثلاً `max_score=5`)
    *   `ordering`: مرتب‌سازی (`score`, `-score`, `created_at`, `-created_at`)
*   **مثال:** `GET /comments/?contractor=2&min_score=4`
*   **Permission:** `IsAuthenticated`
*   **توضیح:** از django-filter برای فیلتر کردن استفاده می‌شود.

### ۲. سطوح دسترسی پویا (تغییر نقش) (بخش ۳.۲)
*   **کاربر:** ادمین (Admin)
*   **API:** `POST /users/{user_id}/change_role/`
*   **Body:**
    ```json
    {
        "role": "support"
    }
    ```
*   **توضیح:** این قابلیت اجازه می‌دهد نقش یک کاربر موجود تغییر کند (مثلاً از مشتری به پشتیبان).
*   **Permission:** `IsAdmin`

### ۳. اعلام برنامه روزانه پیمانکار (بخش ۳.۳)
*   **کاربر:** پیمانکار (Contractor)
*   **API:** `GET /users/schedule/`
*   **Query Params:**
    *   `date=2025-01-01`: (اختیاری) فیلتر بر اساس تاریخ خاص
*   **توضیح:** لیست آگهی‌های تخصیص داده شده به پیمانکار که دارای زمان اجرا (`execution_time`) هستند و در وضعیت `assigned` هستند را برمی‌گرداند، مرتب شده بر اساس `execution_time`.
*   **Permission:** `IsContractor`

---

## پیوست: خلاصه Permissions و چک‌های امنیتی

### Permission Classes استفاده شده
1. **IsCustomer:** `role == 'customer'`
2. **IsContractor:** `role == 'contractor'`
3. **IsSupport:** `role == 'support'`
4. **IsAdmin:** `role == 'admin'`
5. **IsOwnerOrReadOnly:** برای خواندن همه، برای تغییر فقط صاحب (owner یا author)
6. **IsOwnerOrAssignedContractor:** صاحب آگهی یا پیمانکار تخصیص داده شده
7. **IsSelfOrSupportOrAdmin:** خود کاربر، Support یا Admin

### نکات امنیتی و چک‌های مهم

1. **ایجاد آگهی:** فقط Customer می‌تواند (چک در `perform_create`)
2. **ثبت Bid:** فقط Contractor می‌تواند و فقط یک بار برای هر آگهی (چک در `perform_create`)
3. **Assign پیمانکار:** فقط اگر پیمانکار bid داشته باشد و تداخل زمانی نداشته باشد
4. **ویرایش آگهی توسط Contractor:** فقط `execution_time` و `location` (چک در `perform_update`)
5. **تداخل زمانی:** پیمانکار نمی‌تواند در یک زمان (±2 ساعت) دو آگهی داشته باشد
6. **ثبت نظر:** فقط Customer، فقط برای آگهی‌های خودش، فقط برای آگهی‌های `done` (چک در `perform_create`)
7. **مشاهده Bids:** هر کاربر فقط bidهای مرتبط با خودش را می‌بیند (queryset filtering)
8. **مشاهده Tickets:** Support همه را می‌بیند، بقیه فقط خودشان را (queryset filtering)
9. **مشاهده پروفایل:** محدودیت بر اساس نقش (Contractor نمی‌تواند Customer را ببیند)

### وضعیت‌های مختلف (Status)

**Advertisement Status:**
- `open`: آگهی باز و در انتظار درخواست
- `assigned`: پیمانکار تخصیص داده شده
- `done`: کار تمام شده و تایید شده
- `cancelled`: لغو شده

**Ticket Status:**
- `open`: باز
- `in_progress`: در حال بررسی
- `closed`: بسته شده
