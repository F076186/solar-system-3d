/**
 * Sun component – glowing sphere with multiple additive corona layers and a point light.
 */
import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Sphere, Billboard } from '@react-three/drei'
import * as THREE from 'three'

// Animated corona ring
function CoronaRing({ radius, opacity, speed }) {
  const mesh = useRef()
  useFrame((_, delta) => {
    if (mesh.current) mesh.current.rotation.z += delta * speed
  })
  return (
    <mesh ref={mesh} renderOrder={1}>
      <ringGeometry args={[radius, radius * 1.15, 64]} />
      <meshBasicMaterial
        color="#ff9900"
        transparent
        opacity={opacity}
        side={THREE.DoubleSide}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </mesh>
  )
}

// Soft glow sprite on the Sun
function SunGlow({ scale }) {
  return (
    <Billboard>
      <mesh renderOrder={0}>
        <planeGeometry args={[scale, scale]} />
        <meshBasicMaterial
          color="#ff6600"
          transparent
          opacity={0.18}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </mesh>
    </Billboard>
  )
}

export default function Sun({ position = [0, 0, 0] }) {
  const sunRef = useRef()

  useFrame((_, delta) => {
    if (sunRef.current) sunRef.current.rotation.y += delta * 0.04
  })

  return (
    <group position={position}>
      {/* Core sphere */}
      <Sphere ref={sunRef} args={[0.7, 64, 64]}>
        <meshStandardMaterial
          emissive="#ff8800"
          emissiveIntensity={3}
          color="#ffcc00"
          roughness={1}
          metalness={0}
        />
      </Sphere>

      {/* Point light – illuminates all planets */}
      <pointLight
        color="#fff5cc"
        intensity={4}
        distance={400}
        decay={1.2}
        castShadow={false}
      />
      <pointLight
        color="#ff9900"
        intensity={1.5}
        distance={80}
        decay={2}
      />

      {/* Corona rings */}
      <CoronaRing radius={0.78} opacity={0.25} speed={0.12} />
      <CoronaRing radius={0.90} opacity={0.14} speed={-0.07} />
      <CoronaRing radius={1.05} opacity={0.08} speed={0.05} />

      {/* Bloom-like glow billboards */}
      <SunGlow scale={4.5} />
      <SunGlow scale={7} />
      <SunGlow scale={12} />
    </group>
  )
}
