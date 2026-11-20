import { useEffect, useState } from "react";
import { Routes, Route, Link, NavLink } from "react-router-dom";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "./firebase";
import { Home, ShopPage, Login, Profile, NewShop, Admin, Favorites } from "./pages.jsx";

export default function App() {
  const [user, setUser] = useState(undefined);
  useEffect(() => onAuthStateChanged(auth, setUser), []);
  if (user === undefined) return <div className="muted">Chargement…</div>;
  return (
    <div className="app">
      <header className="top">
        <Link to="/" className="logo">NOVA-TOGO<i /></Link>
        {user ? <Link to="/profil" className="meta">{user.displayName || user.email}</Link>
              : <Link to="/connexion" className="btn sm">Se connecter</Link>}
      </header>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/boutique/:id" element={<ShopPage user={user} />} />
        <Route path="/connexion" element={<Login user={user} />} />
        <Route path="/profil" element={<Profile user={user} />} />
        <Route path="/devenir-commercant" element={<NewShop user={user} />} />
        <Route path="/favoris" element={<Favorites user={user} />} />
        <Route path="/admin" element={<Admin user={user} />} />
      </Routes>
      <nav className="bar">
        <NavLink to="/" end className={({isActive})=>isActive?"on":""}><span>🏠</span>Accueil</NavLink>
        <NavLink to="/favoris" className={({isActive})=>isActive?"on":""}><span>❤️</span>Favoris</NavLink>
        <NavLink to="/devenir-commercant" className={({isActive})=>isActive?"on":""}><span>🏪</span>Ma boutique</NavLink>
        <NavLink to="/profil" className={({isActive})=>isActive?"on":""}><span>👤</span>Profil</NavLink>
      </nav>
    </div>
  );
}
