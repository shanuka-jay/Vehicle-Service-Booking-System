# Axleora MERN Edition

Deployment-oriented Vehicle Service Booking System built with React, Express, Node.js, MongoDB Atlas through Prisma ORM, and Cloudinary image storage.

This is a separate edition from the SQLite build. It keeps the same customer website and administration workflows while replacing:

- SQLite with MongoDB Atlas
- Numeric IDs with MongoDB ObjectIds
- Local file uploads with Cloudinary

## Stack

- Frontend: React 19, Vite, React Router, Axios, React-Toastify
- Backend: Node.js, Express 5, Zod, JWT, bcrypt
- Database: MongoDB Atlas through Prisma ORM 6.19
- Media: Cloudinary Node SDK with in-memory Multer uploads

## Main workflows

- Public service catalogue, categories and detailed galleries
- Booking request, optional issue photo, reference tracking and status workflow
- Contact enquiries with unread administration badges
- Owner/staff authentication and staff account management
- Service, category, gallery, testimonial and website-content management
- Cloudinary cover, gallery and booking-photo upload, replacement and deletion
- Responsive premium customer and administrator interfaces

## 1. MongoDB Atlas setup

1. Create a MongoDB Atlas project and cluster.
2. Create a database user.
3. Add your server IP under Atlas Network Access. For local development, add your current public IP.
4. Copy the Atlas application connection string.
5. Use `axleora` as the database name in the URI.
6. URL-encode special characters in the database password.

Example:

```env
DATABASE_URL="mongodb+srv://DB_USER:DB_PASSWORD@CLUSTER_HOST/axleora?retryWrites=true&w=majority&appName=Axleora"
```

Prisma MongoDB projects use `prisma db push`; the relational migration directory is intentionally not included.

## 2. Cloudinary setup

Create a Cloudinary account and copy the cloud name, API key and API secret from the Cloudinary console.

```env
CLOUDINARY_CLOUD_NAME="your-cloud-name"
CLOUDINARY_API_KEY="your-api-key"
CLOUDINARY_API_SECRET="your-api-secret"
CLOUDINARY_FOLDER="axleora"
```

Cloudinary secrets belong only in `backend/.env`. Never expose the API secret through the frontend.

## 3. Backend setup

```powershell
cd backend
Copy-Item .env.example .env
npm install
```

Edit `.env`, including:

- Atlas `DATABASE_URL`
- a long random `JWT_SECRET`
- Cloudinary credentials
- initial owner username, email and password

Then initialize and seed:

```powershell
npm run db:generate
npm run db:push
npm run seed
npm run dev
```

The API runs on `http://localhost:5000`.

The seed creates the owner account, service categories, seven workshop services, service galleries and initial testimonials. The seed owner password must contain at least 12 characters.

## 4. Frontend setup

```powershell
cd frontend
Copy-Item .env.example .env
npm install
npm run dev
```

The frontend runs on `http://localhost:5173`.

For a deployed API, set:

```env
VITE_API_URL=https://your-api-domain.example/api
```

Build the production frontend with:

```powershell
npm run build
```

## Environment variables

### Backend

| Variable | Purpose |
|---|---|
| `PORT` | Express port, default `5000` |
| `DATABASE_URL` | MongoDB Atlas connection URI |
| `JWT_SECRET` | JWT signing secret |
| `FRONTEND_URL` | Comma-separated allowed browser origins |
| `SLOT_CAPACITY` | Maximum approved vehicles per workshop slot |
| `CLOUDINARY_CLOUD_NAME` | Cloudinary product environment |
| `CLOUDINARY_API_KEY` | Cloudinary server API key |
| `CLOUDINARY_API_SECRET` | Cloudinary server API secret |
| `CLOUDINARY_FOLDER` | Root Cloudinary asset folder |
| `SEED_OWNER_*` | Initial owner account used by the seed |

### Frontend

| Variable | Purpose |
|---|---|
| `VITE_API_URL` | Express API base URL ending in `/api` |

## Health check

`GET /api/health` checks the MongoDB connection and reports whether Cloudinary configuration is present.

## Security notes

- Real `.env` files are excluded.
- Passwords are hashed with bcrypt.
- JWT-protected routes guard administration operations.
- Uploaded files are restricted to JPG, PNG and WebP with a 5 MB limit.
- Cloudinary public IDs are stored with uploaded URLs so replacement and deletion clean up remote assets.
- Configure exact production frontend origins instead of using a wildcard.
