import { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Refund Policy | Suitique Designs',
  description: 'Our refund and return policy ensures your satisfaction with every purchase from Suitique Designs.',
};

export default function RefundPolicyPage() {
  return (
    <main className="min-h-[60vh]">
      <div className="bg-cream-50 py-12 md:py-16">
        <div className="container max-w-4xl px-4 md:px-8">
          <div className="mb-8">
            <h1 className="font-serif text-4xl md:text-5xl text-brand-900 mb-3">Refund Policy</h1>
            <p className="text-muted-foreground">Effective from January 1, 2024</p>
          </div>
        </div>
      </div>

      <div className="container max-w-4xl px-4 md:px-8 py-12 md:py-16">
        {/* Introduction */}
        <section className="mb-12">
          <p className="text-muted-foreground leading-relaxed mb-6">
            At Suitique Designs, we stand behind the quality and craftsmanship of every piece we create. We want you to be completely satisfied with your purchase. If for any reason you're not happy with your purchase, we offer a hassle-free refund policy.
          </p>
        </section>

        {/* 30-Day Guarantee */}
        <section className="mb-12">
          <h2 className="font-serif text-2xl text-brand-900 mb-4">30-Day Money-Back Guarantee</h2>
          <p className="text-muted-foreground leading-relaxed mb-4">
            You have 30 days from the date you receive your order to request a refund. No questions asked. We want you to feel confident in your purchase of our handcrafted ethnic couture.
          </p>
          <div className="bg-cream-50 p-6 rounded-lg border border-border">
            <p className="text-sm text-muted-foreground">
              <strong className="text-brand-900">Note:</strong> The 30-day period starts from the date of delivery, not the order date.
            </p>
          </div>
        </section>

        {/* Eligibility */}
        <section className="mb-12">
          <h2 className="font-serif text-2xl text-brand-900 mb-4">Refund Eligibility</h2>
          <p className="text-muted-foreground leading-relaxed mb-4">Your item must meet the following conditions to be eligible for a refund:</p>
          <ul className="space-y-3 text-muted-foreground">
            <li className="flex gap-3">
              <span className="text-brand-700 font-serif">•</span>
              <span>Item must be in its original, unworn condition</span>
            </li>
            <li className="flex gap-3">
              <span className="text-brand-700 font-serif">•</span>
              <span>All original tags and packaging must be intact</span>
            </li>
            <li className="flex gap-3">
              <span className="text-brand-700 font-serif">•</span>
              <span>Item must show no signs of wear, stains, or damage</span>
            </li>
            <li className="flex gap-3">
              <span className="text-brand-700 font-serif">•</span>
              <span>Custom or made-to-order pieces cannot be refunded unless defective</span>
            </li>
            <li className="flex gap-3">
              <span className="text-brand-700 font-serif">•</span>
              <span>Items on final sale are not eligible for refunds</span>
            </li>
          </ul>
        </section>

        {/* How to Request */}
        <section className="mb-12">
          <h2 className="font-serif text-2xl text-brand-900 mb-4">How to Request a Refund</h2>
          <p className="text-muted-foreground leading-relaxed mb-4">To initiate a refund:</p>
          <ol className="space-y-3 text-muted-foreground">
            <li className="flex gap-3">
              <span className="text-brand-700 font-serif">1.</span>
              <span>Contact our customer service team at support@suitique.com with your order number</span>
            </li>
            <li className="flex gap-3">
              <span className="text-brand-700 font-serif">2.</span>
              <span>Provide photos of the item and its packaging</span>
            </li>
            <li className="flex gap-3">
              <span className="text-brand-700 font-serif">3.</span>
              <span>Receive a prepaid return shipping label</span>
            </li>
            <li className="flex gap-3">
              <span className="text-brand-700 font-serif">4.</span>
              <span>Ship the item back in its original packaging</span>
            </li>
            <li className="flex gap-3">
              <span className="text-brand-700 font-serif">5.</span>
              <span>Refund will be processed within 7-10 business days of receipt and inspection</span>
            </li>
          </ol>
        </section>

        {/* Return Shipping */}
        <section className="mb-12">
          <h2 className="font-serif text-2xl text-brand-900 mb-4">Return Shipping</h2>
          <p className="text-muted-foreground leading-relaxed">
            We provide complimentary return shipping for items being refunded. Simply use the return label we provide. Items shipped via prepaid labels should reach our facility within 7 business days. Please keep your tracking information for your records.
          </p>
        </section>

        {/* Refund Processing */}
        <section className="mb-12">
          <h2 className="font-serif text-2xl text-brand-900 mb-4">Refund Processing Timeline</h2>
          <div className="space-y-4">
            <div className="border-l-2 border-brand-700 pl-4 py-2">
              <p className="font-serif text-brand-900 mb-1">In Transit: 3-7 business days</p>
              <p className="text-sm text-muted-foreground">Time for return to reach our facility</p>
            </div>
            <div className="border-l-2 border-brand-700 pl-4 py-2">
              <p className="font-serif text-brand-900 mb-1">Inspection: 2-3 business days</p>
              <p className="text-sm text-muted-foreground">We verify the item meets refund conditions</p>
            </div>
            <div className="border-l-2 border-brand-700 pl-4 py-2">
              <p className="font-serif text-brand-900 mb-1">Refund Issued: 1-2 business days</p>
              <p className="text-sm text-muted-foreground">Credit appears in your original payment method</p>
            </div>
          </div>
        </section>

        {/* Defective Items */}
        <section className="mb-12">
          <h2 className="font-serif text-2xl text-brand-900 mb-4">Defective Items</h2>
          <p className="text-muted-foreground leading-relaxed mb-4">
            If you receive a defective item, contact us immediately within 14 days of receipt. We will provide a replacement or full refund at no cost to you. Simply provide clear photos of the defect.
          </p>
        </section>

        {/* Contact */}
        <section className="bg-cream-50 p-8 rounded-lg border border-border">
          <h2 className="font-serif text-2xl text-brand-900 mb-4">Questions?</h2>
          <p className="text-muted-foreground mb-4">
            If you have any questions about our refund policy, please don't hesitate to reach out to our customer care team.
          </p>
          <p className="text-muted-foreground">
            Email: <span className="text-brand-700">support@suitique.com</span><br />
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
