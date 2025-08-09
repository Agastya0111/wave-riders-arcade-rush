export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instanciate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.12 (cd3cf9e)"
  }
  public: {
    Tables: {
      endings: {
        Row: {
          choice: string
          created_at: string
          id: string
          player: string
        }
        Insert: {
          choice: string
          created_at?: string
          id?: string
          player: string
        }
        Update: {
          choice?: string
          created_at?: string
          id?: string
          player?: string
        }
        Relationships: []
      }
      game_sessions: {
        Row: {
          completed: boolean
          created_at: string
          dolphins_used: number
          duration_seconds: number
          id: string
          level_reached: number
          lives_used: number
          score: number
          user_id: string
        }
        Insert: {
          completed?: boolean
          created_at?: string
          dolphins_used?: number
          duration_seconds?: number
          id?: string
          level_reached?: number
          lives_used?: number
          score?: number
          user_id: string
        }
        Update: {
          completed?: boolean
          created_at?: string
          dolphins_used?: number
          duration_seconds?: number
          id?: string
          level_reached?: number
          lives_used?: number
          score?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "game_sessions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      game_statistics: {
        Row: {
          average_duration_seconds: number | null
          average_score: number | null
          highest_score: number | null
          id: string
          most_common_avatar: string | null
          total_games_played: number
          total_players: number
          updated_at: string
        }
        Insert: {
          average_duration_seconds?: number | null
          average_score?: number | null
          highest_score?: number | null
          id?: string
          most_common_avatar?: string | null
          total_games_played?: number
          total_players?: number
          updated_at?: string
        }
        Update: {
          average_duration_seconds?: number | null
          average_score?: number | null
          highest_score?: number | null
          id?: string
          most_common_avatar?: string | null
          total_games_played?: number
          total_players?: number
          updated_at?: string
        }
        Relationships: []
      }
      player_choices: {
        Row: {
          created_at: string | null
          final_choice: string | null
          id: number
          level_completed: number
          player_id: string | null
          player_name: string | null
        }
        Insert: {
          created_at?: string | null
          final_choice?: string | null
          id?: number
          level_completed: number
          player_id?: string | null
          player_name?: string | null
        }
        Update: {
          created_at?: string | null
          final_choice?: string | null
          id?: number
          level_completed?: number
          player_id?: string | null
          player_name?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_type: string | null
          created_at: string
          id: string
          updated_at: string
          username: string
          wrc_balance: number
        }
        Insert: {
          avatar_type?: string | null
          created_at?: string
          id: string
          updated_at?: string
          username: string
          wrc_balance?: number
        }
        Update: {
          avatar_type?: string | null
          created_at?: string
          id?: string
          updated_at?: string
          username?: string
          wrc_balance?: number
        }
        Relationships: []
      }
      quest_types: {
        Row: {
          description: string
          goal_amount: number
          goal_type: string
          id: string
          name: string
        }
        Insert: {
          description: string
          goal_amount: number
          goal_type: string
          id?: string
          name: string
        }
        Update: {
          description?: string
          goal_amount?: number
          goal_type?: string
          id?: string
          name?: string
        }
        Relationships: []
      }
      team_join_links: {
        Row: {
          created_at: string
          expires_at: string
          id: string
          team_id: string
          token: string
          used: boolean
        }
        Insert: {
          created_at?: string
          expires_at: string
          id?: string
          team_id: string
          token: string
          used?: boolean
        }
        Update: {
          created_at?: string
          expires_at?: string
          id?: string
          team_id?: string
          token?: string
          used?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "team_join_links_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      team_members: {
        Row: {
          joined_at: string
          team_id: string
          user_id: string
        }
        Insert: {
          joined_at?: string
          team_id: string
          user_id: string
        }
        Update: {
          joined_at?: string
          team_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "team_members_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "team_members_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      team_quest_participants: {
        Row: {
          completed: boolean
          id: string
          joined_at: string
          team_quest_id: string
          user_id: string
        }
        Insert: {
          completed?: boolean
          id?: string
          joined_at?: string
          team_quest_id: string
          user_id: string
        }
        Update: {
          completed?: boolean
          id?: string
          joined_at?: string
          team_quest_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "team_quest_participants_team_quest_id_fkey"
            columns: ["team_quest_id"]
            isOneToOne: false
            referencedRelation: "team_quests"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "team_quest_participants_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      team_quests: {
        Row: {
          active: boolean
          completed_at: string | null
          id: string
          quest_type_id: string
          started_at: string
          team_id: string
        }
        Insert: {
          active?: boolean
          completed_at?: string | null
          id?: string
          quest_type_id: string
          started_at?: string
          team_id: string
        }
        Update: {
          active?: boolean
          completed_at?: string | null
          id?: string
          quest_type_id?: string
          started_at?: string
          team_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "team_quests_quest_type_id_fkey"
            columns: ["quest_type_id"]
            isOneToOne: false
            referencedRelation: "quest_types"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "team_quests_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      teams: {
        Row: {
          created_at: string
          description: string | null
          id: string
          leader_id: string
          name: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          leader_id: string
          name: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          leader_id?: string
          name?: string
        }
        Relationships: [
          {
            foreignKeyName: "teams_leader_id_fkey"
            columns: ["leader_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_logins: {
        Row: {
          id: string
          login_date: string
          user_id: string
        }
        Insert: {
          id?: string
          login_date: string
          user_id: string
        }
        Update: {
          id?: string
          login_date?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_logins_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      leaderboard: {
        Row: {
          avatar_type: string | null
          created_at: string | null
          duration_seconds: number | null
          level_reached: number | null
          score: number | null
          username: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      adjust_wrc_balance: {
        Args: { p_user_id: string; p_delta: number }
        Returns: {
          success: boolean
          new_balance: number
          message: string
        }[]
      }
      is_user_in_team: {
        Args: { p_user_id: string }
        Returns: boolean
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
