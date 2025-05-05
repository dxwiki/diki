export interface SocialType {
  github?: string;
  linkedin?: string;
  twitter?: string;
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
}
