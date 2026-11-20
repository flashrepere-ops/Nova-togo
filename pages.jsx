import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { signInWithPopup, signInWithEmailAndPassword, createUserWithEmailAndPassword, sendPasswordResetEmail, signOut, updateProfile } from "firebase/auth";
import { collection, doc, getDoc, getDocs, addDoc, setDoc, deleteDoc, updateDoc, query, where, serverTimestamp } from "firebase/firestore";
import { auth, db, google } from "./firebase";
import { ADMIN_EMAIL } from "./firebaseConfig";
import { VILLES, CATEGORIES, fmt } from "./data";

const initial = (s) => (s || "?").trim().charAt(0).toUpperCase();
const waLink = (n) => "https://wa.me/" + String(n || "").replace(/\D/g, "");
const sorted = (l) => [...l].sort((a, b) => (b.premium ? 1 : 0) - (a.premium ? 1 : 0));

function ShopCard({ s }) {
  return (
    <div className="card">
      <Link to={"/boutique/" + s.id} className="shop">
        <div className="avatar">{initial(s.nom)}</div>
        <div>
          <b>{s.nom}</b> {s.premium && <span className="badge">PREMIUM</span>}
          <div className="meta">{s.categorie} • {s.quartier}, {s.ville}</div>
          <div className="meta">{s.description?.slice(0, 70)}</div>
        </div>
      </Link>
      <div className="row" style={{ marginTop: 10 }}>
        <a className="btn sm" href={"tel:" + s.whatsapp}>Appeler</a>
        <a className="btn sm wa" href={waLink(s.whatsapp)} target="_blank" rel="noreferrer">WhatsApp</a>
      </div>
    </div>
  );
}

export function Home() {
  const [ville, setVille] = useState(localStorage.getItem("ville") || "Lomé");
  const [cat, setCat] = useState("");
  const [q, setQ] = useState("");
  const [shops, setShops] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  useEffect(() => {
    localStorage.setItem("ville", ville);
    setLoading(true); setErr("");
    getDocs(query(collection(db, "shops"), where("statut", "==", "valide"), where("ville", "==", ville)))
      .then((s) => setShops(s.docs.map((d) => ({ id: d.id, ...d.data() }))))
      .catch(() => setErr("Impossible de charger. Vérifie ta connexion."))
      .finally(() => setLoading(false));
  }, [ville]);

  const list = sorted(shops).filter((s) =>
    (!cat || s.categorie === cat) &&
    (!q || (s.nom + " " + s.description + " " + s.categorie).toLowerCase().includes(q.toLowerCase())));

  return (
    <div className="wrap">
      <div className="hero">
        <h1>Trouve tout près de chez toi</h1>
        <select value={ville} onChange={(e) => setVille(e.target.value)}>{VILLES.map((v) => <option key={v}>{v}</option>)}</select>
        <input placeholder={"Cherche un service à " + ville} value={q} onChange={(e) => setQ(e.target.value)} />
      </div>
      <div className="chips">
        <button className={"chip" + (!cat ? " on" : "")} onClick={() => setCat("")}>Tout</button>
        {CATEGORIES.map((c) => <button key={c} className={"chip" + (cat === c ? " on" : "")} onClick={() => setCat(c)}>{c}</button>)}
      </div>
      {loading && <div className="muted">Chargement…</div>}
      {err && <div className="err">{err}</div>}
      {!loading && !err && list.length === 0 && (
        <div className="muted">Aucun commerçant ici pour le moment.<br /><Link to="/devenir-commercant">Inscris ta boutique gratuitement</Link></div>
      )}
      {list.map((s) => <ShopCard key={s.id} s={s} />)}
    </div>
  );
}

