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
      bet_events: {
        Row: {
          bachelor_id: string | null
          closes_at: string
          created_at: string
          description: string | null
          episode_id: string
          id: string
          is_lightning: boolean
          is_live: boolean
          is_multi_choice: boolean
          max_bet_amount: number | null
          opens_at: string
          resolved_at: string | null
          resolved_by: string | null
          status: string
          title: string
          total_bets: number
          total_staked: number
          type: string
          winning_option_ids: string[]
        }
        Insert: {
          bachelor_id?: string | null
          closes_at: string
          created_at?: string
          description?: string | null
          episode_id: string
          id?: string
          is_live?: boolean
          is_multi_choice?: boolean
          max_bet_amount?: number | null
          opens_at?: string
          resolved_at?: string | null
          resolved_by?: string | null
          status?: string
          title: string
          total_bets?: number
          total_staked?: number
          type: string
          winning_option_ids?: string[]
        }
        Update: {
          bachelor_id?: string | null
          closes_at?: string
          created_at?: string
          description?: string | null
          episode_id?: string
          id?: string
          is_live?: boolean
          is_multi_choice?: boolean
          max_bet_amount?: number | null
          opens_at?: string
          resolved_at?: string | null
          resolved_by?: string | null
          status?: string
          title?: string
          total_bets?: number
          total_staked?: number
          type?: string
          winning_option_ids?: string[]
        }
        Relationships: [
          {
            foreignKeyName: 'bet_events_bachelor_id_fkey'
            columns: ['bachelor_id']
            isOneToOne: false
            referencedRelation: 'bachelors'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'bet_events_episode_id_fkey'
            columns: ['episode_id']
            isOneToOne: false
            referencedRelation: 'episodes'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'bet_events_resolved_by_fkey'
            columns: ['resolved_by']
            isOneToOne: false
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          },
        ]
      }
      bet_options: {
        Row: {
          custom_label: string
          event_id: string
          id: string
          is_winning: boolean
          odds: number
          option_bets_count: number
          option_total_staked: number
          order_index: number
          participant_id: string | null
        }
        Insert: {
          custom_label: string
          event_id: string
          id?: string
          is_winning?: boolean
          odds: number
          option_bets_count?: number
          option_total_staked?: number
          order_index?: number
          participant_id?: string | null
        }
        Update: {
          custom_label?: string
          event_id?: string
          id?: string
          is_winning?: boolean
          odds?: number
          option_bets_count?: number
          option_total_staked?: number
          order_index?: number
          participant_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: 'bet_options_event_id_fkey'
            columns: ['event_id']
            isOneToOne: false
            referencedRelation: 'bet_events'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'bet_options_participant_id_fkey'
            columns: ['participant_id']
            isOneToOne: false
            referencedRelation: 'participants'
            referencedColumns: ['id']
          },
        ]
      }
      bets: {
        Row: {
          amount: number
          event_id: string
          id: string
          odds_snapshot: number
          option_id: string
          payout: number
          placed_at: string
          potential_payout: number
          settled_at: string | null
          status: string
          user_id: string
        }
        Insert: {
          amount: number
          event_id: string
          id?: string
          odds_snapshot: number
          option_id: string
          payout?: number
          placed_at?: string
          potential_payout: number
          settled_at?: string | null
          status?: string
          user_id: string
        }
        Update: {
          amount?: number
          event_id?: string
          id?: string
          odds_snapshot?: number
          option_id?: string
          payout?: number
          placed_at?: string
          potential_payout?: number
          settled_at?: string | null
          status?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: 'bets_event_id_fkey'
            columns: ['event_id']
            isOneToOne: false
            referencedRelation: 'bet_events'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'bets_option_id_fkey'
            columns: ['option_id']
            isOneToOne: false
            referencedRelation: 'bet_options'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'bets_user_id_fkey'
            columns: ['user_id']
            isOneToOne: false
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          },
        ]
      }
      admin_broadcast_log: {
        Row: {
          admin_id: string
          body: string
          created_at: string
          filter: Json
          id: string
          recipient_count: number
          title: string
        }
        Insert: {
          admin_id: string
          body: string
          created_at?: string
          filter: Json
          id?: string
          recipient_count: number
          title: string
        }
        Update: {
          admin_id?: string
          body?: string
          created_at?: string
          filter?: Json
          id?: string
          recipient_count?: number
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: 'admin_broadcast_log_admin_id_fkey'
            columns: ['admin_id']
            isOneToOne: false
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          },
        ]
      }
      admin_audit_log: {
        Row: {
          action: string
          admin_id: string
          created_at: string
          id: string
          payload: Json | null
          target_id: string | null
          target_type: string
        }
        Insert: {
          action: string
          admin_id: string
          created_at?: string
          id?: string
          payload?: Json | null
          target_id?: string | null
          target_type: string
        }
        Update: {
          action?: string
          admin_id?: string
          created_at?: string
          id?: string
          payload?: Json | null
          target_id?: string | null
          target_type?: string
        }
        Relationships: [
          {
            foreignKeyName: 'admin_audit_log_admin_id_fkey'
            columns: ['admin_id']
            isOneToOne: false
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          },
        ]
      }
      achievements: {
        Row: {
          category: string
          created_at: string
          description: string
          icon: string | null
          icon_url: string | null
          id: string
          sort_order: number
          tier: string
          title: string
        }
        Insert: {
          category: string
          created_at?: string
          description: string
          icon?: string | null
          icon_url?: string | null
          id: string
          sort_order?: number
          tier: string
          title: string
        }
        Update: {
          category?: string
          created_at?: string
          description?: string
          icon?: string | null
          icon_url?: string | null
          id?: string
          sort_order?: number
          tier?: string
          title?: string
        }
        Relationships: []
      }
      app_settings: {
        Row: {
          key: string
          updated_at: string
          updated_by: string | null
          value: Json
        }
        Insert: {
          key: string
          updated_at?: string
          updated_by?: string | null
          value: Json
        }
        Update: {
          key?: string
          updated_at?: string
          updated_by?: string | null
          value?: Json
        }
        Relationships: [
          {
            foreignKeyName: 'app_settings_updated_by_fkey'
            columns: ['updated_by']
            isOneToOne: false
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          },
        ]
      }
      coin_purchase_requests: {
        Row: {
          admin_comment: string | null
          approved_amount: number | null
          created_at: string
          id: string
          requested_amount: number
          reviewed_at: string | null
          reviewed_by: string | null
          screenshot_url: string
          status: string
          user_comment: string | null
          user_id: string
        }
        Insert: {
          admin_comment?: string | null
          approved_amount?: number | null
          created_at?: string
          id?: string
          requested_amount: number
          reviewed_at?: string | null
          reviewed_by?: string | null
          screenshot_url: string
          status?: string
          user_comment?: string | null
          user_id: string
        }
        Update: {
          admin_comment?: string | null
          approved_amount?: number | null
          created_at?: string
          id?: string
          requested_amount?: number
          reviewed_at?: string | null
          reviewed_by?: string | null
          screenshot_url?: string
          status?: string
          user_comment?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: 'coin_purchase_requests_reviewed_by_fkey'
            columns: ['reviewed_by']
            isOneToOne: false
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'coin_purchase_requests_user_id_fkey'
            columns: ['user_id']
            isOneToOne: false
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          },
        ]
      }
      coin_transactions: {
        Row: {
          admin_id: string | null
          balance_after: number
          created_at: string
          delta: number
          id: string
          kind: string
          note: string | null
          ref_id: string | null
          user_id: string
        }
        Insert: {
          admin_id?: string | null
          balance_after: number
          created_at?: string
          delta: number
          id?: string
          kind: string
          note?: string | null
          ref_id?: string | null
          user_id: string
        }
        Update: {
          admin_id?: string | null
          balance_after?: number
          created_at?: string
          delta?: number
          id?: string
          kind?: string
          note?: string | null
          ref_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: 'coin_transactions_admin_id_fkey'
            columns: ['admin_id']
            isOneToOne: false
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'coin_transactions_user_id_fkey'
            columns: ['user_id']
            isOneToOne: false
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          },
        ]
      }
      notifications: {
        Row: {
          action_url: string | null
          body: string | null
          created_at: string
          id: string
          is_read: boolean
          metadata: Json | null
          title: string | null
          type: string
          user_id: string
        }
        Insert: {
          action_url?: string | null
          body?: string | null
          created_at?: string
          id?: string
          is_read?: boolean
          metadata?: Json | null
          title?: string | null
          type: string
          user_id: string
        }
        Update: {
          action_url?: string | null
          body?: string | null
          created_at?: string
          id?: string
          is_read?: boolean
          metadata?: Json | null
          title?: string | null
          type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: 'notifications_user_id_fkey'
            columns: ['user_id']
            isOneToOne: false
            referencedRelation: 'profiles'
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
          is_banned: boolean
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
          is_banned?: boolean
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
          is_banned?: boolean
          nickname?: string | null
          role?: string
          streak_best?: number
          streak_current?: number
          total_bets?: number
          total_won?: number
        }
        Relationships: []
      }
      user_achievements: {
        Row: {
          achievement_id: string
          unlocked_at: string
          user_id: string
        }
        Insert: {
          achievement_id: string
          unlocked_at?: string
          user_id: string
        }
        Update: {
          achievement_id?: string
          unlocked_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: 'user_achievements_achievement_id_fkey'
            columns: ['achievement_id']
            isOneToOne: false
            referencedRelation: 'achievements'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'user_achievements_user_id_fkey'
            columns: ['user_id']
            isOneToOne: false
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          },
        ]
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
      season_prizes: {
        Row: {
          created_at: string
          delivery_address: string | null
          delivery_branch_number: string | null
          delivery_carrier: 'nova_poshta' | 'ukr_poshta' | 'manual' | null
          delivery_city: string | null
          delivery_first_name: string | null
          delivery_last_name: string | null
          delivery_phone: string | null
          delivery_submitted_at: string | null
          id: string
          place: number
          season_id: string
          secret_prize_description: string | null
          shipping_status: 'pending' | 'awaiting_delivery' | 'shipped' | 'delivered'
          shipping_tracking_number: string | null
          trophy_title: string
          user_id: string
        }
        Insert: {
          created_at?: string
          delivery_address?: string | null
          delivery_branch_number?: string | null
          delivery_carrier?: 'nova_poshta' | 'ukr_poshta' | 'manual' | null
          delivery_city?: string | null
          delivery_first_name?: string | null
          delivery_last_name?: string | null
          delivery_phone?: string | null
          delivery_submitted_at?: string | null
          id?: string
          place: number
          season_id: string
          secret_prize_description?: string | null
          shipping_status?: 'pending' | 'awaiting_delivery' | 'shipped' | 'delivered'
          shipping_tracking_number?: string | null
          trophy_title: string
          user_id: string
        }
        Update: {
          created_at?: string
          delivery_address?: string | null
          delivery_branch_number?: string | null
          delivery_carrier?: 'nova_poshta' | 'ukr_poshta' | 'manual' | null
          delivery_city?: string | null
          delivery_first_name?: string | null
          delivery_last_name?: string | null
          delivery_phone?: string | null
          delivery_submitted_at?: string | null
          id?: string
          place?: number
          season_id?: string
          secret_prize_description?: string | null
          shipping_status?: 'pending' | 'awaiting_delivery' | 'shipped' | 'delivered'
          shipping_tracking_number?: string | null
          trophy_title?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: 'season_prizes_season_id_fkey'
            columns: ['season_id']
            isOneToOne: false
            referencedRelation: 'seasons'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'season_prizes_user_id_fkey'
            columns: ['user_id']
            isOneToOne: false
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          },
        ]
      }
    }
    Views: {
      leaderboard_all_time: {
        Row: {
          achievement_count: number | null
          accuracy: number | null
          avatar_url: string | null
          correct_bets: number | null
          nickname: string | null
          rank_by_won: number | null
          streak_best: number | null
          total_bets: number | null
          total_won: number | null
          user_id: string | null
        }
        Relationships: []
      }
      leaderboard_season: {
        Row: {
          achievement_count: number | null
          accuracy: number | null
          avatar_url: string | null
          nickname: string | null
          rank_by_won: number | null
          season_bets: number | null
          season_correct: number | null
          season_total_won: number | null
          streak_best: number | null
          user_id: string | null
        }
        Relationships: []
      }
      leaderboard_week: {
        Row: {
          achievement_count: number | null
          accuracy: number | null
          avatar_url: string | null
          nickname: string | null
          rank_by_won: number | null
          season_bets: number | null
          season_correct: number | null
          season_total_won: number | null
          streak_best: number | null
          user_id: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      admin_ban_user: { Args: { p_reason: string; p_target_id: string }; Returns: undefined }
      admin_broadcast_notification: {
        Args: { p_body: string; p_filter: Json; p_title: string }
        Returns: number
      }
      admin_broadcast_preview_count: { Args: { p_filter: Json }; Returns: number }
      admin_create_bachelor: {
        Args: { p_bio: string | null; p_name: string; p_order_index: number; p_photo_url: string | null; p_season_id: string }
        Returns: string
      }
      admin_create_participant: {
        Args: {
          p_age: number | null
          p_bio: string | null
          p_city: string | null
          p_current_bachelor_id: string | null
          p_eliminated_episode_id: string | null
          p_name: string
          p_photo_url: string | null
          p_season_id: string
          p_status: string
        }
        Returns: string
      }
      admin_create_season: {
        Args: {
          p_ends_at: string | null
          p_number: number
          p_starts_at: string | null
          p_status: string
          p_title: string
        }
        Returns: string
      }
      admin_dashboard_stats: { Args: never; Returns: Json }
      admin_force_set_nickname: { Args: { p_nickname: string; p_target_id: string }; Returns: undefined }
      admin_list_users: {
        Args: {
          p_banned?: boolean | null
          p_limit?: number
          p_max_balance?: number | null
          p_min_balance?: number | null
          p_role_filter?: string | null
          p_search?: string | null
          p_user_id?: string | null
        }
        Returns: {
          balance: number
          correct_bets: number
          created_at: string
          email: string
          id: string
          is_banned: boolean
          nickname: string | null
          role: string
          total_bets: number
        }[]
      }
      admin_mark_prize_shipped: { Args: { p_prize_id: string; p_tracking: string }; Returns: undefined }
      admin_set_prize_delivered: { Args: { p_prize_id: string }; Returns: undefined }
      admin_set_role: { Args: { p_role: string; p_target_id: string }; Returns: undefined }
      admin_set_secret_prize_description: { Args: { p_description: string; p_prize_id: string }; Returns: undefined }
      admin_set_season_status: { Args: { p_id: string; p_status: string }; Returns: undefined }
      admin_unban_user: { Args: { p_target_id: string }; Returns: undefined }
      admin_update_app_setting: { Args: { p_key: string; p_value: Json }; Returns: undefined }
      admin_update_bachelor: {
        Args: { p_bio: string | null; p_id: string; p_name: string; p_order_index: number; p_photo_url: string | null }
        Returns: undefined
      }
      admin_update_participant: {
        Args: {
          p_age: number | null
          p_bio: string | null
          p_city: string | null
          p_current_bachelor_id: string | null
          p_eliminated_episode_id: string | null
          p_id: string
          p_name: string
          p_photo_url: string | null
          p_status: string
        }
        Returns: undefined
      }
      admin_update_season: {
        Args: {
          p_ends_at: string | null
          p_id: string
          p_number: number
          p_starts_at: string | null
          p_title: string
        }
        Returns: undefined
      }
      auto_lock_expired_events: { Args: never; Returns: number }
      create_lightning_event: {
        Args: {
          p_bachelor_id?: string | null
          p_description?: string | null
          p_episode_id: string
          p_lock_time_seconds?: number
          p_max_bet_amount?: number | null
          p_options?: Json
          p_title: string
        }
        Returns: string
      }
      delete_bet_option: { Args: { p_option_id: string }; Returns: undefined }
      lock_bet_event: { Args: { p_event_id: string }; Returns: undefined }
      mark_notification_read: { Args: { p_id: string }; Returns: undefined }
      place_bet: {
        Args: { p_amount: number; p_event_id: string; p_option_id: string }
        Returns: string
      }
      quick_resolve_lightning: {
        Args: { p_event_id: string; p_winning_option_id: string }
        Returns: undefined
      }
      resolve_bet_event: {
        Args: { p_event_id: string; p_winning_option_ids: string[] }
        Returns: Json
      }
      void_bet_event: {
        Args: { p_event_id: string; p_reason: string }
        Returns: undefined
      }
      finalize_season: { Args: { p_force?: boolean; p_season_id: string }; Returns: Json }
      preview_finalize_season: { Args: { p_season_id: string }; Returns: Json }
      approve_purchase_request: {
        Args: { admin_note?: string | null; p_approved_amount: number; request_id: string }
        Returns: undefined
      }
      grant_coins_manual: {
        Args: { delta: number; note: string; target_user_id: string }
        Returns: undefined
      }
      is_admin: { Args: never; Returns: boolean }
      reject_purchase_request: { Args: { reason: string; request_id: string }; Returns: undefined }
      submit_purchase_request: {
        Args: {
          requested_amount: number
          screenshot_path: string
          user_comment?: string | null
        }
        Returns: string
      }
      submit_delivery_form: { Args: { p_form: Json; p_prize_id: string }; Returns: undefined }
    }
    Enums: {
      delivery_carrier: 'nova_poshta' | 'ukr_poshta' | 'manual'
      prize_shipping_status: 'pending' | 'awaiting_delivery' | 'shipped' | 'delivered'
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
