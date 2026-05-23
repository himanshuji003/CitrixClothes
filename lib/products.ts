import type { Product, Collection } from '@/types';

export const COLLECTIONS: Collection[] = [
  { handle: 'organza', title: 'Organza', image: 'https://images.unsplash.com/photo-1571908599407-cdb918ed83bf?auto=format&fit=crop&w=900&q=80', tagline: 'Regal silhouettes' },
  { handle: 'silk', title: 'Silk', image: 'https://images.unsplash.com/photo-1668371679302-a8ec781e876e?auto=format&fit=crop&w=900&q=80', tagline: 'Bridal & festive' },
  { handle: 'chanderi', title: 'Chanderi', image: 'https://images.unsplash.com/photo-1679006831648-7c9ea12e5807?auto=format&fit=crop&w=900&q=80', tagline: 'Timeless drapes' },
  { handle: 'muslin', title: 'Muslin', image: 'https://images.pexels.com/photos/28213774/pexels-photo-28213774.jpeg?auto=compress&cs=tinysrgb&w=900', tagline: 'Everyday luxe' },
];

// Helper function to create mock variants for a product
const createMockVariants = (sizes: string[]) => 
  sizes.map((size, idx) => ({
    id: `gid://shopify/ProductVariant/mock-${Date.now()}-${idx}`,
    title: size === 'Free Size' ? 'Default' : size,
    availableForSale: true,
    selectedOptions: size === 'Free Size' ? [] : [{ name: 'Size', value: size }],
  }));

export const PRODUCTS: Product[] = [
  { 
    handle: 'meher-ivory-organza', 
    title: 'Meher Ivory Organza', 
    collection: 'organza', 
    price: 18900, 
    compareAt: 24900, 
    currency: 'INR', 
    description: 'A floor-grazing ivory Organza piece in fine chanderi silk with hand-embroidered zardozi yoke and dupatta in tonal organza. Tailored for an effortless drape.', 
    images: ['https://images.unsplash.com/photo-1571908599407-cdb918ed83bf?auto=format&fit=crop&w=1200&q=85', 'https://images.unsplash.com/photo-1668371459824-094a960a227d?auto=format&fit=crop&w=1200&q=85'], 
    sizes: ['XS','S','M','L','XL'],
    variants: createMockVariants(['XS','S','M','L','XL']),
    tag: 'New' 
  },
  { 
    handle: 'roohi-rouge-silk', 
    title: 'Roohi Rouge Silk', 
    collection: 'silk', 
    price: 42500, 
    compareAt: null, 
    currency: 'INR', 
    description: 'A heirloom rouge silk ensemble crafted in raw silk with intricate gota-patti and resham work. Pairs with a hand-embroidered blouse and silk-net dupatta.', 
    images: ['https://images.unsplash.com/photo-1668371679302-a8ec781e876e?auto=format&fit=crop&w=1200&q=85', 'https://images.unsplash.com/photo-1618901185975-d59f7091bcfe?auto=format&fit=crop&w=1200&q=85'], 
    sizes: ['XS','S','M','L'],
    variants: createMockVariants(['XS','S','M','L']),
    tag: 'Bridal' 
  },
  { 
    handle: 'aaranya-emerald-chanderi', 
    title: 'Aaranya Emerald Chanderi', 
    collection: 'chanderi', 
    price: 26800, 
    compareAt: 32000, 
    currency: 'INR', 
    description: 'An emerald Chanderi drape with hand-embellished sequins along the pallu. Comes with an unstitched blouse piece in matching tone.', 
    images: ['https://images.unsplash.com/photo-1679006831648-7c9ea12e5807?auto=format&fit=crop&w=1200&q=85', 'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&w=1200&q=85'], 
    sizes: ['Free Size'],
    variants: createMockVariants(['Free Size']),
    tag: 'Bestseller' 
  },
  { 
    handle: 'noor-ajrakh-muslin', 
    title: 'Noor Ajrakh Muslin', 
    collection: 'muslin', 
    price: 8900, 
    compareAt: 11500, 
    currency: 'INR', 
    description: 'A breezy Ajrakh-print muslin kurta with matching pant and dupatta. Block-printed by master craftsmen in Kutch.', 
    images: ['https://images.pexels.com/photos/28213774/pexels-photo-28213774.jpeg?auto=compress&cs=tinysrgb&w=1200', 'https://images.pexels.com/photos/12279088/pexels-photo-12279088.jpeg?auto=compress&cs=tinysrgb&w=1200'], 
    sizes: ['XS','S','M','L','XL','XXL'],
    variants: createMockVariants(['XS','S','M','L','XL','XXL']),
    tag: 'New' 
  },
  { 
    handle: 'saanjh-blush-organza', 
    title: 'Saanjh Blush Organza', 
    collection: 'organza', 
    price: 21500, 
    compareAt: null, 
    currency: 'INR', 
    description: 'A blush-pink Organza silhouette with delicate thread-work florals on the bodice and a soft net dupatta finished with scalloped lace.', 
    images: ['https://images.unsplash.com/photo-1668371459824-094a960a227d?auto=format&fit=crop&w=1200&q=85', 'https://images.unsplash.com/photo-1571908599407-cdb918ed83bf?auto=format&fit=crop&w=1200&q=85'], 
    sizes: ['XS','S','M','L'],
    variants: createMockVariants(['XS','S','M','L']),
    tag: 'Limited' 
  },
  { 
    handle: 'mira-marigold-silk', 
    title: 'Mira Marigold Silk', 
    collection: 'silk', 
    price: 36900, 
    compareAt: 41000, 
    currency: 'INR', 
    description: 'A marigold-hued festive silk ensemble with mirror work scattered across the flare and a contrasting maroon blouse.', 
    images: ['https://images.pexels.com/photos/34251604/pexels-photo-34251604.jpeg?auto=compress&cs=tinysrgb&w=1200', 'https://images.unsplash.com/photo-1668371679302-a8ec781e876e?auto=format&fit=crop&w=1200&q=85'], 
    sizes: ['XS','S','M','L','XL'],
    variants: createMockVariants(['XS','S','M','L','XL']),
    tag: 'Festive' 
  },
  { 
    handle: 'vrinda-crimson-chanderi', 
    title: 'Vrinda Crimson Chanderi', 
    collection: 'chanderi', 
    price: 32400, 
    compareAt: null, 
    currency: 'INR', 
    description: 'A statement crimson Chanderi with traditional zari border and intricate butis through the body. Heirloom-worthy.', 
    images: ['https://images.pexels.com/photos/29819593/pexels-photo-29819593.jpeg?auto=compress&cs=tinysrgb&w=1200', 'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&w=1200&q=85'], 
    sizes: ['Free Size'],
    variants: createMockVariants(['Free Size']),
    tag: 'Heritage' 
  },
  { 
    handle: 'isha-ivory-muslin', 
    title: 'Isha Ivory Muslin', 
    collection: 'muslin', 
    price: 7200, 
    compareAt: 9000, 
    currency: 'INR', 
    description: 'An everyday ivory muslin ensemble with subtle thread embroidery, paired with straight pants and a bandhani dupatta.', 
    images: ['https://images.pexels.com/photos/12279088/pexels-photo-12279088.jpeg?auto=compress&cs=tinysrgb&w=1200', 'https://images.pexels.com/photos/28213774/pexels-photo-28213774.jpeg?auto=compress&cs=tinysrgb&w=1200'], 
    sizes: ['XS','S','M','L','XL'],
    variants: createMockVariants(['XS','S','M','L','XL']),
    tag: 'New' 
  },
];

export const formatINR = (amount: number): string => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount);
