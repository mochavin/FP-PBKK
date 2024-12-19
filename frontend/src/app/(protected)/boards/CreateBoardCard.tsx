"use client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import {
  Dialog,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useState } from "react";
import { CreateBoardForm } from "./CreateBoardForm";

export function CreateBoardCard() {
  const [isOpen, setIsOpen] = useState(false);

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
      <CreateBoardForm onClose={() => setIsOpen(false)} />
    </Dialog>
  );
}
