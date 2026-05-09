import { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Terms & Conditions | Suitique Designs',
  description:
    'Read the terms and conditions, shipping, delivery, exchange, and purchase policies for Suitique Designs.',
};

export default function TermsAndConditionsPage() {
  return (
    <main className="min-h-[60vh]">
      <div className="bg-cream-50 py-12 md:py-16">
        <div className="container max-w-4xl px-4 md:px-8">
          <div className="mb-8">
            <h1 className="font-serif text-4xl md:text-5xl text-brand-900 mb-3">
              Terms & Conditions
            </h1>
            <p className="text-muted-foreground">Effective from January 1, 2024</p>
          </div>
        </div>
      </div>

      <div className="container max-w-4xl px-4 md:px-8 py-12 md:py-16">
        <section className="mb-12">
          <p className="text-muted-foreground leading-relaxed">
            Welcome to Suitique Designs. By visiting, accessing, or using our website, you agree
            to be bound by the following Terms and Conditions. If you do not agree with these
            terms, please do not use our website or services.
          </p>
        </section>

        <section className="mb-12">
          <h2 className="font-serif text-2xl text-brand-900 mb-4">Changes to Terms</h2>
          <p className="text-muted-foreground leading-relaxed">
            Suitique Designs reserves the right to amend, update, or revise these Terms and
            Conditions at any time by posting the updated terms on this website. Your continued use
            of the website after any changes means that you accept the updated terms.
          </p>
        </section>

        <section className="mb-12">
          <h2 className="font-serif text-2xl text-brand-900 mb-4">Products</h2>
          <p className="text-muted-foreground leading-relaxed">
            Various products are available for purchase on this website. By placing an order, you
            acknowledge and agree to the product details, pricing, policies, and terms displayed on
            the website at the time of purchase.
          </p>
        </section>

        <section className="mb-12">
          <h2 className="font-serif text-2xl text-brand-900 mb-4">Eligibility</h2>
          <p className="text-muted-foreground leading-relaxed">
            Only individuals who are legally capable of entering into binding contracts under the
            Indian Contract Act, 1872 are permitted to use this website. If you are under 18 years
            of age, you should use this website only with the involvement and consent of a parent
            or guardian.
          </p>
        </section>

        <section className="mb-12">
          <h2 className="font-serif text-2xl text-brand-900 mb-4">Account Responsibility</h2>
          <p className="text-muted-foreground leading-relaxed">
            Customers are responsible for maintaining the confidentiality of their account details
            and for all activities that occur under their account. Suitique Designs will not be
            responsible for any misuse of a customer account. Customers must provide accurate,
            complete, current, and genuine information while registering or placing an order.
          </p>
        </section>

        <section className="mb-12">
          <h2 className="font-serif text-2xl text-brand-900 mb-4">Price</h2>
          <p className="text-muted-foreground leading-relaxed">
            The price of the product will be the price displayed on our website at the time of
            placing the order. Prices may include applicable taxes unless mentioned otherwise.
            Delivery charges, if any, will be shown before order confirmation. Prices and
            availability may change at any time without prior notice.
          </p>
        </section>

        <section className="mb-12 bg-cream-50 p-8 rounded-lg border border-border">
          <h2 className="font-serif text-2xl text-brand-900 mb-4">Delivery Process</h2>
          <div className="space-y-4 text-muted-foreground leading-relaxed">
            <p>
              Suitique Designs understands the importance of delivering your products in the finest
              condition and on time. Therefore, we have partnered with reputed courier partners to
              deliver your products safely and efficiently.
            </p>
            <p>
              Once you place an order on our website, our system starts processing your order
              almost immediately. The product is then passed through a quality check before being
              packed securely and handed over to our trusted delivery partners.
            </p>
            <p>
              If your address falls in a location that is not served by our delivery partners, our
              team will contact you and try to find an alternative solution to make your order reach
              you.
            </p>
          </div>
        </section>

        <section className="mb-12">
          <h2 className="font-serif text-2xl text-brand-900 mb-4">Estimated Delivery Time</h2>
          <div className="space-y-4 text-muted-foreground leading-relaxed">
            <p>
              We aim to ship products within 5-7 working days. Orders are shipped throughout the
              week except Sundays.
            </p>
            <p>
              During festivals, adverse weather conditions, political issues, or courier-related
              delays, your shipment may take longer than expected. We will try our best to deliver
              your order as soon as possible and truly appreciate your patience.
            </p>
          </div>
        </section>

        <section className="mb-12">
          <h2 className="font-serif text-2xl text-brand-900 mb-4">Order Tracking</h2>
          <p className="text-muted-foreground leading-relaxed">
            Once your order is shipped, you will receive tracking details through email, SMS, or
            WhatsApp. You can use the tracking ID, order number, or AWB number provided by the
            courier partner to check the delivery status of your shipment.
          </p>
        </section>

        <section className="mb-12">
          <h2 className="font-serif text-2xl text-brand-900 mb-4">Domestic Shipping</h2>
          <div className="space-y-4 text-muted-foreground leading-relaxed">
            <p>
              Suitique Designs ships throughout India so that you can receive your order across the
              country.
            </p>
            <p>
              We currently provide standard shipping, which may be selected or applied during
              checkout while placing your order.
            </p>
            <p>
              Shipping is free all over India unless otherwise mentioned on the checkout page.
            </p>
            <p>
              Cash on Delivery is currently not available.
            </p>
          </div>
        </section>

        <section className="mb-12">
          <h2 className="font-serif text-2xl text-brand-900 mb-4">Order Packaging</h2>
          <p className="text-muted-foreground leading-relaxed">
            We take extra care to ensure that every order reaches you in excellent condition. Each
            item is packed securely in sturdy packaging to help protect it from physical damage
            during transit.
          </p>
        </section>

        <section className="mb-12">
          <h2 className="font-serif text-2xl text-brand-900 mb-4">Shipping Address Changes</h2>
          <p className="text-muted-foreground leading-relaxed">
            Once an order has been placed, the shipping address cannot be modified directly. If the
            product has already been shipped and you wish to change the address, the order may need
            to be re-shipped to the new address. In such cases, an additional shipping charge of
            INR 150 may apply.
          </p>
        </section>

        <section className="mb-12">
          <h2 className="font-serif text-2xl text-brand-900 mb-4">International Shipping</h2>
          <div className="space-y-4 text-muted-foreground leading-relaxed">
            <p>
              Suitique Designs may provide international shipping for selected orders and locations.
              International shipping availability and charges may vary depending on the destination.
            </p>
            <p>
              Taxes, customs duties, import duties, and local sales taxes are calculated according
              to the shipping destination and must be borne by the customer. As the recipient, you
              are responsible for paying all applicable charges required to release your order from
              customs on arrival.
            </p>
          </div>
        </section>

        <section className="mb-12">
          <h2 className="font-serif text-2xl text-brand-900 mb-4">Cancellation</h2>
          <p className="text-muted-foreground leading-relaxed">
            Cancellation requests may only be accepted if made within 24 hours of placing the order
            and only if the order has not been dispatched. Once the order has been shipped, it
            cannot be cancelled.
          </p>
        </section>

        <section className="mb-12 bg-cream-50 p-8 rounded-lg border border-border">
          <h2 className="font-serif text-2xl text-brand-900 mb-4">Return, Refund & Exchange</h2>
          <div className="space-y-4 text-muted-foreground leading-relaxed">
            <p>
              Suitique Designs does not offer returns or refunds once the product has been
              purchased and delivered.
            </p>
            <p>
              Exchange will be provided only if the article is received damaged. To claim an
              exchange, the customer must provide a proper uncut parcel opening video of the
              product on our given WhatsApp or official support contact.
            </p>
            <p>
              Exchange will be done with the same article in the same colour. Only if the same
              article is not available, the customer may be requested to choose another article of
              the same price.
            </p>
            <p>
              If the customer receives the wrong product, incomplete set, wrong style, or damaged
              product, Suitique Designs will replace it after verification. In certain cases subject
              to investigation, the company may request shipping payment.
            </p>
            <p>
              Repeated returns or repeated exchange requests are not accepted. Suitique Designs
              reserves the right to reject such requests.
            </p>
          </div>
        </section>

        <section className="mb-12">
          <h2 className="font-serif text-2xl text-brand-900 mb-4">
            Credit Card / Debit Card Details
          </h2>
          <p className="text-muted-foreground leading-relaxed">
            You agree that the card or payment information provided by you is accurate, valid, and
            legally owned by you. Suitique Designs will not be responsible for any fraudulent use
            of payment methods. Any such misuse will be the sole responsibility of the customer.
          </p>
        </section>

        <section className="mb-12">
          <h2 className="font-serif text-2xl text-brand-900 mb-4">Guarantee / Warranty</h2>
          <p className="text-muted-foreground leading-relaxed">
            Suitique Designs does not provide any guarantee or warranty for products unless
            specifically mentioned on the product page. Product colors, designs, and appearance may
            slightly vary due to photography, lighting, screen settings, or handmade variations.
          </p>
        </section>

        <section className="mb-12">
          <h2 className="font-serif text-2xl text-brand-900 mb-4">Unacceptable Content</h2>
          <p className="text-muted-foreground leading-relaxed">
            If any customer believes that any content, display, or material on the website is
            unlawful, misleading, defamatory, inappropriate, harmful, or contains a virus or spam,
            the customer should notify us immediately.
          </p>
        </section>

        <section className="mb-12">
          <h2 className="font-serif text-2xl text-brand-900 mb-4">Trademarks & Copyright</h2>
          <p className="text-muted-foreground leading-relaxed">
            All content on this website, including text, graphics, images, logos, code, designs,
            and software, is protected by copyright and trademark laws. No material from this
            website may be copied, modified, republished, uploaded, posted, transmitted, or
            distributed without written permission from Suitique Designs.
          </p>
        </section>

        <section className="mb-12">
          <h2 className="font-serif text-2xl text-brand-900 mb-4">Agreement to Be Bound</h2>
          <p className="text-muted-foreground leading-relaxed">
            By using this website or placing an order, you acknowledge that you have read,
            understood, and agreed to be bound by these Terms and Conditions and all policies
            mentioned on the website.
          </p>
        </section>

        <section className="bg-cream-50 p-8 rounded-lg border border-border">
          <h2 className="font-serif text-2xl text-brand-900 mb-4">Contact Us</h2>
          <p className="text-muted-foreground leading-relaxed mb-4">
            If you have any questions about these Terms and Conditions, please contact us:
          </p>
          <p className="text-muted-foreground text-sm">
            Email: <span className="text-brand-700">legal@suitiquedesign.com</span>
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