import { CreateBoardCard } from "./CreateBoardCard";
import { Board, User as UserType } from "@/app/types/board";
import BoardItem from "./BoardItem";

interface BoardListProps {
  boards: Board[];
}

export default function BoardList({ boards }: BoardListProps) {
  return (
    <div className="container mx-auto py-8 px-8">
      <h1 className="text-2xl font-bold mb-6">Your Boards</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-2 gap-6">
        {boards.map((board) => (
          <BoardItem key={board.id} board={board} />
        ))}
        <CreateBoardCard />
      </div>
    </div>
  );
}
