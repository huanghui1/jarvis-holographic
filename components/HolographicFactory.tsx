import React, { useRef, useState, useMemo, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { Group, Mesh, AdditiveBlending, DoubleSide, Vector3, Color, LineSegments, EdgesGeometry, LineBasicMaterial, MeshStandardMaterial, ShaderMaterial } from 'three';
import * as THREE from 'three';
import { Text, Edges, useGLTF } from '@react-three/drei';
import { HandTrackingState, RegionName } from '../types';
import { SoundService } from '../services/soundService';
import { EffectComposer, Bloom } from '@react-three/postprocessing';

interface HolographicFactoryProps {
  handTrackingRef: React.MutableRefObject<HandTrackingState>;
  setRegion: (region: RegionName) => void;
}

// --- Advanced Holographic Material (Fresnel Shader) ---
const HoloMaterial: React.FC<{ color: string, opacity?: number }> = ({ color, opacity = 0.8 }) => {
  // Simple custom shader for Fresnel edge glow
  const materialRef = useRef<any>(null);
  
  // Update uniforms if color changes
  useFrame((state) => {
      if (materialRef.current) {
          materialRef.current.uniforms.uTime.value = state.clock.elapsedTime;
      }
  });

  const uniforms = useMemo(() => ({
    uColor: { value: new Vector3(0, 0, 0) }, // Will be set from prop
    uTime: { value: 0 },
    uOpacity: { value: opacity }
  }), [opacity]);

  // Helper to convert hex string to Vector3 color
  useEffect(() => {
      if (materialRef.current) {
          const c = new Color(color);
          materialRef.current.uniforms.uColor.value.set(c.r, c.g, c.b);
      }
  }, [color]);

  return (
    <shaderMaterial
      ref={materialRef}
      transparent
      blending={AdditiveBlending}
      depthWrite={false}
      uniforms={uniforms}
      vertexShader={`
        varying vec3 vNormal;
        varying vec3 vViewPosition;
        varying vec2 vUv;
        void main() {
          vUv = uv;
          vNormal = normalize(normalMatrix * normal);
          vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
          vViewPosition = -mvPosition.xyz;
          gl_Position = projectionMatrix * mvPosition;
        }
      `}
      fragmentShader={`
        uniform vec3 uColor;
        uniform float uOpacity;
        uniform float uTime;
        varying vec3 vNormal;
        varying vec3 vViewPosition;
        varying vec2 vUv;

        void main() {
          // Fresnel intensity
          vec3 normal = normalize(vNormal);
          vec3 viewDir = normalize(vViewPosition);
          float fresnel = pow(1.0 - abs(dot(normal, viewDir)), 2.0);

          // Animated pulse
          float pulse = 0.8 + 0.2 * sin(uTime * 2.0 + vUv.y * 10.0);

          // Final color mix: Edge glow + Base transparency
          vec3 finalColor = uColor * (fresnel * 1.5 + 0.1) * pulse;
          
          // Scanline effect
          float scanline = sin(gl_FragCoord.y * 0.5 + uTime * 5.0) * 0.1 + 0.9;

          gl_FragColor = vec4(finalColor * scanline, uOpacity * (fresnel + 0.2));
        }
      `}
    />
  );
};
const Workshop: React.FC<{
  position: [number, number, number];
  label: string;
  isSelected: boolean;
  scaleFactor: number;
  color: string;
}> = ({ position, label, isSelected, scaleFactor, color }) => {
  const groupRef = useRef<Group>(null);
  const ringRef = useRef<Mesh>(null);
  
  useFrame((state) => {
    if (!groupRef.current) return;
    groupRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime + position[0]) * 0.05;

    if (ringRef.current) {
        ringRef.current.rotation.z -= 0.02;
    }
  });

  const glowColor = isSelected ? "#FFFFFF" : color;
  const baseOpacity = isSelected ? 0.9 : 0.4;
  const finalScale = isSelected ? 1 + scaleFactor : 1;

  return (
    <group ref={groupRef} position={[position[0], position[1], position[2]]} scale={[finalScale, finalScale, finalScale]}>
      {/* Label Group */}
      <group position={[0, 2.8, 0]}>
         <Text
            position={[0, 0.2, 0]}
            fontSize={0.3}
            color={glowColor}
            anchorX="center"
            anchorY="bottom"
         >
            {label}
         </Text>
         <mesh position={[0, 0, 0]}>
             <cylinderGeometry args={[0.01, 0.01, 0.5, 4]} />
             <meshBasicMaterial color={glowColor} transparent opacity={0.5} />
         </mesh>
         <mesh position={[0, 0.25, 0]}>
             <sphereGeometry args={[0.05, 8, 8]} />
             <meshBasicMaterial color={glowColor} />
         </mesh>
      </group>

      {/* Main Building Structure - High Tech Style */}
      <group position={[0, 1, 0]}>
         {/* Core Structure - With HoloMaterial */}
         <mesh>
            <boxGeometry args={[1.5, 1.2, 2]} />
            <HoloMaterial color={color} opacity={0.15} />
            <Edges scale={1} threshold={15} color={glowColor} />
         </mesh>
         
         {/* Internal Detail */}
         <mesh scale={[0.8, 0.8, 0.8]}>
            <boxGeometry args={[1.5, 1.2, 2]} />
            <meshBasicMaterial color={color} wireframe transparent opacity={0.05} />
         </mesh>

         {/* Side Modules - With HoloMaterial */}
         <mesh position={[0.9, -0.3, 0]}>
             <boxGeometry args={[0.4, 0.6, 1.5]} />
             <HoloMaterial color={glowColor} opacity={0.1} />
             <Edges scale={1} threshold={15} color={glowColor} />
         </mesh>
         <mesh position={[-0.9, -0.3, 0]}>
             <boxGeometry args={[0.4, 0.6, 1.5]} />
             <HoloMaterial color={glowColor} opacity={0.1} />
             <Edges scale={1} threshold={15} color={glowColor} />
         </mesh>

         {/* Top Vents */}
         <group position={[0, 0.7, 0]}>
             <mesh position={[-0.4, 0, 0]}>
                 <cylinderGeometry args={[0.2, 0.3, 0.5, 6]} />
                 <HoloMaterial color={glowColor} opacity={0.15} />
                 <Edges scale={1} threshold={15} color={glowColor} />
             </mesh>
             <mesh position={[0.4, 0, 0]}>
                 <cylinderGeometry args={[0.2, 0.3, 0.5, 6]} />
                 <HoloMaterial color={glowColor} opacity={0.15} />
                 <Edges scale={1} threshold={15} color={glowColor} />
             </mesh>
         </group>
      </group>

      {/* Holographic Base Ring */}
      <mesh ref={ringRef} position={[0, 0.1, 0]} rotation={[-Math.PI/2, 0, 0]}>
          <ringGeometry args={[1.2, 1.4, 64, 1]} />
          <meshBasicMaterial color={color} transparent opacity={0.4} side={DoubleSide} blending={AdditiveBlending} />
      </mesh>
      
      {/* Scanning Beam Effect */}
      {isSelected && (
          <group position={[0, 1.5, 0]}>
              {/* Outer Beam */}
              <mesh>
                <cylinderGeometry args={[1.3, 1.3, 0.1, 32]} />
                <meshBasicMaterial color="#FFFFFF" transparent opacity={0.2} blending={AdditiveBlending} />
              </mesh>
              {/* Vertical Laser Lines */}
              <mesh position={[1.3, 0, 0]}>
                 <boxGeometry args={[0.05, 3, 0.05]} />
                 <meshBasicMaterial color="#FFF" />
              </mesh>
              <mesh position={[-1.3, 0, 0]}>
                 <boxGeometry args={[0.05, 3, 0.05]} />
                 <meshBasicMaterial color="#FFF" />
              </mesh>
          </group>
      )}
    </group>
  );
};

