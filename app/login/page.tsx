'use client';

import React, { useState } from 'react';
import { MOCK_USERS } from '@/lib/mockData';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const user = MOCK_USERS.find(u => u.email === email && u.password === password);
    if (user) {
      router.push('/dashboard');
    } else {
      setError('Invalid credentials. Use: luciano@example.com / password123');
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center p-4 bg-background">
      <div className="w-full max-w-md p-6 border rounded-lg shadow-sm bg-card">
        <h1 className="text-2xl font-bold mb-4 text-card-foreground">Sign In (Demo)</h1>
        {error && <p className="text-sm text-red-500 mb-4">{error}</p>}
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Email Address</label>
            <input 
              type="email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full p-2 border rounded-md bg-background text-foreground"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Password</label>
            <input 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full p-2 border rounded-md bg-background text-foreground"
            />
          </div>
          <button type="submit" className="w-full py-2 bg-primary text-primary-foreground font-semibold rounded-md">
            Sign In
          </button>
        </form>
      </div>
    </div>
  );
}