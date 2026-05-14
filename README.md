# 💸 FinTrack

> A modern full-stack expense tracking application built with React, Node.js, Express, and MongoDB Atlas.  
> Because surviving adulthood apparently requires analytics now.

---

## 🌐 Live Demo

### 🚀 Frontend
🔗 https://fintrack-adnan.vercel.app

### ⚙️ Backend API
🔗 https://fintrack-backend-srjv.onrender.com

---

# ✨ Features

✅ Add Expenses  
✅ Delete Expenses  
✅ Categorize Spending  
✅ Track Needs / Wants / Savings  
✅ 50/30/20 Budget Rule Overview  
✅ Persistent Cloud Database  
✅ Responsive Modern UI  
✅ Full-Stack Deployment  

---

# 🛠️ Tech Stack

## 🎨 Frontend
- React
- Vite
- Axios
- CSS

## ⚡ Backend
- Node.js
- Express.js
- MongoDB Atlas
- Mongoose

## ☁️ Deployment
- Vercel (Frontend)
- Render (Backend)

---

# 📁 Project Structure

```plaintext
FinTrack/
│
├── client/        # React Frontend
│
├── server/        # Express Backend
│
└── README.md
```

---

# ⚙️ Installation

## 📥 Clone Repository

```bash
git clone https://github.com/adnandeva/FinTrack.git
```

---

# 🎨 Frontend Setup

```bash
cd client
npm install
npm run dev
```

Frontend runs on:

```plaintext
http://localhost:5173
```

---

# ⚡ Backend Setup

```bash
cd server
npm install
npm run dev
```

Backend runs on:

```plaintext
http://localhost:8000
```

---

# 🔐 Environment Variables

Create a `.env` file inside `server/`

```env
MONGO_URI=your_mongodb_connection_string
```

---

# 📡 API Endpoints

## 📥 Get All Expenses

```http
GET /api/expenses
```

---

## ➕ Add Expense

```http
POST /api/expenses
```

---

## ❌ Delete Expense

```http
DELETE /api/expenses/:id
```

---

## 👤 Author

### Adnan Riyaz

Pre-Final Year Computer Science Student  
Ramaiah University of Applied Sciences

---

# 🌟 Final Note

This project started as a semester assignment and somehow became a fully deployed cloud-hosted application.
