import { lazy, Suspense, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api, { imgUrl } from "../api";
import { fullLabel } from "../categories";
import { Img, useAdd } from "../components/ProductCard";

const Viewer3D = lazy(() => import("../components/Viewer3D"));

export default function Product() {
  const { id } = useParams();
  const [p, setP] = useState(null);
  const [qty, setQty] = useState(1);
  const [view, setView] = useState("photo");
  const [idx, setIdx] = useState(0);
  const add = useAdd();

  useEffect(() => { setIdx(0); api.get(`/product/${id}`).then((r) => setP(r.data.product)).catch(() => setP(false)); }, [id]);
  if (p === null) return <p className="muted">Chargement…</p>;
  if (p === false) return <p className="muted">Produit introuvable.</p>;

  const imgs = p.images || [];

  return (
    <div className="detail">
      <div>
        <div className="detail-img">
          {view === "3d" && p.model
            ? <Suspense fallback={<div className="ph">3D…</div>}><Viewer3D url={p.model} /></Suspense>
            : imgs.length ? <img src={imgUrl(imgs[idx])} alt={p.name} /> : <Img p={p} />}
        </div>
        {imgs.length > 1 && (
          <div className="gal">
            {imgs.map((u, i) => <button key={u + i} className={i === idx && view === "photo" ? "on" : ""} onClick={() => { setIdx(i); setView("photo"); }}><img src={imgUrl(u)} alt="" /></button>)}
          </div>
        )}
        {p.model && (
          <div className="chips" style={{ justifyContent: "center" }}>
            <button className={`chip ${view === "photo" ? "on" : ""}`} onClick={() => setView("photo")}>Photo</button>
            <button className={`chip ${view === "3d" ? "on" : ""}`} onClick={() => setView("3d")}>Vue 3D ⟲</button>
          </div>
        )}
      </div>
      <div>
        <small>{fullLabel(p.category, p.subcategory)}</small>
        <h1>{p.name}</h1>
        <p className="price">{p.price.toFixed(2)} DT</p>
        <p className="muted">{p.description || "—"}</p>
        <p className={p.stock > 0 ? "ok" : "ko"}>{p.stock > 0 ? `En stock (${p.stock})` : "Épuisé"}</p>
        {p.stock > 0 && (
          <div className="row gap">
            <input type="number" min="1" max={p.stock} value={qty} onChange={(e) => setQty(Math.max(1, Math.min(p.stock, +e.target.value || 1)))} className="qty" />
            <button className="btn" onClick={() => add(p._id, qty)}>Ajouter au panier</button>
          </div>
        )}
      </div>
    </div>
  );
}