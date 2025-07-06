import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { DropResult } from "react-beautiful-dnd";
import { DigitalObject } from "./types";

export const useDigitalObjects = () => {
  const { toast } = useToast();
  const [editingField, setEditingField] = useState<{id: string, field: keyof DigitalObject} | null>(null);
  const [editingData, setEditingData] = useState<Partial<DigitalObject>>({});
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [loading] = useState(false);

  // Mock data for now until digital_objects table types are updated
  const [digitalObjects, setDigitalObjects] = useState<DigitalObject[]>([
    {
      id: "1",
      name: "Townplanner",
      object_type: "professional",
      description: "Planning and zoning consultation",
      status: "planning",
      stage: "4.0 PRELIMINARY",
      level: 0,
      parent_id: null,
      expanded: true
    },
    {
      id: "2", 
      name: "INARC",
      object_type: "professional",
      description: "Architectural services",
      status: "planning",
      stage: "4.0 PRELIMINARY",
      level: 0,
      parent_id: null
    },
    {
      id: "3",
      name: "Site Feature & Re-establishment", 
      object_type: "site_work",
      description: "Site preparation and establishment",
      status: "planning",
      stage: "4.0 PRELIMINARY",
      level: 0,
      parent_id: null
    },
    {
      id: "4",
      name: "Roof Drainage Design",
      object_type: "design", 
      description: "Roof drainage system design",
      status: "planning",
      stage: "4.0 PRELIMINARY",
      level: 0,
      parent_id: null
    },
    {
      id: "5",
      name: "Architectural",
      object_type: "design",
      description: "Architectural design services", 
      status: "planning",
      stage: "4.0 PRELIMINARY",
      level: 0,
      parent_id: null
    },
    {
      id: "6",
      name: "Project Estimate",
      object_type: "estimate",
      description: "Project cost estimation", 
      status: "planning",
      stage: "4.0 PRELIMINARY",
      level: 0,
      parent_id: null
    },
    {
      id: "7",
      name: "Performance Solution Report",
      object_type: "report",
      description: "Building performance analysis", 
      status: "planning",
      stage: "4.0 PRELIMINARY",
      level: 0,
      parent_id: null
    },
    {
      id: "8",
      name: "Landscape Designer / Architect",
      object_type: "professional",
      description: "Landscape design services", 
      status: "planning",
      stage: "4.0 PRELIMINARY",
      level: 0,
      parent_id: null
    },
    {
      id: "9",
      name: "Interior Designer / Interior Designer",
      object_type: "professional",
      description: "Interior design services", 
      status: "planning",
      stage: "4.0 PRELIMINARY",
      level: 0,
      parent_id: null
    },
    {
      id: "10",
      name: "Domestic Building Insurance",
      object_type: "insurance",
      description: "Building insurance coverage", 
      status: "planning",
      stage: "4.0 PRELIMINARY",
      level: 0,
      parent_id: null
    },
    {
      id: "11",
      name: "Work Protection Insurance",
      object_type: "insurance",
      description: "Work protection insurance", 
      status: "planning",
      stage: "4.0 PRELIMINARY",
      level: 0,
      parent_id: null
    },
    {
      id: "12",
      name: "Geotechnical Soil Testing",
      object_type: "testing",
      description: "Soil analysis and testing", 
      status: "planning",
      stage: "4.0 PRELIMINARY",
      level: 0,
      parent_id: null
    },
    {
      id: "13",
      name: "Engineering",
      object_type: "professional",
      description: "Engineering services", 
      status: "planning",
      stage: "4.0 PRELIMINARY",
      level: 0,
      parent_id: null
    },
    {
      id: "14",
      name: "Energy Report",
      object_type: "report",
      description: "Energy efficiency assessment", 
      status: "planning",
      stage: "4.0 PRELIMINARY",
      level: 0,
      parent_id: null
    },
    {
      id: "15",
      name: "Construction Management Services",
      object_type: "management",
      description: "Construction management and supervision", 
      status: "planning",
      stage: "4.0 PRELIMINARY",
      level: 0,
      parent_id: null
    },
    {
      id: "16",
      name: "Civil Drainage Design",
      object_type: "design",
      description: "Civil drainage system design", 
      status: "planning",
      stage: "4.0 PRELIMINARY",
      level: 0,
      parent_id: null
    },
    {
      id: "17",
      name: "Building Surveying",
      object_type: "survey",
      description: "Building surveying services", 
      status: "planning",
      stage: "4.0 PRELIMINARY",
      level: 0,
      parent_id: null
    },
    {
      id: "18",
      name: "Permit Levy",
      object_type: "permit",
      description: "Permit fees and charges", 
      status: "planning",
      stage: "4.0 PRELIMINARY",
      level: 0,
      parent_id: null
    },
    {
      id: "19",
      name: "CONTINGENCY",
      object_type: "contingency",
      description: "Project contingency allowance", 
      status: "planning",
      stage: "4.0 PRELIMINARY",
      level: 0,
      parent_id: null
    }
  ]);

  // Get visible rows based on expanded state (no subtotal calculation needed)

  const getVisibleRows = () => {
    const visible: DigitalObject[] = [];
    
    const addVisibleRows = (parentId: string | null, level: number = 0) => {
      const rowsAtLevel = digitalObjects.filter(obj => obj.parent_id === parentId && obj.level === level);
      
      for (const row of rowsAtLevel) {
        visible.push(row);
        
        // If this row is expanded, add its children
        if (row.expanded !== false) {
          addVisibleRows(row.id, level + 1);
        }
      }
    };
    
    addVisibleRows(null, 0);
    return visible;
  };

  const handleToggleExpand = (id: string) => {
    setDigitalObjects(prev => 
      prev.map(obj => 
        obj.id === id ? { ...obj, expanded: !obj.expanded } : obj
      )
    );
  };

  const handleAddRow = () => {
    const newId = (Math.max(...digitalObjects.map(obj => parseInt(obj.id))) + 1).toString();
    const newRow: DigitalObject = {
      id: newId,
      name: "",
      object_type: "",
      description: "",
      status: "planning",
      stage: "4.0 PRELIMINARY",
      level: 0,
      parent_id: null,
      expanded: true
    };
    
    setDigitalObjects(prev => [...prev, newRow]);
    toast({
      title: "Row Added",
      description: "New item added successfully",
    });
  };

  const handleImportCSV = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target?.result as string;
        const lines = text.split('\n').filter(line => line.trim());
        
        if (lines.length < 2) {
          toast({
            title: "Invalid CSV",
            description: "CSV must have at least a header row and one data row",
            variant: "destructive"
          });
          return;
        }

        const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
        const requiredHeaders = ['name', 'object_type', 'description', 'status', 'stage'];
        
        const missingHeaders = requiredHeaders.filter(h => !headers.includes(h));
        if (missingHeaders.length > 0) {
          toast({
            title: "Missing Columns",
            description: `CSV must include columns: ${missingHeaders.join(', ')}`,
            variant: "destructive"
          });
          return;
        }

        const newObjects: DigitalObject[] = [];
        let maxId = Math.max(...digitalObjects.map(obj => parseInt(obj.id))) + 1;

        for (let i = 1; i < lines.length; i++) {
          const values = lines[i].split(',').map(v => v.trim().replace(/^"(.*)"$/, '$1'));
          
          if (values.length < headers.length) continue;

          const obj: DigitalObject = {
            id: maxId.toString(),
            name: values[headers.indexOf('name')] || '',
            object_type: values[headers.indexOf('object_type')] || '',
            description: values[headers.indexOf('description')] || null,
            status: values[headers.indexOf('status')] || 'planning',
            stage: values[headers.indexOf('stage')] || '4.0 PRELIMINARY',
            level: 0,
            parent_id: null,
            expanded: true
          };

          newObjects.push(obj);
          maxId++;
        }

        setDigitalObjects(prev => [...prev, ...newObjects]);
        
        // Try to save to database
        newObjects.forEach(async (obj) => {
          try {
            const { error } = await supabase
              .from('digital_objects' as any)
              .insert(obj);
            
            if (error) {
              console.log('Database insert will be enabled once types are updated:', error);
            }
          } catch (dbError) {
            console.log('Database save pending type updates');
          }
        });

        toast({
          title: "CSV Imported",
          description: `Successfully imported ${newObjects.length} items`,
        });
      } catch (error) {
        toast({
          title: "Import Error",
          description: "Failed to parse CSV file. Please check the format.",
          variant: "destructive"
        });
      }
    };
    
    reader.readAsText(file);
  };

  const handleFieldClick = (obj: DigitalObject, field: keyof DigitalObject) => {
    setEditingField({ id: obj.id, field });
    setEditingData({ [field]: obj[field] });
  };

  const handleRowSelect = (id: string, event: React.MouseEvent) => {
    if (event.ctrlKey || event.metaKey) {
      // Ctrl/Cmd+click: toggle selection
      setSelectedIds(prev => 
        prev.includes(id) 
          ? prev.filter(selectedId => selectedId !== id)
          : [...prev, id]
      );
    } else {
      // Normal click: select single row
      setSelectedIds([id]);
    }
  };

  const handleIndent = () => {
    if (selectedIds.length === 0) return;

    const updatedObjects = digitalObjects.map(obj => {
      if (selectedIds.includes(obj.id)) {
        // Find the row directly above this one
        const currentIndex = digitalObjects.findIndex(item => item.id === obj.id);
        
        if (currentIndex > 0) {
          const rowAbove = digitalObjects[currentIndex - 1];
          const newLevel = rowAbove.level + 1;
          
          // Enforce maximum 5 levels (0-4)
          if (newLevel > 4) {
            toast({
              title: "Maximum Indent Level",
              description: "Cannot indent beyond 5 levels",
              variant: "destructive"
            });
            return obj;
          }
          
          return {
            ...obj,
            level: newLevel,
            parent_id: rowAbove.id
          };
        }
      }
      return obj;
    });

    setDigitalObjects(updatedObjects);
    toast({
      title: "Indented",
      description: `${selectedIds.length} item(s) indented`,
    });
  };

  const handleOutdent = () => {
    if (selectedIds.length === 0) return;

    const updatedObjects = digitalObjects.map(obj => {
      if (selectedIds.includes(obj.id) && obj.level > 0) {
        const newLevel = obj.level - 1;
        let newParentId = null;

        // Find the appropriate parent for the new level
        if (newLevel > 0) {
          const currentIndex = digitalObjects.findIndex(item => item.id === obj.id);
          // Look backwards to find a parent at the target level - 1
          for (let i = currentIndex - 1; i >= 0; i--) {
            const prevItem = digitalObjects[i];
            if (prevItem.level === newLevel - 1) {
              newParentId = prevItem.id;
              break;
            }
          }
        }

        return {
          ...obj,
          level: newLevel,
          parent_id: newParentId
        };
      }
      return obj;
    });

    setDigitalObjects(updatedObjects);
    toast({
      title: "Outdented",
      description: `${selectedIds.length} item(s) moved up one level`,
    });
  };

  const handleSave = async () => {
    if (!editingField || !editingData) return;

    try {
      // Update local state
      setDigitalObjects(prev => 
        prev.map(obj => 
          obj.id === editingField.id 
            ? { ...obj, ...editingData } as DigitalObject
            : obj
        )
      );

      // Try to save to database (will work once types are updated)
      try {
        const { error } = await supabase
          .from('digital_objects' as any)
          .update(editingData)
          .eq('id', editingField.id);

        if (error) {
          console.log('Database update will be enabled once types are updated:', error);
        }
      } catch (dbError) {
        console.log('Database save pending type updates');
      }

      toast({
        title: "Updated",
        description: "Digital object updated successfully",
      });

      setEditingField(null);
      setEditingData({});
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update digital object",
        variant: "destructive",
      });
    }
  };

  const handleCancel = () => {
    setEditingField(null);
    setEditingData({});
  };

  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return;

    const { source, destination, draggableId, combine } = result;
    
    // If dropped in the same position, do nothing
    if (source.index === destination.index) return;

    const draggedObject = digitalObjects.find(obj => obj.id === draggableId);
    if (!draggedObject) return;

    const visibleRows = getVisibleRows();
    const sourceIndex = source.index;
    const destIndex = destination.index;

    let updatedObjects = [...digitalObjects];
    let toastMessage = "";

    // Handle combining (dropping onto another row to make it a child)
    if (combine) {
      const targetId = combine.draggableId;
      const targetObject = digitalObjects.find(obj => obj.id === targetId);
      
      if (targetObject) {
        updatedObjects = digitalObjects.map(obj => {
          if (obj.id === draggableId) {
            return {
              ...obj,
              parent_id: targetId,
              level: targetObject.level + 1
            };
          }
          return obj;
        });
        toastMessage = `${draggedObject.name} is now a child of ${targetObject.name}`;
      }
    } else {
      // Handle reordering (dropping between rows)
      const targetRow = visibleRows[destIndex];
      const prevRow = destIndex > 0 ? visibleRows[destIndex - 1] : null;
      
      // Remove the dragged object from its current position in full array
      const draggedIndex = updatedObjects.findIndex(obj => obj.id === draggableId);
      const [removed] = updatedObjects.splice(draggedIndex, 1);
      
      // Determine new position and hierarchy
      let newParentId = null;
      let newLevel = 0;
      let insertIndex = 0;
      
      if (destIndex === 0) {
        // Dropped at the beginning
        insertIndex = 0;
        newLevel = 0;
        newParentId = null;
      } else if (prevRow) {
        // Dropped after another row - inherit its level and parent
        newLevel = prevRow.level;
        newParentId = prevRow.parent_id;
        
        // Find insertion point in full array
        const prevRowIndex = updatedObjects.findIndex(obj => obj.id === prevRow.id);
        insertIndex = prevRowIndex + 1;
        
        // If the next row (target) is a child of the previous row,
        // we might want to insert as a child too
        if (targetRow && targetRow.parent_id === prevRow.id && targetRow.level > prevRow.level) {
          newLevel = prevRow.level + 1;
          newParentId = prevRow.id;
        }
      } else {
        // Fallback
        insertIndex = destIndex;
      }
      
      // Update the dragged object with new hierarchy
      const updatedDraggedObject = {
        ...removed,
        parent_id: newParentId,
        level: newLevel
      };
      
      // Insert at the new position
      updatedObjects.splice(insertIndex, 0, updatedDraggedObject);
      toastMessage = `${draggedObject.name} moved to new position`;
    }

    setDigitalObjects(updatedObjects);

    // Try to save to database
    try {
      const draggedObj = updatedObjects.find(obj => obj.id === draggableId);
      if (draggedObj) {
        supabase
          .from('digital_objects' as any)
          .update({
            parent_id: draggedObj.parent_id,
            level: draggedObj.level
          })
          .eq('id', draggableId)
          .then(({ error }) => {
            if (error) {
              console.log('Database update will be enabled once types are updated:', error);
            }
          });
      }
    } catch (dbError) {
      console.log('Database save pending type updates');
    }

    toast({
      title: "Item Moved",
      description: toastMessage || `${draggedObject.name} repositioned`,
    });
  };

  return {
    digitalObjects: getVisibleRows(),
    loading,
    editingField,
    editingData,
    selectedIds,
    setEditingData,
    handleFieldClick,
    handleRowSelect,
    handleSave,
    handleCancel,
    handleDragEnd,
    handleIndent,
    handleOutdent,
    handleToggleExpand,
    handleAddRow,
    handleImportCSV
  };
};