# College Management Tool

Hi — this README is how I document **my** college management project: what it does, how it is built, and how you can run it on your machine. I wrote it so someone new (or future me) can follow along without guessing.

---

## What this project is

This is a **web application** for a college-style setup. The idea is simple: **one place** where admins, teachers, students, and parents can each see what matters to them — logins, dashboards, and flows for academics, fees, and communication. The main app is a **React (Vite) frontend** talking to a **Node.js + Express backend** with **MongoDB** for data. Some screens use **demo or mock data** in the UI; the backend handles **real authentication flows** for admins and users where wired up.

---

## Features (in detail)

### Landing and authentication

- **Home page** — Welcome screen where you choose **Admin login** or **User login** (students, teachers, parents use the user flow).
- **Admin registration and login** — Admins can register (with allowed roles) and log in; the server issues a **JWT** for protected-style usage.
- **User login** — Students, teachers, college admins, and parents log in via `/loginuser`; the API returns who you are and **where to redirect** (admin, teacher, student, or parent dashboard).
- **Password handling** — Admin passwords are **hashed with bcrypt**. For regular users, the current code compares passwords plainly in one path — **I recommend hashing user passwords the same way as admins before any production use.**

### College administrator dashboard (`/admin`)

A tabbed **College Administrator Dashboard** with sections such as:

- **Overview** — High-level stats (students, teachers, fees, attendance, events, etc.).
- **Add user** — Flow to add users into the system.
- **Student management** — Manage student-related information.
- **Teacher management** — Manage teacher-related information.
- **Course management** — Course-related administration.
- **Attendance** — Attendance oversight.
- **Fees** — Fee management.
- **Exams / slots** — Slot management for exams or scheduling.
- **Library** — Library management UI.
- **Communication** — Messaging or announcements center.
- **Reports and settings** — Analytics / reports and system settings (where implemented in the components).

### Teacher dashboard (`/teacher`)

Teachers get a dedicated dashboard with tabs including:

- **Dashboard overview** — Summary stats (classes, students, assignments, attendance, exams, messages, etc.).
- **My classes** — View or manage assigned classes.
- **Attendance** — Attendance management.
- **Assignments and grading** — Assignments and grading workflows.
- **Exams** — Exam-related management.
- **Upload** — File or content upload for class materials.
- **Communication** — Teacher communication center.
- **Profile** — Teacher profile.

### Student dashboard (`/student`)

The student side is fairly rich; tabs include things like:

- **Dashboard overview** — Personal stats (courses, assignments, exams, attendance, GPA-style info, fees, etc.).
- **My courses** — Course list and details.
- **Saveetha Sites** — Institution-specific quick links (custom section).
- **Attendance** — Personal attendance record.
- **Assignments** — View and track assignments.
- **Exams and grades** — Exams and results.
- **Slot booking** — Booking slots (e.g. labs or exams).
- **Performance feedback** — Prediction / feedback form style UI.
- **Library** — Library section.
- **Communication** — Messages or notices.
- **Fee details** — Fee information; can tie into **Stripe** checkout from the backend when configured.
- **Profile** — Student profile.

### Parent dashboard (`/parent`)

Parents can switch between **multiple children** (mock data in the UI) and use tabs such as:

- **Overview** — Child summary and stats.
- **Attendance** — Track the child’s attendance.
- **Assignments and grades** — See assignments and grades.
- **Communication** — Stay in touch with the school side.
- **Fees** — Fee and payment-related view.
- **Profile** — Parent profile.

### Backend API (what I rely on)

- **MongoDB + Mongoose** — Stores **admins** and **users** (students, teachers, college admins, site admins, parents).
- **REST endpoints** — Examples: `POST /register`, `POST /login` (admin), `POST /create-user`, `GET /users`, `POST /loginuser` (user login with role-based redirect).
- **Stripe** — `POST /api/create-checkout-session` creates a **Stripe Checkout** session for fee payments (amount, fee type in INR); needs `STRIPE_SECRET_KEY` in your environment.
- **CORS** enabled so the React dev server can call the API.

### Optional: Exam Copy Detector (Python)

Inside the repo there is a separate folder **`exam-copy-detector/`**. It is a small **Flask** app that uploads a **PDF**, turns pages into images, runs **Tesseract OCR**, and compares page text similarity to flag possibly similar pages. It is **not** the same stack as the main Node app; it needs **Python**, **Poppler**, and **Tesseract** installed on Windows (or your OS). See that folder’s `app.py` and `requirements.txt` if you want to run it.

---

## Tech stack

| Part | What I use |
|------|------------|
| Frontend | **React 19**, **Vite**, **React Router**, **Axios**, **Tailwind CSS**, **Lucide React**, **Radix UI**, **Recharts** (where used) |
| Backend | **Node.js**, **Express**, **Mongoose** (MongoDB) |
| Auth | **JWT** (`jsonwebtoken`), **bcryptjs** for admin password hashing |
| Payments | **Stripe** (Checkout sessions) |
| Database | **MongoDB Atlas** or any MongoDB URI you configure |

---

## Project structure (simplified)

```
college_management_tool/
├── backend/          # Express API (server.js, MongoDB models inline)
├── frontend/         # Vite + React app (src/, components per role)
├── exam-copy-detector/   # Optional Flask OCR tool (Python)
└── README.md
```

---

## What you need installed

- **Node.js** (LTS recommended) and **npm**
- **MongoDB** — A connection string (e.g. MongoDB Atlas)
- For **fee checkout**: a **Stripe** account and secret key
- For **exam-copy-detector** only: **Python 3**, **Poppler**, **Tesseract OCR**

---

## Configuration (important)

Create a **`.env`** file in the **`backend/`** folder (and never commit real secrets to git). At minimum I use:

| Variable | Purpose |
|----------|---------|
| `JWT_SECRET` | Secret for signing JWTs — **required** or the server exits |
| `STRIPE_SECRET_KEY` | Stripe secret key for `/api/create-checkout-session` |

**Security note:** Keep your MongoDB URI and API keys in `.env`. If `server.js` still contains a hardcoded connection string, I treat that as something to **move into `process.env.MONGODB_URI`** and rotate credentials if they were ever exposed.

---

## How to run the main application

### 1. Backend

```bash
cd backend
npm install
```

Ensure `.env` has `JWT_SECRET` (and MongoDB connection however your `server.js` expects it — ideally `MONGODB_URI` after you refactor).

```bash
npm start
```

The API listens on **port 5000** by default (`http://localhost:5000`).

### 2. Frontend

```bash
cd frontend
npm install
npm run dev
```

Vite usually serves the app at **http://localhost:5173** (check the terminal output).

### 3. Open in the browser

- Frontend: **http://localhost:5173**
- Use **Admin login** or **User login** from the home page. The frontend may call `http://localhost:5000` for API requests — keep the backend running.

If your frontend still points to a deployed URL in some files, switch those `axios` base URLs to `http://localhost:5000` for local development.

---

## Contributing

If you want to contribute:

1. Fork the repository.
2. Create a branch for your feature (`git checkout -b feature/your-feature`).
3. Commit clear messages describing what changed.
4. Push and open a Pull Request.

---

## License

This project is licensed under the **MIT License** — see the `LICENSE` file if present in the repo.

---

## Acknowledgements

Thanks to faculty, mentors, and everyone who gave feedback on this project. Thanks also to the open-source communities behind **MongoDB**, **Node.js**, **React**, **Vite**, and the libraries listed above.




🙌 Acknowledgements
Special thanks to our faculty and project mentors

Open-source libraries and contributors

MongoDB, Node.js, and React.js community
