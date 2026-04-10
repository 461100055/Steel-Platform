# Steel Platform Backend

## Quick start

```bash
cd backend
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
python manage.py makemigrations
python manage.py migrate
python manage.py seed_demo
python manage.py runserver
```

## Demo accounts

- Admin: `admin@steelplatform.com` / `Admin123!`
- Supplier: `supplier@steelplatform.com` / `Supplier123!`
- Buyer: `buyer@steelplatform.com` / `Buyer123!`

## Main API routes

- `POST /api/auth/register/`
- `POST /api/auth/login/`
- `GET /api/auth/me/`
- `GET/POST /api/products/`
- `GET/PUT/DELETE /api/products/<id>/`
- `GET /api/suppliers/`
- `GET/POST /api/orders/`
- `GET/POST /api/rfqs/`
- `GET/POST /api/conversations/`
- `GET/POST /api/messages/`
- `GET /api/users/`