// --- Central Hub Component ---
const CentralHub = () => {
    const ref = useRef<Group>(null);
    useFrame((state) => {
        if (ref.current) {
            ref.current.rotation.y += 0.005;
        }
    });

    return (
        <group ref={ref} position={[0, 0, 0]}>
            {/* Core Reactor */}
            <mesh position={[0, 0.5, 0]}>
                <cylinderGeometry args={[0.8, 0.8, 0.2, 6]} />
                <meshBasicMaterial color="#00F0FF" transparent opacity={0.8} blending={AdditiveBlending} />
            </mesh>
            <mesh position={[0, 0.5, 0]}>
                 <cylinderGeometry args={[0.9, 0.9, 0.05, 32]} />
                 <meshBasicMaterial color="#FFFFFF" transparent opacity={0.5} blending={AdditiveBlending} />
            </mesh>
            
            {/* Vertical Spire */}
            <mesh position={[0, 1.5, 0]}>
                <cylinderGeometry args={[0.1, 0.3, 3, 4]} />
                <meshBasicMaterial color="#00F0FF" wireframe transparent opacity={0.3} />
            </mesh>
            
            {/* Spinning Rings */}
            <mesh rotation={[Math.PI/2, 0, 0]}>
                <torusGeometry args={[1.5, 0.02, 16, 100]} />
                <meshBasicMaterial color="#00F0FF" transparent opacity={0.3} />
            </mesh>
        </group>
    );
};

