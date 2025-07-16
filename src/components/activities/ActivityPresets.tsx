import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useActivities } from "@/hooks/useActivities";
import { useCompany } from "@/contexts/CompanyContext";
import { useToast } from "@/hooks/use-toast";
import { 
  Hammer, 
  Zap, 
  Wrench, 
  HardHat, 
  Truck, 
  Paintbrush, 
  Home, 
  TreePine,
  Building,
  Ruler,
  FileText,
  Calculator
} from "lucide-react";

interface ActivityPreset {
  id: string;
  name: string;
  description: string;
  duration: number; // in days
  estimatedCost: number;
  category: string;
  icon: any;
  dependencies?: string[];
  qualityMetrics: {
    standardCompliance: string[];
    inspectionRequired: boolean;
    materials: string[];
  };
}

const CONSTRUCTION_PRESETS: ActivityPreset[] = [
  {
    id: "site-preparation",
    name: "Site Preparation & Clearance",
    description: "Clear vegetation, level ground, and prepare construction site",
    duration: 5,
    estimatedCost: 15000,
    category: "Site Work",
    icon: Truck,
    qualityMetrics: {
      standardCompliance: ["AS 3798", "AS 1289"],
      inspectionRequired: true,
      materials: ["Excavation equipment", "Survey equipment", "Safety barriers"]
    }
  },
  {
    id: "foundation-excavation",
    name: "Foundation Excavation",
    description: "Excavate for footings and foundation work",
    duration: 3,
    estimatedCost: 8500,
    category: "Foundations",
    icon: Hammer,
    dependencies: ["site-preparation"],
    qualityMetrics: {
      standardCompliance: ["AS 2870", "AS 3600"],
      inspectionRequired: true,
      materials: ["Concrete", "Reinforcement steel", "Formwork"]
    }
  },
  {
    id: "concrete-pour",
    name: "Concrete Foundation Pour",
    description: "Pour concrete for foundation footings and slabs",
    duration: 2,
    estimatedCost: 12000,
    category: "Foundations",
    icon: Building,
    dependencies: ["foundation-excavation"],
    qualityMetrics: {
      standardCompliance: ["AS 3600", "AS 1379"],
      inspectionRequired: true,
      materials: ["Concrete mix", "Reinforcement", "Curing compounds"]
    }
  },
  {
    id: "framing",
    name: "Structural Framing",
    description: "Install structural timber or steel framing",
    duration: 10,
    estimatedCost: 25000,
    category: "Structure",
    icon: HardHat,
    dependencies: ["concrete-pour"],
    qualityMetrics: {
      standardCompliance: ["AS 1684", "AS 4100"],
      inspectionRequired: true,
      materials: ["Timber frames", "Steel beams", "Connectors", "Fasteners"]
    }
  },
  {
    id: "roofing",
    name: "Roof Installation",
    description: "Install roof structure, covering, and gutters",
    duration: 7,
    estimatedCost: 18000,
    category: "Roofing",
    icon: Home,
    dependencies: ["framing"],
    qualityMetrics: {
      standardCompliance: ["AS 1562", "AS 2050"],
      inspectionRequired: true,
      materials: ["Roof trusses", "Roof sheeting", "Gutters", "Flashing"]
    }
  },
  {
    id: "electrical-rough",
    name: "Electrical Rough-in",
    description: "Install electrical wiring and rough electrical work",
    duration: 5,
    estimatedCost: 9500,
    category: "Electrical",
    icon: Zap,
    dependencies: ["framing"],
    qualityMetrics: {
      standardCompliance: ["AS 3000", "AS 3008"],
      inspectionRequired: true,
      materials: ["Electrical cable", "Conduits", "Switch boxes", "Safety switches"]
    }
  },
  {
    id: "plumbing-rough",
    name: "Plumbing Rough-in",
    description: "Install plumbing pipes and rough plumbing work",
    duration: 4,
    estimatedCost: 7500,
    category: "Plumbing",
    icon: Wrench,
    dependencies: ["framing"],
    qualityMetrics: {
      standardCompliance: ["AS 3500", "AS 2566"],
      inspectionRequired: true,
      materials: ["PVC pipes", "Copper pipes", "Fittings", "Fixtures"]
    }
  },
  {
    id: "insulation",
    name: "Insulation Installation",
    description: "Install thermal and acoustic insulation",
    duration: 3,
    estimatedCost: 4500,
    category: "Building Envelope",
    icon: Home,
    dependencies: ["electrical-rough", "plumbing-rough"],
    qualityMetrics: {
      standardCompliance: ["AS 4859", "AS 2627"],
      inspectionRequired: false,
      materials: ["Bulk insulation", "Reflective insulation", "Vapour barriers"]
    }
  },
  {
    id: "drywall",
    name: "Drywall Installation",
    description: "Install and finish interior drywall/plasterboard",
    duration: 8,
    estimatedCost: 11000,
    category: "Interior",
    icon: Ruler,
    dependencies: ["insulation"],
    qualityMetrics: {
      standardCompliance: ["AS 2588", "AS 3740"],
      inspectionRequired: false,
      materials: ["Plasterboard", "Compound", "Tape", "Screws"]
    }
  },
  {
    id: "flooring",
    name: "Flooring Installation",
    description: "Install final flooring materials",
    duration: 6,
    estimatedCost: 15000,
    category: "Finishes",
    icon: Home,
    dependencies: ["drywall"],
    qualityMetrics: {
      standardCompliance: ["AS 1884", "AS 4586"],
      inspectionRequired: false,
      materials: ["Flooring material", "Underlayment", "Adhesives", "Trims"]
    }
  },
  {
    id: "painting",
    name: "Interior & Exterior Painting",
    description: "Prime and paint all interior and exterior surfaces",
    duration: 7,
    estimatedCost: 8500,
    category: "Finishes",
    icon: Paintbrush,
    dependencies: ["drywall"],
    qualityMetrics: {
      standardCompliance: ["AS 2311", "AS 3730"],
      inspectionRequired: false,
      materials: ["Primer", "Paint", "Brushes", "Rollers", "Drop sheets"]
    }
  },
  {
    id: "landscaping",
    name: "Final Landscaping",
    description: "Complete landscaping and external works",
    duration: 5,
    estimatedCost: 12000,
    category: "External Works",
    icon: TreePine,
    dependencies: ["painting"],
    qualityMetrics: {
      standardCompliance: ["AS 4419", "AS 2303"],
      inspectionRequired: false,
      materials: ["Plants", "Mulch", "Irrigation", "Hardscaping materials"]
    }
  }
];

