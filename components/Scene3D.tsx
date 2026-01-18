import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, Environment, Stars, Float } from '@react-three/drei';
import * as THREE from 'three';

// --- Assets & Geometries ---

const ParticleSystem: React.FC<{ 
  pollutantLoad: number; 
  dosage: number; 
  flowRate: number 
}> = ({ pollutantLoad, dosage, flowRate }) => {
  const count = 300;
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);
  
  // Particle state: position (x,y,z), velocity, status (0=floating, 1=flocculated, 2=captured)
  const particles = useMemo(() => {
    return new Array(count).fill(0).map(() => ({
      position: new THREE.Vector3(
        (Math.random() - 0.5) * 10, // Spread along pipe
        (Math.random() - 0.5) * 2,
        (Math.random() - 0.5) * 2
      ),
      velocity: Math.random() * 0.05 + 0.02,
      offset: Math.random() * 100,
      status: 0,
    }));
  }, []);

  useFrame((state) => {
    if (!meshRef.current) return;
    
    // Dynamic speed based on flow rate
    const speedMultiplier = flowRate / 100;
    const magnetX = 2; // Position of the magnetic drum

    particles.forEach((particle, i) => {
      // 1. Movement Logic
      particle.position.x += particle.velocity * speedMultiplier;

      // Reset if out of bounds
      if (particle.position.x > 8) {
        particle.position.x = -8;
        particle.position.y = (Math.random() - 0.5) * 2;
        particle.position.z = (Math.random() - 0.5) * 2;
        particle.status = 0; // Reset status
      }

      // 2. Flocculation Logic (controlled by Dosage)
      // High dosage = quicker flocculation = particles clump slightly or glow brighter
      // We simulate this by checking dosage vs load. 
      // Ideal dosage is approx Load/50.
      const isFlocculating = particle.position.x > -3 && dosage > (pollutantLoad / 100) * 0.5;

      // 3. Magnetic Separation Logic
      if (particle.position.x > magnetX - 1 && particle.position.x < magnetX + 1) {
        // Attraction force
        const dist = particle.position.distanceTo(new THREE.Vector3(magnetX, 3, 0));
        if (dist < 4) {
           // Pull upwards to the magnet drum
           particle.position.y += 0.15 * speedMultiplier;
           particle.position.x -= 0.05 * speedMultiplier; // Slow down slightly
           particle.status = 2;
        }
      }

      // 4. Update Matrix
      dummy.position.copy(particle.position);
      
      // Flocculation effect: Scale up
      const scale = isFlocculating || particle.status === 2 ? 1.5 : 1;
      dummy.scale.set(scale, scale, scale);
      
      dummy.rotation.x += 0.01;
      dummy.rotation.y += 0.01;
      dummy.updateMatrix();
      
      meshRef.current.setMatrixAt(i, dummy.matrix);
      
      // Color Logic (Simulated via instanceColor if we had set it up, but for simplicity we assume consistent material)
      // To properly change color per instance in vanilla R3F without custom shaders requires setting setColorAt
      // Let's assume the material color represents the composite.
    });

    meshRef.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, count]}>
      <sphereGeometry args={[0.08, 8, 8]} />
      <meshStandardMaterial 
        color="#b45309" // Golden Brown (Chitosan-Fe3O4)
        emissive="#b45309"
        emissiveIntensity={0.5}
        transparent
        opacity={0.9}
      />
    </instancedMesh>
  );
};

const ReactorPipe = () => {
  return (
    <group rotation={[0, 0, Math.PI / 2]}>
      {/* The Glass Pipe */}
      <mesh position={[0, 0, 0]}>
        <cylinderGeometry args={[1.5, 1.5, 16, 32, 1, true]} />
        <meshPhysicalMaterial 
          color="#a5f3fc" 
          transparent 
          opacity={0.15} 
          roughness={0.1}
          metalness={0.1}
          side={THREE.DoubleSide}
          depthWrite={false}
        />
      </mesh>
      
      {/* Water Stream Core - Gradient simulated by fog or multiple meshes. 
          Here we use a simple inner cylinder to represent water volume */}
      <mesh position={[0, 0, 0]}>
         <cylinderGeometry args={[1.4, 1.4, 16, 32]} />
         <meshBasicMaterial color="#083344" transparent opacity={0.2} depthWrite={false}/>
      </mesh>
    </group>
  );
};

