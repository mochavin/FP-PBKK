"use client";
import React, { useEffect, useState } from "react";
import KanbanBoard from "./KanbanBoard";
import { useRouter, useSearchParams } from "next/navigation";
import {
  createCard,
  createList,
  deleteCard,
  deleteList,
  fetcher,
  updateCardBoardPosition,
} from "@/lib/api";
import useSWR from "swr";
import { DropResult } from "@hello-pangea/dnd";
import { LoadingState } from "@/components/LoadingState";
import { BoardDetail } from "@/app/types/board";
import toast from "react-hot-toast";
import AddListModal from "./AddListModal";
import AddCardModal from "./AddCardModal";
import { Button } from "@/components/ui/button";

const KanbanPage: React.FC = () => {
  const searchParams = useSearchParams();
  const boardId = searchParams.get("boardId");
  const {
    data: boards,
    isLoading,
    error,
    mutate,
  } = useSWR<BoardDetail>(`/board/${boardId}/full`, fetcher);
  const [board, setBoard] = React.useState<BoardDetail | null>(null);
  const [isAddListModalOpen, setIsAddListModalOpen] = React.useState(false);
  const [isAddCardModalOpen, setIsAddCardModalOpen] = useState(false);
  const [selectedListId, setSelectedListId] = useState<string | null>(null);

  const handleAddCard = async (title: string, description: string) => {
    if (!selectedListId || !board) return;

    try {
      await createCard(board.id, selectedListId, {
        title,
        description,
        position:
          board.lists.find((l) => l.id === selectedListId)?.cards.length || 0,
      });

      mutate();
      toast.success("Card added successfully");
      setIsAddCardModalOpen(false);
    } catch (error) {
      toast.error("Failed to add card");
      console.error("Failed to add card:", error);
    }
  };

  useEffect(() => {
    if (boards) setBoard(boards);
  }, [boards]);

  if (!board || isLoading) return <LoadingState />;
  if (error) return <div>Failed to load board</div>;

  const handleDragEnd = async (result: DropResult) => {
    const { source, destination, draggableId } = result;

    if (!destination) return;

    // Create backup of current state for rollback
    const previousBoard = { ...board };

    try {
      // Update local state optimistically
      const newBoard = { ...board };
      const sourceList = newBoard.lists.find(
        (list) => list.id === source.droppableId
      );
      const destList = newBoard.lists.find(
        (list) => list.id === destination.droppableId
      );

      if (!sourceList || !destList) return;

      // Remove from source list
      const [movedCard] = sourceList.cards.splice(source.index, 1);
      // Add to destination list
      destList.cards.splice(destination.index, 0, movedCard);

      setBoard(newBoard);

      // TODO: update Card position and list

      // Call API to persist changes
      await updateCardBoardPosition(
        boardId!,
        destList.id,
        draggableId,
        destination.index
      );

      // Update board positions if lists changed
      if (source.droppableId !== destination.droppableId) {
        // await fetch(`/board/${boardId}`, {
        //   method: "PUT",
        //   headers: {
        //     "Content-Type": "application/json",
        //   },
        //   body: JSON.stringify({
        //     position: destination.index,
        //   }),
        // });
      }

      // Refresh data
      mutate();
      toast.success("Card moved successfully");
    } catch (error) {
      // Rollback on error
      setBoard(previousBoard);
      toast.error("Failed to move card");
      console.error("Failed to update card position:", error);
    }
  };

  const handleAddList = async (listName: string) => {
    try {
      await createList(board.id, listName, board.lists.length);

      mutate();
      toast.success("List added successfully");
    } catch (error) {
      toast.error("Failed to add list");
      console.error("Failed to add list:", error);
    }
  };

  const handleDeleteCard = async (listId: string, cardId: string) => {
    if (!board) return;

    try {
      await deleteCard(board.id, listId, cardId);
      mutate();
      toast.success("Card deleted successfully");
    } catch (error) {
      toast.error("Failed to delete card");
      console.error("Failed to delete card:", error);
    }
  };

  const handleDeleteList = async (listId: string) => {
    try {
      await deleteList(board.id, listId);
      mutate();
      toast.success("List deleted successfully");
    } catch (error) {
      // Handle error state
      toast.error("Failed to delete list");
      console.error("Failed to delete list:", error);
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center my-4 mx-6">
        <h1 className="text-2xl font-bold">{board.name}</h1>
        <Button
          onClick={() => setIsAddListModalOpen(true)}
        >
          Add List
        </Button>
      </div>
      <KanbanBoard
        board={board}
        handleDragEnd={handleDragEnd}
        setSelectedListId={setSelectedListId}
        setIsAddCardModalOpen={setIsAddCardModalOpen}
        onDeleteCard={handleDeleteCard}
        onDeleteList={handleDeleteList}
      />

      <AddListModal
        isOpen={isAddListModalOpen}
        onClose={() => setIsAddListModalOpen(false)}
        onAddList={handleAddList}
      />

      <AddCardModal
        isOpen={isAddCardModalOpen}
        onClose={() => setIsAddCardModalOpen(false)}
        onSubmit={handleAddCard}
      />
    </div>
  );
};

export default KanbanPage;
