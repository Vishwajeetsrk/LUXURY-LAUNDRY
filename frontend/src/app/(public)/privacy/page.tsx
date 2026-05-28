import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Privacy Policy | LUXURY LAUNDRY",
  description: "Privacy Policy for LuxWash Premium Laundry services.",
};

export default function PrivacyPolicyPage() {
  return (
    <>
      <section className="bg-gray-50 py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <h1 className="text-4xl font-black text-gray-900 mb-4">Privacy Policy</h1>
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <Link href="/" className="hover:text-primary-600 transition-colors">Home</Link>
            <i className="fa-solid fa-chevron-right text-xs" />
            <span className="text-gray-900 font-medium">Privacy Policy</span>
          </div>
        </div>
      </section>

      <section className="py-12 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 prose prose-lg prose-blue">
          <p>Last updated: {new Date().toLocaleDateString()}</p>
          
          <h2>1. Introduction</h2>
          <p>
            Welcome to LuxWash ("we," "our," or "us"). We respect your privacy and are committed to protecting your personal data. This Privacy Policy explains how we collect, use, and safeguard your information when you use our laundry and dry cleaning services.
          </p>

          <h2>2. Information We Collect</h2>
          <p>We may collect and process the following data about you:</p>
          <ul>
            <li><strong>Personal Identification Information:</strong> Name, email address, phone number, and delivery address.</li>
            <li><strong>Order Details:</strong> Information about the garments you submit, special instructions, and transaction history.</li>
            <li><strong>Technical Data:</strong> IP address, browser type, device information, and usage patterns on our website.</li>
          </ul>

          <h2>3. How We Use Your Information</h2>
          <p>We use your information for the following purposes:</p>
          <ul>
            <li>To provide and manage our laundry services, including pickups and deliveries.</li>
            <li>To process payments and generate invoices.</li>
            <li>To communicate with you regarding your orders (e.g., WhatsApp notifications).</li>
            <li>To improve our website, services, and customer experience.</li>
          </ul>

          <h2>4. Data Sharing and Security</h2>
          <p>
            We do not sell, trade, or rent your personal information to third parties. We may share your data with trusted service providers (such as payment gateways and delivery partners) solely for the purpose of operating our business and providing services to you.
          </p>
          <p>
            We implement industry-standard security measures to protect your data from unauthorized access, alteration, disclosure, or destruction.
          </p>

          <h2>5. Your Rights</h2>
          <p>
            You have the right to access, update, or request the deletion of your personal data. If you have any concerns about your privacy or wish to exercise your rights, please contact our support team.
          </p>

          <h2>6. Contact Us</h2>
          <p>
            If you have any questions about this Privacy Policy, please contact us at: <br/>
            <strong>Email:</strong> support@luxwash.com <br/>
            <strong>Phone:</strong> +91-9663574728
          </p>
        </div>
      </section>
    </>
  );
}
