import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { authenticate } from "../store";

export default function Auth() {
  const [mode, setMode] = useState("login");
  const [f, setF] = useState({ fullname: "", email: "", password: "", phone: "" });
  const { user, loading, error } = useSelector((s) => s.auth);
  const d = useDispatch();
  const nav = useNavigate();
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });

  useEffect(() => { if (user) nav(user.role === "admin" ? "/admin" : "/"); }, [user, nav]);

  const submit = (e) => {
    e.preventDefault();
    const body = mode === "login" ? { email: f.email, password: f.password } : f;
    if (!body.phone) delete body.phone;
    d(authenticate({ mode, ...body }));
  };

  return (
    <form className="box auth" onSubmit={submit}>
      <h2>{mode === "login" ? "Connexion" : "Créer un compte"}</h2>
      {mode === "register" && <>
        <input placeholder="Nom complet" value={f.fullname} onChange={set("fullname")} required />
        <input placeholder="Téléphone (optionnel)" value={f.phone} onChange={set("phone")} />
      </>}
      <input type="email" placeholder="Email" value={f.email} onChange={set("email")} required />
      <input type="password" placeholder="Mot de passe (6 caractères min.)" value={f.password} onChange={set("password")} required minLength={6} />
      {error && <p className="err">{error}</p>}
      <button className="btn" disabled={loading}>{loading ? "…" : mode === "login" ? "Se connecter" : "S'inscrire"}</button>
      <p className="muted c">
        {mode === "login" ? "Pas encore de compte ?" : "Déjà inscrit ?"}{" "}
        <button type="button" className="link" onClick={() => setMode(mode === "login" ? "register" : "login")}>
          {mode === "login" ? "Créer un compte" : "Se connecter"}
        </button>
      </p>
    </form>
  );
}
