import { useNavigate } from 'react-router-dom'
import { Heart, Image, MapPin, CheckSquare } from 'lucide-react'

export default function Home() {
  const navigate = useNavigate()

  return (
    <div style={styles.page}>
      <div style={styles.hero}>
        <div style={styles.heartIcon}>
          <Heart size={64} fill="#16a34a" color="#16a34a" />
        </div>
        <h1 style={styles.title}>Our Love Story</h1>
        <p style={styles.subtitle}>
          A collection of our precious moments, adventures,<br />
          and dreams that make our journey together special.
        </p>
        <div style={styles.buttons}>
          <button style={{ ...styles.btn, background: 'linear-gradient(135deg, #16a34a, #059669)' }} onClick={() => navigate('/gallery')}>
            <Image size={16} />
            View Our Gallery
          </button>
          <button style={{ ...styles.btn, background: 'linear-gradient(135deg, #0284c7, #0369a1)' }} onClick={() => navigate('/places')}>
            <MapPin size={16} />
            Our Places
          </button>
          <button style={{ ...styles.btn, background: 'linear-gradient(135deg, #38bdf8, #0284c7)' }} onClick={() => navigate('/bucket-list')}>
            <CheckSquare size={16} />
            Bucket List
          </button>
        </div>
      </div>
    </div>
  )
}

const styles = {
  page: {
    minHeight: 'calc(100vh - 57px)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  hero: {
    textAlign: 'center',
    padding: '40px 24px',
    maxWidth: 600,
  },
  heartIcon: {
    marginBottom: 24,
    display: 'flex',
    justifyContent: 'center',
  },
  title: {
    fontSize: 48,
    fontWeight: '800',
    color: '#1a2e1a',
    marginBottom: 16,
    letterSpacing: '-1px',
  },
  subtitle: {
    fontSize: 16,
    color: '#555',
    lineHeight: 1.6,
    marginBottom: 36,
  },
  buttons: {
    display: 'flex',
    gap: 12,
    justifyContent: 'center',
    flexWrap: 'wrap',
  },
  btn: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    padding: '12px 22px',
    border: 'none',
    borderRadius: 50,
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
    cursor: 'pointer',
    transition: 'transform 0.15s, opacity 0.15s',
  },
}
