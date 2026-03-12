import { NavLink } from 'react-router-dom'
import { Heart } from 'lucide-react'

export default function Navbar() {
  return (
    <nav style={styles.nav}>
      <NavLink to="/" style={styles.brand}>
        <Heart size={18} fill="#16a34a" color="#16a34a" />
        <span style={styles.brandText}>Our Story</span>
      </NavLink>
      <div style={styles.links}>
        {[
          { to: '/', label: 'Home' },
          { to: '/gallery', label: 'Gallery' },
          { to: '/places', label: 'Our Places' },
          { to: '/bucket-list', label: 'Bucket List' },
        ].map(({ to, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            style={({ isActive }) => ({
              ...styles.link,
              color: isActive ? '#16a34a' : '#555',
              fontWeight: isActive ? '600' : '400',
            })}
          >
            {label}
          </NavLink>
        ))}
      </div>
    </nav>
  )
}

const styles = {
  nav: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '14px 32px',
    background: 'rgba(255,255,255,0.85)',
    backdropFilter: 'blur(10px)',
    borderBottom: '1px solid rgba(22,163,74,0.1)',
    position: 'sticky',
    top: 0,
    zIndex: 100,
  },
  brand: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    textDecoration: 'none',
  },
  brandText: {
    fontWeight: '700',
    fontSize: 16,
    color: '#16a34a',
  },
  links: {
    display: 'flex',
    gap: 28,
  },
  link: {
    textDecoration: 'none',
    fontSize: 14,
    transition: 'color 0.2s',
  },
}
