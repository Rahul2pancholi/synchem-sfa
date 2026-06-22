# Local Docker (Colima)

Use **Colima** instead of Docker Desktop on macOS.

```bash
brew install colima docker docker-compose
colima start --cpu 2 --memory 4
docker context use colima
```

## Dev — Postgres + Redis only

From repo root:

```bash
pnpm colima:start
pnpm docker:dev
```

Compose file: `docker-compose.yml` — Postgres 16 (host port **5434**) + Redis 7.

Run API and web locally with `pnpm dev:api` / `pnpm dev:web`.

## UAT — full stack (API + Web + DB)

```bash
cp apps/api/.env.uat.example apps/api/.env.uat
# Edit JWT_SECRET if needed

pnpm docker:uat
```

| Service | URL |
|---------|-----|
| Web (nginx → API proxy) | http://localhost:8080 |
| API direct | http://localhost:3000 |
| Postgres | localhost:5434 |

Seed UAT data (once):

```bash
DATABASE_URL=postgresql://sfa:sfa_dev_password@localhost:5434/synchem_sfa pnpm db:seed
```

Stop:

```bash
docker compose -f infra/docker/docker-compose.yml -f infra/docker/docker-compose.uat.yml down
pnpm docker:down
pnpm colima:stop   # optional
```

## Production images

Build from repo root:

```bash
docker build -f infra/docker/Dockerfile.api -t synchem-sfa-api .
docker build -f infra/docker/Dockerfile.web -t synchem-sfa-web .
```

See [23-PHASE6-GO-LIVE.md](../docs/23-PHASE6-GO-LIVE.md) for deploy sequence.
