export interface FolderItem {
  id: string;
  name: string;
  type: "folder";
  hasFramework: boolean;
  framework: string;
  frameworkIcon?: string;
  children: FolderItem[];
}
