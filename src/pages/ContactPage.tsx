import { useState } from 'react';
import { PageContainer } from '@/components/layout/Layout';
import { Button } from '@/components/ui/Button';
import { Input, Textarea } from '@/components/ui';
import { useToast } from '@/components/ui/Toast';
import { Mail, Phone, MapPin, Clock, Send, MessageSquare } from 'lucide-react';

export function ContactPage() {
  const toast = useToast();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name || !email || !message) {
      toast('Please fill all required fields.', 'error');
      return;
    }
    setLoading(true);
    // Simulate send — in a real app this would call an edge function
    await new Promise((r) => setTimeout(r, 800));
    setLoading(false);
    toast('Message sent! We will get back to you soon.', 'success');
    setName(''); setEmail(''); setSubject(''); setMessage('');
  }

  const contactInfo = [
    { icon: Mail, label: 'Email us', value: 'support@servicehub.com', href: 'mailto:support@servicehub.com' },
    { icon: Phone, label: 'Call us', value: '+91 98765 43210', href: 'tel:+919876543210' },
    { icon: MapPin, label: 'Visit us', value: '123 WorkStreet, Bengaluru, India' },
    { icon: Clock, label: 'Hours', value: 'Mon–Sat, 9 AM – 8 PM' },
  ];

  return (
    <div>
      <section className="bg-hero-radial py-16">
        <PageContainer className="text-center">
          <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl">Get in touch</h1>
          <p className="mx-auto mt-4 max-w-xl text-lg text-slate-200">
            Questions, feedback, or need help with a booking? We're here for you.
          </p>
        </PageContainer>
      </section>

      <PageContainer className="py-16">
        <div className="grid gap-10 lg:grid-cols-2">
          {/* Info */}
          <div>
            <h2 className="text-2xl font-extrabold text-brand-900">Contact information</h2>
            <p className="mt-2 text-slate-500">Reach out through any of these channels — we usually respond within 24 hours.</p>
            <div className="mt-8 space-y-4">
              {contactInfo.map((c) => (
                <div key={c.label} className="card flex items-center gap-4 p-5">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-brand-600 to-brand-900">
                    <c.icon className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-400">{c.label}</p>
                    {c.href ? (
                      <a href={c.href} className="font-bold text-brand-900 hover:text-brand-700">{c.value}</a>
                    ) : (
                      <p className="font-bold text-brand-900">{c.value}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Form */}
          <div className="card p-8">
            <div className="mb-6 flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-50">
                <MessageSquare className="h-5 w-5 text-brand-700" />
              </div>
              <h2 className="text-xl font-bold text-brand-900">Send a message</h2>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <Input label="Name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" required />
                <Input label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" required />
              </div>
              <Input label="Subject" value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="What's this about?" />
              <Textarea label="Message" rows={5} value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Tell us how we can help..." required />
              <Button type="submit" loading={loading} size="lg" className="w-full">
                <Send className="h-5 w-5" /> Send message
              </Button>
            </form>
          </div>
        </div>
      </PageContainer>
    </div>
  );
}
