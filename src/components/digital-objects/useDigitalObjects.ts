import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { DropResult } from "react-beautiful-dnd";
import { DigitalObject, useDigitalObjectsContext } from "@/contexts/DigitalObjectsContext";

type SortDirection = 'asc' | 'desc' | null;

export const useDigitalObjects = () => {
  const { toast } = useToast();
  const { digitalObjects, loading, refreshDigitalObjects } = useDigitalObjectsContext();
  const [editingField, setEditingField] = useState<{id: string, field: keyof DigitalObject} | null>(null);
  const [editingData, setEditingData] = useState<Partial<DigitalObject>>({});
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [stageSortDirection, setStageSortDirection] = useState<SortDirection>(null);
  const [searchQuery, setSearchQuery] = useState("");

  // Sort function for stage column
  const handleStageSort = () => {
    let newDirection: SortDirection;
    if (stageSortDirection === null || stageSortDirection === 'desc') {
      newDirection = 'asc';
    } else {
      newDirection = 'desc';
    }
    setStageSortDirection(newDirection);
    
    // Note: Since we're using context, we'd need to implement sorting there
    // For now, just refresh the data
    refreshDigitalObjects();
  };

  // Filter digital objects based on search query
  const filteredObjects = digitalObjects.filter(obj => {
    if (!searchQuery.trim()) return true;
    
    const searchTerm = searchQuery.toLowerCase();
    return (
      obj.name.toLowerCase().includes(searchTerm) ||
      obj.object_type.toLowerCase().includes(searchTerm) ||
      (obj.description && obj.description.toLowerCase().includes(searchTerm)) ||
      obj.status.toLowerCase().includes(searchTerm) ||
      obj.stage.toLowerCase().includes(searchTerm)
    );
  });

  // Get visible rows based on expanded state
  const getVisibleRows = () => {
    const visible: DigitalObject[] = [];
    
    const addVisibleRows = (parentId: string | null, level: number = 0) => {
      const rowsAtLevel = filteredObjects.filter(obj => obj.parent_id === parentId && obj.level === level);
      
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

  const handleToggleExpand = async (id: string) => {
    try {
      const obj = digitalObjects.find(o => o.id === id);
      if (!obj) return;

      const { error } = await supabase
        .from('digital_objects')
        .update({ expanded: !obj.expanded })
        .eq('id', id);

      if (error) {
        console.error('Error updating expand state:', error);
        toast({
          title: "Error",
          description: "Failed to update expand state",
          variant: "destructive",
        });
        return;
      }

      // Refresh data from context
      await refreshDigitalObjects();
    } catch (error) {
      console.error('Error toggling expand:', error);
    }
  };

  const handleAddRow = async () => {
    try {
      const newRowData = {
        name: "",
        object_type: "",
        description: "",
        status: "planning",
        stage: "4.0 PRELIMINARY",
        level: 0,
        parent_id: null,
        expanded: true
      };

      const { data, error } = await supabase
        .from('digital_objects')
        .insert(newRowData)
        .select()
        .single();

      if (error) {
        console.error('Database insert error:', error);
        toast({
          title: "Error",
          description: "Failed to create new item in database",
          variant: "destructive",
        });
        return;
      }

      if (!data) {
        console.error('No data returned from insert');
        toast({
          title: "Error",
          description: "Failed to get new item data",
          variant: "destructive",
        });
        return;
      }

      // Refresh data from context to get the new row
      await refreshDigitalObjects();

      // Automatically start editing the name field of the new row
      setEditingField({ id: data.id, field: 'name' });
      setEditingData({ name: '' });

      toast({
        title: "Row Added",
        description: "New item added successfully - please enter a name",
      });
    } catch (error) {
      console.error('Error adding new row:', error);
      toast({
        title: "Error",
        description: "Failed to create new item",
        variant: "destructive",
      });
    }
  };

  const handleImportCSV = async (file: File) => {
    const reader = new FileReader();
    reader.onload = async (e) => {
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

        const newObjectsData = [];
        for (let i = 1; i < lines.length; i++) {
          const values = lines[i].split(',').map(v => v.trim().replace(/^"(.*)"$/, '$1'));
          
          if (values.length < headers.length) continue;

          const objData = {
            name: values[headers.indexOf('name')] || '',
            object_type: values[headers.indexOf('object_type')] || '',
            description: values[headers.indexOf('description')] || null,
            status: values[headers.indexOf('status')] || 'planning',
            stage: values[headers.indexOf('stage')] || '4.0 PRELIMINARY',
            level: 0,
            parent_id: null,
            expanded: true
          };

          newObjectsData.push(objData);
        }

        const { error } = await supabase
          .from('digital_objects')
          .insert(newObjectsData);

        if (error) {
          console.error('Database insert error:', error);
          toast({
            title: "Import Error",
            description: "Failed to save imported data to database",
            variant: "destructive",
          });
          return;
        }

        toast({
          title: "CSV Imported",
          description: `Successfully imported ${newObjectsData.length} items`,
        });

        // Refresh data from context
        await refreshDigitalObjects();
      } catch (error) {
        console.error('Import error:', error);
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
      setSelectedIds(prev => 
        prev.includes(id) 
          ? prev.filter(selectedId => selectedId !== id)
          : [...prev, id]
      );
    } else {
      setSelectedIds([id]);
    }
  };

  const handleIndent = async () => {
    if (selectedIds.length === 0) return;

    try {
      const updates = [];
      for (const id of selectedIds) {
        const obj = digitalObjects.find(o => o.id === id);
        const currentIndex = digitalObjects.findIndex(item => item.id === id);
        
        if (obj && currentIndex > 0) {
          const rowAbove = digitalObjects[currentIndex - 1];
          const newLevel = rowAbove.level + 1;
          
          if (newLevel > 4) {
            toast({
              title: "Maximum Indent Level",
              description: "Cannot indent beyond 5 levels",
              variant: "destructive"
            });
            continue;
          }
          
          updates.push({
            id,
            level: newLevel,
            parent_id: rowAbove.id
          });
        }
      }

      // Update all in database
      for (const update of updates) {
        await supabase
          .from('digital_objects')
          .update({ level: update.level, parent_id: update.parent_id })
          .eq('id', update.id);
      }

      toast({
        title: "Indented",
        description: `${updates.length} item(s) indented`,
      });

      // Refresh data from context
      await refreshDigitalObjects();
    } catch (error) {
      console.error('Error indenting:', error);
      toast({
        title: "Error",
        description: "Failed to indent items",
        variant: "destructive",
      });
    }
  };

  const handleOutdent = async () => {
    if (selectedIds.length === 0) return;

    try {
      const updates = [];
      for (const id of selectedIds) {
        const obj = digitalObjects.find(o => o.id === id);
        if (obj && obj.level > 0) {
          const newLevel = obj.level - 1;
          let newParentId = null;

          if (newLevel > 0) {
            const currentIndex = digitalObjects.findIndex(item => item.id === id);
            for (let i = currentIndex - 1; i >= 0; i--) {
              const prevItem = digitalObjects[i];
              if (prevItem.level === newLevel - 1) {
                newParentId = prevItem.id;
                break;
              }
            }
          }

          updates.push({
            id,
            level: newLevel,
            parent_id: newParentId
          });
        }
      }

      // Update all in database
      for (const update of updates) {
        await supabase
          .from('digital_objects')
          .update({ level: update.level, parent_id: update.parent_id })
          .eq('id', update.id);
      }

      toast({
        title: "Outdented",
        description: `${updates.length} item(s) moved up one level`,
      });

      // Refresh data from context
      await refreshDigitalObjects();
    } catch (error) {
      console.error('Error outdenting:', error);
      toast({
        title: "Error",
        description: "Failed to outdent items",
        variant: "destructive",
      });
    }
  };

  const handleSave = async () => {
    console.log("Save clicked - editingField:", editingField, "editingData:", editingData);
    
    if (!editingField || !editingData) {
      console.log("No editing field or data, returning");
      return;
    }

    try {
      console.log("Starting validation - field:", editingField.field, "name value:", editingData.name);
      
      // Validate required fields for new empty rows
      if (editingField.field === 'name' && (!editingData.name || editingData.name.trim() === '')) {
        console.log("Name validation failed");
        toast({
          title: "Validation Error",
          description: "Name is required",
          variant: "destructive",
        });
        return;
      }
      
      if (editingField.field === 'object_type' && (!editingData.object_type || editingData.object_type.trim() === '')) {
        console.log("Object type validation failed");
        toast({
          title: "Validation Error", 
          description: "Object type is required",
          variant: "destructive",
        });
        return;
      }

      console.log("Validation passed, about to update database with:", editingData, "for ID:", editingField.id);

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

      console.log("Database update successful");

      toast({
        title: "Updated",
        description: "Digital object updated successfully",
      });

      setEditingField(null);
      setEditingData({});

      // Refresh data from context
      await refreshDigitalObjects();
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

  const handleDragEnd = async (result: DropResult) => {
    if (!result.destination) return;

    const { source, destination, draggableId, combine } = result;
    
    if (source.index === destination.index) return;

    const draggedObject = digitalObjects.find(obj => obj.id === draggableId);
    if (!draggedObject) return;

    try {
      let updateData: any = {};

      if (combine) {
        const targetId = combine.draggableId;
        const targetObject = digitalObjects.find(obj => obj.id === targetId);
        
        if (targetObject) {
          updateData = {
            parent_id: targetId,
            level: targetObject.level + 1
          };
        }
      } else {
        const visibleRows = getVisibleRows();
        const targetRow = visibleRows[destination.index];
        const prevRow = destination.index > 0 ? visibleRows[destination.index - 1] : null;
        
        let newParentId = null;
        let newLevel = 0;
        
        if (destination.index === 0) {
          newLevel = 0;
          newParentId = null;
        } else if (prevRow) {
          newLevel = prevRow.level;
          newParentId = prevRow.parent_id;
          
          if (targetRow && targetRow.parent_id === prevRow.id && targetRow.level > prevRow.level) {
            newLevel = prevRow.level + 1;
            newParentId = prevRow.id;
          }
        }
        
        updateData = {
          parent_id: newParentId,
          level: newLevel
        };
      }

      const { error } = await supabase
        .from('digital_objects')
        .update(updateData)
        .eq('id', draggableId);

      if (error) {
        console.error('Database update error:', error);
        toast({
          title: "Error",
          description: "Failed to save drag operation",
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Item Moved",
        description: `${draggedObject.name} repositioned`,
      });

      // Refresh data from context
      await refreshDigitalObjects();
    } catch (error) {
      console.error('Drag save error:', error);
      toast({
        title: "Error",
        description: "Failed to save drag operation",
        variant: "destructive",
      });
    }
  };

  return {
    digitalObjects: getVisibleRows(),
    loading,
    editingField,
    editingData,
    selectedIds,
    stageSortDirection,
    searchQuery,
    setEditingData,
    setSearchQuery,
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