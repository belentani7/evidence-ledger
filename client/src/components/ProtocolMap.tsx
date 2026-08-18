/* NOIACORE protocol map: staged disclosure, cold signal, low-noise state transition. */
import { ChevronRight, Radar } from "lucide-react";

export const protocolNodes = ["SIGNAL / 00", "CONTEXT / 01", "RISK / 02", "EXECUTION / 03", "ARCHIVE / 04"] as const;

const descriptions: Record<string, string> = {
  "SIGNAL / 00": "La entrada empieza por la señal: qué está ocurriendo y qué merece atención.",
  "CONTEXT / 01": "El contexto convierte datos aislados en una lectura que puede sostenerse.",
  "RISK / 02": "El riesgo se nombra antes de intentar automatizarlo.",
  "EXECUTION / 03": "La intención se traduce a una acción pequeña, observable y reversible.",
  "ARCHIVE / 04": "Cada decisión deja un registro útil para la siguiente iteración.",
};

export function ProtocolMap({ active, onChange }: { active: string; onChange: (value: string) => void }) {
  return <div className="protocol-map-inner"><div className="protocol-tabs">{protocolNodes.map((protocol, index) => <button key={protocol} className={active === protocol ? "is-active" : ""} onClick={() => onChange(protocol)}><span>0{index}</span>{protocol}<ChevronRight size={14}/></button>)}</div><div className="protocol-readout"><div><Radar size={18}/><span>ACTIVE NODE</span></div><strong>{active}</strong><p>{descriptions[active]}</p></div></div>;
}
