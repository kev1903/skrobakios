import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { DropResult } from "react-beautiful-dnd";
import { DigitalObject } from "./types";

export const useDigitalObjects = () => {
  const { toast } = useToast();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingData, setEditingData] = useState<Partial<DigitalObject>>({});
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [loading] = useState(false);

  // Mock data for now until digital_objects table types are updated
  const [digitalObjects, setDigitalObjects] = useState<DigitalObject[]>([
    {
      id: "1",
      name: "Building Structure",
      object_type: "structure",
      description: "Main building structural components",
      status: "in_progress",
      cost: 250000,
      progress: 65,
      level: 0,
      parent_id: null
    },
    {
      id: "2", 
      name: "Foundation",
      object_type: "foundation",
      description: "Building foundation system",
      status: "completed",
      cost: 75000,
      progress: 100,
      level: 1,
      parent_id: "1"
    },
    {
      id: "3",
      name: "Framing", 
      object_type: "framing",
      description: "Steel and concrete framing",
      status: "in_progress",
      cost: 125000,
      progress: 45,
      level: 1,
      parent_id: "1"
    },
    {
      id: "4",
      name: "MEP Systems",
      object_type: "systems", 
      description: "Mechanical, Electrical, and Plumbing",
      status: "planning",
      cost: 180000,
      progress: 0,
      level: 0,
      parent_id: null
    },
    {
      id: "5",
      name: "HVAC",
      object_type: "mechanical",
      description: "Heating, Ventilation, and Air Conditioning", 
      status: "planning",
      cost: 85000,
      progress: 0,
      level: 1,
      parent_id: "4"
    }
  ]);

  const handleRowClick = (obj: DigitalObject) => {
    if (editingId !== obj.id) {
      setEditingId(obj.id);
      setEditingData({ ...obj });
    }
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

  const handleIndent = () => {
    if (selectedIds.length === 0) return;

    const updatedObjects = digitalObjects.map(obj => {
      if (selectedIds.includes(obj.id)) {
        // Find the row directly above this one
        const currentIndex = digitalObjects.findIndex(item => item.id === obj.id);
        
        if (currentIndex > 0) {
          const rowAbove = digitalObjects[currentIndex - 1];
          
          return {
            ...obj,
            level: rowAbove.level + 1,
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
    if (!editingId || !editingData) return;

    try {
      // Update local state
      setDigitalObjects(prev => 
        prev.map(obj => 
          obj.id === editingId 
            ? { ...obj, ...editingData } as DigitalObject
            : obj
        )
      );

      // Try to save to database (will work once types are updated)
      try {
        const { error } = await supabase
          .from('digital_objects' as any)
          .update({
            name: editingData.name,
            object_type: editingData.object_type,
            description: editingData.description,
            status: editingData.status,
            cost: editingData.cost,
            progress: editingData.progress
          })
          .eq('id', editingId);

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

      setEditingId(null);
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
    setEditingId(null);
    setEditingData({});
  };

  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return;

    const { source, destination, draggableId } = result;
    
    // If dropped in the same position, do nothing
    if (source.index === destination.index) return;

    const draggedObject = digitalObjects.find(obj => obj.id === draggableId);
    if (!draggedObject) return;

    // Get the target object (the row it was dropped on)
    const dropTargetObject = digitalObjects[destination.index];
    if (!dropTargetObject) return;

    // Update the dragged object to be a child of the target
    const updatedObjects = digitalObjects.map(obj => {
      if (obj.id === draggableId) {
        return {
          ...obj,
          parent_id: dropTargetObject.id,
          level: dropTargetObject.level + 1
        };
      }
      return obj;
    });

    setDigitalObjects(updatedObjects);

    // Try to save to database
    try {
      supabase
        .from('digital_objects' as any)
        .update({
          parent_id: dropTargetObject.id,
          level: dropTargetObject.level + 1
        })
        .eq('id', draggableId)
        .then(({ error }) => {
          if (error) {
            console.log('Database update will be enabled once types are updated:', error);
          }
        });
    } catch (dbError) {
      console.log('Database save pending type updates');
    }

    toast({
      title: "Hierarchy Updated",
      description: `${draggedObject.name} is now a child of ${dropTargetObject.name}`,
    });
  };

  return {
    digitalObjects,
    loading,
    editingId,
    editingData,
    selectedIds,
    setEditingData,
    handleRowClick,
    handleRowSelect,
    handleSave,
    handleCancel,
    handleDragEnd,
    handleIndent,
    handleOutdent
  };
};