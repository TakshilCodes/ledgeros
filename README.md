<p align="center">
  <img src="./public/ledgerOS.png" alt="LedgerOS Logo" width="180" />
</p>

<div align="center">

<h1 align="center">LedgerOS</h1>

Track expenses, manage subscriptions, monitor budgets, and build better spending habits with a clean modern dashboard experience.

<br/>

![Next.js](https://img.shields.io/badge/Next.js-000000?style=for-the-badge&logo=nextdotjs&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)
![Prisma](https://img.shields.io/badge/Prisma-2D3748?style=for-the-badge&logo=prisma&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-336791?style=for-the-badge&logo=postgresql&logoColor=white)

</div>

---

# 🚀 About LedgerOS

LedgerOS is a modern multi-user expense and subscription tracking platform focused on helping users:

- manage daily expenses
- track subscriptions
- manage recurring expenses
- monitor budgets
- improve financial awareness

The project is designed with clean architecture, modern UI/UX, and production-style full-stack practices.

---

# ✨ Current Progress

## ✅ Completed

- Authentication system
- Dashboard UI
- Responsive dashboard layout
- Expense management system
- Expense filters & search
- Subscription management system
- Subscription templates
- Recurring expenses system
- Mobile-friendly expense, subscription, and recurring layouts

---

## 🚧 In Progress

- Budget system
- Expense charts
- Weekly reports
- No Spend Day tracker
- Alerts & insights
- Redis caching
- Dashboard analytics
- Subscription renewal automation

---

# 🛠️ Tech Stack

## Frontend

- Next.js App Router
- TypeScript
- Tailwind CSS
- shadcn/ui
- Lucide React

## Backend

- Next.js Server Actions
- API Routes
- Auth.js / NextAuth

## Database

- PostgreSQL
- Prisma ORM

## State Management

- Zustand

## Charts

- Chart.js

## Caching

- Redis

---

# ⏰ Subscription Renewal Automation

LedgerOS includes a protected daily cron route to update overdue active subscriptions automatically.

It checks subscriptions where:

```txt
isActive = true
nextRenewalDate < today
```

Then it moves the renewal date forward based on the billing cycle:

```txt
Monthly: 22 May 2026 → 22 June 2026
Yearly: 20 May 2026 → 20 May 2027
```

If a subscription is many cycles behind, the date keeps moving forward until it becomes upcoming again.

The cron route is protected using:

```env
CRON_SECRET=""
```

This is a V1 implementation. At larger scale, this can be moved to a queue/worker system with batching, retries, and monitoring.

---

# 📂 Planned Features

- Monthly budget tracking
- Category budgets
- Expense analytics
- Daily & weekly reports
- Subscription renewal tracking
- Recurring expense system
- Dashboard insights
- No Spend Day streak system
- Subscription templates
- Protected cron job for automatic renewal updates

---

# 📸 Screenshots

> Screenshots coming soon...

---

# ⚡ Local Setup

## 1. Clone Repository

```bash
git clone https://github.com/yourusername/ledgeros.git
```

---

## 2. Install Dependencies

```bash
npm install
```

---

## 3. Setup Environment Variables

Create a `.env` file:

```env
DATABASE_URL=""

AUTH_SECRET=""
GOOGLE_CLIENT_ID=""
GOOGLE_CLIENT_SECRET=""
NEXTAUTH_SECRET=""
NEXTAUTH_URL=""

CRON_SECRET=""
```

---

## 4. Run Prisma Migration

```bash
npx prisma migrate dev
```

---

## 5. Start Development Server

```bash
npm run dev
```

---

# 📌 Status

> 🚧 Active Development — V1 in Progress

---

<div align="center">

### Built with ❤️ using Next.js & Prisma

</div>