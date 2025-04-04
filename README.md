# 📘 Booking System Backend Setup (Node.js + Prisma)

This is the backend server for the Booking System app, built using **Node.js**, **Express**, and **Prisma ORM**, **JWT authentication**.

Wich inclues signup, login and booking functionality.

---

## ✅ Prerequisites

- Node.js (v16+ recommended)
- npm or yarn
- A running **PostgreSQL** or **MySQL** database

---

## 📦 Install Dependencies

```bash
npm install
```

## ⚙️ Update Env files

NODE_ENV=
PORT=
JWT_SECRET=
DATABASE_URL= 

## 🧾 Migrate prisma schema

Schema file > \models\schema.prisma
```bash
npx prisma migrate dev --name initialmigration
```

## ⚙️ Migrate prisma schema

```bash
npx prisma migrate dev --name initialmigration
```
## ▶️ Start the Backend Server

```bash
npm run dev
```