export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      anon_interaction_logs: {
        Row: {
          action: string
          created_at: string
          emoji: string | null
          id: string
          ip: unknown
          letter_id: string
        }
        Insert: {
          action: string
          created_at?: string
          emoji?: string | null
          id?: string
          ip: unknown
          letter_id: string
        }
        Update: {
          action?: string
          created_at?: string
          emoji?: string | null
          id?: string
          ip?: unknown
          letter_id?: string
        }
        Relationships: []
      }
      blocked_ips: {
        Row: {
          blocked_at: string
          ip: unknown
          reason: string | null
        }
        Insert: {
          blocked_at?: string
          ip: unknown
          reason?: string | null
        }
        Update: {
          blocked_at?: string
          ip?: unknown
          reason?: string | null
        }
        Relationships: []
      }
      letter_comments: {
        Row: {
          comment: string
          created_at: string
          id: string
          letter_id: string
        }
        Insert: {
          comment: string
          created_at?: string
          id?: string
          letter_id: string
        }
        Update: {
          comment?: string
          created_at?: string
          id?: string
          letter_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_letter"
            columns: ["letter_id"]
            isOneToOne: false
            referencedRelation: "letters"
            referencedColumns: ["id"]
          },
        ]
      }
      letter_likes: {
        Row: {
          created_at: string
          id: string
          letter_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          letter_id: string
        }
        Update: {
          created_at?: string
          id?: string
          letter_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_letter"
            columns: ["letter_id"]
            isOneToOne: false
            referencedRelation: "letters"
            referencedColumns: ["id"]
          },
        ]
      }
      letter_reactions: {
        Row: {
          created_at: string
          emoji: string
          id: string
          ip: unknown | null
          letter_id: string
        }
        Insert: {
          created_at?: string
          emoji: string
          id?: string
          ip?: unknown | null
          letter_id: string
        }
        Update: {
          created_at?: string
          emoji?: string
          id?: string
          ip?: unknown | null
          letter_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_letter"
            columns: ["letter_id"]
            isOneToOne: false
            referencedRelation: "letters"
            referencedColumns: ["id"]
          },
        ]
      }
      letters: {
        Row: {
          created_at: string
          id: string
          tag: string | null
          text: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          tag?: string | null
          text: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          tag?: string | null
          text?: string
          user_id?: string | null
        }
        Relationships: []
      }
      memory_capsules: {
        Row: {
          allow_public_sharing: boolean
          audio_url: string | null
          content: string
          created_at: string
          email_for_delivery: string | null
          id: string
          image_url: string | null
          is_unlocked: boolean
          unlock_date: string
          unlocked_at: string | null
          video_url: string | null
        }
        Insert: {
          allow_public_sharing?: boolean
          audio_url?: string | null
          content: string
          created_at?: string
          email_for_delivery?: string | null
          id?: string
          image_url?: string | null
          is_unlocked?: boolean
          unlock_date: string
          unlocked_at?: string | null
          video_url?: string | null
        }
        Update: {
          allow_public_sharing?: boolean
          audio_url?: string | null
          content?: string
          created_at?: string
          email_for_delivery?: string | null
          id?: string
          image_url?: string | null
          is_unlocked?: boolean
          unlock_date?: string
          unlocked_at?: string | null
          video_url?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
