import { useNavigate } from 'react-router-dom'
import { Image, MapPin, CheckSquare } from 'lucide-react'

export default function Home() {
  const navigate = useNavigate()

  return (
    <div style={styles.page}>
      {/* Full image — natural height, scrollable */}
      <img src="/gallery/IMG_8456.JPG" alt="Natalie and Diya" style={styles.photo} />
      <div style={styles.overlay} />

      {/* Content pinned to top of image */}
      <div style={styles.content}>
        <h1 style={styles.title}>Natalie and Diya's Website :)</h1>
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
    position: 'relative',
    width: '100%',
  },
  photo: {
    display: 'block',
    width: '100%',
    height: 'auto',
  },
  overlay: {
    position: 'absolute',
    inset: 0,
    background: 'linear-gradient(to bottom, rgba(0,0,0,0.45) 0%, rgba(0,0,0,0.1) 50%, rgba(0,0,0,0) 100%)',
  },
  content: {
    position: 'absolute',
    top: '5%',
    left: '50%',
    transform: 'translateX(-50%)',
    zIndex: 2,
    textAlign: 'center',
    width: '100%',
    padding: '0 24px',
    maxWidth: 620,
  },
  title: {
    fontSize: 48,
    fontWeight: '800',
    color: '#fff',
    marginBottom: 16,
    letterSpacing: '-1px',
    textShadow: '0 2px 12px rgba(0,0,0,0.4)',
  },
  subtitle: {
    fontSize: 17,
    color: 'rgba(255,255,255,0.9)',
    lineHeight: 1.6,
    marginBottom: 36,
    textShadow: '0 1px 6px rgba(0,0,0,0.3)',
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
    boxShadow: '0 4px 14px rgba(0,0,0,0.25)',
  },
}
