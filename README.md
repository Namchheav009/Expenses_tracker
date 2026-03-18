# Expense Tracker

A personal finance & expense tracking web application built with **Laravel 12** (PHP 8.2) and **React + Inertia** (TypeScript). It enables users to track transactions, create budgets, categorize spending, and manage multiple users (admin role).

---

## 🚀 Key Features

- **User authentication** (login/register)
- **Expense & income tracking** with categories and wallets
- **Monthly budgets** per category with progress tracking
- **Admin role**:
  - View all users' budgets and transactions
  - Add/edit budgets for any user
  - Manage user accounts (roles, status)
- **Charts & analysis** for spending insights (built with Recharts)
- Responsive UI built with TailwindCSS + Headless UI

---

## 🧰 Tech Stack

- **Backend:** Laravel 12 (PHP 8.2), Eloquent ORM, Sanctum auth
- **Frontend:** React + Inertia, TypeScript, TailwindCSS, Vite
- **Data:** SQLite (default), configurable via `.env`

---

## ▶️ Getting Started (Local Development)

### 1) Clone & Install

```bash
git clone <your-repo-url>
cd Expenses_tracker
```

### 2) Environment

```bash
cp .env.example .env
php artisan key:generate
```

Update `.env` as needed (database, mail, etc.).

### 3) Install dependencies

```bash
composer install
npm install
```

### 4) Run migrations + seeders

```bash
php artisan migrate --seed
```

### 5) Build frontend and run dev server

```bash
npm run dev
php artisan serve
```

The app will be available at **http://localhost:8000** (or whatever Artisan serves).

---

## 🧪 Testing

Run the Laravel test suite:

```bash
php artisan test
```

---

## 🔧 Common Commands

- `php artisan migrate` — run database migrations
- `php artisan migrate:fresh --seed` — reset DB and seed
- `npm run dev` — start Vite dev server
- `npm run build` — compile production assets

---

## 🗂️ Project Structure (Highlights)

- `app/Http/Controllers/Api` — API controllers (Transactions, Budgets, Categories)
- `resources/js/Pages` — React/Inertia pages (Dashboard, Budgets, Transactions)
- `resources/js/Components` — shared UI components (modals, toasts, etc.)
- `database/migrations` — schema definitions
- `database/seeders` — initial seed data

---

## 🧩 Extending the App

- Add new report/views under `resources/js/Pages`
- Add new API endpoints under `app/Http/Controllers/Api`
- Extend models in `app/Models` and add relationships as needed

---

## 📄 License

This project is open source under the **MIT License**.
