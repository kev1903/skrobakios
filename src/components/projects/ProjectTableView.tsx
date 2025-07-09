import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Eye } from "lucide-react";
import { ProjectTableViewProps } from "./types";
import { getStatusColor, getStatusText, formatDate } from "./utils";
import { SortableTableHeader } from "./SortableTableHeader";

export const ProjectTableView = ({
  projects,
  selectedProjects,
  sortField,
  sortDirection,
  onSort,
  onSelectAll,
  onSelectProject,
  onProjectClick,
}: ProjectTableViewProps) => {
  const isAllSelected = selectedProjects.length === projects.length && projects.length > 0;
  const isIndeterminate = selectedProjects.length > 0 && selectedProjects.length < projects.length;

  return (
    <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/50 border-border hover:bg-muted transition-colors duration-200 h-10">
            <TableHead className="w-10 py-2">
              <input
                type="checkbox"
                checked={isAllSelected}
                ref={(el) => {
                  if (el) el.indeterminate = isIndeterminate;
                }}
                onChange={(e) => onSelectAll(e.target.checked)}
                className="rounded border-input bg-background text-primary focus:ring-primary/30 scale-90"
              />
            </TableHead>
             <SortableTableHeader field="project_id" sortField={sortField} sortDirection={sortDirection} onSort={onSort}>ID</SortableTableHeader>
             <SortableTableHeader field="name" sortField={sortField} sortDirection={sortDirection} onSort={onSort}>Project Name</SortableTableHeader>
             <SortableTableHeader field="description" sortField={sortField} sortDirection={sortDirection} onSort={onSort}>Description</SortableTableHeader>
             <SortableTableHeader field="status" sortField={sortField} sortDirection={sortDirection} onSort={onSort}>Status</SortableTableHeader>
            <TableHead className="w-10 py-2"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {projects.map((project) => {
            console.log("Rendering project:", project.name, "with ID:", project.id);
            return (
              <TableRow key={project.id} className="hover:bg-muted/50 border-border transition-colors duration-200 h-12">
                <TableCell className="py-2">
                  <input
                    type="checkbox"
                    checked={selectedProjects.includes(project.id)}
                    onChange={(e) => onSelectProject(project.id, e.target.checked)}
                    className="rounded border-input bg-background text-primary focus:ring-primary/30 scale-90"
                  />
                </TableCell>
                <TableCell className="font-mono text-sm text-muted-foreground py-2">
                  #{project.project_id}
                </TableCell>
                <TableCell className="font-medium text-foreground py-2">
                  <button
                    onClick={() => onProjectClick(project.id)}
                    className="text-primary hover:text-primary/80 hover:underline cursor-pointer text-left transition-colors duration-200"
                  >
                    {project.name}
                  </button>
                </TableCell>
                 <TableCell className="text-muted-foreground py-2">
                   {project.description || '-'}
                 </TableCell>
                <TableCell className="py-2">
                  <Badge 
                    variant="outline" 
                    className={getStatusColor(project.status)}
                  >
                    {getStatusText(project.status)}
                  </Badge>
                </TableCell>
                <TableCell className="py-2">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" className="w-6 h-6 p-0 text-muted-foreground hover:bg-muted hover:text-foreground transition-all duration-200">
                        <MoreHorizontal className="w-3 h-3" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="bg-card border border-border shadow-xl">
                      <DropdownMenuItem 
                        className="flex items-center space-x-2 text-foreground hover:bg-muted focus:bg-muted transition-colors duration-200 text-sm"
                        onClick={() => onProjectClick(project.id)}
                      >
                        <Eye className="w-3 h-3" />
                        <span className="text-sm">View Details</span>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
};