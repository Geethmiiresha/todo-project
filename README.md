# Full-Stack Todo Application (Phase 01 - Phase 10)

A production-ready, full-stack Todo application built with **React, NestJS, and PostgreSQL**, featuring secure user authentication (JWT & Refresh Tokens), role-based authorization (USER/ADMIN), advanced search, filtering, sorting, pagination, categories, tags, automated testing, and Swagger API documentation.

---
## 📸 Screenshots & UI Preview

* **Login & Registration Page:**
<img width="1907" height="897" alt="todo1 (1)" src="https://github.com/user-attachments/assets/bc38f458-bf42-41cc-8d3b-2048a27b2ef8" />

* **Protected Todo Dashboard (Search, Filter, Pagination, Priority):**
<img width="1916" height="906" alt="todo2" src="https://github.com/user-attachments/assets/9f5278f2-c666-442b-a7f1-415e75feb548" />


## 🚀 Technologies Used

### Frontend (`todo-app`)
* **React** with TypeScript
* **Vite**
* **Tailwind CSS**
* **Axios** (Centralized API client with interceptors)
* **React Testing Library & Jest**

### Backend (`todo-api`)
* **NestJS** (TypeScript framework)
* **PostgreSQL** Database
* **Prisma ORM** (Database management & migrations)
* **Passport.js & JWT** (Authentication & Authorization)
* **class-validator & class-transformer** (Request validation)
* **Helmet & Express-Rate-Limit** (Security & Rate limiting)
* **Jest & Supertest** (Unit & E2E Testing)
* **Swagger/OpenAPI** (API Documentation)

---

## 📂 Project Structure

```text
todo-project/
├── todo-api/             # NestJS Backend Application
│   ├── src/
│   │   ├── auth/         # Authentication module (JWT, Login, Register)
│   │   ├── todos/        # Todo CRUD, search, filter, sort, pagination
│   │   ├── categories/   # Categories management
│   │   ├── tags/         # Tags management (Many-to-Many relation)
│   │   ├── users/        # User management & Admin area
│   │   └── main.ts       # Global pipes, validation, CORS, Swagger setup
│   ├── prisma/           # Database schema and migrations
│   └── test/             # E2E and unit tests
│
└── todo-app/             # React Frontend Application
    ├── src/
    │   ├── components/   # Reusable UI components
    │   ├── services/     # Centralized API client & service layers
    │   ├── context/      # Authentication & State management
    │   └── pages/        # Login, Register, Todo Dashboard, Admin View
    └── package.json

Me thiyenne oyage assignment eke **Phase 01 idan Phase 10 wenakam** illala thiyena okkoma details, setup instructions, environment variables, testing, saha Swagger API documentation anthargatha karala hadapu **Complete & Professional README.md** file eka.

Meka copy karala oyage GitHub repository eke README.md eka widihata paste karanna puluwan:

---

```markdown
# Full-Stack Todo Application (Phase 01 - Phase 10)

A production-ready, full-stack Todo application built with **React, NestJS, and PostgreSQL**, featuring secure user authentication (JWT & Refresh Tokens), role-based authorization (USER/ADMIN), advanced search, filtering, sorting, pagination, categories, tags, automated testing, and Swagger API documentation.

---

## 🚀 Technologies Used

### Frontend (`todo-app`)
* **React** with TypeScript
* **Vite**
* **Tailwind CSS**
* **Axios** (Centralized API client with interceptors)
* **React Testing Library & Jest**

### Backend (`todo-api`)
* **NestJS** (TypeScript framework)
* **PostgreSQL** Database
* **Prisma ORM** (Database management & migrations)
* **Passport.js & JWT** (Authentication & Authorization)
* **class-validator & class-transformer** (Request validation)
* **Helmet & Express-Rate-Limit** (Security & Rate limiting)
* **Jest & Supertest** (Unit & E2E Testing)
* **Swagger/OpenAPI** (API Documentation)

---

## 📂 Project Structure

