import { Member } from "@/app/types/board";

interface MemberListProps {
  members: Member[] | null;
  onToggleMember: (memberId: string) => void;
}

export function MemberList({ members, onToggleMember }: MemberListProps) {
  return (
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
  );
}
