'use client';

/**
 * HeroSectionUI Client Component
 * Renders the hero section UI with exact current styling
 * Handles image loading errors with fallback
 */

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight } from 'lucide-react';
import { HERO_FALLBACK, type HeroData } from '@/lib/hero-fallback';
import { getValidImage } from '@/lib/image-validator';

interface HeroSectionUIProps {
  heroData: HeroData;
}

export default function HeroSectionUI({ heroData }: HeroSectionUIProps) {
  const [imageUrl, setImageUrl] = useState<string>(heroData.desktopImageUrl);
  const [isImageError, setIsImageError] = useState(false);

  // Handle image load error - fallback to hardcoded image
  const handleImageError = () => {
    if (!isImageError) {
      console.warn('[HeroSectionUI] Image failed to load, using fallback', {
        failedUrl: imageUrl,
        fallbackUrl: HERO_FALLBACK.desktopImageUrl,
      });
      setImageUrl(HERO_FALLBACK.desktopImageUrl);
      setIsImageError(true);
    }
  };

  return (
    <section className="relative w-full h-[78vh] md:h-[88vh] min-h-[520px] overflow-hidden">
      {/* Hero Background Image */}
      <Image
        src={imageUrl}
        alt={heroData.imageAlt}
        fill
        priority
        sizes="100vw"
        className="object-cover object-center"
        onError={handleImageError}
      />

      {/* Gradient Overlay - LOCKED */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-black/20 to-black/55" />

      {/* Hero Content - LOCKED */}
      <div className="relative h-full container flex flex-col justify-end pb-14 md:pb-24 text-cream-50">
        {/* Eyebrow Tag - LOCKED */}
        <span className="text-[11px] md:text-xs uppercase tracking-[0.32em] mb-4 opacity-90 animate-fade-in">
          {heroData.eyebrowTag}
        </span>

        {/* Heading - LOCKED */}
        <h1 className="font-serif text-4xl sm:text-5xl md:text-7xl leading-[1.05] max-w-2xl text-balance animate-fade-up">
          {heroData.heading}
        </h1>

        {/* Subheading - LOCKED */}
        <p className="mt-4 max-w-md text-sm md:text-base text-cream-50/85 leading-relaxed animate-fade-up">
          {heroData.subheading}
        </p>

        {/* Buttons Container - LOCKED */}
        <div className="mt-7 flex flex-col sm:flex-row gap-3">
          {/* Primary Button - LOCKED */}
          <Link
            href={heroData.buttonLink}
            className="inline-flex items-center justify-center bg-cream-50 text-brand-900 hover:bg-cream-100 transition-colors px-8 h-12 text-xs uppercase tracking-[0.22em] animate-fade-up"
          >
            {heroData.buttonText}
            <ArrowRight className="ml-2 h-4 w-4" />
          </Link>

          {/* Secondary Button - LOCKED */}
          {heroData.buttonTextSecondary && heroData.buttonLinkSecondary && (
            <Link
              href={heroData.buttonLinkSecondary}
              className="inline-flex items-center justify-center border border-cream-50/70 hover:bg-cream-50/10 text-cream-50 transition-colors px-8 h-12 text-xs uppercase tracking-[0.22em] animate-fade-up"
            >
              {heroData.buttonTextSecondary}
            </Link>
          )}
        </div>
      </div>
    </section>
  );
}
