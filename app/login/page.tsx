'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@supabase/supabase-js';

// Inicialización directa y segura con las variables públicas
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://olzneubnisarpxopkvzi.supabase.co';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || 'sb_publishable_1IQJsysxYODjVkFB75ApbQ_n_Zmh6m3';
const supabase = createClient(supabaseUrl, supabaseKey);

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      router.push('/dashboard');
      router.refresh();
    }
  };

  return (
    <div style={{ padding: '40px', fontFamily: 'sans-serif', maxWidth: '400px', margin: '0 auto' }}>
      <h1 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '20px' }}>Sign In</h1>
      {error && <p style={{ color: 'red', fontSize: '14px', marginBottom: '15px' }}>{error}</p>}
      
      <form onSubmit={handleLogin}>
        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>Email</label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={{ width: '100%', padding: '8px', boxSizing: 'border-box', border: '1px solid #ccc', borderRadius: '4px' }}
            placeholder="you@example.com"
          />
        </div>
        
        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>Password</label>
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={{ width: '100%', padding: '8px', boxSizing: 'border-box', border: '1px solid #ccc', borderRadius: '4px' }}
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          style={{ width: '100%', padding: '10px', background: '#0070f3', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}
        >
          {loading ? 'Signing in...' : 'Log In'}
        </button>
      </form>
    </div>
  );
}