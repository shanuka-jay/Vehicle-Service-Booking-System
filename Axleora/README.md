# Axleora Vehicle Service Booking

Axleora is a full-stack workshop booking and service-operation system built with React, Vite, Express, Prisma and SQLite.

## Product areas

### Customer website

- Modern responsive home, service catalogue, multi-image service detail, booking, status and contact experiences
- Automatic scroll-to-top on every route change
- Interactive concern guide for common maintenance, diagnostic and safety needs
- Backend-managed service categories, individual service-detail pages and local bundled workshop photography
- Booking requests with Sri Lankan phone normalization and unique `AX-` references
- Optional JPG, PNG or WebP problem-photo upload, limited to 5MB
- Public status lookup by booking reference or original phone number
- Enquiry form connected to the protected administration inbox

### Workshop administration

- Operational dashboard, booking queue, status transitions and slot-capacity enforcement
- Service catalogue management and uploaded-image gallery
- Customer enquiry inbox with read state and reply link
- Personal profile and password management
- Owner-managed Website CMS for homepage/contact copy, business details and Google Maps location
- Service-page editor for full descriptions, inclusions, benefits, cover images, up to 10 ordered gallery images, categories and featured state
- Owner-managed staff accounts
- Owner and Staff role separation
- Account disabling and owner-controlled password resets
- Disabled-account login protection and eight-hour JWT sessions

## Standard ports

- Frontend: `http://localhost:5173`
- Backend API: `http://localhost:5000`
- Health endpoint: `http://localhost:5000/api/health`

## Secure first-time setup

Requirements: Node.js 20 or newer.

Backend:

```powershell
cd backend
npm install
Copy-Item .env.example .env
```

Edit `backend/.env` before continuing:

```env
PORT=5000
DATABASE_URL="file:./dev.db"
JWT_SECRET="generate-a-long-random-production-secret"
FRONTEND_URL="http://localhost:5173,http://127.0.0.1:5173"
SLOT_CAPACITY=3

SEED_OWNER_USERNAME="owner"
SEED_OWNER_NAME="Workshop Owner"
SEED_OWNER_EMAIL="owner@example.com"
SEED_OWNER_PASSWORD="use-a-unique-password-of-at-least-12-characters"
```

Then initialize and run:

```powershell
npx prisma generate
npx prisma migrate deploy
npm run seed
npm run start
```

Frontend, in a second terminal:

```powershell
cd frontend
npm install
Copy-Item .env.example .env
npm run build
npm run dev
```

Never commit or deploy the real `.env`, SQLite database or uploaded customer files. The handoff ZIP intentionally excludes them.

## Roles

### Owner

- All Staff capabilities
- Create and edit team accounts
- Assign Owner or Staff roles
- Disable accounts
- Reset another user's password

### Staff

- Review and update bookings
- Maintain services and gallery records
- Process customer messages
- Edit their own profile and password

Every team member should have an individual account. Shared administrator passwords make access removal and accountability difficult.

## Booking workflow

1. A customer chooses the closest service and submits a preferred date/time.
2. The request begins as `Pending`.
3. Workshop staff checks service needs and capacity.
4. The request becomes `Approved` or `Rejected`.
5. Approved work can move to `Completed`.
6. The customer checks progress using the booking reference or phone number.

Allowed transitions:

- `Pending` → `Approved` or `Rejected`
- `Approved` → `Completed`
- `Completed` and `Rejected` are terminal

The API blocks approval for past appointments and limits approvals per slot using `SLOT_CAPACITY`.

## Production checklist

1. Set a long random `JWT_SECRET`.
2. Use a unique owner password and remove the seed password from the environment after initialization.
3. Serve the frontend and API over HTTPS.
4. Set `FRONTEND_URL` to the exact deployed frontend origin.
5. Keep the SQLite database and `backend/server/uploads` on backed-up persistent storage.
6. Run `npx prisma migrate deploy` during releases.
7. Restrict filesystem access to the application service account.
8. Test booking, status lookup, photo upload and owner/staff permissions after deployment.
9. Configure process supervision and log rotation for the Node API.
10. Review inactive staff accounts regularly.

For higher traffic or multi-server hosting, replace SQLite/local uploads with managed database and object-storage services through an approved architecture change.

## Verification commands

```powershell
# Backend
node --check src/server.js
npx prisma migrate status

# Frontend
npm run build
```

## Common fixes

- Missing tables: `npx prisma migrate deploy`
- Prisma client mismatch: `npx prisma generate`
- Port already in use: stop the conflicting process; the frontend intentionally uses strict port `5173`
- CORS error: set `FRONTEND_URL` to the exact frontend origin
- Uploaded images missing: verify persistent storage and permissions for `backend/server/uploads`
- `401` response: sign in again; sessions expire after eight hours
- `403` on Team: only an Owner can manage user accounts

