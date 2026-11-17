'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://olzneubnisarpxopkvzi.supabase.co';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || 'sb_publishable_1IQJsysxYODjVkFB75ApbQ_n_Zmh6m3';
const supabase = createClient(supabaseUrl, supabaseKey);

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
      alert('Error adding client: ' + error.message);
    } else {
      setName('');
      setEmail('');
      setPhone('');
      setAddress('');
      setNotes('');
      fetchClients();
    }
  };

  return (
    <div style={{ padding: '30px', maxWidth: '800px', margin: '0 auto', fontFamily: 'sans-serif' }}>
      <h1 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '20px' }}>Clients Directory</h1>

      <form onSubmit={handleAddClient} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', border: '1px solid #ccc', padding: '20px', borderRadius: '8px', marginBottom: '30px' }}>
        <input
          type="text"
          placeholder="Client Name *"
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          style={{ padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }}
        />
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={{ padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }}
        />
        <input
          type="text"
          placeholder="Phone"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          style={{ padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }}
        />
        <input
          type="text"
          placeholder="Address"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          style={{ padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }}
        />
        <input
          type="text"
          placeholder="Notes"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          style={{ padding: '8px', border: '1px solid #ccc', borderRadius: '4px', gridColumn: 'span 2' }}
        />
        <button type="submit" style={{ gridColumn: 'span 2', padding: '10px', background: '#0070f3', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>
          Add Client
        </button>
      </form>

      {loading ? (
        <p>Loading contacts...</p>
      ) : clients.length === 0 ? (
        <p style={{ color: '#666' }}>No clients found. Add your first client above.</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          {clients.map((client) => (
            <div key={client.id} style={{ border: '1px solid #eee', padding: '15px', borderRadius: '6px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
              <h2 style={{ fontSize: '18px', fontWeight: '600' }}>{client.name}</h2>
              <p style={{ fontSize: '14px', color: '#555' }}>{client.email} • {client.phone}</p>
              {client.address && <p style={{ fontSize: '14px', color: '#777' }}>{client.address}</p>}
              {client.notes && <p style={{ fontSize: '14px', marginTop: '5px', fontStyle: 'italic' }}>{client.notes}</p>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}