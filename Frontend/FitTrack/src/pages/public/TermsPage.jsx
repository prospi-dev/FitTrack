import { Link } from 'react-router-dom'
import Footer from '../../components/Footer'

export default function TermsPage() {
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
            <h1 className="text-2xl sm:text-4xl font-bold mb-1 sm:mb-2">Terms of Use</h1>
            <p className="text-gray-500 text-xs sm:text-sm">Last updated: March 2026</p>
          </div>

          {/* Content */}
          <div className="bg-gray-900/50 sm:bg-gray-900 border border-gray-800 rounded-xl p-4 sm:p-8 space-y-6 sm:space-y-8">
            <Section title="1. Acceptance of Terms">
              By accessing or using FitTrack, you agree to be bound by these Terms of Use.
              If you do not agree to these terms, please do not use our service.
            </Section>

            <Section title="2. Description of Service">
              FitTrack is a fitness tracking application that allows you to log workout sessions,
              create training routines, and monitor your fitness progress. The service is provided
              "as is" and may be updated or modified at any time.
            </Section>

            <Section title="3. User Accounts">
              You are responsible for maintaining the confidentiality of your account credentials.
              You agree to provide accurate information when creating your account and to update
              your information as needed. You are responsible for all activities under your account.
            </Section>

            <Section title="4. Acceptable Use">
              You agree not to misuse the service or help anyone else do so. You may not attempt to
              access the service through unauthorized means, interfere with other users, or use the
              service for any illegal or harmful purposes.
            </Section>

            <Section title="5. Intellectual Property">
              FitTrack and its original content, features, and functionality are owned by FitTrack
              and are protected by international copyright, trademark, and other intellectual
              property laws.
            </Section>

            <Section title="6. Limitation of Liability">
              FitTrack is not responsible for any injuries or health issues that may result from
              following workout routines or exercises logged in the app. Always consult a healthcare
              professional before starting any fitness program.
            </Section>

            <Section title="7. Termination">
              We reserve the right to terminate or suspend your account at any time, without prior
              notice, for conduct that we believe violates these terms or is harmful to other users
              or the service.
            </Section>

            <Section title="8. Changes to Terms">
              We may revise these terms at any time. By continuing to use FitTrack after changes
              become effective, you agree to be bound by the revised terms.
            </Section>

            <Section title="9. Contact">
              Questions about these terms? Contact us at{' '}
              <a href="mailto:manuprosperi04@gmail.com" className="text-blue-400 hover:underline">
                manuprosperi04@gmail.com
              </a>.
            </Section>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  )
}

function Section({ title, children }) {
  return (
    <section>
      <h2 className="text-base sm:text-lg font-semibold mb-1 sm:mb-2 text-white">{title}</h2>
      <p className="text-gray-400 text-sm sm:text-base leading-relaxed">{children}</p>
    </section>
  )
}