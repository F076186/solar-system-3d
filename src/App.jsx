/**
 * App – root component. Owns simulation state and wires Canvas + UI together.
 */
import { useState, useCallback, useRef } from 'react'
import { Canvas } from '@react-three/fiber'
import * as THREE from 'three'

import SolarSystem from './components/SolarSystem'
import TimeController from './components/TimeController'
import InfoPanel from './components/InfoPanel'

function HelpOverlay({ visible, onDismiss }) {
  if (!visible) return null
  return (
    <div style={{
      position: 'fixed', inset: 0,
      background: 'rgba(0,0,8,0.75)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 200,
      backdropFilter: 'blur(4px)',
    }}>
      <div style={{
        background: 'rgba(6,10,24,0.97)',
        border: '1px solid rgba(80,120,220,0.4)',
        borderRadius: 16,
        padding: '36px 44px',
        maxWidth: 480,
        color: '#cce0ff',
        textAlign: 'center',
      }}>
        <div style={{ fontSize: 28, fontWeight: 700, marginBottom: 8, letterSpacing: '0.04em' }}>
          🪐 Solar System 3D
        </div>
        <div style={{ color: '#667799', fontSize: 13, marginBottom: 24 }}>
          Astronomically accurate VSOP87 orbital positions
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, textAlign: 'left', fontSize: 13 }}>
          {[
            ['🖱 Left drag',    'Rotate view'],
            ['🖱 Right drag',   'Pan'],
            ['🖱 Scroll',       'Zoom in/out'],
            ['🖱 Click planet', 'Select & follow with info panel'],
            ['🏷 Labels',       'Toggle planet name labels'],
            ['⏯ Controls',     'Play/pause, set date, adjust speed'],
          ].map(([k, v]) => (
            <div key={k} style={{ display: 'flex', gap: 16 }}>
              <span style={{ color: '#88aadd', minWidth: 130, fontWeight: 600 }}>{k}</span>
              <span style={{ color: '#aabbcc' }}>{v}</span>
            </div>
          ))}
        </div>
        <button
          onClick={onDismiss}
          style={{
            marginTop: 28,
            background: 'rgba(60,100,220,0.4)',
            border: '1px solid rgba(100,150,255,0.5)',
            borderRadius: 10,
            color: '#ffffff',
            padding: '10px 36px',
            fontSize: 14,
            cursor: 'pointer',
            fontWeight: 600,
          }}
        >
          Explore the solar system →
        </button>
      </div>
    </div>
  )
}

function TopBar({ showLabels, onToggleLabels }) {
  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0,
      height: 52,
      background: 'rgba(4,6,16,0.85)',
      borderBottom: '1px solid rgba(60,80,160,0.2)',
      backdropFilter: 'blur(10px)',
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '0 20px',
      zIndex: 100,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <span style={{ fontSize: 20 }}>🪐</span>
        <span style={{
          color: '#aaccff', fontWeight: 700, fontSize: 16, letterSpacing: '0.08em',
        }}>
          SOLAR SYSTEM 3D
        </span>
        <span style={{ color: '#334466', fontSize: 12, marginLeft: 4 }}>
          VSOP87 · Real orbital positions
        </span>
      </div>
      <div style={{ display: 'flex', gap: 10 }}>
        <button
          onClick={onToggleLabels}
          style={{
            background: showLabels ? 'rgba(60,120,220,0.4)' : 'rgba(20,30,60,0.5)',
            border: `1px solid ${showLabels ? 'rgba(100,160,255,0.5)' : 'rgba(60,80,140,0.3)'}`,
            borderRadius: 8,
            color: showLabels ? '#cce4ff' : '#556688',
            padding: '6px 14px',
            cursor: 'pointer',
            fontSize: 12,
            fontWeight: 600,
          }}
        >
          🏷 Labels {showLabels ? 'ON' : 'OFF'}
        </button>
      </div>
    </div>
  )
}

export default function App() {
  const [simDate,        setSimDate       ] = useState(() => new Date())
  const [playing,        setPlaying       ] = useState(true)
  const [speed,          setSpeed         ] = useState(1000)       // sim-seconds per real-second
  const [selectedPlanet, setSelectedPlanet] = useState(null)
  const [selectedPos,    setSelectedPos   ] = useState(null)
  const [showLabels,     setShowLabels    ] = useState(true)
  const [showHelp,       setShowHelp      ] = useState(true)

  const handleTimeAdvance = useCallback((ms) => {
    setSimDate(prev => new Date(prev.getTime() + ms * speed))
  }, [speed])

  const handleSelectPlanet = useCallback((name) => {
    setSelectedPlanet(name)
    if (!name) setSelectedPos(null)
  }, [])

  return (
    <div style={{ width: '100vw', height: '100vh', background: '#000008', overflow: 'hidden' }}>
      <HelpOverlay visible={showHelp} onDismiss={() => setShowHelp(false)} />
      <TopBar showLabels={showLabels} onToggleLabels={() => setShowLabels(v => !v)} />

      <Canvas
        style={{ position: 'absolute', inset: 0 }}
        camera={{ position: [0, 18, 55], fov: 50, near: 0.01, far: 1000 }}
        gl={{ antialias: true, alpha: false, toneMapping: THREE.ACESFilmicToneMapping, toneMappingExposure: 1.2 }}
        shadows={false}
        onCreated={({ gl }) => {
          gl.setClearColor('#000008')
        }}
      >
        <SolarSystem
          simDate={simDate}
          playing={playing}
          speed={speed}
          selectedPlanet={selectedPlanet}
          showLabels={showLabels}
          onSelectPlanet={handleSelectPlanet}
          onPositionUpdate={setSelectedPos}
          onTimeAdvance={handleTimeAdvance}
        />
      </Canvas>

      <InfoPanel
        planet={selectedPlanet}
        position={selectedPos}
        onClose={() => handleSelectPlanet(null)}
      />

      <TimeController
        simDate={simDate}
        playing={playing}
        speed={speed}
        onDateChange={setSimDate}
        onPlayPause={() => setPlaying(v => !v)}
        onSpeedChange={setSpeed}
      />
    </div>
  )
}
