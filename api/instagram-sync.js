// Vercel serverless function — POST /api/instagram-sync
// Fetches recent media from both Instagram accounts, uploads to Cloudinary
// for permanent storage, and returns new photos grouped by location.
//
// Required environment variables (set in Vercel project settings):
//   DIYA_INSTAGRAM_TOKEN      — long-lived Instagram token for Diya's account
//   NATALIE_INSTAGRAM_TOKEN   — long-lived Instagram token for Natalie's account
//   CLOUDINARY_CLOUD_NAME     — from Cloudinary dashboard
//   CLOUDINARY_API_KEY        — from Cloudinary dashboard
//   CLOUDINARY_API_SECRET     — from Cloudinary dashboard

import { v2 as cloudinary } from 'cloudinary'

const IG_API = 'https://graph.instagram.com'
const FIELDS = 'id,media_type,media_url,timestamp,location,children{media_url,media_type}'
const MAX_PHOTOS = 300 // safety cap across both accounts

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key:    process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
})

// Fetch all media for one account, paginating through results
async function fetchAccountMedia(token) {
  const photos = []
  let url = `${IG_API}/me/media?fields=${FIELDS}&limit=50&access_token=${token}`

  while (url && photos.length < MAX_PHOTOS) {
    const res  = await fetch(url)
    const data = await res.json()
    if (data.error) throw new Error(`Instagram API error: ${data.error.message}`)

    for (const item of data.data || []) {
      if (item.media_type === 'IMAGE') {
        photos.push({ url: item.media_url, id: item.id, timestamp: item.timestamp, location: item.location?.name || null })
      } else if (item.media_type === 'CAROUSEL_ALBUM') {
        // Carousel: each child image inherits the parent's timestamp + location
        for (const child of item.children?.data || []) {
          if (child.media_type !== 'VIDEO') {
            photos.push({ url: child.media_url, id: child.id, timestamp: item.timestamp, location: item.location?.name || null })
          }
        }
      }
      // VIDEO items are intentionally skipped
    }

    url = data.paging?.next || null
  }

  return photos
}

// Upload one photo to Cloudinary; skip upload if already stored
async function uploadPhoto(photo) {
  const publicId = `our-story/instagram-${photo.id}`

  try {
    const result = await cloudinary.uploader.upload(photo.url, {
      public_id: publicId,
      overwrite: false,
      resource_type: 'image',
    })
    return result.secure_url
  } catch (err) {
    // Cloudinary returns an error when overwrite:false and asset already exists —
    // in that case we construct the URL from the known public_id
    if (err.message?.includes('already exists') || err.http_code === 400) {
      return `https://res.cloudinary.com/${process.env.CLOUDINARY_CLOUD_NAME}/image/upload/${publicId}`
    }
    throw err
  }
}

// Upload in batches to avoid hammering Cloudinary rate limits
async function uploadBatch(photos) {
  const BATCH = 10
  const results = []
  for (let i = 0; i < photos.length; i += BATCH) {
    const batch = photos.slice(i, i + BATCH)
    const settled = await Promise.allSettled(
      batch.map(async (photo) => {
        const src = await uploadPhoto(photo)
        return { id: photo.id, src, section: photo.location, timestamp: photo.timestamp }
      })
    )
    for (const r of settled) {
      if (r.status === 'fulfilled') results.push(r.value)
      // silently skip individual upload failures
    }
  }
  return results
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  // ── Check env vars ──────────────────────────────────────────────────
  const missing = [
    'DIYA_INSTAGRAM_TOKEN', 'NATALIE_INSTAGRAM_TOKEN',
    'CLOUDINARY_CLOUD_NAME', 'CLOUDINARY_API_KEY', 'CLOUDINARY_API_SECRET',
  ].filter((k) => !process.env[k])

  if (missing.length) {
    return res.status(503).json({
      error: `Missing environment variables: ${missing.join(', ')}. See INSTAGRAM_SETUP.md.`,
      setup_required: true,
    })
  }

  // ── Parse request body ──────────────────────────────────────────────
  // Frontend sends already-synced photo IDs so we only upload what's new
  const { synced_ids = [] } = req.body || {}
  const syncedSet = new Set(synced_ids)

  try {
    // Fetch from both accounts in parallel
    const [diyaPhotos, nataliePhotos] = await Promise.all([
      fetchAccountMedia(process.env.DIYA_INSTAGRAM_TOKEN),
      fetchAccountMedia(process.env.NATALIE_INSTAGRAM_TOKEN),
    ])

    // Merge and deduplicate by photo id
    const seen = new Set()
    const allPhotos = [...diyaPhotos, ...nataliePhotos].filter((p) => {
      if (seen.has(p.id)) return false
      seen.add(p.id)
      return true
    })

    // Only process photos the frontend doesn't have yet
    const newPhotos = allPhotos.filter((p) => !syncedSet.has(p.id))

    if (newPhotos.length === 0) {
      return res.status(200).json({ photos: [], total: 0, message: 'Already up to date' })
    }

    // Upload to Cloudinary for permanent storage
    const uploaded = await uploadBatch(newPhotos)

    // Sort newest first
    uploaded.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))

    return res.status(200).json({ photos: uploaded, total: uploaded.length })
  } catch (err) {
    console.error('Instagram sync error:', err)
    return res.status(500).json({ error: err.message })
  }
}
