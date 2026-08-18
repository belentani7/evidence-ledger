# Evidence Ledger

> Local-first evidence receipts for AI and Trust & Safety decisions.

Evidence Ledger records the context, policy, signals, human rationale and cryptographic continuity behind a decision. It is designed for teams that need to reconstruct what happened without turning governance into a pile of disconnected documents.

## Why it exists

General AI observability tools measure quality and latency. Moderation consoles manage queues and enforcement. Evidence Ledger focuses on the missing connective layer: **why a decision occurred, what evidence was available, who made it, and whether the record stayed intact**.

## Product surface

The browser interface exposes a live event stream, decision counts, chain integrity, receipt detail views and JSON export. A receipt can be created through the UI or the API. Each record is append-only and includes a SHA-256 hash of its own canonical payload plus the previous record hash.

## API

| Method | Endpoint | Purpose |
|---|---|---|
| `GET` | `/api/health` | Service and chain status |
| `GET` | `/api/receipts` | Last 100 receipts, newest first |
| `GET` | `/api/receipts/export` | Portable JSON export |
| `POST` | `/api/receipts` | Validate and seal a new receipt |

A receipt requires `actor`, `system`, `decision`, `policy`, `subject`, `rationale` and a bounded `signals` array. Decisions are restricted to `ALLOW`, `REVIEW`, `BLOCK` and `ESCALATE`.

## Run locally

```bash
pnpm install
pnpm dev
```

For a production build:

```bash
pnpm check
pnpm build
pnpm start
```

The local ledger is stored in `data/receipts.jsonl`. Do not commit sensitive production evidence. Use an external encrypted store or a deployment-specific data volume for real workloads.

## Design principles

Evidence is more valuable than assertion. The interface is intentionally quiet, dense and inspectable: a signal color marks integrity and action, while the rest of the system stays neutral. The backend is small enough to understand, portable enough to fork and strict enough to reject malformed decisions.

## License

MIT.
