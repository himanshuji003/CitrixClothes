'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';
import { ChevronDown } from 'lucide-react';
import type { Collection } from '@/types';

export default function CatalogDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const [collections, setCollections] = useState<Collection[]>([]);
  const [loading, setLoading] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);
  const containerRef = useRef<HTMLDivElement>(null);

  // Fetch collections on mount
  useEffect(() => {
    const fetchCollections = async () => {
      try {
        setLoading(true);
        const res = await fetch('/api/collections');
        const data = await res.json();
        setCollections(data.collections || []);
      } catch (error) {
        console.error('Failed to fetch collections:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCollections();
  }, []);

  // Handle mouse enter
  const handleMouseEnter = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setIsOpen(true);
  };

  // Handle mouse leave with slight delay
  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => {
      setIsOpen(false);
    }, 150);
  };

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="relative group"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Trigger Button */}
      <button className="flex items-center gap-1 text-[12px] tracking-[0.18em] uppercase text-brand-900/80 hover:text-brand-700 transition-colors">
        CATALOG
        <ChevronDown className={`h-3 w-3 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Mega Menu Dropdown */}
      {isOpen && (
        <div className="absolute top-full left-1/2 -translate-x-1/2 w-screen animate-in fade-in duration-200 z-40 pointer-events-none group-hover:pointer-events-auto">
          <div
            className="bg-cream-50 border-t border-border/40 shadow-lg mt-0"
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
          >
            <div className="container">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-12 px-6 py-12">
                {/* Collections List - Left Column */}
                <div className="md:col-span-1">
                  <h3 className="text-xs uppercase tracking-[0.2em] text-muted-foreground mb-6">
                    Browse Collections
                  </h3>
                  <div className="space-y-3">
                    {loading ? (
                      <p className="text-sm text-muted-foreground">Loading…</p>
                    ) : collections.length === 0 ? (
                      <p className="text-sm text-muted-foreground">No collections available</p>
                    ) : (
                      collections.map((collection) => (
                        <Link
                          key={collection.handle}
                          href={`/collections/${collection.handle}`}
                          className="block font-serif text-base text-brand-900 hover:text-brand-700 hover:underline transition-colors"
                          onClick={() => setIsOpen(false)}
                        >
                          {collection.title}
                        </Link>
                      ))
                    )}
                  </div>
                </div>

                {/* Spacer / Promotional Content - Right Column */}
                <div className="hidden md:flex md:col-span-2 items-center justify-center bg-gradient-to-br from-cream-100 to-cream-50 rounded-lg overflow-hidden min-h-[300px]">
                  {collections.length > 0 && collections[0]?.image ? (
                    <Image
                      src={collections[0].image}
                      alt="Featured Collection"
                      width={400}
                      height={300}
                      className="object-cover w-full h-full"
                    />
                  ) : (
                    <div className="text-center">
                      <p className="font-serif text-lg text-brand-900">Explore Our Collections</p>
                      <p className="text-xs text-muted-foreground mt-2">Luxury fabrics curated for you</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
