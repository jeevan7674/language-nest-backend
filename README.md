# Language Nest Backend

Complete Backend REST API for the **Language Nest** platform built with Node.js, Express.js, MongoDB, and Mongoose following the MVC (Model-View-Controller) design pattern.

---

## Tech Stack

- **Runtime:** Node.js (>=18)
- **Framework:** Express.js
- **Database:** MongoDB
- **ODM:** Mongoose
- **Authentication:** JWT (JSON Web Tokens) & HTTP-Only Cookies + bcrypt password hashing
- **Security & Utilities:** Helmet, CORS, Morgan, Cookie-Parser, Dotenv

---

## Architecture

```text
language-nest-backend/
│
├── docs/
│   └── admin-api.md        # Comprehensive Admin API documentation
│
├── src/
│   ├── config/             # Application, DB, and environment configurations
│   │   ├── db.js           # Mongoose connection & lifecycle events
│   │   └── env.js          # Environment variable parser & validator
│   │
│   ├── controllers/        # Request handling and HTTP response orchestration
│   │   ├── admin.controller.js
│   │   ├── announcement.controller.js
│   │   ├── auth.controller.js
│   │   ├── content.controller.js
│   │   ├── dashboard.controller.js
│   │   ├── event.controller.js
│   │   ├── finance.controller.js
│   │   ├── form.controller.js
│   │   ├── health.controller.js
│   │   ├── member.controller.js
│   │   ├── team.controller.js
│   │   └── workshop.controller.js
│   │
│   ├── models/             # Mongoose schemas and data definitions
│   │   ├── Admin.js
│   │   ├── Announcement.js
│   │   ├── Event.js
│   │   ├── Finance.js
│   │   ├── Form.js
│   │   ├── FormResponse.js
│   │   ├── GalleryAlbum.js
│   │   ├── Member.js
│   │   ├── NewsArticle.js
│   │   ├── Resource.js
│   │   ├── Story.js
│   │   ├── Team.js
│   │   └── Workshop.js
│   │
│   ├── routes/             # API routing definitions
│   │   ├── index.js        # Root v1 API router
│   │   ├── auth.routes.js  # Auth routes (/api/v1/auth/*)
│   │   ├── health.routes.js# Health check
│   │   └── admin/          # Protected admin routes (/api/v1/admin/*)
│   │       ├── admin.routes.js
│   │       ├── announcement.routes.js
│   │       ├── dashboard.routes.js
│   │       ├── event.routes.js
│   │       ├── finance.routes.js
│   │       ├── form.routes.js
│   │       ├── gallery.routes.js
│   │       ├── member.routes.js
│   │       ├── news.routes.js
│   │       ├── resource.routes.js
│   │       ├── story.routes.js
│   │       ├── team.routes.js
│   │       └── workshop.routes.js
│   │
│   ├── middleware/         # Custom Express middlewares
│   │   ├── auth.middleware.js      # JWT authentication & session verification
│   │   ├── role.middleware.js      # Role-based access control (RBAC)
│   │   ├── error.middleware.js     # Centralized error handler
│   │   ├── notFound.middleware.js  # 404 handler
│   │   └── validation.middleware.js# Schema validation runner
│   │
│   ├── services/           # Reusable business logic layer
│   │   ├── admin.service.js
│   │   ├── announcement.service.js
│   │   ├── auth.service.js
│   │   ├── content.service.js
│   │   ├── dashboard.service.js
│   │   ├── event.service.js
│   │   ├── finance.service.js
│   │   ├── form.service.js
│   │   ├── member.service.js
│   │   ├── team.service.js
│   │   └── workshop.service.js
│   │
│   ├── validators/         # Input validation schemas
│   │   ├── admin.validator.js
│   │   ├── announcement.validator.js
│   │   ├── auth.validator.js
│   │   ├── content.validator.js
│   │   ├── event.validator.js
│   │   ├── finance.validator.js
│   │   ├── form.validator.js
│   │   ├── member.validator.js
│   │   ├── team.validator.js
│   │   └── workshop.validator.js
│   │
│   ├── utils/              # Utility helpers
│   │   ├── pagination.js   # Pagination helpers and metadata formatters
│   │   ├── slug.js         # Unique slug generator
│   │   └── token.js        # JWT generation, verification, and cookie setters
│   │
│   ├── seed/
│   │   └── seed.js         # Development seed script
│   │
│   ├── scripts/
│   │   └── test-api.js     # Automated API test suite
│   │
│   ├── app.js              # Express application setup and middleware pipeline
│   └── server.js           # Server startup, DB connection, and graceful shutdown
│
├── .env                    # Environment variables (local, git-ignored)
├── .env.example            # Example environment configuration
├── .gitignore
├── package.json
└── README.md
```

---

## Installation

1. Navigate to the backend directory:
   ```bash
   cd language-nest-backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

---

## Environment Configuration

Copy `.env.example` to create a `.env` file:

```bash
cp .env.example .env
```

### Environment Variables

| Variable | Default Value | Description |
| :--- | :--- | :--- |
| `PORT` | `5000` | Port number for the HTTP server |
| `NODE_ENV` | `development` | Environment mode (`development` / `production`) |
| `MONGODB_URI` | `mongodb://localhost:27017/languagenest` | MongoDB connection string |
| `CLIENT_URL` | `http://localhost:5173,http://localhost:8080` | Allowed origin(s) for the public frontend app |
| `ADMIN_URL` | `http://localhost:5174,http://localhost:8080` | Allowed origin(s) for the admin portal |
| `JWT_SECRET` | `language_nest_dev_jwt_secret_key_2025` | Secret key used for signing JWTs |
| `JWT_EXPIRES_IN` | `7d` | JWT token expiration duration |
| `COOKIE_SECURE` | `false` | Set to `true` in HTTPS production environments |
| `COOKIE_SAME_SITE` | `lax` | SameSite cookie attribute |

---

## Development Seed Data

To populate development seed data (Admin users, Events, Workshops, Members, Teams, Announcements, Finance Transactions, Form Builder Forms, Resources, Gallery Albums, News, Stories):

```bash
npm run seed
```

### Default Super Admin Credentials:
- **Email:** `admin@languagenest.com`
- **Password:** `password`

---

## Running the Application

### Development Mode (with hot-reload)
```bash
npm run dev
```

### Production Mode
```bash
npm start
```

---

## Running Automated API Tests

To execute the automated test suite testing health, authentication, RBAC, CRUD operations, pagination, filtering, and error handling:

```bash
npm run test:api
```

---

## API Documentation

For the full endpoint reference, parameters, request payloads, and response structures, see:
- [Admin API Documentation](docs/admin-api.md)