interface ActivityPresetsProps {
  projectId: string;
  onActivityCreated: () => void;
}

export function ActivityPresets({ projectId, onActivityCreated }: ActivityPresetsProps) {
  const [selectedPresets, setSelectedPresets] = useState<string[]>([]);
  const [isCreating, setIsCreating] = useState(false);
  const { createActivity } = useActivities();
  const { currentCompany } = useCompany();
  const { toast } = useToast();

  const handleTogglePreset = (presetId: string) => {
    setSelectedPresets(prev => 
      prev.includes(presetId) 
        ? prev.filter(id => id !== presetId)
        : [...prev, presetId]
    );
  };

  const handleCreateSelectedActivities = async () => {
    if (selectedPresets.length === 0) {
      toast({
        title: "No Activities Selected",
        description: "Please select at least one activity preset to create.",
        variant: "destructive",
      });
      return;
    }

    if (!currentCompany?.id) {
      toast({
        title: "No Company Selected",
        description: "Please select a company to create activities.",
        variant: "destructive",
      });
      return;
    }

    setIsCreating(true);

    try {
      const presetsToCreate = CONSTRUCTION_PRESETS.filter(preset => 
        selectedPresets.includes(preset.id)
      );

      for (const preset of presetsToCreate) {
        await createActivity.mutateAsync({
          name: preset.name,
          description: preset.description,
          project_id: projectId,
          company_id: currentCompany.id,
          duration: `${preset.duration} days`,
          cost_est: preset.estimatedCost,
          cost_actual: 0,
          dependencies: preset.dependencies || [],
          quality_metrics: preset.qualityMetrics,
          start_date: null,
          end_date: null
        });
      }

      toast({
        title: "Activities Created",
        description: `Successfully created ${presetsToCreate.length} activities for your project.`,
      });

      setSelectedPresets([]);
      onActivityCreated();
    } catch (error) {
      console.error("Error creating activities:", error);
      toast({
        title: "Error Creating Activities",
        description: "There was an error creating the activities. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsCreating(false);
    }
  };

  const getCategoryColor = (category: string) => {
    const colors = {
      "Site Work": "bg-yellow-500/20 text-yellow-300 border-yellow-500/30",
      "Foundations": "bg-gray-500/20 text-gray-300 border-gray-500/30",
      "Structure": "bg-blue-500/20 text-blue-300 border-blue-500/30",
      "Roofing": "bg-red-500/20 text-red-300 border-red-500/30",
      "Electrical": "bg-purple-500/20 text-purple-300 border-purple-500/30",
      "Plumbing": "bg-cyan-500/20 text-cyan-300 border-cyan-500/30",
      "Building Envelope": "bg-green-500/20 text-green-300 border-green-500/30",
      "Interior": "bg-indigo-500/20 text-indigo-300 border-indigo-500/30",
      "Finishes": "bg-pink-500/20 text-pink-300 border-pink-500/30",
      "External Works": "bg-emerald-500/20 text-emerald-300 border-emerald-500/30"
    };
    return colors[category as keyof typeof colors] || "bg-gray-500/20 text-gray-300 border-gray-500/30";
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-white mb-2">Activity Presets</h2>
          <p className="text-white/60">
            Select from common construction activities to quickly populate your project
          </p>
        </div>
        
        {selectedPresets.length > 0 && (
          <div className="flex items-center space-x-4">
            <span className="text-white/60">
              {selectedPresets.length} selected
            </span>
            <Button
              onClick={handleCreateSelectedActivities}
              disabled={isCreating}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              {isCreating ? "Creating..." : `Create ${selectedPresets.length} Activities`}
            </Button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {CONSTRUCTION_PRESETS.map((preset) => {
          const IconComponent = preset.icon;
          const isSelected = selectedPresets.includes(preset.id);
          
          return (
            <Card 
              key={preset.id}
              className={`cursor-pointer transition-all duration-200 backdrop-blur-xl border ${
                isSelected 
                  ? 'bg-blue-500/20 border-blue-500/50 shadow-lg shadow-blue-500/20' 
                  : 'bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20'
              }`}
              onClick={() => handleTogglePreset(preset.id)}
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3">
                    <div className={`p-2 rounded-lg ${isSelected ? 'bg-blue-500/30' : 'bg-white/10'}`}>
                      <IconComponent className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <CardTitle className="text-white text-lg">{preset.name}</CardTitle>
                      <Badge variant="outline" className={getCategoryColor(preset.category)}>
                        {preset.category}
                      </Badge>
                    </div>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="pt-0">
                <CardDescription className="text-white/70 mb-4">
                  {preset.description}
                </CardDescription>
                
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between text-white/60">
                    <span>Duration:</span>
                    <span className="text-white">{preset.duration} days</span>
                  </div>
                  <div className="flex justify-between text-white/60">
                    <span>Est. Cost:</span>
                    <span className="text-white">${preset.estimatedCost.toLocaleString()}</span>
                  </div>
                  
                  {preset.dependencies && preset.dependencies.length > 0 && (
                    <div className="pt-2">
                      <span className="text-white/60 text-xs">Dependencies:</span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {preset.dependencies.map((dep) => (
                          <Badge key={dep} variant="outline" className="text-xs bg-white/5 text-white/50">
                            {dep}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  <div className="pt-2">
                    <span className="text-white/60 text-xs">Standards:</span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {preset.qualityMetrics.standardCompliance.slice(0, 2).map((standard) => (
                        <Badge key={standard} variant="outline" className="text-xs bg-green-500/10 text-green-300">
                          {standard}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
      
      {selectedPresets.length === 0 && (
        <div className="text-center py-12">
          <FileText className="w-12 h-12 text-white/30 mx-auto mb-4" />
          <p className="text-white/60">
            Select activity presets above to create them for your project
          </p>
        </div>
      )}
    </div>
  );
}