"use client";

import { Plus } from "lucide-react";
import { useExpenseModal } from "@/store/expense-modal-store";

export default function AddExpenseButton() {
  const { onOpen } = useExpenseModal();

  return (
    <button
      type="button"
      onClick={onOpen}
      className="inline-flex cursor-pointer items-center justify-center gap-2 h-9 rounded-lg bg-primary px-4 text-sm font-medium text-white transition hover:bg-green-500"
    >
      <Plus size={17} />
      Add Expense
    </button>
  );
}