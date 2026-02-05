'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import axios from 'axios'

export default function SignupPage() {
  const router = useRouter()

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState('customer') // default role

  const handleSignup = async (e) => {
    e.preventDefault()

    try {
      const res = await axios.post('http://localhost:5000/api/auth/register', {
        name,
        email,
        password,
        role
      })

      alert('Signup successful! Please login.')
      router.push('/login')
    } catch (err) {
      alert(err.response?.data || 'Signup failed')
    }
  }

  return (
    <div className="flex justify-center items-center h-screen">
      <form
        onSubmit={handleSignup}
        className="flex flex-col gap-4 p-6 border rounded shadow-md"
      >
        <h2 className="text-2xl font-semibold">Sign Up</h2>

        <input
          type="text"
          placeholder="Full Name"
          value={name}
          onChange={e => setName(e.target.value)}
          required
          className="border px-3 py-2 rounded"
        />

        <input
          type="email"
          placeholder="Email"
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

        {/* Role selection for multivendor */}
        <select
          value={role}
          onChange={e => setRole(e.target.value)}
          className="border px-3 py-2 rounded"
        >
          <option value="customer">Customer</option>
          <option value="vendor">Vendor</option>
        </select>

        <button
          type="submit"
          className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
        >
          Sign Up
        </button>
      </form>
    </div>
  )
}
