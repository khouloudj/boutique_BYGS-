import axios from "axios";

const BASE = import.meta.env.VITE_API_URL || "/api";
const api = axios.create({ baseURL: BASE });

api.interceptors.request.use((c) => {
  const t = localStorage.getItem("token");
  if (t) c.headers.Authorization = t;
  return c;
});

// Session expirée (le token dure 1h) : on déconnecte et on renvoie vers la page de connexion
api.interceptors.response.use(
  (r) => r,
  (e) => {
    if (e.response?.status === 401 && localStorage.getItem("token")) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.location.href = "/login";
    }
    return Promise.reject(e);
  }
);

// Message d'erreur clair (au lieu de "Une erreur est survenue")
export const errMsg = (e) => {
  const r = e.response;
  if (!r) return "Serveur injoignable : vérifie que le backend tourne (npm run dev)";
  if (r.data?.msg) return r.data.msg;
  if (r.data?.errors?.[0]?.msg) return r.data.errors[0].msg;
  if (r.status === 401) return "Session expirée : reconnecte-toi";
  if (r.status === 404) return "Route introuvable : le backend n'est pas à jour (remplace server.js puis redémarre)";
  if (r.status >= 500) return "Le backend est arrêté ou a planté : regarde le terminal [API]";
  return `Erreur ${r.status}`;
};

// Les images envoyées depuis l'ordinateur sont enregistrées sous /uploads/... (servies par le backend).
// Les liens http(s) restent inchangés.
export const imgUrl = (u) => (u && u.startsWith("/uploads") ? BASE + u : u || "");
export const img = (p) => imgUrl(p?.images?.[0] || p?.image || "");
export default api;