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
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
        ]
      }
      admin_users: {
        Row: {
          created_at: string
          id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          user_id?: string
        }
        Relationships: []
      }
      cart_items: {
        Row: {
          cart_id: string
          created_at: string
          custom_design_image_url: string | null
          custom_design_print_file_url: string | null
          custom_design_state: Json | null
          id: string
          quantity: number
          updated_at: string
          variant_id: string
        }
        Insert: {
          cart_id: string
          created_at?: string
          custom_design_image_url?: string | null
          custom_design_print_file_url?: string | null
          custom_design_state?: Json | null
          id?: string
          quantity: number
          updated_at?: string
          variant_id: string
        }
        Update: {
          cart_id?: string
          created_at?: string
          custom_design_image_url?: string | null
          custom_design_print_file_url?: string | null
          custom_design_state?: Json | null
          id?: string
          quantity?: number
          updated_at?: string
          variant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "cart_items_cart_id_fkey"
            columns: ["cart_id"]
            isOneToOne: false
            referencedRelation: "carts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cart_items_variant_id_fkey"
            columns: ["variant_id"]
            isOneToOne: false
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
            isOneToOne: false
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
            isOneToOne: false
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
            isOneToOne: false
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
          custom_design_url: string | null
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
          custom_design_url?: string | null
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
          custom_design_url?: string | null
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
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "product_catalog"
            referencedColumns: ["product_id"]
          },
          {
            foreignKeyName: "order_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_items_variant_id_fkey"
            columns: ["variant_id"]
            isOneToOne: false
            referencedRelation: "product_variants"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          billing_address: Json | null
          carrier: string | null
          contact_email: string
          contact_phone: string | null
          created_at: string
          currency: string
          customer_id: string
          discount_cents: number
          discount_code_id: string | null
          flagged_by_admin: boolean
          id: string
          order_number: string
          payment_provider: Database["public"]["Enums"]["payment_provider"]
          payment_ref: string | null
          printful_order_id: string | null
          refunded_amount_cents: number | null
          refunded_at: string | null
          shipping_address: Json
          shipping_cents: number
          status: Database["public"]["Enums"]["order_status"]
          subtotal_cents: number
          tax_cents: number
          total_cents: number
          tracking_number: string | null
          tracking_url: string | null
          updated_at: string
        }
        Insert: {
          billing_address?: Json | null
          carrier?: string | null
          contact_email: string
          contact_phone?: string | null
          created_at?: string
          currency: string
          customer_id: string
          discount_cents?: number
          discount_code_id?: string | null
          flagged_by_admin?: boolean
          id?: string
          order_number: string
          payment_provider: Database["public"]["Enums"]["payment_provider"]
          payment_ref?: string | null
          printful_order_id?: string | null
          refunded_amount_cents?: number | null
          refunded_at?: string | null
          shipping_address: Json
          shipping_cents: number
          status?: Database["public"]["Enums"]["order_status"]
          subtotal_cents: number
          tax_cents: number
          total_cents: number
          tracking_number?: string | null
          tracking_url?: string | null
          updated_at?: string
        }
        Update: {
          billing_address?: Json | null
          carrier?: string | null
          contact_email?: string
          contact_phone?: string | null
          created_at?: string
          currency?: string
          customer_id?: string
          discount_cents?: number
          discount_code_id?: string | null
          flagged_by_admin?: boolean
          id?: string
          order_number?: string
          payment_provider?: Database["public"]["Enums"]["payment_provider"]
          payment_ref?: string | null
          printful_order_id?: string | null
          refunded_amount_cents?: number | null
          refunded_at?: string | null
          shipping_address?: Json
          shipping_cents?: number
          status?: Database["public"]["Enums"]["order_status"]
          subtotal_cents?: number
          tax_cents?: number
          total_cents?: number
          tracking_number?: string | null
          tracking_url?: string | null
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
          {
            foreignKeyName: "orders_discount_code_id_fkey"
            columns: ["discount_code_id"]
            isOneToOne: false
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
            isOneToOne: false
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
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "product_categories_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "product_catalog"
            referencedColumns: ["product_id"]
          },
          {
            foreignKeyName: "product_categories_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
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
            isOneToOne: false
            referencedRelation: "product_catalog"
            referencedColumns: ["product_id"]
          },
          {
            foreignKeyName: "product_images_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
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
            isOneToOne: false
            referencedRelation: "product_catalog"
            referencedColumns: ["product_id"]
          },
          {
            foreignKeyName: "product_translations_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
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
          print_area_dpi: number | null
          print_area_height_px: number | null
          print_area_width_px: number | null
          printful_variant_id: string | null
          product_id: string
          size: string | null
          sku: string
          stock_policy: Database["public"]["Enums"]["stock_policy"]
          updated_at: string
          weight_grams: number | null
        }
        Insert: {
          color?: string | null
          created_at?: string
          id?: string
          print_area_dpi?: number | null
          print_area_height_px?: number | null
          print_area_width_px?: number | null
          printful_variant_id?: string | null
          product_id: string
          size?: string | null
          sku: string
          stock_policy?: Database["public"]["Enums"]["stock_policy"]
          updated_at?: string
          weight_grams?: number | null
        }
        Update: {
          color?: string | null
          created_at?: string
          id?: string
          print_area_dpi?: number | null
          print_area_height_px?: number | null
          print_area_width_px?: number | null
          printful_variant_id?: string | null
          product_id?: string
          size?: string | null
          sku?: string
          stock_policy?: Database["public"]["Enums"]["stock_policy"]
          updated_at?: string
          weight_grams?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "product_variants_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "product_catalog"
            referencedColumns: ["product_id"]
          },
          {
            foreignKeyName: "product_variants_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
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
          is_bestseller: boolean
          printful_variant_id: string | null
          slug: string
          status: Database["public"]["Enums"]["product_status"]
          updated_at: string
        }
        Insert: {
          base_cost_usd: number
          created_at?: string
          id?: string
          is_bestseller?: boolean
          printful_variant_id?: string | null
          slug: string
          status?: Database["public"]["Enums"]["product_status"]
          updated_at?: string
        }
        Update: {
          base_cost_usd?: number
          created_at?: string
          id?: string
          is_bestseller?: boolean
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
            isOneToOne: false
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
      testimonials: {
        Row: {
          author_name: string
          created_at: string
          id: string
          locale: string
          position: number
          quote: string
          rating: number
        }
        Insert: {
          author_name: string
          created_at?: string
          id?: string
          locale: string
          position?: number
          quote: string
          rating: number
        }
        Update: {
          author_name?: string
          created_at?: string
          id?: string
          locale?: string
          position?: number
          quote?: string
          rating?: number
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
      product_catalog: {
        Row: {
          category_slugs: string[] | null
          colors: string[] | null
          created_at: string | null
          description: string | null
          image_alt: string | null
          image_url: string | null
          is_bestseller: boolean | null
          locale: string | null
          min_price_usd_cents: number | null
          name: string | null
          product_id: string | null
          seo_desc: string | null
          seo_title: string | null
          sizes: string[] | null
          slug: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      admin_customer_summaries: {
        Args: { p_cursor: string; p_limit?: number }
        Returns: {
          contact_email: string
          customer_id: string
          display_name: string
          last_order_at: string
          lifetime_totals: Json
          order_count: number
        }[]
      }
      admin_daily_revenue: {
        Args: { p_end: string; p_start: string }
        Returns: {
          currency: string
          day: string
          order_count: number
          total_cents: number
        }[]
      }
      admin_save_product: {
        Args: {
          p_base_cost_usd: number
          p_category_ids: string[]
          p_images: Json
          p_is_bestseller: boolean
          p_printful_variant_id: string
          p_product_id: string
          p_slug: string
          p_status: Database["public"]["Enums"]["product_status"]
          p_translations: Json
          p_variants: Json
        }
        Returns: {
          base_cost_usd: number
          created_at: string
          id: string
          is_bestseller: boolean
          printful_variant_id: string | null
          slug: string
          status: Database["public"]["Enums"]["product_status"]
          updated_at: string
        }
        SetofOptions: {
          from: "*"
          to: "products"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      admin_top_products: {
        Args: { p_end: string; p_limit?: number; p_start: string }
        Returns: {
          name: string
          product_key: string
          quantity: number
          revenue_cents: number
        }[]
      }
      bootstrap_admin_if_empty: {
        Args: { p_user_id: string }
        Returns: boolean
      }
      claim_webhook_event: {
        Args: {
          p_external_id: string
          p_payload: Json
          p_provider: Database["public"]["Enums"]["webhook_provider"]
        }
        Returns: string
      }
      cleanup_stale_anonymous_users: { Args: never; Returns: undefined }
      cleanup_stale_custom_designs: { Args: never; Returns: undefined }
      create_order_with_items: {
        Args: {
          p_billing_address: Json
          p_cart_id: string
          p_contact_email: string
          p_contact_phone: string
          p_currency: string
          p_customer_id: string
          p_discount_cents: number
          p_discount_code_id: string
          p_items: Json
          p_payment_provider: Database["public"]["Enums"]["payment_provider"]
          p_shipping_address: Json
          p_shipping_cents: number
          p_subtotal_cents: number
          p_tax_cents: number
          p_total_cents: number
        }
        Returns: {
          billing_address: Json | null
          carrier: string | null
          contact_email: string
          contact_phone: string | null
          created_at: string
          currency: string
          customer_id: string
          discount_cents: number
          discount_code_id: string | null
          flagged_by_admin: boolean
          id: string
          order_number: string
          payment_provider: Database["public"]["Enums"]["payment_provider"]
          payment_ref: string | null
          printful_order_id: string | null
          refunded_amount_cents: number | null
          refunded_at: string | null
          shipping_address: Json
          shipping_cents: number
          status: Database["public"]["Enums"]["order_status"]
          subtotal_cents: number
          tax_cents: number
          total_cents: number
          tracking_number: string | null
          tracking_url: string | null
          updated_at: string
        }
        SetofOptions: {
          from: "*"
          to: "orders"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      custom_access_token_hook: { Args: { event: Json }; Returns: Json }
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
      payment_provider: "paypal" | "youcan_pay" | "mock"
      product_status: "draft" | "active" | "archived"
      stock_policy: "made_to_order" | "in_stock" | "out_of_stock"
      webhook_provider: "paypal" | "youcan_pay" | "printful" | "mock"
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
      payment_provider: ["paypal", "youcan_pay", "mock"],
      product_status: ["draft", "active", "archived"],
      stock_policy: ["made_to_order", "in_stock", "out_of_stock"],
      webhook_provider: ["paypal", "youcan_pay", "printful", "mock"],
    },
  },
} as const
