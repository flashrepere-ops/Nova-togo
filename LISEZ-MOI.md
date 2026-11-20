# NOVA-TOGO V1

Annuaire par ville : commerçants, produits, avis, favoris, WhatsApp/Appel, panneau admin.

## ÉTAPE 1 : Firebase (console.firebase.google.com)
1. Ouvre ton projet `nova-togo`.
2. **Authentication** > Commencer > onglet *Sign-in method* : active **Google** et **E-mail/Mot de passe**.
3. **Firestore Database** > Créer une base > mode production > région `eur3` (Europe) ou la plus proche.
4. Onglet **Règles** de Firestore : copie tout le contenu du fichier `firestore.rules`.
   Remplace `ton-email@gmail.com` par TON email, puis **Publier**.
5. **Paramètres du projet** (roue dentée) > *Tes applications* > application Web : copie le bloc `firebaseConfig`.

## ÉTAPE 2 : Configurer le code
Ouvre `src/firebaseConfig.js` et remplace les `COLLE_ICI` par tes valeurs.
Remplace aussi `ADMIN_EMAIL` par ton email.

## ÉTAPE 3 : GitHub
1. Crée un dépôt privé `nova-togo` sur github.com.
2. **Add file > Upload files** : glisse TOUT le contenu du dossier dézippé (pas le zip lui-même), puis **Commit changes**.
   Astuce : si le dossier `src` ne passe pas, envoie les fichiers dossier par dossier.

## ÉTAPE 4 : Mettre en ligne (Vercel, gratuit)
1. vercel.com > Se connecter avec GitHub > **Add New Project** > choisis `nova-togo` > **Deploy**.
2. Tu obtiens un lien du type `https://nova-togo.vercel.app`.
3. Retourne dans Firebase > **Authentication > Settings > Domaines autorisés** > **Ajouter** ton domaine Vercel.
   (Sans ça, la connexion Google ne marchera pas.)

## ÉTAPE 5 : Tester
1. Ouvre le lien, crée un compte, va dans *Ma boutique* et inscris une boutique.
2. Connecte-toi avec ton email admin : Profil > *Panneau admin* > **Valider**.
3. La boutique apparaît sur l'accueil. Ajoute des produits depuis sa fiche.
4. Sur Android/Chrome : menu ⋮ > *Installer l'application*.

## Notes
- Photos : pas incluses en V1 (Firebase Storage demande maintenant le plan payant Blaze). On les ajoute à l'étape suivante.
- Abonnements Premium : tu actives le badge toi-même depuis l'admin après réception du paiement Flooz/Yas.
- Limites : 3 produits (Normal), 10 (Premium).
