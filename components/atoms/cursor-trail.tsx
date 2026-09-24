"use client";

import {
  AnimatePresence,
  motion,
  useMotionValue,
  useMotionValueEvent,
  useTransform,
  wrap,
} from "motion/react";
import { useEffect, useRef, useState } from "react";

const SPAWN_DISTANCE = 100; // px travelled between two images
const IMAGE_WIDTH = 200; // px
const IMAGE_LIFETIME = 2000; // ms before the fade-out, paused while hovered
const MAX_IMAGES = 24;

type TrailPhoto = {
  id: string;
  src: string;
  largeur: number;
  hauteur: number;
};

type TrailImage = {
  key: number;
  photo: TrailPhoto;
  x: number;
  y: number;
};

// Equivalent of Motion+'s usePointerPosition, which is not in the free package.
function usePointerPosition() {
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  useEffect(() => {
    const onMove = (event: PointerEvent) => {
      x.set(event.clientX);
      y.set(event.clientY);
    };
    window.addEventListener("pointermove", onMove);
    return () => window.removeEventListener("pointermove", onMove);
  }, [x, y]);

  return { x, y };
}

function shuffle<T>(items: T[]): T[] {
  const result = [...items];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

export default function CursorTrail({ photos }: { photos: TrailPhoto[] }) {
  const [queue] = useState(() => shuffle(photos));
  const [images, setImages] = useState<TrailImage[]>([]);
  const lastSpawn = useRef({ x: 0, y: 0 });
  const count = useRef(0);
  const removalTimers = useRef(new Map<number, ReturnType<typeof setTimeout>>());

  const scheduleRemoval = (key: number) => {
    removalTimers.current.set(
      key,
      setTimeout(() => {
        removalTimers.current.delete(key);
        setImages((current) => current.filter((image) => image.key !== key));
      }, IMAGE_LIFETIME),
    );
  };

  // Keep an image on screen while the pointer rests on it.
  const cancelRemoval = (key: number) => {
    clearTimeout(removalTimers.current.get(key));
    removalTimers.current.delete(key);
  };

  useEffect(() => {
    const timers = removalTimers.current;
    return () => timers.forEach(clearTimeout);
  }, []);

  const { x, y } = usePointerPosition();
  const distance = useTransform([x, y], ([px, py]: number[]) =>
    Math.hypot(px - lastSpawn.current.x, py - lastSpawn.current.y),
  );

  useMotionValueEvent(distance, "change", (value) => {
    if (value < SPAWN_DISTANCE) return;
    const point = { x: x.get(), y: y.get() };
    lastSpawn.current = point;

    const key = count.current++;
    const photo = queue[wrap(0, queue.length, key)];
    new Image().src = queue[wrap(0, queue.length, key + 1)].src;

    setImages((current) =>
      [...current, { key, photo, ...point }].slice(-MAX_IMAGES),
    );
    scheduleRemoval(key);
  });

  if (queue.length === 0) return null;

  return (
    <div className="pointer-events-none absolute inset-0 z-0">
      <AnimatePresence>
        {images.map(({ key, photo, x, y }) => (
          <motion.img
            key={key}
            src={photo.src}
            alt=""
            draggable={false}
            width={IMAGE_WIDTH}
            height={Math.round((IMAGE_WIDTH * photo.hauteur) / photo.largeur)}
            className="pointer-events-auto absolute max-w-none"
            style={{ left: x, top: y, x: "-50%", y: "-50%" }}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onPointerEnter={() => cancelRemoval(key)}
            onPointerLeave={() => {
              cancelRemoval(key);
              scheduleRemoval(key);
            }}
          />
        ))}
      </AnimatePresence>
    </div>
  );
}
