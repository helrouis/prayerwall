export interface Prayer {
  id: string;
  title: string;
  body: string;
  firstName: string | null;
  isAnonymous: boolean;
  email: string | null;
  category: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
  prayerCount: number;
  isAnswered: boolean;
  answeredStory: string | null;
}

export interface PrayerReaction {
  id: string;
  prayerId: string;
  ipHash: string;
  createdAt: string;
}

export interface Admin {
  id: string;
  username: string;
  passwordHash: string;
}
