import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Environment, Lightformer } from '@react-three/drei';
import { useEffect, useRef, useState } from 'react';
import { useReducedMotion } from 'motion/react';
import type { Group } from 'three';

type SceneColors = { mint: string; ink: string; white: string; lilac: string };

function Sculpture({ compact, colors }: { compact: boolean; colors: SceneColors }) {
  const { size } = useThree();
  const mobile = size.width < 760;
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
  return <group ref={group} position={[compact || mobile ? 0 : 2.25, 0, 0]} rotation={[.2, .2, -.2]} scale={compact ? 1.5 : mobile ? .83 : 1.25}>
    <mesh rotation={[.15, 0, .2]}>
      <torusKnotGeometry args={[1.12, .33, 160, 24, 2, 3]} />
      <meshPhysicalMaterial color={colors.mint} roughness={.28} metalness={.12} clearcoat={.8} clearcoatRoughness={.24} />
    </mesh>
    <mesh position={[1.8, 1.4, -.5]} rotation={[.5,.6,.2]}>
      <torusGeometry args={[.36,.11,16,48]} />
      <meshStandardMaterial color={colors.lilac} roughness={.35} metalness={.15} />
    </mesh>
    <mesh position={[-1.65,-1.15,.1]} rotation={[.3,.4,.2]}>
      <octahedronGeometry args={[.27,0]} />
      <meshStandardMaterial color={colors.ink} metalness={.2} roughness={.4} />
    </mesh>
  </group>;
}

/** Theme tokens can be color-mix() expressions, which three.js can't parse, so paint each one to a pixel and read back plain RGB. */
function readSceneColors(): SceneColors {
  const probe = document.createElement('span');
  document.body.appendChild(probe);
  const ctx = document.createElement('canvas').getContext('2d', { willReadFrequently: true });
  const resolve = (token: string) => {
    probe.style.color = `var(${token})`;
    const computed = getComputedStyle(probe).color;
    if (!ctx) return computed;
    ctx.clearRect(0, 0, 1, 1);
    ctx.fillStyle = computed;
    ctx.fillRect(0, 0, 1, 1);
    const [r, g, b] = ctx.getImageData(0, 0, 1, 1).data;
    return `rgb(${r}, ${g}, ${b})`;
  };
  const colors = { mint: resolve('--scene-mint'), ink: resolve('--scene-ink'), white: resolve('--scene-white'), lilac: resolve('--scene-lilac') };
  probe.remove();
  return colors;
}

export function ConnectionScene({ compact = false }: { compact?: boolean }) {
  const [colors, setColors] = useState<SceneColors | null>(null);
  useEffect(() => {
    const refresh = () => {
      const next = readSceneColors();
      setColors(current => current && JSON.stringify(current) === JSON.stringify(next) ? current : next);
    };
    refresh();
    const observer = new MutationObserver(refresh);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class', 'style', 'data-app-theme', 'data-accent'] });
    return () => observer.disconnect();
  }, []);
  if (!colors) return null;
  return <Canvas dpr={[1,1.5]} camera={{ position: [0,0,10], fov: compact ? 32 : 39 }} gl={{ antialias: true, alpha: true }} aria-label="Animated connection sculpture">
    <ambientLight intensity={1} />
    <directionalLight position={[3,6,5]} intensity={2.2} />
    <Environment resolution={128}>
      <Lightformer position={[0,5,0]} scale={[10,10,1]} intensity={2} color={colors.white} />
      <Lightformer position={[-5,1,3]} rotation-y={Math.PI / 2} scale={[10,4,1]} intensity={1.5} color={colors.white} />
    </Environment>
    <Sculpture compact={compact} colors={colors} />
  </Canvas>;
}