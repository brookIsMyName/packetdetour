# PacketDetour Frontend

The PacketDetour frontend is a **Next.js + React + TypeScript** application that allows a user to submit a URL, view networking measurements, and browse recent measurement history.

For the complete project overview, see the repository-level `README.md`.

---

## Responsibilities

The frontend:

- accepts a URL from the user
- calls the PacketDetour backend
- displays loading and error states
- renders DNS, TCP, TLS, TTFB, and fetch results
- displays the resolved IP address and protocol information
- loads recent measurement history
- refreshes history after a successful measurement

---

## Data Flow

```text
User input
   ↓
React state
   ↓
handleMeasure()
   ↓
fetch(API /measure)
   ↓
backend measurement
   ↓
JSON result
   ↓
setResult()
   ↓
React re-render

Page load
   ↓
useEffect()
   ↓
GET /history
   ↓
setHistory()
```

---

## Environment

The frontend uses:

```env
NEXT_PUBLIC_API_URL=http://localhost:3000
```

The default local backend is:

```text
http://localhost:3000
```

---

## Development

```bash
npm install
npm run dev
```

The Docker configuration runs the frontend on:

```text
http://localhost:3001
```

---

## Production Build

```bash
npm run build
```

The GitHub Actions workflow runs this build automatically on pushes and pull requests.

---

## Key React Concepts Used

- `useState` for user input, loading state, errors, current measurement, and history
- `useEffect` for loading history when the page first mounts
- reusable metric-card components
- conditional rendering for loading, error, and result states
- `.map()` for converting history data into UI rows

---

## API Integration

Measurement request:

```ts
fetch(
  `${API_URL}/measure?url=${encodeURIComponent(url)}`
)
```

History request:

```ts
fetch(`${API_URL}/history`)
```

`encodeURIComponent()` safely places the submitted URL inside the API query string.

The frontend checks `response.ok` because `fetch()` does not automatically throw for HTTP responses such as `400` or `500`.

---

## Deployment Note

For a public deployment, set `NEXT_PUBLIC_API_URL` to the public backend address at build time.

Example:

```env
NEXT_PUBLIC_API_URL=https://api.example.com
```

The backend's CORS configuration must allow the deployed frontend origin.
