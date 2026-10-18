import { useEffect } from "react";
import { useLocation } from "react-router-dom";

// Remonte en haut de la page à chaque changement de page (et à l'ouverture du site)
export default function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    // empêche le navigateur de rouvrir la page à l'ancienne position de scroll
    if ("scrollRestoration" in window.history) window.history.scrollRestoration = "manual";
  }, []);

  useEffect(() => { window.scrollTo(0, 0); }, [pathname]);

  return null;
}
