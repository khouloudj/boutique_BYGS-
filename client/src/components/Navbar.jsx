import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { logout, resetCart } from "../store";
import { CATEGORIES } from "../categories";

const Ic = ({ children }) => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">{children}</svg>;

export default function Navbar() {
  const { user } = useSelector((s) => s.auth);
  const count = useSelector((s) => s.cart.items.reduce((n, i) => n + i.quantity, 0));
  const wishCount = useSelector((s) => s.wish.length);
  const d = useDispatch();
  const nav = useNavigate();
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");

  const out = () => { d(logout()); d(resetCart()); setOpen(false); nav("/"); };
  const search = (e) => { e.preventDefault(); nav(`/?search=${encodeURIComponent(q.trim())}`); };
  const account = user ? (user.role === "admin" ? "/admin" : "/orders") : "/login";
  const L = (to, label) => <Link to={to} onClick={() => setOpen(false)}>{label}</Link>;

  return (
    <>
      <header className="nav">
        <div className="container nav-in">
          <button className="icon" onClick={() => setOpen(true)} aria-label="Menu"><Ic><path d="M3 6h18M3 12h18M3 18h18" /></Ic></button>
          <Link to="/" className="logo" aria-label="Accueil">
  <img src="/logo.png" alt="Bijoux Tunisie" onError={(e) => { e.currentTarget.style.display = "none"; e.currentTarget.nextSibling.style.display = "inline"; }} />
  <span style={{ display: "none" }}>BY<sup>GS</sup></span>
</Link>
          <form className="search" onSubmit={search}>
            <Ic><circle cx="11" cy="11" r="7" /><path d="m20 20-4-4" /></Ic>
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Accessoires, sacs, article en laine…" />
          </form>
          <div className="nav-r">
            <Link to="/wishlist" className="icon bag" aria-label="Favoris"><Ic><path d="M12 21s-7-4.6-9.3-9A5.3 5.3 0 0 1 12 6.6 5.3 5.3 0 0 1 21.3 12C19 16.4 12 21 12 21z" /></Ic>{wishCount > 0 && <span className="badge">{wishCount}</span>}</Link>
            <Link to={account} className="icon" title={user ? user.fullname : "Connexion"}><Ic><circle cx="12" cy="8" r="4" /><path d="M4 21c0-4 4-6 8-6s8 2 8 6" /></Ic></Link>
            {user?.role !== "admin" && (
              <Link to="/cart" className="icon bag" aria-label="Panier"><Ic><path d="M5 8h14l-1 12H6L5 8z" /><path d="M9 8V6a3 3 0 0 1 6 0v2" /></Ic>{count > 0 && <span className="badge">{count}</span>}</Link>
            )}
            <div className="badge-box"><strong>Livraison</strong><span>Partout en Tunisie</span></div>
          </div>
        </div>
      </header>

      {open && <>
        <div className="drawer-bg" onClick={() => setOpen(false)} />
        <aside className="drawer">
          <button className="icon close" onClick={() => setOpen(false)}>✕</button>
          {L("/", "Boutique")}
          {CATEGORIES.map((c) => <Link key={c.value} to={`/?category=${c.value}`} onClick={() => setOpen(false)}>{c.label}</Link>)}
          <hr />
          {user?.role === "user" && L("/orders", "Mes commandes")}
          {user?.role === "admin" && L("/admin", "Espace vendeur")}
          {user ? <button className="link" onClick={out}>Déconnexion</button> : L("/login", "Connexion / Inscription")}
        </aside>
      </>}
    </>
  );
}
