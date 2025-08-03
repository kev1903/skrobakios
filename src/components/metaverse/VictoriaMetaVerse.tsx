import React, { Suspense, useRef, useState, useEffect } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Text, Html, useGLTF, Environment, Grid, Sky } from '@react-three/drei';
import { supabase } from '@/integrations/supabase/client';
import { useCompany } from '@/contexts/CompanyContext';
import { IFCLoader } from './IFCLoader';
import * as THREE from 'three';

// Project interface
interface Project {
  id: string;
  project_id: string;
  name: string;
  location: string;
  status: string;
  contract_price?: string;
  start_date?: string;
  deadline?: string;
  bim_model_url?: string;
  company_id: string;
}

// Project coordinates for Victoria (approximate positions)
const projectCoordinates: { [key: string]: [number, number, number] } = {
  'SK_25015': [5, 0, -8],   // Mt. Eliza
  'SK_25014': [-12, 0, 8],  // St Albans
  'SK_25013': [2, 0, 5],    // Kew East
  'SK_25012': [0, 0, 0],    // Central Melbourne
  'SK_25011': [3, 0, 3],    // Glen Iris
  'SK_25010': [1, 0, 2],    // Malvern
  'SK_25009': [4, 0, 4],    // Canterbury
  'SK_25007': [8, 0, -5],   // Beaconsfield Upper
  'SK_25003': [2, 0, 1],    // Malvern
  'SK_24007': [12, 0, -10], // Narre Warren South
  'SK_24006': [5, 0, 6],    // Camberwell
  'SK 23019': [15, 0, -8],  // Narre Warren North
  'SK 23012': [8, 0, -3],   // Springvale South
  'SK 23008': [10, 0, -6],  // Hallam
  'SK 2160': [6, 0, 7],     // Balwyn
  'SK_25008': [7, 0, 8],    // Bulleen
};

// 3D Building Component
function BuildingModel({ project, position, onClick }: { 
  project: Project; 
  position: [number, number, number]; 
  onClick: (project: Project) => void;
}) {
  const meshRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);
  
  useFrame((state) => {
    if (meshRef.current && hovered) {
      meshRef.current.rotation.y += 0.01;
    }
  });

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed': return '#4ade80';
      case 'in_progress': return '#fbbf24';
      case 'pending': return '#f87171';
      default: return '#94a3b8';
    }
  };

  const getBuildingHeight = (contractPrice?: string) => {
    if (!contractPrice) return 2;
    const price = parseFloat(contractPrice);
    return Math.max(1, Math.min(8, price / 50000)); // Scale building height based on contract value
  };

  return (
    <group position={position}>
      {/* Building Base */}
      <mesh
        ref={meshRef}
        onClick={() => onClick(project)}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
        position={[0, getBuildingHeight(project.contract_price) / 2, 0]}
      >
        <boxGeometry args={[1, getBuildingHeight(project.contract_price), 1]} />
        <meshStandardMaterial 
          color={getStatusColor(project.status)}
          emissive={hovered ? getStatusColor(project.status) : '#000000'}
          emissiveIntensity={hovered ? 0.3 : 0}
        />
      </mesh>
      
      {/* Project Label */}
      <Text
        position={[0, getBuildingHeight(project.contract_price) + 1, 0]}
        fontSize={0.3}
        color="white"
        anchorX="center"
        anchorY="middle"
      >
        {project.project_id}
      </Text>
      
      {/* Status Indicator */}
      <mesh position={[0, getBuildingHeight(project.contract_price) + 0.5, 0]}>
        <sphereGeometry args={[0.1]} />
        <meshStandardMaterial 
          color={getStatusColor(project.status)}
          emissive={getStatusColor(project.status)}
          emissiveIntensity={0.5}
        />
      </mesh>
    </group>
  );
}

// Terrain Component for Victoria
function VictoriaTerrain() {
  return (
    <group>
      {/* Main terrain */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.5, 0]}>
        <planeGeometry args={[50, 50, 32, 32]} />
        <meshStandardMaterial 
          color="#2d5016"
          roughness={0.8}
          metalness={0.1}
        />
      </mesh>
      
      {/* Water bodies (Port Phillip Bay) */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[-15, -0.4, 5]}>
        <planeGeometry args={[15, 20]} />
        <meshStandardMaterial 
          color="#1e40af"
          roughness={0.1}
          metalness={0.3}
          transparent
          opacity={0.8}
        />
      </mesh>
    </group>
  );
}

// Data Visualization Panel
function DataPanel({ projects }: { projects: Project[] }) {
  const totalProjects = projects.length;
  const completedProjects = projects.filter(p => p.status.toLowerCase() === 'completed').length;
  const pendingProjects = projects.filter(p => p.status.toLowerCase() === 'pending').length;
  const totalValue = projects.reduce((sum, p) => sum + (parseFloat(p.contract_price || '0')), 0);

  return (
    <Html position={[20, 10, 0]} transform occlude>
      <div className="bg-background/90 backdrop-blur-md p-6 rounded-lg border border-border min-w-[300px]">
        <h3 className="text-lg font-semibold text-foreground mb-4">Project Overview</h3>
        <div className="space-y-3">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Total Projects:</span>
            <span className="text-foreground font-medium">{totalProjects}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Completed:</span>
            <span className="text-green-500 font-medium">{completedProjects}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Pending:</span>
            <span className="text-orange-500 font-medium">{pendingProjects}</span>
          </div>
          <div className="flex justify-between border-t border-border pt-2">
            <span className="text-muted-foreground">Total Value:</span>
            <span className="text-foreground font-medium">
              ${totalValue.toLocaleString()}
            </span>
          </div>
        </div>
      </div>
    </Html>
  );
}

