import { Canvas, useFrame } from '@react-three/fiber';
import { Environment, Lightformer } from '@react-three/drei';
import { useEffect, useRef, useState } from 'react';
import { useReducedMotion } from 'motion/react';
import type { Group } from 'three';

function Sculpture({ compact, colors }: { compact: boolean; colors: string[] }) {
  const group = useRef<Group>(null);
  const time = useRef(0);
  const reduce = useReducedMotion();
  useFrame(({ pointer }, delta) => {
    if (!group.current || reduce) return;
    const dt = Math.min(delta, .05);
    time.current += dt;
    const target = Math.sin(time.current * .18) * .22 + pointer.x * .15;
    group.current.rotation.y += (target - group.current.rotation.y) * (1 - Math.exp(-3 * dt));
    group.current.rotation.z = -.2 + Math.sin(time.current * .3) * .05;
    group.current.position.y = Math.sin(time.current * .6) * .08;
  });
  return <group ref={group} position={[compact ? 0 : 2.25, 0, 0]} rotation={[.2, .2, -.2]} scale={compact ? .8 : 1.25}>
    <mesh rotation={[.15, 0, .2]}>
      <torusKnotGeometry args={[1.12, .33, 160, 24, 2, 3]} />
      <meshPhysicalMaterial color={colors[0]} roughness={.28} metalness={.12} clearcoat={.8} clearcoatRoughness={.24} />
    </mesh>
    <mesh position={[1.8, 1.4, -.5]} rotation={[.5,.6,.2]}>
      <torusGeometry args={[.36,.11,16,48]} />
      <meshStandardMaterial color={colors[3]} roughness={.35} metalness={.15} />
    </mesh>
    <mesh position={[-1.65,-1.15,.1]} rotation={[.3,.4,.2]}>
      <octahedronGeometry args={[.27,0]} />
      <meshStandardMaterial color={colors[1]} metalness={.2} roughness={.4} />
    </mesh>
  </group>;
}

export function ConnectionScene({ compact = false }: { compact?: boolean }) {
  const [colors, setColors] = useState<string[]>([]);
  useEffect(() => {
    const css = getComputedStyle(document.documentElement);
    setColors(['--scene-mint','--scene-ink','--scene-white','--scene-lilac'].map(token => css.getPropertyValue(token).trim()));
  }, []);
  if (!colors.length) return null;
  return <Canvas dpr={[1,1.5]} camera={{ position: [0,0,10], fov: compact ? 32 : 39 }} gl={{ antialias: true, alpha: true }} aria-label="Animated mint-green connection sculpture">
    <ambientLight intensity={1} />
    <directionalLight position={[3,6,5]} intensity={2.2} />
    <Environment resolution={128}>
      <Lightformer position={[0,5,0]} scale={[10,10,1]} intensity={2} color={colors[2]} />
      <Lightformer position={[-5,1,3]} rotation-y={Math.PI / 2} scale={[10,4,1]} intensity={1.5} color={colors[2]} />
    </Environment>
    <Sculpture compact={compact} colors={colors} />
  </Canvas>;
}