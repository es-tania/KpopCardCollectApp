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
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      albums: {
        Row: {
          category: Database["public"]["Enums"]["album_category"]
          cover_url: string | null
          created_at: string
          event_date: string | null
          event_location: string | null
          event_name: string | null
          group_id: string
          has_pob: boolean
          id: string
          is_limited: boolean
          korean_title: string | null
          release_date: string | null
          tags: string[] | null
          title: string
          type: Database["public"]["Enums"]["album_type"]
          updated_at: string
          versions: string[] | null
        }
        Insert: {
          category?: Database["public"]["Enums"]["album_category"]
          cover_url?: string | null
          created_at?: string
          event_date?: string | null
          event_location?: string | null
          event_name?: string | null
          group_id: string
          has_pob?: boolean
          id?: string
          is_limited?: boolean
          korean_title?: string | null
          release_date?: string | null
          tags?: string[] | null
          title: string
          type: Database["public"]["Enums"]["album_type"]
          updated_at?: string
          versions?: string[] | null
        }
        Update: {
          category?: Database["public"]["Enums"]["album_category"]
          cover_url?: string | null
          created_at?: string
          event_date?: string | null
          event_location?: string | null
          event_name?: string | null
          group_id?: string
          has_pob?: boolean
          id?: string
          is_limited?: boolean
          korean_title?: string | null
          release_date?: string | null
          tags?: string[] | null
          title?: string
          type?: Database["public"]["Enums"]["album_type"]
          updated_at?: string
          versions?: string[] | null
        }
        Relationships: [
          {
            foreignKeyName: "albums_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "group_stats"
            referencedColumns: ["group_id"]
          },
          {
            foreignKeyName: "albums_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "groups"
            referencedColumns: ["id"]
          },
        ]
      }
      groups: {
        Row: {
          banner_url: string | null
          company: string | null
          created_at: string
          debut_date: string | null
          disband_date: string | null
          fandom_name: string | null
          generation: string | null
          id: string
          korean_name: string | null
          logo_url: string | null
          name: string
          status: Database["public"]["Enums"]["group_status"]
          updated_at: string
        }
        Insert: {
          banner_url?: string | null
          company?: string | null
          created_at?: string
          debut_date?: string | null
          disband_date?: string | null
          fandom_name?: string | null
          generation?: string | null
          id?: string
          korean_name?: string | null
          logo_url?: string | null
          name: string
          status?: Database["public"]["Enums"]["group_status"]
          updated_at?: string
        }
        Update: {
          banner_url?: string | null
          company?: string | null
          created_at?: string
          debut_date?: string | null
          disband_date?: string | null
          fandom_name?: string | null
          generation?: string | null
          id?: string
          korean_name?: string | null
          logo_url?: string | null
          name?: string
          status?: Database["public"]["Enums"]["group_status"]
          updated_at?: string
        }
        Relationships: []
      }
      members: {
        Row: {
          birth_date: string | null
          created_at: string
          group_id: string
          id: string
          korean_name: string | null
          photo_url: string | null
          positions: Database["public"]["Enums"]["member_position"][] | null
          real_name: string | null
          stage_name: string
          tags: string[] | null
          updated_at: string
        }
        Insert: {
          birth_date?: string | null
          created_at?: string
          group_id: string
          id?: string
          korean_name?: string | null
          photo_url?: string | null
          positions?: Database["public"]["Enums"]["member_position"][] | null
          real_name?: string | null
          stage_name: string
          tags?: string[] | null
          updated_at?: string
        }
        Update: {
          birth_date?: string | null
          created_at?: string
          group_id?: string
          id?: string
          korean_name?: string | null
          photo_url?: string | null
          positions?: Database["public"]["Enums"]["member_position"][] | null
          real_name?: string | null
          stage_name?: string
          tags?: string[] | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "members_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "group_stats"
            referencedColumns: ["group_id"]
          },
          {
            foreignKeyName: "members_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "groups"
            referencedColumns: ["id"]
          },
        ]
      }
      photocards: {
        Row: {
          album_id: string
          back_image_url: string | null
          created_at: string
          event_name: string | null
          fingerprint: string | null
          group_id: string
          id: string
          image_url: string | null
          is_limited: boolean
          member_id: string
          number: number | null
          rarity: Database["public"]["Enums"]["photocard_rarity"]
          reject_reason: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          shop_name: string | null
          status: Database["public"]["Enums"]["photocard_status"]
          submitted_by: string | null
          type: Database["public"]["Enums"]["photocard_type"]
          updated_at: string
          version: string | null
        }
        Insert: {
          album_id: string
          back_image_url?: string | null
          created_at?: string
          event_name?: string | null
          fingerprint?: string | null
          group_id: string
          id?: string
          image_url?: string | null
          is_limited?: boolean
          member_id: string
          number?: number | null
          rarity?: Database["public"]["Enums"]["photocard_rarity"]
          reject_reason?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          shop_name?: string | null
          status?: Database["public"]["Enums"]["photocard_status"]
          submitted_by?: string | null
          type?: Database["public"]["Enums"]["photocard_type"]
          updated_at?: string
          version?: string | null
        }
        Update: {
          album_id?: string
          back_image_url?: string | null
          created_at?: string
          event_name?: string | null
          fingerprint?: string | null
          group_id?: string
          id?: string
          image_url?: string | null
          is_limited?: boolean
          member_id?: string
          number?: number | null
          rarity?: Database["public"]["Enums"]["photocard_rarity"]
          reject_reason?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          shop_name?: string | null
          status?: Database["public"]["Enums"]["photocard_status"]
          submitted_by?: string | null
          type?: Database["public"]["Enums"]["photocard_type"]
          updated_at?: string
          version?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "photocards_album_id_fkey"
            columns: ["album_id"]
            isOneToOne: false
            referencedRelation: "albums"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "photocards_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "group_stats"
            referencedColumns: ["group_id"]
          },
          {
            foreignKeyName: "photocards_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "groups"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "photocards_member_id_fkey"
            columns: ["member_id"]
            isOneToOne: false
            referencedRelation: "members"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          id: string
          is_public: boolean
          language: string
          notif_collection: boolean
          notif_enabled: boolean
          notif_submissions: boolean
          role: Database["public"]["Enums"]["user_role"]
          show_collection: boolean
          show_wishlist: boolean
          updated_at: string
          username: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          id: string
          is_public?: boolean
          language?: string
          notif_collection?: boolean
          notif_enabled?: boolean
          notif_submissions?: boolean
          role?: Database["public"]["Enums"]["user_role"]
          show_collection?: boolean
          show_wishlist?: boolean
          updated_at?: string
          username: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          id?: string
          is_public?: boolean
          language?: string
          notif_collection?: boolean
          notif_enabled?: boolean
          notif_submissions?: boolean
          role?: Database["public"]["Enums"]["user_role"]
          show_collection?: boolean
          show_wishlist?: boolean
          updated_at?: string
          username?: string
        }
        Relationships: []
      }
      user_collection: {
        Row: {
          added_at: string
          id: string
          photocard_id: string
          user_id: string
        }
        Insert: {
          added_at?: string
          id?: string
          photocard_id: string
          user_id: string
        }
        Update: {
          added_at?: string
          id?: string
          photocard_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_collection_photocard_id_fkey"
            columns: ["photocard_id"]
            isOneToOne: false
            referencedRelation: "photocards"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_collection_photocard_id_fkey"
            columns: ["photocard_id"]
            isOneToOne: false
            referencedRelation: "photocards_with_details"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_collection_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_favorites: {
        Row: {
          added_at: string
          id: string
          photocard_id: string
          user_id: string
        }
        Insert: {
          added_at?: string
          id?: string
          photocard_id: string
          user_id: string
        }
        Update: {
          added_at?: string
          id?: string
          photocard_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_favorites_photocard_id_fkey"
            columns: ["photocard_id"]
            isOneToOne: false
            referencedRelation: "photocards"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_favorites_photocard_id_fkey"
            columns: ["photocard_id"]
            isOneToOne: false
            referencedRelation: "photocards_with_details"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_favorites_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_followed_groups: {
        Row: {
          followed_at: string
          group_id: string
          user_id: string
        }
        Insert: {
          followed_at?: string
          group_id: string
          user_id: string
        }
        Update: {
          followed_at?: string
          group_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_followed_groups_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "group_stats"
            referencedColumns: ["group_id"]
          },
          {
            foreignKeyName: "user_followed_groups_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "groups"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_followed_groups_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_list_items: {
        Row: {
          added_at: string
          id: string
          list_id: string
          photocard_id: string
        }
        Insert: {
          added_at?: string
          id?: string
          list_id: string
          photocard_id: string
        }
        Update: {
          added_at?: string
          id?: string
          list_id?: string
          photocard_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_list_items_list_id_fkey"
            columns: ["list_id"]
            isOneToOne: false
            referencedRelation: "user_lists"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_list_items_photocard_id_fkey"
            columns: ["photocard_id"]
            isOneToOne: false
            referencedRelation: "photocards"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_list_items_photocard_id_fkey"
            columns: ["photocard_id"]
            isOneToOne: false
            referencedRelation: "photocards_with_details"
            referencedColumns: ["id"]
          },
        ]
      }
      user_lists: {
        Row: {
          created_at: string
          id: string
          is_public: boolean
          name: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_public?: boolean
          name: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          is_public?: boolean
          name?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_lists_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_wishlist: {
        Row: {
          added_at: string
          id: string
          photocard_id: string
          user_id: string
        }
        Insert: {
          added_at?: string
          id?: string
          photocard_id: string
          user_id: string
        }
        Update: {
          added_at?: string
          id?: string
          photocard_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_wishlist_photocard_id_fkey"
            columns: ["photocard_id"]
            isOneToOne: false
            referencedRelation: "photocards"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_wishlist_photocard_id_fkey"
            columns: ["photocard_id"]
            isOneToOne: false
            referencedRelation: "photocards_with_details"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_wishlist_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      group_stats: {
        Row: {
          group_id: string | null
          member_count: number | null
          name: string | null
          total_albums: number | null
          total_photocards: number | null
        }
        Relationships: []
      }
      photocards_with_details: {
        Row: {
          album_cover_url: string | null
          album_id: string | null
          album_release_date: string | null
          album_title: string | null
          album_type: Database["public"]["Enums"]["album_type"] | null
          back_image_url: string | null
          created_at: string | null
          event_name: string | null
          fingerprint: string | null
          group_id: string | null
          group_logo_url: string | null
          group_name: string | null
          id: string | null
          image_url: string | null
          is_limited: boolean | null
          member_id: string | null
          member_name: string | null
          member_photo_url: string | null
          number: number | null
          rarity: Database["public"]["Enums"]["photocard_rarity"] | null
          shop_name: string | null
          status: Database["public"]["Enums"]["photocard_status"] | null
          submitted_by: string | null
          type: Database["public"]["Enums"]["photocard_type"] | null
          updated_at: string | null
          version: string | null
        }
        Relationships: [
          {
            foreignKeyName: "photocards_album_id_fkey"
            columns: ["album_id"]
            isOneToOne: false
            referencedRelation: "albums"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "photocards_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "group_stats"
            referencedColumns: ["group_id"]
          },
          {
            foreignKeyName: "photocards_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "groups"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "photocards_member_id_fkey"
            columns: ["member_id"]
            isOneToOne: false
            referencedRelation: "members"
            referencedColumns: ["id"]
          },
        ]
      }
      user_group_progress: {
        Row: {
          completion_pct: number | null
          favorite_photocards: number | null
          group_id: string | null
          group_name: string | null
          owned_photocards: number | null
          total_photocards: number | null
          user_id: string | null
          wishlist_photocards: number | null
        }
        Relationships: [
          {
            foreignKeyName: "photocards_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "group_stats"
            referencedColumns: ["group_id"]
          },
          {
            foreignKeyName: "photocards_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "groups"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_collection_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Functions: {
      is_admin: { Args: never; Returns: boolean }
      show_limit: { Args: never; Returns: number }
      show_trgm: { Args: { "": string }; Returns: string[] }
    }
    Enums: {
      album_category: "music" | "event" | "merch" | "media"
      album_type:
        | "mini_album"
        | "full_album"
        | "single"
        | "digital_single"
        | "repackage"
        | "compilation"
        | "fanmeeting"
        | "fansign"
        | "videocall"
        | "showcase"
        | "concert"
        | "tour"
        | "season_greetings"
        | "membership_kit"
        | "kit_album"
        | "platform_album"
        | "jewel_case"
        | "anniversary"
        | "collaboration"
        | "pop_up_store"
        | "lucky_draw"
        | "ost"
        | "photobook"
        | "dvd"
        | "bluray"
        | "event"
      group_status: "active" | "hiatus" | "disbanded"
      member_position:
        | "Leader"
        | "Main Vocal"
        | "Lead Vocal"
        | "Sub Vocal"
        | "Main Dancer"
        | "Lead Dancer"
        | "Rapper"
        | "Visual"
        | "Maknae"
      photocard_rarity: "common" | "rare" | "very_rare"
      photocard_status: "pending" | "approved" | "rejected"
      photocard_type:
        | "normal"
        | "pob"
        | "lucky_draw"
        | "broadcast"
        | "event"
        | "benefit"
      user_role: "user" | "admin"
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
    Enums: {
      album_category: ["music", "event", "merch", "media"],
      album_type: [
        "mini_album",
        "full_album",
        "single",
        "digital_single",
        "repackage",
        "compilation",
        "fanmeeting",
        "fansign",
        "videocall",
        "showcase",
        "concert",
        "tour",
        "season_greetings",
        "membership_kit",
        "kit_album",
        "platform_album",
        "jewel_case",
        "anniversary",
        "collaboration",
        "pop_up_store",
        "lucky_draw",
        "ost",
        "photobook",
        "dvd",
        "bluray",
        "event",
      ],
      group_status: ["active", "hiatus", "disbanded"],
      member_position: [
        "Leader",
        "Main Vocal",
        "Lead Vocal",
        "Sub Vocal",
        "Main Dancer",
        "Lead Dancer",
        "Rapper",
        "Visual",
        "Maknae",
      ],
      photocard_rarity: ["common", "rare", "very_rare"],
      photocard_status: ["pending", "approved", "rejected"],
      photocard_type: [
        "normal",
        "pob",
        "lucky_draw",
        "broadcast",
        "event",
        "benefit",
      ],
      user_role: ["user", "admin"],
    },
  },
} as const
