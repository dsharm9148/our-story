import { useState } from 'react'
import { X } from 'lucide-react'

const photos = [
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

export default function Gallery() {
  const [selected, setSelected] = useState(null)

  const col1 = photos.filter((_, i) => i % 3 === 0)
  const col2 = photos.filter((_, i) => i % 3 === 1)
  const col3 = photos.filter((_, i) => i % 3 === 2)

  return (
    <div style={styles.page}>
      <div style={styles.header}>
        <h1 style={styles.title}>Our Memory Gallery</h1>
        <p style={styles.subtitle}>{photos.length} precious moments together</p>
      </div>

      <div style={styles.grid}>
        {[col1, col2, col3].map((col, ci) => (
          <div key={ci} style={styles.column}>
            {col.map((photo) => (
              <img
                key={photo.id}
                src={photo.src}
                alt={`Memory ${photo.id}`}
                style={styles.photo}
                onClick={() => setSelected(photo)}
              />
            ))}
          </div>
        ))}
      </div>

      {selected && (
        <div style={styles.overlay} onClick={() => setSelected(null)}>
          <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
            <button style={styles.closeBtn} onClick={() => setSelected(null)}>
              <X size={20} />
            </button>
            <img src={selected.src} alt="Memory" style={styles.modalImg} />
          </div>
        </div>
      )}
    </div>
  )
}

const styles = {
  page: {
    padding: '40px 32px',
    maxWidth: 960,
    margin: '0 auto',
  },
  header: {
    textAlign: 'center',
    marginBottom: 36,
  },
  title: {
    fontSize: 36,
    fontWeight: '800',
    color: '#1a2e1a',
    marginBottom: 8,
  },
  subtitle: {
    color: '#666',
    fontSize: 15,
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: 12,
    alignItems: 'start',
  },
  column: {
    display: 'flex',
    flexDirection: 'column',
    gap: 12,
  },
  photo: {
    width: '100%',
    borderRadius: 12,
    cursor: 'pointer',
    display: 'block',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
    transition: 'transform 0.2s, box-shadow 0.2s',
  },
  overlay: {
    position: 'fixed',
    inset: 0,
    background: 'rgba(0,0,0,0.8)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 200,
  },
  modal: {
    position: 'relative',
    maxWidth: '85vw',
    maxHeight: '85vh',
  },
  modalImg: {
    maxWidth: '85vw',
    maxHeight: '85vh',
    borderRadius: 16,
    display: 'block',
    objectFit: 'contain',
  },
  closeBtn: {
    position: 'absolute',
    top: -14,
    right: -14,
    background: '#fff',
    border: 'none',
    borderRadius: '50%',
    width: 32,
    height: 32,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
    zIndex: 1,
  },
}
