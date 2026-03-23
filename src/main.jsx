// src/main.jsx
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

// ── Wake up Supabase immediately on page load ─────────────────
// Supabase free tier sleeps after inactivity. This ping fires
// instantly so by the time the user fills in their email,
// the DB connection is already warm.
import { supabase } from './lib/supabase.js'
supabase.from('profiles').select('id').limit(1).maybeSingle()

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
