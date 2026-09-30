# Personal Finance Tracker

A mobile-friendly personal finance tracker built with Next.js 15, MongoDB Atlas, Tailwind CSS and shadcn/ui.

- **Transactions** of three types: income, expense and amount returned
- **Actual expense = total expense - amount returned**, and **net savings = income - actual expense**
- **Categories** per type (payment channels such as POS, Cash or Bills are just categories)
- **Recurring transactions** (daily, weekly, monthly, yearly, every N periods) that are posted automatically
- **Dashboard**, **reports** (month vs month, category trends, top categories), search and filters
- Light, dark and system themes; single-user password login; amounts in PKR, dates in Asia/Karachi

## Local setup

1. Install dependencies:

   ```bash
   npm install
   ```

2. Create a free MongoDB Atlas cluster, add a database user, allow your IP (or `0.0.0.0/0` for Vercel) under **Network Access**, and copy the connection string.

3. Generate your login secrets:

   ```bash
   npm run hash-password
   ```

4. Copy `.env.example` to `.env.local` and fill in `MONGODB_URI` plus the three values printed by the script.

5. Start the app and sign in with the password you chose. Default categories are created on first login.

   ```bash
   npm run dev
   ```

## Deploying to Vercel

1. Push the project to a Git repository and import it in Vercel.
2. Add `MONGODB_URI`, `APP_PASSWORD_HASH`, `AUTH_SECRET` and `CRON_SECRET` under **Project > Settings > Environment Variables**.
3. Deploy. `vercel.json` schedules `/api/cron/recurring` once a day at 00:05 Pakistan time; Vercel sends `CRON_SECRET` automatically as a Bearer token.

Recurring items are also processed whenever you open the dashboard or the recurring page, so nothing is missed if a cron run is skipped.

## Scripts

| Command | Purpose |
| --- | --- |
| `npm run dev` | Start the dev server |
| `npm run build` | Production build |
| `npm run lint` | ESLint |
| `npm run typecheck` | TypeScript check |
| `npm run hash-password` | Generate `APP_PASSWORD_HASH`, `AUTH_SECRET` and `CRON_SECRET` |
