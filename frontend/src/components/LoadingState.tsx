import { Loader2 } from "lucide-react";

export function LoadingState() {
  return (
    <div className="flex justify-center items-center h-64">
      <Loader2 className="w-8 h-8 animate-spin" />
      <span className="ml-2">Loading...</span>
    </div>
  );
}