export function ShopPage({ user }) {
  const { id } = useParams();
  const [shop, setShop] = useState(null);
  const [products, setProducts] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [fav, setFav] = useState(false);
  const [p, setP] = useState({ nom: "", prix: "", description: "" });
  const [r, setR] = useState({ etoiles: 5, commentaire: "" });

  const load = async () => {
    const s = await getDoc(doc(db, "shops", id));
    setShop(s.exists() ? { id: s.id, ...s.data() } : false);
    setProducts((await getDocs(collection(db, "shops", id, "products"))).docs.map((d) => ({ id: d.id, ...d.data() })));
    setReviews((await getDocs(collection(db, "shops", id, "reviews"))).docs.map((d) => ({ id: d.id, ...d.data() })));
    if (user) setFav((await getDoc(doc(db, "users", user.uid, "favorites", id))).exists());
  };
  useEffect(() => { load().catch(() => setShop(false)); }, [id, user?.uid]);

  if (shop === null) return <div className="muted">Chargement…</div>;
  if (shop === false) return <div className="muted">Boutique introuvable.</div>;
  const mine = user && shop.ownerId === user.uid;
  const moy = reviews.length ? (reviews.reduce((a, x) => a + x.etoiles, 0) / reviews.length).toFixed(1) : null;

  const toggleFav = async () => {
    if (!user) return alert("Connecte-toi pour ajouter aux favoris.");
    const ref = doc(db, "users", user.uid, "favorites", id);
    if (fav) await deleteDoc(ref); else await setDoc(ref, { shopId: id, nom: shop.nom, date: serverTimestamp() });
    setFav(!fav);
  };
  const addProduct = async (e) => {
    e.preventDefault();
    const max = shop.premium ? 10 : 3;
    if (products.length >= max) return alert("Limite de " + max + " produits. Passe en Premium pour en ajouter plus.");
    await addDoc(collection(db, "shops", id, "products"), { nom: p.nom, prix: Number(p.prix), description: p.description });
    setP({ nom: "", prix: "", description: "" }); load();
  };
  const addReview = async (e) => {
    e.preventDefault();
    if (!user) return alert("Connecte-toi pour donner ton avis.");
    await addDoc(collection(db, "shops", id, "reviews"), { userId: user.uid, auteur: user.displayName || "Client", etoiles: Number(r.etoiles), commentaire: r.commentaire, date: serverTimestamp() });
    setR({ etoiles: 5, commentaire: "" }); load();
  };

  return (
    <div className="wrap">
      <div className="card">
        <div className="row" style={{ justifyContent: "space-between" }}>
          <div className="shop"><div className="avatar">{initial(shop.nom)}</div>
            <div><h2 style={{ margin: 0 }}>{shop.nom}</h2>
              <div className="meta">{shop.categorie} • {shop.quartier}, {shop.ville}</div>
              <div>{shop.premium && <span className="badge">PREMIUM</span>} {moy && <span><span className="star">★</span> {moy} ({reviews.length})</span>}</div>
            </div></div>
          <button className={"heart" + (fav ? " on" : "")} onClick={toggleFav} aria-label="Favori">{fav ? "♥" : "♡"}</button>
        </div>
        <p>{shop.description}</p>
        {shop.horaires && <div className="meta">Horaires : {shop.horaires}</div>}
        <div className="row" style={{ marginTop: 10 }}>
          <a className="btn" href={"tel:" + shop.whatsapp}>Appeler</a>
          <a className="btn wa" href={waLink(shop.whatsapp)} target="_blank" rel="noreferrer">WhatsApp</a>
        </div>
      </div>

      <h2>Produits et services</h2>
      {products.length === 0 && <div className="muted">Aucun produit pour le moment.</div>}
      {products.map((x) => (
        <div className="card" key={x.id}>
          <div className="row" style={{ justifyContent: "space-between" }}>
            <b>{x.nom}</b><span className="prix">{fmt(x.prix)}</span>
          </div>
          <div className="meta">{x.description}</div>
          {mine && <button className="btn red sm" style={{ marginTop: 8 }} onClick={async () => { await deleteDoc(doc(db, "shops", id, "products", x.id)); load(); }}>Supprimer</button>}
        </div>
      ))}
      {mine && (
        <form className="card" onSubmit={addProduct}>
          <b>Ajouter un produit</b>
          <input required placeholder="Nom (ex : Chambre climatisée)" value={p.nom} onChange={(e) => setP({ ...p, nom: e.target.value })} />
          <input required type="number" min="0" placeholder="Prix en F" value={p.prix} onChange={(e) => setP({ ...p, prix: e.target.value })} />
          <input placeholder="Description" value={p.description} onChange={(e) => setP({ ...p, description: e.target.value })} />
          <button className="btn">Ajouter</button>
        </form>
      )}

      <h2>Avis</h2>
      {reviews.map((x) => (
        <div className="card" key={x.id}><b>{x.auteur}</b> <span className="star">{"★".repeat(x.etoiles)}</span><div className="meta">{x.commentaire}</div></div>
      ))}
      <form className="card" onSubmit={addReview}>
        <select value={r.etoiles} onChange={(e) => setR({ ...r, etoiles: e.target.value })}>
          {[5, 4, 3, 2, 1].map((n) => <option key={n} value={n}>{n} étoile{n > 1 ? "s" : ""}</option>)}
        </select>
        <input placeholder="Ton avis" value={r.commentaire} onChange={(e) => setR({ ...r, commentaire: e.target.value })} />
        <button className="btn">Publier mon avis</button>
      </form>
    </div>
  );
}

