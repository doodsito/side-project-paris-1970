import library from "@/data/photos.json";

export type Photo = {
  id: string;
  src: string;
  largeur: number;
  hauteur: number;
  photographe: string;
  carre: number | null;
  arrondissement: number | null;
  rues: string[];
  urlSource: string;
};

export type Credit = {
  texte: string;
  lien: { texte: string; url: string };
};

export type PhotoLibrary = {
  credit: Credit;
  photos: Photo[];
};

export function getPhotoLibrary(): PhotoLibrary {
  return library as PhotoLibrary;
}
