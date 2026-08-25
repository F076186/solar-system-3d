/**
 * Starfield – 8000 randomised billboarded points rendered as a deep-space background.
 */
import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

export default function Starfield({ count = 8000 }) {
  const points = useRef()

  const [positions, colors, sizes] = useMemo(() => {
    const pos  = new Float32Array(count * 3)
    const col  = new Float32Array(count * 3)
    const sz   = new Float32Array(count)

    for (let i = 0; i < count; i++) {
      // Uniform sphere shell between r=120 and r=300
      const r     = 120 + Math.random() * 180
      const theta = Math.acos(2 * Math.random() - 1)
      const phi   = 2 * Math.PI * Math.random()

      pos[i * 3 + 0] = r * Math.sin(theta) * Math.cos(phi)
      pos[i * 3 + 1] = r * Math.sin(theta) * Math.sin(phi)
      pos[i * 3 + 2] = r * Math.cos(theta)

      // Star colours: mostly white/blue-white, occasional warm tints
      const t = Math.random()
      if (t < 0.6) {
        col[i * 3 + 0] = 0.9 + Math.random() * 0.1
        col[i * 3 + 1] = 0.9 + Math.random() * 0.1
        col[i * 3 + 2] = 1.0
      } else if (t < 0.8) {
        col[i * 3 + 0] = 1.0
        col[i * 3 + 1] = 0.85 + Math.random() * 0.1
        col[i * 3 + 2] = 0.7 + Math.random() * 0.2
      } else {
        col[i * 3 + 0] = 0.7 + Math.random() * 0.2
        col[i * 3 + 1] = 0.8 + Math.random() * 0.15
        col[i * 3 + 2] = 1.0
      }

      sz[i] = 0.4 + Math.random() * 1.6
    }

    return [pos, col, sz]
  }, [count])

  // Very slow drift for extra depth
  useFrame((_, delta) => {
    if (points.current) points.current.rotation.y += delta * 0.0002
  })

  return (
    <points ref={points}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          array={positions}
          count={count}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-color"
          array={colors}
          count={count}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-size"
          array={sizes}
          count={count}
          itemSize={1}
        />
      </bufferGeometry>
      <pointsMaterial
        vertexColors
        sizeAttenuation={false}
        size={1.2}
        transparent
        opacity={0.9}
        depthWrite={false}
      />
    </points>
  )
}
