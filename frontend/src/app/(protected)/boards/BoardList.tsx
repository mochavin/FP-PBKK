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
import { LayoutGrid, Trash2 } from "lucide-react";
import Link from "next/link";
import { Board, Member, User as UserType } from "@/app/types/board";
import { CreateBoardCard } from "./CreateBoardCard";
import { mutate } from "swr";
import Cookies from "js-cookie";
import { toast } from "react-hot-toast";
import { useEffect, useState } from "react";
import { Pencil } from "lucide-react";
import { Input } from "@/components/ui/input";
import { deleteBoard, updateBoardName } from "@/lib/api";
import { DeleteBoardModal } from "./DeleteBoardModal";
import { EditBoardNameModal } from "./EditBoardNameModal";

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
  const [newBoardName, setNewBoardName] = useState("");

  useEffect(() => {
    console.log(users, members);
  }, [members, users]);

  const openEditMembers = (boardId: string) => {
    setBoardToEditMembers(boardId);
    const boardMembersIds =
      boards
        .find((board) => board.id === boardId)
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
    setNewBoardName(board.name);
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

  return (
    <>
      <div className="container mx-auto py-8 px-8">
        <h1 className="text-2xl font-bold mb-6">Your Boards</h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-2 gap-6">
          {boards.map((board) => (
            <Card key={board.id} className="hover:shadow-lg transition-shadow">
              <CardHeader className="bg-gray-100">
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center">
                    <LayoutGrid className="w-5 h-5 mr-2" />
                    {board.name}
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-blue-500 hover:text-blue-700 hover:bg-blue-100"
                      onClick={() => openEditDialog(board)}
                    >
                      <Pencil className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-red-500 hover:text-red-700 hover:bg-red-100"
                      onClick={() => openDeleteDialog(board.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4">
                <p className="text-sm text-gray-600">
                  Board owner: {board.owner.username}
                </p>
                <p className="text-sm text-gray-600">
                  Board members:{" "}
                  {board?.members?.map((member) => member.username).toString()}
                </p>
              </CardContent>
              <CardFooter>
                <div className="flex gap-2">
                  <Link href={`/boards/detail?boardId=${board.id}`} passHref>
                    <Button variant="outline" className="w-full">
                      Open Board
                    </Button>
                  </Link>
                  <Button
                    variant="outline"
                    onClick={() => openEditMembers(board.id)}
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
        initialBoardName={newBoardName}
      />

      {/* edit member dialog */}
      <Dialog open={isEditMembersOpen} onOpenChange={setIsEditMembersOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Board Members</DialogTitle>
            <DialogDescription>
              Click name to update board members
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 flex gap-2 flex-wrap">
            {members?.map((member) => (
              <div
                key={member.id}
                className={
                  member.isMember
                    ? "bg-green-50 hover:cursor-pointer bg-opacity-50 rounded-md px-2 py-[1px] w-fit border-green-700 border-2"
                    : "bg-gray-50 hover:cursor-pointer bg-opacity-50 rounded-md px-2 py-[1px] w-fit border-gray-700 border-2"
                }
                onClick={() => toggleMember(member.id)}
              >
                {member.username}
              </div>
            ))}
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsEditDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="default"
              onClick={() => handleUpdate(newBoardName)}
            >
              Update
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
