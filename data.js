const TG = ["Lomé","Kpalimé","Atakpamé","Kara","Sokodé","Dapaong","Tsévié","Aného","Vogan","Notsé","Badou","Bassar","Bafilo","Mango","Sotouboua","Tchamba","Blitta","Elavagnon","Kévé","Tabligbo","Agou","Amlamé","Autre ville"];
export const CATEGORIES = ["Taxi Moto","Taxi Voiture","Livreur","Hôtel","Restaurant","Pharmacie","Marché","Coiffure","Plombier","Électricien","Mécanicien","École","Immobilier","Supermarché","Boutique","Autre"];
export const fmt = (n) => Number(n || 0).toLocaleString("fr-FR").replace(/\u202f/g, " ") + (PAYS[localStorage.getItem("pays")]?.d || " F");

export const PAYS = {
  Togo: { d: " F", v: TG },
  "Bénin": { d: " F", v: ["Cotonou", "Porto-Novo", "Parakou", "Abomey-Calavi", "Autre ville"] },
  Ghana: { d: " GH₵", v: ["Accra", "Kumasi", "Tamale", "Takoradi", "Autre ville"] },
  Burkina: { d: " F", v: ["Ouagadougou", "Bobo-Dioulasso", "Autre ville"] },
  "Côte d'Ivoire": { d: " F", v: ["Abidjan", "Bouaké", "Yamoussoukro", "Autre ville"] },
};
export const VILLES = [...new Set(Object.values(PAYS).flatMap((p) => p.v))];
export const EQUIP = ["Clim", "Ventilateur", "WiFi", "Parking", "Petit-déjeuner"];
const EN = { "Accueil": "Home", "Taxi": "Taxi", "Ma boutique": "My shop", "Favoris": "Favorites", "Profil": "Profile", "Se connecter": "Log in", "Trouve tout près de chez toi": "Find everything near you" };
export const t = (s) => (localStorage.getItem("lang") === "en" && EN[s]) || s;
