import React from "react";
import { Service } from "../types";

export function ServicePicker({
  services,
  value,
  onChange
}: {
  services: Service[];
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="row wrap" style={{ gap: 10 }}>
      <span className="pill">
        <span className="small muted">Service</span>
        <select className="select" value={value} onChange={(e) => onChange(e.target.value)}>
          {services.map((s) => (
            <option key={s.service_key} value={s.service_key}>
              {s.service_key}
            </option>
          ))}
        </select>
      </span>
    </div>
  );
}
