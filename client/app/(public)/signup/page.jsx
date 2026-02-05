'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';

export default function SignupPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    username: '',
    email: '',
    password: ''
  });

  const handleSignup = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post('http://localhost:5000/api/auth/register', form);

      // ✅ auto-login
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify(res.data.user));

      alert('Signup successful ✅');
      router.push('/');
    } catch (err) {
      alert(err.response?.data?.message || 'Signup failed');
    }
  };

  return (
    <form onSubmit={handleSignup} className="flex flex-col gap-4 p-6 border rounded">
      <h2 className="text-xl font-semibold">Sign Up</h2>

      <input
        placeholder="Username"
        value={form.username}
        onChange={e => setForm({ ...form, username: e.target.value })}
        required
        className="border px-3 py-2 rounded"
      />

      <input
        type="email"
        placeholder="Email"
        value={form.email}
        onChange={e => setForm({ ...form, email: e.target.value })}
        required
        className="border px-3 py-2 rounded"
      />

      <input
        type="password"
        placeholder="Password"
        value={form.password}
        onChange={e => setForm({ ...form, password: e.target.value })}
        required
        className="border px-3 py-2 rounded"
      />

      <button className="bg-green-500 text-white py-2 rounded">
        Sign Up
      </button>
    </form>
  );
}
