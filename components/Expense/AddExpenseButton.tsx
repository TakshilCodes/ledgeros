"use client";

import { Plus } from "lucide-react";
import { useExpenseModal } from "@/store/expense-modal-store";

export default function AddExpenseButton() {
  const { onOpen } = useExpenseModal();

  return (
    <button
      type="button"
      onClick={onOpen}
      className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl bg-[#238636] px-4 py-2.5 text-sm font-medium text-white transition hover:bg-[#2ea043]"
    >
      <Plus size={17} />
      Add Expense
    </button>
  );
}