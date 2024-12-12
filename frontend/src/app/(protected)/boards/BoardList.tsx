import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LayoutGrid, Trash2, UserIcon, Users } from "lucide-react";
import Link from "next/link";
import { Board, Member, User as UserType } from "@/app/types/board";
import { CreateBoardCard } from "./CreateBoardCard";
import { mutate } from "swr";
import Cookies from "js-cookie";
import { toast } from "react-hot-toast";
import { useEffect, useState } from "react";
import { Pencil } from "lucide-react";
import { Input } from "@/components/ui/input";
import { deleteBoard, updateBoardMembers, updateBoardName } from "@/lib/api";
import { DeleteBoardModal } from "./DeleteBoardModal";
import { EditBoardNameModal } from "./EditBoardNameModal";
import { EditMembersModal } from "./EditMembersModal";

interface BoardListProps {
  boards: Board[];
  users: UserType[];
}

export default function BoardList({ boards, users }: BoardListProps) {
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isLoadding, setIsLoading] = useState(false);
  const [boardToDelete, setBoardToDelete] = useState<string | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [boardToEdit, setBoardToEdit] = useState<string | null>(null);
  const [isEditMembersOpen, setIsEditMembersOpen] = useState(false);
  const [boardToEditMembers, setBoardToEditMembers] = useState<string | null>(
    null
  );
  const [members, setMembers] = useState<Array<Member> | null>(null);
  const [membersIds, setMembersIds] = useState<Array<string> | null>(null);
  const [selectedBoard, setSelectedBoard] = useState("");

  useEffect(() => {
    console.log(users, members);
  }, [members, users]);

  const openEditMembers = (board: Board) => {
    setBoardToEditMembers(board.id);
    setSelectedBoard(board.name);
    const boardMembersIds =
      boards
        .find((board) => board.id === board.id)
        ?.members?.map((member) => member.id) ?? [];
    const tmpMembers: Member[] = users?.map((user) => ({
      id: user.ID,
      email: user.Email,
      username: user.Username,
      isMember: boardMembersIds.includes(user.ID),
    }));
    setMembers(tmpMembers ?? null);
    setIsEditMembersOpen(true);
    console.log(tmpMembers);
  };

  const openDeleteDialog = (boardId: string) => {
    setBoardToDelete(boardId);
    setIsDeleteDialogOpen(true);
  };

  const toggleMember = (memberId: string) => {
    const tmpPrev = members?.map((member) =>
      member.id === memberId
        ? { ...member, isMember: !member.isMember }
        : member
    );
    setMembers(tmpPrev ?? null);
  };

  const handleDelete = async () => {
    if (!boardToDelete) return;

    const loadingToast = toast.loading("Deleting board...");
    setIsLoading(true);
    try {
      const response = await deleteBoard(boardToDelete);

      mutate("/board/");
      toast.dismiss(loadingToast);
      toast.success("Board deleted successfully");
    } catch (error) {
      toast.dismiss(loadingToast);
      toast.error("Failed to delete board");
      console.error("Error deleting board:", error);
    } finally {
      setIsLoading(false);
      setIsDeleteDialogOpen(false);
      setBoardToDelete(null);
    }
  };

  const openEditDialog = (board: Board) => {
    setBoardToEdit(board.id);
    setSelectedBoard(board.name);
    setIsEditDialogOpen(true);
  };

  const handleUpdate = async (newName: string) => {
    if (!boardToEdit) return;

    const loadingToast = toast.loading("Updating board...");

    try {
      await updateBoardName(boardToEdit, newName);

      mutate("/board/");
      toast.dismiss(loadingToast);
      toast.success(`Board ${newName} updated successfully`);
    } catch (error) {
      toast.dismiss(loadingToast);
      toast.error("Failed to update board");
      console.error("Error updating board:", error);
    } finally {
      setIsEditDialogOpen(false);
      setBoardToEdit(null);
    }
  };

  const handleUpdateMembers = async () => {
    if (!boardToEditMembers || !members) return;

    const loadingToast = toast.loading("Updating members...");

    const boardMembersIds = members
      .filter((member) => member.isMember)
      .map((member) => member.id);
    setIsLoading(true);
    try {
      await updateBoardMembers(boardToEditMembers, boardMembersIds);

      mutate("/board/");
      toast.dismiss(loadingToast);
      toast.success(`Board ${selectedBoard} updated successfully`);
    } catch (error) {
      toast.dismiss(loadingToast);
      toast.error("Failed to update board");
      console.error("Error updating board:", error);
    } finally {
      setIsEditMembersOpen(false);
      setBoardToEdit(null);
      setIsLoading(false);
    }
  };

  return (
    <>
      <div className="container mx-auto py-8 px-8">
        <h1 className="text-2xl font-bold mb-6">Your Boards</h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-2 gap-6">
          {boards.map((board) => (
            <Card
              key={board.id}
              className="hover:shadow-xl transition-all duration-300 border-gray-200"
            >
              <CardHeader className="bg-gradient-to-r from-gray-50 to-gray-100">
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <LayoutGrid className="w-6 h-6 text-blue-500" />
                    <span className="font-semibold text-lg">{board.name}</span>
                  </div>
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-blue-500 hover:text-blue-700 hover:bg-blue-50 rounded-full"
                      onClick={() => openEditDialog(board)}
                    >
                      <Pencil className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-red-500 hover:text-red-700 hover:bg-red-50 rounded-full"
                      onClick={() => openDeleteDialog(board.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6 space-y-4">
                <div className="flex items-center space-x-2">
                  <UserIcon className="w-4 h-4 text-gray-500" />
                  <span className="text-sm text-gray-700">
                    Owner:{" "}
                    <span className="font-medium">{board.owner.username}</span>
                  </span>
                </div>
                <div className="flex items-start space-x-2">
                  <Users className="w-4 h-4 text-gray-500 mt-1" />
                  <div className="flex-1">
                    <span className="text-sm text-gray-700">Members:</span>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {board?.members?.map((member, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                        >
                          {member.username}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="pt-4">
                <div className="flex gap-2">
                  <Link
                    href={`/boards/detail?boardId=${board.id}`}
                    className="flex-1"
                  >
                    <Button variant="default">Open Board</Button>
                  </Link>
                  <Button
                    variant="outline"
                    onClick={() => openEditMembers(board)}
                  >
                    Edit Members
                  </Button>
                </div>
              </CardFooter>
            </Card>
          ))}
          <CreateBoardCard />
        </div>
      </div>

      <DeleteBoardModal
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onDelete={handleDelete}
        isLoading={isLoadding}
      />

      <EditBoardNameModal
        isOpen={isEditDialogOpen}
        onClose={() => setIsEditDialogOpen(false)}
        onUpdate={handleUpdate}
        initialBoardName={selectedBoard}
      />

      <EditMembersModal
        isOpen={isEditMembersOpen}
        isLoading={isLoadding}
        onClose={() => setIsEditMembersOpen(false)}
        onUpdate={() => handleUpdateMembers()}
        members={members}
        onToggleMember={toggleMember}
      />
    </>
  );
}
