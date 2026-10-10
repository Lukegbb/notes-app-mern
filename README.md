# Notes App (MERN)

![CI](https://github.com/Lukegbb/notes-app-mern/actions/workflows/ci.yml/badge.svg)

A full stack notes application built with **MongoDB, Express, React and Node.js**. Users sign up, log in with **JWT**, and create, search, tag, pin and delete their own notes.

## Features

- **Authentication** – register / login with hashed passwords (bcrypt) and JWT
- **Notes CRUD** – each user can only access their own notes
- **Search and tags** – `GET /api/notes?search=docker&tag=dev`
- **Pinned notes** shown first, with pagination on the API
- **React front end** (Vite) talking to the REST API
- **Automated tests** with Jest + Supertest against a real MongoDB in GitHub Actions
- **Docker Compose** for the API and database

## Tech stack

**Back end:** Node.js 20 · Express · Mongoose · JWT · bcrypt · Helmet
**Front end:** React 18 · Vite
**Database:** MongoDB
**Tooling:** Jest · Supertest · Docker · GitHub Actions

## Getting started

### 1. API + database with Docker

```bash
git clone https://github.com/Lukegbb/notes-app-mern.git
cd notes-app-mern
docker compose up --build
```

The API runs at http://localhost:5000.

### 2. Front end

```bash
cd client
npm install
npm run dev
```

Open http://localhost:5173 (requests to `/api` are proxied to the API).

### Running the API without Docker

```bash
cd server
cp .env.example .env
npm install
npm run dev
```

### Tests

```bash
cd server
npm test   # requires MongoDB on localhost:27017
```

## API endpoints

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/auth/register` | Create an account, returns a JWT |
| POST | `/api/auth/login` | Log in, returns a JWT |
| GET | `/api/notes` | List notes (`search`, `tag`, `page`, `limit`) |
| POST | `/api/notes` | Create a note |
| GET | `/api/notes/:id` | Get a note |
| PATCH | `/api/notes/:id` | Update a note |
| DELETE | `/api/notes/:id` | Delete a note |

## Project structure

```
├── server/
│   ├── src/
│   │   ├── app.js            # Express app (middleware, routes, error handling)
│   │   ├── server.js         # DB connection + HTTP server
│   │   ├── models/           # User and Note schemas
│   │   ├── routes/           # auth and notes routes
│   │   └── middleware/       # JWT authentication
│   └── tests/                # Jest + Supertest
├── client/
│   └── src/                  # React components and API client
├── docker-compose.yml
└── .github/workflows/ci.yml
```
