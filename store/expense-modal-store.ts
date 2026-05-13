import { create } from "zustand";

type ExpenseModalStore = {

  open: boolean;
  mode: "add" | "edit";
  expense: any | null;
  onOpen: () => void;
  onEditOpen: (expense: any) => void;
  onClose: () => void;
};

export const useExpenseModal = create<ExpenseModalStore>((set) => ({
  open: false,
  mode: "add",
  expense: null,
  onOpen: () =>
    set({
      open: true,
      mode: "add",
      expense: null,
    }),
  onEditOpen: (expense) =>
    set({
      open: true,
      mode: "edit",
      expense,
    }),
  onClose: () =>
    set({
      open: false,
      expense: null,
    }),
}));