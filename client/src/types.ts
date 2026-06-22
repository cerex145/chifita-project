export type Role = "USER" | "ADMIN";
export type Rank = "MIEMBRO_BASICO" | "MIEMBRO_CUSQUISPE" | "MIEMBRO_MILAR_CUSQUISPE";
export type AuthProvider = "LOCAL" | "GOOGLE";
export type Career = "ECONOMIA" | "ECONOMIA_PUBLICA" | "ECONOMIA_INTERNACIONAL";

export type User = {
  id: string;
  username: string;
  email: string;
  avatarUrl?: string | null;
  university?: string | null;
  career?: Career | null;
  base?: string | null;
  onboardingCompleted: boolean;
  provider: AuthProvider;
  role: Role;
  rank: Rank;
  points: number;
  createdAt: string;
};

export type AuthResponse = {
  token: string;
  user: User;
};

export type ContentKey = "home" | "nosotros" | "vision" | "mision";

export type PageContent = {
  key: ContentKey;
  content: string;
  updatedAt: string | null;
  isDefault: boolean;
};

export type Material = {
  id: string;
  title: string;
  description: string | null;
  fileUrl: string;
  thumbnailUrl: string | null;
  fileSize: number | null;
  category: string;
  createdAt: string;
  authorId: string;
  author?: {
    id: string;
    username: string;
  };
};

export type MaterialCategory = {
  id: string;
  name: string;
  createdAt: string;
};

export type MemeStatus = "PENDING" | "APPROVED" | "REJECTED";

export type Meme = {
  id: string;
  title: string;
  imageUrl: string;
  description: string | null;
  likesCount: number;
  status: MemeStatus;
  createdAt: string;
  authorId: string;
  author?: {
    id: string;
    username: string;
    avatarUrl?: string | null;
  };
};

export type RankProgress = {
  rank: Rank;
  currentThreshold: number;
  nextRank: Rank | null;
  nextThreshold: number | null;
  pointsToNext: number;
  progressPercent: number;
};

export type UserProfile = {
  user: User;
  progress: RankProgress;
  stats: {
    memesTotal: number;
    memesApproved: number;
    likesReceived: number;
  };
  memes: Meme[];
};

export type AdminUser = User & {
  _count: {
    memes: number;
    materials: number;
  };
};

export type NewsArticle = {
  id: string;
  title: string;
  description: string | null;
  url: string;
  imageUrl: string | null;
  source: string;
  publishedAt: string;
  createdAt: string;
};
