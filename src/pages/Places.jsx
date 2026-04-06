import { useState } from 'react'
import { MapPin, CheckCircle, Heart, X, Pencil, Trash2 } from 'lucide-react'
import WorldMap from '../components/WorldMap'

// ── Default data ─────────────────────────────────────────────────────
const DEFAULT_VISITED = [
  { id: 1,  name: 'New Zealand',      country: 'New Zealand', season: 'Winter 2025',  memory: 'Where we first met and traveled together.' },
  { id: 2,  name: 'Australia',        country: 'Australia',   season: 'Spring 2025',  memory: 'More study abroad and our puppy love era.' },
  { id: 3,  name: 'Atlanta, GA',      country: 'USA',         season: 'Spring 2025',  memory: 'First reached here together, our home base.' },
  { id: 4,  name: 'Maryland / DC',    country: 'USA',         season: 'Spring 2025',  memory: 'Natalie visited my hometown.' },
  { id: 5,  name: 'Savannah, Georgia',country: 'USA',         season: 'Fall 2025',    memory: "I visited Natalie's hometown." },
  { id: 6,  name: 'New York City',    country: 'USA',         season: 'Winter 2025',  memory: 'Our first US trip together in winter wonderland.' },
  { id: 7,  name: 'Boston',           country: 'USA',         season: 'Spring 2026',  memory: 'Natalie visited me here!' },
  { id: 8,  name: 'Costa Rica',       country: 'Costa Rica',  season: 'Spring 2026',  memory: 'A rollercoaster of a trip.' },
]

const DEFAULT_DREAMS = [
  { id: 9,  name: 'Los Angeles',      country: 'USA',         season: 'Summer 2026',  memory: 'I visit Natalie in July and we embark on our road trip.' },
]

function loadFromStorage(key, fallback) {
  try {
    const raw = localStorage.getItem(key)
    return raw ? JSON.parse(raw) : fallback
  } catch { return fallback }
}

function saveToStorage(key, value) {
  try { localStorage.setItem(key, JSON.stringify(value)) } catch {}
}

