# PacketDetour Backend

The PacketDetour backend is an **Express + TypeScript** API responsible for URL validation, network measurements, PostgreSQL persistence, and measurement history.

For the complete project overview, see the repository-level `README.md`.

---

## Responsibilities

The backend:

- validates measurement requests
- accepts only HTTP/HTTPS URLs
- measures DNS resolution
- measures TCP connection establishment
- measures TLS setup for HTTPS
- measures Time To First Byte (TTFB)
- measures overall fetch timing
- handles connection and request timeouts
- persists successful results in PostgreSQL
- exposes measurement history
- provides automated API tests

---

## Main Endpoints

### `GET /health`

```json
{
  "status": "ok"
}
```

### `GET /measure?url=https://example.com`

Runs the measurement pipeline and saves the successful result.

### `GET /history`

Returns recent persisted measurements.

---

## Service Design

```text
Express route
   ↓
request validation
   ↓
measureWebsite()
   ├── measureDns()
   ├── measureTcp()
   ├── measureTls()
   ├── measureTtfb()
   └── fetch timing
   ↓
saveMeasurement()
   ↓
PostgreSQL
```

`measureWebsite()` acts as the orchestration layer while the individual services focus on one networking responsibility each.

---

## Environment Variables

Create a local `.env` file based on `.env.example`.

```env
DATABASE_URL=postgresql://packetdetour_user:packetdetour_dev@localhost:5432/packetdetour
CLIENT_ORIGIN=http://localhost:3001
PORT=3000
```

Never commit real production credentials.

---

## Development

```bash
npm install
npm run dev
```

Default API:

```text
http://localhost:3000
```

---

## Build

```bash
npm run build
```

TypeScript source code is compiled to `dist/`.

Test files are excluded from the production build.

---

## Production Start

```bash
npm start
```

This runs the compiled JavaScript from `dist/`.

---

## Tests

```bash
npm test
```

Vitest is intentionally restricted to source tests:

```text
vitest run src
```

This avoids discovering compiled test copies inside `dist/`.

Current tests cover:

- health endpoint
- missing URL
- malformed URL
- unsupported protocol

---

## Networking Notes

The current measurement phases are independent probes rather than one reused request lifecycle.

This makes the individual stages easy to understand and test, but the values should not be treated as one exact browser-style waterfall.

The TCP and TLS services include explicit 10-second failure timeouts so unreachable destinations do not leave unresolved Promises indefinitely.

---

## Database

Database access uses a PostgreSQL connection pool through `pg`.

Successful measurements are inserted using parameterized SQL queries instead of direct string interpolation.

That keeps user-controlled values separate from SQL syntax.

---

## Production Security

Before deploying the measurement API publicly, add strong SSRF defenses.

At minimum:

- reject private and loopback destinations
- reject link-local and metadata addresses
- validate the resolved destination before opening sockets
- account for DNS rebinding
- rate-limit measurement requests
- restrict CORS to the real frontend origin
- use HTTPS
