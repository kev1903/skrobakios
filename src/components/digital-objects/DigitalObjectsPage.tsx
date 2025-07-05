import { ProjectSidebar } from "../ProjectSidebar";
import { DigitalObjectsPageProps } from "./types";
import { DigitalObjectsHeader } from "./DigitalObjectsHeader";
import { DigitalObjectsTable } from "./DigitalObjectsTable";
import { useDigitalObjects } from "./useDigitalObjects";
import { getStatusColor, getStatusText } from "./utils";

export const DigitalObjectsPage = ({ project, onNavigate }: DigitalObjectsPageProps) => {
  const {
    digitalObjects,
    loading,
    editingId,
    editingData,
    setEditingData,
    handleRowClick,
    handleSave,
    handleCancel,
    handleDragEnd
  } = useDigitalObjects();

  return (
    <div className="h-screen flex backdrop-blur-xl bg-black/20 border border-white/10">
      {/* Project Sidebar */}
      <ProjectSidebar
        project={project}
        onNavigate={onNavigate}
        getStatusColor={getStatusColor}
        getStatusText={getStatusText}
        activeSection="digital-objects"
      />

      {/* Main Content */}
      <div className="flex-1 overflow-auto ml-48 backdrop-blur-xl bg-white/5 border-l border-white/10">
        <div className="p-8">
          <DigitalObjectsHeader />
          
          <DigitalObjectsTable
            digitalObjects={digitalObjects}
            loading={loading}
            editingId={editingId}
            editingData={editingData}
            onRowClick={handleRowClick}
            onSave={handleSave}
            onCancel={handleCancel}
            onEditingDataChange={setEditingData}
            onDragEnd={handleDragEnd}
          />
        </div>
      </div>
    </div>
  );
};