// ── Component ────────────────────────────────────────────────────────
export default function Places() {
  const [visited, setVisited] = useState(() => loadFromStorage('places_visited', DEFAULT_VISITED))
  const [dreams,  setDreams]  = useState(() => loadFromStorage('places_dreams',  DEFAULT_DREAMS))

  // View popup (existing place)
  const [selected, setSelected] = useState(null)

  // Add popup (new place from map click)
  const [adding, setAdding] = useState(null) // { displayName, countryName }
  const [form, setForm]     = useState({ name: '', season: '', memory: '' })

  function openAdd(payload) {
    setAdding(payload)
    setForm({ name: payload.displayName, season: '', memory: '' })
  }

  function closeAdd() { setAdding(null) }

  // Edit popup
  const [editing, setEditing] = useState(null) // { place, list: 'visited'|'dreams' }
  const [confirmDelete, setConfirmDelete] = useState(false)

  function openEdit(e, place, list) {
    e.stopPropagation()
    setEditing({ place, list })
    setConfirmDelete(false)
    setForm({ name: place.name, season: place.season, memory: place.memory })
  }

  function closeEdit() { setEditing(null); setConfirmDelete(false) }

  function submitEdit() {
    const updated = { ...editing.place, name: form.name.trim() || editing.place.name, season: form.season.trim(), memory: form.memory.trim() }
    if (editing.list === 'visited') {
      const next = visited.map((p) => p.id === updated.id ? updated : p)
      setVisited(next); saveToStorage('places_visited', next)
    } else {
      const next = dreams.map((p) => p.id === updated.id ? updated : p)
      setDreams(next); saveToStorage('places_dreams', next)
    }
    closeEdit()
  }

  function deletePlace(e, id, list) {
    e.stopPropagation()
    if (list === 'visited') {
      const next = visited.filter((p) => p.id !== id)
      setVisited(next); saveToStorage('places_visited', next)
    } else {
      const next = dreams.filter((p) => p.id !== id)
      setDreams(next); saveToStorage('places_dreams', next)
    }
  }

  function submitAdd(list) {
    const newPlace = {
      id: Date.now(),
      name: form.name.trim() || adding.displayName,
      country: adding.countryName,
      season: form.season.trim(),
      memory: form.memory.trim(),
    }
    if (list === 'visited') {
      const next = [...visited, newPlace]
      setVisited(next)
      saveToStorage('places_visited', next)
    } else {
      const next = [...dreams, newPlace]
      setDreams(next)
      saveToStorage('places_dreams', next)
    }
    closeAdd()
  }

  const isVisitedPlace = (place) => visited.some((v) => v.id === place.id)

  return (
    <div className="places-page">
      <div style={styles.header}>
        <h1 style={styles.title}>Our Adventure Map</h1>
        <p style={styles.subtitle}>Places we've explored together and destinations we dream about</p>
      </div>

      <WorldMap
        visitedPlaces={visited}
        onCountryClick={setSelected}
        onAddCountry={openAdd}
      />

      {/* Stats */}
      <div className="places-stats">
        <div style={{ ...styles.stat, background: '#f0fdf4', border: '1px solid #bbf7d0' }}>
          <CheckCircle size={28} color="#16a34a" />
          <span style={{ ...styles.statNum, color: '#16a34a' }}>{visited.length}</span>
          <span style={styles.statLabel}>Places Visited</span>
        </div>
        <div style={{ ...styles.stat, background: '#e0f2fe', border: '1px solid #bae6fd' }}>
          <MapPin size={28} color="#0284c7" />
          <span style={{ ...styles.statNum, color: '#0284c7' }}>{dreams.length}</span>
          <span style={styles.statLabel}>Coming Up</span>
        </div>
        <div style={{ ...styles.stat, background: '#ecfdf5', border: '1px solid #a7f3d0' }}>
          <Heart size={28} color="#059669" />
          <span style={{ ...styles.statNum, color: '#059669' }}>{visited.length + dreams.length}</span>
          <span style={styles.statLabel}>Total Adventures</span>
        </div>
      </div>

      {/* Places We've Been */}
      <section style={styles.section}>
        <h2 style={styles.sectionTitle}>
          <CheckCircle size={20} color="#16a34a" /> Places We've Been
        </h2>
        <div className="places-cards">
          {visited.map((place) => (
            <div key={place.id} style={styles.card} onClick={() => setSelected(place)}>
              <div style={styles.cardHeader}>
                <div>
                  <div style={styles.cardName}>{place.name}</div>
                  <div style={styles.cardCountry}>{place.country}</div>
                </div>
                <div style={styles.cardActions}>
                  <CheckCircle size={18} color="#16a34a" />
                  <button style={styles.iconBtn} onClick={(e) => openEdit(e, place, 'visited')} title="Edit"><Pencil size={14} /></button>
                </div>
              </div>
              <div style={{ ...styles.season, color: '#16a34a' }}>{place.season}</div>
              <div style={styles.memory}>{place.memory}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Coming Up */}
      <section style={styles.section}>
        <h2 style={styles.sectionTitle}>
          <MapPin size={20} color="#0284c7" /> Coming Up
        </h2>
        <div className="places-cards">
          {dreams.map((place) => (
            <div key={place.id} style={styles.card} onClick={() => setSelected(place)}>
              <div style={styles.cardHeader}>
                <div>
                  <div style={styles.cardName}>{place.name}</div>
                  <div style={styles.cardCountry}>{place.country}</div>
                </div>
                <div style={styles.cardActions}>
                  <MapPin size={18} color="#0284c7" />
                  <button style={styles.iconBtn} onClick={(e) => openEdit(e, place, 'dreams')} title="Edit"><Pencil size={14} /></button>
                </div>
              </div>
              <div style={{ ...styles.season, color: '#0284c7' }}>{place.season}</div>
              <div style={styles.memory}>{place.memory}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── View existing place modal ── */}
      {selected && (
        <div style={styles.overlay} onClick={() => setSelected(null)}>
          <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div style={styles.modalHeader}>
              <div>
                <h2 style={styles.modalTitle}>{selected.name}</h2>
                <p style={styles.cardCountry}>{selected.country}</p>
              </div>
              {isVisitedPlace(selected)
                ? <CheckCircle size={24} color="#16a34a" />
                : <MapPin size={24} color="#0284c7" />}
            </div>
            <div style={{ ...styles.season, color: isVisitedPlace(selected) ? '#16a34a' : '#0284c7', marginBottom: 10 }}>
              {selected.season}
            </div>
            <p style={{ color: '#444', fontSize: 15, marginBottom: 24 }}>{selected.memory}</p>
            <button style={styles.closeButton} onClick={() => setSelected(null)}>Close</button>
          </div>
        </div>
      )}

      {/* ── Edit place modal ── */}
      {editing && (
        <div style={styles.overlay} onClick={closeEdit}>
          <div style={{ ...styles.modal, maxWidth: 460 }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
              <div>
                <h2 style={styles.modalTitle}>Edit place</h2>
                <p style={{ fontSize: 13, color: '#888', marginTop: 2 }}>{editing.place.country}</p>
              </div>
              <button style={styles.xBtn} onClick={closeEdit}><X size={18} /></button>
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Place name</label>
              <input style={styles.input} value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} />
            </div>
            <div style={styles.formGroup}>
              <label style={styles.label}>Season / when</label>
              <input style={styles.input} value={form.season} onChange={(e) => setForm((f) => ({ ...f, season: e.target.value }))} placeholder="e.g. Summer 2026" />
            </div>
            <div style={styles.formGroup}>
              <label style={styles.label}>Memory / note</label>
              <textarea style={{ ...styles.input, height: 80, resize: 'vertical' }} value={form.memory} onChange={(e) => setForm((f) => ({ ...f, memory: e.target.value }))} />
            </div>

            <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
              <button style={{ ...styles.actionBtn, background: 'linear-gradient(135deg, #16a34a, #059669)', flex: 2 }} onClick={submitEdit}>
                Save changes
              </button>
              <button style={{ ...styles.actionBtn, background: '#f3f4f6', color: '#ef4444', flex: 1 }} onClick={() => setConfirmDelete(true)}>
                <Trash2 size={15} /> Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Delete confirmation modal ── */}
      {confirmDelete && editing && (
        <div style={{ ...styles.overlay, zIndex: 300 }} onClick={() => setConfirmDelete(false)}>
          <div style={{ ...styles.modal, maxWidth: 380, textAlign: 'center' }} onClick={(e) => e.stopPropagation()}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>🗑️</div>
            <h2 style={{ ...styles.modalTitle, fontSize: 20, marginBottom: 8 }}>Delete this place?</h2>
            <p style={{ color: '#666', fontSize: 14, marginBottom: 24 }}>
              <strong style={{ color: '#1a2e1a' }}>{editing.place.name}</strong> will be permanently removed from your {editing.list === 'visited' ? 'visited places' : 'coming up list'}.
            </p>
            <div style={{ display: 'flex', gap: 10 }}>
              <button
                style={{ ...styles.actionBtn, background: '#f3f4f6', color: '#333', flex: 1 }}
                onClick={() => setConfirmDelete(false)}
              >
                Cancel
              </button>
              <button
                style={{ ...styles.actionBtn, background: 'linear-gradient(135deg, #ef4444, #dc2626)', flex: 1 }}
                onClick={(e) => { deletePlace(e, editing.place.id, editing.list); closeEdit() }}
              >
                <Trash2 size={15} /> Yes, delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Add new place modal ── */}
      {adding && (
        <div style={styles.overlay} onClick={closeAdd}>
          <div style={{ ...styles.modal, maxWidth: 460 }} onClick={(e) => e.stopPropagation()}>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
              <div>
                <h2 style={styles.modalTitle}>Add {adding.displayName}</h2>
                <p style={{ fontSize: 13, color: '#888', marginTop: 2 }}>Tell the story of this place</p>
              </div>
              <button style={styles.xBtn} onClick={closeAdd}><X size={18} /></button>
            </div>

            {/* Form */}
            <div style={styles.formGroup}>
              <label style={styles.label}>Place name</label>
              <input
                style={styles.input}
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                placeholder={adding.displayName}
              />
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Season / when</label>
              <input
                style={styles.input}
                value={form.season}
                onChange={(e) => setForm((f) => ({ ...f, season: e.target.value }))}
                placeholder="e.g. Summer 2026"
              />
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Memory / note</label>
              <textarea
                style={{ ...styles.input, height: 80, resize: 'vertical' }}
                value={form.memory}
                onChange={(e) => setForm((f) => ({ ...f, memory: e.target.value }))}
                placeholder="A little note about this place…"
              />
            </div>

            {/* Two action buttons */}
            <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
              <button
                style={{ ...styles.actionBtn, background: 'linear-gradient(135deg, #16a34a, #059669)' }}
                onClick={() => submitAdd('visited')}
              >
                <CheckCircle size={16} />
                We've been here!
              </button>
              <button
                style={{ ...styles.actionBtn, background: 'linear-gradient(135deg, #0284c7, #0369a1)' }}
                onClick={() => submitAdd('dreams')}
              >
                <MapPin size={16} />
                Coming up!
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

const styles = {
  header: { textAlign: 'center', marginBottom: 36 },
  title: { fontSize: 36, fontWeight: '800', color: '#1a2e1a', marginBottom: 8 },
  subtitle: { color: '#666', fontSize: 15 },
  stat: { borderRadius: 16, padding: '20px 16px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 },
  statNum: { fontSize: 28, fontWeight: '800' },
  statLabel: { fontSize: 13, color: '#555', fontWeight: '500' },
  section: { marginBottom: 32 },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: '#1a2e1a', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 },
  card: { background: 'rgba(255,255,255,0.85)', borderRadius: 14, padding: '16px 18px', border: '1px solid rgba(0,0,0,0.06)', cursor: 'pointer', boxShadow: '0 2px 8px rgba(0,0,0,0.04)', transition: 'box-shadow 0.2s, transform 0.2s' },
  cardHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 },
  cardActions: { display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 },
  iconBtn: { background: 'none', border: 'none', cursor: 'pointer', color: '#aaa', padding: 3, borderRadius: 5, display: 'flex', alignItems: 'center', transition: 'color 0.15s' },
  cardName: { fontWeight: '700', fontSize: 16, color: '#1a2e1a' },
  cardCountry: { fontSize: 13, color: '#888' },
  season: { fontSize: 13, fontWeight: '600', marginBottom: 6 },
  memory: { fontSize: 13, color: '#555', fontStyle: 'italic' },
  overlay: { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200 },
  modal: { background: '#fff', borderRadius: 20, padding: '28px 32px', maxWidth: 420, width: '90%', boxShadow: '0 20px 60px rgba(0,0,0,0.2)' },
  modalHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 },
  modalTitle: { fontSize: 22, fontWeight: '800', color: '#1a2e1a' },
  closeButton: { width: '100%', padding: '12px', background: 'linear-gradient(135deg, #16a34a, #0284c7)', color: '#fff', border: 'none', borderRadius: 50, fontWeight: '600', fontSize: 15, cursor: 'pointer' },
  xBtn: { background: 'none', border: 'none', cursor: 'pointer', color: '#888', padding: 4, borderRadius: 6, display: 'flex', alignItems: 'center' },
  formGroup: { marginBottom: 16 },
  label: { display: 'block', fontSize: 13, fontWeight: '600', color: '#333', marginBottom: 6 },
  input: { width: '100%', padding: '10px 12px', border: '1.5px solid #e5e7eb', borderRadius: 10, fontSize: 14, color: '#1a2e1a', outline: 'none', boxSizing: 'border-box', fontFamily: 'inherit' },
  actionBtn: { flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7, padding: '12px 16px', border: 'none', borderRadius: 50, color: '#fff', fontWeight: '600', fontSize: 14, cursor: 'pointer' },
}
