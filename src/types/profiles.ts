export interface SocialType {
  github?: string;
  linkedin?: string;
}

export interface RankInfo {
  current: number;
  postsCount: number;
  remainingForNextRank: number;
}

export interface Profile {
  id: number;
  email: string;
  username: string;
  name: string;
  role: string;
  social: SocialType;
  thumbnail: string;
  updatedAt?: string;
  rank?: RankInfo;
  intro?: string;
}
