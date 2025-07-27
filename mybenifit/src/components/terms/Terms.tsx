
import { Link } from 'react-router-dom';
import NavBar from '../nav/nav';

const Terms = () => {
  return (
    <div className="min-h-screen flex flex-col bg-white">
      <NavBar />
      <div className="flex-1 container mx-auto px-4 py-8 max-w-4xl">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
          <h1 className="text-4xl font-extrabold text-black mb-8">Terms of Service</h1>
          
          <div className="prose prose-lg max-w-none text-gray-700 space-y-6">
            <p className="text-sm text-gray-600 mb-8">
              <strong>Last updated:</strong> {new Date().toLocaleDateString()}
            </p>

            <section>
              <h2 className="text-2xl font-semibold text-black mb-4">1. Acceptance of Terms</h2>
              <p>
                By accessing and using MyBenYfit, you accept and agree to be bound by the terms and provision of this agreement. 
                If you do not agree to abide by the above, please do not use this service.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-black mb-4">2. Description of Service</h2>
              <p>
                MyBenYfit is a fitness tracking application that allows users to monitor their physical activities, 
                set fitness goals, track progress, and receive personalized recommendations. The service includes:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Activity tracking and monitoring</li>
                <li>Goal setting and progress tracking</li>
                <li>Personalized fitness recommendations</li>
                <li>Data visualization and analytics</li>
                <li>Social features and community support</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-black mb-4">3. User Accounts</h2>
              <h3 className="text-xl font-medium text-black mb-2">3.1 Account Creation</h3>
              <p>
                To use certain features of the service, you must create an account. You agree to provide accurate, 
                current, and complete information during registration and to update such information to keep it 
                accurate, current, and complete.
              </p>

              <h3 className="text-xl font-medium text-black mb-2 mt-4">3.2 Account Security</h3>
              <p>
                You are responsible for safeguarding the password and for all activities that occur under your account. 
                You agree to notify us immediately of any unauthorized use of your account.
              </p>

              <h3 className="text-xl font-medium text-black mb-2 mt-4">3.3 Account Termination</h3>
              <p>
                We reserve the right to terminate or suspend your account at any time for violations of these terms 
                or for any other reason at our sole discretion.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-black mb-4">4. Acceptable Use</h2>
              <p>You agree not to use the service to:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Violate any applicable laws or regulations</li>
                <li>Infringe upon the rights of others</li>
                <li>Upload or transmit harmful, offensive, or inappropriate content</li>
                <li>Attempt to gain unauthorized access to our systems</li>
                <li>Interfere with the proper functioning of the service</li>
                <li>Use the service for commercial purposes without authorization</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-black mb-4">5. Health and Safety Disclaimer</h2>
              <p>
                <strong>Important:</strong> MyBenYfit is not a substitute for professional medical advice, diagnosis, 
                or treatment. Always seek the advice of your physician or other qualified health provider with any 
                questions you may have regarding a medical condition.
              </p>
              <p className="mt-4">
                The fitness recommendations and data provided by the app are for informational purposes only and 
                should not be considered as medical advice. You are responsible for your own health and safety 
                when engaging in physical activities.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-black mb-4">6. Intellectual Property</h2>
              <p>
                The service and its original content, features, and functionality are owned by MyBenYfit and are 
                protected by international copyright, trademark, patent, trade secret, and other intellectual 
                property laws.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-black mb-4">7. User Content</h2>
              <p>
                You retain ownership of any content you submit to the service. By submitting content, you grant 
                us a worldwide, non-exclusive, royalty-free license to use, reproduce, modify, and distribute 
                such content in connection with the service.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-black mb-4">8. Privacy</h2>
              <p>
                Your privacy is important to us. Please review our Privacy Policy, which also governs your use 
                of the service, to understand our practices regarding the collection and use of your information.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-black mb-4">9. Service Availability</h2>
              <p>
                We strive to provide a reliable service but cannot guarantee that the service will be available 
                at all times. We may modify, suspend, or discontinue the service at any time without notice.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-black mb-4">10. Limitation of Liability</h2>
              <p>
                To the maximum extent permitted by law, MyBenYfit shall not be liable for any indirect, incidental, 
                special, consequential, or punitive damages, including without limitation, loss of profits, data, 
                use, goodwill, or other intangible losses, resulting from your use of the service.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-black mb-4">11. Indemnification</h2>
              <p>
                You agree to defend, indemnify, and hold harmless MyBenYfit and its officers, directors, employees, 
                and agents from and against any claims, damages, obligations, losses, liabilities, costs, or debt, 
                and expenses arising from your use of the service.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-black mb-4">12. Governing Law</h2>
              <p>
                These terms shall be governed by and construed in accordance with the laws of [Your Jurisdiction], 
                without regard to its conflict of law provisions.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-black mb-4">13. Changes to Terms</h2>
              <p>
                We reserve the right to modify these terms at any time. We will notify users of any material 
                changes by posting the new terms on this page. Your continued use of the service after such 
                changes constitutes acceptance of the new terms.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-black mb-4">14. Contact Information</h2>
              <p>
                If you have any questions about these Terms of Service, please contact us at:
              </p>
              <div className="bg-gray-50 p-4 rounded-md mt-4">
                <p className="font-medium">MyBenYfit Support</p>
                <p>Email: legal@mybenyfit.com</p>
                <p>Address: [Your Business Address]</p>
              </div>
            </section>
          </div>

          <div className="mt-8 pt-6 border-t border-gray-200">
            <Link 
              to="/privacy" 
              className="text-blue-600 hover:text-blue-800 underline mr-4"
            >
              Privacy Policy
            </Link>
            <Link 
              to="/settings" 
              className="text-blue-600 hover:text-blue-800 underline"
            >
              Back to Settings
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Terms; 