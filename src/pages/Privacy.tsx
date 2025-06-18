
import React from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

const Privacy = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-lg shadow-lg p-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-6">MOK Mzansi Books Privacy Policy</h1>
            <p className="text-sm text-gray-600 mb-8"><strong>Last Updated:</strong> June 3, 2025</p>

            <div className="prose prose-lg max-w-none">
              <h2 className="text-2xl font-semibold text-gray-800 mt-8 mb-4">1. Introduction</h2>
              <p className="mb-4">
                Welcome to MOK Mzansi Books ("we," "our," or "us"). We are committed to protecting your privacy and ensuring the security of your personal information. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our financial management software and related services (collectively, the "Service").
              </p>
              <p className="mb-6">
                By accessing or using our Service, you agree to the collection and use of information in accordance with this policy. If you do not agree with our policies and practices, please do not use our Service.
              </p>

              <h2 className="text-2xl font-semibold text-gray-800 mt-8 mb-4">2. Information We Collect</h2>
              
              <h3 className="text-xl font-semibold text-gray-700 mt-6 mb-3">2.1 Information You Provide to Us</h3>
              <p className="mb-4">When you register for an account or use our Service, we may collect:</p>
              <ul className="list-disc pl-6 mb-4">
                <li><strong>Account Information</strong>: Name, email address, phone number, company name, and password.</li>
                <li><strong>Billing Information</strong>: Credit card details, billing address, and payment history (processed through secure third-party payment processors).</li>
                <li><strong>Business Information</strong>: Client details, financial records, invoices, quotations, and other business-related documents you upload or create.</li>
                <li><strong>Communication Data</strong>: Records of your correspondence with us, including support requests and feedback.</li>
              </ul>

              <h3 className="text-xl font-semibold text-gray-700 mt-6 mb-3">2.2 Information We Collect Automatically</h3>
              <p className="mb-4">When you use our Service, we may automatically collect:</p>
              <ul className="list-disc pl-6 mb-4">
                <li><strong>Usage Data</strong>: Information about how you interact with our Service, including pages visited, features used, and time spent.</li>
                <li><strong>Device Information</strong>: IP address, browser type, operating system, device identifiers, and other technical data.</li>
                <li><strong>Cookies and Tracking Technologies</strong>: We use cookies and similar technologies to enhance your experience and analyze usage patterns.</li>
              </ul>

              <h3 className="text-xl font-semibold text-gray-700 mt-6 mb-3">2.3 Information from Third Parties</h3>
              <p className="mb-4">We may receive information about you from third parties, such as:</p>
              <ul className="list-disc pl-6 mb-6">
                <li>Business partners and service providers.</li>
                <li>Social media platforms (if you choose to connect your account).</li>
                <li>Publicly available sources.</li>
              </ul>

              <h2 className="text-2xl font-semibold text-gray-800 mt-8 mb-4">3. How We Use Your Information</h2>
              <p className="mb-4">We use the information we collect for the following purposes:</p>
              <ul className="list-disc pl-6 mb-6">
                <li><strong>To Provide and Maintain Our Service</strong>: Create and manage your account, process payments, and deliver the features you request.</li>
                <li><strong>To Improve Our Service</strong>: Analyze usage patterns, troubleshoot issues, and enhance user experience.</li>
                <li><strong>To Communicate with You</strong>: Send important notices, updates, and marketing communications (with your consent where required).</li>
                <li><strong>To Ensure Security</strong>: Protect against fraud, unauthorized access, and other security risks.</li>
                <li><strong>To Comply with Legal Obligations</strong>: Meet legal and regulatory requirements.</li>
                <li><strong>For Business Transfers</strong>: In connection with a merger, acquisition, or sale of assets.</li>
              </ul>

              <h2 className="text-2xl font-semibold text-gray-800 mt-8 mb-4">4. How We Share Your Information</h2>
              <p className="mb-4">We may share your information in the following circumstances:</p>
              <ul className="list-disc pl-6 mb-6">
                <li><strong>With Service Providers</strong>: Third-party vendors who assist us in delivering our Service (e.g., payment processors, hosting providers).</li>
                <li><strong>With Your Consent</strong>: When you give us permission to share your information.</li>
                <li><strong>For Legal Reasons</strong>: To comply with legal obligations, protect our rights, or respond to lawful requests from authorities.</li>
                <li><strong>In Aggregated or Anonymized Form</strong>: For research, analytics, or marketing purposes (cannot be used to identify you).</li>
              </ul>

              <h2 className="text-2xl font-semibold text-gray-800 mt-8 mb-4">5. Data Retention</h2>
              <p className="mb-6">
                We retain your personal information only for as long as necessary to fulfill the purposes outlined in this Privacy Policy, unless a longer retention period is required or permitted by law. When your information is no longer needed, we will securely delete or anonymize it.
              </p>

              <h2 className="text-2xl font-semibold text-gray-800 mt-8 mb-4">6. Data Security</h2>
              <p className="mb-4">We implement appropriate technical and organizational measures to protect your personal information from unauthorized access, alteration, disclosure, or destruction. These measures include:</p>
              <ul className="list-disc pl-6 mb-4">
                <li><strong>Encryption</strong>: Data in transit and at rest using industry-standard protocols.</li>
                <li><strong>Access Controls</strong>: Restrict access to personal information to authorized personnel only.</li>
                <li><strong>Regular Audits</strong>: Conduct security assessments to identify and address vulnerabilities.</li>
              </ul>
              <p className="mb-6">
                Despite our efforts, no method of transmission over the internet or electronic storage is 100% secure. We cannot guarantee absolute security but are committed to protecting your information to the best of our ability.
              </p>

              <h2 className="text-2xl font-semibold text-gray-800 mt-8 mb-4">7. Your Rights Under POPIA and GDPR</h2>
              <p className="mb-4">Depending on your location, you may have the following rights regarding your personal information:</p>
              <ul className="list-disc pl-6 mb-4">
                <li><strong>Right to Access</strong>: Request a copy of the personal information we hold about you.</li>
                <li><strong>Right to Rectification</strong>: Correct inaccurate or incomplete information.</li>
                <li><strong>Right to Erasure</strong>: Request deletion of your personal information under certain conditions.</li>
                <li><strong>Right to Restrict Processing</strong>: Limit how we use your information.</li>
                <li><strong>Right to Data Portability</strong>: Receive your data in a structured, commonly used format.</li>
                <li><strong>Right to Object</strong>: Opt out of certain uses of your information, such as direct marketing.</li>
                <li><strong>Right to Withdraw Consent</strong>: Withdraw previously given consent at any time.</li>
              </ul>
              <p className="mb-6">
                To exercise these rights, please contact us at mokgethwamoabelo@gmail.com. We may need to verify your identity before processing your request.
              </p>

              <h2 className="text-2xl font-semibold text-gray-800 mt-8 mb-4">8. International Data Transfers</h2>
              <p className="mb-6">
                Your information may be transferred to and processed in countries other than South Africa, where data protection laws may differ. We will take all necessary steps to ensure your data is treated securely and in accordance with this Privacy Policy.
              </p>

              <h2 className="text-2xl font-semibold text-gray-800 mt-8 mb-4">9. Children's Privacy</h2>
              <p className="mb-6">
                Our Service is not intended for individuals under the age of 18. We do not knowingly collect personal information from children. If we become aware that we have collected personal information from a child, we will take steps to delete it immediately.
              </p>

              <h2 className="text-2xl font-semibold text-gray-800 mt-8 mb-4">10. Changes to This Privacy Policy</h2>
              <p className="mb-6">
                We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new policy on this page and updating the "Last Updated" date. Your continued use of the Service after such changes constitutes acceptance of the updated policy.
              </p>

              <h2 className="text-2xl font-semibold text-gray-800 mt-8 mb-4">11. Contact Us</h2>
              <p className="mb-4">If you have any questions or concerns about this Privacy Policy or our data practices, please contact us at:</p>
              <div className="bg-gray-100 p-4 rounded-lg mb-6">
                <p><strong>Email:</strong> mokgethwamoabelo@gmail.com</p>
                <p><strong>Phone:</strong> +27 64 550 4029</p>
                <p><strong>Company:</strong> Morwa Moabelo (Pty) Ltd</p>
                <p><strong>Reg No:</strong> 2018/421571/07</p>
              </div>

              <h2 className="text-2xl font-semibold text-gray-800 mt-8 mb-4">12. Complaints</h2>
              <p className="mb-4">If you believe your data protection rights have been violated, you have the right to lodge a complaint with the relevant data protection authority:</p>
              <ul className="list-disc pl-6 mb-6">
                <li><strong>South Africa:</strong> Information Regulator (https://www.justice.gov.za/inforeg/)</li>
                <li><strong>EU:</strong> Your local data protection authority</li>
              </ul>

              <div className="border-t pt-6 mt-8">
                <p className="text-sm text-gray-600 italic">
                  This Privacy Policy is effective as of the date stated above and supersedes all prior versions.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Privacy;
