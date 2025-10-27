import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { MousePointer, Pin } from "lucide-react";
import { useState } from "react";

interface Property {
  name: string;
  value: string | number;
}

interface PropertyGroup {
  groupName: string;
  properties: Property[];
}

interface PropertiesPanelProps {
  selectedObject?: any;
  isPinned?: boolean;
  onPinToggle?: () => void;
}

export const PropertiesPanel = ({ selectedObject, isPinned = false, onPinToggle }: PropertiesPanelProps) => {
  const [activeTab, setActiveTab] = useState("summary");

  return (
    <div className="h-full flex flex-col">
      <div className="px-6 py-4 border-b border-border/30 flex items-center justify-between">
        <h3 className="text-[11px] font-semibold text-luxury-gold uppercase tracking-wider">
          Properties
        </h3>
        {onPinToggle && (
          <button
            onClick={onPinToggle}
            className={`p-1.5 rounded-full transition-all duration-200 hover:bg-accent/50 ${
              isPinned ? 'text-luxury-gold bg-luxury-gold/10' : 'text-muted-foreground hover:text-luxury-gold'
            }`}
            title={isPinned ? "Unpin panel" : "Pin panel open"}
          >
            <Pin className={`h-3.5 w-3.5 transition-transform duration-200 ${isPinned ? 'rotate-45' : ''}`} />
          </button>
        )}
      </div>

      {selectedObject ? (
        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
          <div className="px-6 pt-4">
            <TabsList className="w-full bg-white/80 border border-border/30 rounded-xl p-1">
              <TabsTrigger value="summary" className="flex-1 data-[state=active]:bg-luxury-gold data-[state=active]:text-white">
                Summary
              </TabsTrigger>
              <TabsTrigger value="location" className="flex-1 data-[state=active]:bg-luxury-gold data-[state=active]:text-white">
                Location
              </TabsTrigger>
              <TabsTrigger value="partof" className="flex-1 data-[state=active]:bg-luxury-gold data-[state=active]:text-white">
                PartOf
              </TabsTrigger>
              <TabsTrigger value="clashes" className="flex-1 data-[state=active]:bg-luxury-gold data-[state=active]:text-white">
                Clashes
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="summary" className="flex-1 mt-0">
            <ScrollArea className="h-full">
              <div className="p-6">
                <div className="bg-white/80 backdrop-blur-xl rounded-2xl border border-border/30 overflow-hidden">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-muted/30 border-b border-border/30">
                        <th className="text-left px-4 py-3 text-[11px] font-semibold text-luxury-gold uppercase tracking-wider">
                          Property
                        </th>
                        <th className="text-left px-4 py-3 text-[11px] font-semibold text-luxury-gold uppercase tracking-wider">
                          Value
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-b border-border/10">
                        <td className="px-4 py-3 text-xs text-muted-foreground font-medium">Model</td>
                        <td className="px-4 py-3 text-xs text-foreground">{selectedObject.model || 'N/A'}</td>
                      </tr>
                      <tr className="border-b border-border/10">
                        <td className="px-4 py-3 text-xs text-muted-foreground font-medium">Name</td>
                        <td className="px-4 py-3 text-xs text-foreground break-all">{selectedObject.name}</td>
                      </tr>
                      <tr className="border-b border-border/10">
                        <td className="px-4 py-3 text-xs text-muted-foreground font-medium">Type</td>
                        <td className="px-4 py-3 text-xs text-foreground">{selectedObject.type}</td>
                      </tr>

                      {/* IFC Property Sets */}
                      {selectedObject.propertySets && selectedObject.propertySets.length > 0 && (
                        selectedObject.propertySets.map((propSet: any, setIdx: number) => (
                          Object.entries(propSet.properties).map(([key, value]: [string, any], propIdx: number) => (
                            <tr key={`${setIdx}-${propIdx}`} className="border-b border-border/10">
                              <td className="px-4 py-3 text-xs text-muted-foreground font-medium">{key}</td>
                              <td className="px-4 py-3 text-xs text-foreground break-all font-mono">
                                {typeof value === 'object' ? JSON.stringify(value) : String(value)}
                              </td>
                            </tr>
                          ))
                        ))
                      )}

                      {/* IFC Attributes */}
                      {selectedObject.attributes && Object.keys(selectedObject.attributes).length > 0 && (
                        Object.entries(selectedObject.attributes).map(([key, value]: [string, any], idx: number) => (
                          <tr key={`attr-${idx}`} className="border-b border-border/10">
                            <td className="px-4 py-3 text-xs text-muted-foreground font-medium">{key}</td>
                            <td className="px-4 py-3 text-xs text-foreground break-all font-mono">
                              {typeof value === 'object' ? JSON.stringify(value) : String(value)}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </ScrollArea>
          </TabsContent>

          <TabsContent value="location" className="flex-1 mt-0">
            <div className="flex flex-col items-center justify-center h-full p-8 text-center">
              <p className="text-sm text-muted-foreground">Location data not available</p>
            </div>
          </TabsContent>

          <TabsContent value="partof" className="flex-1 mt-0">
            <div className="flex flex-col items-center justify-center h-full p-8 text-center">
              <p className="text-sm text-muted-foreground">PartOf data not available</p>
            </div>
          </TabsContent>

          <TabsContent value="clashes" className="flex-1 mt-0">
            <div className="flex flex-col items-center justify-center h-full p-8 text-center">
              <p className="text-sm text-muted-foreground">Clashes data not available</p>
            </div>
          </TabsContent>
        </Tabs>
      ) : (
        <div className="flex flex-col items-center justify-center h-full p-8 text-center">
          <div className="w-16 h-16 rounded-full bg-muted/30 flex items-center justify-center mb-4">
            <MousePointer className="h-8 w-8 text-muted-foreground/40" />
          </div>
          <p className="text-sm font-medium text-muted-foreground mb-1">
            Select an object to view its properties
          </p>
        </div>
      )}
    </div>
  );
};
