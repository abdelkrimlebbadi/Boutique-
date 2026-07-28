// Generated from supabase/migrations/. Regenerate with `npm run db:types`
// once a real Supabase project is linked (see package.json).

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
      addresses: {
        Row: {
          city: string
          country_code: string
          created_at: string
          customer_id: string
          full_name: string
          id: string
          is_default_billing: boolean
          is_default_shipping: boolean
          line1: string
          line2: string | null
          phone: string | null
          postal_code: string
          state: string | null
          updated_at: string
        }
        Insert: {
          city: string
          country_code: string
          created_at?: string
          customer_id: string
          full_name: string
          id?: string
          is_default_billing?: boolean
          is_default_shipping?: boolean
          line1: string
          line2?: string | null
          phone?: string | null
          postal_code: string
          state?: string | null
          updated_at?: string
        }
        Update: {
          city?: string
          country_code?: string
          created_at?: string
          customer_id?: string
          full_name?: string
          id?: string
          is_default_billing?: boolean
          is_default_shipping?: boolean
          line1?: string
          line2?: string | null
          phone?: string | null
          postal_code?: string
          state?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "addresses_customer_id_fkey"
            columns: ["customer_id"]
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
        ]
      }
      cart_items: {
        Row: {
          cart_id: string
          created_at: string
          id: string
          quantity: number
          updated_at: string
          variant_id: string
        }
        Insert: {
          cart_id: string
          created_at?: string
          id?: string
          quantity: number
          updated_at?: string
          variant_id: string
        }
        Update: {
          cart_id?: string
          created_at?: string
          id?: string
          quantity?: number
          updated_at?: string
          variant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "cart_items_cart_id_fkey"
            columns: ["cart_id"]
            referencedRelation: "carts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cart_items_variant_id_fkey"
            columns: ["variant_id"]
            referencedRelation: "product_variants"
            referencedColumns: ["id"]
          },
        ]
      }
      carts: {
        Row: {
          created_at: string
          currency: string
          customer_id: string
          id: string
          status: Database["public"]["Enums"]["cart_status"]
          updated_at: string
        }
        Insert: {
          created_at?: string
          currency?: string
          customer_id: string
          id?: string
          status?: Database["public"]["Enums"]["cart_status"]
          updated_at?: string
        }
        Update: {
          created_at?: string
          currency?: string
          customer_id?: string
          id?: string
          status?: Database["public"]["Enums"]["cart_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "carts_customer_id_fkey"
            columns: ["customer_id"]
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
        ]
      }
      categories: {
        Row: {
          created_at: string
          id: string
          parent_id: string | null
          position: number
          slug: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          parent_id?: string | null
          position?: number
          slug: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          parent_id?: string | null
          position?: number
          slug?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "categories_parent_id_fkey"
            columns: ["parent_id"]
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
      }
      category_translations: {
        Row: {
          category_id: string
          description: string | null
          locale: string
          name: string
          seo_desc: string | null
          seo_title: string | null
        }
        Insert: {
          category_id: string
          description?: string | null
          locale: string
          name: string
          seo_desc?: string | null
          seo_title?: string | null
        }
        Update: {
          category_id?: string
          description?: string | null
          locale?: string
          name?: string
          seo_desc?: string | null
          seo_title?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "category_translations_category_id_fkey"
            columns: ["category_id"]
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
      }
      customers: {
        Row: {
          created_at: string
          full_name: string | null
          id: string
          marketing_opt_in: boolean
          phone: string | null
          preferred_locale: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          full_name?: string | null
          id: string
          marketing_opt_in?: boolean
          phone?: string | null
          preferred_locale?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          full_name?: string | null
          id?: string
          marketing_opt_in?: boolean
          phone?: string | null
          preferred_locale?: string
          updated_at?: string
        }
        Relationships: []
      }
      discount_codes: {
        Row: {
          active: boolean
          amount_cents: number | null
          code: string
          created_at: string
          expires_at: string | null
          id: string
          max_uses: number | null
          percentage: number | null
          type: Database["public"]["Enums"]["discount_type"]
          updated_at: string
          used_count: number
        }
        Insert: {
          active?: boolean
          amount_cents?: number | null
          code: string
          created_at?: string
          expires_at?: string | null
          id?: string
          max_uses?: number | null
          percentage?: number | null
          type: Database["public"]["Enums"]["discount_type"]
          updated_at?: string
          used_count?: number
        }
        Update: {
          active?: boolean
          amount_cents?: number | null
          code?: string
          created_at?: string
          expires_at?: string | null
          id?: string
          max_uses?: number | null
          percentage?: number | null
          type?: Database["public"]["Enums"]["discount_type"]
          updated_at?: string
          used_count?: number
        }
        Relationships: []
      }
      fx_rates: {
        Row: {
          base_currency: string
          fetched_at: string
          id: string
          quote_currency: string
          rate: number
        }
        Insert: {
          base_currency: string
          fetched_at?: string
          id?: string
          quote_currency: string
          rate: number
        }
        Update: {
          base_currency?: string
          fetched_at?: string
          id?: string
          quote_currency?: string
          rate?: number
        }
        Relationships: []
      }
      order_items: {
        Row: {
          created_at: string
          customer_id: string
          id: string
          image_url: string | null
          line_total_cents: number
          name: string
          order_id: string
          printful_variant_id: string | null
          product_id: string | null
          quantity: number
          sku: string
          unit_price_cents: number
          variant_id: string | null
          variant_label: string | null
        }
        Insert: {
          created_at?: string
          customer_id: string
          id?: string
          image_url?: string | null
          line_total_cents: number
          name: string
          order_id: string
          printful_variant_id?: string | null
          product_id?: string | null
          quantity: number
          sku: string
          unit_price_cents: number
          variant_id?: string | null
          variant_label?: string | null
        }
        Update: {
          created_at?: string
          customer_id?: string
          id?: string
          image_url?: string | null
          line_total_cents?: number
          name?: string
          order_id?: string
          printful_variant_id?: string | null
          product_id?: string | null
          quantity?: number
          sku?: string
          unit_price_cents?: number
          variant_id?: string | null
          variant_label?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "order_items_order_id_fkey"
            columns: ["order_id"]
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_items_product_id_fkey"
            columns: ["product_id"]
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_items_variant_id_fkey"
            columns: ["variant_id"]
            referencedRelation: "product_variants"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          billing_address: Json | null
          contact_email: string
          contact_phone: string | null
          created_at: string
          currency: string
          customer_id: string
          discount_cents: number
          discount_code_id: string | null
          id: string
          order_number: string
          payment_provider: Database["public"]["Enums"]["payment_provider"]
          payment_ref: string | null
          printful_order_id: string | null
          shipping_address: Json
          shipping_cents: number
          status: Database["public"]["Enums"]["order_status"]
          subtotal_cents: number
          tax_cents: number
          total_cents: number
          updated_at: string
        }
        Insert: {
          billing_address?: Json | null
          contact_email: string
          contact_phone?: string | null
          created_at?: string
          currency: string
          customer_id: string
          discount_cents?: number
          discount_code_id?: string | null
          id?: string
          order_number: string
          payment_provider: Database["public"]["Enums"]["payment_provider"]
          payment_ref?: string | null
          printful_order_id?: string | null
          shipping_address: Json
          shipping_cents: number
          status?: Database["public"]["Enums"]["order_status"]
          subtotal_cents: number
          tax_cents: number
          total_cents: number
          updated_at?: string
        }
        Update: {
          billing_address?: Json | null
          contact_email?: string
          contact_phone?: string | null
          created_at?: string
          currency?: string
          customer_id?: string
          discount_cents?: number
          discount_code_id?: string | null
          id?: string
          order_number?: string
          payment_provider?: Database["public"]["Enums"]["payment_provider"]
          payment_ref?: string | null
          printful_order_id?: string | null
          shipping_address?: Json
          shipping_cents?: number
          status?: Database["public"]["Enums"]["order_status"]
          subtotal_cents?: number
          tax_cents?: number
          total_cents?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "orders_customer_id_fkey"
            columns: ["customer_id"]
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_discount_code_id_fkey"
            columns: ["discount_code_id"]
            referencedRelation: "discount_codes"
            referencedColumns: ["id"]
          },
        ]
      }
      prices: {
        Row: {
          amount_cents: number
          compare_at_cents: number | null
          created_at: string
          currency: string
          id: string
          updated_at: string
          variant_id: string
        }
        Insert: {
          amount_cents: number
          compare_at_cents?: number | null
          created_at?: string
          currency: string
          id?: string
          updated_at?: string
          variant_id: string
        }
        Update: {
          amount_cents?: number
          compare_at_cents?: number | null
          created_at?: string
          currency?: string
          id?: string
          updated_at?: string
          variant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "prices_variant_id_fkey"
            columns: ["variant_id"]
            referencedRelation: "product_variants"
            referencedColumns: ["id"]
          },
        ]
      }
      product_categories: {
        Row: {
          category_id: string
          product_id: string
        }
        Insert: {
          category_id: string
          product_id: string
        }
        Update: {
          category_id?: string
          product_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "product_categories_category_id_fkey"
            columns: ["category_id"]
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "product_categories_product_id_fkey"
            columns: ["product_id"]
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      product_images: {
        Row: {
          alt: string | null
          created_at: string
          id: string
          position: number
          product_id: string
          url: string
        }
        Insert: {
          alt?: string | null
          created_at?: string
          id?: string
          position?: number
          product_id: string
          url: string
        }
        Update: {
          alt?: string | null
          created_at?: string
          id?: string
          position?: number
          product_id?: string
          url?: string
        }
        Relationships: [
          {
            foreignKeyName: "product_images_product_id_fkey"
            columns: ["product_id"]
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      product_translations: {
        Row: {
          description: string | null
          locale: string
          name: string
          product_id: string
          search_vector: unknown
          seo_desc: string | null
          seo_title: string | null
        }
        Insert: {
          description?: string | null
          locale: string
          name: string
          product_id: string
          search_vector?: unknown
          seo_desc?: string | null
          seo_title?: string | null
        }
        Update: {
          description?: string | null
          locale?: string
          name?: string
          product_id?: string
          search_vector?: unknown
          seo_desc?: string | null
          seo_title?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "product_translations_product_id_fkey"
            columns: ["product_id"]
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      product_variants: {
        Row: {
          color: string | null
          created_at: string
          id: string
          printful_variant_id: string | null
          product_id: string
          size: string | null
          sku: string
          stock_policy: Database["public"]["Enums"]["stock_policy"]
          updated_at: string
        }
        Insert: {
          color?: string | null
          created_at?: string
          id?: string
          printful_variant_id?: string | null
          product_id: string
          size?: string | null
          sku: string
          stock_policy?: Database["public"]["Enums"]["stock_policy"]
          updated_at?: string
        }
        Update: {
          color?: string | null
          created_at?: string
          id?: string
          printful_variant_id?: string | null
          product_id?: string
          size?: string | null
          sku?: string
          stock_policy?: Database["public"]["Enums"]["stock_policy"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "product_variants_product_id_fkey"
            columns: ["product_id"]
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      products: {
        Row: {
          base_cost_usd: number
          created_at: string
          id: string
          printful_variant_id: string | null
          slug: string
          status: Database["public"]["Enums"]["product_status"]
          updated_at: string
        }
        Insert: {
          base_cost_usd: number
          created_at?: string
          id?: string
          printful_variant_id?: string | null
          slug: string
          status?: Database["public"]["Enums"]["product_status"]
          updated_at?: string
        }
        Update: {
          base_cost_usd?: number
          created_at?: string
          id?: string
          printful_variant_id?: string | null
          slug?: string
          status?: Database["public"]["Enums"]["product_status"]
          updated_at?: string
        }
        Relationships: []
      }
      shipping_rates: {
        Row: {
          created_at: string
          currency: string
          id: string
          max_weight_grams: number | null
          min_weight_grams: number
          price_cents: number
          updated_at: string
          zone_id: string
        }
        Insert: {
          created_at?: string
          currency: string
          id?: string
          max_weight_grams?: number | null
          min_weight_grams?: number
          price_cents: number
          updated_at?: string
          zone_id: string
        }
        Update: {
          created_at?: string
          currency?: string
          id?: string
          max_weight_grams?: number | null
          min_weight_grams?: number
          price_cents?: number
          updated_at?: string
          zone_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "shipping_rates_zone_id_fkey"
            columns: ["zone_id"]
            referencedRelation: "shipping_zones"
            referencedColumns: ["id"]
          },
        ]
      }
      shipping_zones: {
        Row: {
          country_codes: string[]
          created_at: string
          id: string
          name: string
          updated_at: string
        }
        Insert: {
          country_codes: string[]
          created_at?: string
          id?: string
          name: string
          updated_at?: string
        }
        Update: {
          country_codes?: string[]
          created_at?: string
          id?: string
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      webhook_events: {
        Row: {
          created_at: string
          external_id: string
          id: string
          payload: Json
          processed_at: string | null
          provider: Database["public"]["Enums"]["webhook_provider"]
        }
        Insert: {
          created_at?: string
          external_id: string
          id?: string
          payload: Json
          processed_at?: string | null
          provider: Database["public"]["Enums"]["webhook_provider"]
        }
        Update: {
          created_at?: string
          external_id?: string
          id?: string
          payload?: Json
          processed_at?: string | null
          provider?: Database["public"]["Enums"]["webhook_provider"]
        }
        Relationships: []
      }
    }
    Views: {
      latest_fx_rates: {
        Row: {
          base_currency: string | null
          fetched_at: string | null
          quote_currency: string | null
          rate: number | null
        }
        Relationships: []
      }
    }
    Functions: {
      cleanup_stale_anonymous_users: { Args: never; Returns: undefined }
      validate_discount_code: {
        Args: { p_code: string }
        Returns: {
          amount_cents: number
          discount_code_id: string
          percentage: number
          type: Database["public"]["Enums"]["discount_type"]
          valid: boolean
        }[]
      }
    }
    Enums: {
      cart_status: "active" | "converted"
      discount_type: "fixed" | "percentage"
      order_status:
        | "pending"
        | "paid"
        | "processing"
        | "shipped"
        | "delivered"
        | "cancelled"
        | "refunded"
        | "failed"
      payment_provider: "paypal" | "youcan_pay"
      product_status: "draft" | "active" | "archived"
      stock_policy: "made_to_order" | "in_stock" | "out_of_stock"
      webhook_provider: "paypal" | "youcan_pay" | "printful"
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
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
    keyof DefaultSchema["Tables"] | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
    keyof DefaultSchema["Tables"] | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
    keyof DefaultSchema["Enums"] | { schema: keyof DatabaseWithoutInternals },
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
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
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
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
      cart_status: ["active", "converted"],
      discount_type: ["fixed", "percentage"],
      order_status: [
        "pending",
        "paid",
        "processing",
        "shipped",
        "delivered",
        "cancelled",
        "refunded",
        "failed",
      ],
      payment_provider: ["paypal", "youcan_pay"],
      product_status: ["draft", "active", "archived"],
      stock_policy: ["made_to_order", "in_stock", "out_of_stock"],
      webhook_provider: ["paypal", "youcan_pay", "printful"],
    },
  },
} as const

