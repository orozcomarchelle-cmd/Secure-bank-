# SecureBank — Online Banking Demo

A demo online banking web app built with **Node.js, Express, and SQLite**. It includes a login page, a dashboard with account balance and recent transactions, and a working fund-transfer form.

> **This is a demo / portfolio project only.** It is not connected to any real bank, does not move real money, and should not be used to handle real financial data or deployed publicly without a serious security review (see "Security notes" below).

## Features

- 🔐 Login page with session-based authentication (`express-session`)
- 🔑 Passwords hashed with `bcryptjs`, plus a password-strength validator (`server/utils/passwordValidation.js`)
- 📊 Dashboard showing account holder name, balance, and recent transactions
- 💸 Working transfer form that validates input, checks sufficient funds, updates the balance, and logs a new transaction — all persisted in SQLite
- 🗄️ SQLite database via `better-sqlite3`, auto-created on first run
- 🌱 Seed script that creates a demo account for **Mary Smith** with a starting balance of **$500,000**

## Project structure

```
online-banking/
├── package.json
├── README.md
├── .gitignore
├── public/                  # Frontend (static files)
│   ├── index.html           # Login page
│   ├── dashboard.html       # Dashboard page
│   ├── css/style.css
│   └── js/
│       ├── login.js
│       └── dashboard.js
└── server/                  # Backend
    ├── server.js             # Express app entry point
    ├── db/
    │   ├── database.js       # SQLite connection + schema
    │   ├── seed.js            # Seeds the demo Mary Smith account
    │   └── bank.db             # Created automatically (gitignored)
    ├── routes/
    │   ├── auth.js            # Login / logout / session / change-password
    │   ├── account.js         # Balance + transaction history
    │   └── transfer.js        # Fund transfer endpoint
    ├── middleware/
    │   └── requireAuth.js     # Blocks API routes for unauthenticated users
    └── utils/
        └── passwordValidation.js
```

## Getting started

```bash
# 1. Install dependencies
npm install

# 2. Seed the database with the demo account (Mary Smith, $500,000 balance)
npm run seed

# 3. Start the server
npm start
```

Then open **http://localhost:3000** in your browser.

**Demo login:**
- Username: `mary.smith`
- Password: `Password123!`

## Available scripts

| Command       | Description                              |
|---------------|-------------------------------------------|
| `npm start`   | Starts the Express server on port 3000    |
| `npm run seed`| (Re)creates the database and demo account |

## How the pieces fit together

- **Login (`public/index.html` + `server/routes/auth.js`)**: submits credentials to `POST /api/auth/login`, which checks the hashed password with `bcrypt.compareSync` and starts a server-side session.
- **Dashboard (`public/dashboard.html` + `server/routes/account.js`)**: on load, calls `GET /api/auth/session` to confirm the user is logged in, then `GET /api/account/summary` and `GET /api/account/transactions` to populate the balance and transaction list.
- **Transfers (`server/routes/transfer.js`)**: `POST /api/transfer` validates the recipient name/account number/amount, checks the sender has sufficient funds, then atomically updates the balance and inserts a new transaction row inside a single SQLite transaction (`db.transaction(...)`).

## Security notes (read before deploying anywhere real)

This project demonstrates the *shape* of a banking app, but a few things would need to change before it's production-grade:

- Set a strong, random `SESSION_SECRET` environment variable instead of the default placeholder in `server.js`.
- Serve over HTTPS and set `cookie.secure = true` in the session config.
- Add rate limiting / account lockout on the login route to resist brute-force attempts.
- Add CSRF protection for state-changing requests (e.g. `csurf` or a custom double-submit token).
- Add server-side audit logging for transfers.
- Use a real secrets manager rather than hardcoding the seed password in source.
- This demo intentionally has no user registration flow or multi-account support — it's built around a single seeded account for demonstration purposes.

## Publishing to GitHub

```bash
cd online-banking
git init
git add .
git commit -m "Initial commit: online banking demo"
git branch -M main
git remote add origin https://github.com/<your-username>/<your-repo>.git
git push -u origin main
```

The `.gitignore` already excludes `node_modules/` and the generated `bank.db` file, so your repo stays clean — anyone who clones it just runs `npm install && npm run seed && npm start`.
