// src/pages/Signup.jsx
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { signUp } from '../lib/supabase.js'
import { Button } from '../components/ui/Button.jsx'

export default function Signup() {
  const navigate = useNavigate()
  const [fullName, setFullName] = useState('')
  const [username, setUsername] = useState('')
  const [email, setEmail]       = useState('')
  const [password, setPass]     = useState('')
  const [loading, setLoading]   = useState(false)
  const [error, setError]       = useState(null)
  const [success, setSuccess]   = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setError(null)
    if (!fullName || !email || !password) return setError('Full name, email, and password are required.')
    if (password.length < 6) return setError('Password must be at least 6 characters.')
    setLoading(true)
    const { error: err } = await signUp({ email, password, fullName, username })
    if (err) {
      setError(err.message)
      setLoading(false)
    } else {
      setSuccess(true)
    }
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface px-4">
        <div className="w-full max-w-md text-center animate-bounce-in">
          <div className="text-6xl mb-4">🎉</div>
          <h2 className="font-display font-bold text-2xl text-white mb-2">You're in!</h2>
          <p className="text-slate-400 text-sm mb-6">
            Check your email to confirm your account, then come back to log in.
          </p>
          <Link
            to="/login"
            className="inline-flex items-center gap-2 bg-brand-500 hover:bg-brand-600 text-white px-6 py-3 rounded-lg font-medium transition-colors"
          >
            Go to Login
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-surface px-4">
      <div className="w-full max-w-md animate-fade-in">
        <div className="text-center mb-8">
          <h1 className="font-display font-bold text-3xl text-white mb-1">
            Dev<span className="text-brand-400">Path</span>
          </h1>
          <p className="text-slate-400 text-sm">Track your path to becoming an SDE.</p>
        </div>

        <div className="bg-surface-card border border-surface-border rounded-2xl p-8 shadow-2xl">
          <h2 className="font-display font-semibold text-xl text-white mb-6">Create your account</h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5">Full Name</label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Ada Lovelace"
                className="w-full bg-surface-muted border border-surface-border rounded-lg px-4 py-2.5 text-sm text-white
                  placeholder-slate-600 focus:outline-none focus:border-brand-500/60 transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5">
                Username <span className="text-slate-600">(optional)</span>
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="ada_dev"
                className="w-full bg-surface-muted border border-surface-border rounded-lg px-4 py-2.5 text-sm text-white
                  placeholder-slate-600 focus:outline-none focus:border-brand-500/60 transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                autoComplete="email"
                className="w-full bg-surface-muted border border-surface-border rounded-lg px-4 py-2.5 text-sm text-white
                  placeholder-slate-600 focus:outline-none focus:border-brand-500/60 transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPass(e.target.value)}
                placeholder="Min. 6 characters"
                autoComplete="new-password"
                className="w-full bg-surface-muted border border-surface-border rounded-lg px-4 py-2.5 text-sm text-white
                  placeholder-slate-600 focus:outline-none focus:border-brand-500/60 transition-colors"
              />
            </div>

            {error && (
              <p className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">
                {error}
              </p>
            )}

            <Button type="submit" loading={loading} size="lg" className="w-full mt-2">
              Create Account
            </Button>
          </form>

          <p className="text-center text-sm text-slate-500 mt-5">
            Already have an account?{' '}
            <Link to="/login" className="text-brand-400 hover:text-brand-300 font-medium transition-colors">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
