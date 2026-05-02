# Task

A Vite + React task manager backed by a Node.js API and SQLite.

## Scripts

```bash
npm install
npm run dev
npm run build
npm run start
```

The API listens on port `8003` by default. Set `DATA_DIR` to choose where `task.sqlite` is stored.

## Docker

```bash
docker compose up -d --build
```

The app is exposed at `http://localhost:8003`.

## Tech Stack

- React
- Vite
- lucide-react
- Express
- SQLite
