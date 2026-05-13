import {create} from "zustand"

type ExpenseModalStore = {
  open: boolean;
  onOpen: () => void;
  onClose: () => void;
}

export const useExpenseModal = create<ExpenseModalStore>((set) => ({
    open:false,
    onOpen: () => set({open:true}),
    onClose: () => set({open:false})
})
)