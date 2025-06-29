import { useState } from "react";
import { Upload, Download, Search, Grid, List, File, Eye, Trash2, Users, ExternalLink, Folder } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface FileItem {
  id: string;
  name: string;
  type: "file";
  size: number;
  createdAt: string;
  fileType: string;
}

export const FileList = () => {
  const [searchTerm, setSearchTerm] = useState("");
  
  const [cadFiles] = useState<FileItem[]>([
    {
      id: "1",
      name: "200914 - 2 - S11 rev P4.pdf",
      type: "file",
      size: 465300,
      createdAt: "20 Aug, 2023",
      fileType: "pdf"
    },
    {
      id: "2",
      name: "200914 - 2 - S11 rev P4.pdf",
      type: "file",
      size: 465300,
      createdAt: "20 Aug, 2023",
      fileType: "pdf"
    },
    {
      id: "3",
      name: "200914 - 2 - S11 rev P4.dwg",
      type: "file",
      size: 465300,
      createdAt: "20 Aug, 2023",
      fileType: "dwg"
    },
    {
      id: "4",
      name: "200914 - 2 - S11 rev P4.dwg200914 - 2 - S.jpg",
      type: "file",
      size: 465300,
      createdAt: "20 Aug, 2023",
      fileType: "jpg"
    },
    {
      id: "5",
      name: "200914 - 2 - S11 rev P4.jpg",
      type: "file",
      size: 465300,
      createdAt: "20 Aug, 2023",
      fileType: "jpg"
    },
    {
      id: "6",
      name: "200914 - 2 - v - S32 - Roof Framing.dwg",
      type: "file",
      size: 465300,
      createdAt: "20 Aug, 2023",
      fileType: "dwg"
    },
    {
      id: "7",
      name: "200914 - 2 - S11 rev P4.ifc",
      type: "file",
      size: 465300,
      createdAt: "20 Aug, 2023",
      fileType: "ifc"
    },
    {
      id: "8",
      name: "200914 - 2 - S11 rev P4.dwg",
      type: "file",
      size: 465300,
      createdAt: "20 Aug, 2023",
      fileType: "dwg"
    },
    {
      id: "9",
      name: "200914 - 2 - v - S31 - Level 3 - Mez.dwg",
      type: "file",
      size: 465300,
      createdAt: "20 Aug, 2023",
      fileType: "dwg"
    }
  ]);

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
  };

  const handleSharePointAccess = () => {
    window.open("https://enassee.sharepoint.com/:f:/s/SkrobakiProjects/Emw1CavunZZGqup2TMoIcd0BdA8uQDzqHGoqX4x4TI22qg?e=Ey0bOj", "_blank");
  };

  return (
    <div className="flex-1 p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Search"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-64"
            />
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" className="text-gray-600">
            <Users className="w-4 h-4 mr-2" />
            Export
          </Button>
          <Button variant="outline" className="text-gray-600">
            <Download className="w-4 h-4 mr-2" />
            Share
          </Button>
          <Button variant="outline">
            <Grid className="w-4 h-4 mr-2" />
          </Button>
          <Button variant="outline">
            <List className="w-4 h-4 mr-2" />
          </Button>
          <Button className="bg-blue-600 text-white">
            <Upload className="w-4 h-4 mr-2" />
            Upload Files
          </Button>
        </div>
      </div>

      {/* SharePoint Integration Section */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">SharePoint Integration</h3>
        
        <div className="bg-white rounded-lg border p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <Folder className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h4 className="font-medium text-gray-900">Skrobaki Projects</h4>
                <p className="text-sm text-gray-500">SharePoint folder with project files and documents</p>
              </div>
            </div>
            <Button 
              onClick={handleSharePointAccess}
              className="bg-blue-600 text-white hover:bg-blue-700"
            >
              <ExternalLink className="w-4 h-4 mr-2" />
              Open in SharePoint
            </Button>
          </div>
        </div>
      </div>

      {/* CAD File Section */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">CAD File</h3>
        
        <div className="bg-white rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50">
                <TableHead className="w-12">
                  <input type="checkbox" className="rounded" />
                </TableHead>
                <TableHead>File Name</TableHead>
                <TableHead>Size</TableHead>
                <TableHead>Last Update</TableHead>
                <TableHead>Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {cadFiles.map((file) => (
                <TableRow key={file.id} className="hover:bg-gray-50">
                  <TableCell>
                    <input type="checkbox" className="rounded" />
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-3">
                      <File className="w-4 h-4 text-gray-500" />
                      <span className="text-sm">{file.name}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-sm text-gray-600">
                    {formatFileSize(file.size)}
                  </TableCell>
                  <TableCell className="text-sm text-gray-600">
                    {file.createdAt}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-1">
                      <Button variant="ghost" size="sm">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Eye className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
};
