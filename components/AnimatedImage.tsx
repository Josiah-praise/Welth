"use client";
import Image from "next/image";
import { useRef, useEffect, useState } from "react";

export default function AnimatedImage() {
  const ref = useRef(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        // entry.boundingClientRect.top will give you the distance from top
        if (entry.isIntersecting) {
          setInView(true);
        } else {
          setInView(false);
        }
      },
      {
        root: null, // viewport
        threshold: 1, // 10% of the element is visible
      }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => {
      if (ref.current) observer.unobserve(ref.current);
    };
  }, []);

  return (
    <div className="ai-image-con">
      <Image
        ref={ref}
        src="/images/banner.jpeg"
        alt="Banner"
        width={1280}
        height={720}
        priority
        className={`ai-image ${inView ? "ai-image-scrolled" : ""}`}
      />
    </div>
  );
}
