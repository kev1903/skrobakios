import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { DropResult } from "react-beautiful-dnd";
import { DigitalObject } from "./types";
import { Tables } from "@/integrations/supabase/types";

type SortDirection = 'asc' | 'desc' | null;

export const useDigitalObjects = () => {
  const { toast } = useToast();
  const [editingField, setEditingField] = useState<{id: string, field: keyof DigitalObject} | null>(null);
  const [editingData, setEditingData] = useState<Partial<DigitalObject>>({});
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [stageSortDirection, setStageSortDirection] = useState<SortDirection>(null);
  const [digitalObjects, setDigitalObjects] = useState<DigitalObject[]>([]);

  // Load digital objects from database
  useEffect(() => {
    loadDigitalObjects();
  }, []);

  const loadDigitalObjects = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('digital_objects')
        .select('*')
        .order('created_at', { ascending: true });

      if (error) {
        console.error('Error loading digital objects:', error);
        toast({
          title: "Error",
          description: "Failed to load digital objects",
          variant: "destructive",
        });
        return;
      }

      if (data && data.length > 0) {
        // Map database fields to our DigitalObject type
        const mappedData: DigitalObject[] = data.map(item => ({
          id: item.id,
          name: item.name,
          object_type: item.object_type,
          description: item.description,
          status: item.status,
          stage: item.stage,
          level: item.level,
          parent_id: item.parent_id,
          expanded: item.expanded ?? true
        }));
        setDigitalObjects(mappedData);
      } else {
        // Initialize with default data if database is empty
        await initializeDefaultData();
      }
    } catch (error) {
      console.error('Error loading digital objects:', error);
      toast({
        title: "Error",
        description: "Failed to load digital objects",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const initializeDefaultData = async () => {
    const defaultData = [
      // 4.0 PRELIMINARY  
      { name: "Townplanner", object_type: "professional", description: "Planning and zoning consultation", status: "planning", stage: "4.0 PRELIMINARY", level: 0, parent_id: null, expanded: true },
      { name: "INARC", object_type: "professional", description: "Architectural services", status: "planning", stage: "4.0 PRELIMINARY", level: 0, parent_id: null },
      { name: "Site Feature & Re-establishment", object_type: "site_work", description: "Site preparation and establishment", status: "planning", stage: "4.0 PRELIMINARY", level: 0, parent_id: null },
      { name: "Roof Drainage Design", object_type: "design", description: "Roof drainage system design", status: "planning", stage: "4.0 PRELIMINARY", level: 0, parent_id: null },
      { name: "Architectural", object_type: "design", description: "Architectural design services", status: "planning", stage: "4.0 PRELIMINARY", level: 0, parent_id: null },
      
      // 4.1 PRE-CONSTRUCTION
      { name: "Asset Protection", object_type: "protection", description: "Asset protection measures", status: "planning", stage: "4.1 PRE-CONSTRUCTION", level: 0, parent_id: null, expanded: true },
      { name: "Demolition", object_type: "demolition", description: "Demolition work", status: "planning", stage: "4.1 PRE-CONSTRUCTION", level: 0, parent_id: null },
      
      // 5.1 BASE STAGE
      { name: "Excavation", object_type: "earthwork", description: "Site excavation work", status: "planning", stage: "5.1 BASE STAGE", level: 0, parent_id: null },
      { name: "Retaining Wall", object_type: "structure", description: "Retaining wall construction", status: "planning", stage: "5.1 BASE STAGE", level: 0, parent_id: null },
      
      // 5.2 FRAME STAGE
      { name: "Windows", object_type: "windows", description: "Window installation", status: "planning", stage: "5.2 FRAME STAGE", level: 0, parent_id: null },
      { name: "Trusses & Frames", object_type: "structure", description: "Roof trusses and frames", status: "planning", stage: "5.2 FRAME STAGE", level: 0, parent_id: null },
    ];

    try {
      const { data, error } = await supabase
        .from('digital_objects')
        .insert(defaultData)
        .select();

      if (error) {
        console.error('Error initializing default data:', error);
        return;
      }

      if (data) {
        const mappedData: DigitalObject[] = data.map(item => ({
          id: item.id,
          name: item.name,
          object_type: item.object_type,
          description: item.description,
          status: item.status,
          stage: item.stage,
          level: item.level,
          parent_id: item.parent_id,
          expanded: item.expanded ?? true
        }));
        setDigitalObjects(mappedData);
      }
    } catch (error) {
      console.error('Error initializing default data:', error);
    }
  };

  // Sort function for stage column
  const handleStageSort = () => {
    let newDirection: SortDirection;
    if (stageSortDirection === null || stageSortDirection === 'desc') {
      newDirection = 'asc';
    } else {
      newDirection = 'desc';
    }
    setStageSortDirection(newDirection);
    
    const sorted = [...digitalObjects].sort((a, b) => {
      if (newDirection === 'asc') {
        return a.stage.localeCompare(b.stage);
      } else {
        return b.stage.localeCompare(a.stage);
      }
    });
    
    setDigitalObjects(sorted);
  };

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
      // Save to database first
      const { error } = await supabase
        .from('digital_objects')
        .update(editingData)
        .eq('id', editingField.id);

      if (error) {
        console.error('Database update error:', error);
        toast({
          title: "Error",
          description: "Failed to save changes to database",
          variant: "destructive",
        });
        return;
      }

      // Update local state only after successful database save
      setDigitalObjects(prev => 
        prev.map(obj => 
          obj.id === editingField.id 
            ? { ...obj, ...editingData } as DigitalObject
            : obj
        )
      );

      toast({
        title: "Updated",
        description: "Digital object updated successfully",
      });

      setEditingField(null);
      setEditingData({});
    } catch (error) {
      console.error('Save error:', error);
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
    stageSortDirection,
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
    handleImportCSV,
    handleStageSort
  };
};