const TG = ["Lomé","Kpalimé","Atakpamé","Kara","Sokodé","Dapaong","Tsévié","Aného","Vogan","Notsé","Badou","Bassar","Bafilo","Mango","Sotouboua","Tchamba","Blitta","Elavagnon","Kévé","Tabligbo","Agou","Amlamé","Autre ville"];
const OLD_CATEGORIES = ["Taxi Moto","Taxi Voiture","Livreur","Hôtel","Restaurant","Pharmacie","Marché","Coiffure","Plombier","Électricien","Mécanicien","École","Immobilier","Supermarché","Boutique","Autre"];
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

const T = (k, label, t = "text", req) => ({ k, label, t, req });
const S = (k, label, options) => ({ k, label, options });
const OUI = ["Oui", "Non"];
const ART = [T("tarif", "Tarif de départ (F)", "number"), S("domicile", "Déplacement à domicile", OUI), S("urgence", "Urgences 24h/24", OUI)];
const COM = [S("livraison", "Livraison", OUI), T("phares", "Produits phares")];
export const CHAMPS = {
  "Hôtel": [T("nb_chambres", "Nombre de chambres", "number"), S("petit_dej", "Petit-déjeuner inclus", OUI), S("annulation", "Annulation gratuite 24h", OUI)],
  "Restaurant": [T("cuisine", "Type de cuisine"), T("prix_moyen", "Prix moyen d'un plat (F)", "number"), S("livraison", "Livraison", OUI)],
  "Pharmacie": [S("garde", "Pharmacie de garde", OUI), S("h24", "Ouverte 24h/24", OUI), S("livraison", "Livraison", OUI)],
  "École": [S("niveau", "Niveau", ["Maternelle", "Primaire", "Collège", "Lycée", "Université"]), T("frais", "Frais annuels (F)", "number"), T("reussite", "Taux de réussite (%)", "number")],
  "Taxi Moto": [T("plaque", "Plaque d'immatriculation", "text", true), T("marque", "Marque et couleur de la moto"), S("casque", "Casque fourni", OUI)],
  "Taxi Voiture": [T("plaque", "Plaque d'immatriculation", "text", true), T("marque", "Marque et couleur"), S("clim", "Climatisation", OUI), S("bagages", "Bagages acceptés", OUI), T("places", "Nombre de places", "number")],
  "Livreur": [T("plaque", "Plaque de la moto", "text", true), T("permis", "Numéro de permis", "text", true), S("sac", "Sac NOVA", OUI), T("zone", "Zone de livraison")],
  "Immobilier": [S("type", "Type", ["Location", "Vente", "Les deux"]), T("prix", "Prix à partir de (F)", "number"), T("pieces", "Nombre de pièces", "number")],
  "Coiffure": [T("tarif", "Tarif de départ (F)", "number"), S("domicile", "À domicile", OUI), T("specialites", "Spécialités (tresses, coupe…)")],
  "Plombier": ART, "Électricien": ART, "Mécanicien": ART, "Marché": COM, "Supermarché": COM, "Boutique": COM,
};

