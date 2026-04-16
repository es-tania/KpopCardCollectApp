import { create } from "zustand";

interface DeletedCardsState {
  deletedIds: Set<string>;
  markDeleted: (id: string) => void;
  clear: () => void;
}

export const useDeletedCardsStore = create<DeletedCardsState>((set) => ({
  deletedIds: new Set(),

  markDeleted: (id) =>
    set((state) => ({
      deletedIds: new Set([...state.deletedIds, id]),
    })),

  clear: () => set({ deletedIds: new Set() }),
}));
