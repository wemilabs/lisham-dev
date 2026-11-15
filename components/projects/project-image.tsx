"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";

const fallbackImage =
  "https://ubrw5iu3hw.ufs.sh/f/TFsxjrtdWsEIIU0MlBPxpbxQUqOZN6A0LHBjPY4Vlwumcioz";

export function ProjectImage({ src, alt }: { src?: string; alt: string }) {
  const [failed, setFailed] = useState(false);
  const imageRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    const image = imageRef.current;
    if (image?.complete && image.naturalWidth === 0) {
      setFailed(true);
    }
  }, []);

  const imageSrc = failed || !src ? fallbackImage : src;

  return (
    <Image
      ref={imageRef}
      src={imageSrc}
      alt={alt}
      fill
      loading="eager"
      sizes="(max-width: 767px) calc(100vw - 2rem), (max-width: 1279px) calc(50vw - 2.5rem), 35rem"
      className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
      onError={() => setFailed(true)}
      unoptimized={imageSrc.startsWith("https://opengraph.githubassets.com/")}
    />
  );
}
