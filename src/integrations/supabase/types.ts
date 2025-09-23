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
          created_at: string
          description: string | null
          id: number
          name: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: number
          name: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: number
          name?: string
        }
        Relationships: []
      }
      buyers: {
        Row: {
          additional_comments: string | null
          address: string | null
          bank_guarantee_details: string | null
          business_number: string | null
          certification_requirements: string[] | null
          contact_person: string | null
          created_at: string
          delivery_conditions: string | null
          delivery_destination: string | null
          email: string | null
          financing_needs: string | null
          id: string
          insurance_requirements: string | null
          letter_of_credit_details: string | null
          name: string
          phone: string | null
          preferred_payment_method: string | null
          product_requirements: string[] | null
          quantity_required: string | null
          required_delivery_date: string | null
          target_price: string | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          additional_comments?: string | null
          address?: string | null
          bank_guarantee_details?: string | null
          business_number?: string | null
          certification_requirements?: string[] | null
          contact_person?: string | null
          created_at?: string
          delivery_conditions?: string | null
          delivery_destination?: string | null
          email?: string | null
          financing_needs?: string | null
          id?: string
          insurance_requirements?: string | null
          letter_of_credit_details?: string | null
          name: string
          phone?: string | null
          preferred_payment_method?: string | null
          product_requirements?: string[] | null
          quantity_required?: string | null
          required_delivery_date?: string | null
          target_price?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          additional_comments?: string | null
          address?: string | null
          bank_guarantee_details?: string | null
          business_number?: string | null
          certification_requirements?: string[] | null
          contact_person?: string | null
          created_at?: string
          delivery_conditions?: string | null
          delivery_destination?: string | null
          email?: string | null
          financing_needs?: string | null
          id?: string
          insurance_requirements?: string | null
          letter_of_credit_details?: string | null
          name?: string
          phone?: string | null
          preferred_payment_method?: string | null
          product_requirements?: string[] | null
          quantity_required?: string | null
          required_delivery_date?: string | null
          target_price?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      carriers: {
        Row: {
          address: string | null
          capacity: string | null
          certifications: string[] | null
          company_name: string
          container_details: string | null
          created_at: string
          documents_compliance: string[] | null
          email: string | null
          estimated_transit_time: string | null
          freight_cost: string | null
          id: string
          included_services: string[] | null
          insurance_details: string | null
          license_number: string | null
          mode_of_transport: string[] | null
          origin_destinations: string[] | null
          phone: string | null
          service_areas: string[] | null
          shipment_schedule: string | null
          special_requirements: string | null
          temperature_control: boolean | null
          tracking_support_details: string | null
          updated_at: string
          user_id: string | null
          vehicle_types: string[] | null
        }
        Insert: {
          address?: string | null
          capacity?: string | null
          certifications?: string[] | null
          company_name: string
          container_details?: string | null
          created_at?: string
          documents_compliance?: string[] | null
          email?: string | null
          estimated_transit_time?: string | null
          freight_cost?: string | null
          id?: string
          included_services?: string[] | null
          insurance_details?: string | null
          license_number?: string | null
          mode_of_transport?: string[] | null
          origin_destinations?: string[] | null
          phone?: string | null
          service_areas?: string[] | null
          shipment_schedule?: string | null
          special_requirements?: string | null
          temperature_control?: boolean | null
          tracking_support_details?: string | null
          updated_at?: string
          user_id?: string | null
          vehicle_types?: string[] | null
        }
        Update: {
          address?: string | null
          capacity?: string | null
          certifications?: string[] | null
          company_name?: string
          container_details?: string | null
          created_at?: string
          documents_compliance?: string[] | null
          email?: string | null
          estimated_transit_time?: string | null
          freight_cost?: string | null
          id?: string
          included_services?: string[] | null
          insurance_details?: string | null
          license_number?: string | null
          mode_of_transport?: string[] | null
          origin_destinations?: string[] | null
          phone?: string | null
          service_areas?: string[] | null
          shipment_schedule?: string | null
          special_requirements?: string | null
          temperature_control?: boolean | null
          tracking_support_details?: string | null
          updated_at?: string
          user_id?: string | null
          vehicle_types?: string[] | null
        }
        Relationships: []
      }
      companies: {
        Row: {
          account_type_id: number
          address: string | null
          capacity: string | null
          certifications: string[] | null
          cnpj: string | null
          created_at: string
          delivery_location: string | null
          delivery_time: string | null
          email: string | null
          id: string
          minimum_order_quantity: string | null
          name: string
          phone: string | null
          technical_datasheet: string | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          account_type_id: number
          address?: string | null
          capacity?: string | null
          certifications?: string[] | null
          cnpj?: string | null
          created_at?: string
          delivery_location?: string | null
          delivery_time?: string | null
          email?: string | null
          id?: string
          minimum_order_quantity?: string | null
          name: string
          phone?: string | null
          technical_datasheet?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          account_type_id?: number
          address?: string | null
          capacity?: string | null
          certifications?: string[] | null
          cnpj?: string | null
          created_at?: string
          delivery_location?: string | null
          delivery_time?: string | null
          email?: string | null
          id?: string
          minimum_order_quantity?: string | null
          name?: string
          phone?: string | null
          technical_datasheet?: string | null
          updated_at?: string
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
          account_type_id: number
          country: string | null
          created_at: string
          date_format: string | null
          email: string | null
          full_name: string | null
          id: string
          language: string | null
          notifications_enabled: boolean | null
          phone: string | null
          timezone: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          account_type_id: number
          country?: string | null
          created_at?: string
          date_format?: string | null
          email?: string | null
          full_name?: string | null
          id?: string
          language?: string | null
          notifications_enabled?: boolean | null
          phone?: string | null
          timezone?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          account_type_id?: number
          country?: string | null
          created_at?: string
          date_format?: string | null
          email?: string | null
          full_name?: string | null
          id?: string
          language?: string | null
          notifications_enabled?: boolean | null
          phone?: string | null
          timezone?: string | null
          updated_at?: string
          user_id?: string
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
          additional_comments: string | null
          address: string | null
          available_certifications: string[] | null
          available_quantity: string | null
          cnpj: string | null
          contact_person: string | null
          created_at: string
          email: string | null
          id: string
          incoterm: string | null
          name: string
          offer_validity: string | null
          packaging: string | null
          payment_method: string | null
          phone: string | null
          price_per_unit: string | null
          product_types: string[] | null
          products: string[] | null
          shipping_details: string | null
          sif_registration: string | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          additional_comments?: string | null
          address?: string | null
          available_certifications?: string[] | null
          available_quantity?: string | null
          cnpj?: string | null
          contact_person?: string | null
          created_at?: string
          email?: string | null
          id?: string
          incoterm?: string | null
          name: string
          offer_validity?: string | null
          packaging?: string | null
          payment_method?: string | null
          phone?: string | null
          price_per_unit?: string | null
          product_types?: string[] | null
          products?: string[] | null
          shipping_details?: string | null
          sif_registration?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          additional_comments?: string | null
          address?: string | null
          available_certifications?: string[] | null
          available_quantity?: string | null
          cnpj?: string | null
          contact_person?: string | null
          created_at?: string
          email?: string | null
          id?: string
          incoterm?: string | null
          name?: string
          offer_validity?: string | null
          packaging?: string | null
          payment_method?: string | null
          phone?: string | null
          price_per_unit?: string | null
          product_types?: string[] | null
          products?: string[] | null
          shipping_details?: string | null
          sif_registration?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      user_companies: {
        Row: {
          company_id: string
          created_at: string
          id: string
          role: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          company_id: string
          created_at?: string
          id?: string
          role?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          company_id?: string
          created_at?: string
          id?: string
          role?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_companies_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
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
