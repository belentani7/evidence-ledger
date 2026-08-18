import { FormEvent, useEffect, useMemo, useState } from "react";
import { ArrowDownToLine, Check, ChevronRight, CircleAlert, Fingerprint, Plus, ShieldCheck, Terminal, X } from "lucide-react";

type Decision = "ALLOW" | "REVIEW" | "BLOCK" | "ESCALATE";
type Signal = { name: string; value: string; score?: number };
type Receipt = { id: string; createdAt: string; actor: string; system: string; decision: Decision; policy: string; subject: string; rationale: string; signals: Signal[]; previousHash: string; hash: string };

const emptyForm = { actor: "operator@local", system: "policy-gateway", decision: "REVIEW" as Decision, policy: "content-safety/v1", subject: "", rationale: "", signalName: "", signalValue: "", signalScore: "" };

function shortHash(hash: string) { return `${hash.slice(0, 8)}…${hash.slice(-6)}`; }
function formatDate(value: string) { return new Intl.DateTimeFormat("en-GB", { dateStyle: "medium", timeStyle: "short" }).format(new Date(value)); }
function decisionTone(decision: Decision) { return decision.toLowerCase(); }

export default function Home() {
  const [receipts, setReceipts] = useState<Receipt[]>([]);
  const [form, setForm] = useState(emptyForm);
  const [selected, setSelected] = useState<Receipt | null>(null);
  const [open, setOpen] = useState(false);
  const [status, setStatus] = useState("CONNECTING");
  const [error, setError] = useState("");

  async function load() {
    try { const response = await fetch("/api/receipts"); if (!response.ok) throw new Error("API unavailable"); setReceipts(await response.json()); setStatus("LIVE"); }
    catch { setStatus("OFFLINE"); }
  }
  useEffect(() => { void load(); }, []);

  const counts = useMemo(() => receipts.reduce((acc, receipt) => { acc[receipt.decision] += 1; return acc; }, { ALLOW: 0, REVIEW: 0, BLOCK: 0, ESCALATE: 0 } as Record<Decision, number>), [receipts]);
  const integrity = useMemo(() => receipts.every((receipt, index) => index === receipts.length - 1 || receipts[index + 1].previousHash === receipt.hash) || receipts.length < 2, [receipts]);

  async function submit(event: FormEvent) {
    event.preventDefault(); setError("");
    const signal: Signal = { name: form.signalName || "manual-review", value: form.signalValue || "operator-observed", ...(form.signalScore ? { score: Number(form.signalScore) } : {}) };
    try {
      const response = await fetch("/api/receipts", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ actor: form.actor, system: form.system, decision: form.decision, policy: form.policy, subject: form.subject, rationale: form.rationale, signals: [signal] }) });
      const body = await response.json(); if (!response.ok) throw new Error(body.error || "Unable to write receipt");
      setReceipts((current) => [body, ...current]); setSelected(body); setOpen(false); setForm(emptyForm);
    } catch (err) { setError(err instanceof Error ? err.message : "Unable to write receipt"); }
  }

  return <div className="ledger-shell">
    <header className="ledger-header"><a className="ledger-brand" href="#top"><span className="brand-mark"><Fingerprint size={19}/></span><span>evidence<span className="brand-accent">/</span>ledger</span></a><div className="header-meta"><span className={`live-dot ${status.toLowerCase()}`} /> API {status} <span className="header-divider" /> LOCAL-FIRST <a href="https://github.com/belentani7/evidence-ledger" target="_blank" rel="noreferrer">GITHUB <ChevronRight size={14}/></a></div></header>
    <main id="top">
      <section className="ledger-hero"><div className="eyebrow"><span>SYS/01</span> DECISION EVIDENCE INFRASTRUCTURE</div><div className="hero-grid"><div><h1>Make every<br/><em>decision legible.</em></h1><p>Evidence Ledger captures the context, policy, human judgment and cryptographic continuity behind AI and Trust & Safety decisions.</p><div className="hero-actions"><button className="button button-primary" onClick={() => setOpen(true)}><Plus size={16}/> Record evidence</button><a className="button button-quiet" href="/api/receipts/export"><ArrowDownToLine size={16}/> Export ledger</a></div></div><div className="integrity-panel"><div className="integrity-orbit"><span/><span/><Fingerprint size={30}/></div><div><small>LEDGER INTEGRITY</small><strong>{integrity ? "CHAIN VERIFIED" : "CHAIN BROKEN"}</strong><p>SHA-256 · append-only · local-first</p></div></div></div></section>
      <section className="metrics"><div><span>RECEIPTS</span><strong>{receipts.length.toString().padStart(2, "0")}</strong></div><div><span>REVIEW QUEUE</span><strong>{counts.REVIEW.toString().padStart(2, "0")}</strong></div><div><span>ESCALATIONS</span><strong>{counts.ESCALATE.toString().padStart(2, "0")}</strong></div><div><span>INTEGRITY</span><strong className="signal-text">{integrity ? "100%" : "ALERT"}</strong></div></section>
      <section className="workspace"><div className="section-head"><div><span className="eyebrow">01 / EVENT STREAM</span><h2>Recent evidence</h2></div><p>Chronological records that preserve what happened, what was known and why the system acted.</p></div><div className="stream">{receipts.length === 0 ? <div className="empty-state"><Terminal size={18}/><strong>No receipts yet</strong><p>Record the first decision to initialize the evidence chain.</p><button className="text-button" onClick={() => setOpen(true)}>Create first receipt <ChevronRight size={14}/></button></div> : receipts.map((receipt) => <button className="receipt-row" key={receipt.id} onClick={() => setSelected(receipt)}><span className={`decision-mark ${decisionTone(receipt.decision)}`}><Check size={14}/></span><span className="receipt-main"><strong>{receipt.subject}</strong><small>{receipt.system} · {receipt.policy}</small></span><span className={`decision-label ${decisionTone(receipt.decision)}`}>{receipt.decision}</span><span className="receipt-hash">{shortHash(receipt.hash)}</span><span className="receipt-date">{formatDate(receipt.createdAt)}</span><ChevronRight size={16}/></button>)}</div></section>
      <section className="principles"><div><span className="eyebrow">02 / OPERATING MODEL</span><h2>Evidence before assertion.</h2></div><div className="principle-grid"><article><ShieldCheck size={18}/><span>01</span><h3>Context survives</h3><p>Signals, policy scope and operator rationale travel with the decision.</p></article><article><Fingerprint size={18}/><span>02</span><h3>Integrity compounds</h3><p>Each receipt points to the previous one, making silent edits visible.</p></article><article><Terminal size={18}/><span>03</span><h3>Systems stay open</h3><p>JSON export and a small API keep the ledger portable across stacks.</p></article></div></section>
    </main>
    {open && <div className="modal-backdrop" onClick={() => setOpen(false)}><form className="receipt-form" onSubmit={submit} onClick={(event) => event.stopPropagation()}><div className="modal-head"><div><span className="eyebrow">NEW RECEIPT</span><h2>Record a decision</h2></div><button type="button" className="icon-button" onClick={() => setOpen(false)}><X size={18}/></button></div><div className="form-grid"><label>ACTOR<input value={form.actor} onChange={(e) => setForm({ ...form, actor: e.target.value })}/></label><label>SYSTEM<input value={form.system} onChange={(e) => setForm({ ...form, system: e.target.value })}/></label><label>DECISION<select value={form.decision} onChange={(e) => setForm({ ...form, decision: e.target.value as Decision })}>{["ALLOW", "REVIEW", "BLOCK", "ESCALATE"].map((value) => <option key={value}>{value}</option>)}</select></label><label>POLICY<input value={form.policy} onChange={(e) => setForm({ ...form, policy: e.target.value })}/></label></div><label>SUBJECT<input required value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} placeholder="e.g. message_4821 / model_release_07"/></label><label>RATIONALE<textarea required rows={4} value={form.rationale} onChange={(e) => setForm({ ...form, rationale: e.target.value })} placeholder="What was observed and why was this decision made?"/></label><div className="signal-fields"><label>SIGNAL<input value={form.signalName} onChange={(e) => setForm({ ...form, signalName: e.target.value })} placeholder="classifier.score"/></label><label>VALUE<input value={form.signalValue} onChange={(e) => setForm({ ...form, signalValue: e.target.value })} placeholder="high-risk"/></label><label>SCORE<input type="number" min="0" max="1" step="0.01" value={form.signalScore} onChange={(e) => setForm({ ...form, signalScore: e.target.value })} placeholder="0.00–1.00"/></label></div>{error && <p className="form-error"><CircleAlert size={15}/> {error}</p>}<button className="button button-primary submit-button" type="submit">Seal receipt <Fingerprint size={16}/></button></form></div>}
    {selected && <div className="modal-backdrop" onClick={() => setSelected(null)}><aside className="receipt-detail" onClick={(event) => event.stopPropagation()}><div className="modal-head"><div><span className="eyebrow">RECEIPT / {selected.id.slice(0, 8)}</span><h2>{selected.subject}</h2></div><button className="icon-button" onClick={() => setSelected(null)}><X size={18}/></button></div><div className={`detail-decision ${decisionTone(selected.decision)}`}>{selected.decision}<span>{formatDate(selected.createdAt)}</span></div><dl><div><dt>ACTOR</dt><dd>{selected.actor}</dd></div><div><dt>SYSTEM</dt><dd>{selected.system}</dd></div><div><dt>POLICY</dt><dd>{selected.policy}</dd></div><div><dt>RATIONALE</dt><dd>{selected.rationale}</dd></div></dl><div className="hash-block"><small>PREVIOUS HASH</small><code>{selected.previousHash}</code><small>RECEIPT HASH</small><code>{selected.hash}</code></div></aside></div>}
  </div>;
}
