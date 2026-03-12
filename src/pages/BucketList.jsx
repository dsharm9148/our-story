import { useState } from 'react'
import { Sparkles, Heart, Star, Zap } from 'lucide-react'

const ITEMS = [
  { id: 1, title: 'Watch the Northern Lights Together', desc: 'Bundle up and witness nature\'s most magical light show in Iceland or Norway', category: 'Adventure', icon: <Sparkles size={16} /> },
  { id: 2, title: 'Learn to Dance Together', desc: 'Take salsa or ballroom dancing classes and dance the night away', category: 'Experience', icon: <Heart size={16} /> },
  { id: 3, title: 'Build Our Dream Home', desc: 'Design and create a space that\'s uniquely ours', category: 'Milestone', icon: <Star size={16} /> },
  { id: 4, title: 'Volunteer Together', desc: 'Make a difference in our community and grow closer through giving back', category: 'Milestone', icon: <Star size={16} /> },
  { id: 5, title: 'Cook a 5-Course Meal Together', desc: 'Spend an entire day creating a culinary masterpiece from scratch', category: 'Experience', icon: <Heart size={16} /> },
  { id: 6, title: 'Learn a Language Together', desc: 'Learn conversational French or Spanish and use it on our travels', category: 'Experience', icon: <Heart size={16} /> },
  { id: 7, title: 'Go on a Safari', desc: 'Witness the Big Five in their natural habitat in Africa', category: 'Adventure', icon: <Sparkles size={16} /> },
  { id: 8, title: 'Hike a Major Mountain', desc: 'Conquer a summit together and celebrate at the top', category: 'Adventure', icon: <Sparkles size={16} /> },
  { id: 9, title: 'Travel to 10 Countries Together', desc: 'Collect stamps and memories from around the world', category: 'Dream', icon: <Zap size={16} /> },
  { id: 10, title: 'Write Our Love Story', desc: 'Document our journey in a beautiful book for us to keep forever', category: 'Dream', icon: <Zap size={16} /> },
]

const CATEGORY_COLORS = {
  Adventure: { bg: '#f0fdf4', color: '#16a34a', border: '#bbf7d0' },
  Experience: { bg: '#e0f2fe', color: '#0284c7', border: '#bae6fd' },
  Milestone: { bg: '#ecfdf5', color: '#059669', border: '#a7f3d0' },
  Dream: { bg: '#dbeafe', color: '#2563eb', border: '#bfdbfe' },
}

const TABS = ['All', 'Adventure', 'Milestone', 'Experience', 'Dream']

