"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useEffect, useState } from "react";

interface EditBoardNameModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpdate: (newName: string) => Promise<void>;
  initialBoardName: string;
}

export function EditBoardNameModal({
  isOpen,
  onClose,
  onUpdate,
  initialBoardName,
}: EditBoardNameModalProps) {
  const [newBoardName, setNewBoardName] = useState(initialBoardName);
  const [isLoading, setIsLoading] = useState(false);

  const handleUpdate = async () => {
    setIsLoading(true);
    if (newBoardName.trim()) {
      await onUpdate(newBoardName.trim());
      onClose();
    }
    setIsLoading(false);
  };

  useEffect(() => {
    if (isOpen) {
      setNewBoardName(initialBoardName);
    }
    return () => {
      setNewBoardName("");
      setIsLoading(false);
    };
  }, [isOpen, initialBoardName]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Board</DialogTitle>
          <DialogDescription>Edit board name</DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <Input
            value={newBoardName}
            onChange={(e) => setNewBoardName(e.target.value)}
            placeholder="Board name"
          />
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            variant="default"
            onClick={handleUpdate}
            disabled={!newBoardName.trim() || isLoading}
          >
            {isLoading ? "Updating..." : "Update"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
