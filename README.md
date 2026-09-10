# Linkup Admin — CMS Admin Panel

Yeh ek standalone admin panel project hai Linkup Group ke liye.
Public website (Linkup-website) se bilkul alag hai.

## Folder Structure

```
Linkup-admin/
├── backend/      → Express.js + MongoDB API server
└── frontend/     → Next.js Admin UI
```

---

## Backend Setup & Run

```bash
cd backend
npm install         # (pehli baar)
node index.js       # server start karo port 5000 pe
```

Ya
```bash
cd backend
npm start
```

Backend `http://localhost:5000` pe chalega.

---

## Frontend Setup & Run

```bash
cd frontend
npm install         # (pehli baar)
npm run dev         # dev server start karo
```

Frontend `http://localhost:4029/admin` pe chalegi.

---

## .env Files

### backend/.env
```
MONGODB_URI=mongodb+srv://...
PORT=5000
JWT_SECRET=...
CLOUDINARY_CLOUD_NAME=...
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...
```

### frontend/.env
```
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

---

## Default Admin Login

- **Email:** admin@linkup.com
- **Password:** admin123

(Seed karne ke liye: `cd backend && node seed.js`)
