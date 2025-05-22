"use client";
import Image from "next/image";
import { useRef, useEffect, useState } from "react";

export default function AnimatedImage() {

  const imageRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    const imageElement = imageRef.current;

    if (!imageElement) return;

    const handleScroll = () => {
      const scrollPosition = window.scrollY;
      const scrollThreshold = 100;

      if (scrollPosition > scrollThreshold) {
        imageElement.classList.add("ai-image-scrolled");
      } else {
        imageElement.classList.remove("ai-image-scrolled");
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="ai-image-con px-2 md:px-0">
      <Image
        ref={imageRef}
        src="/images/banner.jpeg"
        alt="Banner"
        width={1280}
        height={720}
        priority
        className={`ai-image`}
      />
    </div>
  );
}
