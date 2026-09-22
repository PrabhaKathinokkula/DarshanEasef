# DarshanEase

A full-stack Temple Darshan Ticket Booking System built with the MERN stack (MongoDB, Express, React, Node.js).

## Tech Stack
- **Frontend:** React + Vite (JavaScript)
- **Backend:** Node.js + Express.js
- **Database:** MongoDB + Mongoose
- **Auth:** JWT + bcryptjs, role-based access (user / organizer / admin)
- **Uploads:** Multer (temple images)

## Project Structure
```
DarshanEase/
├── client/     # React + Vite frontend
└── server/     # Express + MongoDB backend
```

## Prerequisites
- Node.js (v18+ recommended)
- MongoDB running locally (or a MongoDB Atlas URI)

## Setup & Run

### 1. Backend
```bash
cd server
npm install
copy .env.example -> .env   (Windows: copy .env.example .env | Mac/Linux: cp .env.example .env)
```
Edit `.env` if needed (defaults work with a local MongoDB):
```
PORT=8000
MONGO_URI=mongodb://localhost:27017/darshanease
JWT_SECRET=your_secret_key
CLIENT_URL=http://localhost:5173
```

Start MongoDB, then seed demo data:
```bash
npm run seed
```

Start the backend:
```bash
npm run dev
```
Backend runs at **http://localhost:8000**

### 2. Frontend
In a new terminal:
```bash
cd client
npm install
npm run dev
```
Frontend runs at **http://localhost:5173**

## Demo Credentials
| Role      | Email                          | Password      |
|-----------|---------------------------------|----------------|
| Admin     | admin@darshanease.com          | Admin@123      |
| Organizer | organizer@darshanease.com      | Organizer@123  |
| User      | user@darshanease.com           | User@123       |

(Two additional organizer accounts for Srisailam and Kashi Vishwanath temples are also seeded — see `server/seed.js`.)

## Features
- **Devotee:** register/login, browse & search temples, view darshan slots, book tickets (select darshan type, number of devotees), view e-ticket with QR code, view booking history, cancel bookings, leave temple feedback.
- **Organizer:** dashboard with stats, manage own temple (create/update, image upload), manage darshan slots (create/update/delete), view bookings for their temple.
- **Admin:** dashboard with system-wide stats, manage users, organizers, and temples, view all bookings.

## Notes
- Uploaded temple images are stored in `server/uploads/` and served at `http://localhost:8000/uploads/<filename>`.
- Booking logic enforces seat availability, calculates totals server-side, and restores seats on cancellation.
- Run `npm run seed` again any time to reset demo data (it clears and reseeds all collections).
