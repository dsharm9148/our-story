import { useState } from 'react'
import { MapPin, CheckCircle, Heart } from 'lucide-react'

const visited = [
  {
    id: 1,
    name: 'New Zealand',
    country: 'New Zealand',
    season: 'Winter 2025',
    memory: 'Where we first met and traveled together.',
  },
  {
    id: 2,
    name: 'Australia',
    country: 'Australia',
    season: 'Spring 2025',
    memory: 'More study abroad and our puppy love era.',
  },
  {
    id: 3,
    name: 'Atlanta, GA',
    country: 'USA',
    season: 'Spring 2025',
    memory: 'First reached here together, our home base.',
  },
  {
    id: 4,
    name: 'Maryland / DC',
    country: 'USA',
    season: 'Spring 2025',
    memory: 'Natalie visited my hometown.',
  },
  {
    id: 5,
    name: 'Savannah, Georgia',
    country: 'USA',
    season: 'Fall 2025',
    memory: "I visited Natalie's hometown.",
  },
  {
    id: 6,
    name: 'New York City',
    country: 'USA',
    season: 'Winter 2025',
    memory: 'Our first US trip together in winter wonderland.',
  },
  {
    id: 7,
    name: 'Boston',
    country: 'USA',
    season: 'Spring 2026',
    memory: 'Natalie visited me here!',
  },
]

const dreams = [
  {
    id: 8,
    name: 'Costa Rica',
    country: 'Costa Rica',
    season: 'Spring 2026',
    memory: 'Our first international trip together since study abroad.',
  },
  {
    id: 9,
    name: 'Los Angeles',
    country: 'USA',
    season: 'Summer 2026',
    memory: 'I visit Natalie in July and we embark on our road trip.',
  },
]

export default function Places() {
  const [selected, setSelected] = useState(null)

  return (
    <div className="places-page">
      <div style={styles.header}>
        <h1 style={styles.title}>Our Adventure Map</h1>
        <p style={styles.subtitle}>Places we've explored together and destinations we dream about</p>
      </div>

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
                <CheckCircle size={20} color="#16a34a" />
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
                <MapPin size={20} color="#0284c7" />
              </div>
              <div style={{ ...styles.season, color: '#0284c7' }}>{place.season}</div>
              <div style={styles.memory}>{place.memory}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Modal */}
      {selected && (
        <div style={styles.overlay} onClick={() => setSelected(null)}>
          <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div style={styles.modalHeader}>
              <div>
                <h2 style={styles.modalTitle}>{selected.name}</h2>
                <p style={styles.cardCountry}>{selected.country}</p>
              </div>
              {visited.find(v => v.id === selected.id)
                ? <CheckCircle size={24} color="#16a34a" />
                : <MapPin size={24} color="#0284c7" />}
            </div>
            <div style={{ ...styles.season, color: visited.find(v => v.id === selected.id) ? '#16a34a' : '#0284c7', marginBottom: 10 }}>
              {selected.season}
            </div>
            <p style={{ color: '#444', fontSize: 15, marginBottom: 24 }}>{selected.memory}</p>
            <button style={styles.closeButton} onClick={() => setSelected(null)}>Close</button>
          </div>
        </div>
      )}
    </div>
  )
}

const styles = {
  page: {},
  header: { textAlign: 'center', marginBottom: 36 },
  title: { fontSize: 36, fontWeight: '800', color: '#1a2e1a', marginBottom: 8 },
  subtitle: { color: '#666', fontSize: 15 },
  stats: { marginBottom: 40 },
  stat: { borderRadius: 16, padding: '20px 16px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 },
  statNum: { fontSize: 28, fontWeight: '800' },
  statLabel: { fontSize: 13, color: '#555', fontWeight: '500' },
  section: { marginBottom: 32 },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: '#1a2e1a', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 },
  cards: {},
  card: { background: 'rgba(255,255,255,0.85)', borderRadius: 14, padding: '16px 18px', border: '1px solid rgba(0,0,0,0.06)', cursor: 'pointer', boxShadow: '0 2px 8px rgba(0,0,0,0.04)', transition: 'box-shadow 0.2s, transform 0.2s' },
  cardHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 },
  cardName: { fontWeight: '700', fontSize: 16, color: '#1a2e1a' },
  cardCountry: { fontSize: 13, color: '#888' },
  season: { fontSize: 13, fontWeight: '600', marginBottom: 6 },
  memory: { fontSize: 13, color: '#555', fontStyle: 'italic' },
  overlay: { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200 },
  modal: { background: '#fff', borderRadius: 20, padding: '28px 32px', maxWidth: 420, width: '90%', boxShadow: '0 20px 60px rgba(0,0,0,0.2)' },
  modalHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 },
  modalTitle: { fontSize: 22, fontWeight: '800', color: '#1a2e1a' },
  closeButton: { width: '100%', padding: '12px', background: 'linear-gradient(135deg, #16a34a, #0284c7)', color: '#fff', border: 'none', borderRadius: 50, fontWeight: '600', fontSize: 15, cursor: 'pointer' },
}
