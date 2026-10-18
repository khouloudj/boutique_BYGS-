import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import api from "../api";
import Hero from "../components/Hero";
import Tiles from "../components/Tiles";
import ProductCard from "../components/ProductCard";
import useReveal from "../useReveal";
import { CATEGORIES } from "../categories";

export default function Shop() {
  const [sp, setSp] = useSearchParams();
  const search = sp.get("search") || "";
  const category = sp.get("category") || "";
  const subcategory = sp.get("subcategory") || "";
  const [page, setPage] = useState(1);
  const [data, setData] = useState({ products: [], pages: 1 });
  const [loading, setLoading] = useState(true);
  const current = CATEGORIES.find((c) => c.value === category);

  const setFilter = (params) => {
    const n = new URLSearchParams(sp);
    Object.entries(params).forEach(([k, v]) => (v ? n.set(k, v) : n.delete(k)));
    setSp(n); setPage(1);
  };

  useEffect(() => {
    setLoading(true);
    const t = setTimeout(() => api.get("/product", { params: { search, category, subcategory, page, limit: 12 } })
      .then((r) => setData(r.data)).finally(() => setLoading(false)), 200);
    return () => clearTimeout(t);
  }, [search, category, subcategory, page]);

  useReveal([data, loading]);

  useEffect(() => { if (category || search) document.getElementById("catalogue")?.scrollIntoView({ behavior: "smooth" }); }, [category, subcategory, search]);

  return (
    <>
      <Hero />
      <div className="over">
        <Tiles />

        <h2 id="catalogue" className="sec">{search ? `Résultats pour « ${search} »` : current ? current.label : "Notre collection"}</h2>

        <div className="chips center">
          <button className={`chip ${!category ? "on" : ""}`} onClick={() => setFilter({ category: "", subcategory: "" })}>Tout</button>
          {CATEGORIES.map((c) => (
            <button key={c.value} className={`chip ${category === c.value ? "on" : ""}`} onClick={() => setFilter({ category: c.value, subcategory: "" })}>{c.label}</button>
          ))}
        </div>
        {current?.subs.length > 0 && (
          <div className="chips center sub">
            <button className={`chip ${!subcategory ? "on" : ""}`} onClick={() => setFilter({ subcategory: "" })}>Tous</button>
            {current.subs.map(([v, l]) => (
              <button key={v} className={`chip ${subcategory === v ? "on" : ""}`} onClick={() => setFilter({ subcategory: v })}>{l}</button>
            ))}
          </div>
        )}

        {loading ? <p className="muted c">Chargement…</p> : data.products.length === 0 ? <p className="muted c">Aucun produit trouvé.</p> :
          <div className="pgrid fullbleed">{data.products.map((p) => <ProductCard key={p._id} p={p} />)}</div>}
        {data.pages > 1 && (
          <div className="pager">
            <button className="btn ghost sm" disabled={page <= 1} onClick={() => setPage(page - 1)}>←</button>
            <span>{page} / {data.pages}</span>
            <button className="btn ghost sm" disabled={page >= data.pages} onClick={() => setPage(page + 1)}>→</button>
          </div>
        )}
      </div>
    </>
  );
}
