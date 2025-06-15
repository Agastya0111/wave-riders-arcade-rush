
export interface Team {
  id: string;
  name: string;
  description: string | null;
  leader_id: string;
  created_at: string;
  member_count?: number;
  leader_username?: string;
}

export interface TeamMember {
  team_id: string;
  user_id: string;
  joined_at: string;
  profile?: { username: string };
}

export interface TeamJoinLink {
  id: string;
  team_id: string;
  token: string;
  expires_at: string;
  used: boolean;
  created_at: string;
}
