'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post('http://localhost:5000/api/auth/login', {
        emailOrUsername: email,   // ✅ matches backend
        password
      });

      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify(res.data.user));

      alert('Login successful ✅');
      router.push('/'); 
    } catch (err) {
      alert(err.response?.data?.message || 'Login failed');
    }
  };

  return (
    <form onSubmit={handleLogin} className="flex flex-col gap-4 p-6 border rounded">
      <h2 className="text-xl font-semibold">Login</h2>

      <input
        placeholder="Email or Username"
        value={email}
        onChange={e => setEmail(e.target.value)}
        required
        className="border px-3 py-2 rounded"
      />

      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={e => setPassword(e.target.value)}
        required
        className="border px-3 py-2 rounded"
      />

      <button className="bg-blue-500 text-white py-2 rounded">
        Login
      </button>
    </form>
  );
}
