import { PageContainer } from '@/components/layout/Layout';

export function PrivacyPage() {
  const sections = [
    {
      title: '1. Information We Collect',
      body: 'We collect information you provide when creating an account (name, email, phone number), booking services (address, preferred dates), and using the platform (usage data, device information). Providers additionally submit ID proof and skill details for verification.',
    },
    {
      title: '2. How We Use Your Information',
      body: 'We use your information to facilitate bookings, verify identities, process payments, send notifications, improve our services, and comply with legal obligations. We never sell your personal data to third parties.',
    },
    {
      title: '3. Data Sharing',
      body: 'We share limited information with your assigned service provider (name, address, phone) so they can fulfill your booking. We may share data with payment processors and legal authorities when required by law.',
    },
    {
      title: '4. Data Security',
      body: 'We employ industry-standard encryption, secure authentication, and regular security audits. Access to personal data is restricted to authorized personnel only. Despite our efforts, no method of transmission over the internet is 100% secure.',
    },
    {
      title: '5. Your Rights',
      body: 'You have the right to access, correct, or delete your personal data. You can update your profile anytime from your dashboard, or contact us to request data deletion. You may also opt out of promotional communications.',
    },
    {
      title: '6. Cookies',
      body: 'We use cookies and similar technologies to maintain your session, remember preferences, and analyze platform usage. You can control cookies through your browser settings.',
    },
    {
      title: '7. Children\'s Privacy',
      body: 'ServiceHub is not intended for users under 18. We do not knowingly collect data from minors. If you believe a child has provided us information, please contact us for removal.',
    },
    {
      title: '8. Changes to This Policy',
      body: 'We may update this Privacy Policy from time to time. We will notify you of significant changes via email or platform notification. Continued use after changes constitutes acceptance.',
    },
  ];

  return (
    <div>
      <section className="bg-hero-radial py-14">
        <PageContainer className="text-center">
          <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl">Privacy Policy</h1>
          <p className="mt-3 text-slate-300">Last updated: {new Date().toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
        </PageContainer>
      </section>

      <PageContainer className="max-w-3xl py-16">
        <div className="card p-8">
          <p className="text-slate-600">
            ServiceHub is committed to protecting your privacy. This policy explains how we collect, use, and
            safeguard your information when you use our platform.
          </p>
          <div className="mt-8 space-y-6">
            {sections.map((s) => (
              <div key={s.title}>
                <h2 className="text-lg font-bold text-brand-900">{s.title}</h2>
                <p className="mt-2 text-sm leading-relaxed text-slate-600">{s.body}</p>
              </div>
            ))}
          </div>
          <div className="mt-8 rounded-xl bg-brand-50 p-5 text-sm text-slate-600">
            Questions about this policy? Email us at <span className="font-semibold text-brand-700">support@servicehub.com</span>.
          </div>
        </div>
      </PageContainer>
    </div>
  );
}
