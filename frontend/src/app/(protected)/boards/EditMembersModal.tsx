import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Member } from "@/app/types/board";
import { MemberList } from "./MemberList";

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
        <MemberList members={members} onToggleMember={onToggleMember} />
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