// Project Details Modal
function ProjectModal({ project, onClose }: { project: Project | null; onClose: () => void }) {
  if (!project) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center">
      <div className="bg-background border border-border rounded-lg p-6 max-w-md w-full mx-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-foreground">{project.name}</h3>
          <button 
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground"
          >
            ✕
          </button>
        </div>
        
        <div className="space-y-3">
          <div>
            <span className="text-muted-foreground">Project ID:</span>
            <span className="ml-2 text-foreground">{project.project_id}</span>
          </div>
          <div>
            <span className="text-muted-foreground">Location:</span>
            <span className="ml-2 text-foreground">{project.location}</span>
          </div>
          <div>
            <span className="text-muted-foreground">Status:</span>
            <span className={`ml-2 font-medium ${
              project.status.toLowerCase() === 'completed' ? 'text-green-500' :
              project.status.toLowerCase() === 'pending' ? 'text-orange-500' :
              'text-gray-500'
            }`}>
              {project.status}
            </span>
          </div>
          {project.contract_price && (
            <div>
              <span className="text-muted-foreground">Contract Value:</span>
              <span className="ml-2 text-foreground">
                ${parseFloat(project.contract_price).toLocaleString()}
              </span>
            </div>
          )}
          {project.start_date && (
            <div>
              <span className="text-muted-foreground">Start Date:</span>
              <span className="ml-2 text-foreground">
                {new Date(project.start_date).toLocaleDateString()}
              </span>
            </div>
          )}
          {project.deadline && (
            <div>
              <span className="text-muted-foreground">Deadline:</span>
              <span className="ml-2 text-foreground">
                {new Date(project.deadline).toLocaleDateString()}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Main MetaVerse Component
export function VictoriaMetaVerse() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const { currentCompany } = useCompany();

  // Fetch projects
  useEffect(() => {
    const fetchProjects = async () => {
      if (!currentCompany) return;

      try {
        const { data, error } = await supabase
          .from('projects')
          .select('*')
          .eq('company_id', currentCompany.id)
          .order('created_at', { ascending: false });

        if (!error && data) {
          console.log('🏗️ MetaVerse: Projects loaded:', data.length);
          setProjects(data);
        }
      } catch (error) {
        console.error('🏗️ MetaVerse: Error fetching projects:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, [currentCompany]);

  if (loading) {
    return (
      <div className="w-full h-screen pt-[73px] bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading MetaVerse...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-screen pt-[73px] bg-background relative">
      {/* 3D Canvas */}
      <Canvas
        camera={{ position: [20, 15, 20], fov: 60 }}
        shadows
        className="w-full h-full"
      >
        <Suspense fallback={null}>
          {/* Lighting */}
          <ambientLight intensity={0.4} />
          <directionalLight
            position={[10, 20, 5]}
            intensity={1}
            castShadow
            shadow-mapSize-width={2048}
            shadow-mapSize-height={2048}
          />
          
          {/* Environment */}
          <Sky sunPosition={[100, 20, 100]} />
          <Environment preset="sunset" />
          
          {/* Terrain */}
          <VictoriaTerrain />
          
          {/* Grid */}
          <Grid 
            args={[50, 50]}
            position={[0, -0.45, 0]}
            cellColor="#333"
            sectionColor="#555"
            fadeDistance={30}
            fadeStrength={1}
          />
          
          {/* Project Buildings with IFC Support */}
          {projects.map((project) => {
            const position = projectCoordinates[project.project_id] || [
              Math.random() * 20 - 10,
              0,
              Math.random() * 20 - 10
            ];
            
            return (
              <IFCLoader
                key={project.id}
                url={project.bim_model_url}
                position={position}
                scale={1}
                onClick={() => setSelectedProject(project)}
                project={{
                  id: project.id,
                  name: project.name,
                  status: project.status,
                  contract_price: project.contract_price
                }}
              />
            );
          })}
          
          {/* Data Visualization Panel */}
          <DataPanel projects={projects} />
          
          {/* Controls */}
          <OrbitControls
            enablePan={true}
            enableZoom={true}
            enableRotate={true}
            minDistance={5}
            maxDistance={50}
            minPolarAngle={0}
            maxPolarAngle={Math.PI / 2}
          />
        </Suspense>
      </Canvas>
      
      {/* Project Modal */}
      <ProjectModal 
        project={selectedProject} 
        onClose={() => setSelectedProject(null)} 
      />
      
      {/* UI Overlay */}
      <div className="absolute top-4 left-4 bg-background/90 backdrop-blur-md p-4 rounded-lg border border-border">
        <h2 className="text-lg font-semibold text-foreground mb-2">Victoria MetaVerse</h2>
        <p className="text-sm text-muted-foreground">
          Interactive 3D view of your building projects
        </p>
        <div className="mt-3 text-xs text-muted-foreground">
          <p>🖱️ Click and drag to rotate</p>
          <p>🔍 Scroll to zoom</p>
          <p>🏗️ Click buildings for details</p>
        </div>
      </div>
      
      {/* Legend */}
      <div className="absolute bottom-4 right-4 bg-background/90 backdrop-blur-md p-4 rounded-lg border border-border">
        <h3 className="text-sm font-semibold text-foreground mb-2">Status Legend</h3>
        <div className="space-y-1 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded bg-green-500"></div>
            <span className="text-muted-foreground">Completed</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded bg-orange-500"></div>
            <span className="text-muted-foreground">Pending</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded bg-gray-500"></div>
            <span className="text-muted-foreground">Other</span>
          </div>
        </div>
      </div>
    </div>
  );
}