'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { BrandLogo } from '@/components/brand-logo';
import { ArrowUpRight, Briefcase, Mail, MapPin, Phone, Plus, StickyNote, Users } from 'lucide-react';

const supabase = createClient();

interface Client {
  id: string;
  user_id: string;
  name: string;
  email: string | null;
  phone: string | null;
  address: string | null;
  notes: string | null;
  created_at: string;
}

export default function ContactsPage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState('');
  const [formSuccess, setFormSuccess] = useState('');

  const fetchClients = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('clients')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error loading clients:', error.message);
    } else {
      setClients(data || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchClients();
  }, []);

  const handleAddClient = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setFormError('');
    setFormSuccess('');

    try {
      const { data: { user } } = await supabase.auth.getUser();
      const { error } = await supabase.from('clients').insert([
        {
          user_id: user ? user.id : '00000000-0000-0000-0000-000000000000',
          name,
          email,
          phone,
          address,
          notes,
        },
      ]);

      if (error) {
        setFormError(error.message);
        return;
      }

      setName('');
      setEmail('');
      setPhone('');
      setAddress('');
      setNotes('');
      await fetchClients();
      setFormSuccess(`${name} was added to your clients.`);
    } catch {
      setFormError('We couldn’t add this client. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f7f6f1] text-[#20392e]">
      <div className="min-h-screen lg:grid lg:grid-cols-[260px_minmax(0,1fr)]">
        <aside className="hidden min-h-screen flex-col bg-[#20392e] px-7 py-8 text-white lg:flex">
          <BrandLogo href="/dashboard" light />
          <p className="mt-3 text-xs leading-5 text-white/55">
            A little more organized, every day.
          </p>

          <nav className="mt-14 space-y-2" aria-label="Main navigation">
            <Link
              href="/dashboard"
              className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-white/70 transition hover:bg-white/10 hover:text-white"
            >
              <Briefcase className="size-4" aria-hidden="true" />
              Dashboard
            </Link>
            <Link
              href="/contacts"
              className="flex items-center gap-3 rounded-xl bg-white/10 px-4 py-3 text-sm font-semibold text-white"
              aria-current="page"
            >
              <Users className="size-4 text-[#efad85]" aria-hidden="true" />
              Clients
            </Link>
          </nav>

          <div className="mt-auto border-t border-white/15 pt-6">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#efad85]">
              CraftDesk
            </p>
            <p className="mt-2 text-xs leading-5 text-white/55">
              Built for independent contractors and growing crews.
            </p>
          </div>
        </aside>

        <div className="min-w-0">
          <header className="flex items-center justify-between border-b border-[#e7e7dd] bg-[#fbfaf6] px-6 py-5 sm:px-10 lg:px-12">
            <div className="lg:hidden">
              <BrandLogo href="/dashboard" />
            </div>
            <div className="hidden lg:block">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#8a948a]">
                Your workspace
              </p>
              <p className="mt-1 text-sm font-medium text-[#30463a]">
                Clients, jobs, and follow-ups in one place
              </p>
            </div>
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 rounded-full border border-[#d9ded6] bg-white px-4 py-2 text-sm font-semibold text-[#41644e] transition hover:border-[#41644e]"
            >
              <Briefcase className="size-4" aria-hidden="true" />
              <span className="hidden sm:inline">Dashboard</span>
              <ArrowUpRight className="size-4" aria-hidden="true" />
            </Link>
          </header>

          <main className="mx-auto w-full max-w-7xl px-5 py-8 sm:px-10 sm:py-10 lg:px-12">
            <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#bd6845]">
                  Client directory
                </p>
                <h1 className="mt-3 text-3xl font-semibold tracking-[-0.05em] text-[#20392e] sm:text-4xl">
                  Good work starts with good people.
                </h1>
                <p className="mt-2 max-w-xl text-sm leading-6 text-[#68766c]">
                  Keep every client’s details close, so it’s easier to stay connected and keep work moving.
                </p>
              </div>
              <a
                href="#new-client"
                className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-[#bd6845] px-5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#a95737]"
              >
                <Plus className="size-4" aria-hidden="true" />
                Add a client
              </a>
            </div>

            <section className="mt-8 grid gap-4 sm:grid-cols-2" aria-label="Client summary">
              <article className="rounded-2xl border border-[#e5e6dd] bg-white p-5 shadow-[0_8px_30px_rgba(32,57,46,0.04)]">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-[#68766c]">Total clients</p>
                  <span className="grid size-10 place-items-center rounded-xl bg-[#edf2eb] text-[#41644e]">
                    <Users className="size-5" aria-hidden="true" />
                  </span>
                </div>
                <p className="mt-5 text-3xl font-semibold tracking-tight text-[#20392e]">
                  {loading ? '—' : clients.length}
                </p>
                <p className="mt-1 text-xs text-[#8a948a]">People in your directory</p>
              </article>
              <article className="rounded-2xl border border-[#e5e6dd] bg-white p-5 shadow-[0_8px_30px_rgba(32,57,46,0.04)]">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-[#68766c]">Stay connected</p>
                  <span className="grid size-10 place-items-center rounded-xl bg-[#fbefe8] text-[#bd6845]">
                    <Mail className="size-5" aria-hidden="true" />
                  </span>
                </div>
                <p className="mt-5 text-lg font-semibold tracking-tight text-[#20392e]">Every detail, together</p>
                <p className="mt-1 text-xs text-[#8a948a]">Contact information and notes in one place</p>
              </article>
            </section>

            <div className="mt-8 grid items-start gap-6 xl:grid-cols-[minmax(0,1.4fr)_minmax(320px,0.8fr)]">
              <section className="rounded-2xl border border-[#e5e6dd] bg-white p-5 shadow-[0_8px_30px_rgba(32,57,46,0.04)] sm:p-6" aria-labelledby="clients-heading">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h2 id="clients-heading" className="text-lg font-semibold tracking-tight text-[#20392e]">
                      Your clients
                    </h2>
                    <p className="mt-1 text-sm text-[#8a948a]">The people behind the work you do.</p>
                  </div>
                  <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-[#f7f6f1] text-[#41644e]">
                    <Users className="size-5" aria-hidden="true" />
                  </span>
                </div>

                {loading ? (
                  <p className="py-12 text-center text-sm text-[#8a948a]">Loading your clients…</p>
                ) : clients.length === 0 ? (
                  <div className="mt-6 rounded-xl border border-dashed border-[#d9ded6] bg-[#fbfaf6] px-5 py-10 text-center">
                    <span className="mx-auto grid size-11 place-items-center rounded-full bg-[#edf2eb] text-[#41644e]">
                      <Users className="size-5" aria-hidden="true" />
                    </span>
                    <h3 className="mt-4 text-sm font-semibold text-[#30463a]">Your directory is ready</h3>
                    <p className="mt-1 text-sm text-[#8a948a]">Add your first client to keep their details handy.</p>
                  </div>
                ) : (
                  <div className="mt-6 divide-y divide-[#eef0e9]">
                    {clients.map((client) => {
                      const initials = client.name
                        .trim()
                        .split(/\s+/)
                        .slice(0, 2)
                        .map((part) => part[0])
                        .join('')
                        .toUpperCase();

                      return (
                        <article key={client.id} className="flex gap-4 py-5 first:pt-0 last:pb-0">
                          <span className="grid size-11 shrink-0 place-items-center rounded-2xl bg-[#edf2eb] text-sm font-semibold text-[#41644e]" aria-hidden="true">
                            {initials}
                          </span>
                          <div className="min-w-0 flex-1">
                            <div className="flex flex-wrap items-center justify-between gap-2">
                              <h3 className="truncate font-semibold text-[#20392e]">{client.name}</h3>
                              <span className="rounded-full bg-[#f7f6f1] px-2.5 py-1 text-[11px] font-semibold text-[#68766c]">
                                Client
                              </span>
                            </div>
                            <div className="mt-2 flex flex-wrap gap-x-4 gap-y-2 text-sm text-[#68766c]">
                              {client.email && (
                                <span className="inline-flex min-w-0 items-center gap-1.5">
                                  <Mail className="size-3.5 shrink-0 text-[#8a948a]" aria-hidden="true" />
                                  <span className="truncate">{client.email}</span>
                                </span>
                              )}
                              {client.phone && (
                                <span className="inline-flex items-center gap-1.5">
                                  <Phone className="size-3.5 shrink-0 text-[#8a948a]" aria-hidden="true" />
                                  {client.phone}
                                </span>
                              )}
                              {!client.email && !client.phone && (
                                <span className="text-[#8a948a]">No contact details yet</span>
                              )}
                            </div>
                            {client.address && (
                              <p className="mt-2 inline-flex items-start gap-1.5 text-sm text-[#68766c]">
                                <MapPin className="mt-0.5 size-3.5 shrink-0 text-[#8a948a]" aria-hidden="true" />
                                {client.address}
                              </p>
                            )}
                            {client.notes && (
                              <p className="mt-2 inline-flex items-start gap-1.5 text-sm leading-5 text-[#68766c]">
                                <StickyNote className="mt-0.5 size-3.5 shrink-0 text-[#8a948a]" aria-hidden="true" />
                                {client.notes}
                              </p>
                            )}
                          </div>
                        </article>
                      );
                    })}
                  </div>
                )}
              </section>

              <section id="new-client" className="scroll-mt-6 rounded-2xl border border-[#e5e6dd] bg-white p-5 shadow-[0_8px_30px_rgba(32,57,46,0.04)] sm:p-6">
                <div className="mb-6">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#bd6845]">Quick entry</p>
                  <h2 className="mt-2 text-lg font-semibold tracking-tight text-[#20392e]">Add a client</h2>
                  <p className="mt-1 text-sm text-[#8a948a]">Save the details you need to stay in touch.</p>
                </div>

                <form onSubmit={handleAddClient} className="space-y-4">
                  <div className="grid gap-2">
                    <label htmlFor="client-name" className="text-sm font-medium text-[#30463a]">Client name</label>
                    <input
                      id="client-name"
                      type="text"
                      placeholder="Jordan Lee"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="h-11 w-full rounded-xl border border-[#d9ded6] bg-white px-3 text-sm text-[#20392e] outline-none transition placeholder:text-[#99a39a] focus:border-[#41644e] focus:ring-2 focus:ring-[#41644e]/15"
                    />
                  </div>
                  <div className="grid gap-2">
                    <label htmlFor="client-email" className="text-sm font-medium text-[#30463a]">Email <span className="font-normal text-[#99a39a]">(optional)</span></label>
                    <input
                      id="client-email"
                      type="email"
                      placeholder="jordan@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="h-11 w-full rounded-xl border border-[#d9ded6] bg-white px-3 text-sm text-[#20392e] outline-none transition placeholder:text-[#99a39a] focus:border-[#41644e] focus:ring-2 focus:ring-[#41644e]/15"
                    />
                  </div>
                  <div className="grid gap-2">
                    <label htmlFor="client-phone" className="text-sm font-medium text-[#30463a]">Phone <span className="font-normal text-[#99a39a]">(optional)</span></label>
                    <input
                      id="client-phone"
                      type="tel"
                      placeholder="(555) 555-0123"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="h-11 w-full rounded-xl border border-[#d9ded6] bg-white px-3 text-sm text-[#20392e] outline-none transition placeholder:text-[#99a39a] focus:border-[#41644e] focus:ring-2 focus:ring-[#41644e]/15"
                    />
                  </div>
                  <div className="grid gap-2">
                    <label htmlFor="client-address" className="text-sm font-medium text-[#30463a]">Address <span className="font-normal text-[#99a39a]">(optional)</span></label>
                    <input
                      id="client-address"
                      type="text"
                      placeholder="Street, city, state"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      className="h-11 w-full rounded-xl border border-[#d9ded6] bg-white px-3 text-sm text-[#20392e] outline-none transition placeholder:text-[#99a39a] focus:border-[#41644e] focus:ring-2 focus:ring-[#41644e]/15"
                    />
                  </div>
                  <div className="grid gap-2">
                    <label htmlFor="client-notes" className="text-sm font-medium text-[#30463a]">Notes <span className="font-normal text-[#99a39a]">(optional)</span></label>
                    <textarea
                      id="client-notes"
                      rows={3}
                      placeholder="Anything useful to remember"
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      className="w-full resize-y rounded-xl border border-[#d9ded6] bg-white px-3 py-2.5 text-sm text-[#20392e] outline-none transition placeholder:text-[#99a39a] focus:border-[#41644e] focus:ring-2 focus:ring-[#41644e]/15"
                    />
                  </div>
                  {formError && <p role="alert" className="text-sm text-red-700">{formError}</p>}
                  {formSuccess && <p role="status" className="text-sm text-[#41644e]">{formSuccess}</p>}
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-[#bd6845] px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-[#a95737] disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    <Plus className="size-4" aria-hidden="true" />
                    {isSubmitting ? 'Adding client…' : 'Add client'}
                  </button>
                </form>
              </section>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
