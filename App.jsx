import { useEffect, useState } from "react";
import { Ic } from "./icons.jsx";
import { Routes, Route, NavLink, useLocation } from "react-router-dom";
import { onAuthStateChanged } from "firebase/auth";
import { Admin } from "./admin.jsx";
import { auth, db } from "./firebase";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { t } from "./data";
import { Urgence, Taxi, Orders, Chat, Inbox, Settings, ThemeBtn, initTheme } from "./extra.jsx";
import { Home, ShopPage, Login, Profile, NewShop, Favorites } from "./pages.jsx";

const mref = location.hash.match(/ref=([\w-]+)/);
if (mref) localStorage.setItem("ref", mref[1]);
initTheme();
export default function App() {
  const [user, setUser] = useState(undefined);
  const loc = useLocation();
  const [prof, setProf] = useState({});
  useEffect(() => {
    const h = () => auth.currentUser && getDoc(doc(db, "users", auth.currentUser.uid)).then((d) => setProf(d.exists() ? d.data() : {})).catch(() => {});
    window.addEventListener("prof", h); return () => window.removeEventListener("prof", h);
  }, []);
  useEffect(() => onAuthStateChanged(auth, (u) => {
    setUser(u);
    if (u) setDoc(doc(db, "users", u.uid), { email: u.email || "", nom: u.displayName || "", creation: u.metadata.creationTime || "", dernier: serverTimestamp() }, { merge: true }).catch(() => {});
    if (u) getDoc(doc(db, "users", u.uid)).then((d) => setProf(d.exists() ? d.data() : {})).catch(() => {});
    const r = localStorage.getItem("ref");
    if (u && r && r !== u.uid && Date.now() - new Date(u.metadata.creationTime) < 864e5) {
      setDoc(doc(db, "referrals", u.uid), { parrainId: r, date: serverTimestamp() }).catch(() => {});
      localStorage.removeItem("ref");
    }
  }), []);
  const TABS = [["/", "home", "Accueil"], ["/commandes", "list", "Commandes"], ["/favoris", "heart", "Favoris"], ["/messages", "chat", "Chat"], ["/profil", "user", "Profil"]];
  const idx = TABS.findIndex(([to]) => (to === "/" ? loc.pathname === "/" : loc.pathname.startsWith(to)));
  const vu = user ? { uid: user.uid, email: user.email, displayName: prof.nom || user.displayName, photoURL: prof.photo || user.photoURL, metadata: user.metadata } : user;
  if (user === undefined) return <div className="muted">Chargement…</div>;
  return (
    <div className="app">
      
      <Routes>
        <Route path="/" element={<Home user={vu} />} />
        <Route path="/boutique/:id" element={<ShopPage user={vu} />} />
        <Route path="/connexion" element={<Login user={vu} />} />
        <Route path="/profil" element={<Profile user={vu} />} />
        <Route path="/devenir-commercant" element={<NewShop user={vu} />} />
        <Route path="/favoris" element={<Favorites user={vu} />} />
        <Route path="/commandes" element={<Orders user={vu} />} />
        <Route path="/parametres" element={<Settings user={vu} />} />
        <Route path="/taxi" element={<Taxi />} />
        <Route path="/livraison" element={<Taxi kind="Livreur" />} />
        <Route path="/chat/:shopId/:clientId" element={<Chat user={vu} />} />
        <Route path="/messages" element={<Inbox user={vu} />} />
        <Route path="/urgence" element={<Urgence user={vu} />} />
        <Route path="/admin" element={<Admin user={vu} />} />
      </Routes>
      <nav className="bar" style={{ "--i": idx }}>
        <i className="nav-bubble" style={{ opacity: idx < 0 ? 0 : 1 }} />
        {TABS.map(([to, ic, lb]) => (
          <NavLink key={to} to={to} end={to === "/"} className={({ isActive }) => (isActive ? "on" : "")}><span><Ic n={ic} /></span>{t(lb)}</NavLink>
        ))}
      </nav>
    </div>
  );
}
