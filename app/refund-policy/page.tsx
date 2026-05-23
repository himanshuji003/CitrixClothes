import { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Exchange Policy | Suitique Designs',
  description: 'Exchange policy for damaged, wrong, or incomplete products from Suitique Designs.',
};

export default function RefundPolicyPage() {
  return (
    <main className="min-h-[60vh]">
      <div className="bg-cream-50 py-12 md:py-16">
        <div className="container max-w-4xl px-4 md:px-8">
          <div className="mb-8">
            <h1 className="font-serif text-4xl md:text-5xl text-brand-900 mb-3">
              Exchange Policy
            </h1>
            <p className="text-muted-foreground">No return and no refund policy</p>
          </div>
        </div>
      </div>

      <div className="container max-w-4xl px-4 md:px-8 py-12 md:py-16">
        <section className="mb-12">
          <p className="text-muted-foreground leading-relaxed mb-6">
            At Suitique Designs, every product is carefully checked before dispatch. We do not offer returns or refunds once a product has been purchased. Exchange will only be provided in eligible cases such as damaged, wrong, or incomplete products.
          </p>
        </section>

        <section className="mb-12">
          <h2 className="font-serif text-2xl text-brand-900 mb-4">No Return & No Refund</h2>
          <p className="text-muted-foreground leading-relaxed">
            No return and no refund will be done once the order is placed and delivered. Only exchange will be provided in eligible cases as mentioned in this policy.
          </p>
        </section>

        <section className="mb-12">
          <h2 className="font-serif text-2xl text-brand-900 mb-4">Exchange for Damaged Products</h2>
          <p className="text-muted-foreground leading-relaxed mb-4">
            Only exchange will be given if the product is received damaged. To claim an exchange, the customer must provide a proper uncut parcel opening video as proof.
          </p>
          <div className="bg-cream-50 p-6 rounded-lg border border-border">
            <p className="text-sm text-muted-foreground">
              <strong className="text-brand-900">Important:</strong> Without a proper uncut parcel opening video, damaged product exchange requests may not be accepted.
            </p>
          </div>
        </section>

        <section className="mb-12">
          <h2 className="font-serif text-2xl text-brand-900 mb-4">Replacement Article</h2>
          <p className="text-muted-foreground leading-relaxed">
            The damaged article will be replaced with the same article. If the same article is not available, the customer can choose another article of the same price.
          </p>
        </section>

        <section className="mb-12">
          <h2 className="font-serif text-2xl text-brand-900 mb-4">Wrong or Incomplete Product</h2>
          <p className="text-muted-foreground leading-relaxed">
            If the customer receives the wrong product, incomplete set, wrong style, or damaged product, the Company will replace it at no cost to the customer. However, in some cases subject to investigation, the Company may request shipping payment.
          </p>
        </section>

        <section className="mb-12">
          <h2 className="font-serif text-2xl text-brand-900 mb-4">Repeated Returns</h2>
          <p className="text-muted-foreground leading-relaxed">
            We do not accept repeated returns or repeated exchange requests. The Company reserves the right to reject such requests.
          </p>
        </section>

        <section className="bg-cream-50 p-8 rounded-lg border border-border">
          <h2 className="font-serif text-2xl text-brand-900 mb-4">Questions?</h2>
          <p className="text-muted-foreground mb-4">
            If you have any questions about our exchange policy, please reach out to our customer care team.
          </p>
          <p className="text-muted-foreground">
            Email: <span className="text-brand-700">support@suitiquedesign.com</span>
            <br />
            Phone: <span className="text-brand-700">+91 98118 38318</span>
          </p>
        </section>

        <div className="mt-12 pt-8 border-t border-border">
          <Link href="/" className="text-brand-700 hover:text-brand-900 transition-colors duration-200">
            ← Back to Home
          </Link>
        </div>
      </div>
    </main>
  );
}