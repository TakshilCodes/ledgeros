import { create } from "zustand";

type EditableSubscription = {
  id: string;
  name: string;
  amount: number;
  billingCycle: string;
  nextRenewalDate: string;
  isActive: boolean;
  category: string;
  planName: string | null;
  logo: string | null;
};

type SubscriptionModalStore = {
  open: boolean;
  editOpen: boolean;
  selectedSubscription: EditableSubscription | null;

  onOpen: () => void;
  onClose: () => void;

  onEditOpen: (subscription: EditableSubscription) => void;
  onEditClose: () => void;
};

export const useSubscriptionModal = create<SubscriptionModalStore>((set) => ({
  open: false,
  editOpen: false,
  selectedSubscription: null,

  onOpen: () => set({ open: true }),

  onClose: () =>
    set({
      open: false,
    }),

  onEditOpen: (subscription) =>
    set({
      editOpen: true,
      selectedSubscription: subscription,
    }),

  onEditClose: () =>
    set({
      editOpen: false,
      selectedSubscription: null,
    }),
}));