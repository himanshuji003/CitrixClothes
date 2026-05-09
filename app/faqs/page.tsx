import type { Metadata } from 'next';
import Link from 'next/link';
import type { ReactNode } from 'react';

export const metadata: Metadata = {
  title: 'FAQs | Suitique Designs',
  description:
    'Frequently asked questions about Suitique Designs, our products, and services.',
};

type FAQ = {
  question: string;
  answer: ReactNode;
};

export default function FAQsPage() {
  const faqs: FAQ[] = [
    {
      question: 'What makes Suitique Designs different from other fashion brands?',
      answer:
        'Every piece at Suitique Designs is handcrafted using traditional weaving techniques that have been perfected over centuries. We work directly with artisan communities, ensuring fair wages and sustainable practices. Our commitment is to create timeless pieces, not fast fashion trends.',
    },
    {
      question: 'How do you choose your fabrics?',
      answer:
        'We specialize in four premium Indian fabrics: Organza, Silk, Chanderi, and Muslin. Each fabric is selected for its heritage, quality, and unique properties. We source from certified suppliers who maintain the highest standards of ethical production.',
    },
    {
      question: 'Are your products suitable for daily wear?',
      answer:
        'While our pieces are designed to be elegant and luxurious, many can be worn daily. Our Muslin and Chanderi collections are especially versatile for everyday occasions, while Silk and Organza pieces work beautifully for special events. Each product page includes care recommendations.',
    },
    {
      question: 'What is your return and refund policy?',
      answer: (
        <>
          We offer a 30-day money-back guarantee. Items must be in original,
          unworn condition with all tags intact. Return shipping is complimentary.
          Please visit our{' '}
          <Link href="/refund-policy" className="text-brand-700 underline">
            Refund Policy
          </Link>{' '}
          page for detailed information.
        </>
      ),
    },
    {
      question: 'Do you offer international shipping?',
      answer:
        'Yes, we ship worldwide. International orders typically take 7-14 business days for delivery. Shipping costs and customs duties vary by location. Contact our support team for specific shipping information to your country.',
    },
    {
      question: 'Can I place a custom or made-to-order request?',
      answer:
        'Absolutely! We offer bespoke services for custom designs, personalized embroidery, and made-to-order pieces. Please email styling@suitique.com with your requirements, and our styling team will guide you through the process.',
    },
    {
      question: 'How should I care for my Suitique Designs piece?',
      answer:
        'Each piece comes with detailed care instructions. Generally, handwash in cool water with mild detergent, dry flat in shade, and store in a breathable cotton bag. Dry cleaning is recommended for delicate pieces. Never use harsh chemicals or bleach.',
    },
    {
      question: 'Are your products eco-friendly?',
      answer:
        "We're committed to sustainability. We use natural, high-quality fabrics, work with ethical suppliers, pay fair wages to artisans, and minimize waste in our production process. Our packaging is recyclable and made from sustainable materials.",
    },
    {
      question: 'How long does it take to receive my order?',
      answer:
        "Standard orders are processed within 2-3 business days. Domestic delivery typically takes 5-7 business days, while international orders take 7-14 business days. You'll receive tracking information via email.",
    },
    {
      question: 'Do you have a physical store?',
      answer:
        'Yes! Visit our flagship atelier in Lodhi Colony, Delhi. We also offer in-person consultations and private shopping appointments. Contact us at styling@suitique.com to schedule a visit.',
    },
    {
      question: 'What payment methods do you accept?',
      answer:
        'We accept all major credit and debit cards, digital wallets, bank transfers, and UPI payments for Indian customers. All transactions are encrypted and secure.',
    },
    {
      question: 'Can I cancel my order?',
      answer:
        "Orders can be cancelled within 24 hours of placement if they haven't been processed. After 24 hours, you can return the item for a full refund within 30 days of delivery. Contact support@suitique.com for assistance.",
    },
    {
      question: 'Do you offer gift cards?',
      answer:
        'Yes! Our gift cards are perfect for any occasion. Available in various denominations, they never expire and can be used on any product on our website. Contact us for gift card options.',
    },
    {
      question: 'How can I stay updated about new collections?',
      answer:
        'Subscribe to our newsletter to receive updates about new launches, exclusive offers, and styling inspiration. You can subscribe on our website footer or email us at hello@suitique.com.',
    },
    {
      question:
        'Do you work with fashion influencers or offer collaboration opportunities?',
      answer:
        'We collaborate with content creators and influencers who align with our values. If interested, please reach out to press@suitique.com with your proposal and portfolio.',
    },
  ];

  return (
    <main className="min-h-[60vh]">
      <div className="bg-cream-50 py-12 md:py-16">
        <div className="container max-w-4xl px-4 md:px-8">
          <div className="mb-8">
            <h1 className="mb-3 font-serif text-4xl text-brand-900 md:text-5xl">
              Frequently Asked Questions
            </h1>
            <p className="text-muted-foreground">
              Find answers to common questions about our products and services
            </p>
          </div>
        </div>
      </div>

      <div className="container max-w-4xl px-4 py-12 md:px-8 md:py-16">
        <div className="space-y-6">
          {faqs.map((faq, index) => (
            <details
              key={index}
              className="group cursor-pointer rounded-lg border border-border p-6 transition-colors duration-200 hover:border-brand-700"
            >
              <summary className="flex select-none items-start justify-between gap-4 font-serif text-lg text-brand-900 transition-colors duration-200 hover:text-brand-700">
                <span>{faq.question}</span>
                <span className="flex-shrink-0 text-2xl font-light text-brand-700 transition-transform duration-200 group-open:rotate-45">
                  +
                </span>
              </summary>

              <div className="mt-4 text-sm leading-relaxed text-muted-foreground">
                {faq.answer}
              </div>
            </details>
          ))}
        </div>

        <section className="mt-16 rounded-lg border border-border bg-cream-50 p-8">
          <h2 className="mb-4 font-serif text-2xl text-brand-900">
            Still have questions?
          </h2>
          <p className="mb-6 leading-relaxed text-muted-foreground">
            Our customer care team is always ready to help. Don&apos;t hesitate
            to reach out—we&apos;re here for you!
          </p>

          <div className="grid gap-6 md:grid-cols-2">
            <div>
              <p className="mb-2 text-sm text-muted-foreground">Email us:</p>
              <p className="font-serif text-brand-700 transition-colors duration-200 hover:text-brand-900">
                support@suitique.com
              </p>
            </div>

            <div>
              <p className="mb-2 text-sm text-muted-foreground">Call us:</p>
              <p className="font-serif text-brand-700 transition-colors duration-200 hover:text-brand-900">
                +91 (0) 11-XXXX-XXXX
              </p>
            </div>
          </div>
        </section>

        <section className="mt-12 border-t border-border pt-8">
          <h3 className="mb-4 font-serif text-lg text-brand-900">
            Related Pages
          </h3>

          <ul className="space-y-2 text-sm">
            <li>
              <Link href="/refund-policy" className="text-brand-700 hover:text-brand-900">
                → Refund Policy
              </Link>
            </li>
            <li>
              <Link href="/shipping-and-return" className="text-brand-700 hover:text-brand-900">
                → Shipping & Return
              </Link>
            </li>
            <li>
              <Link href="/contact-us" className="text-brand-700 hover:text-brand-900">
                → Contact Us
              </Link>
            </li>
            <li>
              <Link href="/privacy-policy" className="text-brand-700 hover:text-brand-900">
                → Privacy Policy
              </Link>
            </li>
          </ul>
        </section>

        <div className="mt-12 border-t border-border pt-8">
          <Link href="/" className="text-brand-700 hover:text-brand-900">
            ← Back to Home
          </Link>
        </div>
      </div>
    </main>
  );
}