// --- Data Stream Pipe ---
const DataPipe: React.FC<{ start: Vector3, end: Vector3, color: string }> = ({ start, end, color }) => {
    const ref = useRef<Group>(null);
    const particleCount = 20;
    
    useFrame((state) => {
        if (!ref.current) return;
        ref.current.children.forEach((child, i) => {
            // Move particles from start to end with varied speeds
            const speed = 0.3 + (i % 3) * 0.1;
            const t = (state.clock.elapsedTime * speed + i * (1/particleCount)) % 1;
            
            child.position.lerpVectors(start, end, t);
            // Parabolic arc height
            child.position.y += Math.sin(t * Math.PI) * 0.8; 
            
            // Scale effect based on arc position
            const scale = Math.sin(t * Math.PI) * 0.8 + 0.2;
            child.scale.setScalar(scale);
        });
    });

    return (
        <group ref={ref}>
             {/* Static Base Line */}
            <line>
                <bufferGeometry>
                    <bufferAttribute
                        attach="attributes-position"
                        count={2}
                        array={new Float32Array([start.x, start.y, start.z, end.x, end.y, end.z])}
                        itemSize={3}
                    />
                </bufferGeometry>
                <lineBasicMaterial color="#004488" opacity={0.1} transparent />
            </line>
            
            {/* Moving Packets - Tech Blue Spheres */}
            {Array.from({ length: particleCount }).map((_, i) => (
                <mesh key={i}>
                    <sphereGeometry args={[0.04, 8, 8]} />
                    <meshBasicMaterial color="#00F0FF" transparent opacity={0.9} blending={AdditiveBlending} />
                </mesh>
            ))}
        </group>
    );
}


// --- Radar Base Component ---
const RadarBase = () => {
  const meshRef = useRef<Mesh>(null);
  
  // Shader for Radar Scan
  const uniforms = useMemo(() => ({
    uTime: { value: 0 },
    uColor: { value: new Color("#001133") },
    uScanColor: { value: new Color("#00F0FF") }
  }), []);

  useFrame((state) => {
    if (meshRef.current) {
       (meshRef.current.material as any).uniforms.uTime.value = state.clock.elapsedTime;
       meshRef.current.rotation.z -= 0.005; // Add physical rotation
    }
  });

  return (
     <mesh ref={meshRef} rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.05, 0]}>
         <ringGeometry args={[0.5, 8, 64, 1]} />
         <shaderMaterial 
            transparent
            uniforms={uniforms}
            side={DoubleSide}
            blending={AdditiveBlending}
            depthWrite={false}
            vertexShader={`
              varying vec2 vUv;
              void main() {
                vUv = uv;
                gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
              }
            `}
            fragmentShader={`
              uniform float uTime;
              uniform vec3 uColor;
              uniform vec3 uScanColor;
              varying vec2 vUv;
              
              #define PI 3.14159265359

              void main() {
                // Convert UV to polar coords
                vec2 centered = vUv * 2.0 - 1.0;
                float r = length(centered);
                float a = atan(centered.y, centered.x);
                
                // Rotating scan beam
                float beam = mod(a - uTime * 2.0, PI * 2.0);
                beam = smoothstep(0.0, 0.5, beam) * (1.0 - smoothstep(2.0, 2.5, beam)); // Soft beam edge
                // Only positive beam
                float scan = max(0.0, (a - mod(uTime * 2.0, PI * 2.0)));
                // Simpler approach: Gradient based on angle diff
                
                float angle = atan(centered.y, centered.x) + PI;
                float scanAngle = mod(-uTime * 1.5, PI * 2.0);
                float diff = mod(scanAngle - angle + PI * 2.0, PI * 2.0);
                
                float intensity = smoothstep(0.0, 1.0, 1.0 - diff / (PI * 0.5)); // Fade trail
                intensity = pow(intensity, 3.0);

                // Concentric rings
                float rings = sin(r * 20.0 - uTime) * 0.5 + 0.5;
                rings = pow(rings, 5.0) * 0.2;

                vec3 color = mix(uColor, uScanColor, intensity + rings);
                float alpha = (intensity * 0.8 + rings + 0.1) * (1.0 - smoothstep(0.9, 1.0, r)); // Fade outer edge

                gl_FragColor = vec4(color, alpha * 0.6);
              }
            `}
         />
     </mesh>
  )
}

