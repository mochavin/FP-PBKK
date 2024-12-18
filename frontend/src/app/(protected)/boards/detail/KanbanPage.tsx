"use client";
import React, { useEffect, useState } from "react";
import KanbanBoard from "./KanbanBoard";
import { useSearchParams } from "next/navigation";
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
import DeleteCardModal from "./DeleteCardModal";
import Breadcrumb from "@/components/ui/breadcrumb";

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
  const [isDeleteCardModalOpen, setIsDeleteCardModalOpen] = useState(false);
  const [isLoadingDeleteCard, setIsLoadingDeleteCard] = useState(false);
  const [cardToDelete, setCardToDelete] = useState<{
    listId: string;
    cardId: string;
    title: string;
  } | null>(null);
  const [selectedListId, setSelectedListId] = useState<string | null>(null);

  const handleAddCard = async (title: string, description: string, date: string) => {
    if (!selectedListId || !board) return;

    const loadingToast = toast.loading("Adding card...");
    try {
      await createCard(board.id, selectedListId, {
        title,
        description,
        position:
          board.lists.find((l) => l.id === selectedListId)?.cards.length || 0,
        deadline: date,
      });

      await mutate();
      toast.dismiss(loadingToast);
      toast.success("Card added successfully");
      setIsAddCardModalOpen(false);
    } catch (error) {
      toast.dismiss(loadingToast);
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
      if (!boardId) return;

      await updateCardBoardPosition(
        boardId,
        source.droppableId, // original list ID
        draggableId, // card ID
        {
          position: destination.index,
          newListId: destination.droppableId, // new list ID
        }
      );

      // Refresh data
      await mutate();
      toast.success("Card moved successfully");
    } catch (error) {
      // Rollback on error
      setBoard(previousBoard);
      toast.error("Failed to move card");
      console.error("Failed to update card position:", error);
    }
  };

  const handleAddList = async (listName: string) => {
    const loadingToast = toast.loading("Adding list...");
    try {
      await createList(board.id, listName, board.lists.length);
      await mutate();
      toast.success("List added successfully");
    } catch (error) {
      toast.error("Failed to add list");
      console.error("Failed to add list:", error);
    }
    toast.dismiss(loadingToast);
  };

  const handleDeleteCardConfirm = async () => {
    if (!cardToDelete) return;
    await handleDeleteCard(cardToDelete.listId, cardToDelete.cardId);
    setIsDeleteCardModalOpen(false);
    setCardToDelete(null);
  };

  const handleDeleteCard = async (listId: string, cardId: string) => {
    if (!board) return;

    const loadingToast = toast.loading("Deleting card...");
    setIsLoadingDeleteCard(true);
    try {
      await deleteCard(board.id, listId, cardId);
      await mutate();
      toast.success("Card deleted successfully");
    } catch (error) {
      toast.error("Failed to delete card");
      console.error("Failed to delete card:", error);
    }
    toast.dismiss(loadingToast);
    setIsLoadingDeleteCard(false);
  };

  const handleDeleteList = async (listId: string) => {
    const loadingToast = toast.loading("Deleting list...");
    try {
      await deleteList(board.id, listId);
      await mutate();
      toast.success("List deleted successfully");
    } catch (error) {
      // Handle error state
      toast.error("Failed to delete list");
      console.error("Failed to delete list:", error);
    }
    toast.dismiss(loadingToast);
  };

  return (
    <div className="container mx-auto px-4">
      <Breadcrumb />
      <div className="flex justify-between items-center my-4 mx-6">
        <h1 className="text-2xl font-bold">{board.name}</h1>
        <Button onClick={() => setIsAddListModalOpen(true)}>Add List</Button>
      </div>
      <KanbanBoard
        board={board}
        handleDragEnd={handleDragEnd}
        setSelectedListId={setSelectedListId}
        setIsAddCardModalOpen={setIsAddCardModalOpen}
        onDeleteList={handleDeleteList}
        setIsAddListModalOpen={setIsAddListModalOpen}
        setCardToDelete={setCardToDelete}
        setIsDeleteCardModalOpen={setIsDeleteCardModalOpen}
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

      <DeleteCardModal
        isOpen={isDeleteCardModalOpen}
        onClose={() => {
          setIsDeleteCardModalOpen(false);
          setCardToDelete(null);
        }}
        isLoading={isLoadingDeleteCard}
        onSubmit={handleDeleteCardConfirm}
        cardTitle={cardToDelete?.title}
      />
    </div>
  );
};

export default KanbanPage;
