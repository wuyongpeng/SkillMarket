import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { supabase } from './lib/supabase.js'

// Handle Supabase OAuth callback — the URL contains a code/token fragment
// Supabase JS SDK automatically exchanges it when getSession() is called,
// but we need to ensure the session is set before rendering.
async function bootstrap() {
  // This handles the PKCE code exchange from the OAuth redirect
  await supabase.auth.getSession()

  // If we landed on /auth/callback, redirect to home after session is set
  if (window.location.pathname === '/auth/callback') {
    window.history.replaceState({}, '', '/')
  }

  createRoot(document.getElementById('root')).render(
    <StrictMode>
      <App />
    </StrictMode>,
  )
}

bootstrap()
