# Local Testing Guide

## Prerequisites

- **Go** 1.21+
- **Node.js** 20+
- **Docker Desktop** (for Option A)
- **curl** (for sending test requests)

---

## Option A — Docker Compose (Recommended)

```bash
docker-compose up --build
```

Both services start automatically. `api-go` waits for `api-node` to pass its health check before starting.

---

## Option B — Local Without Docker

**Terminal 1 — Node.js API:**
```bash
cd api-node
npm install
npm run dev
```

**Terminal 2 — Go API:**
```bash
cd api-go
go mod tidy
NODE_API_URL=http://localhost:3000 go run .
```

---

## Test Requests

### Go API — QR Factorization (primary endpoint)

```bash
curl -X POST http://localhost:8080/qr-factorization \
  -H "Content-Type: application/json" \
  -d '{"matrix": [[12,-51,4],[6,167,-68],[-4,24,-41]]}'
```

### Node.js API — Statistics in isolation

```bash
curl -X POST http://localhost:3000/statistics \
  -H "Content-Type: application/json" \
  -d '{"Q": [[1,0],[0,1]], "R": [[2,3],[0,4]]}'
```

Expected response:
```json
{
  "max": 4,
  "min": 0,
  "average": 1.25,
  "sum": 10,
  "isDiagonal": { "Q": true, "R": false }
}
```

### Health Check

```bash
curl http://localhost:3000/health
```

---

## Expected Response Shape

`POST /qr-factorization` returns:

```json
{
  "Q": [[...], [...], [...]],
  "R": [[...], [...], [...]],
  "statistics": {
    "max": <number>,
    "min": <number>,
    "average": <number>,
    "sum": <number>,
    "isDiagonal": {
      "Q": <boolean>,
      "R": <boolean>
    }
  }
}
```

- `Q` is an m×m orthogonal matrix
- `R` is an m×n upper triangular matrix

---

## Known Limitations

- **m ≥ n required**: The input matrix must have at least as many rows as columns. QR factorization via gonum requires this constraint. Passing a "wide" matrix (e.g., 2×3) will return a `422 Unprocessable Entity` error.
- If `api-node` is unreachable, `api-go` returns `502 Bad Gateway`.
