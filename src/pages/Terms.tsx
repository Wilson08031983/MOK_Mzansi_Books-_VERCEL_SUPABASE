
import React from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

const Terms = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-lg shadow-lg p-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-6">Terms of Service</h1>
            <p className="text-sm text-gray-600 mb-8"><strong>Last Updated:</strong> August 2025</p>

            <div className="prose prose-lg max-w-none space-y-8">
              
              {/* Acceptance of Terms */}
              <section>
                <h2 className="text-2xl font-semibold text-gray-800 mb-4">1. Acceptance of Terms</h2>
                <p className="text-gray-700 leading-relaxed mb-4">
                  By accessing or using the MOK Mzansi Books website and services ("Service"), you agree to be bound by these Terms of Service ("Terms"). 
                  If you disagree with any part of these terms, then you may not access the Service.
                </p>
                <p className="text-gray-700 leading-relaxed">
                  If you are entering into these Terms on behalf of a company or other legal entity, you represent that you have the authority 
                  to bind such entity to these Terms, in which case "you" or "your" refers to such entity.
                </p>
              </section>

              {/* Description of Service */}
              <section>
                <h2 className="text-2xl font-semibold text-gray-800 mb-4">2. Description of Service</h2>
                <p className="text-gray-700 leading-relaxed mb-4">
                  MOK Mzansi Books provides cloud-based accounting and business management software that includes:
                </p>
                <ul className="list-disc list-inside text-gray-700 space-y-2">
                  <li>Invoicing and billing management</li>
                  <li>Quotation creation and tracking</li>
                  <li>Client and customer relationship management</li>
                  <li>Financial reporting and analytics</li>
                  <li>Expense tracking and management</li>
                  <li>Document storage and organization</li>
                  <li>Inventory management</li>
                  <li>Email template management</li>
                </ul>
              </section>

              {/* Account Registration and Termination */}
              <section>
                <h2 className="text-2xl font-semibold text-gray-800 mb-4">3. Account Registration and Termination</h2>
                
                <h3 className="text-xl font-medium text-gray-700 mb-3">3.1 Account Creation</h3>
                <p className="text-gray-700 leading-relaxed mb-4">
                  To access the Service, you must create an account by providing accurate, current, and complete information. 
                  You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account.
                </p>

                <h3 className="text-xl font-medium text-gray-700 mb-3">3.2 Age Requirements</h3>
                <p className="text-gray-700 leading-relaxed mb-4">
                  You must be at least 18 years old to use the Service. By using the Service, you represent and warrant that you meet this requirement.
                </p>

                <h3 className="text-xl font-medium text-gray-700 mb-3">3.3 Account Security</h3>
                <p className="text-gray-700 leading-relaxed mb-4">
                  You are responsible for safeguarding your account credentials and must notify us immediately of any unauthorized use of your account 
                  or any other security breach. We will not be liable for any losses arising from unauthorized use of your account.
                </p>

                <h3 className="text-xl font-medium text-gray-700 mb-3">3.4 Account Termination</h3>
                <p className="text-gray-700 leading-relaxed mb-4">
                  You may terminate your account at any time by contacting us. We may terminate or suspend your account immediately, without prior notice, 
                  for any reason, including if you breach these Terms. Upon termination, your right to use the Service will cease immediately.
                </p>

                <h3 className="text-xl font-medium text-gray-700 mb-3">3.5 Data Upon Termination</h3>
                <p className="text-gray-700 leading-relaxed">
                  Upon account termination, we will provide you with a reasonable opportunity to retrieve your data. After 30 days, 
                  we may delete your data from our systems, except as required by law.
                </p>
              </section>

              {/* Acceptable Use Guidelines */}
              <section>
                <h2 className="text-2xl font-semibold text-gray-800 mb-4">4. Acceptable Use Guidelines</h2>
                
                <h3 className="text-xl font-medium text-gray-700 mb-3">4.1 Permitted Use</h3>
                <p className="text-gray-700 leading-relaxed mb-4">
                  You may use the Service only for lawful purposes and in accordance with these Terms. You agree to use the Service 
                  in a manner consistent with applicable laws and regulations.
                </p>

                <h3 className="text-xl font-medium text-gray-700 mb-3">4.2 Prohibited Activities</h3>
                <p className="text-gray-700 leading-relaxed mb-4">
                  You agree not to engage in any of the following prohibited activities:
                </p>
                <ul className="list-disc list-inside text-gray-700 space-y-2">
                  <li>Using the Service for any illegal or unauthorized purpose</li>
                  <li>Violating any applicable laws or regulations</li>
                  <li>Infringing upon the rights of others, including intellectual property rights</li>
                  <li>Transmitting any harmful, threatening, abusive, or defamatory content</li>
                  <li>Attempting to gain unauthorized access to our systems or other users' accounts</li>
                  <li>Interfering with or disrupting the Service or servers</li>
                  <li>Using automated systems to access the Service without permission</li>
                  <li>Reverse engineering, decompiling, or disassembling the Service</li>
                  <li>Removing or altering any proprietary notices or labels</li>
                  <li>Using the Service to compete with us or develop competing products</li>
                </ul>
              </section>

              {/* Intellectual Property Rights */}
              <section>
                <h2 className="text-2xl font-semibold text-gray-800 mb-4">5. Intellectual Property Rights</h2>
                
                <h3 className="text-xl font-medium text-gray-700 mb-3">5.1 Our Intellectual Property</h3>
                <p className="text-gray-700 leading-relaxed mb-4">
                  The Service and its original content, features, and functionality are and will remain the exclusive property of 
                  MOK Mzansi Books and its licensors. The Service is protected by copyright, trademark, and other laws.
                </p>

                <h3 className="text-xl font-medium text-gray-700 mb-3">5.2 Your Content</h3>
                <p className="text-gray-700 leading-relaxed mb-4">
                  You retain ownership of any content you submit, post, or display through the Service ("Your Content"). 
                  By submitting Your Content, you grant us a worldwide, non-exclusive, royalty-free license to use, reproduce, 
                  modify, and distribute Your Content solely for the purpose of providing the Service.
                </p>

                <h3 className="text-xl font-medium text-gray-700 mb-3">5.3 Feedback</h3>
                <p className="text-gray-700 leading-relaxed mb-4">
                  Any feedback, comments, or suggestions you provide regarding the Service may be used by us without restriction 
                  or compensation to you.
                </p>

                <h3 className="text-xl font-medium text-gray-700 mb-3">5.4 Trademark Policy</h3>
                <p className="text-gray-700 leading-relaxed">
                  "MOK Mzansi Books" and related logos are trademarks of our company. You may not use these trademarks without 
                  our prior written consent.
                </p>
              </section>

              {/* Payment Terms */}
              <section>
                <h2 className="text-2xl font-semibold text-gray-800 mb-4">6. Payment Terms</h2>
                
                <h3 className="text-xl font-medium text-gray-700 mb-3">6.1 Subscription Fees</h3>
                <p className="text-gray-700 leading-relaxed mb-4">
                  Access to certain features of the Service may require payment of subscription fees. All fees are non-refundable 
                  unless otherwise stated or required by law.
                </p>

                <h3 className="text-xl font-medium text-gray-700 mb-3">6.2 Billing</h3>
                <p className="text-gray-700 leading-relaxed mb-4">
                  Subscription fees will be billed in advance on a recurring basis (monthly or annually, as selected). 
                  You authorize us to charge your payment method for all fees.
                </p>

                <h3 className="text-xl font-medium text-gray-700 mb-3">6.3 Price Changes</h3>
                <p className="text-gray-700 leading-relaxed mb-4">
                  We reserve the right to modify our pricing at any time. We will provide reasonable notice of any price changes 
                  and give you the opportunity to cancel your subscription before the changes take effect.
                </p>

                <h3 className="text-xl font-medium text-gray-700 mb-3">6.4 Late Payments</h3>
                <p className="text-gray-700 leading-relaxed">
                  If payment is not received by the due date, we may suspend or terminate your access to the Service. 
                  You remain responsible for all outstanding fees.
                </p>
              </section>

              {/* Disclaimers and Limitations */}
              <section>
                <h2 className="text-2xl font-semibold text-gray-800 mb-4">7. Disclaimers and Limitations of Liability</h2>
                
                <h3 className="text-xl font-medium text-gray-700 mb-3">7.1 Service Availability</h3>
                <p className="text-gray-700 leading-relaxed mb-4">
                  The Service is provided "as is" and "as available" without warranties of any kind. We do not guarantee that 
                  the Service will be uninterrupted, error-free, or completely secure.
                </p>

                <h3 className="text-xl font-medium text-gray-700 mb-3">7.2 Disclaimer of Warranties</h3>
                <p className="text-gray-700 leading-relaxed mb-4">
                  To the fullest extent permitted by law, we disclaim all warranties, express or implied, including but not limited to 
                  warranties of merchantability, fitness for a particular purpose, and non-infringement.
                </p>

                <h3 className="text-xl font-medium text-gray-700 mb-3">7.3 Limitation of Liability</h3>
                <p className="text-gray-700 leading-relaxed mb-4">
                  In no event shall MOK Mzansi Books be liable for any indirect, incidental, special, consequential, or punitive damages, 
                  including but not limited to loss of profits, data, or business interruption, arising from your use of the Service.
                </p>

                <h3 className="text-xl font-medium text-gray-700 mb-3">7.4 Maximum Liability</h3>
                <p className="text-gray-700 leading-relaxed">
                  Our total liability to you for all claims arising from or relating to the Service shall not exceed the amount 
                  you paid us in the twelve (12) months preceding the claim.
                </p>
              </section>

              {/* Data Protection and Privacy */}
              <section>
                <h2 className="text-2xl font-semibold text-gray-800 mb-4">8. Data Protection and Privacy</h2>
                <p className="text-gray-700 leading-relaxed mb-4">
                  Your privacy is important to us. Our collection and use of personal information is governed by our Privacy Policy, 
                  which is incorporated into these Terms by reference.
                </p>
                <p className="text-gray-700 leading-relaxed">
                  You are responsible for ensuring that any personal data you process through the Service complies with applicable 
                  data protection laws, including GDPR and CCPA where applicable.
                </p>
              </section>

              {/* Service Modifications */}
              <section>
                <h2 className="text-2xl font-semibold text-gray-800 mb-4">9. Service Modifications and Termination</h2>
                
                <h3 className="text-xl font-medium text-gray-700 mb-3">9.1 Service Changes</h3>
                <p className="text-gray-700 leading-relaxed mb-4">
                  We reserve the right to modify, suspend, or discontinue the Service (or any part thereof) at any time, 
                  with or without notice. We will not be liable for any modification, suspension, or discontinuation of the Service.
                </p>

                <h3 className="text-xl font-medium text-gray-700 mb-3">9.2 Maintenance</h3>
                <p className="text-gray-700 leading-relaxed mb-4">
                  We may perform maintenance on the Service that may result in temporary interruptions. We will attempt to provide 
                  reasonable notice of scheduled maintenance when possible.
                </p>

                <h3 className="text-xl font-medium text-gray-700 mb-3">9.3 Service Termination</h3>
                <p className="text-gray-700 leading-relaxed">
                  We may terminate the Service entirely with reasonable notice to users. In such cases, we will provide information 
                  about data export options where technically feasible.
                </p>
              </section>

              {/* User Responsibilities */}
              <section>
                <h2 className="text-2xl font-semibold text-gray-800 mb-4">10. User Responsibilities and Obligations</h2>
                <p className="text-gray-700 leading-relaxed mb-4">
                  As a user of the Service, you agree to:
                </p>
                <ul className="list-disc list-inside text-gray-700 space-y-2">
                  <li>Provide accurate and up-to-date information</li>
                  <li>Maintain the security of your account credentials</li>
                  <li>Use the Service in compliance with all applicable laws</li>
                  <li>Respect the intellectual property rights of others</li>
                  <li>Not interfere with the proper functioning of the Service</li>
                  <li>Report any security vulnerabilities or bugs you discover</li>
                  <li>Backup your important data regularly</li>
                  <li>Pay all applicable fees in a timely manner</li>
                </ul>
              </section>

              {/* Governing Law and Dispute Resolution */}
              <section>
                <h2 className="text-2xl font-semibold text-gray-800 mb-4">11. Governing Law and Dispute Resolution</h2>
                
                <h3 className="text-xl font-medium text-gray-700 mb-3">11.1 Governing Law</h3>
                <p className="text-gray-700 leading-relaxed mb-4">
                  These Terms shall be governed by and construed in accordance with the laws of South Africa, 
                  without regard to its conflict of law provisions.
                </p>

                <h3 className="text-xl font-medium text-gray-700 mb-3">11.2 Jurisdiction</h3>
                <p className="text-gray-700 leading-relaxed mb-4">
                  Any disputes arising from or relating to these Terms or the Service shall be subject to the exclusive 
                  jurisdiction of the courts of South Africa.
                </p>

                <h3 className="text-xl font-medium text-gray-700 mb-3">11.3 Dispute Resolution</h3>
                <p className="text-gray-700 leading-relaxed mb-4">
                  Before initiating any legal proceedings, you agree to first attempt to resolve any dispute through good faith 
                  negotiations by contacting us directly.
                </p>

                <h3 className="text-xl font-medium text-gray-700 mb-3">11.4 Class Action Waiver</h3>
                <p className="text-gray-700 leading-relaxed">
                  You agree that any dispute resolution proceedings will be conducted only on an individual basis and not in a 
                  class, consolidated, or representative action.
                </p>
              </section>

              {/* Indemnification */}
              <section>
                <h2 className="text-2xl font-semibold text-gray-800 mb-4">12. Indemnification</h2>
                <p className="text-gray-700 leading-relaxed">
                  You agree to indemnify, defend, and hold harmless MOK Mzansi Books and its officers, directors, employees, 
                  and agents from and against any claims, damages, losses, costs, and expenses (including reasonable attorneys' fees) 
                  arising from or relating to your use of the Service, your violation of these Terms, or your violation of any 
                  rights of another party.
                </p>
              </section>

              {/* Force Majeure */}
              <section>
                <h2 className="text-2xl font-semibold text-gray-800 mb-4">13. Force Majeure</h2>
                <p className="text-gray-700 leading-relaxed">
                  We shall not be liable for any failure or delay in performance under these Terms due to circumstances beyond 
                  our reasonable control, including but not limited to acts of God, natural disasters, war, terrorism, 
                  government actions, or internet service provider failures.
                </p>
              </section>

              {/* Severability */}
              <section>
                <h2 className="text-2xl font-semibold text-gray-800 mb-4">14. Severability</h2>
                <p className="text-gray-700 leading-relaxed">
                  If any provision of these Terms is found to be unenforceable or invalid, that provision will be limited or 
                  eliminated to the minimum extent necessary so that these Terms will otherwise remain in full force and effect.
                </p>
              </section>

              {/* Entire Agreement */}
              <section>
                <h2 className="text-2xl font-semibold text-gray-800 mb-4">15. Entire Agreement</h2>
                <p className="text-gray-700 leading-relaxed">
                  These Terms, together with our Privacy Policy, constitute the entire agreement between you and MOK Mzansi Books 
                  regarding the Service and supersede all prior agreements and understandings.
                </p>
              </section>

              {/* Changes to Terms */}
              <section>
                <h2 className="text-2xl font-semibold text-gray-800 mb-4">16. Changes to Terms</h2>
                <p className="text-gray-700 leading-relaxed">
                  We reserve the right to modify these Terms at any time. We will notify you of any material changes by posting 
                  the updated Terms on our website and updating the "Last Updated" date. Your continued use of the Service after 
                  such changes constitutes acceptance of the new Terms.
                </p>
              </section>

              {/* Contact Information */}
              <section>
                <h2 className="text-2xl font-semibold text-gray-800 mb-4">17. Contact Information</h2>
                <p className="text-gray-700 leading-relaxed mb-4">
                  If you have any questions about these Terms, please contact us:
                </p>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-gray-700"><strong>MOK Mzansi Books</strong></p>
                  <p className="text-gray-700">Email: <a href="mailto:admin@mokmzansibooks.com" className="text-blue-600 hover:text-blue-800">admin@mokmzansibooks.com</a></p>
                  <p className="text-gray-700">Phone: <a href="tel:+27645504029" className="text-blue-600 hover:text-blue-800">+27 64 550 4029</a></p>
                  <p className="text-gray-700">Address: 81 Monokane Street, Atterigeville x17, Pretoria, Gauteng 0006, South Africa</p>
                </div>
              </section>

            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Terms;