// --- Loaded Model Component ---
const HolographicMaterial = () => {
  return useMemo(() => new ShaderMaterial({
    uniforms: {
      time: { value: 0 },
      color: { value: new Color('#00ffff') },
      opacity: { value: 0.85 },
    },
    vertexShader: `
      varying vec3 vPosition;
      void main() {
        vPosition = position;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: `
      uniform float time;
      uniform vec3 color;
      uniform float opacity;
      varying vec3 vPosition;
      
      void main() {
        float scanline = sin(vPosition.y * 20.0 + time * 3.0) * 0.5 + 0.5;
        float fresnel = pow(1.0 - abs(dot(normalize(vPosition), vec3(0, 0, 1))), 2.0);
        
        vec3 finalColor = color * (0.3 + scanline * 0.7) + fresnel * 0.5;
        gl_FragColor = vec4(finalColor, opacity * fresnel);
      }
    `,
    transparent: true,
    side: DoubleSide,
  }), []);
};

const LoadedModel = () => {
  const { scene } = useGLTF('/models/ironman.glb');
  const ref = useRef<Group>(null);
  const material = HolographicMaterial();

  useEffect(() => {
    scene.traverse((child) => {
      if (child instanceof Mesh) {
        child.material = material; 
      }
    });
  }, [scene, material]);

  useFrame((state) => {
    if (ref.current) {
      ref.current.rotation.y = state.clock.elapsedTime * 0.2;
      material.uniforms.time.value = state.clock.elapsedTime;
    }
  });

  return <primitive ref={ref} object={scene} position={[0, 1, 0]} />;
};

// --- Main Factory Scene ---
const HolographicFactory: React.FC<HolographicFactoryProps> = ({ handTrackingRef, setRegion }) => {
  const groupRef = useRef<Group>(null);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const lastPinchState = useRef<boolean>(false);
  const expansionRef = useRef(0);
  const { camera } = useThree(); // Access camera for projection

  // Factory Data - Compacted Layout
  const workshops = useMemo(() => [
    { id: 0, label: "一号车间", region: RegionName.AMERICAS, pos: new Vector3(-2.5, 0, -2.5), color: "#00F0FF" },
    { id: 1, label: "二号车间", region: RegionName.PACIFIC, pos: new Vector3(2.5, 0, -2.5), color: "#0066FF" },
    { id: 2, label: "三号车间", region: RegionName.ASIA, pos: new Vector3(-2.5, 0, 2.5), color: "#00A0FF" },
    { id: 3, label: "四号车间", region: RegionName.EUROPE, pos: new Vector3(2.5, 0, 2.5), color: "#40E0D0" },
  ], []);
// ... (rest of the file)

  useFrame((state) => {
    if (!groupRef.current) return;

    const rightHand = handTrackingRef.current.rightHand;
    const leftHand = handTrackingRef.current.leftHand;

    // --- 1. Rotation (Right Hand) ---
    let rotX = 0;
    let rotY = 0;
    if (rightHand) {
        // FIX 1: Inverted X rotation direction to match hand movement naturally
        rotX = -rightHand.rotationControl.x * 0.02;
        rotY = rightHand.rotationControl.y * 0.02;
    }
    // Continuous idle rotation
    groupRef.current.rotation.y += 0.002 + rotX;
    groupRef.current.rotation.x += rotY;
    
    // Clamp X rotation to avoid flipping
    groupRef.current.rotation.x = Math.max(-0.5, Math.min(0.5, groupRef.current.rotation.x));


    // --- 2. Selection (Right Hand Pinch) - Smart Raycasting ---
    if (rightHand) {
        if (rightHand.isPinching && !lastPinchState.current) {
            // Rising edge: Perform spatial selection
            
            // Get Index Finger Tip (Landmark 8)
            const indexTip = rightHand.landmarks[8];
            
            // Convert to Normalized Device Coordinates (NDC) [-1, 1]
            // Assuming Mirrored Video: x=0 (Left in video) -> x=1 (Right on screen)
            // Screen X = 1 - indexTip.x
            // NDC X = (Screen X - 0.5) * 2 = (0.5 - indexTip.x) * 2
            const cursorX = (0.5 - indexTip.x) * 2;
            const cursorY = (0.5 - indexTip.y) * 2; // Inverted Y for NDC

            let minDist = Infinity;
            let bestIdx = -1;

            // Project each workshop position to screen space
            workshops.forEach((w, i) => {
                // Get world position considering current rotation
                const worldPos = w.pos.clone().applyMatrix4(groupRef.current!.matrixWorld);
                const screenPos = worldPos.project(camera);

                // Calculate 2D distance on screen
                const dx = screenPos.x - cursorX;
                const dy = screenPos.y - cursorY;
                const dist = Math.sqrt(dx*dx + dy*dy);

                // Heuristic: Prefer items closer to camera (smaller z) if needed, 
                // but screen distance is usually enough for this UI.
                
                // Threshold for selection (e.g. 0.3 NDC units)
                if (dist < 0.5 && dist < minDist) {
                    minDist = dist;
                    bestIdx = i;
                }
            });

            if (bestIdx !== -1) {
                setSelectedIndex(bestIdx);
                setRegion(workshops[bestIdx].region);
                SoundService.playBlip();
            }
        }
        lastPinchState.current = rightHand.isPinching;
    }

    // --- 3. Expansion/Zoom (Left Hand) ---
    let targetExpansion = 0;
    if (leftHand) {
        targetExpansion = leftHand.expansionFactor; // 0 to 1
    }
    // Smooth interpolation
    expansionRef.current += (targetExpansion - expansionRef.current) * 0.1;

  });

  return (
    <group ref={groupRef} position={[0, -1, 0]}>
        <EffectComposer enableNormalPass={false} multisampling={0}>
           {/* Optimize: Higher threshold to bloom only very bright parts, lower resolution radius */}
           <Bloom luminanceThreshold={0.5} intensity={0.5} radius={0.4} levels={2} />
        </EffectComposer>

        {/* Central Hub */}
        <CentralHub />
        
        {/* Imported Model */}
        <LoadedModel />

        {/* Floor Grid - Radar Base */}
        <RadarBase />
        <gridHelper args={[20, 20, 0x004488, 0x001133]} position={[0, -0.1, 0]} />
        
        {/* Workshops */}
        {workshops.map((w, i) => (
            <Workshop
                key={i}
                position={[w.pos.x, w.pos.y, w.pos.z]}
                label={w.label}
                isSelected={selectedIndex === i}
                scaleFactor={selectedIndex === i ? expansionRef.current * 1.5 : 0} // Expand if selected
                color={w.color}
            />
        ))}

        {/* Connecting Data Pipes */}
        {workshops.map((w, i) => (
            <DataPipe 
                key={`pipe-${i}`} 
                start={new Vector3(0, 0.5, 0)} 
                end={w.pos} 
                color={w.color} 
            />
        ))}

        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} intensity={1} color="#00F0FF" />
    </group>
  );
};

export default HolographicFactory;

useGLTF.preload('/models/ironman.glb');
