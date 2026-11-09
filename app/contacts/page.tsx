import React from 'react';
import { MOCK_CLIENTS } from '@/lib/mockData';
import Link from 'next/link';

export default function ContactsPage() {
  return (
    <div className="p-8 max-w-6xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Contact List</h1>
        <Link href="/dashboard" className="px-4 py-2 border rounded-md text-sm font-medium">
          ← Back to Dashboard
        </Link>
      </div>
      
      <div className="border rounded-lg overflow-hidden bg-card">
        <table className="w-full border-collapse text-left">
          <thead className="bg-muted">
            <tr>
              <th className="p-3 border-b text-sm font-semibold">Name</th>
              <th className="p-3 border-b text-sm font-semibold">Email</th>
              <th className="p-3 border-b text-sm font-semibold">Phone</th>
              <th className="p-3 border-b text-sm font-semibold">Address</th>
              <th className="p-3 border-b text-sm font-semibold">Notes</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {MOCK_CLIENTS.map(client => (
              <tr key={client.id} className="hover:bg-muted/40">
                <td className="p-3 font-medium">{client.name}</td>
                <td className="p-3 text-muted-foreground">{client.email || 'N/A'}</td>
                <td className="p-3">{client.phone}</td>
                <td className="p-3">{client.address}</td>
                <td className="p-3 text-sm text-muted-foreground">{client.notes || '-'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}