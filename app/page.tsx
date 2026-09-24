import CursorTrail from "@/components/cursor-trail";
import { getPhotoLibrary } from "@/lib/photos";

export default function Home() {
  const { credit, photos } = getPhotoLibrary();
  const trailPhotos = photos.map(({ id, src, largeur, hauteur }) => ({
    id,
    src,
    largeur,
    hauteur,
  }));

  return (
    <main className="relative h-dvh w-screen touch-none overflow-hidden select-none">
      <footer className="pointer-events-none absolute inset-x-0 bottom-0 z-10 flex flex-col gap-2 p-4 text-base leading-snug md:flex-row md:items-end md:justify-between md:gap-8 md:p-8">
        <p className="md:max-w-[45%]">
          © 2026 Paris by{" "}
          <a
            className="pointer-events-auto underline"
            href="https://www.doodsito.com/"
            target="_blank"
            rel="noopener noreferrer"
          >
            Doodsito
          </a>
          . All rights reserved.
        </p>
        <p className="md:max-w-[45%] md:text-right">
          {credit.texte}{" "}
          <a
            className="pointer-events-auto underline"
            href={credit.lien.url}
            target="_blank"
            rel="noopener noreferrer"
          >
            {credit.lien.texte}
          </a>
        </p>
      </footer>

      <CursorTrail photos={trailPhotos} />

      <h1 className="pointer-events-none absolute inset-0 z-20 flex items-center justify-center text-[clamp(48px,12vw,80px)] font-bold tracking-[-0.02em]">
        PARIS
      </h1>
    </main>
  );
}
