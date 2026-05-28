import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Terms of Service | LUXURY LAUNDRY",
  description: "Terms of Service for LuxWash Premium Laundry.",
};

export default function TermsOfServicePage() {
  return (
    <>
      <section className="bg-gray-50 py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <h1 className="text-4xl font-black text-gray-900 mb-4">Terms of Service</h1>
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <Link href="/" className="hover:text-primary-600 transition-colors">Home</Link>
            <i className="fa-solid fa-chevron-right text-xs" />
            <span className="text-gray-900 font-medium">Terms of Service</span>
          </div>
        </div>
      </section>

      <section className="py-12 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 prose prose-lg prose-blue">
          <p>Last updated: {new Date().toLocaleDateString()}</p>

          <h2>1. Acceptance of Terms</h2>
          <p>
            By accessing or using the LuxWash platform, website, or services, you agree to be bound by these Terms of Service. If you do not agree to these terms, please refrain from using our services.
          </p>

          <h2>2. Services Provided</h2>
          <p>
            LuxWash offers premium laundry, dry cleaning, and garment care services. While we handle all items with the utmost care using standard professional processes, we cannot guarantee against color loss, bleeding, or shrinkage of garments.
          </p>

          <h2>3. Order and Pricing</h2>
          <ul>
            <li><strong>Minimum Order:</strong> Specific services may be subject to minimum order values.</li>
            <li><strong>Pricing:</strong> Prices for our services are subject to change without prior notice. Any applicable pickup/delivery charges will be clearly displayed before checkout.</li>
            <li><strong>Payment:</strong> Payment is due upon delivery or via online payment methods explicitly requested through the platform.</li>
          </ul>

          <h2>4. Damaged or Lost Items</h2>
          <p>
            In the rare event that an item is damaged or lost while in our care, LuxWash's liability shall not exceed ten (10) times the charge for cleaning the specific item, regardless of brand or condition. Claims must be made within 48 hours of delivery.
          </p>

          <h2>5. Pickup and Delivery</h2>
          <p>
            We strive to maintain our scheduled pickup and delivery times. However, unforeseen circumstances such as traffic, weather, or operational delays may occasionally impact these times. We will notify you of any significant delays.
          </p>
          <p>
            For safety and security, please ensure that you or an authorized representative are available during the scheduled pickup and delivery windows.
          </p>

          <h2>6. Subscriptions and Packages</h2>
          <p>
            If you subscribe to one of our premium packages (Silver, Gold, Premium), discounts will be applied automatically based on the terms outlined in the respective package. Subscriptions are non-transferable and may be subject to fair usage policies.
          </p>

          <h2>7. Contact Information</h2>
          <p>
            For questions regarding these Terms of Service, please contact: <br/>
            <strong>Email:</strong> support@luxwash.com <br/>
            <strong>Phone:</strong> +91-9663574728
          </p>
        </div>
      </section>
    </>
  );
}
