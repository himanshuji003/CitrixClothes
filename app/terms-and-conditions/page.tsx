import { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Terms & Conditions | Suitique Designs',
  description: 'Read the terms and conditions for using Suitique Designs website and services.',
};

export default function TermsAndConditionsPage() {
  return (
    <main className="min-h-[60vh]">
      <div className="bg-cream-50 py-12 md:py-16">
        <div className="container max-w-4xl px-4 md:px-8">
          <div className="mb-8">
            <h1 className="font-serif text-4xl md:text-5xl text-brand-900 mb-3">Terms & Conditions</h1>
            <p className="text-muted-foreground">Effective from January 1, 2024</p>
          </div>
        </div>
      </div>

      <div className="container max-w-4xl px-4 md:px-8 py-12 md:py-16">
        {/* Introduction */}
        <section className="mb-12">
          <p className="text-muted-foreground leading-relaxed">
            These Terms and Conditions govern your use of the Suitique Designs website and services. By accessing or using our site, you agree to be bound by these terms. If you do not agree with any part of these terms, please do not use our website.
          </p>
        </section>

        {/* Use License */}
        <section className="mb-12">
          <h2 className="font-serif text-2xl text-brand-900 mb-4">License to Use</h2>
          <p className="text-muted-foreground leading-relaxed mb-4">
            We grant you a limited, non-exclusive, non-transferable license to access and use our website for personal, non-commercial purposes. You may not:
          </p>
          <ul className="space-y-2 text-muted-foreground">
            <li className="flex gap-3">
              <span className="text-brand-700 font-serif">•</span>
              <span>Reproduce, modify, or distribute any content without permission</span>
            </li>
            <li className="flex gap-3">
              <span className="text-brand-700 font-serif">•</span>
              <span>Use the site for any commercial purpose or competing business</span>
            </li>
            <li className="flex gap-3">
              <span className="text-brand-700 font-serif">•</span>
              <span>Attempt to gain unauthorized access to our systems</span>
            </li>
            <li className="flex gap-3">
              <span className="text-brand-700 font-serif">•</span>
              <span>Engage in any activity that disrupts the website's functionality</span>
            </li>
          </ul>
        </section>

        {/* Product Information */}
        <section className="mb-12">
          <h2 className="font-serif text-2xl text-brand-900 mb-4">Product Information</h2>
          <p className="text-muted-foreground leading-relaxed mb-4">
            While we strive for accuracy, product descriptions, images, prices, and availability are provided "as is" and may contain errors. We reserve the right to:
          </p>
          <ul className="space-y-2 text-muted-foreground">
            <li className="flex gap-3">
              <span className="text-brand-700 font-serif">•</span>
              <span>Correct errors or inaccuracies</span>
            </li>
            <li className="flex gap-3">
              <span className="text-brand-700 font-serif">•</span>
              <span>Update or remove products without notice</span>
            </li>
            <li className="flex gap-3">
              <span className="text-brand-700 font-serif">•</span>
              <span>Refuse orders at our discretion</span>
            </li>
            <li className="flex gap-3">
              <span className="text-brand-700 font-serif">•</span>
              <span>Limit order quantities or sizes</span>
            </li>
          </ul>
        </section>

        {/* Pricing & Payment */}
        <section className="mb-12">
          <h2 className="font-serif text-2xl text-brand-900 mb-4">Pricing & Payment</h2>
          <div className="space-y-4 text-muted-foreground text-sm">
            <p>
              <strong className="text-brand-900">Prices:</strong> All prices are in Indian Rupees (INR) unless otherwise stated. Prices are subject to change without notice.
            </p>
            <p>
              <strong className="text-brand-900">Taxes & Shipping:</strong> Prices do not include applicable taxes or shipping costs, which will be calculated at checkout.
            </p>
            <p>
              <strong className="text-brand-900">Payment:</strong> We accept major credit/debit cards, digital wallets, bank transfers, and UPI. All payments are processed through secure third-party providers.
            </p>
            <p>
              <strong className="text-brand-900">Payment Failure:</strong> If payment fails, we reserve the right to cancel your order. No guarantee of refund is made in case of duplicate charges.
            </p>
          </div>
        </section>

        {/* Order Acceptance */}
        <section className="mb-12">
          <h2 className="font-serif text-2xl text-brand-900 mb-4">Order Acceptance</h2>
          <p className="text-muted-foreground leading-relaxed mb-4">
            Your order is an offer to purchase. We will confirm acceptance by sending an order confirmation email. We reserve the right to decline or cancel any order for any reason, including:
          </p>
          <ul className="space-y-2 text-muted-foreground text-sm">
            <li className="flex gap-3">
              <span className="text-brand-700 font-serif">•</span>
              <span>Product unavailability</span>
            </li>
            <li className="flex gap-3">
              <span className="text-brand-700 font-serif">•</span>
              <span>Incorrect pricing or billing errors</span>
            </li>
            <li className="flex gap-3">
              <span className="text-brand-700 font-serif">•</span>
              <span>Suspected fraud or unauthorized use</span>
            </li>
            <li className="flex gap-3">
              <span className="text-brand-700 font-serif">•</span>
              <span>Violation of these terms</span>
            </li>
          </ul>
        </section>

        {/* Shipping & Delivery */}
        <section className="mb-12">
          <h2 className="font-serif text-2xl text-brand-900 mb-4">Shipping & Delivery</h2>
          <p className="text-muted-foreground leading-relaxed mb-4">
            We ship to addresses provided at checkout. Estimated delivery times are provided for reference only and are not guaranteed. Suitique Designs is not responsible for:
          </p>
          <ul className="space-y-2 text-muted-foreground text-sm">
            <li className="flex gap-3">
              <span className="text-brand-700 font-serif">•</span>
              <span>Delays caused by shipping carriers</span>
            </li>
            <li className="flex gap-3">
              <span className="text-brand-700 font-serif">•</span>
              <span>Lost or damaged packages once shipped</span>
            </li>
            <li className="flex gap-3">
              <span className="text-brand-700 font-serif">•</span>
              <span>Customs delays or duties for international orders</span>
            </li>
          </ul>
        </section>

        {/* Intellectual Property */}
        <section className="mb-12">
          <h2 className="font-serif text-2xl text-brand-900 mb-4">Intellectual Property Rights</h2>
          <p className="text-muted-foreground leading-relaxed">
            All content on our website—including text, images, designs, logos, and trademarks—is owned by or licensed to Suitique Designs. Unauthorized use, reproduction, or distribution is prohibited. You may not reverse-engineer, decompile, or attempt to derive our designs or business methods.
          </p>
        </section>

        {/* User-Generated Content */}
        <section className="mb-12">
          <h2 className="font-serif text-2xl text-brand-900 mb-4">User-Generated Content</h2>
          <p className="text-muted-foreground leading-relaxed mb-4">
            By submitting reviews, photos, or comments, you grant Suitique Designs a non-exclusive, royalty-free license to use this content for marketing purposes. You warrant that you own or have permission to use all submitted content and that it does not infringe on third-party rights.
          </p>
          <p className="text-muted-foreground leading-relaxed text-sm">
            We reserve the right to remove any content that violates these terms or is inappropriate.
          </p>
        </section>

        {/* Limitations of Liability */}
        <section className="mb-12 bg-cream-50 p-8 rounded-lg border border-border">
          <h2 className="font-serif text-2xl text-brand-900 mb-4">Limitations of Liability</h2>
          <p className="text-muted-foreground leading-relaxed text-sm">
            To the maximum extent permitted by law, Suitique Designs is not liable for any indirect, incidental, special, consequential, or punitive damages arising from your use of our website or products, even if we have been advised of the possibility of such damages. This includes loss of profits, data, or business.
          </p>
        </section>

        {/* Disclaimer */}
        <section className="mb-12">
          <h2 className="font-serif text-2xl text-brand-900 mb-4">Disclaimer</h2>
          <p className="text-muted-foreground leading-relaxed text-sm">
            Our website and products are provided "as is" without warranties of any kind. We do not guarantee that the website will be uninterrupted, error-free, or free from viruses. We disclaim all implied warranties, including merchantability, fitness for a particular purpose, and non-infringement.
          </p>
        </section>

        {/* Indemnification */}
        <section className="mb-12">
          <h2 className="font-serif text-2xl text-brand-900 mb-4">Indemnification</h2>
          <p className="text-muted-foreground leading-relaxed text-sm">
            You agree to indemnify and hold harmless Suitique Designs from any claims, losses, damages, or expenses arising from your use of our website, violation of these terms, or infringement of any third-party rights.
          </p>
        </section>

        {/* Modification of Terms */}
        <section className="mb-12">
          <h2 className="font-serif text-2xl text-brand-900 mb-4">Changes to Terms</h2>
          <p className="text-muted-foreground leading-relaxed text-sm">
            We reserve the right to modify these terms at any time. Changes will be effective immediately upon posting. Your continued use of the website constitutes acceptance of the modified terms.
          </p>
        </section>

        {/* Governing Law */}
        <section className="mb-12">
          <h2 className="font-serif text-2xl text-brand-900 mb-4">Governing Law</h2>
          <p className="text-muted-foreground leading-relaxed text-sm">
            These terms are governed by the laws of India. Any disputes shall be subject to the exclusive jurisdiction of the courts in Delhi, India.
          </p>
        </section>

        {/* Contact */}
        <section className="bg-cream-50 p-8 rounded-lg border border-border">
          <h2 className="font-serif text-2xl text-brand-900 mb-4">Contact Us</h2>
          <p className="text-muted-foreground leading-relaxed mb-4">
            If you have questions about these Terms and Conditions, please contact us:
          </p>
          <p className="text-muted-foreground text-sm">
            Email: <span className="text-brand-700">legal@suitiquedesign.com</span><br />
            Phone: <span className="text-brand-700">+91 98118 38318
              
            </span>
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
