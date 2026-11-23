import { Canvas } from '@react-three/fiber';
import { Environment, PresentationControls, Float, ContactShadows, RoundedBox } from '@react-three/drei';

function CityBlock() {
  return (
    <group>
      {/* Base platform */}
      <RoundedBox args={[4, 0.4, 4]} radius={0.05} position={[0, -0.2, 0]}>
        <meshStandardMaterial color="#1e293b" roughness={0.2} metalness={0.8} />
      </RoundedBox>
      
      {/* Main Tower */}
      <RoundedBox args={[1.2, 3, 1.2]} radius={0.05} position={[-0.8, 1.5, -0.8]}>
        <meshStandardMaterial color="#0f172a" roughness={0.1} metalness={0.9} />
      </RoundedBox>
      {/* Glowing Accents on Main Tower */}
      <mesh position={[-0.8, 1.5, -0.19]}>
        <planeGeometry args={[0.1, 3]} />
        <meshBasicMaterial color="#34d399" />
      </mesh>

      {/* Secondary Building */}
      <RoundedBox args={[1.5, 1.5, 1]} radius={0.05} position={[0.8, 0.75, -1]}>
        <meshStandardMaterial color="#f8fafc" roughness={0.1} />
      </RoundedBox>

      {/* Glass Pavilion */}
      <RoundedBox args={[1.8, 0.8, 1.8]} radius={0.05} position={[0.5, 0.4, 0.8]}>
        <meshPhysicalMaterial color="#6ee7b7" transmission={0.9} opacity={1} transparent roughness={0} metalness={0.2} ior={1.5} />
      </RoundedBox>

      {/* Trees / Greenery */}
      <group position={[-1.2, 0, 1.2]}>
        <mesh position={[0, 0.2, 0]}>
          <cylinderGeometry args={[0.05, 0.05, 0.4]} />
          <meshStandardMaterial color="#78350f" />
        </mesh>
        <mesh position={[0, 0.6, 0]}>
          <icosahedronGeometry args={[0.3, 1]} />
          <meshStandardMaterial color="#10b981" />
        </mesh>
      </group>

      <group position={[-0.5, 0, 1.5]}>
        <mesh position={[0, 0.15, 0]}>
          <cylinderGeometry args={[0.03, 0.03, 0.3]} />
          <meshStandardMaterial color="#78350f" />
        </mesh>
        <mesh position={[0, 0.4, 0]}>
          <icosahedronGeometry args={[0.2, 1]} />
          <meshStandardMaterial color="#059669" />
        </mesh>
      </group>
    </group>
  );
}

export default function Scene() {
  return (
    <Canvas camera={{ position: [6, 4, 6], fov: 40 }} dpr={[1, 2]} gl={{ antialias: true }}>
      <ambientLight intensity={0.4} />
      <directionalLight position={[10, 10, 5]} intensity={1.5} castShadow shadow-mapSize={[1024, 1024]} />
      
      <PresentationControls
        global
        snap={true}
        rotation={[0, -Math.PI / 4, 0]}
        polar={[-Math.PI / 4, Math.PI / 4]}
        azimuth={[-Math.PI / 2, Math.PI / 2]}
      >
        <Float rotationIntensity={0.5} floatIntensity={1.5} speed={1.5}>
          <CityBlock />
        </Float>
      </PresentationControls>

      <ContactShadows position={[0, -1.5, 0]} opacity={0.6} scale={15} blur={2.5} far={4} color="#000000" />
      <Environment preset="city" />
    </Canvas>
  );
}
