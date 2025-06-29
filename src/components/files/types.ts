
export type FileType = "pdf" | "dwg" | "jpg" | "doc" | "xls" | "all";

export interface FileItem {
  id: string;
  name: string;
  type: FileType;
  size: string;
  modified: string;
  author: string;
  isFolder?: boolean;
  path: string;
}
