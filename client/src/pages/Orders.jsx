import { useEffect, useState } from "react";
import api, { errMsg } from "../api";

export const LABELS = { pending: "En attente", confirmed: "Confirmée", shipped: "Expédiée", delivered: "Livrée", cancelled: "Annulée" };

export default function Orders() {
  const [orders, setOrders] = useState(null);
  const load = () => api.get("/order/my").then((r) => setOrders(r.data.orders));
  useEffect(() => { load(); }, []);

  const cancel = async (id) => {
    if (!confirm("Annuler cette commande ?")) return;
    try { await api.put(`/order/${id}/cancel`); load(); } catch (e) { alert(errMsg(e)); }
  };

  if (!orders) return <p className="muted">Chargement…</p>;
  if (!orders.length) return <p className="muted">Vous n'avez pas encore de commande.</p>;

  return (
    <>
      <h2>Mes commandes</h2>
      {orders.map((o) => (
        <div className="box" key={o._id}>
          <div className="row"><strong>#{o._id.slice(-6).toUpperCase()} · {new Date(o.createdAt).toLocaleDateString("fr-FR")}</strong><span className={`st ${o.status}`}>{LABELS[o.status]}</span></div>
          {o.items.map((i) => <div className="muted" key={i._id}>{i.quantity} × {i.name} — {(i.price * i.quantity).toFixed(2)} DT</div>)}
          <div className="row"><strong>Total : {o.totalPrice.toFixed(2)} DT</strong>
            {o.status === "pending" && <button className="btn ghost sm" onClick={() => cancel(o._id)}>Annuler</button>}</div>
        </div>
      ))}
    </>
  );
}
