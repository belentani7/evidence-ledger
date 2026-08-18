import { lazy, Suspense } from "react";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";

const Home = lazy(() => import("./pages/Home"));

function RouteFallback() {
  return <div className="route-fallback" role="status" aria-live="polite"><span>LEDGER/00</span><strong>LOADING EVIDENCE</strong></div>;
}

export default function App() {
  return <ErrorBoundary><Suspense fallback={<RouteFallback />}><Switch><Route path="/" component={Home} /><Route path="/404" component={NotFound} /><Route component={NotFound} /></Switch></Suspense></ErrorBoundary>;
}
