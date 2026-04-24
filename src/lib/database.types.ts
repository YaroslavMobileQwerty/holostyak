export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: '14.5'
  }
  public: {
    Tables: {
      bachelors: {
        Row: {
          bio: string | null
          created_at: string
          id: string
          name: string
          order_index: number
          photo_url: string | null
          season_id: string
        }
        Insert: {
          bio?: string | null
          created_at?: string
          id?: string
          name: string
          order_index?: number
          photo_url?: string | null
          season_id: string
        }
        Update: {
          bio?: string | null
          created_at?: string
          id?: string
          name?: string
          order_index?: number
          photo_url?: string | null
          season_id?: string
        }
        Relationships: [
          {
            foreignKeyName: 'bachelors_season_id_fkey'
            columns: ['season_id']
            isOneToOne: false
            referencedRelation: 'seasons'
            referencedColumns: ['id']
          },
        ]
      }
      episodes: {
        Row: {
          airs_at: string | null
          cover_url: string | null
          created_at: string
          id: string
          number: number
          season_id: string
          status: string
          status_changed_at: string
          title: string | null
        }
        Insert: {
          airs_at?: string | null
          cover_url?: string | null
          created_at?: string
          id?: string
          number: number
          season_id: string
          status?: string
          status_changed_at?: string
          title?: string | null
        }
        Update: {
          airs_at?: string | null
          cover_url?: string | null
          created_at?: string
          id?: string
          number?: number
          season_id?: string
          status?: string
          status_changed_at?: string
          title?: string | null
        }
        Relationships: [
          {
            foreignKeyName: 'episodes_season_id_fkey'
            columns: ['season_id']
            isOneToOne: false
            referencedRelation: 'seasons'
            referencedColumns: ['id']
          },
        ]
      }
      participants: {
        Row: {
          age: number | null
          bio: string | null
          city: string | null
          created_at: string
          current_bachelor_id: string | null
          eliminated_episode_id: string | null
          id: string
          name: string
          photo_url: string | null
          season_id: string
          status: string
        }
        Insert: {
          age?: number | null
          bio?: string | null
          city?: string | null
          created_at?: string
          current_bachelor_id?: string | null
          eliminated_episode_id?: string | null
          id?: string
          name: string
          photo_url?: string | null
          season_id: string
          status?: string
        }
        Update: {
          age?: number | null
          bio?: string | null
          city?: string | null
          created_at?: string
          current_bachelor_id?: string | null
          eliminated_episode_id?: string | null
          id?: string
          name?: string
          photo_url?: string | null
          season_id?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: 'participants_current_bachelor_id_fkey'
            columns: ['current_bachelor_id']
            isOneToOne: false
            referencedRelation: 'bachelors'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'participants_eliminated_episode_fk'
            columns: ['eliminated_episode_id']
            isOneToOne: false
            referencedRelation: 'episodes'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'participants_season_id_fkey'
            columns: ['season_id']
            isOneToOne: false
            referencedRelation: 'seasons'
            referencedColumns: ['id']
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          balance: number
          correct_bets: number
          created_at: string
          id: string
          nickname: string | null
          role: string
          streak_best: number
          streak_current: number
          total_bets: number
          total_won: number
        }
        Insert: {
          avatar_url?: string | null
          balance?: number
          correct_bets?: number
          created_at?: string
          id: string
          nickname?: string | null
          role?: string
          streak_best?: number
          streak_current?: number
          total_bets?: number
          total_won?: number
        }
        Update: {
          avatar_url?: string | null
          balance?: number
          correct_bets?: number
          created_at?: string
          id?: string
          nickname?: string | null
          role?: string
          streak_best?: number
          streak_current?: number
          total_bets?: number
          total_won?: number
        }
        Relationships: []
      }
      seasons: {
        Row: {
          created_at: string
          ends_at: string | null
          id: string
          number: number
          starts_at: string | null
          status: string
          title: string
        }
        Insert: {
          created_at?: string
          ends_at?: string | null
          id?: string
          number: number
          starts_at?: string | null
          status?: string
          title: string
        }
        Update: {
          created_at?: string
          ends_at?: string | null
          id?: string
          number?: number
          starts_at?: string | null
          status?: string
          title?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      is_admin: { Args: never; Returns: boolean }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, '__InternalSupabase'>

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, 'public'>]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema['Tables'] & DefaultSchema['Views'])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Views'])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Views'])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema['Tables'] &
        DefaultSchema['Views'])
    ? (DefaultSchema['Tables'] &
        DefaultSchema['Views'])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema['Tables']
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables']
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema['Tables']
    ? DefaultSchema['Tables'][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema['Tables']
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables']
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema['Tables']
    ? DefaultSchema['Tables'][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema['Enums']
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions['schema']]['Enums']
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions['schema']]['Enums'][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema['Enums']
    ? DefaultSchema['Enums'][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema['CompositeTypes']
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions['schema']]['CompositeTypes']
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions['schema']]['CompositeTypes'][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema['CompositeTypes']
    ? DefaultSchema['CompositeTypes'][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
