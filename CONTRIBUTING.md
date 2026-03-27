# Contributing to Polybot

Thanks for your interest in improving Polybot.

This repository is now a TypeScript/npm workspace monorepo built around NestJS services and a shared `@polybot/core` package. The original Java/Spring Boot implementation remains available under `legacy/` for reference, but new work should target the TypeScript codebase unless a change explicitly involves legacy behavior.

## Ways to Contribute

### Report Bugs
- Open a GitHub Issue with clear reproduction steps.
- Include expected vs actual behavior.
- Attach sanitized logs, config snippets, or screenshots when useful.

### Suggest Features
- Open a GitHub Issue with the `enhancement` label.
- Describe the use case, constraints, and trade-offs.
- Call out any service boundaries or external dependencies that may be affected.

### Submit Code
- Fork the repository.
- Create a focused feature branch.
- Open a Pull Request with validation steps and a concise rationale.

## Development Setup

### Prerequisites
- Node.js 20+ and npm 9+
- Docker Engine/Desktop with Compose support
- Python 3.11+ for research scripts in `research/`
- PowerShell 7+ is recommended on Windows for the repo's operational scripts

### Install Dependencies

```bash
npm install
```

### Build, Lint, and Test

```bash
npm run lint
npm run build
npm test
```

These commands run across all npm workspaces.

### Run Locally

Start supporting infrastructure when you need analytics or monitoring services:

```bash
docker compose -f docker-compose.analytics.yaml up -d
docker compose -f docker-compose.monitoring.yaml up -d
```

Start all app services with PowerShell:

```powershell
.\Start-AllServices.ps1
```

Or run a single service in watch mode:

```bash
npm run dev:executor
npm run dev:strategy
npm run dev:analytics
npm run dev:ingestor
npm run dev:infra
```

Stop the full stack with:

```powershell
.\Stop-AllServices.ps1
```

## Repository Layout

```text
apps/
  executor-service/                     NestJS API for execution and Polymarket endpoints
  strategy-service/                     NestJS strategy runtime
  analytics-service/                    NestJS analytics API
  ingestor-service/                     NestJS ingestion API
  infrastructure-orchestrator-service/  NestJS infrastructure control API
packages/
  polybot-core/                         Shared domain types, crypto, clients, and helpers
analytics-service/
  clickhouse/                           ClickHouse init scripts and config
legacy/                                 Archived Java/Spring Boot implementation
monitoring/                             Grafana, Prometheus, Alertmanager config
research/                               Python research and analysis tooling
scripts/                                Operational scripts
```

## Code Style

### TypeScript and NestJS
- Keep shared protocol, crypto, and Polymarket logic in `packages/polybot-core`.
- Keep service-specific HTTP behavior and orchestration inside the relevant `apps/*` project.
- Prefer small, typed functions and explicit interfaces over loose objects.
- Preserve existing endpoint contracts unless the change explicitly updates the public API.
- Use environment-driven configuration; do not hardcode secrets, hosts, or user-specific values.

### Python Research Tooling
- Follow PEP 8.
- Use type hints when practical.
- Document non-obvious inputs and outputs.

### PowerShell Scripts
- Use `param()` blocks for script inputs.
- Validate user input and exit with explicit error codes.
- Prefer clear logging over silent failures.

## Architecture Guidelines

### Shared Code
- If logic is reused across services, prefer adding it to `packages/polybot-core`.
- Keep signing logic, market parsing, and client helpers covered by unit tests.
- Reuse existing types and helpers before introducing new abstractions.

### Service Changes
- `executor-service` owns execution-facing APIs and Polymarket order flows.
- `strategy-service` owns strategy lifecycle and runtime state.
- `analytics-service` owns analytics endpoints backed by ClickHouse-oriented models.
- `ingestor-service` owns ingestion entry points and pipeline coordination.
- `infrastructure-orchestrator-service` owns operational lifecycle endpoints.

When adding a new endpoint, preserve response shapes and status semantics across the stack.

### Analytics and Data
- Keep ClickHouse DDL/config changes under `analytics-service/clickhouse/`.
- Document new tables, views, or ingestion assumptions in the PR description.
- If a change affects analytics correctness, include example queries or validation notes.

### Research Workflows
- Add new research utilities under `research/`.
- Reuse existing data access patterns where possible.
- Document any new Python dependencies or external data expectations.

## Pull Request Process

1. Use a descriptive branch name such as `feature/new-ingestion-metric` or `fix/order-signing`.
2. Summarize what changed, why it changed, and how you validated it.
3. Run the relevant verification commands before opening the PR:

```bash
npm run lint
npm run build
npm test
```

4. If your change touches trading behavior, analytics logic, or research outputs, include focused manual validation notes.
5. Keep PRs scoped; prefer follow-up PRs over bundling unrelated work.

## Security

### Never Commit
- Private keys, wallet credentials, or seed phrases
- API keys, API secrets, or passphrases
- Real trading data containing PII
- Hardcoded machine-specific or user-specific settings

### Best Practices
- Use environment variables for secrets and operational credentials.
- Review diffs carefully before pushing.
- Sanitize logs and screenshots before sharing them publicly.

## Legacy Java Code

The archived Java implementation lives in `legacy/`. You may reference it when porting behavior or checking historical intent, but avoid adding new primary features there unless the task explicitly calls for legacy maintenance.

## Questions?

- Open a GitHub Discussion for general questions.
- Check existing Issues for related work.
- Start with `README.md` and the docs under `docs/`.

## License

By contributing, you agree that your contributions will be licensed under the MIT License.
