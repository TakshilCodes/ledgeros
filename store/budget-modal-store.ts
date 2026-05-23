import { create } from "zustand";

export type EditableBudget = {
  id: string;
  name: string;
  type: string;
  category: string | null;
  amount: number;
  month: number;
  year: number;
};

type BudgetModalStore = {
  open: boolean;
  editOpen: boolean;
  selectedBudget: EditableBudget | null;

  onOpen: () => void;
  onClose: () => void;

  onEditOpen: (budget: EditableBudget) => void;
  onEditClose: () => void;
};

export const useBudgetModalStore = create<BudgetModalStore>((set) => ({
  open: false,
  editOpen: false,
  selectedBudget: null,

  onOpen: () => set({ open: true }),
  onClose: () => set({ open: false }),

  onEditOpen: (budget) =>
    set({
      editOpen: true,
      selectedBudget: budget,
    }),

  onEditClose: () =>
    set({
      editOpen: false,
      selectedBudget: null,
    }),
}));