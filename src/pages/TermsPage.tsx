import { PageContainer } from '@/components/layout/Layout';

export function TermsPage() {
  const sections = [
    {
      title: '1. Acceptance of Terms',
      body: 'By accessing or using ServiceHub, you agree to be bound by these Terms & Conditions. If you do not agree, please do not use the platform. These terms apply to all users — customers, providers, and administrators.',
    },
    {
      title: '2. User Accounts',
      body: 'You must provide accurate information when creating an account and keep your credentials secure. You are responsible for all activity under your account. You must be at least 18 years old to use the platform.',
    },
    {
      title: '3. Service Bookings',
      body: 'Customers book services at displayed starting prices. Final pricing may vary based on scope and is confirmed by the provider. Bookings can be cancelled while pending or accepted. ServiceHub acts as a marketplace and is not directly responsible for the quality of services rendered.',
    },
    {
      title: '4. Provider Obligations',
      body: 'Providers must provide accurate profile information, maintain professional conduct, arrive on time, and deliver services as described. Providers agree to undergo verification and may be removed for misconduct, misrepresentation, or repeated poor reviews.',
    },
    {
      title: '5. Payments',
      body: 'Payments are processed after the service is completed. ServiceHub may charge a platform fee or commission on completed bookings. Fraudulent chargebacks or payment manipulation will result in account suspension.',
    },
    {
      title: '6. Reviews & Ratings',
      body: 'Users agree to provide honest reviews. Fake, defamatory, or retaliatory reviews are prohibited. ServiceHub reserves the right to remove reviews that violate these terms.',
    },
    {
      title: '7. Prohibited Conduct',
      body: 'Users must not misuse the platform, harass others, submit false information, attempt to bypass verification, or engage in fraudulent activity. Violations may result in immediate account termination and legal action.',
    },
    {
      title: '8. Limitation of Liability',
      body: 'ServiceHub is provided "as is" without warranties. We are not liable for indirect, incidental, or consequential damages arising from the use of the platform or services booked through it. Our liability is limited to the platform fees charged.',
    },
    {
      title: '9. Termination',
      body: 'We may suspend or terminate accounts that violate these terms. Users may close their accounts at any time by contacting support. Upon termination, your right to use the platform ceases immediately.',
    },
    {
      title: '10. Changes to Terms',
      body: 'We may update these Terms periodically. Continued use after changes are posted constitutes acceptance. We encourage you to review this page regularly.',
    },
  ];

  return (
    <div>
      <section className="bg-hero-radial py-14">
        <PageContainer className="text-center">
          <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl">Terms &amp; Conditions</h1>
          <p className="mt-3 text-slate-300">Last updated: {new Date().toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
        </PageContainer>
      </section>

      <PageContainer className="max-w-3xl py-16">
        <div className="card p-8">
          <p className="text-slate-600">
            Welcome to ServiceHub. These Terms &amp; Conditions govern your use of our platform. Please read
            them carefully before using our services.
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
            Questions about these terms? Email us at <span className="font-semibold text-brand-700">support@servicehub.com</span>.
          </div>
        </div>
      </PageContainer>
    </div>
  );
}
