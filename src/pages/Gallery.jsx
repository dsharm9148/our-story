import { useState, useEffect } from 'react'
import { X, RefreshCw } from 'lucide-react'

const STATIC_PHOTOS = [
  { id: 1,  src: '/gallery/DSCN2464.JPEG' },
  { id: 2,  src: '/gallery/IMG_0290.JPG' },
  { id: 3,  src: '/gallery/IMG_0423.JPG' },
  { id: 4,  src: '/gallery/IMG_0846.jpg' },
  { id: 5,  src: '/gallery/IMG_1131.JPG' },
  { id: 6,  src: '/gallery/IMG_1138.JPG' },
  { id: 7,  src: '/gallery/IMG_1176.JPG' },
  { id: 8,  src: '/gallery/IMG_1218.JPG' },
  { id: 9,  src: '/gallery/IMG_1437.JPG' },
  { id: 10, src: '/gallery/IMG_1487.JPG' },
  { id: 11, src: '/gallery/IMG_1489.JPG' },
  { id: 12, src: '/gallery/IMG_1763.JPG' },
  { id: 13, src: '/gallery/IMG_1828.JPG' },
  { id: 14, src: '/gallery/IMG_2281.JPG' },
  { id: 15, src: '/gallery/IMG_2851.JPG' },
  { id: 16, src: '/gallery/IMG_2934.JPG' },
  { id: 17, src: '/gallery/IMG_2958.jpg' },
  { id: 18, src: '/gallery/IMG_3027.JPG' },
  { id: 19, src: '/gallery/IMG_3224.JPG' },
  { id: 20, src: '/gallery/IMG_4448.JPG' },
  { id: 21, src: '/gallery/IMG_4622.JPG' },
  { id: 22, src: '/gallery/IMG_4823.JPG' },
  { id: 23, src: '/gallery/IMG_4910.JPG' },
  { id: 24, src: '/gallery/IMG_4951.JPG' },
  { id: 25, src: '/gallery/IMG_5018.JPG' },
  { id: 26, src: '/gallery/IMG_5149.JPG' },
  { id: 27, src: '/gallery/IMG_5274.JPG' },
  { id: 28, src: '/gallery/IMG_6541.JPG' },
  { id: 29, src: '/gallery/IMG_6621.jpg' },
  { id: 30, src: '/gallery/IMG_6940.JPG' },
  { id: 31, src: '/gallery/IMG_6992.jpg' },
  { id: 32, src: '/gallery/IMG_7158.JPG' },
  { id: 33, src: '/gallery/IMG_7313.jpg' },
  { id: 34, src: '/gallery/IMG_7607.JPG' },
  { id: 35, src: '/gallery/IMG_7671.JPG' },
  { id: 36, src: '/gallery/IMG_7690.JPG' },
  { id: 37, src: '/gallery/IMG_7742.JPG' },
  { id: 38, src: '/gallery/IMG_8207.JPG' },
  { id: 39, src: '/gallery/IMG_8456.JPG' },
  { id: 40, src: '/gallery/IMG_8656.JPG' },
  { id: 41, src: '/gallery/IMG_8717.JPG' },
  { id: 42, src: '/gallery/IMG_8879.JPG' },
  { id: 43, src: '/gallery/IMG_8992.JPG' },
  { id: 44, src: '/gallery/IMG_9647.jpg' },
  { id: 45, src: '/gallery/IMG_9653.jpg' },
  { id: 46, src: '/gallery/IMG_9802.JPG' },
]

function loadSynced() {
  try {
    return JSON.parse(localStorage.getItem('syncedPhotos') || '[]')
  } catch {
    return []
  }
}

function MasonryGrid({ photos, onPhotoClick }) {
  const col1 = photos.filter((_, i) => i % 3 === 0)
  const col2 = photos.filter((_, i) => i % 3 === 1)
  const col3 = photos.filter((_, i) => i % 3 === 2)

  if (photos.length === 0) {
    return <p style={styles.empty}>No photos here yet — hit Sync to pull from Instagram!</p>
  }

  return (
    <div style={styles.grid}>
      {[col1, col2, col3].map((col, ci) => (
        <div key={ci} style={styles.column}>
          {col.map((photo) => (
            <img
              key={photo.id}
              src={photo.src}
              alt={`Memory ${photo.id}`}
              style={styles.photo}
              onClick={() => onPhotoClick(photo)}
            />
          ))}
        </div>
      ))}
    </div>
  )
}