const MagneticDrum = () => {
  const drumRef = useRef<THREE.Group>(null);
  
  useFrame(() => {
    if (drumRef.current) {
      drumRef.current.rotation.z -= 0.02; // Rotate drum
    }
  });

  return (
    <group position={[2, 2.8, 0]} ref={drumRef}>
      <mesh rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[1.2, 1.2, 3, 32]} />
        <meshStandardMaterial color="#334155" metalness={0.9} roughness={0.2} />
      </mesh>
      {/* Glowing Coils */}
      <mesh rotation={[0, 0, Math.PI / 2]}>
        <torusGeometry args={[1.25, 0.05, 16, 100]} />
        <meshBasicMaterial color="#06b6d4" />
      </mesh>
      <mesh position={[0.5, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
        <torusGeometry args={[1.25, 0.05, 16, 100]} />
        <meshBasicMaterial color="#06b6d4" />
      </mesh>
       <mesh position={[-0.5, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
        <torusGeometry args={[1.25, 0.05, 16, 100]} />
        <meshBasicMaterial color="#06b6d4" />
      </mesh>
    </group>
  );
};

// Inset Molecule Visualization
const Molecule = () => {
  return (
    <Float speed={2} rotationIntensity={1} floatIntensity={1}>
      <group scale={0.6}>
        {/* Core Fe3O4 (Black/Dark Grey) */}
        <mesh position={[0, 0, 0]}>
          <sphereGeometry args={[0.8, 16, 16]} />
          <meshStandardMaterial color="#1e293b" metalness={0.8} roughness={0.2} />
        </mesh>
        
        {/* Polymer Chain (Chitosan - Yellowish) */}
        <mesh position={[0.8, 0.5, 0]}>
          <sphereGeometry args={[0.4, 16, 16]} />
          <meshStandardMaterial color="#fbbf24" transparent opacity={0.8} />
        </mesh>
        <mesh position={[-0.8, -0.5, 0.2]}>
          <sphereGeometry args={[0.4, 16, 16]} />
          <meshStandardMaterial color="#fbbf24" transparent opacity={0.8} />
        </mesh>
        
        {/* TiO2 (White Dots) */}
        <mesh position={[0.5, -0.5, 0.6]}>
           <sphereGeometry args={[0.2, 16, 16]} />
           <meshStandardMaterial color="#ffffff" emissive="#ffffff" emissiveIntensity={0.5} />
        </mesh>
        <mesh position={[-0.3, 0.6, -0.5]}>
           <sphereGeometry args={[0.2, 16, 16]} />
           <meshStandardMaterial color="#ffffff" emissive="#ffffff" emissiveIntensity={0.5} />
        </mesh>
      </group>
    </Float>
  );
}

interface Scene3DProps {
  pollutantLoad: number;
  dosage: number;
  flowRate: number;
}

export const Scene3D: React.FC<Scene3DProps> = ({ pollutantLoad, dosage, flowRate }) => {
  return (
    <div className="w-full h-full relative rounded-lg overflow-hidden border border-cyan-500/20 shadow-2xl bg-black">
      {/* Inset Label */}
      <div className="absolute top-4 left-4 z-10 bg-black/60 backdrop-blur px-3 py-1 border-l-2 border-cyan-500">
        <h4 className="text-cyan-400 text-xs font-mono">DIGITAL TWIN: REACTOR CORE</h4>
        <p className="text-slate-400 text-[10px]">REAL-TIME SIMULATION</p>
      </div>

       {/* Molecule Inset */}
       <div className="absolute bottom-4 right-4 z-10 w-32 h-32 bg-slate-900/80 rounded-full border border-slate-700 overflow-hidden shadow-lg">
        <Canvas>
             <ambientLight intensity={0.5} />
             <pointLight position={[10, 10, 10]} />
             <Molecule />
        </Canvas>
        <div className="absolute bottom-2 w-full text-center">
             <span className="text-[8px] text-cyan-200 font-mono">Chitosan-Fe3O4-TiO2</span>
        </div>
      </div>

      <Canvas shadows camera={{ position: [0, 2, 10], fov: 45 }}>
        <color attach="background" args={['#020617']} />
        
        {/* Environment */}
        <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
        <ambientLight intensity={0.4} />
        <pointLight position={[10, 10, 10]} intensity={1} color="#06b6d4" />
        <spotLight position={[-10, 5, 0]} intensity={0.8} color="#10b981" />
        
        {/* Scene Objects */}
        <ReactorPipe />
        <ParticleSystem pollutantLoad={pollutantLoad} dosage={dosage} flowRate={flowRate} />
        <MagneticDrum />
        
        <OrbitControls 
            enablePan={false} 
            minPolarAngle={Math.PI / 4} 
            maxPolarAngle={Math.PI / 1.5}
            minDistance={5}
            maxDistance={15}
        />
        
        {/* Post Processing Sim (Fog) to hide pipe ends */}
        <fog attach="fog" args={['#020617', 5, 25]} />
      </Canvas>
    </div>
  );
};
