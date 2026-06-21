# Local Docker (Colima)

Use **Colima** instead of Docker Desktop on macOS.

```bash
brew install colima docker docker-compose
colima start --cpu 2 --memory 4
docker context use colima
```

From repo root:

```bash
pnpm colima:start
pnpm docker:dev
```

Compose file: `docker-compose.yml` — Postgres 16 + Redis 7.

Stop:

```bash
pnpm docker:down
pnpm colima:stop   # optional — stops VM to free RAM
```
