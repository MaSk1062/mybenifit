
import { Link } from 'react-router-dom';
import NavBar from '../nav/nav';

const Privacy = () => {
  return (
    <div className="min-h-screen flex flex-col bg-white">
      <NavBar />
      <div className="flex-1 container mx-auto px-4 py-8 max-w-4xl">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
          <h1 className="text-4xl font-extrabold text-black mb-8">Privacy Policy</h1>
          
          <div className="prose prose-lg max-w-none text-gray-700 space-y-6">
            <p className="text-sm text-gray-600 mb-8">
              <strong>Last updated:</strong> {new Date().toLocaleDateString()}
            </p>

            <section>
              <h2 className="text-2xl font-semibold text-black mb-4">1. Introduction</h2>
              <p>
                Welcome to MyBenYfit. We respect your privacy and are committed to protecting your personal data. 
                This privacy policy explains how we collect, use, and safeguard your information when you use our 
                fitness tracking application.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-black mb-4">2. Information We Collect</h2>
              <h3 className="text-xl font-medium text-black mb-2">2.1 Personal Information</h3>
              <ul className="list-disc pl-6 space-y-2">
                <li>Name and email address (for account creation)</li>
                <li>Profile information (age, weight, height, fitness goals)</li>
                <li>Fitness activity data (workouts, steps, calories burned)</li>
                <li>Device information and usage statistics</li>
              </ul>

              <h3 className="text-xl font-medium text-black mb-2 mt-4">2.2 Automatically Collected Information</h3>
              <ul className="list-disc pl-6 space-y-2">
                <li>Device type and operating system</li>
                <li>App usage patterns and preferences</li>
                <li>IP address and location data (with your consent)</li>
                <li>Crash reports and performance data</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-black mb-4">3. How We Use Your Information</h2>
              <p>We use your information to:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Provide and maintain our fitness tracking services</li>
                <li>Personalize your experience and recommendations</li>
                <li>Track your progress and provide insights</li>
                <li>Send you notifications and updates (with your consent)</li>
                <li>Improve our app and develop new features</li>
                <li>Ensure security and prevent fraud</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-black mb-4">4. Data Sharing and Disclosure</h2>
              <p>We do not sell, trade, or rent your personal information to third parties. We may share your data only in the following circumstances:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>With your explicit consent</li>
                <li>To comply with legal obligations</li>
                <li>To protect our rights and safety</li>
                <li>With service providers who assist in app operations (under strict confidentiality agreements)</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-black mb-4">5. Data Security</h2>
              <p>
                We implement appropriate technical and organizational measures to protect your personal data against 
                unauthorized access, alteration, disclosure, or destruction. This includes encryption, secure servers, 
                and regular security assessments.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-black mb-4">6. Your Rights</h2>
              <p>You have the right to:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Access your personal data</li>
                <li>Correct inaccurate information</li>
                <li>Request deletion of your data</li>
                <li>Withdraw consent for data processing</li>
                <li>Export your data in a portable format</li>
                <li>Opt-out of marketing communications</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-black mb-4">7. Data Retention</h2>
              <p>
                We retain your personal data only as long as necessary to provide our services and fulfill the 
                purposes outlined in this policy. You can request deletion of your account and associated data 
                at any time through the app settings.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-black mb-4">8. Children's Privacy</h2>
              <p>
                Our app is not intended for children under 13 years of age. We do not knowingly collect personal 
                information from children under 13. If you believe we have collected such information, please 
                contact us immediately.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-black mb-4">9. International Data Transfers</h2>
              <p>
                Your data may be transferred to and processed in countries other than your own. We ensure that 
                such transfers comply with applicable data protection laws and implement appropriate safeguards.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-black mb-4">10. Changes to This Policy</h2>
              <p>
                We may update this privacy policy from time to time. We will notify you of any material changes 
                through the app or via email. Your continued use of the app after such changes constitutes 
                acceptance of the updated policy.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-black mb-4">11. Contact Us</h2>
              <p>
                If you have any questions about this privacy policy or our data practices, please contact us at:
              </p>
              <div className="bg-gray-50 p-4 rounded-md mt-4">
                <p className="font-medium">MyBenYfit Support</p>
                <p>Email: privacy@mybenyfit.com</p>
                <p>Address: [Your Business Address]</p>
              </div>
            </section>
          </div>

          <div className="mt-8 pt-6 border-t border-gray-200">
            <Link 
              to="/terms" 
              className="text-blue-600 hover:text-blue-800 underline mr-4"
            >
              Terms of Service
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

export default Privacy; 