export default function Gallery() {
  const [syncedPhotos, setSyncedPhotos] = useState(loadSynced)
  const [selected, setSelected] = useState(null)
  const [activeTab, setActiveTab] = useState('All')
  const [syncing, setSyncing] = useState(false)
  const [syncMsg, setSyncMsg] = useState(null)

  // Persist synced photos to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('syncedPhotos', JSON.stringify(syncedPhotos))
  }, [syncedPhotos])

  // Derive available section tabs from synced photo locations
  const sections = [...new Set(syncedPhotos.map((p) => p.section).filter(Boolean))].sort()
  const tabs = ['All', ...sections, 'Static']

  function allPhotos() {
    // Static photos don't have a section; synced photos may have one
    return [
      ...STATIC_PHOTOS,
      ...syncedPhotos.map((p) => ({ ...p, id: `ig-${p.id}` })),
    ]
  }

  function tabPhotos() {
    if (activeTab === 'All') return allPhotos()
    if (activeTab === 'Static') return STATIC_PHOTOS
    return syncedPhotos
      .filter((p) => p.section === activeTab)
      .map((p) => ({ ...p, id: `ig-${p.id}` }))
  }

  async function handleSync() {
    setSyncing(true)
    setSyncMsg(null)
    try {
      const syncedIds = syncedPhotos.map((p) => p.id)
      const res = await fetch('/api/instagram-sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ synced_ids: syncedIds }),
      })
      const data = await res.json()

      if (data.setup_required) {
        setSyncMsg({ type: 'warn', text: 'Instagram not configured yet. Check the setup guide.' })
        return
      }
      if (data.error) {
        setSyncMsg({ type: 'error', text: data.error })
        return
      }

      if (data.photos?.length > 0) {
        setSyncedPhotos((prev) => {
          // Merge new photos, avoiding duplicates
          const existingIds = new Set(prev.map((p) => p.id))
          const fresh = data.photos.filter((p) => !existingIds.has(p.id))
          return [...prev, ...fresh]
        })
        setSyncMsg({ type: 'success', text: `Added ${data.photos.length} new photo${data.photos.length > 1 ? 's' : ''}!` })
      } else {
        setSyncMsg({ type: 'success', text: 'Already up to date.' })
      }
    } catch (err) {
      setSyncMsg({ type: 'error', text: err.message })
    } finally {
      setSyncing(false)
    }
  }

  const displayPhotos = tabPhotos()
  const totalCount = allPhotos().length

  return (
    <div style={styles.page}>
      <div style={styles.header}>
        <h1 style={styles.title}>Our Memory Gallery</h1>
        <p style={styles.subtitle}>{totalCount} precious moments together</p>
      </div>

      {/* Sync button */}
      <div style={styles.syncRow}>
        <button style={{ ...styles.syncBtn, opacity: syncing ? 0.7 : 1 }} onClick={handleSync} disabled={syncing}>
          <RefreshCw size={15} style={{ animation: syncing ? 'spin 0.8s linear infinite' : 'none' }} />
          {syncing ? 'Syncing…' : 'Sync from Instagram'}
        </button>
        {syncMsg && (
          <span style={{
            ...styles.syncMsg,
            color: syncMsg.type === 'success' ? '#16a34a' : syncMsg.type === 'warn' ? '#d97706' : '#dc2626',
          }}>
            {syncMsg.text}
          </span>
        )}
      </div>

      {/* Section tabs (only show if there are synced photos with sections) */}
      {sections.length > 0 && (
        <div style={styles.tabs}>
          {tabs.map((tab) => (
            <button
              key={tab}
              style={{
                ...styles.tab,
                background: activeTab === tab ? '#1a2e1a' : 'transparent',
                color: activeTab === tab ? '#fff' : '#555',
                border: activeTab === tab ? 'none' : '1px solid #ddd',
              }}
              onClick={() => setActiveTab(tab)}
            >
              {tab}
            </button>
          ))}
        </div>
      )}

      <MasonryGrid photos={displayPhotos} onPhotoClick={setSelected} />

      {selected && (
        <div style={styles.overlay} onClick={() => setSelected(null)}>
          <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
            <button style={styles.closeBtn} onClick={() => setSelected(null)}>
              <X size={20} />
            </button>
            <img src={selected.src} alt="Memory" style={styles.modalImg} />
            {selected.section && (
              <div style={styles.sectionBadge}>{selected.section}</div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

const styles = {
  page: { padding: '40px 16px 16px', maxWidth: '100%' },
  header: { textAlign: 'center', marginBottom: 24 },
  title: { fontSize: 36, fontWeight: '800', color: '#1a2e1a', marginBottom: 8 },
  subtitle: { color: '#666', fontSize: 15 },
  syncRow: { display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16, justifyContent: 'center' },
  syncBtn: {
    display: 'flex', alignItems: 'center', gap: 7,
    background: '#1a2e1a', color: '#fff', border: 'none',
    borderRadius: 10, padding: '9px 18px', fontSize: 14,
    fontWeight: '600', cursor: 'pointer', transition: 'opacity 0.2s',
  },
  syncMsg: { fontSize: 13, fontWeight: '500' },
  tabs: { display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap', justifyContent: 'center' },
  tab: { padding: '7px 16px', borderRadius: 50, fontSize: 13, fontWeight: '500', cursor: 'pointer', transition: 'all 0.2s' },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, alignItems: 'start' },
  column: { display: 'flex', flexDirection: 'column', gap: 12 },
  photo: { width: '100%', borderRadius: 12, cursor: 'pointer', display: 'block', boxShadow: '0 2px 8px rgba(0,0,0,0.1)', transition: 'transform 0.2s, box-shadow 0.2s' },
  empty: { textAlign: 'center', color: '#888', padding: '48px 0', fontSize: 15 },
  overlay: { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200 },
  modal: { position: 'relative', maxWidth: '85vw', maxHeight: '85vh' },
  modalImg: { maxWidth: '85vw', maxHeight: '85vh', borderRadius: 16, display: 'block', objectFit: 'contain' },
  closeBtn: {
    position: 'absolute', top: -14, right: -14, background: '#fff', border: 'none',
    borderRadius: '50%', width: 32, height: 32, display: 'flex', alignItems: 'center',
    justifyContent: 'center', cursor: 'pointer', boxShadow: '0 2px 8px rgba(0,0,0,0.2)', zIndex: 1,
  },
  sectionBadge: {
    position: 'absolute', bottom: 8, left: '50%', transform: 'translateX(-50%)',
    background: 'rgba(0,0,0,0.6)', color: '#fff', borderRadius: 8, padding: '4px 12px',
    fontSize: 12, fontWeight: '600', whiteSpace: 'nowrap',
  },
}
