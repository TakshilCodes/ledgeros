<p align="center">
  <img src="./public/ledgerOS.png" alt="LedgerOS Logo" width="250" />
</p>

<div align="center">

<h1 align="center">LedgerOS</h1>

A modern full-stack expense, subscription, budget, and recurring payment tracker built with a clean dashboard experience.

<br/>

![Next.js](https://img.shields.io/badge/Next.js-000000?style=for-the-badge&logo=nextdotjs&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)
![Prisma](https://img.shields.io/badge/Prisma-2D3748?style=for-the-badge&logo=prisma&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-336791?style=for-the-badge&logo=postgresql&logoColor=white)
![Redis](https://img.shields.io/badge/Redis-DC382D?style=for-the-badge&logo=redis&logoColor=white)

</div>

---

## 🚀 About

**LedgerOS** is a production-style personal finance dashboard built to help users understand and manage their money in one place.

Users can track daily expenses, monitor subscriptions, manage recurring expenses, set budgets, view insights, and export their financial data.

This project was built as a full-stack portfolio project with authentication, database-backed features, analytics, caching, cron automation, responsive UI, and clean app architecture.

---

## ✨ Core Features

- Authentication with email/password and Google
- Financial dashboard with real analytics
- Expense tracking with filters, search, and sorting
- Subscription tracking with renewal management
- Recurring expense tracking
- Monthly, category, and daily limit budgets
- Insights page with spending analytics
- Chart.js visualizations
- CSV data export
- Account settings and profile management
- Redis caching for dashboard and insights
- Protected cron job for subscription renewal updates
- Responsive GitHub-inspired dark UI
- Skeleton loading states and smooth UX

---

## 📸 Screenshots

### Dashboard

![Dashboard](./public/screenshots/dashboard.png)

---

### Subscriptions

![Subscriptions](./public/screenshots/subscriptions.png)

---

### Expenses

![Expenses](./public/screenshots/expenses.png)

---

### Budgets

![Budgets](./public/screenshots/budgets.png)

---

### Insights

![Insights](./public/screenshots/insights.png)

---

## 🛠️ Tech Stack

### Frontend

- Next.js App Router
- TypeScript
- Tailwind CSS
- Chart.js

### Backend

- Next.js Server Actions
- Next.js API Routes
- Auth.js / NextAuth

### Database

- PostgreSQL
- Prisma ORM

### State Management

- Zustand

### Caching

- Redis

---

## ⏰ Subscription Renewal Automation

LedgerOS includes a protected cron route that automatically updates overdue active subscription renewal dates.

It checks active subscriptions where:

```txt
isActive = true
nextRenewalDate < today
```

Then it moves the renewal date forward based on the billing cycle.

Example:

```txt
Monthly: 22 May 2026 → 22 June 2026
Yearly: 20 May 2026 → 20 May 2027
```

The cron route is protected using:

```env
CRON_SECRET=""
```

This is a V1 implementation. At larger scale, this can be moved to a queue or worker system with retries, batching, and monitoring.

---

## ⚙️ Local Setup

### 1. Clone the repository

```bash
git clone https://github.com/yourusername/ledgeros.git
cd ledgeros
```

---

### 2. Install dependencies

```bash
npm install
```

---

### 3. Setup environment variables

Create a `.env` file in the root directory:

```env
DATABASE_URL=""

AUTH_SECRET=""
NEXTAUTH_SECRET=""
NEXTAUTH_URL="http://localhost:3000"

GOOGLE_CLIENT_ID=""
GOOGLE_CLIENT_SECRET=""

REDIS_URL=""

CRON_SECRET=""
```

---

### 4. Run Prisma migration

```bash
npx prisma migrate dev
```

---

### 5. Generate Prisma client

```bash
npx prisma generate
```

---

### 6. Start development server

```bash
npm run dev
```

Open:

```txt
http://localhost:3000
```

---

## 📌 Project Status

> ✅ V1 Completed

LedgerOS V1 is complete with authentication, dashboard analytics, expenses, subscriptions, recurring expenses, budgets, insights, settings, CSV export, Redis caching, and subscription renewal automation.

---

<div align="center">

### Built with ❤️ using Next.js, Prisma, PostgreSQL, and Redis

</div>