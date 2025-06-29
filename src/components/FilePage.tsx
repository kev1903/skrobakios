
import { useState } from "react";
import { FilePageHeader } from "./FilePageHeader";
import { FolderTree } from "./FolderTree";
import { FileList } from "./FileList";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface FilePageProps {
  onNavigate: (page: string) => void;
}

export const FilePage = ({ onNavigate }: FilePageProps) => {
  const [newFolderName, setNewFolderName] = useState("");
  const [isCreateFolderOpen, setIsCreateFolderOpen] = useState(false);
  const [selectedFolder, setSelectedFolder] = useState<string | null>("project-files");
  const [activeTab, setActiveTab] = useState("folders");

  return (
    <div className="h-screen flex bg-gray-50">
      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <FilePageHeader activeTab={activeTab} onTabChange={setActiveTab} />

        {/* Content Area */}
        <div className="flex-1 flex">
          {/* Left Panel - Folder Tree */}
          <FolderTree 
            selectedFolder={selectedFolder} 
            onFolderSelect={setSelectedFolder} 
          />

          {/* Right Panel - File List */}
          <FileList />
        </div>
      </div>

      {/* Create Folder Dialog */}
      <Dialog open={isCreateFolderOpen} onOpenChange={setIsCreateFolderOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Folder</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="folder-name">Folder Name</Label>
              <Input
                id="folder-name"
                value={newFolderName}
                onChange={(e) => setNewFolderName(e.target.value)}
                placeholder="Enter folder name"
                className="mt-1"
              />
            </div>
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setIsCreateFolderOpen(false)}>
                Cancel
              </Button>
              <Button onClick={() => setIsCreateFolderOpen(false)}>
                Create
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
