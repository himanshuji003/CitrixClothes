import { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Contact Us | Suitique Designs',
  description: 'Get in touch with Suitique Designs. We\'d love to hear from you.',
};

export default function ContactUsPage() {
  return (
    <main className="min-h-[60vh]">
      <div className="bg-cream-50 py-12 md:py-16">
        <div className="container max-w-4xl px-4 md:px-8">
          <div className="mb-8">
            <h1 className="font-serif text-4xl md:text-5xl text-brand-900 mb-3">Contact Us</h1>
            <p className="text-muted-foreground">We're here to help and answer any questions you might have</p>
          </div>
        </div>
      </div>

      <div className="container max-w-4xl px-4 md:px-8 py-12 md:py-16">
        {/* Introduction */}
        <section className="mb-12">
          <p className="text-muted-foreground leading-relaxed">
            Have questions about our collections, need styling advice, or want to discuss a custom order? Our dedicated customer care team is here to assist you. Whether you prefer email, phone, or in-person consultation, we're committed to providing exceptional service.
          </p>
        </section>

        {/* Contact Methods */}
        <section className="mb-12 grid md:grid-cols-2 gap-8">
          {/* Email */}
          <div className="border border-border rounded-lg p-8">
            <h3 className="font-serif text-2xl text-brand-900 mb-3">Email</h3>
            <p className="text-muted-foreground text-sm mb-4">For general inquiries and customer support:</p>
            <p className="font-serif text-lg text-brand-700 hover:text-brand-900 transition-colors duration-200 cursor-pointer">
              support@suitique.com
            </p>
            <p className="text-muted-foreground text-xs mt-3">Response time: 24-48 hours</p>
          </div>

          {/* Phone */}
          <div className="border border-border rounded-lg p-8">
            <h3 className="font-serif text-2xl text-brand-900 mb-3">Phone</h3>
            <p className="text-muted-foreground text-sm mb-4">Call our customer care team:</p>
            <p className="font-serif text-lg text-brand-700 hover:text-brand-900 transition-colors duration-200 cursor-pointer">
              +91 (0) 11-XXXX-XXXX
            </p>
            <p className="text-muted-foreground text-xs mt-3">Monday - Saturday, 10 AM - 6 PM IST</p>
          </div>
        </section>

        {/* Departments */}
        <section className="mb-12">
          <h2 className="font-serif text-2xl text-brand-900 mb-6">Department Contacts</h2>
          <div className="space-y-4">
            <div className="bg-cream-50 p-6 rounded-lg border border-border">
              <h3 className="font-serif text-brand-900 font-semibold mb-2">Customer Service</h3>
              <p className="text-sm text-muted-foreground mb-2">Orders, refunds, shipping inquiries</p>
              <p className="text-brand-700 font-serif">care@suitique.com</p>
            </div>
            <div className="bg-cream-50 p-6 rounded-lg border border-border">
              <h3 className="font-serif text-brand-900 font-semibold mb-2">Styling & Consultation</h3>
              <p className="text-sm text-muted-foreground mb-2">Personal styling and bespoke orders</p>
              <p className="text-brand-700 font-serif">styling@suitique.com</p>
            </div>
            <div className="bg-cream-50 p-6 rounded-lg border border-border">
              <h3 className="font-serif text-brand-900 font-semibold mb-2">Partnerships & Wholesale</h3>
              <p className="text-sm text-muted-foreground mb-2">B2B inquiries and collaborations</p>
              <p className="text-brand-700 font-serif">wholesale@suitique.com</p>
            </div>
            <div className="bg-cream-50 p-6 rounded-lg border border-border">
              <h3 className="font-serif text-brand-900 font-semibold mb-2">Press & Media</h3>
              <p className="text-sm text-muted-foreground mb-2">Press releases and media inquiries</p>
              <p className="text-brand-700 font-serif">press@suitique.com</p>
            </div>
          </div>
        </section>

        {/* Physical Address */}
        <section className="mb-12 bg-cream-50 p-8 rounded-lg border border-border">
          <h2 className="font-serif text-2xl text-brand-900 mb-4">Visit Our Atelier</h2>
          <p className="text-muted-foreground leading-relaxed mb-6">
            Experience our collections in person at our flagship atelier in Delhi. Browse our latest pieces, receive expert styling advice, and connect with our artisan community.
          </p>
          <div className="space-y-3 text-muted-foreground">
            <p>
              <strong className="text-brand-900">Suitique Designs Atelier</strong><br />
              Lodhi Colony, New Delhi<br />
              Delhi 110003, India
            </p>
            <p>
              <strong className="text-brand-900">Hours</strong><br />
              Monday - Saturday: 10 AM - 6 PM<br />
              Sunday: 12 PM - 5 PM<br />
              <span className="text-xs">(Closed national holidays)</span>
            </p>
          </div>
        </section>

        {/* Response Times */}
        <section className="mb-12">
          <h2 className="font-serif text-2xl text-brand-900 mb-4">Response Times</h2>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="font-serif text-3xl text-brand-700 mb-2">24-48h</div>
              <p className="text-sm text-muted-foreground">Email responses</p>
            </div>
            <div className="text-center">
              <div className="font-serif text-3xl text-brand-700 mb-2">Immediate</div>
              <p className="text-sm text-muted-foreground">Phone support</p>
            </div>
            <div className="text-center">
              <div className="font-serif text-3xl text-brand-700 mb-2">1-2 hours</div>
              <p className="text-sm text-muted-foreground">Chat support</p>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="mb-12">
          <h2 className="font-serif text-2xl text-brand-900 mb-4">Quick Help</h2>
          <p className="text-muted-foreground leading-relaxed mb-6">
            Can't find what you're looking for? Check out our <Link href="/faqs" className="text-brand-700 hover:text-brand-900 transition-colors duration-200">FAQs</Link> for answers to common questions.
          </p>
        </section>

        {/* Newsletter */}
        <section className="bg-cream-50 p-8 rounded-lg border border-border">
          <h2 className="font-serif text-2xl text-brand-900 mb-4">Stay Connected</h2>
          <p className="text-muted-foreground leading-relaxed mb-6">
            Subscribe to our newsletter to receive updates about new collections, exclusive offers, and styling inspiration.
          </p>
          <div className="flex flex-col sm:flex-row gap-3">
            <input
              type="email"
              placeholder="Enter your email"
              className="flex-1 px-4 py-2 border border-border rounded-lg bg-white text-sm text-brand-900 placeholder:text-muted-foreground focus:outline-none focus:border-brand-700"
            />
            <button className="px-6 py-2 bg-brand-700 text-cream-50 rounded-lg hover:bg-brand-900 transition-colors duration-200 font-serif text-sm whitespace-nowrap cursor-pointer">
              Subscribe
            </button>
          </div>
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
