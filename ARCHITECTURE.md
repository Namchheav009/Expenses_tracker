# Expense Tracker Architecture

## Overview
Three-tier architecture with React TypeScript frontend, Laravel API backend, and SQLite database.

```
┌─────────────────────────────────────────┐
│   React + TypeScript (Frontend)         │
│   - Vite Dev Server (port 5174)         │
│   - Inertia.js for server-side rendering│
│   - UI Components with Tailwind CSS     │
└─────────────────┬───────────────────────┘
                  │ HTTP/REST API
┌─────────────────▼───────────────────────┐
│   Laravel API Backend (port 8000)       │
│   - RESTful API Endpoints                │
│   - Sanctum Authentication              │
│   - Policy-based Authorization          │
│   - Eloquent ORM Models                 │
└─────────────────┬───────────────────────┘
                  │ Database Queries
┌─────────────────▼───────────────────────┐
│   SQLite Database                       │
│   - Categories                          │
│   - Wallets                             │
│   - Transactions                        │
│   - Budgets                             │
│   - AI Analyses                         │
└─────────────────────────────────────────┘
```

## Backend Structure

### Database Schema

#### Users (Authentication)
- `id` - Primary key
- `name` - User's name
- `email` - Unique email
- `password` - Hashed password
- `timestamps` - created_at, updated_at

#### Categories
- `id` - Primary key
- `user_id` - Foreign key (Users)
- `name` - Category name
- `icon` - Category icon emoji
- `color` - Hex color code
- `type` - 'income' or 'expense'
- `timestamps`

#### Wallets
- `id` - Primary key
- `user_id` - Foreign key (Users)
- `name` - Wallet name
- `balance` - Decimal balance
- `currency` - Currency code (USD, EUR, etc.)
- `timestamps`

#### Transactions
- `id` - Primary key
- `user_id` - Foreign key (Users)
- `wallet_id` - Foreign key (Wallets)
- `category_id` - Foreign key (Categories)
- `amount` - Transaction amount
- `transaction_type` - 'income' or 'expense'
- `description` - Optional description
- `transaction_date` - Date of transaction
- `timestamps`

#### Budgets
- `id` - Primary key
- `user_id` - Foreign key (Users)
- `category_id` - Foreign key (Categories)
- `amount` - Budget limit
- `month` - Month (1-12)
- `year` - Year
- `timestamps`

#### AI Analyses
- `id` - Primary key
- `user_id` - Foreign key (Users)
- `month` - Month analyzed
- `year` - Year analyzed
- `summary_text` - Summary of analysis
- `ai_result` - Detailed AI analysis
- `timestamps`

### Models & Relationships

```
User
├── Categories (HasMany)
├── Wallets (HasMany)
├── Transactions (HasMany)
├── Budgets (HasMany)
└── AIAnalyses (HasMany)

Category
├── User (BelongsTo)
├── Transactions (HasMany)
└── Budgets (HasMany)

Wallet
├── User (BelongsTo)
└── Transactions (HasMany)

Transaction
├── User (BelongsTo)
├── Wallet (BelongsTo)
└── Category (BelongsTo)

Budget
├── User (BelongsTo)
└── Category (BelongsTo)

AIAnalysis
└── User (BelongsTo)
```

### API Endpoints

All endpoints require authentication via `auth:sanctum` middleware.

#### Categories
- `GET /api/categories` - List user's categories
- `POST /api/categories` - Create category
- `GET /api/categories/{id}` - Get category details
- `PUT /api/categories/{id}` - Update category
- `DELETE /api/categories/{id}` - Delete category

#### Wallets
- `GET /api/wallets` - List user's wallets
- `POST /api/wallets` - Create wallet
- `GET /api/wallets/{id}` - Get wallet details
- `PUT /api/wallets/{id}` - Update wallet
- `DELETE /api/wallets/{id}` - Delete wallet

#### Transactions
- `GET /api/transactions` - List user's transactions
- `POST /api/transactions` - Create transaction (auto-updates wallet balance)
- `GET /api/transactions/{id}` - Get transaction details
- `PUT /api/transactions/{id}` - Update transaction
- `DELETE /api/transactions/{id}` - Delete transaction (reverts wallet balance)

