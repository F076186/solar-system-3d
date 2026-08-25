/**
 * TimeController – date picker, play/pause, speed multiplier.
 */

const SPEEDS = [
  { label: '1×',       value: 1 },
  { label: '10×',      value: 10 },
  { label: '100×',     value: 100 },
  { label: '1k×',      value: 1000 },
  { label: '10k×',     value: 10000 },
  { label: '100k×',    value: 100000 },
]

export default function TimeController({ simDate, playing, speed, onDateChange, onPlayPause, onSpeedChange }) {
  const fmt = (d) => {
    const y = d.getUTCFullYear().toString().padStart(4, '0')
    const m = (d.getUTCMonth() + 1).toString().padStart(2, '0')
    const day = d.getUTCDate().toString().padStart(2, '0')
    return `${y}-${m}-${day}`
  }

  const handleDate = (e) => {
    const parts = e.target.value.split('-')
    if (parts.length !== 3) return
    const nd = new Date(Date.UTC(+parts[0], +parts[1] - 1, +parts[2]))
    if (!isNaN(nd)) onDateChange(nd)
  }

  return (
    <div style={{
      position: 'fixed', bottom: 24, left: '50%', transform: 'translateX(-50%)',
      background: 'rgba(8,10,20,0.85)',
      border: '1px solid rgba(80,120,200,0.3)',
      borderRadius: 12,
      padding: '12px 20px',
      display: 'flex', alignItems: 'center', gap: 14,
      backdropFilter: 'blur(10px)',
      boxShadow: '0 4px 32px rgba(0,0,0,0.7)',
      zIndex: 100,
      flexWrap: 'wrap',
      justifyContent: 'center',
    }}>
      {/* Play / Pause */}
      <button
        onClick={onPlayPause}
        title={playing ? 'Pause' : 'Play'}
        style={{
          background: 'rgba(60,100,200,0.3)',
          border: '1px solid rgba(80,140,255,0.4)',
          borderRadius: 8,
          color: '#aaddff',
          width: 36, height: 36,
          cursor: 'pointer',
          fontSize: 16,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}
      >
        {playing ? '⏸' : '▶'}
      </button>

      {/* Date picker */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
        <span style={{ fontSize: 9, color: '#6688aa', letterSpacing: '0.1em', textTransform: 'uppercase' }}>Date</span>
        <input
          type="date"
          value={fmt(simDate)}
          onChange={handleDate}
          style={{
            background: 'rgba(20,30,60,0.8)',
            border: '1px solid rgba(80,120,200,0.4)',
            borderRadius: 6,
            color: '#cce4ff',
            padding: '4px 8px',
            fontSize: 13,
            fontFamily: 'system-ui, monospace',
            cursor: 'pointer',
          }}
        />
      </div>

      {/* Reset to now */}
      <button
        onClick={() => onDateChange(new Date())}
        title="Jump to now"
        style={{
          background: 'rgba(30,60,20,0.4)',
          border: '1px solid rgba(60,180,60,0.4)',
          borderRadius: 8,
          color: '#88ff88',
          padding: '6px 10px',
          cursor: 'pointer',
          fontSize: 11,
          whiteSpace: 'nowrap',
        }}
      >
        Now
      </button>

      {/* Speed buttons */}
      <div style={{ display: 'flex', gap: 4, alignItems: 'center', flexWrap: 'wrap', justifyContent: 'center' }}>
        <span style={{ fontSize: 9, color: '#6688aa', letterSpacing: '0.1em', marginRight: 2 }}>SPEED</span>
        {SPEEDS.map(s => (
          <button
            key={s.value}
            onClick={() => onSpeedChange(s.value)}
            style={{
              background: speed === s.value ? 'rgba(60,130,255,0.5)' : 'rgba(20,30,60,0.6)',
              border: `1px solid ${speed === s.value ? 'rgba(80,160,255,0.8)' : 'rgba(60,80,140,0.4)'}`,
              borderRadius: 6,
              color: speed === s.value ? '#ffffff' : '#8899bb',
              padding: '4px 8px',
              cursor: 'pointer',
              fontSize: 11,
              fontWeight: speed === s.value ? 700 : 400,
              minWidth: 36,
            }}
          >
            {s.label}
          </button>
        ))}
      </div>

      {/* Current date display */}
      <div style={{
        fontSize: 11, color: '#556688',
        fontFamily: 'monospace',
        marginLeft: 4,
        minWidth: 90,
        textAlign: 'center',
      }}>
        {simDate.getUTCFullYear()}-
        {String(simDate.getUTCMonth() + 1).padStart(2, '0')}-
        {String(simDate.getUTCDate()).padStart(2, '0')}
        &nbsp;
        {String(simDate.getUTCHours()).padStart(2, '0')}:
        {String(simDate.getUTCMinutes()).padStart(2, '0')} UTC
      </div>
    </div>
  )
}
