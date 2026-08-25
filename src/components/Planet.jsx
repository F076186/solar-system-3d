/**
 * Planet component – sphere with atmosphere glow, optional ring system, label,
 * and click-to-select interaction.
 */
import { useRef, useMemo, useState } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { Html, Billboard, Line } from '@react-three/drei'
import * as THREE from 'three'

// ─── Config ──────────────────────────────────────────────────────────────────
export const PLANET_CONFIG = {
  mercury: {
    radius: 0.06,
    color:  '#9d8b70',
    emissive: '#2a1f14',
    atmosphereColor: null,
    rings: null,
  },
  venus: {
    radius: 0.14,
    color:  '#e8cfa0',
    emissive: '#3d2800',
    atmosphereColor: '#f0d070',
    rings: null,
  },
  earth: {
    radius: 0.15,
    color:  '#2a80e0',
    emissive: '#001428',
    atmosphereColor: '#4da6ff',
    rings: null,
  },
  mars: {
    radius: 0.09,
    color:  '#c1440e',
    emissive: '#2a0800',
    atmosphereColor: '#ff8855',
    rings: null,
  },
  jupiter: {
    radius: 0.45,
    color:  '#c88b5a',
    emissive: '#1a0a00',
    atmosphereColor: null,
    rings: null,
    bands: true,
  },
  saturn: {
    radius: 0.38,
    color:  '#e4d191',
    emissive: '#201800',
    atmosphereColor: null,
    rings: { innerR: 0.55, outerR: 0.95, color: '#d4b87a', opacity: 0.7, tilt: 0.47 },
  },
  uranus: {
    radius: 0.25,
    color:  '#7de8e8',
    emissive: '#003333',
    atmosphereColor: '#aaffff',
    rings: { innerR: 0.35, outerR: 0.48, color: '#8ee8e8', opacity: 0.35, tilt: 1.57 },
  },
  neptune: {
    radius: 0.23,
    color:  '#3f54ba',
    emissive: '#000820',
    atmosphereColor: '#6688ff',
    rings: null,
  },
}

// ─── Orbital trail ────────────────────────────────────────────────────────────
function OrbitTrail({ positions }) {
  if (!positions || positions.length < 2) return null
  const pts = positions.map(p => new THREE.Vector3(p.x, p.y, p.z))
  return (
    <Line
      points={pts}
      color="#444466"
      lineWidth={0.5}
      transparent
      opacity={0.35}
      dashed={false}
    />
  )
}

// ─── Atmosphere glow ─────────────────────────────────────────────────────────
function AtmosphereGlow({ radius, color }) {
  const scale = 1.35
  return (
    <Billboard>
      <mesh renderOrder={2}>
        <planeGeometry args={[radius * 2 * scale, radius * 2 * scale]} />
        <meshBasicMaterial
          color={color}
          transparent
          opacity={0.12}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
          side={THREE.FrontSide}
        />
      </mesh>
    </Billboard>
  )
}

// ─── Saturn/Uranus rings ──────────────────────────────────────────────────────
function RingSystem({ config }) {
  const { innerR, outerR, color, opacity, tilt } = config
  return (
    <group rotation={[tilt, 0, 0]}>
      <mesh>
        <ringGeometry args={[innerR, outerR, 128]} />
        <meshBasicMaterial
          color={color}
          transparent
          opacity={opacity}
          side={THREE.DoubleSide}
          depthWrite={false}
        />
      </mesh>
      {/* Second ring band for visual depth */}
      <mesh>
        <ringGeometry args={[innerR * 0.92, innerR * 0.98, 128]} />
        <meshBasicMaterial
          color={color}
          transparent
          opacity={opacity * 0.4}
          side={THREE.DoubleSide}
          depthWrite={false}
        />
      </mesh>
    </group>
  )
}

// ─── Jupiter band material (procedural) ──────────────────────────────────────
function jupiterMaterial() {
  return (
    <meshStandardMaterial
      color="#c88b5a"
      emissive="#1a0a00"
      emissiveIntensity={0.05}
      roughness={0.85}
      metalness={0}
    />
  )
}

// ─── Main Planet component ────────────────────────────────────────────────────
export default function Planet({
  name,
  position,
  showLabels,
  selected,
  onSelect,
  trailPositions,
}) {
  const cfg = PLANET_CONFIG[name]
  if (!cfg) return null

  const meshRef = useRef()
  const [hovered, setHovered] = useState(false)

  // Slow axial rotation
  const rotSpeed = useMemo(() => 0.1 + Math.random() * 0.4, [])
  useFrame((_, delta) => {
    if (meshRef.current) meshRef.current.rotation.y += delta * rotSpeed
  })

  const pos = [position.x, position.y, position.z]
  const { radius, color, emissive, atmosphereColor, rings } = cfg

  const isSelected = selected === name

  // Visual scale up when selected or hovered
  const scale = isSelected ? 1.35 : hovered ? 1.15 : 1

  return (
    <group position={pos}>
      {/* Orbit trail */}
      <OrbitTrail positions={trailPositions} />

      {/* Planet sphere */}
      <mesh
        ref={meshRef}
        scale={[scale, scale, scale]}
        onClick={(e) => { e.stopPropagation(); onSelect(name) }}
        onPointerOver={(e) => { e.stopPropagation(); setHovered(true)  }}
        onPointerOut={() => setHovered(false)}
        castShadow
        receiveShadow
      >
        <sphereGeometry args={[radius, 48, 48]} />
        {name === 'jupiter' ? jupiterMaterial() : (
          <meshStandardMaterial
            color={color}
            emissive={emissive}
            emissiveIntensity={0.08}
            roughness={0.9}
            metalness={0}
          />
        )}
      </mesh>

      {/* Atmosphere */}
      {atmosphereColor && <AtmosphereGlow radius={radius} color={atmosphereColor} />}

      {/* Rings */}
      {rings && <RingSystem config={rings} />}

      {/* Label */}
      {(showLabels || isSelected) && (
        <Html
          center
          position={[0, radius * 1.8 * scale, 0]}
          style={{ pointerEvents: 'none' }}
        >
          <div
            style={{
              color: isSelected ? '#88ddff' : '#aabbcc',
              fontSize: isSelected ? '13px' : '11px',
              fontFamily: 'system-ui, sans-serif',
              textShadow: '0 0 8px rgba(0,120,255,0.8)',
              whiteSpace: 'nowrap',
              fontWeight: isSelected ? 700 : 400,
              letterSpacing: '0.05em',
              userSelect: 'none',
            }}
          >
            {name.charAt(0).toUpperCase() + name.slice(1)}
          </div>
        </Html>
      )}
    </group>
  )
}
