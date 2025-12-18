import { Role } from "../types";

const KEY = "liveops.role";

export function getRole(): Role {
  const raw = localStorage.getItem(KEY);
  return raw === "manager" ? "manager" : "engineer";
}

export function setRole(role: Role) {
  localStorage.setItem(KEY, role);
}