const RAW = {
  "Transport et mobilité": ["Taxi Moto", "Taxi Voiture", "Livreur", "Taxi-brousse", "Bus et minibus", "Taxi Tricycle", "Camion de transport", "Transport de marchandises", "Déménagement", "Location de voiture", "Location de moto", "Chauffeur privé", "Auto-école", "Agence de voyage", "Compagnie de bus interurbain", "Gare routière", "Coursier", "Dépannage et remorquage", "Transport fluvial et pirogue", "Billetterie aérienne", "Transport scolaire", "Transport de personnel", "Parking et gardiennage de véhicules"],
  "Hébergement et tourisme": ["Hôtel", "Auberge", "Maison d'hôtes", "Résidence meublée", "Motel", "Gîte et campement", "Éco-lodge", "Guide touristique", "Agence de tourisme", "Site touristique et parc", "Location de salle"],
  "Restauration et boissons": ["Restaurant", "Maquis", "Buvette et bar", "Café", "Boulangerie", "Pâtisserie", "Traiteur", "Fast-food", "Pizzeria", "Vendeuse de foufou", "Vendeuse de riz et haricots", "Vendeuse de beignets et akara", "Vendeur de grillades et brochettes", "Vendeur de poisson braisé", "Glacier", "Vendeur de jus naturels", "Vendeur d'eau en sachet", "Boucherie", "Poissonnerie", "Vendeur de volaille", "Charcuterie", "Fumeur de poisson", "Producteur de sodabi", "Brasserie", "Dépôt de boissons", "Fabricant de glace", "Vendeuse de pâte et sauces", "Vendeur de gari", "Vendeuse d'ablo", "Vendeuse de petit-déjeuner et café", "Cuisine à emporter"],
  "Commerce et marchés": ["Marché", "Supermarché", "Boutique", "Mini-marché de quartier", "Quincaillerie", "Vendeur de pagnes et tissus", "Friperie", "Vendeur de vêtements", "Vendeur de chaussures", "Vendeur de sacs et maroquinerie", "Bijouterie", "Parfumerie", "Cosmétiques", "Librairie et papeterie", "Vendeur de téléphones", "Vendeur d'ordinateurs", "Électroménager", "Magasin de meubles", "Matériaux de construction", "Pièces détachées auto", "Vendeur de pièces de moto", "Vendeur de pneus", "Vendeur de motos", "Concessionnaire automobile", "Vente de voitures d'occasion", "Animalerie", "Fleuriste", "Vendeur de céréales", "Vendeur de fruits et légumes", "Grossiste", "Importateur et exportateur", "Vendeur de gaz", "Vendeur de charbon et bois", "Vendeur d'huile de palme", "Produits locaux", "Vendeur de cartes de recharge", "Vendeur de jouets", "Vendeur d'articles de sport", "Magasin de décoration", "Cadeaux et souvenirs", "Vendeur d'instruments de musique"],
  "Santé et bien-être médical": ["Pharmacie", "Clinique", "Hôpital", "Centre de santé", "Dispensaire", "Maternité", "Cabinet médical", "Médecin généraliste", "Dentiste", "Ophtalmologue", "Opticien", "Laboratoire d'analyses", "Radiologie et imagerie", "Kinésithérapeute", "Infirmier à domicile", "Sage-femme", "Pédiatre", "Gynécologue", "Cardiologue", "Dermatologue", "ORL", "Chirurgien", "Psychologue", "Nutritionniste", "Tradipraticien", "Herboriste", "Vétérinaire", "Pharmacie vétérinaire", "Ambulance", "Pompes funèbres", "Orthopédie et prothèses", "Centre de vaccination"],
  "Beauté et soins": ["Coiffure", "Barbier", "Tresseuse", "Maquillage", "Institut de beauté", "Manucure et pédicure", "Spa et massage", "Perruques et tissages", "Tatoueur", "Épilation", "Soins du visage", "Vendeuse de produits de beauté"],
  "Mode et couture": ["Couturier", "Couturière", "Styliste", "Tailleur", "Brodeur", "Teinturier et batik", "Pressing", "Blanchisserie", "Cordonnier", "Maroquinier", "Tisserand de pagnes (kenté)", "Créateur de bijoux", "Location de tenues", "Retouches"],
  "Bâtiment et construction": ["Maçon", "Plombier", "Électricien", "Peintre en bâtiment", "Carreleur", "Menuisier", "Menuisier aluminium", "Charpentier", "Couvreur", "Ferrailleur", "Soudeur", "Serrurier", "Vitrier", "Plâtrier", "Pose de faux plafond", "Étanchéité et toiture", "Entrepreneur en bâtiment", "Architecte", "Ingénieur civil", "Géomètre", "Bureau d'études", "Conducteur d'engins", "Terrassement", "Démolition", "Forage de puits", "Installateur de panneaux solaires", "Climaticien", "Frigoriste", "Antenniste", "Installateur de caméras de surveillance", "Fabricant de briques et parpaings", "Carrière de sable et gravier", "Décorateur d'intérieur", "Paysagiste"],
  "Mécanique et automobile": ["Mécanicien", "Mécanicien moto", "Garagiste", "Électricien auto", "Tôlier et carrossier", "Peintre auto", "Vulcanisateur", "Lavage auto", "Vidange", "Contrôle technique", "Station-service", "Vendeur de lubrifiants", "Mécanicien poids lourds", "Mécanicien d'engins", "Réparateur de vélos", "Climatisation auto", "Tapissier auto"],
  "Électronique, informatique et télécom": ["Réparateur de téléphones", "Réparateur d'ordinateurs", "Réparateur de télévisions", "Dépanneur d'électroménager", "Cybercafé", "Développeur web et mobile", "Agence digitale", "Imprimerie numérique", "Photocopie et reprographie", "Infographiste", "Installateur de réseaux", "Agent mobile money", "Revendeur de crédit téléphonique", "Fournisseur d'accès internet", "Opérateur télécom", "Community manager", "Formateur en informatique", "Vendeur d'accessoires téléphoniques"],
  "Éducation et formation": ["École", "Crèche et garderie", "École maternelle", "École primaire", "Collège", "Lycée", "Université", "Institut supérieur", "Centre de formation professionnelle", "Cours particuliers", "École de langues", "École d'informatique", "École de musique", "École de danse", "École de couture", "École d'esthétique", "École d'infirmiers", "École coranique", "Centre d'alphabétisation", "Bibliothèque", "Formateur indépendant"],
  "Immobilier et logement": ["Immobilier", "Agent immobilier", "Location de maison", "Chambre à louer", "Colocation", "Vente de terrain", "Vente de maison", "Location de bureaux", "Entrepôt à louer", "Gestionnaire de biens"],
  "Juridique, finance et administration": ["Avocat", "Huissier de justice", "Notaire", "Cabinet comptable", "Expert-comptable", "Fiscaliste", "Conseiller en investissement", "Banque", "Microfinance", "Tontine et épargne", "Assurance", "Bureau de change", "Transfert d'argent", "Cabinet de recrutement", "Agence d'intérim", "Agence de communication", "Agence de publicité", "Imprimerie", "Cabinet de conseil", "Cabinet d'audit", "Écrivain public", "Traducteur et interprète"],
  "Agriculture, élevage et pêche": ["Agriculteur", "Maraîcher", "Producteur de maïs", "Producteur de manioc et igname", "Producteur de café et cacao", "Producteur de coton", "Éleveur de volaille", "Éleveur de porcs", "Éleveur de bovins", "Éleveur de chèvres et moutons", "Pisciculteur", "Pêcheur", "Apiculteur", "Transformation agroalimentaire", "Meunier", "Vente d'engrais et semences", "Pépinière", "Matériel agricole", "Abattoir"],
  "Artisanat et industrie": ["Sculpteur", "Potier", "Forgeron", "Vannier", "Fabricant de nattes", "Fabricant de meubles", "Ébéniste", "Tapissier", "Fabricant de savon", "Artisan du cuir", "Fabricant de tambours et instruments", "Peintre artiste", "Graveur", "Fonderie", "Menuisier métallique", "Fabricant de sachets d'eau", "Usine et industrie"],
  "Événements, médias et divertissement": ["Photographe", "Vidéaste", "Studio d'enregistrement", "DJ et sonorisation", "Animateur et maître de cérémonie", "Traiteur événementiel", "Décorateur d'événements", "Location de matériel (chaises, tables, sono, tente)", "Salle des fêtes", "Organisateur de mariages", "Musicien", "Groupe de musique traditionnelle", "Artiste", "Comédien", "Humoriste", "Danseur", "Réalisateur", "Producteur de musique", "Cinéma", "Radio", "Télévision", "Journaliste", "Influenceur", "Boîte de nuit", "Bar lounge", "Salle de jeux", "Agent de paris sportifs", "Animateur d'enfants"],
  "Sport et loisirs": ["Salle de sport", "Coach sportif", "Terrain de football", "Académie de football", "Piscine", "Club de sport", "Arts martiaux", "Yoga et méditation", "Parc de jeux", "Club de cyclisme", "Équitation", "Tennis", "Basket-ball", "Pétanque"],
  "Religion et associations": ["Église", "Mosquée", "Temple", "Pasteur et ministère", "Imam", "Mission religieuse", "Association", "ONG", "Fondation", "Orphelinat", "Mutuelle", "Chefferie traditionnelle"],
  "Services à domicile et entretien": ["Nettoyage de maison", "Femme de ménage", "Garde d'enfants", "Cuisinier à domicile", "Jardinier", "Gardien et agent de sécurité", "Désinsectisation", "Vidangeur", "Réparation à domicile", "Livraison d'eau", "Collecte de déchets", "Assainissement", "Déboucheur de canalisations", "Lavage de tapis et fauteuils", "Aide-soignant à domicile", "Coiffeur à domicile", "Cours à domicile", "Lavandière"],
  "Énergie, eau et environnement": ["Électricité (CEET)", "Eau (TdE)", "Vendeur de panneaux solaires", "Vendeur de groupes électrogènes", "Vendeur de batteries et onduleurs", "Station de gaz", "Énergie renouvelable", "Traitement de l'eau", "Recyclage", "Biogaz"],
  "Transit, logistique et import-export": ["Transitaire", "Commissionnaire en douane", "Entrepôt", "Manutentionnaire", "Logistique", "Courrier express", "Messagerie", "Agence de fret", "Groupage", "Port et cargo"],
  "Services publics et urgence": ["Mairie", "Pompiers", "Police", "Gendarmerie", "Protection civile", "Croix-Rouge", "Tribunal", "Préfecture", "La Poste", "Impôts et douanes (OTR)", "Cadastre", "Ambassade et consulat", "Inspection du travail", "Centre d'état civil", "Urgences"],
  "Autre": ["Autre"],
};
const seen = new Set();
export const DOMAINES = Object.fromEntries(Object.entries(RAW).map(([k, l]) => [k, l.filter((c) => !seen.has(c) && seen.add(c))]));
export const CATEGORIES = Object.values(DOMAINES).flat();
export const DOM_OF = Object.fromEntries(Object.entries(DOMAINES).flatMap(([k, l]) => l.map((c) => [c, k])));
CHAMPS["Autre"] = [T("metier", "Précise ton métier ou ton activité", "text", true)];
const SERV = [T("tarif", "Tarif de départ (F)", "number"), S("domicile", "Déplacement à domicile", OUI), T("specialites", "Spécialités")];
const DOMCH = {
  "Transport et mobilité": [T("plaque", "Plaque (si véhicule)"), T("zone", "Zone ou trajet desservi"), T("tarif", "Tarif de départ (F)", "number")],
  "Santé et bien-être médical": [S("garde", "De garde", OUI), S("domicile", "Consultation à domicile", OUI), T("tarif", "Tarif de consultation (F)", "number")],
  "Beauté et soins": SERV, "Mode et couture": SERV, "Bâtiment et construction": ART, "Mécanique et automobile": ART, "Électronique, informatique et télécom": ART, "Services à domicile et entretien": ART,
  "Restauration et boissons": COM, "Commerce et marchés": COM, "Agriculture, élevage et pêche": COM, "Artisanat et industrie": COM,
  "Éducation et formation": CHAMPS["École"], "Hébergement et tourisme": CHAMPS["Hôtel"],
  "Événements, médias et divertissement": [T("tarif", "Tarif de départ (F)", "number"), S("deplacement", "Déplacement possible", OUI)],
  "Juridique, finance et administration": [T("specialites", "Domaine de spécialité"), S("rdv", "Sur rendez-vous", OUI)],
  "Immobilier et logement": CHAMPS["Immobilier"],
};
export const champsDe = (c) => CHAMPS[c] || DOMCH[DOM_OF[c]] || [];

export const dist = (k) => (k < 1 ? Math.round(k * 1000) + " m" : k.toFixed(1).replace(".", ",") + " km");
