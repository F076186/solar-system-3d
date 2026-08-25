/**
 * InfoPanel – shown when a planet is selected.
 */
import { ORBITAL_PERIODS, ORBITAL_SPEEDS } from '../engine/orbits'

const AU_TO_KM = 1.496e8

function Row({ label, value }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', gap: 16, padding: '5px 0',
      borderBottom: '1px solid rgba(60,80,140,0.2)' }}>
      <span style={{ color: '#667799', fontSize: 12 }}>{label}</span>
      <span style={{ color: '#cce0ff', fontSize: 12, fontWeight: 600, fontFamily: 'monospace' }}>{value}</span>
    </div>
  )
}

export default function InfoPanel({ planet, position, onClose }) {
  if (!planet) return null

  const distAU   = position ? Math.sqrt(position.x ** 2 + position.y ** 2 + position.z ** 2) : null
  const distKM   = distAU ? (distAU * AU_TO_KM).toLocaleString('en-US', { maximumFractionDigits: 0 }) + ' km' : '—'
  const distAUFmt = distAU ? distAU.toFixed(3) + ' AU' : '—'
  const period   = ORBITAL_PERIODS[planet]
  const speed    = ORBITAL_SPEEDS[planet]

  const PLANET_FACTS = {
    mercury: { type: 'Rocky', moons: 0,   diameter: '4,879 km' },
    venus:   { type: 'Rocky', moons: 0,   diameter: '12,104 km' },
    earth:   { type: 'Rocky', moons: 1,   diameter: '12,742 km' },
    mars:    { type: 'Rocky', moons: 2,   diameter: '6,779 km' },
    jupiter: { type: 'Gas giant', moons: 95,  diameter: '139,820 km' },
    saturn:  { type: 'Gas giant', moons: 146, diameter: '116,460 km' },
    uranus:  { type: 'Ice giant', moons: 28,  diameter: '50,724 km' },
    neptune: { type: 'Ice giant', moons: 16,  diameter: '49,244 km' },
  }
  const facts = PLANET_FACTS[planet] || {}

  return (
    <div style={{
      position: 'fixed', top: 80, right: 24,
      width: 260,
      background: 'rgba(8,10,22,0.88)',
      border: '1px solid rgba(80,120,220,0.35)',
      borderRadius: 14,
      padding: '18px 20px',
      backdropFilter: 'blur(12px)',
      boxShadow: '0 8px 40px rgba(0,0,0,0.8)',
      zIndex: 100,
      color: '#cce0ff',
    }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
        <div>
          <div style={{ fontSize: 20, fontWeight: 700, letterSpacing: '0.04em' }}>
            {planet.charAt(0).toUpperCase() + planet.slice(1)}
          </div>
          <div style={{ fontSize: 11, color: '#556688', marginTop: 2 }}>{facts.type || 'Planet'}</div>
        </div>
        <button
          onClick={onClose}
          style={{
            background: 'rgba(60,30,30,0.5)',
            border: '1px solid rgba(200,60,60,0.3)',
            borderRadius: 6,
            color: '#ff8888',
            width: 28, height: 28,
            cursor: 'pointer',
            fontSize: 14,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}
        >×</button>
      </div>

      {/* Data rows */}
      <Row label="Distance from Sun" value={distAUFmt} />
      <Row label="Distance (km)" value={distKM} />
      <Row label="Orbital period" value={period ? `${period} years` : '—'} />
      <Row label="Orbital speed" value={speed ? `${speed} km/s` : '—'} />
      <Row label="Diameter" value={facts.diameter || '—'} />
      <Row label="Moons" value={facts.moons !== undefined ? facts.moons : '—'} />

      {/* Hint */}
      <div style={{ marginTop: 12, fontSize: 10, color: '#334455', textAlign: 'center' }}>
        Camera following · click elsewhere to deselect
      </div>
    </div>
  )
}
