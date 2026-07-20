import { Link } from 'react-router-dom'
import Footer from '../../components/Footer'
import Section from '../../components/Section'

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-gray-950 text-white flex flex-col">
      {/* Back link */}
      <div className="px-4 py-4 sm:px-6">
        <Link to="/" className="inline-flex items-center gap-2 text-gray-400 hover:text-white text-sm transition">
          <span>←</span> Back to Home
        </Link>
      </div>

      {/* Content */}
      <div className="flex-1 px-4 pb-6 sm:px-6 sm:pb-10">
        <div className="max-w-3xl mx-auto">
          {/* Header */}
          <div className="mb-6 sm:mb-10">
            <h1 className="text-2xl sm:text-4xl font-bold mb-1 sm:mb-2">Privacy Policy</h1>
            <p className="text-gray-500 text-xs sm:text-sm">Last updated: March 2026</p>
          </div>

          {/* Content */}
          <div className="bg-gray-900/50 sm:bg-gray-900 border border-gray-800 rounded-xl p-4 sm:p-8 space-y-6 sm:space-y-8">
            <Section title="1. Information We Collect">
              When you create an account, we collect your name, email address and a hashed password.
              We also store the workout data you enter — sessions, routines and exercises.
              We do not collect any payment information or sensitive personal data.
            </Section>

            <Section title="2. How We Use Your Information">
              We use your data exclusively to provide the FitTrack service — authenticating your account
              and storing your training data so you can access it across devices. We do not sell,
              share or monetise your personal data in any way.
            </Section>

            <Section title="3. Data Storage">
              Your data is stored securely on servers hosted by Render.com. Passwords are never stored
              in plain text — they are hashed using bcrypt before being saved.
            </Section>

            <Section title="4. Cookies">
              FitTrack uses a JWT token stored in your browser's local storage to keep you logged in.
              We do not use tracking cookies or third-party analytics cookies.
            </Section>

            <Section title="5. Your Rights">
              You have the right to access, correct or delete your personal data at any time.
              To request deletion of your account and all associated data, contact us at{' '}
              <a href="mailto:manuprosperi04@gmail.com" className="text-blue-400 hover:underline">
                manuprosperi04@gmail.com
              </a>.
            </Section>

            <Section title="6. Changes to This Policy">
              We may update this policy from time to time. When we do, we will update the date at the
              top of this page. Continued use of FitTrack after changes means you accept the updated policy.
            </Section>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  )
}