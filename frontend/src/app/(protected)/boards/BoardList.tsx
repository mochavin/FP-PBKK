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
import { Board, Member, User } from "@/app/types/board";
import { CreateBoardCard } from "./CreateBoardCard";
import { mutate, useSWRConfig } from "swr";
import Cookies from "js-cookie";
import { toast } from "react-hot-toast";
import { useEffect, useState } from "react";
import { Pencil } from "lucide-react";
import { Input } from "@/components/ui/input";

interface BoardListProps {
  boards: Board[];
  users: User[];
}

export default function BoardList({ boards, users }: BoardListProps) {
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
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
    console.log(boards, users);
  }, []);

  const openEditMembers = (boardId: string) => {
    setBoardToEditMembers(boardId);
    setIsEditMembersOpen(true);
    const tmp = boards.find((board) => board.id === boardId);
    setMembers(tmp?.members ?? null);
    setMembersIds(tmp?.members?.map((member) => member?.id) ?? null);
  };

  const openDeleteDialog = (boardId: string) => {
    setBoardToDelete(boardId);
    setIsDeleteDialogOpen(true);
  };

  const handleDelete = async () => {
    if (!boardToDelete) return;

    const loadingToast = toast.loading("Deleting board...");

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/board/${boardToDelete}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${Cookies.get("token")}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to delete board");
      }

      mutate("/board/");
      toast.dismiss(loadingToast);
      toast.success("Board deleted successfully");
    } catch (error) {
      toast.dismiss(loadingToast);
      toast.error("Failed to delete board");
      console.error("Error deleting board:", error);
    } finally {
      setIsDeleteDialogOpen(false);
      setBoardToDelete(null);
    }
  };

  const openEditDialog = (board: Board) => {
    setBoardToEdit(board.id);
    setNewBoardName(board.name);
    setIsEditDialogOpen(true);
  };

  // Add handleUpdate function inside BoardList component
  const handleUpdate = async () => {
    if (!boardToEdit) return;

    const loadingToast = toast.loading("Updating board...");

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/board/${boardToEdit}`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${Cookies.get("token")}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: newBoardName,
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to update board");
      }

      mutate("/board/");
      toast.dismiss(loadingToast);
      toast.success(`Board ${newBoardName} updated successfully`);
    } catch (error) {
      toast.dismiss(loadingToast);
      toast.error("Failed to update board");
      console.error("Error updating board:", error);
    } finally {
      setIsEditDialogOpen(false);
      setBoardToEdit(null);
      setNewBoardName("");
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
                  {members?.map((member) => member.username).toString()}
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

      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Board</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this board? This action cannot be
              undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDeleteDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
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
            <Button
              variant="outline"
              onClick={() => setIsEditDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="default"
              onClick={handleUpdate}
              disabled={!newBoardName.trim()}
            >
              Update
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

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
                className="bg-green-50 hover:cursor-pointer bg-opacity-50 rounded-md px-2 py-[1px] w-fit border-green-700 border-2"
              >
                {member.username}
              </div>
            ))}
            {users?.map(
              (user) =>
                !membersIds?.includes(user?.ID) && (
                  <div
                    key={user.ID}
                    className="bg-gray-50 hover:cursor-pointer bg-opacity-50 rounded-md px-2 py-[1px] w-fit border-gray-700 border-2"
                  >
                    {user.Username}
                  </div>
                )
            )}
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
              onClick={handleUpdate}
              disabled={!newBoardName.trim()}
            >
              Update
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
