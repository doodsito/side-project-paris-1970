# side-project-paris-1970

Explore Paris in 1970: move your cursor to reveal photographs from the 1970 amateur contest
"C'était Paris en 1970" (Bibliothèque historique de la Ville de Paris, via [paris1970.fr](https://paris1970.fr/)).

Next.js 16, React 19, Tailwind 4, [Motion](https://motion.dev/).

```bash
npm install
npm run dev      # http://localhost:3000
npm run build
npm run lint
```

## Photos

`data/photos.json` lists the photos shown by the trail; the files live in `public/photos/1970/`.
To download a new random selection of 1000 photos from paris1970.fr:

```bash
node scripts/import-1970.mts
```
