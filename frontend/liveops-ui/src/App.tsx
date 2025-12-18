import React, { useEffect, useMemo, useState } from "react";
import { Layout } from "./components/Layout";
import Dashboard from "./pages/Dashboard";
import Incidents from "./pages/Incidents";
import IncidentDetail from "./pages/IncidentDetail";

type Route =
  | { name: "dashboard" }
  | { name: "incidents" }
  | { name: "incident"; key: string };

function parseHash(): Route {
  const h = (window.location.hash || "#/dashboard").replace("#", "");
  const parts = h.split("/").filter(Boolean);
  if (parts[0] === "incidents" && parts[1]) return { name: "incident", key: parts[1] };
  if (parts[0] === "incidents") return { name: "incidents" };
  return { name: "dashboard" };
}

export default function App() {
  const [route, setRoute] = useState<Route>(() => parseHash());

  useEffect(() => {
    const onHash = () => setRoute(parseHash());
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, []);

  const title = useMemo(() => {
    if (route.name === "dashboard") return "Dashboard";
    if (route.name === "incidents") return "Incidents";
    return `Incident ${route.key}`;
  }, [route]);

  return (
    <Layout title={title}>
      {route.name === "dashboard" && <Dashboard />}
      {route.name === "incidents" && <Incidents />}
      {route.name === "incident" && <IncidentDetail incidentKey={route.key} />}
    </Layout>
  );
}
