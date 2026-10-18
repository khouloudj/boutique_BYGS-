import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import api, { errMsg, img, imgUrl } from "../api";
import { fetchCart, toggleWish } from "../store";
import { labelOf, subLabelOf } from "../categories";

export function useAdd() {
  const user = useSelector((s) => s.auth.user);
  const d = useDispatch();
  const nav = useNavigate();
  return async (id, quantity = 1) => {
    if (!user) return nav("/login");
    if (user.role !== "user") return alert("Connectez-vous avec un compte client pour acheter.");
    try { await api.post("/cart/add", { product: id, quantity }); d(fetchCart()); alert("Ajouté au panier ✔"); }
    catch (e) { alert(errMsg(e)); }
  };
}

export const Img = ({ p }) => img(p)
  ? <img src={img(p)} alt={p.name} loading="lazy" />
  : <div className="ph">{p.name?.[0]}</div>;

export default function ProductCard({ p }) {
  const add = useAdd();
  const d = useDispatch();
  const liked = useSelector((s) => s.wish.includes(p._id));
  const [cls, label] = p.stock === 0 ? ["ko", "Épuisé"] : p.stock <= 3 ? ["low", `Plus que ${p.stock}`] : ["ok", "En stock"];

  const list = p.images || [];
  const [ii, setIi] = useState(0); // image affichée
  const cur = list[Math.min(ii, list.length - 1)];
  const go = (e, step) => {
    e.preventDefault(); e.stopPropagation();
    setIi((ii + step + list.length) % list.length);
  };

  return (
    <article className="pc rv">
      <div className="pc-img">
        <Link to={`/product/${p._id}`}>
          {cur ? <img src={imgUrl(cur)} alt={p.name} loading="lazy" /> : <div className="ph">{p.name?.[0]}</div>}
        </Link>
        {p.model && <span className="tag t3d">3D</span>}
        {list.length > 1 && (
          <>
            <button type="button" className="pc-nav l" aria-label="Précédente" onClick={(e) => go(e, -1)}>‹</button>
            <button type="button" className="pc-nav r" aria-label="Suivante" onClick={(e) => go(e, 1)}>›</button>
          </>
        )}
        <button className="quick" disabled={p.stock === 0} onClick={() => add(p._id)}>Ajouter au panier</button>
      </div>
      <div className="pc-b">
        <div className="pc-t">
          <div><Link to={`/product/${p._id}`}><strong>{p.name}</strong></Link><span className="cat">{subLabelOf(p.category, p.subcategory) || labelOf(p.category)}</span></div>
          <button className={`heart ${liked ? "on" : ""}`} onClick={() => d(toggleWish(p._id))} aria-label="Favori">
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"><path d="M12 21s-7-4.6-9.3-9A5.3 5.3 0 0 1 12 6.6 5.3 5.3 0 0 1 21.3 12C19 16.4 12 21 12 21z" /></svg>
          </button>
        </div>
        <div className="pc-f"><b>{p.price.toFixed(2)} DT</b><span className={`stk ${cls}`}><i />{label}</span></div>
      </div>
    </article>
  );
}