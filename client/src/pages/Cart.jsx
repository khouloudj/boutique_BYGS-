import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import api, { errMsg } from "../api";
import { fetchCart } from "../store";
import { Img } from "../components/ProductCard";

export default function Cart() {
  const { items, total } = useSelector((s) => s.cart);
  const user = useSelector((s) => s.auth.user);
  const d = useDispatch();
  const nav = useNavigate();
  const [a, setA] = useState({ fullname: user?.fullname || "", phone: user?.phone || "", address: "", city: "", postalCode: "" });
  const [pay, setPay] = useState("cash_on_delivery");
  const [busy, setBusy] = useState(false);
  const set = (k) => (e) => setA({ ...a, [k]: e.target.value });

  const run = async (fn) => { try { await fn(); d(fetchCart()); } catch (e) { alert(errMsg(e)); } };
  const setQty = (id, q) => q >= 1 && run(() => api.put(`/cart/item/${id}`, { quantity: q }));
  const remove = (id) => run(() => api.delete(`/cart/item/${id}`));

  const order = async (e) => {
    e.preventDefault(); setBusy(true);
    try { await api.post("/order", { shippingAddress: a, paymentMethod: pay }); d(fetchCart()); nav("/orders"); }
    catch (err) { alert(errMsg(err)); } finally { setBusy(false); }
  };

  if (!items.length) return <div className="box c"><h2>Votre panier est vide</h2><Link to="/" className="btn">Découvrir la boutique</Link></div>;

  return (
    <div className="two">
      <section>
        <h2>Panier</h2>
        {items.map(({ product: p, quantity }) => (
          <div className="line" key={p._id}>
            <div className="mini"><Img p={p} /></div>
            <div className="grow"><Link to={`/product/${p._id}`}><strong>{p.name}</strong></Link><div className="muted">{p.price.toFixed(2)} DT</div></div>
            <div className="row gap">
              <button className="btn ghost sm" onClick={() => setQty(p._id, quantity - 1)}>−</button>
              <span>{quantity}</span>
              <button className="btn ghost sm" onClick={() => setQty(p._id, quantity + 1)}>+</button>
            </div>
            <strong className="w">{(p.price * quantity).toFixed(2)} DT</strong>
            <button className="link" onClick={() => remove(p._id)}>✕</button>
          </div>
        ))}
      </section>
      <form className="box" onSubmit={order}>
        <h3>Livraison</h3>
        <input placeholder="Nom complet" value={a.fullname} onChange={set("fullname")} required />
        <input placeholder="Téléphone" value={a.phone} onChange={set("phone")} required />
        <input placeholder="Adresse" value={a.address} onChange={set("address")} required />
        <div className="row gap"><input placeholder="Ville" value={a.city} onChange={set("city")} required /><input placeholder="Code postal" value={a.postalCode} onChange={set("postalCode")} /></div>
        <select value={pay} onChange={(e) => setPay(e.target.value)}><option value="cash_on_delivery">Paiement à la livraison</option></select>
        <div className="row total"><span>Total</span><strong>{total.toFixed(2)} DT</strong></div>
        <button className="btn" disabled={busy}>{busy ? "…" : "Confirmer la commande"}</button>
      </form>
    </div>
  );
}