export function Login({ user }) {
  const nav = useNavigate();
  const [mode, setMode] = useState("connexion");
  const [f, setF] = useState({ nom: "", email: "", mdp: "" });
  const [err, setErr] = useState(""); const [info, setInfo] = useState("");
  useEffect(() => { if (user) nav("/profil"); }, [user]);

  const go = async (e) => {
    e.preventDefault(); setErr("");
    try {
      if (mode === "inscription") {
        const c = await createUserWithEmailAndPassword(auth, f.email, f.mdp);
        if (f.nom) await updateProfile(c.user, { displayName: f.nom });
      } else await signInWithEmailAndPassword(auth, f.email, f.mdp);
    } catch { setErr("Email ou mot de passe incorrect. Réessaie."); }
  };
  const reset = async () => {
    if (!f.email) return setErr("Écris ton email d'abord.");
    await sendPasswordResetEmail(auth, f.email); setInfo("Email envoyé. Vérifie ta boîte.");
  };
  return (
    <div className="wrap">
      <h2>{mode === "connexion" ? "Se connecter" : "Créer un compte gratuit"}</h2>
      <button className="btn line" style={{ width: "100%", marginBottom: 12 }} onClick={() => signInWithPopup(auth, google).catch(() => setErr("Connexion Google impossible."))}>Continuer avec Google</button>
      <form className="card" onSubmit={go}>
        {mode === "inscription" && <input required placeholder="Nom complet" value={f.nom} onChange={(e) => setF({ ...f, nom: e.target.value })} />}
        <input required type="email" placeholder="Email" value={f.email} onChange={(e) => setF({ ...f, email: e.target.value })} />
        <input required type="password" minLength={6} placeholder="Mot de passe (6 caractères min.)" value={f.mdp} onChange={(e) => setF({ ...f, mdp: e.target.value })} />
        {err && <div className="err">{err}</div>}{info && <div className="ok">{info}</div>}
        <button className="btn big">{mode === "connexion" ? "SE CONNECTER" : "CRÉER MON COMPTE"}</button>
      </form>
      <div className="row">
        <button className="chip" onClick={() => setMode(mode === "connexion" ? "inscription" : "connexion")}>{mode === "connexion" ? "Créer un compte" : "J'ai déjà un compte"}</button>
        {mode === "connexion" && <button className="chip" onClick={reset}>Mot de passe oublié ?</button>}
      </div>
    </div>
  );
}

export function Profile({ user }) {
  const [mes, setMes] = useState([]);
  useEffect(() => {
    if (user) getDocs(query(collection(db, "shops"), where("ownerId", "==", user.uid))).then((s) => setMes(s.docs.map((d) => ({ id: d.id, ...d.data() }))));
  }, [user?.uid]);
  if (!user) return <div className="wrap"><div className="card muted">Connecte-toi pour voir ton profil.<br /><br /><Link className="btn" to="/connexion">Se connecter</Link></div></div>;
  return (
    <div className="wrap">
      <div className="card row"><div className="avatar">{initial(user.displayName || user.email)}</div><div><b>{user.displayName || "Mon compte"}</b><div className="meta">{user.email}</div></div></div>
      <h2>Mes boutiques</h2>
      {mes.length === 0 && <div className="muted">Pas encore de boutique. <Link to="/devenir-commercant">En créer une</Link></div>}
      {mes.map((s) => (
        <div className="card" key={s.id}><Link to={"/boutique/" + s.id}><b>{s.nom}</b></Link>
          <div className="meta">{s.statut === "valide" ? "✅ Visible" : "⏳ En attente de validation (24 h)"}</div></div>
      ))}
      {user.email === ADMIN_EMAIL && <Link className="btn big" to="/admin" style={{ display: "block", marginBottom: 10 }}>Panneau admin</Link>}
      <button className="btn red" onClick={() => signOut(auth)}>Se déconnecter</button>
    </div>
  );
}

