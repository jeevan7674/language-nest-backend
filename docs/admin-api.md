# Language Nest Admin API Documentation

The Language Nest Admin API provides endpoints for authenticating administrators, accessing administrative statistics, and managing club operations including Events, Workshops, Student Members, Academic Year Teams, Announcements, Finances, Form Builder Forms, Study Resources, Photo Galleries, News Articles, and Student Testimonials.

**Base URL**: `http://localhost:5000/api/v1`

---

## Table of Contents
1. [Authentication & Authorization Overview](#authentication--authorization-overview)
2. [Authentication Endpoints (`/auth`)](#authentication-endpoints-auth)
3. [Dashboard Endpoints (`/admin/dashboard`)](#dashboard-endpoints-admindashboard)
4. [Admin Accounts Management (`/admin/admins`)](#admin-accounts-management-adminadmins)
5. [Events Management (`/admin/events`)](#events-management-adminevents)
6. [Workshops Management (`/admin/workshops`)](#workshops-management-adminworkshops)
7. [Members Management (`/admin/members`)](#members-management-adminmembers)
8. [Team Management (`/admin/team`)](#team-management-adminteam)
9. [Announcements Management (`/admin/announcements`)](#announcements-management-adminannouncements)
10. [Finance Management (`/admin/finance`)](#finance-management-adminfinance)
11. [Form Builder & Responses (`/admin/forms`)](#form-builder--responses-adminforms)
12. [Resources Management (`/admin/resources`)](#resources-management-adminresources)
13. [Gallery Management (`/admin/gallery`)](#gallery-management-admingallery)
14. [News Management (`/admin/news`)](#news-management-adminnews)
15. [Stories Management (`/admin/stories`)](#stories-management-adminstories)

---

## Authentication & Authorization Overview

### Authentication Options
All `/api/v1/admin/*` endpoints require an authenticated session. Authentication is verified via either:
1. **HTTP-Only Cookie**: `token` cookie set upon successful login.
2. **Authorization Header**: `Authorization: Bearer <jwt_token>`

### Roles & Access Control
- `Super Admin`: Full universal access to all endpoints, including creating and managing other admins.
- `Event Admin`: Access to `/admin/events`, `/admin/gallery`, `/admin/forms`.
- `Workshop Admin`: Access to `/admin/workshops`, `/admin/resources`, `/admin/forms`.
- `Member Admin`: Access to `/admin/members`, `/admin/team`, `/admin/stories`.
- `Announcement Admin`: Access to `/admin/announcements`, `/admin/news`.
- `Finance Admin`: Access to `/admin/finance`.

---

## Response Format Standard

### Success Response
```json
{
  "success": true,
  "message": "Operation successful",
  "data": { ... }
}
```

### Paginated Collection Response
```json
{
  "success": true,
  "message": "Events fetched successfully",
  "data": [ ... ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 48,
    "totalPages": 5,
    "hasNextPage": true,
    "hasPrevPage": false
  }
}
```

### Error Response
```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    { "field": "email", "message": "Email is required" }
  ]
}
```

---

## Authentication Endpoints (`/auth`)

### 1. Admin Login
- **Method**: `POST`
- **URL**: `/api/v1/auth/login`
- **Auth Required**: No
- **Request Body**:
```json
{
  "email": "admin@languagenest.com",
  "password": "password"
}
```
- **Success Response (200)**:
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "admin": {
      "_id": "673c...",
      "name": "Dr. Sarah Johnson",
      "email": "admin@languagenest.com",
      "roles": ["Super Admin"],
      "status": "active",
      "lastActive": "2025-12-01T10:00:00.000Z"
    },
    "token": "eyJhbGciOi..."
  }
}
```

### 2. Admin Logout
- **Method**: `POST`
- **URL**: `/api/v1/auth/logout`
- **Auth Required**: No
- **Success Response (200)**:
```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

### 3. Get Current Admin Profile
- **Method**: `GET`
- **URL**: `/api/v1/auth/me`
- **Auth Required**: Yes
- **Success Response (200)**:
```json
{
  "success": true,
  "message": "Current admin fetched successfully",
  "data": {
    "admin": {
      "_id": "673c...",
      "name": "Dr. Sarah Johnson",
      "email": "admin@languagenest.com",
      "roles": ["Super Admin"],
      "status": "active"
    }
  }
}
```

---

## Dashboard Endpoints (`/admin/dashboard`)

### 1. Get Dashboard Statistics
- **Method**: `GET`
- **URL**: `/api/v1/admin/dashboard`
- **Auth Required**: Yes
- **Success Response (200)**:
```json
{
  "success": true,
  "message": "Dashboard statistics fetched successfully",
  "data": {
    "metrics": {
      "members": { "total": 152, "active": 140 },
      "events": { "total": 48, "upcoming": 6 },
      "workshops": { "total": 24, "ongoing": 3 },
      "announcements": { "total": 18, "pinned": 2 },
      "admins": { "active": 5 },
      "finance": { "income": 280000, "expenses": 145000, "balance": 135000 }
    },
    "upcomingEvents": [ ... ],
    "categoryDistribution": [
      { "name": "Conversation", "count": 18 },
      { "name": "Cultural", "count": 22 },
      { "name": "Workshop", "count": 8 }
    ]
  }
}
```

---

## Events Management (`/admin/events`)

### 1. List Events
- **Method**: `GET`
- **URL**: `/api/v1/admin/events`
- **Query Parameters**:
  - `page` (number, default: 1)
  - `limit` (number, default: 10)
  - `search` (string, searches title, venue, description)
  - `status` (`all` | `upcoming` | `ongoing` | `completed` | `cancelled` | `scheduled`)
  - `type` (`all` | `Conversation` | `Cultural` | `Workshop` | `Other`)
- **Success Response (200)**: Paginated collection of event items.

### 2. Create Event
- **Method**: `POST`
- **URL**: `/api/v1/admin/events`
- **Request Body**:
```json
{
  "title": "Spanish Conversation Night",
  "type": "Conversation",
  "description": "Interactive Spanish speaking circle for learners.",
  "date": "2025-12-08",
  "time": "6:00 PM",
  "venue": "Room 203, Language Building",
  "capacity": 30,
  "status": "upcoming",
  "poster": "https://example.com/poster.jpg",
  "registrationForm": "673c..."
}
```
- **Success Response (201)**: Created event object.

### 3. Get Event by ID
- **Method**: `GET`
- **URL**: `/api/v1/admin/events/:id`

### 4. Update Event
- **Method**: `PUT`
- **URL**: `/api/v1/admin/events/:id`
- **Request Body**: Partial or complete update fields.

### 5. Delete Event
- **Method**: `DELETE`
- **URL**: `/api/v1/admin/events/:id`

---

## Workshops Management (`/admin/workshops`)

- `GET /api/v1/admin/workshops` (Query: `page`, `limit`, `search`, `language`, `status`)
- `POST /api/v1/admin/workshops` (Body: `title`, `language`, `trainer`, `duration`, `sessions`, `maxParticipants`, `status`, `description`, `poster`)
- `GET /api/v1/admin/workshops/:id`
- `PUT /api/v1/admin/workshops/:id`
- `DELETE /api/v1/admin/workshops/:id`

---

## Members Management (`/admin/members`)

- `GET /api/v1/admin/members` (Query: `page`, `limit`, `search`, `department`, `status`, `paymentMode`)
- `POST /api/v1/admin/members` (Body: `name`, `email`, `phone`, `department`, `year`, `paymentMode`, `transactionId`, `image`)
- `GET /api/v1/admin/members/:id`
- `PUT /api/v1/admin/members/:id`
- `DELETE /api/v1/admin/members/:id`

---

## Team Management (`/admin/team`)

### Academic Teams CRUD
- `GET /api/v1/admin/team` (Query: `search`, `isAlumni` — lists teams and supports filtering by search term across years and member names)
- `POST /api/v1/admin/team` (Body: `year`, `isAlumni`, `members` — creates a new academic year team)
- `GET /api/v1/admin/team/:id` (Gets academic team by ID)
- `PUT /api/v1/admin/team/:id` (Body: `year`, `isAlumni`, `members` — updates academic team)
- `DELETE /api/v1/admin/team/:id` (Deletes academic team)

### Individual Team Members CRUD
- `GET /api/v1/admin/team/:id/members/:memberId` (Gets single team member profile)
- `POST /api/v1/admin/team/:id/members` (Body: `name`, `role`, `email`, `avatar`, `department`, `bio`, `displayOrder`, `isActive` — adds a new member)
- `PUT /api/v1/admin/team/:id/members/:memberId` (Body: partial or complete member fields — updates member profile)
- `DELETE /api/v1/admin/team/:id/members/:memberId` (Removes member from the team)

---

## Announcements Management (`/admin/announcements`)

- `GET /api/v1/admin/announcements` (Query: `page`, `limit`, `search`, `category`, `target`, `isPinned`)
- `POST /api/v1/admin/announcements` (Body: `title`, `message`, `category`, `target`, `isPinned`, `image`)
- `GET /api/v1/admin/announcements/:id`
- `PUT /api/v1/admin/announcements/:id`
- `PATCH /api/v1/admin/announcements/:id/pin` (Toggles pinned state)
- `DELETE /api/v1/admin/announcements/:id`

---

## Finance Management (`/admin/finance`)

- `GET /api/v1/admin/finance/summary` (Returns `{ income, expenses, balance }`)
- `GET /api/v1/admin/finance/transactions` (Query: `page`, `limit`, `search`, `type`, `category`)
- `POST /api/v1/admin/finance/transactions` (Body: `title`, `amount`, `type`, `category`, `date`, `paymentMode`, `event`, `workshop`, `reference`, `billImage`)
- `GET /api/v1/admin/finance/transactions/:id`
- `PUT /api/v1/admin/finance/transactions/:id`
- `DELETE /api/v1/admin/finance/transactions/:id`

---

## Form Builder & Responses (`/admin/forms`)

- `GET /api/v1/admin/forms` (Query: `page`, `limit`, `search`, `status`)
- `POST /api/v1/admin/forms` (Body: `title`, `description`, `status`, `fields`, `settings`)
- `GET /api/v1/admin/forms/:id`
- `PUT /api/v1/admin/forms/:id`
- `DELETE /api/v1/admin/forms/:id`
- `GET /api/v1/admin/forms/:id/responses` (Query: `page`, `limit`)
- `DELETE /api/v1/admin/forms/responses/:id`

---

## Resources, Gallery, News & Stories

### Resources (`/admin/resources`)
- `GET`, `POST`, `GET /:id`, `PUT /:id`, `DELETE /:id`

### Gallery (`/admin/gallery`)
- `GET`, `POST`, `GET /:id`, `PUT /:id`, `DELETE /:id`

### News Articles (`/admin/news`)
- `GET`, `POST`, `GET /:id`, `PUT /:id`, `DELETE /:id`

### Stories (`/admin/stories`)
- `GET`, `POST`, `GET /:id`, `PUT /:id`, `DELETE /:id`
