
import { FileItem } from "./types";

export const projectFiles: FileItem[] = [
  {
    id: "1",
    name: "Architectural Plans",
    type: "pdf",
    size: "2.4 MB",
    modified: "2024-06-20",
    author: "John Smith",
    isFolder: false,
    path: "/project/architectural"
  },
  {
    id: "2",
    name: "Site Survey",
    type: "dwg",
    size: "5.1 MB",
    modified: "2024-06-18",
    author: "Mike Johnson",
    isFolder: false,
    path: "/project/survey"
  },
  {
    id: "3",
    name: "Photos",
    type: "jpg",
    size: "Folder",
    modified: "2024-06-22",
    author: "Various",
    isFolder: true,
    path: "/project/photos"
  },
  {
    id: "4",
    name: "Contract Documents",
    type: "doc",
    size: "1.2 MB",
    modified: "2024-06-15",
    author: "Legal Team",
    isFolder: false,
    path: "/project/contracts"
  }
];

export const sampleSharePointFiles: FileItem[] = [
  {
    id: "sp1",
    name: "Project Specifications.docx",
    type: "doc",
    size: "3.2 MB",
    modified: "2024-06-25",
    author: "SharePoint User",
    path: "/sharepoint/specs"
  },
  {
    id: "sp2",
    name: "Budget Analysis.xlsx",
    type: "xls",
    size: "1.8 MB",
    modified: "2024-06-24",
    author: "Finance Team",
    path: "/sharepoint/finance"
  },
  {
    id: "sp3",
    name: "Meeting Notes Q2.pdf",
    type: "pdf",
    size: "890 KB",
    modified: "2024-06-23",
    author: "Project Manager",
    path: "/sharepoint/meetings"
  }
];
