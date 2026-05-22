import { create } from "zustand";

export type EditableRecurringExpense = {
  id: string;
  name: string;
  amount: number;
  category: string;
  billingCycle: string;
  nextDueDate: string;
  note: string | null;
  isActive: boolean;
};

type RecurringModalStore = {
  open: boolean;
  editOpen: boolean;
  selectedRecurring: EditableRecurringExpense | null;

  onOpen: () => void;
  onClose: () => void;

  onEditOpen: (recurring: EditableRecurringExpense) => void;
  onEditClose: () => void;
};

export const useRecurringModalStore = create<RecurringModalStore>((set) => ({
  open: false,
  editOpen: false,
  selectedRecurring: null,

  onOpen: () => set({ open: true }),
  onClose: () => set({ open: false }),

  onEditOpen: (recurring) =>
    set({
      editOpen: true,
      selectedRecurring: recurring,
    }),

  onEditClose: () =>
    set({
      editOpen: false,
      selectedRecurring: null,
    }),
}));