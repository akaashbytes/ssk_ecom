# SSK Natural Gold

SSK Natural Gold is an enterprise production-oriented e-commerce platform.

---

## Architecture Overview

The repository is organized into distinct, modular, and decoupled frontend and backend services:

- **frontend/**: Client-side single page application built with React, TypeScript, Vite, Tailwind CSS, React Router, Axios, TanStack Query, and Zustand.
- **backend/**: Server-side REST API built with Node.js, Express, TypeScript, PostgreSQL, and Prisma ORM.
- **docs/**: Architectural specifications and developer guides.

---

## Prerequisites

Ensure you have the following installed locally:
- **Node.js**: v18.0.0 or higher (v20+ recommended)
- **npm**: v9.0.0 or higher
- **PostgreSQL**: v14 or higher (for database persistence)

---

## Installation

Install dependencies for each service independently:

### 1. Frontend Setup
```bash
cd frontend
npm install
```

### 2. Backend Setup
```bash
cd backend
npm install
```

---

## Environment Configuration

### Frontend
Copy `.env.example` to `.env`:
```bash
cd frontend
cp .env.example .env
```
Default configuration:
```env
VITE_APP_NAME="SSK Natural Gold"
VITE_API_BASE_URL="http://localhost:5000/api"
```

### Backend
Copy `.env.example` to `.env`:
```bash
cd backend
cp .env.example .env
```
Default configuration:
```env
NODE_ENV=development
PORT=5000
CLIENT_URL=http://localhost:3000
DATABASE_URL="postgresql://postgres:password@localhost:5432/ssk_natural_gold?schema=public"
```

---

## Development & Startup Commands

### Start Frontend Application
From the `frontend/` directory:
```bash
npm run dev
```
- Local URL: [http://localhost:3000](http://localhost:3000)
- Builds for production: `npm run build`
- Preview production build: `npm run preview`

### Start Backend Application
From the `backend/` directory:
```bash
npm run dev
```
- Local API URL: [http://localhost:5000](http://localhost:5000)
- Health check: [http://localhost:5000/api/health](http://localhost:5000/api/health)
- Build TypeScript to JS: `npm run build`
- Run compiled production server: `npm start`

---

## Database Management (Prisma)

Run these commands inside the `backend/` directory:
- **Generate Prisma Client**:
  ```bash
  npm run prisma:generate
  ```
- **Apply migrations**:
  ```bash
  npm run prisma:migrate
  ```
- **Launch Prisma Studio (GUI)**:
  ```bash
  npm run prisma:studio
  ```

---

## Project Structure

```
ssk-natural-gold/
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── assets/
│   │   ├── components/
│   │   ├── features/
│   │   ├── hooks/
│   │   ├── lib/
│   │   ├── routes/
│   │   ├── services/
│   │   ├── stores/
│   │   ├── types/
│   │   ├── utils/
│   │   ├── App.tsx
│   │   ├── index.css
│   │   └── main.tsx
│   ├── .env.example
│   ├── index.html
│   ├── package.json
│   ├── postcss.config.js
│   ├── tailwind.config.js
│   ├── tsconfig.json
│   ├── tsconfig.node.json
│   └── vite.config.ts
├── backend/
│   ├── prisma/
│   │   └── schema.prisma
│   ├── src/
│   │   ├── config/
│   │   ├── controllers/
│   │   ├── middlewares/
│   │   ├── routes/
│   │   ├── services/
│   │   ├── types/
│   │   ├── utils/
│   │   ├── app.ts
│   │   └── server.ts
│   ├── .env.example
│   ├── package.json
│   └── tsconfig.json
├── docs/
│   └── architecture.md
├── .gitignore
└── README.md
```
