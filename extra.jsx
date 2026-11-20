import { useEffect, useState } from "react";
import { collection, doc, getDoc, getDocs, setDoc, query, where } from "firebase/firestore";
import { db } from "./firebase";
import { ADMIN_EMAIL } from "./firebaseConfig";
import { VILLES } from "./data";

export const initTheme = () => {
  document.documentElement.dataset.theme = localStorage.getItem("theme") || (matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
};
export function ThemeBtn() {
  const [t, setT] = useState(document.documentElement.dataset.theme);
  const go = () => { const n = t === "dark" ? "light" : "dark"; localStorage.setItem("theme", n); document.documentElement.dataset.theme = n; setT(n); };
  return <button className="heart" onClick={go} aria-label="Mode sombre ou clair">{t === "dark" ? "☀️" : "🌙"}</button>;
}
export const Avatar = ({ s }) => s.photo
  ? <img className="avatar" src={s.photo} alt="" />
  : <div className="avatar">{(s.nom || "?").trim().charAt(0).toUpperCase()}</div>;
export const compress = (file) => new Promise((res) => {
  const r = new FileReader();
  r.onload = () => { const i = new Image(); i.onload = () => {
    const k = Math.min(1, 480 / Math.max(i.width, i.height)); const c = document.createElement("canvas");
    c.width = i.width * k; c.height = i.height * k; c.getContext("2d").drawImage(i, 0, 0, c.width, c.height);
    res(c.toDataURL("image/jpeg", 0.7)); }; i.src = r.result; };
  r.readAsDataURL(file);
});
const wa = (n, t) => "https://wa.me/" + String(n || "").replace(/\D/g, "") + (t ? "?text=" + encodeURIComponent(t) : "");
const DEF = { police: "117", pompiers: "118", hopital: "", pharmacie_garde: "" };

export function Urgence({ user }) {
  const [ville, setVille] = useState(localStorage.getItem("ville") || "Lomé");
  const [d, setD] = useState(DEF);
  const admin = user?.email === ADMIN_EMAIL;
  useEffect(() => { getDoc(doc(db, "emergencies", ville)).then((s) => setD({ ...DEF, ...(s.exists() ? s.data() : {}) })).catch(() => setD(DEF)); }, [ville]);
  const pos = () => navigator.geolocation.getCurrentPosition(
    (p) => window.open(wa("", "Au secours ! Ma position : https://maps.google.com/?q=" + p.coords.latitude + "," + p.coords.longitude)),
    () => alert("Active le GPS pour partager ta position."));
  const L = [["Police", "police"], ["Pompiers", "pompiers"], ["Hôpital", "hopital"], ["Pharmacie de garde", "pharmacie_garde"]];
  return (
    <div className="wrap">
      <h2>Urgence</h2>
      <select value={ville} onChange={(e) => setVille(e.target.value)}>{VILLES.map((v) => <option key={v}>{v}</option>)}</select>
      {L.map(([nom, k]) => (
        <div className="card row" key={k} style={{ justifyContent: "space-between" }}>
          <div><b>{nom}</b><div className="meta">{d[k] || "Non renseigné"}</div></div>
          {d[k] && <a className="btn red sm" href={"tel:" + d[k]}>Appeler</a>}
        </div>
      ))}
      <button className="btn big sos" onClick={pos}>PARTAGER MA POSITION</button>
      {admin && (
        <div className="card" style={{ marginTop: 14 }}>
          <b>Modifier les numéros de {ville}</b>
          {L.map(([nom, k]) => <input key={k} placeholder={nom} value={d[k] || ""} onChange={(e) => setD({ ...d, [k]: e.target.value })} />)}
          <button className="btn" onClick={async () => { await setDoc(doc(db, "emergencies", ville), d); alert("Enregistré"); }}>Enregistrer</button>
        </div>
      )}
    </div>
  );
}

export function Taxi() {
  const [ville, setVille] = useState(localStorage.getItem("ville") || "Lomé");
  const [l, setL] = useState([]);
  const [f, setF] = useState({ depart: "", dest: "", pers: 1 });
  useEffect(() => {
    getDocs(query(collection(db, "shops"), where("statut", "==", "valide"), where("ville", "==", ville)))
      .then((s) => setL(s.docs.map((d) => ({ id: d.id, ...d.data() })).filter((x) => x.categorie?.startsWith("Taxi")).sort((a, b) => (b.premium ? 1 : 0) - (a.premium ? 1 : 0))))
      .catch(() => setL([]));
  }, [ville]);
  const msg = "Bonjour, je veux un taxi à " + ville + ". Départ : " + f.depart + ". Destination : " + f.dest + ". Personnes : " + f.pers + ". (NOVA-TOGO)";
  const ok = f.depart && f.dest;
  return (
    <div className="wrap">
      <div className="hero sos"><h1>Je veux un taxi</h1>
        <select value={ville} onChange={(e) => setVille(e.target.value)}>{VILLES.map((v) => <option key={v}>{v}</option>)}</select>
        <input placeholder="Où es-tu ? (quartier, repère)" value={f.depart} onChange={(e) => setF({ ...f, depart: e.target.value })} />
        <input placeholder="Où vas-tu ?" value={f.dest} onChange={(e) => setF({ ...f, dest: e.target.value })} />
      </div>
      {l.length === 0 && <div className="muted">Aucun taximan à {ville} pour le moment.<br />Taximan ? Inscris-toi dans « Ma boutique », catégorie Taxi Moto ou Taxi Voiture.</div>}
      {l.map((x) => (
        <div className="card" key={x.id}>
          <div className="shop"><Avatar s={x} /><div><b>{x.nom}</b> {x.premium && <span className="badge">PREMIUM</span>}<div className="meta">{x.categorie} • {x.quartier}</div></div></div>
          <div className="row" style={{ marginTop: 10 }}>
            <a className="btn sm" href={"tel:" + x.whatsapp}>Appeler</a>
            <a className="btn sm wa" style={ok ? {} : { opacity: .5, pointerEvents: "none" }} href={wa(x.whatsapp, msg)} target="_blank" rel="noreferrer">Demander par WhatsApp</a>
          </div>
        </div>
      ))}
    </div>
  );
}
