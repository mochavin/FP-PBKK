import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}


export const getDeadlineStatus = (deadline: string) => {
  const now = new Date();
  const deadlineDate = new Date(deadline);
  const diffDays = Math.ceil(
    (deadlineDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
  );

  if (diffDays < 0) return { color: "text-red-500", status: "Overdue" };
  if (diffDays <= 2) return { color: "text-orange-500", status: "Due Soon" };
  if (diffDays <= 7) return { color: "text-yellow-600", status: "This Week" };
  return { color: "text-gray-600", status: "Upcoming" };
};

export const formatDateForInput = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};