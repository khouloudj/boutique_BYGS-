import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import { CATEGORIES } from "../categories";

// ✏️ À REMPLIR : tes vrais liens (laisse "" pour masquer un élément)
const SHOP = {
  name: "BY GS",
  instagram: { url: "https://www.instagram.com/gs00_93/", handle: "@votre_compte" },
  facebook: "",   // ex: "https://www.facebook.com/ta.page"
  whatsapp: "",   // ex: "21620123456"  (sans + ni espaces)
  phone: "",      // ex: "+216 20 123 456"
  email: "",      // ex: "contact@tonsite.tn"
};

const Svg = ({ children }) => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">{children}</svg>;
const ext = { target: "_blank", rel: "noopener noreferrer" };

export default function Footer() {
  const user = useSelector((s) => s.auth.user);

  return (
    <footer className="ft">
      <div className="ft-in">
        <div className="ft-grid">
          <div>
            <img className="ft-logo" src="/logo.png" alt={SHOP.name} onError={(e) => { e.currentTarget.style.display = "none"; e.currentTarget.nextSibling.style.display = "block"; }} />
            <div className="ft-brand" style={{ display: "none" }}>{SHOP.name}</div>
            <p>Accessoires, sacs en perles et en crochet, article en laine et créations pour vos grandes occasions. Sélectionnés avec soin, livrés partout en Tunisie.</p>
            <div className="soc">
              {SHOP.instagram.url && <a href={SHOP.instagram.url} {...ext} aria-label="Instagram"><Svg><rect x="3" y="3" width="18" height="18" rx="5" /><circle cx="12" cy="12" r="4" /><circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" /></Svg></a>}
              {SHOP.facebook && <a href={SHOP.facebook} {...ext} aria-label="Facebook"><Svg><path d="M14 8.5V7a1 1 0 0 1 1-1h2V3h-3a4 4 0 0 0-4 4v1.5H7V12h3v9h4v-9h3l.5-3.5H14z" /></Svg></a>}
            </div>
            {SHOP.instagram.handle && <a className="handle" href={SHOP.instagram.url} {...ext}>Suivez-nous sur Instagram {SHOP.instagram.handle}</a>}
          </div>

          <div>
            <h4>Boutique</h4>
            {CATEGORIES.filter((c) => c.value !== "autres").map((c) => <Link key={c.value} to={`/?category=${c.value}`}>{c.label}</Link>)}
          </div>

          <div>
            <h4>Mon compte</h4>
            {user ? <Link to={user.role === "admin" ? "/admin" : "/orders"}>{user.role === "admin" ? "Espace vendeur" : "Mes commandes"}</Link> : <Link to="/login">Connexion / Inscription</Link>}
            <Link to="/wishlist">Mes favoris</Link>
            {user?.role !== "admin" && <Link to="/cart">Mon panier</Link>}
          </div>

          <div>
            <h4>Informations</h4>
            <span className="info">Livraison partout en Tunisie</span>
            <span className="info">Paiement à la livraison</span>
            {SHOP.phone && <a href={`tel:${SHOP.phone.replace(/\s/g, "")}`}>{SHOP.phone}</a>}
            {SHOP.whatsapp && <a href={`https://wa.me/${SHOP.whatsapp}`} {...ext}>Nous écrire sur WhatsApp</a>}
            {SHOP.email && <a href={`mailto:${SHOP.email}`}>{SHOP.email}</a>}
          </div>
        </div>

        <div className="ft-bot">
          <span>© {new Date().getFullYear()} {SHOP.name}. Tous droits réservés.</span>
          <button className="lnk" onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}>↑ Retour en haut</button>
        </div>
      </div>
    </footer>
  );
}
