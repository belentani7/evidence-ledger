import { Link } from "wouter";

export default function NotFound() {
  return <main style={{ minHeight: "100vh", display: "grid", placeItems: "center", padding: 24, background: "#080908", color: "#f1f2ed", fontFamily: "Manrope, system-ui, sans-serif" }}><section style={{ border: "1px solid #242824", padding: 28, maxWidth: 500, width: "100%" }}><p style={{ color: "#c9f36b", font: "10px 'DM Mono', monospace", letterSpacing: ".12em" }}>LEDGER / 404</p><h1 style={{ fontSize: 40, letterSpacing: "-.06em" }}>No evidence at this address.</h1><Link href="/" style={{ display: "inline-block", marginTop: 14, color: "#c9f36b", font: "12px 'DM Mono', monospace" }}>Return to ledger →</Link></section></main>;
}
