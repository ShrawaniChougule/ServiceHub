import { useMemo } from 'react';
import { RouterProvider, useRouter } from '@/lib/router';
import { AuthProvider } from '@/lib/auth';
import { ToastProvider } from '@/components/ui/Toast';
import { Layout } from '@/components/layout/Layout';
import { ProtectedRoute } from '@/components/ProtectedRoute';

import { LandingPage } from '@/pages/LandingPage';
import { ServicesPage } from '@/pages/ServicesPage';
import { ServiceDetailPage } from '@/pages/ServiceDetailPage';
import { AboutPage } from '@/pages/AboutPage';
import { ContactPage } from '@/pages/ContactPage';
import { HowItWorksPage } from '@/pages/HowItWorksPage';
import { FaqPage } from '@/pages/FaqPage';
import { PrivacyPage } from '@/pages/PrivacyPage';
import { TermsPage } from '@/pages/TermsPage';

import { LoginPage } from '@/pages/auth/LoginPage';
import { SignupPage } from '@/pages/auth/SignupPage';
import { ForgotPasswordPage } from '@/pages/auth/ForgotPasswordPage';

import { CustomerDashboard } from '@/pages/customer/CustomerDashboard';
import { CustomerBookings } from '@/pages/customer/CustomerBookings';
import { CustomerProfile } from '@/pages/customer/CustomerProfile';

import { ProviderDashboard } from '@/pages/provider/ProviderDashboard';
import { ProviderBookings } from '@/pages/provider/ProviderBookings';
import { ProviderEarnings } from '@/pages/provider/ProviderEarnings';
import { ProviderReviews } from '@/pages/provider/ProviderReviews';
import { ProviderProfile } from '@/pages/provider/ProviderProfile';

import { AdminDashboard } from '@/pages/admin/AdminDashboard';
import { AdminCustomers } from '@/pages/admin/AdminCustomers';
import { AdminProviders } from '@/pages/admin/AdminProviders';
import { AdminBookings } from '@/pages/admin/AdminBookings';
import { AdminServices } from '@/pages/admin/AdminServices';

function parseRoute(path: string): { page: string; param?: string } {
  const clean = path.split('?')[0].replace(/^\//, '');
  const parts = clean.split('/').filter(Boolean);
  if (parts.length === 0) return { page: 'home' };
  if (parts.length === 1) return { page: parts[0] };
  // For multi-segment paths like /services/UUID or /customer/bookings,
  // page is the first segment and param is the rest.
  return { page: parts[0], param: parts.slice(1).join('/') };
}

function Routes() {
  const { path } = useRouter();
  const { page, param } = useMemo(() => parseRoute(path), [path]);

  // Public pages (with layout)
  const publicPages: Record<string, React.ReactNode> = {
    home: <LandingPage />,
    services: <ServicesPage />,
    about: <AboutPage />,
    contact: <ContactPage />,
    'how-it-works': <HowItWorksPage />,
    faq: <FaqPage />,
    privacy: <PrivacyPage />,
    terms: <TermsPage />,
  };

  // Auth pages (no layout footer/header wrapper needed beyond minimal)
  if (page === 'login') return <LoginPage />;
  if (page === 'signup') return <SignupPage />;
  if (page === 'forgot-password') return <ForgotPasswordPage />;

  // Service detail
  if (page === 'services' && param) {
    return <Layout><ServiceDetailPage id={param} /></Layout>;
  }

  // Customer
  if (page === 'customer') {
    const el =
      param === 'bookings' ? <CustomerBookings /> :
      param === 'profile' ? <CustomerProfile /> :
      <CustomerDashboard />;
    return (
      <Layout>
        <ProtectedRoute role="customer">{el}</ProtectedRoute>
      </Layout>
    );
  }

  // Provider
  if (page === 'provider') {
    const el =
      param === 'bookings' ? <ProviderBookings /> :
      param === 'earnings' ? <ProviderEarnings /> :
      param === 'reviews' ? <ProviderReviews /> :
      param === 'profile' ? <ProviderProfile /> :
      <ProviderDashboard />;
    return (
      <Layout>
        <ProtectedRoute role="provider">{el}</ProtectedRoute>
      </Layout>
    );
  }

  // Admin
  if (page === 'admin') {
    const el =
      param === 'customers' ? <AdminCustomers /> :
      param === 'providers' ? <AdminProviders /> :
      param === 'bookings' ? <AdminBookings /> :
      param === 'services' ? <AdminServices /> :
      <AdminDashboard />;
    return (
      <Layout>
        <ProtectedRoute role="admin">{el}</ProtectedRoute>
      </Layout>
    );
  }

  // Default: public with layout
  const content = publicPages[page];
  if (content) return <Layout>{content}</Layout>;

  // 404
  return (
    <Layout>
      <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 text-center">
        <p className="text-6xl font-extrabold text-brand-900">404</p>
        <p className="mt-4 text-lg text-slate-500">Page not found</p>
        <a href="#/" className="btn-primary mt-6">Back home</a>
      </div>
    </Layout>
  );
}

export default function App() {
  return (
    <RouterProvider>
      <AuthProvider>
        <ToastProvider>
          <Routes />
        </ToastProvider>
      </AuthProvider>
    </RouterProvider>
  );
}
