# PacketDetour

[![PacketDetour CI](https://github.com/brookIsMyName/packetdetour/actions/workflows/ci.yml/badge.svg)](https://github.com/brookIsMyName/packetdetour/actions/workflows/ci.yml)

**PacketDetour** is a full-stack network observability application that makes the stages behind a web request visible.

Instead of treating an HTTP request as one timing number, PacketDetour measures several parts of the connection independently — including DNS resolution, TCP connection establishment, TLS setup, Time To First Byte (TTFB), and overall fetch timing — then stores the results in PostgreSQL and presents them through a Next.js dashboard.

> Built as a learn-by-doing systems project to understand what actually happens beneath `fetch()` and how networking, backend APIs, databases, frontend state, testing, containers, and CI fit together.

---

## Highlights

- Measures **DNS lookup time** and resolved IP address
- Measures **TCP connection time**
- Measures **TLS setup time** for HTTPS destinations
- Measures **Time To First Byte (TTFB)**
- Measures overall HTTP fetch timing
- Supports HTTP and HTTPS URL validation
- Includes explicit TCP, TLS, and HTTP timeout handling
- Persists successful measurements in **PostgreSQL**
- Displays recent measurement history in the frontend
- Uses a typed **Express + TypeScript REST API**
- Includes automated API tests with **Vitest + Supertest**
- Runs frontend, backend, and database with **Docker Compose**
- Uses **GitHub Actions CI** to build and test the project automatically

---

## Architecture

```mermaid
flowchart LR
    U[User] --> W[Next.js Frontend]
    W -->|GET /measure| A[Express API]
    W -->|GET /history| A
    A --> V[Validation]
    V --> M[Measurement Orchestrator]
    M --> DNS[DNS Probe]
    M --> TCP[TCP Probe]
    M --> TLS[TLS Probe]
    M --> TTFB[TTFB Probe]
    M --> HTTP[Fetch Probe]
    M --> DB[(PostgreSQL)]
    DB --> A
    A --> W
```

### Request flow

```text
Browser
  ↓
Next.js UI
  ↓
GET /measure?url=...
  ↓
Express validation
  ↓
measureWebsite()
  ├── DNS measurement
  ├── TCP measurement
  ├── TLS measurement (HTTPS)
  ├── TTFB measurement
  └── fetch timing
  ↓
PostgreSQL persistence
  ↓
JSON response
  ↓
React state update
  ↓
Result cards + measurement history
```

---

## Tech Stack

### Frontend
- Next.js
- React
- TypeScript
- Tailwind CSS

### Backend
- Node.js
- Express
- TypeScript

### Networking
- Node DNS APIs
- TCP sockets
- TLS sockets
- Node HTTP/HTTPS clients
- Fetch API

### Data
- PostgreSQL
- `pg` / node-postgres

### Testing & DevOps
- Vitest
- Supertest
- Docker
- Docker Compose
- GitHub Actions
- Git

---

## Quick Start

### Prerequisites

You only need:

- Git
- Docker
- Docker Compose

### 1. Clone the repository

```bash
git clone https://github.com/brookIsMyName/packetdetour.git
cd packetdetour
```

### 2. Start the complete application

```bash
docker compose up --build
```

### 3. Open PacketDetour

Frontend:

```text
http://localhost:3001
```

API:

```text
http://localhost:3000
```

That starts the Next.js frontend, Express backend, and PostgreSQL database in separate containers on the same Docker network.

---

## API

### Health check

```http
GET /health
```

Example response:

```json
{
  "status": "ok"
}
```

### Measure a URL

```http
GET /measure?url=https://example.com
```

Example response shape:

```json
{
  "id": 1,
  "url": "https://example.com",
  "hostname": "example.com",
  "protocol": "https:",
  "ipAddress": "93.184.216.34",
  "dnsTimeMs": 20,
  "tcpTimeMs": 80,
  "tlsTimeMs": 150,
  "ttfbMs": 300,
  "durationMs": 500,
  "measuredAt": "2026-10-06T09:00:00.000Z",
  "summary": {
    "totalNetworkSetupMs": 250,
    "secure": true
  }
}
```

> Timing values vary by network, resolver, destination, caching, routing, and server conditions.

### Measurement history

```http
GET /history
```

Returns the most recent persisted measurements from PostgreSQL.

---

## Important Measurement Note

PacketDetour currently performs several measurements as **independent probes**.

DNS, TCP, TLS, TTFB, and fetch timing are not all timestamps taken from one reused connection. Because of that:

```text
dnsTimeMs + tcpTimeMs + tlsTimeMs + ttfbMs
```

should **not** be interpreted as an exact single-request waterfall or expected to equal `durationMs`.

The current version focuses on exposing and understanding each networking stage independently. A future version can instrument one connection/request lifecycle to produce a true phase-by-phase waterfall.

---

## Reliability & Error Handling

PacketDetour includes explicit safeguards around network operations:

- Invalid URLs are rejected before measurement
- Only HTTP and HTTPS URLs are accepted
- TCP connections time out instead of hanging indefinitely
- TLS handshakes time out instead of hanging indefinitely
- HTTP fetches use an abort timeout
- Response bodies are cancelled after the required timing information is captured
- Backend failures return structured HTTP errors

---

## Database

Measurements are stored in PostgreSQL.

The schema includes:

```text
id
url
hostname
protocol
ip_address
dns_time_ms
tcp_time_ms
tls_time_ms
ttfb_ms
duration_ms
total_network_setup_ms
secure
measured_at
```

Docker initializes the schema automatically from:

```text
database/init.sql
```

A named Docker volume keeps history persistent across container restarts.

---

## Testing

Backend API tests use **Vitest** and **Supertest**.

Run them with:

```bash
cd server
npm install
npm test
```

Current tests cover:

- health endpoint
- missing URL validation
- malformed URL validation
- unsupported protocol validation

The production TypeScript build excludes test files, while Vitest is restricted to source tests. This prevents compiled copies in `dist/` from being discovered during CI.

---

## Continuous Integration

Every push and pull request triggers the GitHub Actions pipeline.

The CI workflow:

1. installs backend dependencies
2. builds the TypeScript backend
3. runs backend source tests
4. installs frontend dependencies
5. builds the Next.js frontend
6. validates and builds the Docker setup after application checks succeed

This ensures committed code remains buildable and tested.

---

## Project Structure

```text
packetdetour/
├── .github/
│   └── workflows/
│       └── ci.yml
├── database/
│   └── init.sql
├── server/
│   ├── src/
│   │   ├── database/
│   │   ├── services/
│   │   ├── tests/
│   │   ├── app.ts
│   │   └── index.ts
│   ├── Dockerfile
│   ├── package.json
│   └── tsconfig.json
├── web/
│   ├── src/
│   │   └── app/
│   ├── Dockerfile
│   └── package.json
└── docker-compose.yml
```

---

## Running Without Docker

### Backend

```bash
cd server
npm install
npm run dev
```

Example development environment:

```env
DATABASE_URL=postgresql://packetdetour_user:packetdetour_dev@localhost:5432/packetdetour
CLIENT_ORIGIN=http://localhost:3001
PORT=3000
```

### Frontend

```bash
cd web
npm install
npm run dev
```

The frontend uses:

```env
NEXT_PUBLIC_API_URL=http://localhost:3000
```

---

## What I Learned Building PacketDetour

PacketDetour started as a simple question:

> What actually happens between entering a URL and receiving a response?

Building it required going below the usual high-level web-development abstractions and working directly with networking concepts such as DNS, TCP sockets, TLS, HTTP timing, asynchronous events, Promises, and connection failure handling.

It also became a full-stack engineering exercise involving:

- typed backend API design
- frontend/backend communication
- CORS
- SQL persistence
- connection pooling
- automated testing
- environment-based configuration
- Docker networking and volumes
- CI pipelines

The project was built incrementally, with each new technology introduced to solve a concrete problem in the system.

---

## Roadmap

Potential future improvements:

- true single-request timing waterfall
- charts comparing repeated measurements
- filtering and searching measurement history
- domain comparison
- geographic / ASN information for resolved IPs
- authentication and per-user history
- rate limiting
- production SSRF protections
- public deployment
- JSON/CSV exports
- deeper observability and structured logging

---

## Security Note

PacketDetour accepts user-supplied URLs and initiates outbound network requests.

Before exposing the API publicly, production hardening should include:

- blocking loopback, private, link-local, multicast, and cloud-metadata address ranges
- validating resolved IP addresses before connecting
- protection against DNS rebinding
- request rate limiting
- strict CORS configuration
- request-size/input-length limits
- HTTPS
- production secrets managed outside the repository

---

## Author

**Biruk Alemayehu**

Software Engineering student interested in full-stack systems, networking, backend engineering, automation, and learning by building.

- GitHub: [brookIsMyName](https://github.com/brookIsMyName)
- Repository: [PacketDetour](https://github.com/brookIsMyName/packetdetour)

---

## License

Add a license before public distribution if you want others to reuse the project.
