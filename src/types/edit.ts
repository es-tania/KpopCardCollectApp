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
  removeCover: boolean;
}

export interface PhotocardEditFormState {
  type: string;
  version: string;
  shopName: string;
  rarity: string;
  memberId: string;
  albumId: string;
  imageUri: string;
  backImageUri: string;
  removeImage: boolean;
  removeBackImage: boolean;
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
  logoUri: string;
  bannerUri: string;
  removeLogo: boolean;
  removeBanner: boolean;
}
