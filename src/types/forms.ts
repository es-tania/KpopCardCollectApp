// ─── Types génériques formulaires ─────────────────────────────────────────────

export interface SelectOption {
  key: string;
  label: string;
  disabled?: boolean;
}

export type FormErrors<T> = Partial<Record<keyof T, string>>;

// ─── Groupe ───────────────────────────────────────────────────────────────────

export interface GroupFormState {
  name: string;
  koreanName: string;
  company: string;
  debutDate: string;
  disbandDate: string;
  generation: string;
  fandomName: string;
  status: string;
  logoUri: string;
  bannerUri: string;
  removeLogo: boolean;
  removeBanner: boolean;
}

export type GroupFormErrors = FormErrors<GroupFormState>;

// ─── Album ────────────────────────────────────────────────────────────────────

export interface AlbumFormState {
  groupId: string;
  groupName: string;
  title: string;
  koreanTitle: string;
  type: string;
  category: string;
  releaseDate: string;
  eventName: string;
  eventLocation: string;
  eventDate: string;
  versions: string;
  hasPOB: string;
  isLimited: string;
  coverUri: string;
  tags: string;
  removeCore: boolean;
}

export type AlbumFormErrors = FormErrors<AlbumFormState>;

// ─── Photocard ────────────────────────────────────────────────────────────────

export interface PhotocardFormState {
  groupId: string;
  groupName: string;
  albumId: string;
  memberId: string;
  memberIds: string[];
  albumTitle: string;
  memberName: string;
  type: string;
  version: string;
  shopName: string;
  eventName: string;
  rarity: string;
  imageUri: string;
  backImageUri: string;
}

export type PhotocardFormErrors = FormErrors<PhotocardFormState>;

// interface PhotocardFormErrors {
//   groupId?: string;
//   albumId?: string;
//   memberId?: string;
//   type?: string;
//   imageUri?: string;
// }

// ─── Membre ───────────────────────────────────────────────────────────────────

export interface MemberFormState {
  localId: string;
  id?: string;
  stageName: string;
  realName: string;
  koreanName: string;
  birthDate: string;
  position: string[];
  photoUri: string;
  existingPhotoUrl?: string;
  removePhoto: boolean;
  isNew: boolean;
}

export type MemberFormErrors = FormErrors<MemberFormState>;
