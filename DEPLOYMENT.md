# Deployment Guide

This project deploys as three parts:

| Part | Platform | Notes |
|------|----------|-------|
| React frontend | Vercel | Static Vite build |
| Express API | Render | Node web service |
| MySQL database | Railway | Managed MySQL |

The repo already contains `render.yaml` and `frontend/vercel.json`.

## 1. Push to GitHub

```bash
git init
git add .
git commit -m "Batloung Fruits Distribution Management System"
git branch -M main
git remote add origin https://github.com/<your-user>/<your-repo>.git
git push -u origin main
```

Do **not** commit `backend/.env` (it is already in `.gitignore`).

## 2. Create the hosted database (Railway)

1. Create a project at <https://railway.app> and add a **MySQL** service.
2. Open the MySQL service and copy the connection details (host, port, user, password, database).
3. Import the schema and seed data. Using the Railway CLI or any MySQL client:

```bash
mysql -h <HOST> -P <PORT> -u <USER> -p < database/schema.sql
mysql -h <HOST> -P <PORT> -u <USER> -p < database/seed.sql
```

4. Generate real login passwords against the hosted database. Set the `DB_*` values in
   `backend/.env` temporarily to the Railway values, then run:

```bash
cd backend
npm run seed
```

## 3. Deploy the API (Render)

1. Push the repo to GitHub first.
2. In Render choose **New > Blueprint** and select this repository; `render.yaml` is detected.
3. Fill in the environment variables when prompted:

| Variable | Value |
|----------|-------|
| `DB_HOST` | Railway MySQL host |
| `DB_PORT` | Railway MySQL port (usually `3306`) |
| `DB_USER` | Railway MySQL user |
| `DB_PASSWORD` | Railway MySQL password |
| `DB_NAME` | Railway database name |
| `JWT_SECRET` | long random string (or let Render generate it) |
| `CLIENT_ORIGIN` | your Vercel URL, e.g. `https://batloung-fruits.vercel.app` |

The API is available at `https://<service-name>.onrender.com`. Check `GET /api/health`.

## 4. Deploy the frontend (Vercel)

1. In Vercel choose **Add New > Project** and import the same repository.
2. Set **Root Directory** to `frontend`.
3. Add an environment variable:

```
VITE_API_URL=https://<service-name>.onrender.com/api
```

4. Deploy. `frontend/vercel.json` handles client-side routing.

## 5. Verify after deployment

- Login with `admin@batloung.co.ls / admin123` and `sales@batloung.co.ls / sales123`.
- Dashboard loads counts.
- Create an order and complete it; stock must decrease.
- Cancel an order; stock must not change.
- Suppliers page loads and filters by province.
- Vendor and supplier Map actions open Google Maps previews.
- Reports load.
- Log in as Sales and confirm restricted pages are hidden.

## Notes

- `database/schema.sql` drops and recreates the database, so only run it on a fresh database.
- If your provider gives you a single `MYSQL_URL`/`DATABASE_URL`, map its parts to the `DB_*` variables above.
- Free tiers may sleep after inactivity; the first request can take a few seconds.
- Vendor and supplier maps use public Google Maps links and an embedded preview. No Google Maps API key or billing account is required.
