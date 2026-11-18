'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';

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
    <div style={{ padding: '30px', maxWidth: '900px', margin: '0 auto', fontFamily: 'sans-serif' }}>
      <h1 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '20px' }}>Business Dashboard</h1>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '15px', marginBottom: '30px' }}>
        <div style={{ border: '1px solid #ccc', padding: '15px', borderRadius: '8px' }}>
          <p style={{ fontSize: '14px', color: '#666' }}>Total Clients</p>
          <p style={{ fontSize: '24px', fontWeight: 'bold' }}>{clients.length}</p>
        </div>
        <div style={{ border: '1px solid #ccc', padding: '15px', borderRadius: '8px' }}>
          <p style={{ fontSize: '14px', color: '#666' }}>Pending Jobs</p>
          <p style={{ fontSize: '24px', fontWeight: 'bold' }}>{pendingJobs}</p>
        </div>
        <div style={{ border: '1px solid #ccc', padding: '15px', borderRadius: '8px' }}>
          <p style={{ fontSize: '14px', color: '#666' }}>Total Revenue (Paid)</p>
          <p style={{ fontSize: '24px', fontWeight: 'bold' }}>${totalRevenue.toFixed(2)}</p>
        </div>
      </div>

      <form onSubmit={handleCreateJob} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', border: '1px solid #ccc', padding: '20px', borderRadius: '8px', marginBottom: '30px' }}>
        <select
          required
          value={clientId}
          onChange={(e) => setClientId(e.target.value)}
          style={{ padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }}
        >
          <option value="">Select a Client *</option>
          {clients.map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
        <input
          type="text"
          placeholder="Job Title *"
          required
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          style={{ padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }}
        />
        <input
          type="number"
          step="0.01"
          placeholder="Amount ($)"
          required
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          style={{ padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }}
        />
        <input
          type="text"
          placeholder="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          style={{ padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }}
        />
        <button type="submit" style={{ gridColumn: 'span 2', padding: '10px', background: '#28a745', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>
          Create Job
        </button>
      </form>

      {loading ? (
        <p>Loading jobs...</p>
      ) : jobs.length === 0 ? (
        <p style={{ color: '#666' }}>No jobs recorded yet.</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          {jobs.map((job) => (
            <div key={job.id} style={{ border: '1px solid #eee', padding: '15px', borderRadius: '6px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
              <div>
                <h2 style={{ fontSize: '18px', fontWeight: '600' }}>{job.title}</h2>
                <p style={{ fontSize: '14px', color: '#555' }}>{job.description}</p>
                <p style={{ fontSize: '14px', marginTop: '5px' }}>
                  Amount: <strong>${Number(job.amount).toFixed(2)}</strong> • Status: <span style={{ textTransform: 'uppercase' }}>{job.status}</span>
                </p>
              </div>
              <button
                onClick={() => toggleJobPaid(job)}
                style={{ padding: '8px 12px', borderRadius: '4px', fontSize: '14px', color: '#fff', backgroundColor: job.paid ? '#6c757d' : '#0070f3', border: 'none', cursor: 'pointer', fontWeight: 'bold' }}
              >
                {job.paid ? 'Paid ✓' : 'Mark as Paid'}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}