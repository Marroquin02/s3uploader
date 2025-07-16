export interface S3Item {
  name: string;
  fullPath: string;
  type: "file" | "folder";
  size: number;
  lastModified: string | null;
}

export interface S3Config {
  endpoint: string;
  accessKeyId: string;
  secretAccessKey: string;
  bucket: string;
  region: string;
}

export interface FileExplorerState {
  items: S3Item[];
  currentPath: string;
  loading: boolean;
  error: string | null;
  selectedItems: Set<string>;
}

export interface UploadProgress {
  fileName: string;
  progress: number;
  status: "uploading" | "completed" | "error";
  error?: string;
}
