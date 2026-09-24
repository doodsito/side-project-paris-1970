# V1 - Paris cursor trail

Objectif : page plein écran noire, « PARIS » au centre, traînée de photos qui suit le curseur,
footer crédits. D'abord avec des photos factices, puis avec 1000 photos du concours
« C'était Paris en 1970 » importées par script.

## Décisions validées

- Next.js 16 + React 19 + Tailwind 4 (déjà en place). Lire `node_modules/next/dist/docs/` avant de coder.
- Pas de BDD : un fichier `data/photos.json` (crédit global + liste de photos).
- Champs photo en français : `id, src, largeur, hauteur, photographe, carre, arrondissement, rues, urlSource`. Code en anglais.
- Photos hébergées dans `public/photos/` (factices) et `public/photos/1970/` (import).
- Animation : réécriture de l'exemple Motion cursor-trail (source payante, `usePointerPosition` absent du paquet gratuit -> hook maison).
- Ordre : liste mélangée au chargement puis parcourue avec `wrap`.
- Pas de graine, pas de liste d'exclusion : on télécharge 1000 photos une fois, on les sert au hasard.

## Changement validé : pas de `sharp`

Les miniatures de paris1970.fr sont déjà en WebP (~26 Ko, 338x512 pour l'exemple testé).
1000 photos ≈ 26 Mo, sans conversion. Proposition : **les télécharger telles quelles, sans `sharp`**.
Les champs `largeur`/`hauteur` restent, mais sont remplis avec la taille réelle lue dans l'en-tête WebP
(quelques lignes de code, sans dépendance). -> une seule nouvelle dépendance : `motion`.

## Plan

### 0. Préparation
- [ ] Renommer `my-app/` en `paris/` (bloqué : dossier verrouillé par VS Code, à faire à la main)
- [x] `name: "paris"` dans package.json
- [x] `npm install motion`
- [x] Lire la doc Next 16 embarquée (fonts, app router, metadata, images statiques)

### 1. Données
- [x] Type `Photo` + `PhotoLibrary` (crédit + photos) dans `lib/photos.ts`, seule partie qui connaît le format
- [x] 25 photos libres de Paris (Wikimedia Commons, Unsplash exige une clé d'API) dans `public/photos/`, crédit « Photos : Wikimedia Commons »

### 2. Mise en page
- [x] `layout.tsx` : Inter via `next/font/google`, `<title>Paris</title>`, fond #000, texte #FFF
- [x] `page.tsx` : plein écran `100vw x 100dvh`, `overflow: hidden`
- [x] `<h1>PARIS</h1>` centré, Inter 700, 80px (`clamp()` sur mobile), `-0.02em`
- [x] Footer gauche : « © 2026 Paris by Doodsito. All rights reserved. » (lien doodsito.com)
- [x] Footer droit : crédit lu dans `photos.json`
- [x] Liens : blancs, toujours soulignés, nouvel onglet ; footer 16px, en colonne sous 768px
- [x] Empilement : images (z-0) < footer (z-10, liens cliquables) < PARIS (z-20)

### 3. Animation (composant client `CursorTrail`)
- [x] Hook `usePointerPosition` maison : motion values x/y sur `pointermove` (souris + tactile)
- [x] `useTransform` + `useMotionValueEvent` : nouvelle image tous les ~100px parcourus
- [x] `wrap` sur la liste mélangée pour choisir la photo suivante
- [x] `motion.img` + `AnimatePresence` : fondu de sortie après ~1s, 12 images max
- [x] Images ~240px de large, proportions gardées, centrées sur le curseur, angles droits, sans ombre
- [x] Constantes regroupées en haut du fichier
- [x] `animate` : non utilisé, `motion.img` + `AnimatePresence` suffisent

### 4. Vérification V1 factice
- [x] `npm run lint` et `npm run build` passent
- [x] `npm run dev` : vérifier rendu desktop + largeur mobile, images jamais devant PARIS, pas de scroll

### 5. Import 1970 (`scripts/import-1970.mts`, lancé avec `node scripts/import-1970.mts`)
- [x] Lire `carres-index.json`, puis le JSON de chaque carré avec photos
- [x] Tirer 1000 photos au hasard
- [x] Télécharger les WebP depuis leur bucket, 5 téléchargements simultanés max, dans `public/photos/1970/`
- [x] Écrire `data/photos.json` avec le crédit « Photos : C'était Paris en 1970, Bibliothèque historique de la Ville de Paris, via paris1970.fr »

### 6. Vérification finale
- [x] Lancer le script, vérifier ~1000 fichiers et le JSON
- [x] `npm run lint`, `npm run build`, `npm run dev` : les photos 1970 s'affichent sans toucher au code du site

## Hors V1
- Déploiement Vercel
- Lire les conditions de réutilisation BHVP avant mise en ligne

## Review
- Vérifié : `npm run lint`, `npx tsc --noEmit`, `npm run build` OK. Test dans Chrome headless (1600x900 souris, 390x844 tactile) :
  les images apparaissent et disparaissent, z-index footer 0 < images 10 < PARIS 20, pas de scroll, Inter 700 72px (48px mobile), footer 24px (14px mobile).
- Import : 1177 carrés, 30 225 photos trouvées, 1000 téléchargées en ~2 min, 35 Mo, 21 arrondissements. Dimensions vérifiées avec sharp sur un échantillon.
- Bug corrigé : `useTransform(() => ...)` ne suit que les motion values lues au premier calcul ; passé à `useTransform([x, y], ...)`.
- Script en `.mts` et non `.ts` : sinon Node affiche un avertissement de type de module.
- Photos factices supprimées après validation. Tailles ajustées : PARIS 80px, footer 16px.
- Ajouts après V1 : favicon `app/icon.svg` (icône Lucide Studio blanche sur carré noir, remplace `favicon.ico`),
  meta description « Explore Paris in 1970. ... », `lang="en"`, image gardée à l'écran tant que le curseur est dessus
  (testé dans Chrome : l'image survolée reste 6 s+, disparaît 2 s après être sortie).
