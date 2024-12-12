import React from "react";
import {
  DragDropContext,
  Droppable,
  Draggable,
  DropResult,
} from "@hello-pangea/dnd";
import { PlusIcon, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import Image from "next/image";

interface Card {
  id: string;
  title: string;
  description: string;
  deadline?: string;
}

interface List {
  id: string;
  name: string;
  cards: Card[];
}

interface Board {
  name: string;
  lists: List[];
}

interface KanbanBoardProps {
  board: Board;
  handleDragEnd: (result: DropResult) => void;
  setSelectedListId: (listId: string) => void;
  setIsAddCardModalOpen: (isOpen: boolean) => void;
  onDeleteList: (listId: string) => void;
  setIsAddListModalOpen: (isOpen: boolean) => void;
  setIsDeleteCardModalOpen: (isOpen: boolean) => void;
  setCardToDelete: (card: { listId: string; cardId: string; title: string } | null) => void;
}

const KanbanBoard: React.FC<KanbanBoardProps> = ({
  board,
  handleDragEnd,
  setSelectedListId,
  setIsAddCardModalOpen,
  onDeleteList,
  setIsAddListModalOpen,
  setIsDeleteCardModalOpen,
  setCardToDelete,
}) => {
  if (board.lists.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-8 space-y-4 min-h-[400px] bg-gray-50 rounded-lg">
        <Image
          src="/empty-state.svg"
          alt="Empty state"
          width={96}
          height={96}
          className="text-gray-400"
          priority
        />{" "}
        <h1 className="text-2xl font-semibold text-gray-800">No lists yet</h1>
        <p className="text-gray-600 text-center max-w-sm">
          Get started by creating your first list to organize your tasks
        </p>
        <Button onClick={() => setIsAddListModalOpen(true)}>
          <PlusIcon className="w-5 h-5" />
          <span>Create New List</span>
        </Button>
      </div>
    );
  }

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <div className="flex gap-4 p-5 overflow-x-auto">
        {board.lists.map((list) => (
          <Droppable droppableId={list.id} key={list.id}>
            {(provided) => (
              <div
                ref={provided.innerRef}
                {...provided.droppableProps}
                className="border border-gray-300 rounded-lg p-4 w-64 bg-gray-100 min-h-[100px]"
              >
                <div className="flex items-center justify-between gap-2 group/list mb-3">
                  <h3 className="font-semibold">{list.name}</h3>
                  <button
                    onClick={() => onDeleteList(list.id)}
                    className="opacity-0 group-hover/list:opacity-100 text-gray-500 
                    hover:text-red-500 transition-opacity"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
                {list.cards.map((card, index) => (
                  <Draggable key={card.id} draggableId={card.id} index={index}>
                    {(provided, snapshot) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        {...provided.dragHandleProps}
                        style={{
                          ...provided.draggableProps.style,
                          opacity: snapshot.isDragging ? 0.8 : 1,
                        }}
                        className={`
                          relative
                          border border-gray-300 
                          rounded 
                          p-2 
                          mb-2 
                          bg-white 
                          shadow-sm
                          transition-transform duration-200 ease-in-out
                          ${snapshot.isDragging ? "transform scale-105" : ""}
                          group
                        `}
                      >
                        <button
                          onClick={() => {
                            setCardToDelete({
                              listId: list.id,
                              cardId: card.id,
                              title: card.title,
                            });
                            setIsDeleteCardModalOpen(true);
                          }}
                          className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 
                                     text-gray-500 hover:text-red-500 transition-opacity"
                        >
                          <Trash2 size={16} />
                        </button>
                        <h4 className="font-medium">{card.title}</h4>
                        <p className="text-sm text-gray-600">
                          {card.description}
                        </p>
                        <p>
                            {card.deadline ? `Deadline: ${new Date(card.deadline).toLocaleDateString()}` : ""}
                        </p>
                      </div>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
                <Button
                  onClick={() => {
                    setSelectedListId(list.id);
                    setIsAddCardModalOpen(true);
                  }}
                  className="w-full mt-2"
                >
                  <span>
                    <PlusIcon />
                  </span>
                  Add Card
                </Button>
              </div>
            )}
          </Droppable>
        ))}
      </div>
    </DragDropContext>
  );
};

export default KanbanBoard;
