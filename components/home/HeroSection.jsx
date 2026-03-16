"use client";
import Link from "next/link";
import { useEffect, useRef } from "react";

import Image from "next/image";
import { Button } from "../ui/button";

export default function HeroSection() {
  // Ref to the image element for scroll effect
  const imageRef = useRef(null);

  // Scroll effect to add a class when the user scrolls down
  useEffect(() => {
    const imageElement = imageRef.current;
    if (!imageElement) return;
    const handleScroll = () => {
      const scrollPosition = window.scrollY;
      const scrollThreshold = 100;
      if (scrollPosition > scrollThreshold) {
        imageElement.classList.add("scrolled");
      } else {
        imageElement.classList.remove("scrolled");
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  return (
    // Hero section with title, description, buttons, and image
    <section className="w-full pt-32 md:pt-40 pb-10">
      <div className="space-y-6 text-center">
        <div className="space-y-6 mx-auto">
          <h1 className="text-5xl font-bold md:text-6xl lg:text-7xl xl:text-8xl gradient-title">
            Your AI Career Coach for
            <br />
            Professional Growth
          </h1>
          <p className="mx-auto max-w-150 text-muted-foreground md:text-xl">
            Unlock your career potential with personalized AI guidance,
            interview preparation, and AI-powered resume optimization.
          </p>
        </div>

        <div className="flex justify-center space-x-4">
          <Link href="/dashboard">
            <Button size="lg" className="px-8">
              Get Started
            </Button>
          </Link>
          <Link href="/dashboard">
            <Button size="lg" className="px-8" variant="outline">
              Demo Video
            </Button>
          </Link>
        </div>

        <div className="hero-image-wrapper mt-5 px-2 md:mt-0">
          <div ref={imageRef} className="hero-image">
            <Image
              src="/hero.png"
              width={1536}
              height={1024}
              alt="Banner Career Genie"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 90vw, 1200px"
              className="rounded-lg shadow-2xl border mx-auto w-full max-w-6xl h-auto object-contain"
              priority
            />
          </div>
        </div>
      </div>
    </section>
  );
}
