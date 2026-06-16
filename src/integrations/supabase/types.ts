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
      customer_lookups: {
        Row: {
          age_range: string
          concerns: string[]
          created_at: string
          expert_id: string
          id: string
          last_products: string[]
          last_visit: string
          name: string
          notes: string
          phone: string
          skin_type: string
          updated_at: string
        }
        Insert: {
          age_range?: string
          concerns?: string[]
          created_at?: string
          expert_id: string
          id?: string
          last_products?: string[]
          last_visit?: string
          name?: string
          notes?: string
          phone: string
          skin_type?: string
          updated_at?: string
        }
        Update: {
          age_range?: string
          concerns?: string[]
          created_at?: string
          expert_id?: string
          id?: string
          last_products?: string[]
          last_visit?: string
          name?: string
          notes?: string
          phone?: string
          skin_type?: string
          updated_at?: string
        }
        Relationships: []
      }
      daily_logs: {
        Row: {
          completed_steps: number
          created_at: string
          id: string
          log_date: string
          score: number
          total_steps: number
          updated_at: string
          user_id: string
        }
        Insert: {
          completed_steps?: number
          created_at?: string
          id?: string
          log_date?: string
          score?: number
          total_steps?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          completed_steps?: number
          created_at?: string
          id?: string
          log_date?: string
          score?: number
          total_steps?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      feature_events: {
        Row: {
          created_at: string
          feature_key: string
          id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          feature_key: string
          id?: string
          user_id: string
        }
        Update: {
          created_at?: string
          feature_key?: string
          id?: string
          user_id?: string
        }
        Relationships: []
      }
      pro_subscriptions: {
        Row: {
          activated_at: string
          created_at: string
          granted_by: string | null
          id: string
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          activated_at?: string
          created_at?: string
          granted_by?: string | null
          id?: string
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          activated_at?: string
          created_at?: string
          granted_by?: string | null
          id?: string
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      products: {
        Row: {
          brand: string
          created_at: string
          currency: string
          id: string
          image_url: string
          name: string
          price: number
          updated_at: string
        }
        Insert: {
          brand?: string
          created_at?: string
          currency?: string
          id?: string
          image_url?: string
          name: string
          price?: number
          updated_at?: string
        }
        Update: {
          brand?: string
          created_at?: string
          currency?: string
          id?: string
          image_url?: string
          name?: string
          price?: number
          updated_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          allergies: string
          answer_style: string
          budget: string
          combination_zone: string
          concerns: string[]
          created_at: string
          favorite_brands: string
          gender: string
          hair_concerns: string[]
          hair_porosity: string
          id: string
          lang: string
          last_skin_id_refresh: string | null
          name: string
          onboarded: boolean
          preference: string
          pregnant: boolean
          recommend_for: string
          role: string
          skin_type: string
          updated_at: string
          user_id: string
        }
        Insert: {
          allergies?: string
          answer_style?: string
          budget?: string
          combination_zone?: string
          concerns?: string[]
          created_at?: string
          favorite_brands?: string
          gender?: string
          hair_concerns?: string[]
          hair_porosity?: string
          id?: string
          lang?: string
          last_skin_id_refresh?: string | null
          name?: string
          onboarded?: boolean
          preference?: string
          pregnant?: boolean
          recommend_for?: string
          role?: string
          skin_type?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          allergies?: string
          answer_style?: string
          budget?: string
          combination_zone?: string
          concerns?: string[]
          created_at?: string
          favorite_brands?: string
          gender?: string
          hair_concerns?: string[]
          hair_porosity?: string
          id?: string
          lang?: string
          last_skin_id_refresh?: string | null
          name?: string
          onboarded?: boolean
          preference?: string
          pregnant?: boolean
          recommend_for?: string
          role?: string
          skin_type?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      scans: {
        Row: {
          created_at: string
          id: string
          product_name: string
          result_summary: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          product_name?: string
          result_summary?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          product_name?: string
          result_summary?: string
          user_id?: string | null
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      wishlist_items: {
        Row: {
          created_at: string
          id: string
          last_seen_price: number
          notified_at: string | null
          product_id: string
          saved_price: number
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          last_seen_price?: number
          notified_at?: string | null
          product_id: string
          saved_price?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          last_seen_price?: number
          notified_at?: string | null
          product_id?: string
          saved_price?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "wishlist_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      admin_stats: { Args: never; Returns: Json }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "user"
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
      app_role: ["admin", "user"],
    },
  },
} as const
