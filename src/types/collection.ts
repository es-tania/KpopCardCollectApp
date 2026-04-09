export interface CollectionEntry {
  id: string;
  userId: string;
  photocardId: string;
  addedAt: string;
}

export interface UserPhotocardState {
  userId: string;
  photocardId: string;
  isFavorite?: boolean;
  isWishlisted?: boolean;
  addedAt?: string;
}

export interface UserList {
  id: string;
  userId: string;
  name: string;
  photocardIds: string[];
  isPublic?: boolean;
  createdAt: string;
  updatedAt?: string;
}
