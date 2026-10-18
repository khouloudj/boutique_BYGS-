import { useEffect, useState } from "react";
import api, { errMsg, imgUrl } from "../api";
import { LABELS } from "./Orders";
import { CATEGORIES, subsOf, fullLabel } from "../categories";

const empty = { name: "", placements: [{ category: "bijoux-accessoires", subcategory: "" }], price: "", stock: "", images: [], description: "" };

export default function Admin() {
  const [tab, setTab] = useState("products");
  const [stats, setStats] = useState(null);
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [f, setF] = useState(empty);
  const [editId, setEditId] = useState(null);
  const [url, setUrl] = useState("");
  const [busy, setBusy] = useState(false);
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });
  const setPl = (i, patch) => setF((o) => ({ ...o, placements: o.placements.map((x, k) => (k === i ? { ...x, ...patch } : x)) }));
  const addPl = () => setF((o) => ({ ...o, placements: [...o.placements, { category: CATEGORIES[0].value, subcategory: "" }] }));
  const delPl = (i) => setF((o) => ({ ...o, placements: o.placements.filter((_, k) => k !== i) }));

  const load = () => {
    api.get("/admin/stats").then((r) => setStats(r.data));
    api.get("/product", { params: { limit: 50 } }).then((r) => setProducts(r.data.products));
    api.get("/order").then((r) => setOrders(r.data.orders));
  };
  useEffect(load, []);

  const save = async (e) => {
    e.preventDefault();
    const seen = new Set();
    const placements = f.placements.filter((x) => { const k = x.category + "|" + x.subcategory; if (seen.has(k)) return false; seen.add(k); return true; });
    const body = { name: f.name, placements, category: placements[0].category, subcategory: placements[0].subcategory, description: f.description, price: +f.price, stock: +f.stock, images: f.images };
    try {
      editId ? await api.put(`/product/${editId}`, body) : await api.post("/product", body);
      setF(empty); setEditId(null); load();
    } catch (err) { alert(errMsg(err)); }
  };
  const edit = (p) => {
    setEditId(p._id);
    setF({ name: p.name, placements: p.placements?.length ? p.placements.map((x) => ({ category: x.category, subcategory: x.subcategory || "" })) : [{ category: p.category, subcategory: p.subcategory || "" }], price: p.price, stock: p.stock, images: p.images || [], description: p.description });
    window.scrollTo(0, 0);
  };
  const addUrl = () => {
    const u = url.trim();
    if (!/^https?:\/\//i.test(u)) return alert("Lien invalide : il doit commencer par http:// ou https://");
    setF((o) => ({ ...o, images: [...o.images, u] })); setUrl("");
  };
  const upload = async (e) => {
    const files = [...e.target.files];
    if (!files.length) return;
    const fd = new FormData();
    files.forEach((x) => fd.append("images", x));
    setBusy(true);
    try { const r = await api.post("/upload", fd); setF((o) => ({ ...o, images: [...o.images, ...r.data.urls] })); }
    catch (err) { alert(errMsg(err)); }
    finally { setBusy(false); e.target.value = ""; }
  };
  const del = async (id) => { if (confirm("Supprimer ce produit ?")) { await api.delete(`/product/${id}`); load(); } };
  const status = async (id, s) => { try { await api.put(`/order/${id}/status`, { status: s }); load(); } catch (e) { alert(errMsg(e)); } };

  return (
    <>
      <h2>Espace vendeur</h2>
      {stats && (
        <div className="stats">
          {[["Chiffre d'affaires", `${stats.revenue.toFixed(2)} DT`], ["Commandes", stats.orders], ["Produits", stats.products], ["Clients", stats.users]].map(([l, v]) => (
            <div className="box" key={l}><small>{l}</small><strong>{v}</strong></div>
          ))}
        </div>
      )}
      <div className="chips">
        <button className={`chip ${tab === "products" ? "on" : ""}`} onClick={() => setTab("products")}>Produits</button>
        <button className={`chip ${tab === "orders" ? "on" : ""}`} onClick={() => setTab("orders")}>Commandes ({orders.length})</button>
      </div>

      {tab === "products" ? <>
        <form className="box formgrid" onSubmit={save}>
          <h3>{editId ? "Modifier le produit" : "Nouveau produit"}</h3>
          <input placeholder="Nom" value={f.name} onChange={set("name")} required />
          <input type="number" step="0.01" min="0" placeholder="Prix (DT)" value={f.price} onChange={set("price")} required />
          <input type="number" min="0" placeholder="Stock" value={f.stock} onChange={set("stock")} required />
          <div style={{ gridColumn: "1/-1" }}>
            <small>Catégories : le produit apparaît dans chacune</small>
            {f.placements.map((x, i) => (
              <div className="row gap" key={i}>
                <select value={x.category} onChange={(e) => setPl(i, { category: e.target.value, subcategory: "" })}>{CATEGORIES.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}</select>
                <select value={x.subcategory} onChange={(e) => setPl(i, { subcategory: e.target.value })}><option value="">Sous-catégorie (optionnel)</option>{subsOf(x.category).map(([v, l]) => <option key={v} value={v}>{l}</option>)}</select>
                {f.placements.length > 1 && <button type="button" className="link red" aria-label="Retirer" onClick={() => delPl(i)}>✕</button>}
              </div>
            ))}
            <button type="button" className="btn ghost sm" onClick={addPl}>+ Ajouter une autre catégorie</button>
          </div>
          <div style={{ gridColumn: "1/-1" }}>
            <small>Images (la première est la principale)</small>
            <div className="thumbs">
              {f.images.map((u, i) => (
                <div className="th" key={u + i}>
                  <img src={imgUrl(u)} alt="" />
                  <button type="button" aria-label="Retirer" onClick={() => setF({ ...f, images: f.images.filter((_, k) => k !== i) })}>✕</button>
                  {i === 0 && <em>Principale</em>}
                </div>
              ))}
            </div>
            <div className="row gap">
              <input placeholder="Coller un lien d'image (https://…)" value={url} onChange={(e) => setUrl(e.target.value)} />
              <button type="button" className="btn ghost sm" onClick={addUrl}>Ajouter le lien</button>
            </div>
            <label className="btn ghost sm upl">{busy ? "Envoi en cours…" : "📁 Choisir des images depuis mon ordinateur"}
              <input type="file" accept="image/*" multiple hidden onChange={upload} />
            </label>
          </div>
          <textarea placeholder="Description" value={f.description} onChange={set("description")} rows={3} />
          <div className="row gap"><button className="btn">{editId ? "Enregistrer" : "Ajouter"}</button>
            {editId && <button type="button" className="btn ghost" onClick={() => { setEditId(null); setF(empty); }}>Annuler</button>}</div>
        </form>
        <div className="tablewrap"><table>
          <thead><tr><th>Image</th><th>Produit</th><th>Catégorie</th><th>Prix</th><th>Stock</th><th></th></tr></thead>
          <tbody>{products.map((p) => (
            <tr key={p._id}>
              <td>{p.images?.[0]
                ? <img src={imgUrl(p.images[0])} alt={p.name} style={{ width: 56, height: 56, objectFit: "cover", display: "block", background: "#f5f5f5" }} />
                : <div style={{ width: 56, height: 56, background: "#f5f5f5" }} />}</td>
              <td>{p.name}</td><td>{(p.placements?.length ? p.placements : [p]).map((x) => fullLabel(x.category, x.subcategory)).join(" · ")}</td><td>{p.price.toFixed(2)} DT</td><td>{p.stock}</td>
              <td className="act"><button className="link" onClick={() => edit(p)}>Modifier</button><button className="link red" onClick={() => del(p._id)}>Supprimer</button></td></tr>
          ))}</tbody>
        </table></div>
      </> : (
        orders.length === 0 ? <p className="muted">Aucune commande.</p> : orders.map((o) => (
          <div className="box" key={o._id}>
            <div className="row"><strong>#{o._id.slice(-6).toUpperCase()} · {o.user?.fullname}</strong>
              <select value={o.status} onChange={(e) => status(o._id, e.target.value)} disabled={o.status === "cancelled"}>
                {Object.entries(LABELS).filter(([k]) => k !== "pending" || o.status === "pending").map(([k, v]) => <option key={k} value={k}>{v}</option>)}
              </select></div>
            {o.items.map((i) => <div className="muted" key={i._id}>{i.quantity} × {i.name}</div>)}
            <div className="muted">{o.shippingAddress.fullname} · {o.shippingAddress.phone} · {o.shippingAddress.address}, {o.shippingAddress.city}</div>
            <strong>{o.totalPrice.toFixed(2)} DT</strong>
          </div>
        ))
      )}
    </>
  );
}