import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Member } from "@/app/types/board";

interface EditMembersModalProps {
  isOpen: boolean;
  onClose: () => void;
  isLoading: boolean;
  onUpdate: () => void;
  members: Member[] | null;
  onToggleMember: (memberId: string) => void;
}

export function EditMembersModal({
  isOpen,
  onClose,
  isLoading,
  onUpdate,
  members,
  onToggleMember,
}: EditMembersModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Board Members</DialogTitle>
          <DialogDescription>Click name to update board members</DialogDescription>
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
              onClick={() => onToggleMember(member.id)}
            >
              {member.username}
            </div>
          ))}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="default" onClick={onUpdate} disabled={isLoading}>
            {isLoading ? "Updating..." : "Update"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}