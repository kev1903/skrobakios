import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { Building2, Ruler, Package, DoorOpen, Settings, TreePine, FileCheck, Hammer } from "lucide-react";

interface DrawingData {
  drawing_info: {
    type: string;
    scale?: string;
    drawing_number?: string;
    revision?: string;
    date?: string;
  };
  spaces?: Array<{
    name: string;
    dimensions: { width?: number; length?: number; area?: number };
    level?: string;
    ceiling_height?: number;
    annotations?: string[];
  }>;
  construction_scope?: Array<{
    category: string;
    element: string;
    location?: string;
    material?: string;
    dimensions?: string;
    quantity?: number;
    unit?: string;
    specification?: string;
    construction_method?: string;
  }>;
  openings?: Array<{
    type: string;
    location?: string;
    dimensions?: { width?: number; height?: number };
    material?: string;
    quantity?: number;
  }>;
  services?: Array<{
    system: string;
    element: string;
    location?: string;
    specifications?: string[];
  }>;
  external_works?: Array<{
    element: string;
    material?: string;
    dimensions?: string;
    quantity?: number;
    unit?: string;
  }>;
  compliance?: Array<{
    standard: string;
    requirement: string;
    location?: string;
  }>;
  critical_dimensions?: Array<{
    description: string;
    dimension: string;
    location?: string;
  }>;
  construction_sequence?: Array<{
    stage: number;
    description: string;
    elements: string[];
  }>;
}

interface StructuredDataViewerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  data: DrawingData;
  documentName: string;
}

