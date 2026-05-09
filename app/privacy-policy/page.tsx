import { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Privacy Policy | Suitique Designs',
  description: 'Learn how Suitique Designs protects your privacy and handles your personal data.',
};

export default function PrivacyPolicyPage() {
  return (
    <main className="min-h-[60vh]">
      <div className="bg-cream-50 py-12 md:py-16">
        <div className="container max-w-4xl px-4 md:px-8">
          <div className="mb-8">
            <h1 className="font-serif text-4xl md:text-5xl text-brand-900 mb-3">Privacy Policy</h1>
            <p className="text-muted-foreground">Effective from January 1, 2024</p>
          </div>
        </div>
      </div>

      <div className="container max-w-4xl px-4 md:px-8 py-12 md:py-16">
        {/* Introduction */}
        <section className="mb-12">
          <p className="text-muted-foreground leading-relaxed">
            At Suitique Designs, we are committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website and use our services.
          </p>
        </section>

        {/* Information We Collect */}
        <section className="mb-12">
          <h2 className="font-serif text-2xl text-brand-900 mb-4">Information We Collect</h2>
          <div className="space-y-4">
            <div>
              <h3 className="font-serif text-brand-900 font-semibold mb-2">Personal Information</h3>
              <p className="text-sm text-muted-foreground leading-relaxed mb-2">When you place an order or create an account, we collect:</p>
              <ul className="text-sm text-muted-foreground space-y-1 ml-4">
                <li>• Full name and email address</li>
                <li>• Phone number</li>
                <li>• Shipping and billing addresses</li>
                <li>• Payment information (processed securely through third-party providers)</li>
                <li>• Order history and preferences</li>
              </ul>
            </div>
            <div>
              <h3 className="font-serif text-brand-900 font-semibold mb-2">Browsing Information</h3>
              <p className="text-sm text-muted-foreground leading-relaxed mb-2">We automatically collect:</p>
              <ul className="text-sm text-muted-foreground space-y-1 ml-4">
                <li>• IP address and browser type</li>
                <li>• Pages visited and time spent on site</li>
                <li>• Referring website</li>
                <li>• Cookies and similar tracking technologies</li>
              </ul>
            </div>
          </div>
        </section>

        {/* How We Use Your Information */}
        <section className="mb-12">
          <h2 className="font-serif text-2xl text-brand-900 mb-4">How We Use Your Information</h2>
          <ul className="space-y-3 text-muted-foreground">
            <li className="flex gap-3">
              <span className="text-brand-700 font-serif">•</span>
              <span>Processing and fulfilling your orders</span>
            </li>
            <li className="flex gap-3">
              <span className="text-brand-700 font-serif">•</span>
              <span>Sending order confirmations and shipping updates</span>
            </li>
            <li className="flex gap-3">
              <span className="text-brand-700 font-serif">•</span>
              <span>Responding to your inquiries and providing customer support</span>
            </li>
            <li className="flex gap-3">
              <span className="text-brand-700 font-serif">•</span>
              <span>Sending promotional emails and newsletters (with your consent)</span>
            </li>
            <li className="flex gap-3">
              <span className="text-brand-700 font-serif">•</span>
              <span>Personalizing your shopping experience</span>
            </li>
            <li className="flex gap-3">
              <span className="text-brand-700 font-serif">•</span>
              <span>Analyzing site usage to improve our website and services</span>
            </li>
            <li className="flex gap-3">
              <span className="text-brand-700 font-serif">•</span>
              <span>Detecting and preventing fraudulent activities</span>
            </li>
          </ul>
        </section>

        {/* Sharing Your Information */}
        <section className="mb-12">
          <h2 className="font-serif text-2xl text-brand-900 mb-4">Sharing Your Information</h2>
          <p className="text-muted-foreground leading-relaxed mb-4">
            We do not sell your personal information. However, we may share information with:
          </p>
          <ul className="space-y-3 text-muted-foreground">
            <li className="flex gap-3">
              <span className="text-brand-700 font-serif">•</span>
              <span><strong>Shipping partners</strong> — to deliver your orders</span>
            </li>
            <li className="flex gap-3">
              <span className="text-brand-700 font-serif">•</span>
              <span><strong>Payment processors</strong> — to process transactions securely</span>
            </li>
            <li className="flex gap-3">
              <span className="text-brand-700 font-serif">•</span>
              <span><strong>Analytics providers</strong> — to understand site usage</span>
            </li>
            <li className="flex gap-3">
              <span className="text-brand-700 font-serif">•</span>
              <span><strong>Legal authorities</strong> — when required by law</span>
            </li>
          </ul>
        </section>

        {/* Data Security */}
        <section className="mb-12 bg-cream-50 p-8 rounded-lg border border-border">
          <h2 className="font-serif text-2xl text-brand-900 mb-4">Data Security</h2>
          <p className="text-muted-foreground leading-relaxed">
            We implement industry-standard security measures to protect your information, including SSL encryption, secure payment gateways, and limited access to personal data. However, no method of transmission over the Internet is 100% secure. If you have security concerns, please contact us immediately.
          </p>
        </section>

        {/* Your Rights */}
        <section className="mb-12">
          <h2 className="font-serif text-2xl text-brand-900 mb-4">Your Rights</h2>
          <p className="text-muted-foreground leading-relaxed mb-4">
            You have the right to:
          </p>
          <ul className="space-y-3 text-muted-foreground">
            <li className="flex gap-3">
              <span className="text-brand-700 font-serif">•</span>
              <span>Access your personal data</span>
            </li>
            <li className="flex gap-3">
              <span className="text-brand-700 font-serif">•</span>
              <span>Correct inaccurate information</span>
            </li>
            <li className="flex gap-3">
              <span className="text-brand-700 font-serif">•</span>
              <span>Request deletion of your data</span>
            </li>
            <li className="flex gap-3">
              <span className="text-brand-700 font-serif">•</span>
              <span>Opt-out of marketing communications</span>
            </li>
            <li className="flex gap-3">
              <span className="text-brand-700 font-serif">•</span>
              <span>Request a copy of your data in a portable format</span>
            </li>
          </ul>
        </section>

        {/* Cookies */}
        <section className="mb-12">
          <h2 className="font-serif text-2xl text-brand-900 mb-4">Cookies</h2>
          <p className="text-muted-foreground leading-relaxed mb-4">
            We use cookies to enhance your browsing experience. This includes:
          </p>
          <ul className="space-y-3 text-muted-foreground text-sm">
            <li className="flex gap-3">
              <span className="text-brand-700 font-serif">•</span>
              <span><strong>Session cookies</strong> — to keep you logged in during your visit</span>
            </li>
            <li className="flex gap-3">
              <span className="text-brand-700 font-serif">•</span>
              <span><strong>Preference cookies</strong> — to remember your settings</span>
            </li>
            <li className="flex gap-3">
              <span className="text-brand-700 font-serif">•</span>
              <span><strong>Analytics cookies</strong> — to understand how visitors use our site</span>
            </li>
          </ul>
          <p className="text-muted-foreground leading-relaxed mt-4">
            You can control cookies through your browser settings. Disabling cookies may affect site functionality.
          </p>
        </section>

        {/* Third-Party Links */}
        <section className="mb-12">
          <h2 className="font-serif text-2xl text-brand-900 mb-4">Third-Party Links</h2>
          <p className="text-muted-foreground leading-relaxed">
            Our website may contain links to third-party websites. We are not responsible for their privacy practices. We encourage you to review their privacy policies before providing personal information.
          </p>
        </section>

        {/* Contact */}
        <section className="bg-cream-50 p-8 rounded-lg border border-border">
          <h2 className="font-serif text-2xl text-brand-900 mb-4">Contact Us</h2>
          <p className="text-muted-foreground leading-relaxed mb-4">
            If you have questions about this Privacy Policy or how we handle your data, please contact us:
          </p>
          <p className="text-muted-foreground">
            Email: <span className="text-brand-700">privacy@suitique.com</span><br />
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
