import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import api from "../api";
import useReveal from "../useReveal";
import ProductCard from "../components/ProductCard";

export default function Wishlist() {
  const ids = useSelector((s) => s.wish);
  const [items, setItems] = useState(null);

  useEffect(() => {
    Promise.all(ids.map((id) => api.get(`/product/${id}`).then((r) => r.data.product).catch(() => null)))
      .then((a) => setItems(a.filter(Boolean)));
  }, [ids]);
  useReveal([items]);

  if (!items) return <p className="muted c">Chargement…</p>;
  return (
    <>
      <h2 className="sec">Mes favoris</h2>
      {items.length === 0
        ? <div className="box c"><p className="muted">Aucun favori pour le moment.</p><Link to="/" className="btn">Découvrir la boutique</Link></div>
        : <div className="pgrid fullbleed">{items.map((p) => <ProductCard key={p._id} p={p} />)}</div>}
    </>
  );
}
