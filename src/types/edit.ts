export interface AlbumEditFormState {
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
}

export interface PhotocardEditFormState {
  type: string;
  version: string;
  shopName: string;
  rarity: string;
  imageUri: string;
  backImageUri: string;
  memberId: string;
  albumId: string;
}

export interface GroupEditFormState {
  name: string;
  koreanName: string;
  company: string;
  generation: string;
  fandomName: string;
  status: string;
  debutDate: string;
  disbandDate: string;
  memberCount: string;
  logoUri: string;
  bannerUri: string;
  removeLogo: boolean;
  removeBanner: boolean;
}
