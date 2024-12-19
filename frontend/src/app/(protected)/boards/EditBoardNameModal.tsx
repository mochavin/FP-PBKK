"use client";

import {
  Dialog,
} from "@/components/ui/dialog";
import { EditBoardNameForm } from "./EditBoardNameForm";

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
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <EditBoardNameForm
        onClose={onClose}
        onUpdate={onUpdate}
        initialBoardName={initialBoardName}
      />
    </Dialog>
  );
}
