// OAuth redirect handler — Instagram sends users here after authorization.
// This page reads the `code` param from the URL, calls /api/exchange-token,
// and displays the resulting long-lived token so you can copy it into Vercel env vars.
//
// Usage:
//   1. Set APP_URL in Vercel to your deployment URL
//   2. Add <APP_URL>/auth as a valid OAuth Redirect URI in Meta Developer App
//   3. Authorize via the Instagram Login URL (see INSTAGRAM_SETUP.md)
//   4. You'll land here — copy the token shown and paste it into Vercel settings

import { useEffect, useState } from 'react'

export default function Auth() {
  const [status, setStatus] = useState('loading')
  const [token, setToken] = useState(null)
  const [error, setError] = useState(null)

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const code = params.get('code')
    const errParam = params.get('error_description') || params.get('error')

    if (errParam) {
      setError(errParam)
      setStatus('error')
      return
    }

    if (!code) {
      setError('No authorization code found in URL.')
      setStatus('error')
      return
    }

    fetch('/api/exchange-token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code }),
    })
      .then((r) => r.json())
      .then((data) => {
        if (data.error) {
          setError(data.error)
          setStatus('error')
        } else {
          setToken(data.access_token)
          setStatus('success')
        }
      })
      .catch((err) => {
        setError(err.message)
        setStatus('error')
      })
  }, [])

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        {status === 'loading' && (
          <>
            <div style={styles.spinner} />
            <p style={styles.text}>Exchanging token…</p>
          </>
        )}

        {status === 'error' && (
          <>
            <div style={styles.icon}>❌</div>
            <h2 style={styles.heading}>Authorization Failed</h2>
            <p style={styles.error}>{error}</p>
          </>
        )}

        {status === 'success' && (
          <>
            <div style={styles.icon}>✅</div>
            <h2 style={styles.heading}>Token Ready!</h2>
            <p style={styles.text}>
              Copy this long-lived token and paste it into your Vercel environment variables as{' '}
              <code>DIYA_INSTAGRAM_TOKEN</code> or <code>NATALIE_INSTAGRAM_TOKEN</code>.
            </p>
            <div style={styles.tokenBox}>
              <code style={styles.tokenText}>{token}</code>
            </div>
            <button
              style={styles.copyBtn}
              onClick={() => navigator.clipboard.writeText(token)}
            >
              Copy to clipboard
            </button>
            <p style={styles.note}>This token is valid for 60 days. Repeat the auth flow to refresh it.</p>
          </>
        )}
      </div>
    </div>
  )
}

const styles = {
  page: {
    minHeight: '80vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  card: {
    background: '#fff',
    borderRadius: 20,
    padding: '40px 48px',
    maxWidth: 520,
    width: '100%',
    boxShadow: '0 4px 24px rgba(0,0,0,0.1)',
    textAlign: 'center',
  },
  icon: { fontSize: 48, marginBottom: 12 },
  heading: { fontSize: 22, fontWeight: '700', color: '#1a2e1a', marginBottom: 12 },
  text: { color: '#555', fontSize: 14, lineHeight: 1.6, marginBottom: 16 },
  error: { color: '#dc2626', fontSize: 14, background: '#fef2f2', padding: '10px 16px', borderRadius: 8 },
  tokenBox: {
    background: '#f1f5f9',
    borderRadius: 10,
    padding: '12px 16px',
    marginBottom: 12,
    wordBreak: 'break-all',
    textAlign: 'left',
  },
  tokenText: { fontSize: 11, color: '#334155' },
  copyBtn: {
    background: '#1a2e1a',
    color: '#fff',
    border: 'none',
    borderRadius: 8,
    padding: '10px 20px',
    cursor: 'pointer',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 16,
  },
  note: { fontSize: 12, color: '#888' },
  spinner: {
    width: 40,
    height: 40,
    border: '4px solid #e5e7eb',
    borderTop: '4px solid #16a34a',
    borderRadius: '50%',
    animation: 'spin 0.8s linear infinite',
    margin: '0 auto 16px',
  },
}
