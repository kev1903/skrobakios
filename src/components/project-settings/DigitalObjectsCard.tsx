import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Building2, 
  Calendar, 
  Users, 
  FileText, 
  DollarSign, 
  Package, 
  Brain,
  Plus,
  Edit,
  Trash2
} from "lucide-react";
import { Project } from "@/hooks/useProjects";

interface DigitalObjectsCardProps {
  project: Project;
}

interface DigitalObject {
  id: string;
  name: string;
  type: string;
  category: string;
  attributes: Record<string, any>;
  created_at: string;
}

export const DigitalObjectsCard = ({ project }: DigitalObjectsCardProps) => {
  const [activeCategory, setActiveCategory] = useState('physical');
  const [objects, setObjects] = useState<DigitalObject[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newObject, setNewObject] = useState({
    name: '',
    type: '',
    category: 'physical',
    attributes: {}
  });

  const categories = [
    { id: 'physical', label: 'Physical Components', icon: Building2, color: 'bg-blue-500/20 text-blue-300' },
    { id: 'processes', label: 'Processes & Activities', icon: Calendar, color: 'bg-orange-500/20 text-orange-300' },
    { id: 'people', label: 'People & Roles', icon: Users, color: 'bg-green-500/20 text-green-300' },
    { id: 'documents', label: 'Documents & Certifications', icon: FileText, color: 'bg-purple-500/20 text-purple-300' },
    { id: 'finance', label: 'Finance & Contracts', icon: DollarSign, color: 'bg-yellow-500/20 text-yellow-300' },
    { id: 'inventory', label: 'Inventory & Procurement', icon: Package, color: 'bg-red-500/20 text-red-300' },
    { id: 'ai', label: 'AI/Logic Layer', icon: Brain, color: 'bg-indigo-500/20 text-indigo-300' }
  ];

  const objectTypes = {
    physical: ['slab', 'wall', 'room', 'door', 'window', 'fixture'],
    processes: ['task', 'inspection', 'variation', 'delay_report'],
    people: ['person', 'company', 'stakeholder'],
    documents: ['cert', 'file', 'site_log'],
    finance: ['cost_item', 'invoice', 'claim'],
    inventory: ['procurement_order', 'material'],
    ai: ['agent', 'event', 'rule']
  };

  const handleAddObject = () => {
    const digitalObject: DigitalObject = {
      id: Date.now().toString(),
      name: newObject.name,
      type: newObject.type,
      category: newObject.category,
      attributes: newObject.attributes,
      created_at: new Date().toISOString()
    };

    setObjects([...objects, digitalObject]);
    setNewObject({ name: '', type: '', category: 'physical', attributes: {} });
    setShowAddForm(false);
  };

  const filteredObjects = objects.filter(obj => obj.category === activeCategory);

  return (
    <Card className="backdrop-blur-sm bg-white/60 border border-white/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Brain className="w-5 h-5" />
          Digital Objects Management
        </CardTitle>
        <CardDescription>
          Define digital equivalents for real-world items in your construction project for the Digital Twin system
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Category Tabs */}
        <Tabs value={activeCategory} onValueChange={setActiveCategory}>
          <TabsList className="grid w-full grid-cols-4 lg:grid-cols-7 gap-2">
            {categories.map((category) => (
              <TabsTrigger
                key={category.id}
                value={category.id}
                className="flex items-center gap-1 text-xs"
              >
                <category.icon className="w-3 h-3" />
                <span className="hidden lg:inline">{category.label.split(' ')[0]}</span>
              </TabsTrigger>
            ))}
          </TabsList>

          {categories.map((category) => (
            <TabsContent key={category.id} value={category.id} className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold">{category.label}</h3>
                  <p className="text-sm text-muted-foreground">
                    {filteredObjects.length} objects defined
                  </p>
                </div>
                <Button
                  onClick={() => {
                    setNewObject({ ...newObject, category: category.id });
                    setShowAddForm(true);
                  }}
                  size="sm"
                  className="flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Add Object
                </Button>
              </div>

              {/* Add Object Form */}
              {showAddForm && newObject.category === category.id && (
                <Card className="border border-dashed">
                  <CardContent className="pt-6 space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="object-name">Object Name</Label>
                        <Input
                          id="object-name"
                          value={newObject.name}
                          onChange={(e) => setNewObject({ ...newObject, name: e.target.value })}
                          placeholder="e.g., Ground Floor Slab"
                        />
                      </div>
                      <div>
                        <Label htmlFor="object-type">Object Type</Label>
                        <Select
                          value={newObject.type}
                          onValueChange={(value) => setNewObject({ ...newObject, type: value })}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select type" />
                          </SelectTrigger>
                          <SelectContent>
                            {objectTypes[category.id as keyof typeof objectTypes]?.map((type) => (
                              <SelectItem key={type} value={type}>
                                {type}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button onClick={handleAddObject} size="sm">
                        Add Object
                      </Button>
                      <Button
                        onClick={() => setShowAddForm(false)}
                        variant="outline"
                        size="sm"
                      >
                        Cancel
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Objects List */}
              <div className="space-y-3">
                {filteredObjects.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <category.icon className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p>No {category.label.toLowerCase()} defined yet</p>
                    <p className="text-sm">Click "Add Object" to create your first digital object</p>
                  </div>
                ) : (
                  filteredObjects.map((obj) => (
                    <Card key={obj.id} className="border border-white/20">
                      <CardContent className="pt-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <Badge variant="outline" className={category.color}>
                              {obj.type}
                            </Badge>
                            <div>
                              <h4 className="font-medium">{obj.name}</h4>
                              <p className="text-sm text-muted-foreground">
                                Created {new Date(obj.created_at).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Button size="sm" variant="outline">
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => setObjects(objects.filter(o => o.id !== obj.id))}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </TabsContent>
          ))}
        </Tabs>

        {/* Summary */}
        <Card className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-white/20">
          <CardContent className="pt-6">
            <div className="text-center">
              <h3 className="text-lg font-semibold mb-2">Digital Twin Summary</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Total digital objects defined for {project.name}
              </p>
              <div className="flex justify-center items-center gap-8">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{objects.length}</div>
                  <div className="text-sm text-muted-foreground">Total Objects</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">{categories.length}</div>
                  <div className="text-sm text-muted-foreground">Categories</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </CardContent>
    </Card>
  );
};