```text
todo-project/
├── todo-api/             # NestJS Backend Application
│   ├── src/
│   │   ├── auth/         # Authentication module (JWT, Login, Register)
│   │   ├── todos/        # Todo CRUD, search, filter, sort, pagination
│   │   ├── categories/   # Categories management
│   │   ├── tags/         # Tags management (Many-to-Many relation)
│   │   ├── users/        # User management & Admin area
│   │   └── main.ts       # Global pipes, validation, CORS, Swagger setup
│   ├── prisma/           # Database schema and migrations
│   └── test/             # E2E and unit tests
│
└── todo-app/             # React Frontend Application
    ├── src/
    │   ├── components/   # Reusable UI components
    │   ├── services/     # Centralized API client & service layers
    │   ├── context/      # Authentication & State management
    │   └── pages/        # Login, Register, Todo Dashboard, Admin View
    └── package.json

```

---

## ⚙️ Setup & Installation Instructions

### Prerequisites

* **Node.js** (v18+ recommended)
* **PostgreSQL** installed locally or via cloud provider (e.g., Supabase / Neon)
* **Git**

### 1. Clone the Repository

```bash
git clone [https://github.com/Geethmiiresha/todo-project.git](https://github.com/Geethmiiresha/todo-project.git)
cd todo-project

```

---

### 2. Backend Setup (`todo-api`)

Navigate to the backend directory and install dependencies:

```bash
cd todo-api
npm install

```

#### Required Environment Variables

Create a `.env` file inside the `todo-api` folder using the structure below:

```env
DATABASE_URL="postgresql://postgres:your_password@localhost:5432/todo_db?schema=public"
JWT_SECRET="your_super_secret_jwt_key_here"
JWT_REFRESH_SECRET="your_refresh_token_secret_here"
PORT=3000

```

#### Run Database Migrations

```bash
npx prisma migrate dev --name init

```

#### Run the Backend Server

```bash
# Development mode
npm run start:dev

# Production mode
npm run build
npm run start:prod

```

* Backend base URL: `http://localhost:3000/api/v1`
* **Swagger API Documentation:** `http://localhost:3000/api/docs`

---

### 3. Frontend Setup (`todo-app`)

Open a new terminal window, navigate to the frontend directory, and install dependencies:

```bash
cd todo-app
npm install

```

#### Required Environment Variables

Create a `.env` file inside the `todo-app` folder:

```env
VITE_API_BASE_URL="http://localhost:3000/api/v1"

```

#### Run the Frontend Development Server

```bash
npm run dev

```

* Frontend application will run at: `http://localhost:5173`

---

## 🧪 Running Automated Tests

### Backend Tests (`todo-api`)

```bash
cd todo-api

# Run Unit Tests
npm run test

# Run E2E (End-to-End) Tests
npm run test:e2e

```

### Frontend Tests (`todo-app`)

```bash
cd todo-app

# Run component and validation tests
npm run test

```

---

## 📚 API Documentation & Endpoints

All endpoints are versioned under `/api/v1`. Full interactive documentation is available via Swagger at **`http://localhost:3000/api/docs`**.

### Summary of Key Endpoints:

* **Authentication:**
* `POST /api/v1/auth/register` - Register a new user
* `POST /api/v1/auth/login` - User login (Returns JWT Access & Refresh tokens)
* `GET /api/v1/auth/me` - Get current authenticated user profile


* **Todos (Protected - User Specific):**
* `GET /api/v1/todos?page=1&limit=10&search=&status=&sortBy=` - Get paginated, filtered & sorted todos
* `POST /api/v1/todos` - Create a new todo
* `GET /api/v1/todos/:id` - Get a specific todo
* `PATCH /api/v1/todos/:id` - Update/complete a todo
* `DELETE /api/v1/todos/:id` - Delete a todo


* **Categories & Tags:**
* Manage categories (Work, Personal, Study) and multi-tag relations.


* **Admin Area (Role-based):**
* `GET /api/v1/admin/users` - View users and statistics (Requires ADMIN role).





---



```
