
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
            <h1 className="text-4xl font-bold text-gray-900 mb-6">Privacy Policy</h1>
            <p className="text-sm text-gray-600 mb-8"><strong>Last Updated:</strong> August 2025</p>

            <div className="prose prose-lg max-w-none space-y-8">
              
              {/* Introduction */}
              <section>
                <h2 className="text-2xl font-semibold text-gray-800 mb-4">1. Introduction</h2>
                <p className="text-gray-700 leading-relaxed mb-4">
                  MOK Mzansi Books ("we," "our," or "us") is committed to protecting your privacy and personal data. 
                  This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you 
                  visit our website and use our accounting and business management services.
                </p>
                <p className="text-gray-700 leading-relaxed">
                  By using our services, you agree to the collection and use of information in accordance with this policy. 
                  We comply with applicable data protection laws, including the General Data Protection Regulation (GDPR) 
                  and the California Consumer Privacy Act (CCPA).
                </p>
              </section>

              {/* Data Collection */}
              <section>
                <h2 className="text-2xl font-semibold text-gray-800 mb-4">2. Information We Collect</h2>
                
                <h3 className="text-xl font-medium text-gray-700 mb-3">2.1 Personal Information</h3>
                <p className="text-gray-700 leading-relaxed mb-4">
                  We may collect the following types of personal information:
                </p>
                <ul className="list-disc list-inside text-gray-700 space-y-2 mb-6">
                  <li><strong>Contact Information:</strong> Name, email address, phone number, postal address</li>
                  <li><strong>Account Information:</strong> Username, password, profile information</li>
                  <li><strong>Business Information:</strong> Company name, tax identification numbers, business address</li>
                  <li><strong>Financial Information:</strong> Bank account details, payment information (processed securely through third-party providers)</li>
                  <li><strong>Communication Data:</strong> Messages, support tickets, feedback</li>
                </ul>

                <h3 className="text-xl font-medium text-gray-700 mb-3">2.2 Technical Information</h3>
                <ul className="list-disc list-inside text-gray-700 space-y-2 mb-6">
                  <li><strong>Device Information:</strong> IP address, browser type, operating system, device identifiers</li>
                  <li><strong>Usage Data:</strong> Pages visited, time spent on site, click patterns, feature usage</li>
                  <li><strong>Location Data:</strong> General geographic location based on IP address</li>
                  <li><strong>Cookies and Tracking:</strong> Session data, preferences, analytics information</li>
                </ul>

                <h3 className="text-xl font-medium text-gray-700 mb-3">2.3 Business Data</h3>
                <ul className="list-disc list-inside text-gray-700 space-y-2">
                  <li>Client and customer information you input into our system</li>
                  <li>Financial records, invoices, and transaction data</li>
                  <li>Inventory and product information</li>
                  <li>Reports and analytics generated through our platform</li>
                </ul>
              </section>

              {/* Purpose of Data Collection */}
              <section>
                <h2 className="text-2xl font-semibold text-gray-800 mb-4">3. How We Use Your Information</h2>
                <p className="text-gray-700 leading-relaxed mb-4">
                  We use your personal information for the following purposes:
                </p>
                <ul className="list-disc list-inside text-gray-700 space-y-2">
                  <li><strong>Service Provision:</strong> To provide, maintain, and improve our accounting and business management services</li>
                  <li><strong>Account Management:</strong> To create and manage your account, authenticate users, and provide customer support</li>
                  <li><strong>Communication:</strong> To send service-related notifications, updates, and respond to inquiries</li>
                  <li><strong>Payment Processing:</strong> To process payments and manage billing (through secure third-party processors)</li>
                  <li><strong>Legal Compliance:</strong> To comply with applicable laws, regulations, and legal processes</li>
                  <li><strong>Security:</strong> To protect against fraud, unauthorized access, and security threats</li>
                  <li><strong>Analytics:</strong> To analyze usage patterns and improve our services</li>
                  <li><strong>Marketing:</strong> To send promotional materials (with your consent where required)</li>
                </ul>
              </section>

              {/* Data Storage and Security */}
              <section>
                <h2 className="text-2xl font-semibold text-gray-800 mb-4">4. Data Storage and Security</h2>
                
                <h3 className="text-xl font-medium text-gray-700 mb-3">4.1 Data Storage</h3>
                <p className="text-gray-700 leading-relaxed mb-4">
                  Your data is stored on secure servers provided by reputable cloud service providers. We use industry-standard 
                  encryption and security measures to protect your information both in transit and at rest.
                </p>

                <h3 className="text-xl font-medium text-gray-700 mb-3">4.2 Security Measures</h3>
                <ul className="list-disc list-inside text-gray-700 space-y-2 mb-4">
                  <li>SSL/TLS encryption for data transmission</li>
                  <li>Regular security audits and vulnerability assessments</li>
                  <li>Access controls and authentication mechanisms</li>
                  <li>Regular data backups and disaster recovery procedures</li>
                  <li>Employee training on data protection and security practices</li>
                </ul>

                <h3 className="text-xl font-medium text-gray-700 mb-3">4.3 Data Retention</h3>
                <p className="text-gray-700 leading-relaxed">
                  We retain your personal information for as long as necessary to provide our services and comply with legal 
                  obligations. Business and financial data may be retained for longer periods as required by applicable 
                  accounting and tax regulations.
                </p>
              </section>

              {/* User Rights */}
              <section>
                <h2 className="text-2xl font-semibold text-gray-800 mb-4">5. Your Rights</h2>
                <p className="text-gray-700 leading-relaxed mb-4">
                  Depending on your location, you may have the following rights regarding your personal data:
                </p>
                <ul className="list-disc list-inside text-gray-700 space-y-2">
                  <li><strong>Access:</strong> Request access to your personal information</li>
                  <li><strong>Rectification:</strong> Request correction of inaccurate or incomplete data</li>
                  <li><strong>Erasure:</strong> Request deletion of your personal information ("right to be forgotten")</li>
                  <li><strong>Portability:</strong> Request transfer of your data to another service provider</li>
                  <li><strong>Restriction:</strong> Request limitation of processing of your personal information</li>
                  <li><strong>Objection:</strong> Object to processing of your personal information for certain purposes</li>
                  <li><strong>Withdraw Consent:</strong> Withdraw consent for processing where consent is the legal basis</li>
                </ul>
                <p className="text-gray-700 leading-relaxed mt-4">
                  To exercise these rights, please contact us at <a href="mailto:admin@mokmzansibooks.com" className="text-blue-600 hover:text-blue-800">admin@mokmzansibooks.com</a>. 
                  We will respond to your request within 30 days.
                </p>
              </section>

              {/* Cookies Policy */}
              <section>
                <h2 className="text-2xl font-semibold text-gray-800 mb-4">6. Cookies and Tracking Technologies</h2>
                
                <h3 className="text-xl font-medium text-gray-700 mb-3">6.1 Types of Cookies</h3>
                <ul className="list-disc list-inside text-gray-700 space-y-2 mb-4">
                  <li><strong>Essential Cookies:</strong> Required for basic website functionality and security</li>
                  <li><strong>Performance Cookies:</strong> Help us understand how visitors interact with our website</li>
                  <li><strong>Functional Cookies:</strong> Remember your preferences and settings</li>
                  <li><strong>Marketing Cookies:</strong> Used to deliver relevant advertisements (with your consent)</li>
                </ul>

                <h3 className="text-xl font-medium text-gray-700 mb-3">6.2 Managing Cookies</h3>
                <p className="text-gray-700 leading-relaxed mb-4">
                  You can control cookies through your browser settings. However, disabling certain cookies may affect 
                  the functionality of our website. We also use analytics tools like Google Analytics to understand 
                  user behavior and improve our services.
                </p>

                <h3 className="text-xl font-medium text-gray-700 mb-3">6.3 Third-Party Tracking</h3>
                <p className="text-gray-700 leading-relaxed">
                  We may use third-party services for analytics, advertising, and other purposes. These services may 
                  collect information about your online activities across different websites.
                </p>
              </section>

              {/* Third-Party Sharing */}
              <section>
                <h2 className="text-2xl font-semibold text-gray-800 mb-4">7. Data Sharing and Disclosure</h2>
                
                <h3 className="text-xl font-medium text-gray-700 mb-3">7.1 Service Providers</h3>
                <p className="text-gray-700 leading-relaxed mb-4">
                  We may share your information with trusted third-party service providers who assist us in operating 
                  our website and providing our services, including:
                </p>
                <ul className="list-disc list-inside text-gray-700 space-y-2 mb-4">
                  <li>Cloud hosting and storage providers</li>
                  <li>Payment processors</li>
                  <li>Email service providers</li>
                  <li>Analytics and marketing platforms</li>
                  <li>Customer support tools</li>
                </ul>

                <h3 className="text-xl font-medium text-gray-700 mb-3">7.2 Legal Requirements</h3>
                <p className="text-gray-700 leading-relaxed mb-4">
                  We may disclose your information when required by law, court order, or government regulation, or when 
                  we believe disclosure is necessary to protect our rights, your safety, or the safety of others.
                </p>

                <h3 className="text-xl font-medium text-gray-700 mb-3">7.3 Business Transfers</h3>
                <p className="text-gray-700 leading-relaxed">
                  In the event of a merger, acquisition, or sale of assets, your personal information may be transferred 
                  to the acquiring entity, subject to the same privacy protections.
                </p>
              </section>

              {/* International Transfers */}
              <section>
                <h2 className="text-2xl font-semibold text-gray-800 mb-4">8. International Data Transfers</h2>
                <p className="text-gray-700 leading-relaxed">
                  Your information may be transferred to and processed in countries other than your country of residence. 
                  We ensure appropriate safeguards are in place to protect your personal information in accordance with 
                  applicable data protection laws, including the use of standard contractual clauses approved by the 
                  European Commission.
                </p>
              </section>

              {/* Children's Privacy */}
              <section>
                <h2 className="text-2xl font-semibold text-gray-800 mb-4">9. Children's Privacy</h2>
                <p className="text-gray-700 leading-relaxed">
                  Our services are not intended for individuals under the age of 18. We do not knowingly collect personal 
                  information from children under 18. If we become aware that we have collected personal information from 
                  a child under 18, we will take steps to delete such information.
                </p>
              </section>

              {/* Policy Updates */}
              <section>
                <h2 className="text-2xl font-semibold text-gray-800 mb-4">10. Policy Updates</h2>
                <p className="text-gray-700 leading-relaxed">
                  We may update this Privacy Policy from time to time to reflect changes in our practices or applicable laws. 
                  We will notify you of any material changes by posting the updated policy on our website and updating the 
                  "Last updated" date. For significant changes, we may also send you an email notification. Your continued 
                  use of our services after the effective date of the updated policy constitutes acceptance of the changes.
                </p>
              </section>

              {/* Contact Information */}
              <section>
                <h2 className="text-2xl font-semibold text-gray-800 mb-4">11. Contact Us</h2>
                <p className="text-gray-700 leading-relaxed mb-4">
                  If you have any questions about this Privacy Policy or our data practices, please contact us:
                </p>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-gray-700"><strong>MOK Mzansi Books</strong></p>
                  <p className="text-gray-700">Email: <a href="mailto:admin@mokmzansibooks.com" className="text-blue-600 hover:text-blue-800">admin@mokmzansibooks.com</a></p>
                  <p className="text-gray-700">Phone: <a href="tel:+27645504029" className="text-blue-600 hover:text-blue-800">+27 64 550 4029</a></p>
                  <p className="text-gray-700">Address: 81 Monokane Street, Atterigeville x17, Pretoria, Gauteng 0006, South Africa</p>
                </div>
              </section>

              {/* GDPR/CCPA Specific Rights */}
              <section>
                <h2 className="text-2xl font-semibold text-gray-800 mb-4">12. Additional Rights for EU and California Residents</h2>
                
                <h3 className="text-xl font-medium text-gray-700 mb-3">12.1 GDPR Rights (EU Residents)</h3>
                <p className="text-gray-700 leading-relaxed mb-4">
                  If you are located in the European Union, you have additional rights under the GDPR, including the right 
                  to lodge a complaint with your local data protection authority.
                </p>

                <h3 className="text-xl font-medium text-gray-700 mb-3">12.2 CCPA Rights (California Residents)</h3>
                <p className="text-gray-700 leading-relaxed">
                  If you are a California resident, you have the right to know what personal information we collect, 
                  the right to delete personal information, and the right to opt-out of the sale of personal information. 
                  We do not sell personal information to third parties.
                </p>
              </section>

            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Privacy;
