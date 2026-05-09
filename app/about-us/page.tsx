import { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'About Us | Suitique Designs',
  description: 'Discover the story behind Suitique Designs and our commitment to handcrafted ethnic couture.',
};

export default function AboutUsPage() {
  return (
    <main className="min-h-[60vh]">
      <div className="bg-cream-50 py-12 md:py-16">
        <div className="container max-w-4xl px-4 md:px-8">
          <div className="mb-8">
            <h1 className="font-serif text-4xl md:text-5xl text-brand-900 mb-3">About Suitique Designs</h1>
            <p className="text-muted-foreground">Crafting stories, stitching heritage, creating timeless pieces</p>
          </div>
        </div>
      </div>

      <div className="container max-w-4xl px-4 md:px-8 py-12 md:py-16">
        {/* Our Story */}
        <section className="mb-12">
          <h2 className="font-serif text-2xl text-brand-900 mb-4">Our Story</h2>
          <p className="text-muted-foreground leading-relaxed mb-6">
            Suitique Designs was born from a passion for preserving India's rich textile heritage while creating contemporary, wearable art. Founded in 2015, our journey began in a small atelier in Delhi, where master craftspeople worked to revive traditional weaving techniques and bring them to the modern world.
          </p>
          <p className="text-muted-foreground leading-relaxed">
            Every piece in our collection tells a story—stories of generations of artisans, of traditions passed down through families, and of the meticulous craftsmanship that defines luxury fashion. We believe that true luxury is not about trends, but about timeless elegance and exceptional quality.
          </p>
        </section>

        {/* Our Mission */}
        <section className="mb-12">
          <h2 className="font-serif text-2xl text-brand-900 mb-4">Our Mission</h2>
          <div className="bg-cream-50 p-8 rounded-lg border border-border mb-6">
            <p className="text-brand-900 font-serif text-lg leading-relaxed">
              "To create handcrafted ethnic couture that celebrates India's textile heritage, empowers artisan communities, and brings timeless elegance to discerning patrons worldwide."
            </p>
          </div>
          <p className="text-muted-foreground leading-relaxed">
            We're dedicated to producing pieces that are not just beautiful to wear, but beautiful to know were made. Each garment is crafted with intention, care, and respect for both tradition and sustainability.
          </p>
        </section>

        {/* Our Values */}
        <section className="mb-12">
          <h2 className="font-serif text-2xl text-brand-900 mb-4">Our Values</h2>
          <div className="grid gap-8 md:grid-cols-2">
            <div className="border-l-2 border-brand-700 pl-6">
              <h3 className="font-serif text-brand-900 text-lg mb-2">Craftsmanship</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                We honor traditional weaving techniques passed down through generations, ensuring every piece meets the highest standards of quality and artistry.
              </p>
            </div>
            <div className="border-l-2 border-brand-700 pl-6">
              <h3 className="font-serif text-brand-900 text-lg mb-2">Heritage</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Our fabrics—Organza, Silk, Chanderi, and Muslin—are woven using techniques perfected over centuries, celebrating India's unparalleled textile legacy.
              </p>
            </div>
            <div className="border-l-2 border-brand-700 pl-6">
              <h3 className="font-serif text-brand-900 text-lg mb-2">Sustainability</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                We prioritize eco-conscious practices, ethical sourcing, and fair wages for our artisan partners, ensuring our success doesn't come at a cost.
              </p>
            </div>
            <div className="border-l-2 border-brand-700 pl-6">
              <h3 className="font-serif text-brand-900 text-lg mb-2">Longevity</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Every piece is made to be worn for a lifetime. Timeless design, exceptional durability, and meticulous care instructions ensure lasting beauty.
              </p>
            </div>
          </div>
        </section>

        {/* Our Collections */}
        <section className="mb-12">
          <h2 className="font-serif text-2xl text-brand-900 mb-4">Our Collections</h2>
          <p className="text-muted-foreground leading-relaxed mb-6">
            Each of our collections celebrates a specific fabric, showcasing its unique properties and rich history:
          </p>
          <div className="space-y-4">
            <div className="py-4 border-b border-border">
              <h3 className="font-serif text-brand-900 font-semibold mb-2">Organza</h3>
              <p className="text-sm text-muted-foreground">Delicate, ethereal, and luminous—perfect for special occasions and statement pieces.</p>
            </div>
            <div className="py-4 border-b border-border">
              <h3 className="font-serif text-brand-900 font-semibold mb-2">Silk</h3>
              <p className="text-sm text-muted-foreground">Smooth, lustrous, and timeless—the epitome of luxury and sophistication.</p>
            </div>
            <div className="py-4 border-b border-border">
              <h3 className="font-serif text-brand-900 font-semibold mb-2">Chanderi</h3>
              <p className="text-sm text-muted-foreground">A blend of cotton and silk from central India, known for its natural sheen and durability.</p>
            </div>
            <div className="py-4">
              <h3 className="font-serif text-brand-900 font-semibold mb-2">Muslin</h3>
              <p className="text-sm text-muted-foreground">Soft, breathable, and versatile—the fabric of kings, now reimagined for contemporary wear.</p>
            </div>
          </div>
        </section>

        {/* Artisan Partnership */}
        <section className="mb-12 bg-cream-50 p-8 rounded-lg border border-border">
          <h2 className="font-serif text-2xl text-brand-900 mb-4">Our Artisan Partners</h2>
          <p className="text-muted-foreground leading-relaxed mb-4">
            Behind every Suitique Designs piece are skilled artisans who have dedicated their lives to their craft. We work directly with weaving communities across India, ensuring fair compensation, safe working conditions, and continuous support for their families and craft.
          </p>
          <p className="text-muted-foreground leading-relaxed">
            By choosing Suitique Designs, you're not just buying a garment—you're supporting a community of artisans and contributing to the preservation of centuries-old crafts.
          </p>
        </section>

        {/* Contact */}
        <section className="mt-12 pt-8 border-t border-border">
          <h2 className="font-serif text-2xl text-brand-900 mb-4">Connect With Us</h2>
          <p className="text-muted-foreground leading-relaxed mb-4">
            We'd love to hear from you. Have questions about our collections, need styling advice, or want to collaborate? Get in touch with our team.
          </p>
          <p className="text-muted-foreground">
            Email: <span className="text-brand-700">hello@suitique.com</span><br />
            Phone: <span className="text-brand-700">+91 (0) 11-XXXX-XXXX</span>
          </p>
        </section>

        {/* Navigation */}
        <div className="mt-12 pt-8 border-t border-border">
          <Link href="/" className="text-brand-700 hover:text-brand-900 transition-colors duration-200">
            ← Back to Home
          </Link>
        </div>
      </div>
    </main>
  );
}
