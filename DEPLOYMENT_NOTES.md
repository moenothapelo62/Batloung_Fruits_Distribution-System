# Deployment Notes

Last updated: 12 November 2026

## Current Status

| Item | Value |
|---|---|
| Repository | `https://github.com/mamakakamelamakhaba-cell/Batloung_Fruits_Distribution-System.git` |
| Branch | `main` |
| Local commit | `9ba66c9` - Batloung Fruits Distribution Management System |
| Frontend build | Passing |
| API integration tests | 55/55 passing |
| Push status | **Blocked** - GitHub authentication mismatch |

The local Git credential is signed in as `moenothapelo62`. That account does not
have write access to the repository, so `git push` returns `HTTP 403`.

## 1. Fix GitHub Access

Choose one of these options.

### Option A - Sign in as the repository owner

```bash
git credential-manager github login --device --username mamakakamelamakhaba-cell
```

Complete the device-code prompt in the browser, then:

```bash
git push -u origin main
```

Browser flow alternative:

```bash
git credential-manager github login --browser --force --username mamakakamelamakhaba-cell
git push -u origin main
```

### Option B - Add the current account as a collaborator

In GitHub:

1. Open the repository settings.
2. Go to **Collaborators and teams**.
3. Add `moenothapelo62` with write access.
4. Accept the invitation.
5. Run:

```bash
git push -u origin main
```

## 2. Deployment Order

1. Push the repository to GitHub.
2. Create a Railway MySQL database.
3. Import `database/schema.sql`, then `database/seed.sql`.
4. Deploy the backend to Render.
5. Deploy the frontend to Vercel.
6. Set the frontend API URL and backend CORS origin.
7. Run the post-deployment checks.

## 3. Database - Railway MySQL

Create a MySQL service in Railway and copy the connection values.

Import a fresh database:

```bash
mysql -h <host> -P <port> -u <user> -p <database> < database/schema.sql
mysql -h <host> -P <port> -u <user> -p <database> < database/seed.sql
```

`database/schema.sql` drops and recreates tables. Only run it on a fresh
database.

## 4. Backend - Render

Create a new **Web Service** from the GitHub repository.

| Setting | Value |
|---|---|
| Root directory | `backend` |
| Build command | `npm install` |
| Start command | `npm start` |
| Health check path | `/api/health` |

Environment variables:

| Variable | Value |
|---|---|
| `NODE_ENV` | `production` |
| `DB_HOST` | Railway MySQL host |
| `DB_PORT` | Railway MySQL port |
| `DB_USER` | Railway MySQL user |
| `DB_PASSWORD` | Railway MySQL password |
| `DB_NAME` | Railway MySQL database |
| `JWT_SECRET` | Long random secret |
| `CLIENT_ORIGIN` | Final Vercel frontend URL |

The backend binds to `0.0.0.0` and uses the `PORT` value supplied by Render.

`render.yaml` is included and can be used as a Render Blueprint.

## 5. Frontend - Vercel

Import the same GitHub repository into Vercel.

| Setting | Value |
|---|---|
| Root directory | `frontend` |
| Framework | Vite |
| Build command | `npm run build` |
| Output directory | `dist` |

Environment variable:

```text
VITE_API_URL=https://<render-service>.onrender.com/api
```

`frontend/vercel.json` handles client-side routing for React Router.

After Vercel gives you the final frontend URL, set the backend
`CLIENT_ORIGIN` to that URL and redeploy the backend. Do not include a trailing
slash.

## 6. Post-Deployment Checks

- `GET https://<render-service>.onrender.com/api/health` returns OK.
- Frontend login works for both roles.
- Dashboard loads counts and charts.
- Supplier province filter works.
- Vendor Map and Supplier Map open Google Maps previews.
- Complete an order and confirm stock decreases.
- Cancel an order and confirm stock does not change.
- Box-size management works.
- Sales user cannot open Administrator-only pages.
- Reports load for the Administrator.

Demo accounts:

```text
Administrator: admin@batloung.co.ls / admin123
Sales:         sales@batloung.co.ls / sales123
```

## 7. Google Maps

Vendor and supplier maps use public Google Maps links and an embedded preview.
No Google Maps API key or billing account is required.

Implementation: `frontend/src/components/GoogleMap.jsx`.

## 8. Notes

- Free hosting tiers may sleep after inactivity, so the first request can be slow.
- The frontend requires `VITE_API_URL`; without it the app defaults to the local API.
- The backend requires a strong `JWT_SECRET`; there is no fallback secret.
- CORS is restricted to `CLIENT_ORIGIN`, so the backend must be redeployed whenever
  the frontend URL changes.
- Production build currently emits a Vite chunk-size warning only; the build passes.
