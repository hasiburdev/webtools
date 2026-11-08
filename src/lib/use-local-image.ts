"use client";

import { useEffect, useRef, useState } from "react";
import { readLocalImage, type LocalImage } from "./browser-images";

export function useLocalImage() {
  const [image, setImage] = useState<LocalImage | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const version = useRef(0);

  useEffect(() => () => { version.current++; }, []);
  useEffect(() => () => { if (image) URL.revokeObjectURL(image.url); }, [image]);

  async function selectFiles(files: File[]) {
    if (!files[0]) return;
    const request = ++version.current;
    setLoading(true);
    setError("");
    try {
      const next = await readLocalImage(files[0]);
      if (request !== version.current) URL.revokeObjectURL(next.url);
      else setImage(next);
    } catch (error) {
      if (request === version.current) setError(error instanceof Error ? error.message : "Could not open this image.");
    } finally {
      if (request === version.current) setLoading(false);
    }
  }

  function clear() {
    version.current++;
    setImage(null);
    setLoading(false);
    setError("");
  }

  return { image, error, loading, selectFiles, clear };
}
