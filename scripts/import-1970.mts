// Downloads a random selection of photos from paris1970.fr and rewrites data/photos.json.
// Usage: node scripts/import-1970.mts

import { existsSync } from "node:fs";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const PHOTO_COUNT = 1000;
const CONCURRENCY = 5;
const SITE = "https://paris1970.fr";
const IMAGE_HOST = "https://pub-08d023092185417c817680c3e7c9f152.r2.dev";

const root = path.join(import.meta.dirname, "..");
const outputDir = path.join(root, "public", "photos", "1970");
const jsonPath = path.join(root, "data", "photos.json");

type CarreSummary = { number: number; hasPhotos: boolean; arrondissement: number | null };
type Carre = {
  number: number;
  candidates: {
    name: string;
    locations: string[];
    pictures: { filename: string; viewerUrl: string; thumbnailUrl: string }[];
  }[];
};
type Candidate = {
  id: string;
  imageUrl: string;
  photographe: string;
  carre: number;
  arrondissement: number | null;
  rues: string[];
  urlSource: string;
};

async function getJson<T>(url: string): Promise<T> {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`${response.status} ${url}`);
  return (await response.json()) as T;
}

async function mapLimit<T, R>(items: T[], limit: number, fn: (item: T) => Promise<R>): Promise<R[]> {
  const results: R[] = new Array(items.length);
  let next = 0;
  const worker = async () => {
    while (next < items.length) {
      const index = next++;
      results[index] = await fn(items[index]);
    }
  };
  await Promise.all(Array.from({ length: limit }, worker));
  return results;
}

function shuffle<T>(items: T[]): T[] {
  const result = [...items];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

// Reads width and height from a WebP header (lossy VP8, lossless VP8L or extended VP8X).
function webpSize(buffer: Buffer): { largeur: number; hauteur: number } {
  const chunk = buffer.toString("ascii", 12, 16);
  if (chunk === "VP8 ") {
    return { largeur: buffer.readUInt16LE(26) & 0x3fff, hauteur: buffer.readUInt16LE(28) & 0x3fff };
  }
  if (chunk === "VP8L") {
    const bits = buffer.readUInt32LE(21);
    return { largeur: (bits & 0x3fff) + 1, hauteur: ((bits >> 14) & 0x3fff) + 1 };
  }
  if (chunk === "VP8X") {
    return { largeur: buffer.readUIntLE(24, 3) + 1, hauteur: buffer.readUIntLE(27, 3) + 1 };
  }
  throw new Error(`Unknown WebP chunk: ${chunk}`);
}

const index = await getJson<{ carres: CarreSummary[] }>(`${SITE}/data/carres-index.json`);
const summaries = index.carres.filter((carre) => carre.hasPhotos);
console.log(`${summaries.length} carrés avec photos, lecture...`);

const carres = await mapLimit(summaries, CONCURRENCY, (summary) =>
  getJson<Carre>(`${SITE}/data/carres/${summary.number}.json`),
);

const candidates: Candidate[] = carres.flatMap((carre, i) =>
  carre.candidates.flatMap((candidate) =>
    candidate.pictures.map((picture) => ({
      id: picture.filename.replace(/\.jpg$/, ""),
      imageUrl: IMAGE_HOST + picture.thumbnailUrl.replace(/\.jpg$/, ".webp"),
      photographe: candidate.name,
      carre: carre.number,
      arrondissement: summaries[i].arrondissement,
      rues: candidate.locations,
      urlSource: picture.viewerUrl,
    })),
  ),
);
console.log(`${candidates.length} photos trouvées, téléchargement de ${PHOTO_COUNT}...`);

await mkdir(outputDir, { recursive: true });
let done = 0;
const photos = await mapLimit(shuffle(candidates).slice(0, PHOTO_COUNT), CONCURRENCY, async (photo) => {
  const file = path.join(outputDir, `${photo.id}.webp`);
  let buffer: Buffer;
  if (existsSync(file)) {
    buffer = await readFile(file);
  } else {
    const response = await fetch(photo.imageUrl);
    if (!response.ok) throw new Error(`${response.status} ${photo.imageUrl}`);
    buffer = Buffer.from(await response.arrayBuffer());
    await writeFile(file, buffer);
  }
  if (++done % 100 === 0) console.log(`${done}/${PHOTO_COUNT}`);
  return {
    id: photo.id,
    src: `/photos/1970/${photo.id}.webp`,
    ...webpSize(buffer),
    photographe: photo.photographe,
    carre: photo.carre,
    arrondissement: photo.arrondissement,
    rues: photo.rues,
    urlSource: photo.urlSource,
  };
});

const library = {
  credit: {
    texte: "© Photos. Bibliothèque historique de la Ville de Paris.",
    lien: { texte: "paris1970.fr", url: "https://paris1970.fr/" },
  },
  photos,
};
await writeFile(jsonPath, JSON.stringify(library, null, 2) + "\n");
console.log(`${photos.length} photos écrites dans data/photos.json`);
