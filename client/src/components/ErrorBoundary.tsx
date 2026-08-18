import { AlertTriangle, RotateCcw } from "lucide-react";
import { Component, ReactNode } from "react";

interface Props { children: ReactNode }
interface State { hasError: boolean; error: Error | null }

export default class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, error: null };
  static getDerivedStateFromError(error: Error): State { return { hasError: true, error }; }
  render() {
    if (!this.state.hasError) return this.props.children;
    return <main style={{ minHeight: "100vh", display: "grid", placeItems: "center", padding: 32, background: "#080908", color: "#f1f2ed", fontFamily: "Manrope, system-ui, sans-serif" }}><section style={{ width: "min(560px, 100%)", border: "1px solid #242824", padding: 28 }}><AlertTriangle color="#ff8379" size={24}/><p style={{ fontFamily: "DM Mono, monospace", letterSpacing: ".12em", color: "#ff8379", fontSize: 11 }}>LEDGER / RUNTIME FAULT</p><h1 style={{ fontSize: 30, letterSpacing: "-.05em" }}>The evidence surface stopped.</h1><pre style={{ color: "#8a8f87", whiteSpace: "pre-wrap", fontSize: 12, lineHeight: 1.6 }}>{this.state.error?.message}</pre><button onClick={() => window.location.reload()} style={{ display: "inline-flex", alignItems: "center", gap: 8, border: "1px solid #c9f36b", background: "#c9f36b", color: "#10130d", padding: "12px 15px", fontFamily: "DM Mono, monospace", cursor: "pointer" }}><RotateCcw size={15}/> Reload surface</button></section></main>;
  }
}
