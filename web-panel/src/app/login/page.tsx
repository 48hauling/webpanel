'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { devapi } from '@/lib/devapi'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      const response = await devapi.login(email, password)

      if (!response.success || !response.data) {
        setError(response.error || 'Login failed')
        setLoading(false)
        return
      }

      // Check if user is admin
      if (response.data.user.role !== 'ADMIN') {
        setError('You are not authorized to access this page.')
        await devapi.logout()
        setLoading(false)
        return
      }

      console.log('Login successful, redirecting to dashboard...')
      // Force full page reload to ensure middleware picks up the new session
      window.location.href = '/'
    } catch (err) {
      console.error('Login error:', err)
      setError('An unexpected error occurred')
      setLoading(false)
    }
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-[#0f0f0f] relative overflow-hidden">
      {/* Background Logo Silhouette */}
      <div className="absolute inset-0 flex items-center justify-center opacity-5 pointer-events-none">
        <img
          src="/logo.png"
          alt="48 Hauling"
          className="w-[600px] h-[600px] object-contain"
        />
      </div>

      {/* Login Card */}
      <div className="relative z-10 p-8 bg-[#1a1a1a] rounded-lg shadow-2xl w-96 border border-gray-800">
        {/* Logo at top of card */}
        <div className="flex justify-center mb-6">
          <img
            src="/logo.png"
            alt="48 Hauling Logo"
            className="w-24 h-24 object-contain"
          />
        </div>

        <h1 className="mb-2 text-2xl font-bold text-center text-white">48 Hauling</h1>
        <p className="mb-6 text-sm text-center text-gray-400">Admin Dashboard Login</p>

        <form onSubmit={handleLogin}>
          <div className="mb-4">
            <label className="block mb-2 text-sm font-medium text-gray-300" htmlFor="email">
              Email
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 bg-[#0f0f0f] border border-gray-800 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-green-500"
              required
              disabled={loading}
            />
          </div>
          <div className="mb-6">
            <label className="block mb-2 text-sm font-medium text-gray-300" htmlFor="password">
              Password
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 bg-[#0f0f0f] border border-gray-800 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-green-500"
              required
              disabled={loading}
            />
          </div>
          {error && <p className="mb-4 text-sm text-red-500">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="w-full px-4 py-2 text-white bg-green-600 rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-75 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>
      </div>
    </div>
  )
}
