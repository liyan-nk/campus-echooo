# Campus Echo — API Reference Guide

All REST API endpoints are prefix-routed under `http://localhost:4000/`.

---

## 1. Authentication Endpoints (`/auth`)

*   **`POST /auth/register`**
    *   Registers a new user, verified profile, and automatic anonymous alias.
    *   Payload: `RegisterDto`
*   **`POST /auth/login`**
    *   Validates password hashes and issues rotating JWT access/refresh tokens.
    *   Payload: `LoginDto`
*   **`POST /auth/refresh`**
    *   Issues new short-lived access tokens using rotating refresh tokens.
    *   Payload: `{ refreshToken: string }`
*   **`GET /auth/profile`** (Protected)
    *   Returns complete active profile info and anonymous alias assets.

---

## 2. Post & Comment Endpoints (`/posts`)

*   **`POST /posts`** (Protected)
    *   Publishes a post (supports text, media attachments, and polls).
*   **`GET /posts/feed`** (Protected)
    *   Retrieves university feed items sorted by algorithmic filters: `new`, `hot`, `trending`, `top`.
*   **`POST /posts/:id/vote`** (Protected)
    *   Casts or toggles a vote (`UPVOTE` or `DOWNVOTE`), updating the author's reputation score.
*   **`POST /posts/poll/vote/:optionId`** (Protected)
    *   Submits an anonymous vote to a specific poll option.
*   **`POST /posts/:id/comments`** (Protected)
    *   Submits comments (supports anonymous toggles and recursive parent threading).
*   **`GET /posts/:id/comments`** (Protected)
    *   Retrieves complete nested comments threads.
*   **`POST /posts/comments/:id/pin`** (Protected; Staff/Admins only)
    *   Pins a comment to the top of the thread.

---

## 3. Campus Activities Endpoints (`/campus`)

*   **`GET /campus/clubs`** (Protected)
    *   Lists all university student organizations.
*   **`POST /campus/clubs`** (Protected; Staff/Admins only)
    *   Establishes a new student club.
*   **`POST /campus/clubs/:id/join`** (Protected)
    *   Joins a student club and links the user to its general chat channel.
*   **`GET /campus/events`** (Protected)
    *   Lists upcoming events.
*   **`POST /campus/events/:id/rsvp`** (Protected)
    *   Toggles attendance RSVPs.
*   **`POST /campus/marketplace`** (Protected)
    *   Submits an item listing to the campus store.

---

## 4. Ticket Support Endpoints (`/tickets`)

*   **`POST /tickets`** (Protected)
    *   Submits a student support ticket.
*   **`GET /tickets/my`** (Protected)
    *   Lists student's own filed support cases.
*   **`GET /tickets`** (Protected; Staff/Admins only)
    *   Lists all open university support tickets.
*   **`PUT /tickets/:id/status`** (Protected; Staff/Admins only)
    *   Transitions ticket status (e.g. `IN_PROGRESS` -> `RESOLVED`) and assigns staff.
*   **`GET /tickets/analytics`** (Protected; Admins only)
    *   Returns university ticket statistics and real-time sentiment indices.