#### Budgets
- `GET /api/budgets` - List user's budgets
- `POST /api/budgets` - Create budget
- `PUT /api/budgets/{id}` - Update budget
- `DELETE /api/budgets/{id}` - Delete budget

#### User
- `GET /api/user` - Get current authenticated user

### Controllers

- `CategoryController` - API resource controller for categories
- `WalletController` - API resource controller for wallets
- `TransactionController` - API resource controller for transactions (handles wallet balance updates)
- `BudgetController` - API resource controller for budgets

### Authorization Policies

All resources are protected by authorization policies:
- `CategoryPolicy` - Ensures users can only access their own categories
- `WalletPolicy` - Ensures users can only access their own wallets
- `TransactionPolicy` - Ensures users can only access their own transactions
- `BudgetPolicy` - Ensures users can only access their own budgets

## Frontend Structure

### Pages
Located in `resources/js/Pages/`

- `Home.tsx` - Main dashboard container with sidebar navigation
- `Dashboard.tsx` - Overview with stats and charts
- `Transactions.tsx` - Transaction list and management
- `Wallets.tsx` - Wallet management
- `Categories.tsx` - Category management
- `Budgets.tsx` - Budget management
- `AIAnalysis.tsx` - AI-powered insights
- `Auth/` - Authentication pages (Login, Register, etc.)

### Components
Located in `resources/js/Components/`

- `Sidebar.tsx` - Main navigation sidebar
- `StatCard.tsx` - Statistics display card
- `Modal.tsx` - Modal dialog component
- `InputLabel.tsx` - Form label
- `TextInput.tsx` - Text input field
- `PrimaryButton.tsx` - Primary action button
- `Dropdown.tsx` - Dropdown menu
- `NavLink.tsx` - Navigation link
- `ApplicationLogo.tsx` - App logo
- And more...

### API Service
Located in `resources/js/services/api.ts`

Provides typed API methods for all endpoints:
- `categoriesApi` - Category operations
- `walletsApi` - Wallet operations
- `transactionsApi` - Transaction operations
- `budgetsApi` - Budget operations

Handles authentication via Sanctum tokens and error responses.

### State Management
Currently using React Context and useState for component-level state. Can be upgraded to Redux/Zustand if needed.

## Authentication Flow

1. User logs in via authentication page
2. Laravel issues Sanctum token
3. Token stored in localStorage
4. All API requests include token in Authorization header
5. Backend validates token and authorizes access
6. Automatic logout on 401 response

## Running the Application

### Development
```bash
# Terminal 1: Laravel API Server
php artisan serve --host=127.0.0.1

# Terminal 2: Vite Frontend Dev Server
npm run dev

# Access at http://127.0.0.1:8000
```

### Build for Production
```bash
npm run build
php artisan migrate --force
```

## Environment Configuration

Key environment variables in `.env`:
- `APP_URL=http://localhost`
- `DB_CONNECTION=sqlite`
- `VITE_API_URL=http://localhost:8000/api`

## Dependencies

### Backend
- Laravel 12
- Laravel Breeze (Authentication)
- Laravel Sanctum (API authentication)

### Frontend
- React 18
- TypeScript 5
- Tailwind CSS
- Inertia.js
- Vite
- Axios
- Framer Motion
- Recharts
- Lucide React

## Security Considerations

1. **Authentication**: Laravel Sanctum provides stateless API authentication
2. **Authorization**: Policies ensure users can only access their own data
3. **CSRF Protection**: Enabled by default in Laravel
4. **Rate Limiting**: Can be configured per endpoint
5. **Input Validation**: Server-side validation on all endpoints
6. **Error Handling**: Sensitive errors are not exposed to frontend

## Future Enhancements

1. **State Management**: Implement Redux or Zustand for complex state
2. **Real-time Updates**: Add WebSocket support for live wallet updates
3. **Advanced Analytics**: Implement more AI-powered insights
4. **Data Export**: Add CSV/PDF export functionality
5. **Mobile App**: Create React Native mobile version
6. **Multi-currency**: Add currency conversion support
7. **Recurring Transactions**: Support for recurring bills/income
8. **Sharing**: Allow wallet sharing between users
