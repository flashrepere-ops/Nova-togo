import { useEffect, useState } from "react";
import { Routes, Route, Link, NavLink } from "react-router-dom";
import { onAuthStateChanged } from "firebase/auth";
import { auth, db } from "./firebase";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { t } from "./data";
import { Urgence, Taxi, Orders, Chat, Inbox, Settings, ThemeBtn, initTheme } from "./extra.jsx";
import { Home, ShopPage, Login, Profile, NewShop, Admin, Favorites } from "./pages.jsx";

const mref = location.hash.match(/ref=([\w-]+)/);
if (mref) localStorage.setItem("ref", mref[1]);
initTheme();
export default function App() {
  const [user, setUser] = useState(undefined);
  useEffect(() => onAuthStateChanged(auth, (u) => {
    setUser(u);
    const r = localStorage.getItem("ref");
    if (u && r && r !== u.uid && Date.now() - new Date(u.metadata.creationTime) < 864e5) {
      setDoc(doc(db, "referrals", u.uid), { parrainId: r, date: serverTimestamp() }).catch(() => {});
      localStorage.removeItem("ref");
    }
  }), []);
  if (user === undefined) return <div className="muted">Chargement…</div>;
  return (
    <div className="app">
      <header className="top">
        <Link to="/" className="logo">NOVA-TOGO<i /></Link>
        <div className="row"><Link to="/urgence" style={{textDecoration:"none",fontSize:22}} aria-label="Urgence">🆘</Link><ThemeBtn />
        {user ? <Link to="/profil" className="meta">{user.displayName || user.email}</Link>
              : <Link to="/connexion" className="btn sm">{t("Se connecter")}</Link>}</div>
      </header>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/boutique/:id" element={<ShopPage user={user} />} />
        <Route path="/connexion" element={<Login user={user} />} />
        <Route path="/profil" element={<Profile user={user} />} />
        <Route path="/devenir-commercant" element={<NewShop user={user} />} />
        <Route path="/favoris" element={<Favorites user={user} />} />
        <Route path="/commandes" element={<Orders user={user} />} />
        <Route path="/parametres" element={<Settings user={user} />} />
        <Route path="/taxi" element={<Taxi />} />
        <Route path="/livraison" element={<Taxi kind="Livreur" />} />
        <Route path="/chat/:shopId/:clientId" element={<Chat user={user} />} />
        <Route path="/messages" element={<Inbox user={user} />} />
        <Route path="/urgence" element={<Urgence user={user} />} />
        <Route path="/admin" element={<Admin user={user} />} />
      </Routes>
      <nav className="bar">
        <NavLink to="/" end className={({isActive})=>isActive?"on":""}><span>🏠</span>{t("Accueil")}</NavLink>
        <NavLink to="/taxi" className={({isActive})=>isActive?"on":""}><span>🚕</span>{t("Taxi")}</NavLink>
        <NavLink to="/favoris" className={({isActive})=>isActive?"on":""}><span>❤️</span>{t("Favoris")}</NavLink>
        <NavLink to="/devenir-commercant" className={({isActive})=>isActive?"on":""}><span>🏪</span>{t("Ma boutique")}</NavLink>
        <NavLink to="/profil" className={({isActive})=>isActive?"on":""}><span>👤</span>{t("Profil")}</NavLink>
      </nav>
    </div>
  );
}
