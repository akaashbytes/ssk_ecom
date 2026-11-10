# SSK Natural Gold — Architecture Documentation

## Overview
SSK Natural Gold is an enterprise production-oriented e-commerce system architected with decoupled frontend and backend services.

## Technology Stack

### Frontend
- **Runtime & Framework**: React 18, TypeScript, Vite
- **Styling**: Tailwind CSS
- **Routing**: React Router v7 (`react-router-dom`)
- **State Management**: Zustand
- **Server State & Caching**: TanStack Query (React Query v5)
- **HTTP Client**: Axios

### Backend
- **Runtime & Framework**: Node.js, Express, TypeScript
- **Execution & Development**: `tsx` (TypeScript Execute / Watch)
- **Database & ORM**: PostgreSQL, Prisma ORM
- **Security & Utilities**: CORS, Dotenv

---

## Directory Architecture

```
ssk-natural-gold/
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── assets/              # Static assets (images, logos, fonts)
│   │   ├── components/          # Reusable UI components
│   │   │   ├── common/          # Low-level primitives (Buttons, Inputs, Modals)
│   │   │   └── layout/          # Layout wrappers (Header, Footer, MainLayout)
│   │   ├── features/            # Feature-sliced modules (products, cart, checkout)
│   │   ├── hooks/               # Custom React hooks
│   │   ├── lib/                 # Core client instances (axios, queryClient)
│   │   ├── routes/              # Route configurations and pages
│   │   ├── services/            # API call declarations
│   │   ├── stores/              # Zustand state stores
│   │   ├── types/               # TypeScript interfaces and types
│   │   ├── utils/               # Helper utilities
│   │   ├── App.tsx              # Root application component
│   │   ├── index.css            # Tailwind directives and global styles
│   │   └── main.tsx             # Application bootstrap entry point
│   ├── .env.example             # Frontend environment template
│   ├── index.html               # Main HTML entry
│   ├── package.json             # Frontend dependencies and scripts
│   ├── postcss.config.js        # PostCSS configuration
│   ├── tailwind.config.js       # Tailwind CSS configuration
│   ├── tsconfig.json            # TypeScript configuration
│   ├── tsconfig.node.json       # Vite TypeScript configuration
│   └── vite.config.ts           # Vite build and server configuration
│
├── backend/
│   ├── prisma/
│   │   └── schema.prisma        # Prisma data models and datasource definition
│   ├── src/
│   │   ├── config/              # Environment and database configuration
│   │   ├── controllers/         # Request handling and response dispatching
│   │   ├── middlewares/         # Express middlewares (error handling, 404, auth)
│   │   ├── routes/              # Modular Express routing endpoints
│   │   ├── services/            # Core business logic layer
│   │   ├── types/               # TypeScript interfaces and DTOs
│   │   ├── utils/               # Backend helper functions
│   │   ├── app.ts               # Express application initialization and middleware chain
│   │   └── server.ts            # HTTP server startup and lifecycle handling
│   ├── .env.example             # Backend environment template
│   ├── package.json             # Backend dependencies and scripts
│   └── tsconfig.json            # Backend TypeScript configuration
│
├── docs/                        # Project documentation and specifications
│   └── architecture.md          # Architecture and design documentation
│
├── .gitignore                   # Workspace Git ignore rules
└── README.md                    # Project overview, installation, and startup guide
```

---

## Communication & Environment Boundaries
1. **Separation of Concerns**: Frontend and Backend are independent applications with separate dependencies, TypeScript environments, and build pipelines.
2. **API Communication**: The frontend interacts with the backend strictly via the REST API layer under `/api/*`.
3. **Database Access**: All database queries are isolated in the backend using Prisma ORM.
