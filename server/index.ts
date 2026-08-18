import express from "express";
import { createHash, randomUUID } from "node:crypto";
import { promises as fs } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const root = path.resolve(__dirname, "..");
const dataDir = path.join(root, "data");
const ledgerPath = path.join(dataDir, "receipts.jsonl");

type Receipt = {
  id: string;
  createdAt: string;
  actor: string;
  system: string;
  decision: "ALLOW" | "REVIEW" | "BLOCK" | "ESCALATE";
  policy: string;
  subject: string;
  rationale: string;
  signals: Array<{ name: string; value: string; score?: number }>;
  previousHash: string;
  hash: string;
};

const app = express();
app.use(express.json({ limit: "64kb" }));

async function readReceipts(): Promise<Receipt[]> {
  try {
    const raw = await fs.readFile(ledgerPath, "utf8");
    return raw.trim() ? raw.trim().split("\n").map((line) => JSON.parse(line) as Receipt) : [];
  } catch (error: unknown) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") return [];
    throw error;
  }
}

function validate(input: Partial<Receipt>) {
  const decisions = ["ALLOW", "REVIEW", "BLOCK", "ESCALATE"];
  if (!input.actor || !input.system || !input.policy || !input.subject || !input.rationale) return "actor, system, policy, subject and rationale are required";
  if (!decisions.includes(input.decision ?? "")) return "decision must be ALLOW, REVIEW, BLOCK or ESCALATE";
  if (!Array.isArray(input.signals) || input.signals.length > 12) return "signals must be an array with at most 12 items";
  return null;
}

function hashReceipt(receipt: Omit<Receipt, "hash">) {
  return createHash("sha256").update(JSON.stringify(receipt)).digest("hex");
}

function verifyChain(receipts: Receipt[]) {
  return receipts.every((receipt, index) => {
    const expectedPrevious = index === 0 ? "GENESIS" : receipts[index - 1].hash;
    const { hash, ...unsigned } = receipt;
    return receipt.previousHash === expectedPrevious && hash === hashReceipt(unsigned);
  });
}

app.get("/api/health", async (_req, res) => {
  const receipts = await readReceipts();
  const valid = verifyChain(receipts);
  res.json({ ok: valid, service: "evidence-ledger", receipts: receipts.length, integrity: valid ? "verified" : "broken", algorithm: "sha256" });
});

app.get("/api/receipts", async (_req, res) => {
  const receipts = await readReceipts();
  res.json(receipts.slice(-100).reverse());
});

app.get("/api/receipts/export", async (_req, res) => {
  const receipts = await readReceipts();
  res.setHeader("Content-Disposition", `attachment; filename=evidence-ledger-${new Date().toISOString().slice(0, 10)}.json`);
  res.json({ exportedAt: new Date().toISOString(), algorithm: "sha256", receipts });
});

app.post("/api/receipts", async (req, res) => {
  const input = req.body as Partial<Receipt>;
  const error = validate(input);
  if (error) return res.status(400).json({ error });
  const receipts = await readReceipts();
  const previousHash = receipts.at(-1)?.hash ?? "GENESIS";
  const unsigned = {
    id: randomUUID(),
    createdAt: new Date().toISOString(),
    actor: String(input.actor).slice(0, 160),
    system: String(input.system).slice(0, 160),
    decision: input.decision,
    policy: String(input.policy).slice(0, 240),
    subject: String(input.subject).slice(0, 240),
    rationale: String(input.rationale).slice(0, 1000),
    signals: input.signals!.map((signal) => ({ name: String(signal.name).slice(0, 80), value: String(signal.value).slice(0, 180), score: typeof signal.score === "number" ? Math.max(0, Math.min(1, signal.score)) : undefined })),
    previousHash,
  } as Omit<Receipt, "hash">;
  const receipt = { ...unsigned, hash: hashReceipt(unsigned) } satisfies Receipt;
  await fs.mkdir(dataDir, { recursive: true });
  await fs.appendFile(ledgerPath, `${JSON.stringify(receipt)}\n`, "utf8");
  res.status(201).json(receipt);
});

const staticPath = process.env.NODE_ENV === "production" ? path.resolve(__dirname, "public") : path.resolve(root, "dist", "public");
app.use(express.static(staticPath));
app.get("*", (_req, res) => res.sendFile(path.join(staticPath, "index.html")));

const port = Number(process.env.PORT ?? 3000);
app.listen(port, () => console.log(`Evidence Ledger listening on http://localhost:${port}`));
