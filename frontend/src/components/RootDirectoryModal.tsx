"use client";

import { Dispatch, SetStateAction, useState } from "react";
import { ChevronRight, ChevronDown } from "lucide-react";
import { FaGithub } from "react-icons/fa";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import Image from "next/image";
import viteLogo from "@/assets/logos/vite.svg";
import { FolderItem } from "@/lib/interfaces";

export function RootDirectoryModal({
  isOpen = true,
  repositoryName,
  onClose = () => {},
  onContinue = () => {},
  folderStructure,
  setRootDirectory,
}: {
  isOpen?: boolean;
  repositoryName: string;
  onClose?: () => void;
  onContinue?: () => void;
  folderStructure: FolderItem[];
  setRootDirectory: Dispatch<SetStateAction<string>>;
}) {
  const [tempSelectedFolder, setTempSelectedFolder] = useState("./");
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(
    new Set(["./"])
  );

  const toggleExpanded = (folderId: string) => {
    const newExpanded = new Set(expandedFolders);
    if (newExpanded.has(folderId)) {
      newExpanded.delete(folderId);
    } else {
      newExpanded.add(folderId);
    }
    setExpandedFolders(newExpanded);
  };

  const renderFolderTree = (items: FolderItem[], level = 0) => {
    return items.map((item) => {
      const isExpanded = item.id === "./" ? true : expandedFolders.has(item.id);
      const hasChildren = item.children && item.children.length > 0;
      const isSelected = tempSelectedFolder === item.id;

      return (
        <div key={item.id}>
          <div
            className={`flex items-center gap-3 py-3 px-4 hover:bg-gray-800/50 cursor-pointer border-b border-gray-800 ${
              isSelected ? "bg-gray-700/50" : ""
            }`}
            style={{ paddingLeft: `${16 + level * 24}px` }}
            onClick={() => {
              setTempSelectedFolder(item.id);
            }}
          >
            {hasChildren && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  toggleExpanded(item.id);
                }}
                className="p-0.5 hover:bg-gray-700 rounded"
              >
                {isExpanded ? (
                  <ChevronDown className="w-4 h-4 text-gray-400" />
                ) : (
                  <ChevronRight className="w-4 h-4 text-gray-400" />
                )}
              </button>
            )}

            {!hasChildren && <div className="w-5" />}

            <div
              className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                isSelected
                  ? "border-white bg-white"
                  : "border-gray-500 bg-transparent"
              }`}
            >
              {isSelected && <div className="w-2 h-2 bg-black rounded-full" />}
            </div>

            <span className="text-white text-sm font-medium">{item.name}</span>

            {item.hasFramework && item.frameworkIcon === "vite" && (
              <div className="ml-auto">
                <Image src={viteLogo} width="20" height="20" alt="Vite" />
              </div>
            )}
          </div>

          {hasChildren && item.children && (
            <div
              className={`overflow-hidden transition-all duration-300 ease-in-out ${
                isExpanded ? "max-h-96" : "max-h-0"
              }`}
            >
              {renderFolderTree(item.children, level + 1)}
            </div>
          )}
        </div>
      );
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-black border-gray-800 max-w-lg p-0 gap-0">
        <div className="p-6 pb-4">
          <DialogHeader className="space-y-4">
            <DialogTitle className="text-white text-xl font-semibold text-center">
              Root Directory
            </DialogTitle>
            <p className="text-gray-400 text-sm text-center leading-relaxed">
              Select the directory where your source code is located. To deploy
              a monorepo, create separate projects for other directories in the
              future.
            </p>
          </DialogHeader>

          <div className="mt-6 mb-4">
            <div className="flex items-center justify-center gap-2 text-white text-sm font-medium">
              <FaGithub className="w-4 h-4" />
              {repositoryName}
            </div>
          </div>
        </div>

        <div className="border-t border-gray-800 h-60 overflow-x-auto">
          {renderFolderTree(folderStructure)}
        </div>

        <div className="flex justify-between gap-3 p-6 pt-4 border-t border-gray-800">
          <Button
            variant="outline"
            onClick={onClose}
            className="bg-transparent border-gray-600 text-white cursor-pointer"
          >
            Cancel
          </Button>
          <Button
            variant="secondary"
            onClick={() => {
              setRootDirectory(tempSelectedFolder);
              onContinue();
            }}
            className="cursor-pointer"
          >
            Continue
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
