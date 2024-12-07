"use client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { useSWRConfig } from "swr";
import Cookies from "js-cookie";
import toast from "react-hot-toast";

export function CreateBoardCard() {
  const [boardName, setBoardName] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const { mutate } = useSWRConfig();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/board/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${Cookies.get("token")}`,
        },
        body: JSON.stringify({ name: boardName }),
      });

      // Refresh the boards list
      toast.success(`Board ${boardName} created successfully`);
      mutate("/board");
      setBoardName("");
      setIsOpen(false);
    } catch (error) {
      console.error("Failed to create board:", error);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Card className="hover:shadow-lg transition-shadow border-dashed border-2 cursor-pointer pt-6">
          <CardContent className="flex items-center justify-center h-full">
            <Button
              variant="ghost"
              className="w-full h-full flex flex-col items-center justify-center py-8"
            >
              <Plus className="w-8 h-8 mb-2" />
              <span>Create New Board</span>
            </Button>
          </CardContent>
        </Card>
      </DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create New Board</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            placeholder="Enter board name"
            value={boardName}
            onChange={(e) => setBoardName(e.target.value)}
          />
          <Button type="submit" className="w-full">
            Create Board
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