export const StructuredDataViewer = ({ open, onOpenChange, data, documentName }: StructuredDataViewerProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            {documentName} - Structured Analysis
          </DialogTitle>
          <div className="flex gap-2 flex-wrap pt-2">
            <Badge variant="outline">{data.drawing_info.type}</Badge>
            {data.drawing_info.scale && <Badge variant="outline">Scale: {data.drawing_info.scale}</Badge>}
            {data.drawing_info.drawing_number && <Badge variant="outline">#{data.drawing_info.drawing_number}</Badge>}
            {data.drawing_info.revision && <Badge variant="outline">Rev: {data.drawing_info.revision}</Badge>}
          </div>
        </DialogHeader>

        <Tabs defaultValue="scope" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="scope">
              <Package className="h-4 w-4 mr-2" />
              Scope ({data.construction_scope?.length || 0})
            </TabsTrigger>
            <TabsTrigger value="spaces">
              <Ruler className="h-4 w-4 mr-2" />
              Spaces ({data.spaces?.length || 0})
            </TabsTrigger>
            <TabsTrigger value="openings">
              <DoorOpen className="h-4 w-4 mr-2" />
              Openings ({data.openings?.length || 0})
            </TabsTrigger>
            <TabsTrigger value="more">More</TabsTrigger>
          </TabsList>

          <TabsContent value="scope" className="space-y-4">
            <Card className="p-4">
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <Hammer className="h-4 w-4" />
                Construction Scope Items
              </h3>
              {data.construction_scope && data.construction_scope.length > 0 ? (
                <div className="space-y-3">
                  {Object.entries(
                    data.construction_scope.reduce((acc, item) => {
                      if (!acc[item.category]) acc[item.category] = [];
                      acc[item.category].push(item);
                      return acc;
                    }, {} as Record<string, typeof data.construction_scope>)
                  ).map(([category, items]) => (
                    <div key={category} className="border-l-2 border-primary/50 pl-3">
                      <h4 className="font-medium mb-2">{category}</h4>
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                          <thead>
                            <tr className="border-b">
                              <th className="text-left p-2">Element</th>
                              <th className="text-left p-2">Material</th>
                              <th className="text-left p-2">Quantity</th>
                              <th className="text-left p-2">Location</th>
                              <th className="text-left p-2">Specification</th>
                            </tr>
                          </thead>
                          <tbody>
                            {items.map((item, idx) => (
                              <tr key={idx} className="border-b hover:bg-muted/50">
                                <td className="p-2 font-medium">{item.element}</td>
                                <td className="p-2">{item.material || '-'}</td>
                                <td className="p-2">
                                  {item.quantity && item.unit ? `${item.quantity} ${item.unit}` : '-'}
                                </td>
                                <td className="p-2">{item.location || '-'}</td>
                                <td className="p-2 text-xs">{item.specification || '-'}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground">No construction scope items extracted</p>
              )}
            </Card>
          </TabsContent>

          <TabsContent value="spaces" className="space-y-4">
            <Card className="p-4">
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <Ruler className="h-4 w-4" />
                Rooms & Spaces
              </h3>
              {data.spaces && data.spaces.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left p-2">Space Name</th>
                        <th className="text-left p-2">Dimensions</th>
                        <th className="text-left p-2">Area</th>
                        <th className="text-left p-2">Level</th>
                        <th className="text-left p-2">Ceiling Height</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.spaces.map((space, idx) => (
                        <tr key={idx} className="border-b hover:bg-muted/50">
                          <td className="p-2 font-medium">{space.name}</td>
                          <td className="p-2">
                            {space.dimensions.width && space.dimensions.length
                              ? `${space.dimensions.width}m × ${space.dimensions.length}m`
                              : '-'}
                          </td>
                          <td className="p-2">
                            {space.dimensions.area ? `${space.dimensions.area}m²` : '-'}
                          </td>
                          <td className="p-2">{space.level || '-'}</td>
                          <td className="p-2">
                            {space.ceiling_height ? `${space.ceiling_height}m` : '-'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-muted-foreground">No spaces extracted</p>
              )}
            </Card>
          </TabsContent>

          <TabsContent value="openings" className="space-y-4">
            <Card className="p-4">
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <DoorOpen className="h-4 w-4" />
                Doors & Windows
              </h3>
              {data.openings && data.openings.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left p-2">Type</th>
                        <th className="text-left p-2">Size</th>
                        <th className="text-left p-2">Material</th>
                        <th className="text-left p-2">Quantity</th>
                        <th className="text-left p-2">Location</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.openings.map((opening, idx) => (
                        <tr key={idx} className="border-b hover:bg-muted/50">
                          <td className="p-2 font-medium">{opening.type}</td>
                          <td className="p-2">
                            {opening.dimensions?.width && opening.dimensions?.height
                              ? `${opening.dimensions.width}mm × ${opening.dimensions.height}mm`
                              : '-'}
                          </td>
                          <td className="p-2">{opening.material || '-'}</td>
                          <td className="p-2">{opening.quantity || 1}</td>
                          <td className="p-2">{opening.location || '-'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-muted-foreground">No openings extracted</p>
              )}
            </Card>
          </TabsContent>

          <TabsContent value="more" className="space-y-4">
            {data.services && data.services.length > 0 && (
              <Card className="p-4">
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <Settings className="h-4 w-4" />
                  Services & MEP ({data.services.length})
                </h3>
                <div className="space-y-2">
                  {Object.entries(
                    data.services.reduce((acc, service) => {
                      if (!acc[service.system]) acc[service.system] = [];
                      acc[service.system].push(service);
                      return acc;
                    }, {} as Record<string, typeof data.services>)
                  ).map(([system, items]) => (
                    <div key={system} className="border-l-2 border-primary/50 pl-3">
                      <h4 className="font-medium mb-1">{system}</h4>
                      <ul className="text-sm space-y-1">
                        {items.map((item, idx) => (
                          <li key={idx}>
                            <strong>{item.element}</strong>
                            {item.location && ` (${item.location})`}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </Card>
            )}

            {data.external_works && data.external_works.length > 0 && (
              <Card className="p-4">
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <TreePine className="h-4 w-4" />
                  External Works ({data.external_works.length})
                </h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left p-2">Element</th>
                        <th className="text-left p-2">Material</th>
                        <th className="text-left p-2">Quantity</th>
                        <th className="text-left p-2">Dimensions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.external_works.map((work, idx) => (
                        <tr key={idx} className="border-b hover:bg-muted/50">
                          <td className="p-2 font-medium">{work.element}</td>
                          <td className="p-2">{work.material || '-'}</td>
                          <td className="p-2">
                            {work.quantity && work.unit ? `${work.quantity} ${work.unit}` : '-'}
                          </td>
                          <td className="p-2">{work.dimensions || '-'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Card>
            )}

            {data.compliance && data.compliance.length > 0 && (
              <Card className="p-4">
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <FileCheck className="h-4 w-4" />
                  Compliance & Standards ({data.compliance.length})
                </h3>
                <ul className="space-y-2 text-sm">
                  {data.compliance.map((comp, idx) => (
                    <li key={idx} className="border-l-2 border-primary/50 pl-3">
                      <strong>{comp.standard}:</strong> {comp.requirement}
                      {comp.location && ` (${comp.location})`}
                    </li>
                  ))}
                </ul>
              </Card>
            )}

            {data.critical_dimensions && data.critical_dimensions.length > 0 && (
              <Card className="p-4">
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <Ruler className="h-4 w-4" />
                  Critical Dimensions ({data.critical_dimensions.length})
                </h3>
                <ul className="space-y-1 text-sm">
                  {data.critical_dimensions.map((dim, idx) => (
                    <li key={idx}>
                      <strong>{dim.description}:</strong> {dim.dimension}
                      {dim.location && ` (${dim.location})`}
                    </li>
                  ))}
                </ul>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};
