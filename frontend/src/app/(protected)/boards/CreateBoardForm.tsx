import {
  DialogContent,
  DialogHeader,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { mutate } from "swr";
import toast from "react-hot-toast";
import { createBoard } from "@/lib/api";

interface CreateBoardFormProps {
  onClose: () => void;
}

export function CreateBoardForm({ onClose }: CreateBoardFormProps) {
  const [boardName, setBoardName] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await createBoard(boardName);
      toast.success(`Board ${boardName} created successfully`);
      await mutate("/board/");
      setBoardName("");
      onClose();
    } catch (error) {
      console.error("Failed to create board:", error);
      toast.error("Failed to create board");
    }
    setIsLoading(false);
  };

  return (
    <DialogContent>
      <DialogHeader>
        <DialogTitle>Create New Board</DialogTitle>
        <DialogDescription>Enter new board name</DialogDescription>
      </DialogHeader>
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          placeholder="Enter board name"
          value={boardName}
          onChange={(e) => setBoardName(e.target.value)}
        />
        <Button type="submit" className="w-full" disabled={isLoading || !boardName.trim()}>
          {isLoading ? "Creating..." : "Create Board"}
        </Button>
      </form>
    </DialogContent>
  );
}