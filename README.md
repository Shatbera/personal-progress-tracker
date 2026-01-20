# Personal Progress Tracker

A full-stack application for creating, managing, and tracking personal quests and progress.

Built with NestJS (backend) and Next.js (frontend) with PostgreSQL database.

## Project Structure

```
personal-progress-tracker/
├── apps/
│   ├── api/                 # NestJS backend
│   │   ├── src/
│   │   │   ├── auth/        # JWT authentication & user management
│   │   │   ├── quests/      # Quest CRUD operations
│   │   │   ├── quest-events/ # Event logging for quest progress
│   │   │   ├── app.module.ts # Database & module configuration
│   │   │   └── main.ts      # App entry point
│   │   └── docker-compose.yml # PostgreSQL service
│   │
│   └── web/                 # Next.js frontend
│       ├── app/             # App router (Next.js 13+)
│       │   ├── (auth)/      # Auth pages (login, signup)
│       │   └── (quests)/    # Quest management pages
│       ├── actions/         # Server actions (API communication)
│       ├── lib/             # Utilities & API client
│       └── public/          # Static assets
│
└── README.md                # This file
```

## Features

- **User Authentication** — JWT-based login/signup
- **Quest Management** — Create, update, and track quests
- **Progress Tracking** — Log quest events and monitor progress
- **Responsive UI** — Modern Next.js frontend with server actions

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
