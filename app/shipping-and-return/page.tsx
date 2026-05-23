import { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Shipping & Return | Suitique Designs',
  description: 'Learn about Suitique Designs shipping policies, delivery times, and return procedures.',
};

export default function ShippingAndReturnPage() {
  return (
    <main className="min-h-[60vh]">
      <div className="bg-cream-50 py-12 md:py-16">
        <div className="container max-w-4xl px-4 md:px-8">
          <div className="mb-8">
            <h1 className="font-serif text-4xl md:text-5xl text-brand-900 mb-3">Shipping & Return</h1>
            <p className="text-muted-foreground">Fast, secure delivery with hassle-free returns</p>
          </div>
        </div>
      </div>

      <div className="container max-w-4xl px-4 md:px-8 py-12 md:py-16">
        {/* Shipping Information */}
        <section className="mb-12">
          <h2 className="font-serif text-2xl text-brand-900 mb-4">Shipping Information</h2>
          <p className="text-muted-foreground leading-relaxed mb-6">
            We're committed to getting your Suitique Designs pieces to you safely and promptly. All orders are carefully packed to ensure your items arrive in perfect condition.
          </p>

          {/* Domestic Shipping */}
          <div className="mb-8">
            <h3 className="font-serif text-lg text-brand-900 mb-4">Domestic Shipping (India)</h3>
            <div className="space-y-4">
              <div className="border border-border rounded-lg p-6">
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-serif text-brand-900 font-semibold">Standard Delivery</h4>
                  <span className="bg-cream-100 text-brand-900 px-3 py-1 rounded text-sm font-serif">Free</span>
                </div>
                <p className="text-sm text-muted-foreground mb-3">Pan-India delivery via trusted courier partners</p>
                <p className="text-sm text-muted-foreground"><strong>Delivery Time:</strong> 5-7 business days</p>
              </div>
              <div className="border border-border rounded-lg p-6">
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-serif text-brand-900 font-semibold">Express Delivery</h4>
                  <span className="bg-cream-100 text-brand-900 px-3 py-1 rounded text-sm font-serif">₹499</span>
                </div>
                <p className="text-sm text-muted-foreground mb-3">Priority delivery in major metros</p>
                <p className="text-sm text-muted-foreground"><strong>Delivery Time:</strong> 2-3 business days</p>
              </div>
            </div>
          </div>

          {/* International Shipping */}
          <div className="mb-8">
            <h3 className="font-serif text-lg text-brand-900 mb-4">International Shipping</h3>
            <div className="bg-cream-50 p-6 rounded-lg border border-border">
              <p className="text-sm text-muted-foreground leading-relaxed mb-4">
                We ship worldwide! International orders are processed and shipped within 3-5 business days.
              </p>
              <div className="space-y-3 text-sm text-muted-foreground">
                <p>
                  <strong className="text-brand-900">Delivery Time:</strong> 7-14 business days (depending on destination)
                </p>
                <p>
                  <strong className="text-brand-900">Shipping Cost:</strong> Calculated at checkout based on weight and destination
                </p>
                <p>
                  <strong className="text-brand-900">Customs:</strong> You may be responsible for customs duties and taxes. Please check your local regulations.
                </p>
                <p>
                  <strong className="text-brand-900">Insurance:</strong> All international shipments are insured against loss or damage
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Order Processing */}
        <section className="mb-12">
          <h2 className="font-serif text-2xl text-brand-900 mb-4">Order Processing Timeline</h2>
          <div className="space-y-4">
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-12 h-12 bg-cream-100 rounded-full flex items-center justify-center">
                <span className="font-serif text-brand-900 font-semibold">1</span>
              </div>
              <div>
                <h4 className="font-serif text-brand-900 font-semibold mb-1">Order Confirmed</h4>
                <p className="text-sm text-muted-foreground">Immediately after checkout. Confirmation email sent with order details.</p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-12 h-12 bg-cream-100 rounded-full flex items-center justify-center">
                <span className="font-serif text-brand-900 font-semibold">2</span>
              </div>
              <div>
                <h4 className="font-serif text-brand-900 font-semibold mb-1">Processed & Packed</h4>
                <p className="text-sm text-muted-foreground">2-3 business days. Handled with utmost care and packed in premium packaging.</p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-12 h-12 bg-cream-100 rounded-full flex items-center justify-center">
                <span className="font-serif text-brand-900 font-semibold">3</span>
              </div>
              <div>
                <h4 className="font-serif text-brand-900 font-semibold mb-1">Shipped</h4>
                <p className="text-sm text-muted-foreground">Tracking link sent via email. You can monitor delivery in real-time.</p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-12 h-12 bg-cream-100 rounded-full flex items-center justify-center">
                <span className="font-serif text-brand-900 font-semibold">4</span>
              </div>
              <div>
                <h4 className="font-serif text-brand-900 font-semibold mb-1">Delivered</h4>
                <p className="text-sm text-muted-foreground">5-7 business days (domestic). Signature confirmation upon delivery.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Tracking Your Order */}
        <section className="mb-12">
          <h2 className="font-serif text-2xl text-brand-900 mb-4">Tracking Your Order</h2>
          <p className="text-muted-foreground leading-relaxed mb-4">
            Once your order ships, you'll receive an email with a tracking number and link. You can use this to monitor your shipment in real-time.
          </p>
          <div className="bg-cream-50 p-6 rounded-lg border border-border">
            <p className="text-sm text-muted-foreground">
              <strong className="text-brand-900">Tip:</strong> Save your order number and tracking number. This will help our support team if you have any delivery questions.
            </p>
          </div>
        </section>

        {/* Return Policy */}
        <section className="mb-12">
          <h2 className="font-serif text-2xl text-brand-900 mb-4">Return Policy</h2>
          <p className="text-muted-foreground leading-relaxed mb-6">
            We want you to be completely satisfied with your purchase. If for any reason you're not happy, we offer a 30-day money-back guarantee.
          </p>

          <div className="space-y-6">
            {/* Eligibility */}
            <div>
              <h3 className="font-serif text-brand-900 font-semibold mb-3">Return Eligibility</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex gap-3">
                  <span className="text-brand-700 font-serif">•</span>
                  <span>Items must be in original, unworn condition</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-brand-700 font-serif">•</span>
                  <span>All original tags and packaging must be intact</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-brand-700 font-serif">•</span>
                  <span>No signs of wear, stains, or damage</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-brand-700 font-serif">•</span>
                  <span>Custom/made-to-order items cannot be returned unless defective</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-brand-700 font-serif">•</span>
                  <span>30 days from date of delivery</span>
                </li>
              </ul>
            </div>

            {/* How to Return */}
            <div>
              <h3 className="font-serif text-brand-900 font-semibold mb-3">How to Initiate a Return</h3>
              <ol className="space-y-3 text-sm text-muted-foreground">
                <li className="flex gap-3">
                  <span className="text-brand-700 font-serif">1.</span>
                  <span>Email support@suitiquedesign.com with your order number</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-brand-700 font-serif">2.</span>
                  <span>Include 2-3 photos of the item and packaging</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-brand-700 font-serif">3.</span>
                  <span>Receive a prepaid return shipping label</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-brand-700 font-serif">4.</span>
                  <span>Ship the item back in original packaging</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-brand-700 font-serif">5.</span>
                  <span>Refund processed within 7-10 business days of receipt</span>
                </li>
              </ol>
            </div>

            {/* Refund Timeline */}
            <div>
              <h3 className="font-serif text-brand-900 font-semibold mb-3">Refund Timeline</h3>
              <div className="space-y-3 text-sm text-muted-foreground">
                <div className="border-l-2 border-brand-700 pl-4 py-2">
                  <p className="font-serif text-brand-900 mb-1">In Transit: 3-7 business days</p>
                </div>
                <div className="border-l-2 border-brand-700 pl-4 py-2">
                  <p className="font-serif text-brand-900 mb-1">Inspection: 2-3 business days</p>
                </div>
                <div className="border-l-2 border-brand-700 pl-4 py-2">
                  <p className="font-serif text-brand-900 mb-1">Refund Issued: 1-2 business days</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Defective Items */}
        <section className="mb-12 bg-cream-50 p-8 rounded-lg border border-border">
          <h2 className="font-serif text-2xl text-brand-900 mb-4">Defective or Damaged Items</h2>
          <p className="text-muted-foreground leading-relaxed mb-4">
            If you receive a defective or damaged item, contact us immediately within 14 days of delivery. We'll provide a replacement or full refund at no cost to you.
          </p>
          <p className="text-sm text-muted-foreground">
            <strong className="text-brand-900">What to do:</strong> Email clear photos of the defect to support@suitiquedesign.com with your order number.
          </p>
        </section>

        {/* International Returns */}
        <section className="mb-12">
          <h2 className="font-serif text-2xl text-brand-900 mb-4">International Returns</h2>
          <p className="text-muted-foreground leading-relaxed mb-4">
            For international orders, return shipping costs are your responsibility unless the item is defective. However, we provide a prepaid return label for the first return.
          </p>
          <p className="text-sm text-muted-foreground">
            Please contact support@suitiquedesign.com for specific return instructions for your country.
          </p>
        </section>

        {/* FAQ */}
        <section className="mb-12">
          <h2 className="font-serif text-2xl text-brand-900 mb-4">Shipping & Returns FAQs</h2>
          <div className="space-y-4">
            <details className="border border-border rounded-lg p-4 cursor-pointer">
              <summary className="font-serif text-brand-900 font-semibold flex justify-between items-center">
                <span>Can I change my delivery address after ordering?</span>
                <span className="text-2xl">+</span>
              </summary>
              <p className="mt-3 text-sm text-muted-foreground">
                Yes, if your order hasn't been shipped yet. Contact support@suitiquedesign.com immediately with your order number and new address.
              </p>
            </details>

            <details className="border border-border rounded-lg p-4 cursor-pointer">
              <summary className="font-serif text-brand-900 font-semibold flex justify-between items-center">
                <span>What if my package is lost or damaged in transit?</span>
                <span className="text-2xl">+</span>
              </summary>
              <p className="mt-3 text-sm text-muted-foreground">
                All shipments are insured. Report any damage or loss immediately to support@suitiquedesign.com with photos. We'll file a claim and send a replacement at no cost.
              </p>
            </details>

            <details className="border border-border rounded-lg p-4 cursor-pointer">
              <summary className="font-serif text-brand-900 font-semibold flex justify-between items-center">
                <span>Do you ship to PO boxes?</span>
                <span className="text-2xl">+</span>
              </summary>
              <p className="mt-3 text-sm text-muted-foreground">
                We ship to physical addresses only. We cannot deliver to PO boxes. Please provide your complete residential or commercial address.
              </p>
            </details>

            <details className="border border-border rounded-lg p-4 cursor-pointer">
              <summary className="font-serif text-brand-900 font-semibold flex justify-between items-center">
                <span>How long before my refund appears in my account?</span>
                <span className="text-2xl">+</span>
              </summary>
              <p className="mt-3 text-sm text-muted-foreground">
                Refunds are processed within 7-10 business days of us receiving your return. However, your bank may take an additional 3-5 business days to credit your account.
              </p>
            </details>
          </div>
        </section>

        {/* Contact */}
        <section className="bg-cream-50 p-8 rounded-lg border border-border">
          <h2 className="font-serif text-2xl text-brand-900 mb-4">Need Help?</h2>
          <p className="text-muted-foreground leading-relaxed mb-4">
            Our customer care team is ready to assist with any shipping or return questions.
          </p>
          <p className="text-muted-foreground">
            Email: <span className="text-brand-700">support@suitiquedesign.com</span><br />
            Phone: <span className="text-brand-700">+91 98118 38318</span><br />
            Hours: Monday - Saturday, 10 AM - 6 PM IST
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
