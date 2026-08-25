/**
 * Moon component – small sphere orbiting its parent planet.
 */
import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'

const MOON_CONFIG = {
  moon:     { radius: 0.035, color: '#c8c8c0' },
  io:       { radius: 0.028, color: '#ddc840' },
  europa:   { radius: 0.026, color: '#c8a870' },
  ganymede: { radius: 0.038, color: '#a09080' },
  callisto: { radius: 0.034, color: '#706050' },
  titan:    { radius: 0.036, color: '#d0900a' },
  titania:  { radius: 0.024, color: '#909898' },
  triton:   { radius: 0.030, color: '#a0b8c8' },
}

export default function Moon({ name, relativePosition, parentPosition }) {
  const cfg = MOON_CONFIG[name] || { radius: 0.025, color: '#aaaaaa' }
  const meshRef = useRef()

  useFrame((_, delta) => {
    if (meshRef.current) meshRef.current.rotation.y += delta * 0.3
  })

  const px = parentPosition.x + relativePosition.x
  const py = parentPosition.y + relativePosition.y
  const pz = parentPosition.z + relativePosition.z

  return (
    <mesh ref={meshRef} position={[px, py, pz]}>
      <sphereGeometry args={[cfg.radius, 20, 20]} />
      <meshStandardMaterial
        color={cfg.color}
        roughness={0.95}
        metalness={0}
      />
    </mesh>
  )
}
