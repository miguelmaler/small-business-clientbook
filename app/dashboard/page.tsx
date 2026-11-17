import React from 'react';
import { MOCK_JOBS, MOCK_CLIENTS } from '@/lib/mockData';
import Link from 'next/link';

export default function DashboardPage() {
  const pendingJobs = MOCK_JOBS.filter(j => j.status === 'pending');
  const totalRevenue = MOCK_JOBS.reduce((acc, j) => acc + (j.paid ? j.amount : 0), 0);

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <Link href="/contacts" className="px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm font-medium">
          View Contacts →
        </Link>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-6 border rounded-lg shadow-sm bg-card">
          <h3 className="text-sm font-medium text-muted-foreground">Total Clients</h3>
          <p className="text-3xl font-bold mt-2">{MOCK_CLIENTS.length}</p>
        </div>
        <div className="p-6 border rounded-lg shadow-sm bg-card">
          <h3 className="text-sm font-medium text-muted-foreground">Pending Jobs</h3>
          <p className="text-3xl font-bold mt-2">{pendingJobs.length}</p>
        </div>
        <div className="p-6 border rounded-lg shadow-sm bg-card">
          <h3 className="text-sm font-medium text-muted-foreground">Collected Revenue</h3>
          <p className="text-3xl font-bold mt-2">${totalRevenue.toFixed(2)}</p>
        </div>
      </div>

      <h2 className="text-xl font-semibold mt-6">Recent Jobs</h2>
      <div className="border rounded-lg divide-y bg-card">
        {MOCK_JOBS.map(job => (
          <div key={job.id} className="p-4 flex justify-between items-center">
            <div>
              <p className="font-semibold">{job.jobTitle}</p>
              <p className="text-sm text-muted-foreground">{job.description}</p>
              <p className="text-xs text-muted-foreground mt-1">{job.timestamp}</p>
            </div>
            <div className="text-right">
              <span className={`px-2 py-1 text-xs font-semibold rounded-full ${job.status === 'pending' ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'}`}>
                {job.status.toUpperCase()}
              </span>
              <p className="text-sm font-bold mt-1">${job.amount.toFixed(2)}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}