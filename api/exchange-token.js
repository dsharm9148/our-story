// Vercel serverless function — POST /api/exchange-token
// Exchanges an Instagram OAuth code for a long-lived token.
// Call this once per account after the OAuth redirect.
//
// Required environment variables:
//   INSTAGRAM_APP_ID       — from Meta Developer App
//   INSTAGRAM_APP_SECRET   — from Meta Developer App
//   APP_URL                — your Vercel deployment URL (e.g. https://our-story.vercel.app)

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { code } = req.body || {}
  if (!code) return res.status(400).json({ error: 'Missing code' })

  const missing = ['INSTAGRAM_APP_ID', 'INSTAGRAM_APP_SECRET', 'APP_URL'].filter(
    (k) => !process.env[k]
  )
  if (missing.length) {
    return res.status(503).json({ error: `Missing env vars: ${missing.join(', ')}` })
  }

  const redirectUri = `${process.env.APP_URL}/auth`

  try {
    // Step 1: short-lived token
    const shortRes = await fetch('https://api.instagram.com/oauth/access_token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id: process.env.INSTAGRAM_APP_ID,
        client_secret: process.env.INSTAGRAM_APP_SECRET,
        grant_type: 'authorization_code',
        redirect_uri: redirectUri,
        code,
      }),
    })
    const shortData = await shortRes.json()
    if (shortData.error_type || shortData.error) {
      return res.status(400).json({ error: shortData.error_message || shortData.error })
    }

    // Step 2: exchange for long-lived token (valid 60 days)
    const longRes = await fetch(
      `https://graph.instagram.com/access_token?grant_type=ig_exchange_token&client_secret=${process.env.INSTAGRAM_APP_SECRET}&access_token=${shortData.access_token}`
    )
    const longData = await longRes.json()
    if (longData.error) {
      return res.status(400).json({ error: longData.error.message })
    }

    return res.status(200).json({
      access_token: longData.access_token,
      expires_in: longData.expires_in,
      token_type: longData.token_type,
    })
  } catch (err) {
    console.error('Token exchange error:', err)
    return res.status(500).json({ error: err.message })
  }
}