export function NewShop({ user }) {
  const nav = useNavigate();
  const [f, setF] = useState({ nom: "", categorie: CATEGORIES[0], whatsapp: "", quartier: "", ville: localStorage.getItem("ville") || "Lomé", description: "", horaires: "", ok: false });
  const [err, setErr] = useState("");
  if (!user) return <div className="wrap"><div className="card muted">Connecte-toi pour inscrire ta boutique (gratuit).<br /><br /><Link className="btn" to="/connexion">Se connecter</Link></div></div>;
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });
  const save = async (e) => {
    e.preventDefault();
    if (!f.ok) return setErr("Coche la case pour afficher ton numéro.");
    try {
      const { ok, ...data } = f;
      await addDoc(collection(db, "shops"), { ...data, ownerId: user.uid, pays: "Togo", statut: "en_attente", premium: false, date_creation: serverTimestamp() });
      alert("Félicitations ! Ta boutique est en attente de validation. Tu seras visible dans 24 h.");
      nav("/profil");
    } catch { setErr("Enregistrement impossible. Réessaie."); }
  };
  return (
    <form className="wrap" onSubmit={save}>
      <h2>Inscrire ma boutique</h2>
      <div className="meta" style={{ marginBottom: 10 }}>Inscription gratuite, 1 minute.</div>
      <input required placeholder="Nom de la boutique" value={f.nom} onChange={set("nom")} />
      <select value={f.categorie} onChange={set("categorie")}>{CATEGORIES.map((c) => <option key={c}>{c}</option>)}</select>
      <input required placeholder="WhatsApp (ex : +22890000000)" value={f.whatsapp} onChange={set("whatsapp")} />
      <select value={f.ville} onChange={set("ville")}>{VILLES.map((v) => <option key={v}>{v}</option>)}</select>
      <input required placeholder="Quartier" value={f.quartier} onChange={set("quartier")} />
      <textarea rows={3} placeholder="Description" value={f.description} onChange={set("description")} />
      <input placeholder="Horaires (ex : 8h - 18h)" value={f.horaires} onChange={set("horaires")} />
      <label className="meta"><input type="checkbox" style={{ width: "auto", marginRight: 8 }} checked={f.ok} onChange={(e) => setF({ ...f, ok: e.target.checked })} />J'accepte que mon numéro soit affiché</label>
      {err && <div className="err">{err}</div>}
      <button className="btn big" style={{ marginTop: 10 }}>INSCRIRE MA BOUTIQUE</button>
    </form>
  );
}

export function Favorites({ user }) {
  const [l, setL] = useState([]);
  useEffect(() => { if (user) getDocs(collection(db, "users", user.uid, "favorites")).then((s) => setL(s.docs.map((d) => ({ id: d.id, ...d.data() })))); }, [user?.uid]);
  if (!user) return <div className="wrap"><div className="card muted">Connecte-toi pour voir tes favoris.<br /><br /><Link className="btn" to="/connexion">Se connecter</Link></div></div>;
  return (
    <div className="wrap"><h2>Mes favoris</h2>
      {l.length === 0 && <div className="muted">Aucun favori. Touche le cœur sur une boutique.</div>}
      {l.map((x) => <div className="card" key={x.id}><Link to={"/boutique/" + x.id}><b>{x.nom}</b></Link></div>)}
    </div>
  );
}

export function Admin({ user }) {
  const [shops, setShops] = useState([]);
  const load = () => getDocs(collection(db, "shops")).then((s) => setShops(s.docs.map((d) => ({ id: d.id, ...d.data() }))));
  useEffect(() => { if (user?.email === ADMIN_EMAIL) load(); }, [user?.uid]);
  if (user?.email !== ADMIN_EMAIL) return <div className="wrap"><div className="card muted">Accès réservé à l'administrateur.</div></div>;
  const act = async (id, data) => { await updateDoc(doc(db, "shops", id), data); load(); };
  const wait = shops.filter((s) => s.statut === "en_attente");
  return (
    <div className="wrap">
      <div className="card"><b>{shops.length}</b> boutiques • <b>{wait.length}</b> en attente • <b>{shops.filter((s) => s.premium).length}</b> premium</div>
      {shops.map((s) => (
        <div className="card" key={s.id}>
          <b>{s.nom}</b> <span className="meta">{s.categorie} • {s.ville} • {s.statut}</span>
          <div className="meta">{s.whatsapp}</div>
          <div className="row" style={{ marginTop: 8 }}>
            {s.statut !== "valide" && <button className="btn sm" onClick={() => act(s.id, { statut: "valide" })}>Valider</button>}
            <button className="btn sm line" onClick={() => act(s.id, { premium: !s.premium })}>{s.premium ? "Retirer Premium" : "Mettre Premium"}</button>
            <button className="btn sm red" onClick={async () => { if (confirm("Supprimer ?")) { await deleteDoc(doc(db, "shops", s.id)); load(); } }}>Supprimer</button>
          </div>
        </div>
      ))}
    </div>
  );
}
