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
    PostgrestVersion: "14.4"
  }
  public: {
    Tables: {
      appointments: {
        Row: {
          appointment_type: string
          created_at: string
          customer_email: string
          customer_name: string
          customer_phone: string | null
          id: string
          notes: string | null
          preferred_date: string
          preferred_time: string
          status: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          appointment_type?: string
          created_at?: string
          customer_email: string
          customer_name: string
          customer_phone?: string | null
          id?: string
          notes?: string | null
          preferred_date: string
          preferred_time: string
          status?: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          appointment_type?: string
          created_at?: string
          customer_email?: string
          customer_name?: string
          customer_phone?: string | null
          id?: string
          notes?: string | null
          preferred_date?: string
          preferred_time?: string
          status?: string
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      customers: {
        Row: {
          address_line1: string | null
          address_line2: string | null
          city: string | null
          country: string | null
          created_at: string
          email: string
          fraud_score: number | null
          id: string
          name: string
          notes: string | null
          phone: string | null
          state: string | null
          total_orders: number | null
          total_spent: number | null
          updated_at: string
          user_id: string | null
          zip: string | null
        }
        Insert: {
          address_line1?: string | null
          address_line2?: string | null
          city?: string | null
          country?: string | null
          created_at?: string
          email: string
          fraud_score?: number | null
          id?: string
          name: string
          notes?: string | null
          phone?: string | null
          state?: string | null
          total_orders?: number | null
          total_spent?: number | null
          updated_at?: string
          user_id?: string | null
          zip?: string | null
        }
        Update: {
          address_line1?: string | null
          address_line2?: string | null
          city?: string | null
          country?: string | null
          created_at?: string
          email?: string
          fraud_score?: number | null
          id?: string
          name?: string
          notes?: string | null
          phone?: string | null
          state?: string | null
          total_orders?: number | null
          total_spent?: number | null
          updated_at?: string
          user_id?: string | null
          zip?: string | null
        }
        Relationships: []
      }
      invoices: {
        Row: {
          created_at: string
          currency: string | null
          customer_id: string | null
          discount: number | null
          due_date: string
          id: string
          invoice_number: string
          issue_date: string
          notes: string | null
          order_id: string | null
          paid_at: string | null
          status: string
          subtotal: number
          tax: number | null
          total: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          currency?: string | null
          customer_id?: string | null
          discount?: number | null
          due_date?: string
          id?: string
          invoice_number: string
          issue_date?: string
          notes?: string | null
          order_id?: string | null
          paid_at?: string | null
          status?: string
          subtotal?: number
          tax?: number | null
          total?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          currency?: string | null
          customer_id?: string | null
          discount?: number | null
          due_date?: string
          id?: string
          invoice_number?: string
          issue_date?: string
          notes?: string | null
          order_id?: string | null
          paid_at?: string | null
          status?: string
          subtotal?: number
          tax?: number | null
          total?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "invoices_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoices_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      order_items: {
        Row: {
          color: string | null
          created_at: string
          custom_details: Json | null
          fabric: string | null
          id: string
          order_id: string
          product_id: string | null
          product_name: string
          quantity: number
          size: string | null
          total_price: number
          unit_price: number
        }
        Insert: {
          color?: string | null
          created_at?: string
          custom_details?: Json | null
          fabric?: string | null
          id?: string
          order_id: string
          product_id?: string | null
          product_name: string
          quantity?: number
          size?: string | null
          total_price: number
          unit_price: number
        }
        Update: {
          color?: string | null
          created_at?: string
          custom_details?: Json | null
          fabric?: string | null
          id?: string
          order_id?: string
          product_id?: string | null
          product_name?: string
          quantity?: number
          size?: string | null
          total_price?: number
          unit_price?: number
        }
        Relationships: [
          {
            foreignKeyName: "order_items_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          carrier: string | null
          created_at: string
          currency: string | null
          customer_id: string | null
          discount: number | null
          fraud_flag: boolean | null
          fraud_reason: string | null
          id: string
          notes: string | null
          order_number: string
          payment_method: string | null
          payment_status: string
          shipping_address: string | null
          shipping_city: string | null
          shipping_cost: number | null
          shipping_country: string | null
          shipping_zip: string | null
          status: string
          subtotal: number
          tax: number | null
          total: number
          tracking_number: string | null
          updated_at: string
        }
        Insert: {
          carrier?: string | null
          created_at?: string
          currency?: string | null
          customer_id?: string | null
          discount?: number | null
          fraud_flag?: boolean | null
          fraud_reason?: string | null
          id?: string
          notes?: string | null
          order_number: string
          payment_method?: string | null
          payment_status?: string
          shipping_address?: string | null
          shipping_city?: string | null
          shipping_cost?: number | null
          shipping_country?: string | null
          shipping_zip?: string | null
          status?: string
          subtotal?: number
          tax?: number | null
          total?: number
          tracking_number?: string | null
          updated_at?: string
        }
        Update: {
          carrier?: string | null
          created_at?: string
          currency?: string | null
          customer_id?: string | null
          discount?: number | null
          fraud_flag?: boolean | null
          fraud_reason?: string | null
          id?: string
          notes?: string | null
          order_number?: string
          payment_method?: string | null
          payment_status?: string
          shipping_address?: string | null
          shipping_city?: string | null
          shipping_cost?: number | null
          shipping_country?: string | null
          shipping_zip?: string | null
          status?: string
          subtotal?: number
          tax?: number | null
          total?: number
          tracking_number?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "orders_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
        ]
      }
      payments: {
        Row: {
          amount: number
          created_at: string
          currency: string | null
          gateway_response: Json | null
          id: string
          invoice_id: string | null
          method: string
          order_id: string | null
          paid_at: string | null
          status: string
          transaction_id: string | null
        }
        Insert: {
          amount?: number
          created_at?: string
          currency?: string | null
          gateway_response?: Json | null
          id?: string
          invoice_id?: string | null
          method?: string
          order_id?: string | null
          paid_at?: string | null
          status?: string
          transaction_id?: string | null
        }
        Update: {
          amount?: number
          created_at?: string
          currency?: string | null
          gateway_response?: Json | null
          id?: string
          invoice_id?: string | null
          method?: string
          order_id?: string | null
          paid_at?: string | null
          status?: string
          transaction_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "payments_invoice_id_fkey"
            columns: ["invoice_id"]
            isOneToOne: false
            referencedRelation: "invoices"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payments_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      products: {
        Row: {
          category: string
          color: string | null
          compare_at_price: number | null
          cost_price: number | null
          created_at: string
          description: string | null
          dimensions_height: number | null
          dimensions_length: number | null
          dimensions_width: number | null
          fabric_type: string | null
          featured: boolean | null
          id: string
          images: string[] | null
          low_stock_threshold: number | null
          name: string
          price: number
          seo_description: string | null
          seo_title: string | null
          short_description: string | null
          sizes: string[] | null
          sku: string | null
          slug: string | null
          status: string
          stock: number
          subcategory: string | null
          tags: string[] | null
          updated_at: string
          weight: number | null
          weight_unit: string | null
        }
        Insert: {
          category?: string
          color?: string | null
          compare_at_price?: number | null
          cost_price?: number | null
          created_at?: string
          description?: string | null
          dimensions_height?: number | null
          dimensions_length?: number | null
          dimensions_width?: number | null
          fabric_type?: string | null
          featured?: boolean | null
          id?: string
          images?: string[] | null
          low_stock_threshold?: number | null
          name: string
          price?: number
          seo_description?: string | null
          seo_title?: string | null
          short_description?: string | null
          sizes?: string[] | null
          sku?: string | null
          slug?: string | null
          status?: string
          stock?: number
          subcategory?: string | null
          tags?: string[] | null
          updated_at?: string
          weight?: number | null
          weight_unit?: string | null
        }
        Update: {
          category?: string
          color?: string | null
          compare_at_price?: number | null
          cost_price?: number | null
          created_at?: string
          description?: string | null
          dimensions_height?: number | null
          dimensions_length?: number | null
          dimensions_width?: number | null
          fabric_type?: string | null
          featured?: boolean | null
          id?: string
          images?: string[] | null
          low_stock_threshold?: number | null
          name?: string
          price?: number
          seo_description?: string | null
          seo_title?: string | null
          short_description?: string | null
          sizes?: string[] | null
          sku?: string | null
          slug?: string | null
          status?: string
          stock?: number
          subcategory?: string | null
          tags?: string[] | null
          updated_at?: string
          weight?: number | null
          weight_unit?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          body_measurements: Json | null
          created_at: string
          full_name: string | null
          id: string
          phone: string | null
          preferred_style: string | null
          saved_designs: Json | null
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          body_measurements?: Json | null
          created_at?: string
          full_name?: string | null
          id: string
          phone?: string | null
          preferred_style?: string | null
          saved_designs?: Json | null
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          body_measurements?: Json | null
          created_at?: string
          full_name?: string | null
          id?: string
          phone?: string | null
          preferred_style?: string | null
          saved_designs?: Json | null
          updated_at?: string
        }
        Relationships: []
      }
      reviews: {
        Row: {
          author_name: string
          body: string
          created_at: string
          id: string
          product_id: string
          rating: number
          title: string
          user_id: string | null
          verified_purchase: boolean | null
        }
        Insert: {
          author_name?: string
          body?: string
          created_at?: string
          id?: string
          product_id: string
          rating?: number
          title?: string
          user_id?: string | null
          verified_purchase?: boolean | null
        }
        Update: {
          author_name?: string
          body?: string
          created_at?: string
          id?: string
          product_id?: string
          rating?: number
          title?: string
          user_id?: string | null
          verified_purchase?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "reviews_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      shipments: {
        Row: {
          actual_delivery: string | null
          carrier: string
          cost: number | null
          created_at: string
          estimated_delivery: string | null
          id: string
          notes: string | null
          order_id: string
          status: string
          tracking_number: string | null
          updated_at: string
          weight: number | null
        }
        Insert: {
          actual_delivery?: string | null
          carrier?: string
          cost?: number | null
          created_at?: string
          estimated_delivery?: string | null
          id?: string
          notes?: string | null
          order_id: string
          status?: string
          tracking_number?: string | null
          updated_at?: string
          weight?: number | null
        }
        Update: {
          actual_delivery?: string | null
          carrier?: string
          cost?: number | null
          created_at?: string
          estimated_delivery?: string | null
          id?: string
          notes?: string | null
          order_id?: string
          status?: string
          tracking_number?: string | null
          updated_at?: string
          weight?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "shipments_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
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
