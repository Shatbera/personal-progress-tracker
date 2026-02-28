# Personal Progress Tracker

A full-stack application for creating, managing, and tracking personal quests and daily habits.

Built with NestJS (backend) and Next.js (frontend) with PostgreSQL database.

## Project Structure

```
personal-progress-tracker/
├── apps/
│   ├── api/                        # NestJS backend
│   │   ├── src/
│   │   │   ├── auth/               # JWT authentication & user management
│   │   │   ├── quests/             # Quest CRUD operations (Simple Goal & Daily Track types)
│   │   │   ├── quest-categories/   # Built-in & custom quest categories
│   │   │   ├── quest-events/       # Event logging for quest progress
│   │   │   ├── daily-track/        # Daily habit tracking with entries
│   │   │   ├── dashboard/          # Aggregated stats & recent activity
│   │   │   ├── app.module.ts       # Database & module configuration
│   │   │   ├── seed.ts             # Database seeding script
│   │   │   └── main.ts             # App entry point
│   │   └── docker-compose.yml      # PostgreSQL service
│   │
│   └── web/                        # Next.js frontend
│       ├── app/                    # App router (Next.js 13+)
│       │   ├── (auth)/             # Auth pages (login, signup)
│       │   └── (workspace)/        # Authenticated area
│       │       ├── (dashboard)/    # Dashboard overview page
│       │       ├── (quests)/       # Quest management pages
│       │       └── (daily-track)/  # Daily track detail pages
│       ├── actions/                # Server actions (API communication)
│       ├── lib/                    # Utilities & API client
│       └── public/                 # Static assets
│
└── README.md                       # This file
```

## Features

- **User Authentication** — JWT-based login/signup
- **Quest Management** — Create, update, archive, and complete quests with point tracking
- **Quest Types** — Simple Goal (one-off tasks) and Daily Track (recurring habit tracking)
- **Quest Categories** — Organize quests with built-in or custom categories
- **Progress Events** — Log events (complete, fail, partial, etc.) to update quest points
- **Daily Tracking** — Track daily habit streaks with per-day entry logging
- **Dashboard** — Overview of active quests, recent activity, and personal stats

## Technology Stack

- **Backend:** NestJS, TypeORM, PostgreSQL
- **Frontend:** Next.js, React, TypeScript
- **Database:** PostgreSQL 16
- **Authentication:** JWT

## Quick Start

### 1. Start the Database

```bash
cd apps/api
docker-compose up -d
```

### 2. Seed the Database (Optional)

```bash
cd apps/api
yarn run seed
```

This populates the database with sample data for development.

### 3. Run the API

```bash
cd apps/api
yarn run start:dev
```

### 4. Run the Web App

```bash
cd apps/web
yarn run dev
```
