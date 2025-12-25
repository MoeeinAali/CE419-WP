# MiniAchareh

## Setup

1. Create a virtual environment:
   ```bash
   python3 -m venv venv
   source venv/bin/activate
   ```

2. Install dependencies:
   ```bash
   pip install django djangorestframework drf-spectacular
   ```

3. Run migrations:
   ```bash
   python manage.py migrate
   ```

4. Create a superuser (for admin access):
   ```bash
   python manage.py createsuperuser
   ```

5. Run the server:
   ```bash
   python manage.py runserver
   ```

## Documentation

- Swagger UI: [http://localhost:8000/api/schema/swagger-ui/](http://localhost:8000/api/schema/swagger-ui/)
- ReDoc: [http://localhost:8000/api/schema/redoc/](http://localhost:8000/api/schema/redoc/)

## API Endpoints

- **Auth:**
  - Login: `/api/login/` (POST username/email/phone & password)
  - Logout: `/api/logout/` (POST)
  - Register: `/api/users/` (POST)
- **Users:** `/api/users/` (Profile, Contractors list)
- **Advertisements:** `/api/advertisements/` (CRUD, Assign, Done, Confirm, Cancel)
- **Bids:** `/api/bids/` (Apply for ads)
- **Comments:** `/api/comments/` (Rate contractors)
- **Tickets:** `/api/tickets/` (Support tickets)

## Roles

- **Customer:** Can create ads, assign contractors, confirm completion, rate.
- **Contractor:** Can bid on ads, mark as done, view schedule.
- **Support:** Can reply to tickets.
- **Admin:** Full access.
