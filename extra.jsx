import { useEffect, useState } from "react";
import { collection, doc, getDoc, getDocs, setDoc, addDoc, updateDoc, serverTimestamp, query, where } from "firebase/firestore";
import { db } from "./firebase";
import { ADMIN_EMAIL } from "./firebaseConfig";
import { VILLES, fmt } from "./data";

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

export const voice = (set) => {
  const R = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!R) return alert("La recherche vocale n'est pas disponible sur ce navigateur.");
  const r = new R(); r.lang = "fr-FR"; r.onresult = (e) => set(e.results[0][0].transcript); r.start();
};

const promoOn = (x) => x.prix_promo && (!x.fin || x.fin > Date.now());
export const priceNow = (x) => (promoOn(x) ? x.prix_promo : x.prix);
export function Price({ x }) {
  if (!promoOn(x)) return <span className="prix">{fmt(x.prix)}</span>;
  const pct = Math.round(100 - (x.prix_promo * 100) / x.prix);
  const ms = x.fin ? x.fin - Date.now() : 0;
  return (
    <span><s className="meta">{fmt(x.prix)}</s> <span className="prix">{fmt(x.prix_promo)}</span>{" "}
      <span className="badge" style={{ background: "var(--rouge)", color: "#fff" }}>-{pct}%</span>
      {x.fin && <div className="meta">Il reste {Math.floor(ms / 36e5)}h {Math.floor((ms % 36e5) / 6e4)}min</div>}
    </span>
  );
}

export async function orderProduct(user, shop, x) {
  if (!user) return alert("Connecte-toi pour commander.");
  const liv = confirm("Livraison à domicile ?\nOK = Livrez-moi\nAnnuler = Je viens chercher");
  const adr = liv ? prompt("Ton adresse (quartier, repère) :") : "";
  if (liv && !adr) return;
  const total = priceNow(x);
  await addDoc(collection(db, "orders"), { clientId: user.uid, client: user.displayName || user.email, shopId: shop.id, shopOwnerId: shop.ownerId, shopNom: shop.nom, produit: x.nom, total, livraison: liv, adresse: adr, statut: "envoyee", date: serverTimestamp() });
  window.open(wa(shop.whatsapp, "Bonjour, je commande : " + x.nom + " (" + fmt(total) + "). " + (liv ? "Livraison à : " + adr : "Je viens chercher.") + " (NOVA-TOGO)"));
}

export function Orders({ user }) {
  const [mine, setMine] = useState([]);
  const [recv, setRecv] = useState([]);
  const load = () => {
    if (!user) return;
    const g = (f) => getDocs(query(collection(db, "orders"), where(f, "==", user.uid)))
      .then((s) => s.docs.map((d) => ({ id: d.id, ...d.data() })).sort((a, b) => (b.date?.seconds || 0) - (a.date?.seconds || 0)));
    g("clientId").then(setMine).catch(() => {}); g("shopOwnerId").then(setRecv).catch(() => {});
  };
  useEffect(load, [user?.uid]);
  if (!user) return <div className="wrap"><div className="card muted">Connecte-toi pour voir tes commandes.</div></div>;
  const pts = mine.filter((o) => o.statut === "livree").reduce((a, o) => a + Math.floor(o.total / 100), 0);
  const niv = pts >= 500 ? "VIP OR" : pts >= 200 ? "VIP" : pts >= 50 ? "Fidèle" : "Nouveau";
  const set = async (id, statut) => { await updateDoc(doc(db, "orders", id), { statut }); load(); };
  return (
    <div className="wrap">
      <div className="hero"><h1>{pts} points NOVA</h1>Niveau : <b>{niv}</b><div style={{ fontSize: 13, marginTop: 6 }}>100 F dépensés = 1 point (commande livrée). 100 points = 1 livraison offerte, 200 points = 1 plat offert chez un partenaire.</div></div>
      <h2>Mes commandes</h2>
      {mine.length === 0 && <div className="muted">Aucune commande pour le moment.</div>}
      {mine.map((o) => <div className="card" key={o.id}><b>{o.produit}</b> <span className="prix">{fmt(o.total)}</span><div className="meta">{o.shopNom} • {o.livraison ? "Livraison" : "Retrait"} • {o.statut === "livree" ? "✅ Livrée" : "⏳ Envoyée"}</div></div>)}
      {recv.length > 0 && <h2>Commandes reçues</h2>}
      {recv.map((o) => (
        <div className="card" key={o.id}><b>{o.produit}</b> <span className="prix">{fmt(o.total)}</span>
          <div className="meta">{o.client} • {o.livraison ? "Livraison : " + o.adresse : "Retrait"} • {o.statut === "livree" ? "✅ Livrée" : "⏳ À livrer"}</div>
          {o.statut !== "livree" && <button className="btn sm" style={{ marginTop: 8 }} onClick={() => set(o.id, "livree")}>Marquer livrée</button>}
        </div>))}
    </div>
  );
}
