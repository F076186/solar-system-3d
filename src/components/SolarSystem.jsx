/**
 * SolarSystem – main 3D scene.
 * Handles time simulation, position updates, camera follow, and assembles all bodies.
 */
import { useRef, useState, useEffect, useCallback, useMemo } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import * as THREE from 'three'

import Sun from './Sun'
import Planet from './Planet'
import Moon from './Moon'
import Starfield from './Starfield'
import {
  dateToJDE,
  getAllPositions,
  getMoonPositionRelativeToEarth,
  getMoonPosition,
} from '../engine/orbits'

// Scale factor: 1 AU → N Three.js units
const AU_SCALE = 12

// Number of trail points per planet
const TRAIL_LEN = 220

const PLANETS = ['mercury', 'venus', 'earth', 'mars', 'jupiter', 'saturn', 'uranus', 'neptune']

const MOONS_BY_PARENT = {
  earth:   ['moon'],
  jupiter: ['io', 'europa', 'ganymede', 'callisto'],
  saturn:  ['titan'],
  uranus:  ['titania'],
  neptune: ['triton'],
}

function scalePos(pos) {
  return { x: pos.x * AU_SCALE, y: pos.y * AU_SCALE, z: pos.z * AU_SCALE }
}

// ─── Camera follower ──────────────────────────────────────────────────────────
function CameraFollower({ target, controlsRef }) {
  const { camera } = useThree()
  const lastTarget = useRef(null)

  useFrame(() => {
    if (!target || !controlsRef.current) return

    const t = new THREE.Vector3(target.x, target.y, target.z)

    // Smoothly move controls target
    controlsRef.current.target.lerp(t, 0.05)

    if (!lastTarget.current) {
      lastTarget.current = t.clone()
    }

    lastTarget.current.copy(t)
  })

  return null
}

export default function SolarSystem({
  simDate,
  playing,
  speed,
  selectedPlanet,
  showLabels,
  onSelectPlanet,
  onPositionUpdate,
  onTimeAdvance,
}) {
  const controlsRef = useRef()

  // Memoised initial positions
  const [positions, setPositions] = useState(() => {
    const jde = dateToJDE(simDate)
    const raw = getAllPositions(jde)
    const scaled = {}
    for (const [k, v] of Object.entries(raw)) scaled[k] = scalePos(v)
    return scaled
  })

  // Trail circular buffers: planet → [{x,y,z}]
  const trails = useRef({})

  useEffect(() => {
    // Initialise trail buffers
    for (const p of PLANETS) {
      if (!trails.current[p]) trails.current[p] = []
    }
  }, [])

  // Accumulate wall-clock time delta for simulation
  const accum = useRef(0)

  useFrame((_, delta) => {
    if (!playing) return

    // seconds-per-frame in simulation time
    accum.current += delta * speed
    if (accum.current < 0.016) return // batch updates at ~60fps sim pace

    // Advance simulation date
    const simDeltaMs = accum.current * 1000
    accum.current = 0

    onTimeAdvance(simDeltaMs)
  })

  // Recompute positions when simDate changes
  useEffect(() => {
    const jde = dateToJDE(simDate)
    const raw = getAllPositions(jde)
    const scaled = {}
    for (const [k, v] of Object.entries(raw)) scaled[k] = scalePos(v)
    setPositions(scaled)

    // Update trails
    for (const p of PLANETS) {
      if (!trails.current[p]) trails.current[p] = []
      trails.current[p].push({ ...scaled[p] })
      if (trails.current[p].length > TRAIL_LEN) trails.current[p].shift()
    }

    if (selectedPlanet && scaled[selectedPlanet]) {
      onPositionUpdate(scaled[selectedPlanet])
    }
  }, [simDate])

  // Moon positions (relative + absolute)
  const moonPositions = useMemo(() => {
    const jde = dateToJDE(simDate)
    const result = {}
    for (const [parent, moons] of Object.entries(MOONS_BY_PARENT)) {
      for (const moonName of moons) {
        const relRaw = moonName === 'moon'
          ? getMoonPositionRelativeToEarth(jde)
          : getMoonPosition(moonName, jde)
        const relScaled = scalePos(relRaw)
        result[moonName] = { relative: relScaled, parent }
      }
    }
    return result
  }, [simDate])

  const followTarget = selectedPlanet && positions[selectedPlanet]
    ? positions[selectedPlanet]
    : null

  return (
    <>
      <ambientLight intensity={0.05} color="#112233" />

      <OrbitControls
        ref={controlsRef}
        enablePan
        enableZoom
        enableRotate
        minDistance={1}
        maxDistance={250}
        zoomSpeed={1.2}
        rotateSpeed={0.6}
        panSpeed={0.8}
        mouseButtons={{
          LEFT: THREE.MOUSE.ROTATE,
          MIDDLE: THREE.MOUSE.DOLLY,
          RIGHT: THREE.MOUSE.PAN,
        }}
      />

      {followTarget && (
        <CameraFollower target={followTarget} controlsRef={controlsRef} />
      )}

      <Starfield count={8000} />

      <Sun position={[0, 0, 0]} />

      {/* Background click → deselect */}
      <mesh
        position={[0, 0, 0]}
        onClick={() => onSelectPlanet(null)}
        visible={false}
      >
        <sphereGeometry args={[400, 8, 8]} />
        <meshBasicMaterial side={THREE.BackSide} />
      </mesh>

      {PLANETS.map((name) => (
        <Planet
          key={name}
          name={name}
          position={positions[name] || { x: 0, y: 0, z: 0 }}
          showLabels={showLabels}
          selected={selectedPlanet}
          onSelect={onSelectPlanet}
          trailPositions={trails.current[name] || []}
        />
      ))}

      {/* Moons */}
      {Object.entries(moonPositions).map(([moonName, { relative, parent }]) => {
        const parentPos = positions[parent] || { x: 0, y: 0, z: 0 }
        return (
          <Moon
            key={moonName}
            name={moonName}
            relativePosition={relative}
            parentPosition={parentPos}
          />
        )
      })}
    </>
  )
}
