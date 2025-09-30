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
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      account_types: {
        Row: {
          created_at: string | null
          description: string | null
          id: number
          name: string
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: number
          name: string
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: number
          name?: string
        }
        Relationships: []
      }
      bank_guarantees: {
        Row: {
          amendments: string | null
          applicable_law: string | null
          applicant: string
          beneficiary: string
          created_at: string | null
          currency: string
          dispute_resolution: string | null
          expiry_date: string
          guarantee_amount: string
          guarantor_bank: string
          id: string
          status: string | null
          terms_for_drawing: string | null
          underlying_transaction_reference: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          amendments?: string | null
          applicable_law?: string | null
          applicant: string
          beneficiary: string
          created_at?: string | null
          currency: string
          dispute_resolution?: string | null
          expiry_date: string
          guarantee_amount: string
          guarantor_bank: string
          id?: string
          status?: string | null
          terms_for_drawing?: string | null
          underlying_transaction_reference?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          amendments?: string | null
          applicable_law?: string | null
          applicant?: string
          beneficiary?: string
          created_at?: string | null
          currency?: string
          dispute_resolution?: string | null
          expiry_date?: string
          guarantee_amount?: string
          guarantor_bank?: string
          id?: string
          status?: string | null
          terms_for_drawing?: string | null
          underlying_transaction_reference?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      buyers: {
        Row: {
          address: string
          business_number: string | null
          certification_requirements: string[] | null
          contact_person: string | null
          created_at: string | null
          delivery_schedule: string | null
          delivery_terms: string | null
          email: string
          id: string
          import_licenses: string[] | null
          name: string
          payment_terms: string | null
          phone: string
          preferred_origins: string[] | null
          product_requirements: string[] | null
          quality_requirements: string[] | null
          quantity_required: string | null
          target_price: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          address: string
          business_number?: string | null
          certification_requirements?: string[] | null
          contact_person?: string | null
          created_at?: string | null
          delivery_schedule?: string | null
          delivery_terms?: string | null
          email: string
          id?: string
          import_licenses?: string[] | null
          name: string
          payment_terms?: string | null
          phone: string
          preferred_origins?: string[] | null
          product_requirements?: string[] | null
          quality_requirements?: string[] | null
          quantity_required?: string | null
          target_price?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          address?: string
          business_number?: string | null
          certification_requirements?: string[] | null
          contact_person?: string | null
          created_at?: string | null
          delivery_schedule?: string | null
          delivery_terms?: string | null
          email?: string
          id?: string
          import_licenses?: string[] | null
          name?: string
          payment_terms?: string | null
          phone?: string
          preferred_origins?: string[] | null
          product_requirements?: string[] | null
          quality_requirements?: string[] | null
          quantity_required?: string | null
          target_price?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      companies: {
        Row: {
          account_type_id: number | null
          address: string
          cnpj: string | null
          created_at: string | null
          email: string
          id: string
          name: string
          phone: string
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          account_type_id?: number | null
          address: string
          cnpj?: string | null
          created_at?: string | null
          email: string
          id?: string
          name: string
          phone: string
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          account_type_id?: number | null
          address?: string
          cnpj?: string | null
          created_at?: string | null
          email?: string
          id?: string
          name?: string
          phone?: string
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "companies_account_type_id_fkey"
            columns: ["account_type_id"]
            isOneToOne: false
            referencedRelation: "account_types"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          account_type_id: number | null
          created_at: string | null
          date_format: string | null
          email: string | null
          full_name: string | null
          id: string
          language: string | null
          notifications_enabled: boolean | null
          phone: string | null
          timezone: string | null
          updated_at: string | null
        }
        Insert: {
          account_type_id?: number | null
          created_at?: string | null
          date_format?: string | null
          email?: string | null
          full_name?: string | null
          id: string
          language?: string | null
          notifications_enabled?: boolean | null
          phone?: string | null
          timezone?: string | null
          updated_at?: string | null
        }
        Update: {
          account_type_id?: number | null
          created_at?: string | null
          date_format?: string | null
          email?: string | null
          full_name?: string | null
          id?: string
          language?: string | null
          notifications_enabled?: boolean | null
          phone?: string | null
          timezone?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "profiles_account_type_id_fkey"
            columns: ["account_type_id"]
            isOneToOne: false
            referencedRelation: "account_types"
            referencedColumns: ["id"]
          },
        ]
      }
      suppliers: {
        Row: {
          address: string
          available_certifications: string[] | null
          cnpj: string
          contact_person: string | null
          created_at: string | null
          email: string
          export_experience: string | null
          geographical_focus: string[] | null
          id: string
          lead_time: string | null
          minimum_order_quantity: string | null
          name: string
          phone: string
          product_types: string[] | null
          production_capacity: string | null
          products: string[] | null
          quality_standards: string[] | null
          sif_registration: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          address: string
          available_certifications?: string[] | null
          cnpj: string
          contact_person?: string | null
          created_at?: string | null
          email: string
          export_experience?: string | null
          geographical_focus?: string[] | null
          id?: string
          lead_time?: string | null
          minimum_order_quantity?: string | null
          name: string
          phone: string
          product_types?: string[] | null
          production_capacity?: string | null
          products?: string[] | null
          quality_standards?: string[] | null
          sif_registration?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          address?: string
          available_certifications?: string[] | null
          cnpj?: string
          contact_person?: string | null
          created_at?: string | null
          email?: string
          export_experience?: string | null
          geographical_focus?: string[] | null
          id?: string
          lead_time?: string | null
          minimum_order_quantity?: string | null
          name?: string
          phone?: string
          product_types?: string[] | null
          production_capacity?: string | null
          products?: string[] | null
          quality_standards?: string[] | null
          sif_registration?: string | null
          updated_at?: string | null
          user_id?: string | null
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