export default function BucketList() {
  const [checked, setChecked] = useState(new Set())
  const [activeTab, setActiveTab] = useState('All')

  const toggle = (id) => {
    setChecked((prev) => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  const filtered = activeTab === 'All' ? ITEMS : ITEMS.filter((i) => i.category === activeTab)
  const count = (cat) => ITEMS.filter((i) => i.category === cat).length
  const progress = checked.size
  const pct = Math.round((progress / ITEMS.length) * 100)

  return (
    <div style={styles.page}>
      <div style={styles.header}>
        <div style={styles.headerIcon}>✅</div>
        <h1 style={styles.title}>Our Bucket List</h1>
        <p style={styles.subtitle}>Dreams we'll make come true together</p>
      </div>

      {/* Progress */}
      <div style={styles.progressCard}>
        <div style={styles.progressRow}>
          <span style={styles.progressLabel}>Our Progress</span>
          <span style={styles.progressCount}>{progress} / {ITEMS.length}</span>
        </div>
        <div style={styles.progressBar}>
          <div style={{ ...styles.progressFill, width: `${pct}%` }} />
        </div>
        <div style={styles.progressText}>{pct}% of our dreams achieved!</div>
      </div>

      {/* Tabs */}
      <div style={styles.tabs}>
        {TABS.map((tab) => {
          const n = tab === 'All' ? ITEMS.length : count(tab)
          return (
            <button
              key={tab}
              style={{
                ...styles.tab,
                background: activeTab === tab ? '#1a1a2e' : 'transparent',
                color: activeTab === tab ? '#fff' : '#555',
                border: activeTab === tab ? 'none' : '1px solid #ddd',
              }}
              onClick={() => setActiveTab(tab)}
            >
              {tab === 'Adventure' && '✨ '}
              {tab === 'Milestone' && '⭐ '}
              {tab === 'Experience' && '♥ '}
              {tab === 'Dream' && '✨ '}
              {tab} ({n})
            </button>
          )
        })}
      </div>

      {/* Items */}
      <div style={styles.list}>
        {filtered.map((item) => {
          const done = checked.has(item.id)
          const catStyle = CATEGORY_COLORS[item.category]
          return (
            <div key={item.id} style={{ ...styles.item, opacity: done ? 0.6 : 1 }}>
              <button
                style={{ ...styles.circle, borderColor: done ? '#10b981' : '#ccc', background: done ? '#10b981' : 'transparent' }}
                onClick={() => toggle(item.id)}
              >
                {done && <span style={{ color: '#fff', fontSize: 12 }}>✓</span>}
              </button>
              <div style={styles.itemBody}>
                <div style={styles.itemHeader}>
                  <span style={{ ...styles.itemTitle, textDecoration: done ? 'line-through' : 'none' }}>{item.title}</span>
                  <span style={{ color: catStyle.color }}>{item.icon}</span>
                </div>
                <p style={styles.itemDesc}>{item.desc}</p>
                <span style={{ ...styles.tag, background: catStyle.bg, color: catStyle.color, border: `1px solid ${catStyle.border}` }}>
                  {item.category}
                </span>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

const styles = {
  page: {
    padding: '40px 32px',
    maxWidth: 720,
    margin: '0 auto',
  },
  header: {
    textAlign: 'center',
    marginBottom: 32,
  },
  headerIcon: {
    fontSize: 36,
    marginBottom: 12,
  },
  title: {
    fontSize: 36,
    fontWeight: '800',
    color: '#1a2e1a',
    marginBottom: 8,
  },
  subtitle: {
    color: '#777',
    fontSize: 15,
  },
  progressCard: {
    background: 'rgba(255,255,255,0.9)',
    borderRadius: 16,
    padding: '20px 24px',
    marginBottom: 24,
    boxShadow: '0 2px 12px rgba(0,0,0,0.05)',
  },
  progressRow: {
    display: 'flex',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  progressLabel: {
    fontWeight: '700',
    fontSize: 15,
    color: '#1a2e1a',
  },
  progressCount: {
    fontWeight: '800',
    fontSize: 15,
    color: '#0284c7',
  },
  progressBar: {
    height: 8,
    background: '#e5e7eb',
    borderRadius: 50,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    background: 'linear-gradient(90deg, #16a34a, #38bdf8)',
    borderRadius: 50,
    transition: 'width 0.4s ease',
  },
  progressText: {
    fontSize: 12,
    color: '#888',
    textAlign: 'center',
  },
  tabs: {
    display: 'flex',
    gap: 8,
    marginBottom: 20,
    flexWrap: 'wrap',
  },
  tab: {
    padding: '7px 14px',
    borderRadius: 50,
    fontSize: 13,
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  list: {
    display: 'flex',
    flexDirection: 'column',
    gap: 12,
  },
  item: {
    background: 'rgba(255,255,255,0.9)',
    borderRadius: 14,
    padding: '16px 18px',
    display: 'flex',
    gap: 14,
    alignItems: 'flex-start',
    boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
    transition: 'opacity 0.3s',
  },
  circle: {
    width: 24,
    height: 24,
    borderRadius: '50%',
    border: '2px solid #ccc',
    cursor: 'pointer',
    flexShrink: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
    transition: 'all 0.2s',
  },
  itemBody: {
    flex: 1,
  },
  itemHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 4,
  },
  itemTitle: {
    fontWeight: '600',
    fontSize: 15,
    color: '#1a2e1a',
  },
  itemDesc: {
    fontSize: 13,
    color: '#666',
    marginBottom: 8,
  },
  tag: {
    display: 'inline-block',
    padding: '3px 10px',
    borderRadius: 50,
    fontSize: 11,
    fontWeight: '600',
  },
}
