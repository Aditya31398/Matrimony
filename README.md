# SoulSync — Premium Matrimony Platform

A full-stack matrimony application built from the **Stitch Vibrant Modern Matrimony** design template.

**Stack:** React 18 + Vite + Tailwind CSS + Framer Motion · Java 21 + Spring Boot 3.2 + MySQL 8

---

## Project Structure

```
Matrimony/
├── frontend/          React + Vite application
├── backend/           Spring Boot Maven project
├── database/          SQL schema + seed data
└── README.md
```

---

## Prerequisites

| Tool | Minimum Version |
|------|----------------|
| Node.js | 18+ |
| npm | 9+ |
| Java JDK | 21 |
| Maven | 3.9+ |
| MySQL | 8.0+ |

---

## 1 — Database Setup

```bash
# Log into MySQL
mysql -u root -p

# Run schema
mysql -u root -p < database/schema.sql

# Run seed data
mysql -u root -p soulsync < database/data.sql
```

Or from the MySQL prompt:

```sql
SOURCE /absolute/path/to/database/schema.sql;
SOURCE /absolute/path/to/database/data.sql;
```

---

## 2 — Backend (Spring Boot)

### Configure database credentials

Edit `backend/src/main/resources/application.properties`:

```properties
spring.datasource.url=jdbc:mysql://localhost:3306/soulsync?...
spring.datasource.username=YOUR_MYSQL_USERNAME
spring.datasource.password=YOUR_MYSQL_PASSWORD
```

### Run

```bash
cd backend
mvn spring-boot:run
```

The API starts on **http://localhost:8080**.

### Verify

```bash
curl http://localhost:8080/api/auth/health
# → {"status":"ok","service":"SoulSync API"}

curl http://localhost:8080/api/profiles?page=0&size=5
curl http://localhost:8080/api/stories
```

---

## 3 — Frontend (React + Vite)

```bash
cd frontend
npm install
npm run dev
```

The app starts on **http://localhost:5173**.

> The Vite dev server proxies `/api/*` → `http://localhost:8080` automatically (configured in `vite.config.js`).

### Environment variables

The `.env` file is already pre-configured:

```env
VITE_API_BASE_URL=http://localhost:8080
```

---

## API Reference

### Profiles

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/profiles` | List all profiles (paginated) |
| `GET` | `/api/profiles/{id}` | Get profile by ID |
| `GET` | `/api/profiles/top-picks` | Get curated top picks |
| `GET` | `/api/profiles/search` | Search profiles (city, education, gender) |
| `POST` | `/api/profiles` | Register a new profile |

### Matches

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/matches` | Get accepted matches |
| `GET` | `/api/matches/interested` | Get pending interest requests |
| `POST` | `/api/matches/{profileId}/connect` | Send a connection request |
| `POST` | `/api/matches/{profileId}/shortlist` | Shortlist a profile |
| `PUT` | `/api/matches/{matchId}/accept` | Accept a match |
| `PUT` | `/api/matches/{matchId}/decline` | Decline a match |

### Messages

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/messages/conversations` | List conversations |
| `GET` | `/api/messages/conversations/{id}` | Get messages in a conversation |
| `POST` | `/api/messages/conversations/{id}` | Send a message |
| `GET` | `/api/messages/conversations/{id}/icebreakers` | Get guided icebreakers |
| `POST` | `/api/messages/conversations/start/{profileId}` | Start or get a conversation |

### Stories

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/stories` | List all success stories |
| `GET` | `/api/stories/{id}` | Get a story by ID |

### Auth

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/auth/login` | Login (returns dev token) |
| `GET` | `/api/auth/health` | Health check |

---

## Pages & Routes

| Route | Page | Description |
|-------|------|-------------|
| `/` | HomePage | Landing page with hero, search, how-it-works, stories, CTA |
| `/discover` | DiscoverPage | Profile grid with sidebar filters & filter chips |
| `/dashboard` | DashboardPage | Top picks, interested-in-you, recent messages |
| `/profile/:id` | ProfileDetailPage | Full profile detail + floating action bar |
| `/register` | RegisterPage | 4-step conversational registration form |
| `/messages` | MessagesPage | Chat interface with icebreakers |
| `/messages/:id` | MessagesPage | Specific conversation |

---

## Seed Users (for testing)

All seed users have the password: **`Test@1234`**

| Name | Email | City |
|------|-------|------|
| Ananya Sharma | ananya.sharma@email.com | Mumbai |
| Rohan Mehta | rohan.mehta@email.com | Bangalore |
| Priya Nair | priya.nair@email.com | Delhi |
| Arjun Kapoor | arjun.kapoor@email.com | Pune |
| Meera Krishnan | meera.krishnan@email.com | Chennai |

---

## Architecture Notes

### Frontend

- **React Query** manages all server state (caching, background refresh, loading/error states)
- **Framer Motion** handles page transitions, card hovers, stagger animations
- **Axios** is centralized in `src/services/api.js` with request/response interceptors
- All pages degrade gracefully to **fallback data** when the backend is unavailable
- **Vite proxy** (`/api → localhost:8080`) eliminates CORS issues in development

### Backend

- **DTOs** (ProfileDTO, MatchDTO, etc.) are used exclusively in API responses — JPA entities never leak
- **MatchController** and **MessageController** use a hardcoded `CURRENT_PROFILE_ID = 1L`; replace with JWT principal in production
- **Spring Security** is configured in permissive mode for development — all `/api/**` routes are public
- **Global exception handler** returns structured JSON for all error types
- **HikariCP** connection pool is pre-configured with sensible defaults

### Database

- `interests`, `lifestyle`, and `looking_for` are stored as comma/newline-separated text for simplicity; migrate to a join table for production scale
- All foreign keys have `ON DELETE CASCADE` or `ON DELETE SET NULL` to maintain referential integrity

---

## Production Checklist

- [ ] Replace `CURRENT_PROFILE_ID = 1L` with JWT-based authentication
- [ ] Add JWT library (e.g., `jjwt` or `spring-security-oauth2`) to `pom.xml`
- [ ] Set `spring.jpa.hibernate.ddl-auto=none` and use Flyway/Liquibase for migrations
- [ ] Move `interests`, `lifestyle` fields to normalized join tables
- [ ] Add file upload endpoint for profile photos (S3 / Cloudinary)
- [ ] Enable HTTPS and update CORS allowed origins
- [ ] Add rate limiting (e.g., Bucket4j) to the API
- [ ] Replace the dev password in `application.properties` with environment variables

---

## Design System

Based on the **Vivid Union / Neo-Organic Premium** Stitch design system:

- **Primary:** `#ae3115` (Deep Coral)
- **Primary Container:** `#ff6b4a` (Vibrant Orange)
- **Font:** [Plus Jakarta Sans](https://fonts.google.com/specimen/Plus+Jakarta+Sans)
- **Border radius:** `24px` – `48px` (organic, high-circularity)
- **Shadows:** Ambient, diffused (`0 10px 30px rgba(0,0,0,0.04)`)
- **Glass:** `backdrop-blur-xl` + `bg-white/80` on nav and overlays
