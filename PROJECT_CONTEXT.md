# Project Context: ABES Admission Counsellor

## Overview

ABES Admission Counsellor is an enterprise-grade, AI-driven advising application designed to guide students through the university admission process. It leverages a modern frontend (React 19 + Vite), a secure Node/Express backend, and a RAG (Retrieval-Augmented Generation) pipeline using OpenAI, LangChain, and vector embeddings (FAISS) to query academic resources.

## Architecture

We employ a **Clean Architecture** approach across our modules, emphasizing SOLID design principles:

### Folder Layout

```
AI_Admission_Counselor/
├── backend/
│   ├── src/
│   │   ├── config/          # Configurations (database, logging)
│   │   ├── controllers/     # Route controller endpoints
│   │   ├── middlewares/     # Authentication, rate limit, error handlers
│   │   ├── repositories/    # Database Repository pattern layer
│   │   ├── routes/          # Express route definitions
│   │   ├── services/        # Domain logic, AI/RAG utilities
│   │   ├── app.ts           # App definition
│   │   └── index.ts         # Server entry point
│   ├── prisma/              # Prisma schema & migrations
│   └── Dockerfile
├── frontend/
│   ├── src/
│   │   ├── assets/          # Static assets
│   │   ├── components/      # Shared modular components (using shadcn rules)
│   │   ├── hooks/           # Custom React hooks
│   │   ├── pages/           # Application views/routes
│   │   ├── services/        # API integration using React Query
│   │   ├── store/           # Redux Toolkit state slices
│   │   ├── main.tsx         # Root entry file
│   │   └── index.css        # Global CSS with Tailwind
│   └── Dockerfile
└── shared/
    └── src/
        ├── types/           # Cross-project type definitions
        └── schemas/         # Zod schemas for request validation
```

---

## Architectural Guidelines

1. **Repository Pattern (Backend)**: Keep all database access logic inside dedicated repository classes or methods. Do not invoke Prisma queries directly inside controllers or service handlers.
2. **Modular Business Logic (Services)**: The service layer contains all business rules and integrations with third-party components (e.g., OpenAI, LangChain, FAISS).
3. **Shared Contracts**: Use `@project/shared` to import schemas and types on both the backend and frontend. This guarantees single-source-of-truth validation (via Zod).
4. **Strong Typing**: Absolute avoidance of JavaScript files. Strict mode typescript compilation (`strict: true`) is enforced.
5. **Security Protocols**:
   - Authentication must use secure JSON Web Tokens (JWT) with separate short-lived access tokens and refresh tokens.
   - Use Rate Limiting on all `/api` endpoints.
   - Inject security headers using Helmet.
6. **Logging Integrity**: All server behaviors, database warnings, and API failures must be structured and piped through the Winston logger configuration.
