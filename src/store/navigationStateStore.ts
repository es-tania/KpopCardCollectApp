import { create } from "zustand";
import { FilterKey } from "../constants/options/filterOptions";
import { Album } from "../types";

interface MemberPageState {
  activeMemberId: string;
  selectedAlbum: Album | null;
  activeFilter: FilterKey;
  scrollOffset: number;
}

interface AlbumPageState {
  selectedMemberId: string;
  activeFilter: FilterKey;
  scrollOffset: number;
}

interface NavigationStateStore {
  memberPage: Record<string, MemberPageState>; // clé = groupId
  albumPage: Record<string, AlbumPageState>; // clé = albumId
  saveMemberState: (groupId: string, state: MemberPageState) => void;
  saveAlbumState: (albumId: string, state: AlbumPageState) => void;
  getMemberState: (groupId: string) => MemberPageState | null;
  getAlbumState: (albumId: string) => AlbumPageState | null;
}

export const useNavigationStateStore = create<NavigationStateStore>(
  (set, get) => ({
    memberPage: {},
    albumPage: {},

    saveMemberState: (groupId, state) =>
      set((prev) => ({
        memberPage: { ...prev.memberPage, [groupId]: state },
      })),

    saveAlbumState: (albumId, state) =>
      set((prev) => ({
        albumPage: { ...prev.albumPage, [albumId]: state },
      })),

    getMemberState: (groupId) => get().memberPage[groupId] ?? null,
    getAlbumState: (albumId) => get().albumPage[albumId] ?? null,
  }),
);
