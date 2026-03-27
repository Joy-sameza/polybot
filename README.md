# Polybot

Open-source Polymarket trading infrastructure and strategy reverse-engineering toolkit.

Polybot is a multi-service system for:
- automated execution (paper and live modes)
- strategy runtime and market making
- market/user trade ingestion into ClickHouse
- quantitative analysis and replication scoring

![Strategy Analysis Dashboard](docs/showcase_readme.png)

## Future Work: AWARE Fund

Polybot is the execution and market-data foundation for **AWARE**, the next product layer (trader intelligence, PSI indices, fund mirroring, API/UI).

- Polybot repo: https://github.com/ent0n29/polybot
- AWARE repo: https://github.com/ent0n29/aware

## What You Get

- TypeScript/NestJS microservices for execution, strategy, ingestion, analytics
- Shared `@polybot/core` library with Polymarket CLOB/Gamma/Data API clients, EIP-712 and HMAC signing, order building, market parsing
- ClickHouse + Redpanda event pipeline
- Monitoring stack (Grafana, Prometheus, Alertmanager)
- Research toolkit in `research/` for snapshots, deep analysis, and replication metrics

## Quick Start

### Prerequisites

- Node.js 20+ and npm 9+
- Docker Engine/Desktop with Compose plugin
- Python 3.11+ (for research scripts)

### 1. Clone

```bash
git clone https://github.com/ent0n29/polybot.git
cd polybot
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Optional Environment Setup

```powershell
Copy-Item .env.example .env
# Edit .env with your credentials
```

### 4. Build

```bash
npm run build
```

### 5. Start Everything

```powershell
.\Start-AllServices.ps1
```

Or start individual services:

```bash
npm run start:executor    # port 8080
npm run start:strategy    # port 8081
npm run start:analytics   # port 8082
npm run start:ingestor    # port 8083
npm run start:infra       # port 8084
```

### 6. Verify

```bash
curl http://localhost:8080/api/polymarket/health
curl http://localhost:8081/api/strategy/status
curl http://localhost:8082/api/analytics/status
curl http://localhost:8083/api/ingestor/status
curl http://localhost:8084/api/infrastructure/status
```

### 7. Stop

```powershell
.\Stop-AllServices.ps1
```

## Development

### Build and Test

```bash
npm run build    # build all workspaces
npm run test     # run all tests
npm run lint     # type-check all workspaces
```

### Dev Mode (Watch)

```bash
npm run dev:executor    # hot-reload executor-service
npm run dev:strategy    # hot-reload strategy-service
npm run dev:analytics   # hot-reload analytics-service
npm run dev:ingestor    # hot-reload ingestor-service
npm run dev:infra       # hot-reload infrastructure-orchestrator-service
```

### Tail Logs

```powershell
Get-Content -Wait logs\executor-service.log
Get-Content -Wait logs\strategy-service.log
Get-Content -Wait logs\analytics-service.log
Get-Content -Wait logs\ingestor-service.log
Get-Content -Wait logs\infrastructure-orchestrator-service.log
```

## Services and Ports

| Service | Port | Purpose | Example Endpoint |
|---|---:|---|---|
| executor-service | 8080 | order execution, paper sim, settlement endpoints | `/api/polymarket/health` |
| strategy-service | 8081 | strategy runtime and status | `/api/strategy/status` |
| analytics-service | 8082 | analytics APIs on ClickHouse data | `/api/analytics/status` |
| ingestor-service | 8083 | market/user-trade ingestion pipelines | `/api/ingestor/status` |
| infrastructure-orchestrator-service | 8084 | lifecycle of analytics + monitoring stacks | `/api/infrastructure/status` |
| ClickHouse HTTP | 8123 | analytics SQL access | `SELECT 1` |
| Redpanda Kafka | 9092 | event streaming | Kafka bootstrap |
| Grafana | 3000 | dashboards | UI |
| Prometheus | 9090 | metrics scraping | UI |
| Alertmanager | 9093 | alert routing | UI |

## Configuration Essentials

Key variables are documented in `.env.example`.

Most relevant:
- `POLYMARKET_TARGET_USER` for strategy research workflows
- `POLYMARKET_PRIVATE_KEY`, `POLYMARKET_API_KEY`, `POLYMARKET_API_SECRET`, `POLYMARKET_API_PASSPHRASE` for live trading
- `KAFKA_BOOTSTRAP_SERVERS`, `ANALYTICS_DB_URL`, `CLICKHOUSE_*` for data pipeline
- `GRAFANA_ADMIN_PASSWORD`, `SLACK_WEBHOOK_URL` for ops/alerts

Default mode is paper trading (`HFT_MODE=PAPER`).

## Included Strategy

Polybot includes a complete-set arbitrage strategy for Polymarket Up/Down binaries.

See `docs/EXAMPLE_STRATEGY_SPEC.md` for implementation details.

## Research Workflow

The `research/` directory contains scripts for:
- snapshot extraction and reporting
- replication and similarity scoring
- backtesting and calibration
- execution quality analysis

Start with `research/README.md`.

## Repo Layout

```text
polybot/
├── packages/
│   └── polybot-core/          # shared library (@polybot/core)
├── apps/
│   ├── executor-service/      # NestJS — order execution (port 8080)
│   ├── strategy-service/      # NestJS — strategy runtime (port 8081)
│   ├── analytics-service/     # NestJS — analytics APIs (port 8082)
│   ├── ingestor-service/      # NestJS — data ingestion (port 8083)
│   └── infrastructure-orchestrator-service/  # NestJS — infra lifecycle (port 8084)
├── legacy/                    # archived Java/Spring Boot implementation
├── analytics-service/
│   └── clickhouse/            # ClickHouse DDL init scripts
├── monitoring/                # Prometheus, Grafana, Alertmanager configs
├── research/                  # Python research toolkit
├── scripts/                   # operational scripts
├── docker-compose.analytics.yaml
├── docker-compose.monitoring.yaml
├── Start-AllServices.ps1
├── Stop-AllServices.ps1
├── package.json               # npm workspace root
└── tsconfig.base.json         # shared TypeScript config
```

## Legacy Java Implementation

The original Java 21/Spring Boot implementation is archived under `legacy/`. It is preserved for reference and historical context. See `legacy/pom.xml` for the Maven module structure.

## Contributing

See `CONTRIBUTING.md` for setup, style, testing, and PR process.

## Disclaimer

This software is for educational and research purposes only.

Trading prediction markets carries financial risk. Always validate with paper mode before any live capital.

## License

MIT. See `LICENSE`.
