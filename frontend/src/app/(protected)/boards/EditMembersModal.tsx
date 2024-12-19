import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Member } from "@/app/types/board";
import { MemberList } from "./MemberList";
import { useUsers } from "@/hooks/useUsers";
import { useEffect, useState } from "react";
import { deleteBoardMember } from "@/lib/api";
import { UserCircle, UserMinus, Users } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { mutate } from "swr";
import toast from "react-hot-toast";

interface EditMembersModalProps {
  isOpen: boolean;
  onClose: () => void;
  isLoading: boolean;
  onUpdate: (members: string) => void;
  members: Member[] | null;
  onRemoveMember: (memberId: string) => void;
}

export function EditMembersModal({
  isOpen,
  onClose,
  isLoading,
  onUpdate,
  members,
  onRemoveMember,
}: EditMembersModalProps) {
  const { users } = useUsers(isOpen);
  const [selectedUser, setSelectedUser] = useState<string | null>(null);

  useEffect(() => {
    if (members) {
      setSelectedUser(null);
    }
  }, [members]);

  const handleSelectChange = (value: string) => {
    setSelectedUser(value);
  };

  const handleUpdate = () => {
    onUpdate(selectedUser!);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Board Members</DialogTitle>
          <DialogDescription>
            Search and select users to add to the board
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <div className="flex items-center gap-2 mb-2">
            <Users className="h-4 w-4" />
            <h3 className="text-sm font-medium">Current Members</h3>
          </div>
          <div className="space-y-2">
            {members?.map((member) => (
              <div
                key={member.id}
                className="flex items-center justify-between p-2 rounded-lg hover:bg-slate-100"
              >
                <div className="flex items-center gap-2">
                  <UserCircle className="h-5 w-5 text-slate-500" />
                  <span className="text-sm">{member.username}</span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="hover:text-red-600 hover:bg-red-50"
                  onClick={() => onRemoveMember(member.id)}
                >
                  <UserMinus className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        </div>
        <Select onValueChange={handleSelectChange}>
          <SelectTrigger className="w-[300px]">
            <SelectValue placeholder="Add members" />
          </SelectTrigger>
          <SelectContent>
            {users?.map((user) => (
              <SelectItem key={user.ID} value={user.ID}>
                {user.Username}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            variant="default"
            onClick={handleUpdate}
            disabled={isLoading || !selectedUser}
          >
            {isLoading ? "Updating..." : "Update"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
