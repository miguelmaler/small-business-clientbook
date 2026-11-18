'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import Link from 'next/link';
import { BrandLogo } from '@/components/brand-logo';
import {
  ArrowUpRight,
  Briefcase,
  CalendarDays,
  Check,
  CircleDollarSign,
  Plus,
  Users,
} from 'lucide-react';

const supabase = createClient();

interface Job {
  id: string;
  user_id: string;
  client_id: string;
  title: string;
  description: string | null;
  status: string;
  amount: number;
  billed: boolean;
  paid: boolean;
  created_at: string;
}

interface ClientOption {
  id: string;
  name: string;
}

export default function DashboardPage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [clients, setClients] = useState<ClientOption[]>([]);
  const [loading, setLoading] = useState(true);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [clientId, setClientId] = useState('');

  const loadDashboardData = async () => {
    setLoading(true);
    const [jobsRes, clientsRes] = await Promise.all([
      supabase.from('jobs').select('*').order('created_at', { ascending: false }),
      supabase.from('clients').select('id, name'),
    ]);

    if (jobsRes.data) setJobs(jobsRes.data);
    if (clientsRes.data) setClients(clientsRes.data);
    setLoading(false);
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  const handleCreateJob = async (e: React.FormEvent) => {
    e.preventDefault();
    const { data: { user } } = await supabase.auth.getUser();

    const { error } = await supabase.from('jobs').insert([
      {
        user_id: user ? user.id : '00000000-0000-0000-0000-000000000000',
        client_id: clientId,
        title,
        description,
        status: 'pending',
        amount: parseFloat(amount) || 0,
        billed: false,
        paid: false,
      },
    ]);

    if (error) {
      alert('Error creating job: ' + error.message);
    } else {
      setTitle('');
      setDescription('');
      setAmount('');
      loadDashboardData();
    }
  };

  const toggleJobPaid = async (job: Job) => {
    const { error } = await supabase
      .from('jobs')
      .update({ paid: !job.paid, status: !job.paid ? 'done' : 'pending' })
      .eq('id', job.id);

    if (!error) loadDashboardData();
  };

  const pendingJobs = jobs.filter((j) => j.status === 'pending').length;
  const totalRevenue = jobs
    .filter((j) => j.paid)
    .reduce((sum, j) => sum + Number(j.amount || 0), 0);

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
              className="flex items-center gap-3 rounded-xl bg-white/10 px-4 py-3 text-sm font-semibold text-white"
              aria-current="page"
            >
              <Briefcase className="size-4 text-[#efad85]" aria-hidden="true" />
              Dashboard
            </Link>
            <Link
              href="/contacts"
              className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-white/70 transition hover:bg-white/10 hover:text-white"
            >
              <Users className="size-4" aria-hidden="true" />
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
              href="/contacts"
              className="inline-flex items-center gap-2 rounded-full border border-[#d9ded6] bg-white px-4 py-2 text-sm font-semibold text-[#41644e] transition hover:border-[#41644e]"
            >
              <Users className="size-4" aria-hidden="true" />
              <span className="hidden sm:inline">Clients</span>
              <ArrowUpRight className="size-4" aria-hidden="true" />
            </Link>
          </header>

          <main className="mx-auto w-full max-w-7xl px-5 py-8 sm:px-10 sm:py-10 lg:px-12">
            <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#bd6845]">
                  Business overview
                </p>
                <h1 className="mt-3 text-3xl font-semibold tracking-[-0.05em] text-[#20392e] sm:text-4xl">
                  Good work starts here.
                </h1>
                <p className="mt-2 max-w-xl text-sm leading-6 text-[#68766c]">
                  Keep an eye on the jobs in motion and the people who make your business run.
                </p>
              </div>
              <a
                href="#new-job"
                className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-[#bd6845] px-5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#a95737]"
              >
                <Plus className="size-4" aria-hidden="true" />
                Add a job
              </a>
            </div>

            <section className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-3" aria-label="Business summary">
              <article className="rounded-2xl border border-[#e5e6dd] bg-white p-5 shadow-[0_8px_30px_rgba(32,57,46,0.04)]">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-[#68766c]">Total clients</p>
                  <span className="grid size-10 place-items-center rounded-xl bg-[#edf2eb] text-[#41644e]">
                    <Users className="size-5" aria-hidden="true" />
                  </span>
                </div>
                <p className="mt-5 text-3xl font-semibold tracking-tight text-[#20392e]">{clients.length}</p>
                <p className="mt-1 text-xs text-[#8a948a]">People in your directory</p>
              </article>

              <article className="rounded-2xl border border-[#e5e6dd] bg-white p-5 shadow-[0_8px_30px_rgba(32,57,46,0.04)]">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-[#68766c]">Jobs in progress</p>
                  <span className="grid size-10 place-items-center rounded-xl bg-[#fbefe8] text-[#bd6845]">
                    <Briefcase className="size-5" aria-hidden="true" />
                  </span>
                </div>
                <p className="mt-5 text-3xl font-semibold tracking-tight text-[#20392e]">{pendingJobs}</p>
                <p className="mt-1 text-xs text-[#8a948a]">Ready for your next follow-up</p>
              </article>

              <article className="rounded-2xl border border-[#e5e6dd] bg-white p-5 shadow-[0_8px_30px_rgba(32,57,46,0.04)] sm:col-span-2 xl:col-span-1">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-[#68766c]">Paid revenue</p>
                  <span className="grid size-10 place-items-center rounded-xl bg-[#f1f0e3] text-[#78763d]">
                    <CircleDollarSign className="size-5" aria-hidden="true" />
                  </span>
                </div>
                <p className="mt-5 text-3xl font-semibold tracking-tight text-[#20392e]">
                  ${totalRevenue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </p>
                <p className="mt-1 text-xs text-[#8a948a]">From completed, paid work</p>
              </article>
            </section>

            <div className="mt-8 grid items-start gap-6 xl:grid-cols-[minmax(0,1.4fr)_minmax(320px,0.8fr)]">
              <section className="rounded-2xl border border-[#e5e6dd] bg-white p-5 shadow-[0_8px_30px_rgba(32,57,46,0.04)] sm:p-6">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h2 className="text-lg font-semibold tracking-tight text-[#20392e]">Recent jobs</h2>
                    <p className="mt-1 text-sm text-[#8a948a]">A quick look at what’s on your plate.</p>
                  </div>
                  <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-[#f7f6f1] text-[#41644e]">
                    <CalendarDays className="size-5" aria-hidden="true" />
                  </span>
                </div>

                {loading ? (
                  <p className="py-12 text-center text-sm text-[#8a948a]">Loading your jobs…</p>
                ) : jobs.length === 0 ? (
                  <div className="mt-6 rounded-xl border border-dashed border-[#d9ded6] bg-[#fbfaf6] px-5 py-10 text-center">
                    <span className="mx-auto grid size-11 place-items-center rounded-full bg-[#edf2eb] text-[#41644e]">
                      <Briefcase className="size-5" aria-hidden="true" />
                    </span>
                    <h3 className="mt-4 text-sm font-semibold text-[#30463a]">No jobs recorded yet</h3>
                    <p className="mt-1 text-sm text-[#8a948a]">Add your first job to start tracking progress.</p>
                  </div>
                ) : (
                  <div className="mt-6 divide-y divide-[#eef0e9]">
                    {jobs.map((job) => {
                      const jobState = job.paid
                        ? { label: 'Paid', className: 'bg-[#edf2eb] text-[#41644e]' }
                        : job.status === 'done'
                          ? { label: 'Completed', className: 'bg-[#f1f0e3] text-[#78763d]' }
                          : { label: 'In progress', className: 'bg-[#fbefe8] text-[#a95737]' };

                      return (
                        <article key={job.id} className="flex flex-col gap-4 py-5 sm:flex-row sm:items-center sm:justify-between">
                          <div className="min-w-0">
                            <div className="flex flex-wrap items-center gap-2">
                              <h3 className="truncate font-semibold text-[#20392e]">{job.title}</h3>
                              <span className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${jobState.className}`}>
                                {jobState.label}
                              </span>
                            </div>
                            <p className="mt-1 line-clamp-2 text-sm text-[#68766c]">
                              {job.description || 'No description added'}
                            </p>
                            <p className="mt-2 text-sm font-semibold text-[#30463a]">
                              ${Number(job.amount || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </p>
                          </div>
                          <button
                            type="button"
                            onClick={() => toggleJobPaid(job)}
                            className={`inline-flex shrink-0 items-center justify-center gap-2 rounded-xl border px-3.5 py-2 text-xs font-semibold transition ${
                              job.paid
                                ? 'border-[#d9ded6] bg-white text-[#68766c] hover:border-[#bd6845] hover:text-[#a95737]'
                                : 'border-[#20392e] bg-[#20392e] text-white hover:bg-[#304b3d]'
                            }`}
                          >
                            {job.paid ? <Check className="size-3.5" aria-hidden="true" /> : <CircleDollarSign className="size-3.5" aria-hidden="true" />}
                            {job.paid ? 'Mark unpaid' : 'Mark as paid'}
                          </button>
                        </article>
                      );
                    })}
                  </div>
                )}
              </section>

              <section id="new-job" className="scroll-mt-6 rounded-2xl border border-[#e5e6dd] bg-white p-5 shadow-[0_8px_30px_rgba(32,57,46,0.04)] sm:p-6">
                <div className="mb-6">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#bd6845]">Quick entry</p>
                  <h2 className="mt-2 text-lg font-semibold tracking-tight text-[#20392e]">Add a job</h2>
                  <p className="mt-1 text-sm text-[#8a948a]">Keep the next piece of work moving.</p>
                </div>

                <form onSubmit={handleCreateJob} className="space-y-4">
                  <div className="grid gap-2">
                    <label htmlFor="job-client" className="text-sm font-medium text-[#30463a]">Client</label>
                    <select
                      id="job-client"
                      required
                      value={clientId}
                      onChange={(e) => setClientId(e.target.value)}
                      className="h-11 w-full rounded-xl border border-[#d9ded6] bg-white px-3 text-sm text-[#20392e] outline-none transition focus:border-[#41644e] focus:ring-2 focus:ring-[#41644e]/15"
                    >
                      <option value="">Select a client</option>
                      {clients.map((client) => (
                        <option key={client.id} value={client.id}>{client.name}</option>
                      ))}
                    </select>
                  </div>
                  <div className="grid gap-2">
                    <label htmlFor="job-title" className="text-sm font-medium text-[#30463a]">Job title</label>
                    <input
                      id="job-title"
                      type="text"
                      placeholder="Kitchen remodel"
                      required
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      className="h-11 w-full rounded-xl border border-[#d9ded6] bg-white px-3 text-sm text-[#20392e] outline-none transition placeholder:text-[#99a39a] focus:border-[#41644e] focus:ring-2 focus:ring-[#41644e]/15"
                    />
                  </div>
                  <div className="grid gap-2">
                    <label htmlFor="job-amount" className="text-sm font-medium text-[#30463a]">Amount</label>
                    <div className="relative">
                      <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-[#8a948a]">$</span>
                      <input
                        id="job-amount"
                        type="number"
                        step="0.01"
                        min="0"
                        placeholder="0.00"
                        required
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        className="h-11 w-full rounded-xl border border-[#d9ded6] bg-white pl-7 pr-3 text-sm text-[#20392e] outline-none transition placeholder:text-[#99a39a] focus:border-[#41644e] focus:ring-2 focus:ring-[#41644e]/15"
                      />
                    </div>
                  </div>
                  <div className="grid gap-2">
                    <label htmlFor="job-description" className="text-sm font-medium text-[#30463a]">Description <span className="font-normal text-[#99a39a]">(optional)</span></label>
                    <textarea
                      id="job-description"
                      rows={3}
                      placeholder="A few details about the work"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      className="w-full resize-y rounded-xl border border-[#d9ded6] bg-white px-3 py-2.5 text-sm text-[#20392e] outline-none transition placeholder:text-[#99a39a] focus:border-[#41644e] focus:ring-2 focus:ring-[#41644e]/15"
                    />
                  </div>
                  <button
                    type="submit"
                    className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-[#bd6845] px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-[#a95737]"
                  >
                    <Plus className="size-4" aria-hidden="true" />
                    Create job
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
