# Bookmarkify

A production-ready, cloud-native SaaS bookmark management platform.

## Architecture

The project is organized as a monorepo:

- **apps/web**: The main React application (Dashboard).
- **apps/extension**: The Browser Extension (Manifest V3).
- **apps/api**: The NestJS Backend API.
- **packages/shared**: Shared types and utilities.

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v20+)
- [Docker Desktop](https://www.docker.com/products/docker-desktop/) (for PostgreSQL database)

### Installation

1.  **Clone the repository:**

    ```bash
    git clone <repository-url>
    cd bookmarkify
    ```

2.  **Install dependencies:**

    ```bash
    npm install
    ```

3.  **Environment Setup:**

    Ensure `apps/api/.env` exists and contains the necessary configuration.
    
    ```bash
    # apps/api/.env
    DATABASE_URL="postgresql://bookmarkify:password123@localhost:5432/bookmarkify_db?schema=public"
    JWT_SECRET="bookmarkify-super-secret-jwt-key-change-in-production"
    ```

### Database Setup

1.  **Start the Database:**
    
    Use Docker Compose to start the PostgreSQL container.

    ```bash
    docker-compose up -d
    ```

2.  **Initialize the Schema:**

    Push the Prisma schema to the database.

    ```bash
    cd apps/api
    npx prisma db push
    cd ../..
    ```

### Running the Application

You can run development servers for each application. It is recommended to run the API and Web App in separate terminal windows.

1.  **Start Backend API:**

    ```bash
    npm run dev:api
    ```
    *API will run on [http://localhost:3000](http://localhost:3000)*

2.  **Start Web App:**

    ```bash
    npm run dev:web
    ```
    *Web App will run on [http://localhost:5173](http://localhost:5173)*

3.  **Start Browser Extension (Optional):**

    ```bash
    npm run dev:ext
    ```

## Building for Production

To build all applications:

```bash
# Web App
npm run build:web

# Browser Extension
npm run build:ext

# Backend API
npm run build:api
```

## Project Structure

```text
/
├── apps/
│   ├── web/          # React + Vite (Frontend)
│   ├── extension/    # React + Vite + CRX (Browser Extension)
│   └── api/          # NestJS (Backend API)
└── packages/         # Shared libraries
```
