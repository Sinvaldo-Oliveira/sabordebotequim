/**
 * Tipos do banco de dados Supabase — gerados manualmente a partir das
 * migrations em supabase/migrations/ (ambiente sem Docker/Podman para
 * rodar `supabase gen types typescript` localmente).
 *
 * Para regenerar com a ferramenta oficial em um ambiente com Docker:
 *   npx supabase gen types typescript --db-url "<connection-string>" --schema public > src/types/database.types.ts
 */

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type UserRole = "superadmin" | "admin" | "moderator" | "analyst" | "restaurant";
export type EntityStatus = "active" | "inactive" | "pending" | "suspended";
export type FestivalStatus =
  | "draft"
  | "scheduled"
  | "active"
  | "paused"
  | "closed"
  | "tallying"
  | "published";
export type VotingRule =
  | "one_per_festival"
  | "one_per_category"
  | "one_per_restaurant"
  | "one_per_period"
  | "custom"
  | "one_vote_per_whatsapp_per_festival";
export type VoteStatus = "valid" | "under_review" | "suspicious" | "invalidated" | "cancelled";
export type ChangeRequestStatus = "pending" | "approved" | "rejected";
export type VerificationStatus =
  | "pending"
  | "verified"
  | "expired"
  | "blocked"
  | "used"
  | "cancelled";

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          full_name: string | null;
          role: UserRole;
          status: EntityStatus;
          avatar_url: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          full_name?: string | null;
          role?: UserRole;
          status?: EntityStatus;
          avatar_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["profiles"]["Insert"]>;
        Relationships: [];
      };

      festivals: {
        Row: {
          id: string;
          name: string;
          slug: string;
          description: string | null;
          start_date: string | null;
          end_date: string | null;
          voting_start_at: string | null;
          voting_end_at: string | null;
          timezone: string;
          status: FestivalStatus;
          settings: Json;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          slug: string;
          description?: string | null;
          start_date?: string | null;
          end_date?: string | null;
          voting_start_at?: string | null;
          voting_end_at?: string | null;
          timezone?: string;
          status?: FestivalStatus;
          settings?: Json;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["festivals"]["Insert"]>;
        Relationships: [];
      };

      voting_categories: {
        Row: {
          id: string;
          festival_id: string;
          name: string;
          slug: string;
          description: string | null;
          image_url: string | null;
          voting_rule: VotingRule;
          period_hours: number | null;
          voting_start_at: string | null;
          voting_end_at: string | null;
          status: EntityStatus;
          display_order: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          festival_id: string;
          name: string;
          slug: string;
          description?: string | null;
          image_url?: string | null;
          voting_rule?: VotingRule;
          period_hours?: number | null;
          voting_start_at?: string | null;
          voting_end_at?: string | null;
          status?: EntityStatus;
          display_order?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["voting_categories"]["Insert"]>;
        Relationships: [];
      };

      restaurants: {
        Row: {
          id: string;
          festival_id: string;
          owner_user_id: string | null;
          name: string;
          slug: string;
          short_description: string | null;
          description: string | null;
          story: string | null;
          category_id: string | null;
          logo_url: string | null;
          card_image_url: string | null;
          banner_url: string | null;
          phone: string | null;
          whatsapp: string | null;
          email: string | null;
          website: string | null;
          instagram: string | null;
          facebook: string | null;
          tiktok: string | null;
          address: string | null;
          number: string | null;
          complement: string | null;
          neighborhood: string | null;
          city: string;
          state: string;
          postal_code: string | null;
          latitude: number | null;
          longitude: number | null;
          opening_hours: Json;
          status: EntityStatus;
          is_featured: boolean;
          display_order: number;
          created_at: string;
          updated_at: string;
          deleted_at: string | null;
        };
        Insert: {
          id?: string;
          festival_id: string;
          owner_user_id?: string | null;
          name: string;
          slug: string;
          short_description?: string | null;
          description?: string | null;
          story?: string | null;
          category_id?: string | null;
          logo_url?: string | null;
          card_image_url?: string | null;
          banner_url?: string | null;
          phone?: string | null;
          whatsapp?: string | null;
          email?: string | null;
          website?: string | null;
          instagram?: string | null;
          facebook?: string | null;
          tiktok?: string | null;
          address?: string | null;
          number?: string | null;
          complement?: string | null;
          neighborhood?: string | null;
          city?: string;
          state?: string;
          postal_code?: string | null;
          latitude?: number | null;
          longitude?: number | null;
          opening_hours?: Json;
          status?: EntityStatus;
          is_featured?: boolean;
          display_order?: number;
          created_at?: string;
          updated_at?: string;
          deleted_at?: string | null;
        };
        Update: Partial<Database["public"]["Tables"]["restaurants"]["Insert"]>;
        Relationships: [];
      };

      dishes: {
        Row: {
          id: string;
          restaurant_id: string;
          category_id: string | null;
          name: string;
          description: string | null;
          story: string | null;
          ingredients: string | null;
          dietary_information: string | null;
          price: number | null;
          main_image_url: string | null;
          status: EntityStatus;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          restaurant_id: string;
          category_id?: string | null;
          name: string;
          description?: string | null;
          story?: string | null;
          ingredients?: string | null;
          dietary_information?: string | null;
          price?: number | null;
          main_image_url?: string | null;
          status?: EntityStatus;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["dishes"]["Insert"]>;
        Relationships: [];
      };

      restaurant_gallery: {
        Row: {
          id: number;
          restaurant_id: string;
          image_url: string;
          alt_text: string | null;
          display_order: number;
          created_at: string;
        };
        Insert: {
          id?: number;
          restaurant_id: string;
          image_url: string;
          alt_text?: string | null;
          display_order?: number;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["restaurant_gallery"]["Insert"]>;
        Relationships: [];
      };

      sponsors: {
        Row: {
          id: number;
          festival_id: string;
          name: string;
          logo_url: string | null;
          website_url: string | null;
          sponsorship_level: string | null;
          status: EntityStatus;
          display_order: number;
          created_at: string;
        };
        Insert: {
          id?: number;
          festival_id: string;
          name: string;
          logo_url?: string | null;
          website_url?: string | null;
          sponsorship_level?: string | null;
          status?: EntityStatus;
          display_order?: number;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["sponsors"]["Insert"]>;
        Relationships: [];
      };

      landing_sections: {
        Row: {
          id: number;
          festival_id: string;
          section_key: string;
          title: string | null;
          subtitle: string | null;
          content: Json;
          image_url: string | null;
          settings: Json;
          is_active: boolean;
          display_order: number;
          updated_at: string;
        };
        Insert: {
          id?: number;
          festival_id: string;
          section_key: string;
          title?: string | null;
          subtitle?: string | null;
          content?: Json;
          image_url?: string | null;
          settings?: Json;
          is_active?: boolean;
          display_order?: number;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["landing_sections"]["Insert"]>;
        Relationships: [];
      };

      system_settings: {
        Row: {
          id: number;
          festival_id: string | null;
          setting_key: string;
          setting_value: Json;
          updated_at: string;
        };
        Insert: {
          id?: number;
          festival_id?: string | null;
          setting_key: string;
          setting_value?: Json;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["system_settings"]["Insert"]>;
        Relationships: [];
      };

      hero_slides: {
        Row: {
          id: number;
          festival_id: string;
          image_url: string;
          title: string | null;
          subtitle: string | null;
          cta_label: string | null;
          cta_href: string | null;
          overlay_opacity: number;
          display_order: number;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: number;
          festival_id: string;
          image_url: string;
          title?: string | null;
          subtitle?: string | null;
          cta_label?: string | null;
          cta_href?: string | null;
          overlay_opacity?: number;
          display_order?: number;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["hero_slides"]["Insert"]>;
        Relationships: [];
      };

      votes: {
        Row: {
          id: number;
          festival_id: string;
          restaurant_id: string;
          dish_id: string | null;
          category_id: string;
          voter_name: string;
          voter_cpf_hash: string | null;
          voter_cpf_encrypted: string | null;
          voter_cpf_last_digits: string | null;
          whatsapp_hash: string | null;
          whatsapp_encrypted: string | null;
          whatsapp_last_digits: string | null;
          verification_id: number | null;
          protocol: string;
          status: VoteStatus;
          consent_privacy: boolean;
          consent_regulation: boolean;
          terms_version: string;
          ip_hash: string | null;
          user_agent: string | null;
          risk_score: number;
          risk_reasons: Json;
          moderation_notes: string | null;
          created_at: string;
          updated_at: string;
          invalidated_at: string | null;
          invalidated_by: string | null;
          invalidation_reason: string | null;
        };
        // Não há INSERT/UPDATE direto na tabela (RLS bloqueia): a única via de
        // escrita é register_vote()/moderate_vote(). Os tipos abaixo existem
        // apenas para satisfazer a forma estrutural exigida pelo supabase-js.
        Insert: Partial<Database["public"]["Tables"]["votes"]["Row"]>;
        Update: Partial<Database["public"]["Tables"]["votes"]["Row"]>;
        Relationships: [];
      };

      vote_verifications: {
        Row: {
          id: number;
          festival_id: string;
          restaurant_id: string;
          category_id: string;
          dish_id: string | null;
          voter_name: string;
          whatsapp_hash: string;
          whatsapp_encrypted: string;
          whatsapp_last_digits: string;
          otp_hash: string;
          otp_expires_at: string;
          otp_attempts: number;
          otp_max_attempts: number;
          resend_count: number;
          last_sent_at: string;
          status: VerificationStatus;
          consent_regulation: boolean;
          consent_privacy: boolean;
          terms_version: string;
          ip_hash: string | null;
          user_agent: string | null;
          created_at: string;
          verified_at: string | null;
          used_at: string | null;
        };
        // Escrita somente via request_vote_otp()/verify_vote_otp().
        Insert: Partial<Database["public"]["Tables"]["vote_verifications"]["Row"]>;
        Update: Partial<Database["public"]["Tables"]["vote_verifications"]["Row"]>;
        Relationships: [];
      };

      analytics_events: {
        Row: {
          id: number;
          festival_id: string | null;
          restaurant_id: string | null;
          category_id: string | null;
          event_name: string;
          session_id: string | null;
          page_path: string | null;
          referrer: string | null;
          utm_source: string | null;
          utm_medium: string | null;
          utm_campaign: string | null;
          device_type: string | null;
          browser: string | null;
          operating_system: string | null;
          metadata: Json;
          created_at: string;
        };
        Insert: {
          id?: number;
          festival_id?: string | null;
          restaurant_id?: string | null;
          category_id?: string | null;
          event_name: string;
          session_id?: string | null;
          page_path?: string | null;
          referrer?: string | null;
          utm_source?: string | null;
          utm_medium?: string | null;
          utm_campaign?: string | null;
          device_type?: string | null;
          browser?: string | null;
          operating_system?: string | null;
          metadata?: Json;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["analytics_events"]["Insert"]>;
        Relationships: [];
      };

      restaurant_change_requests: {
        Row: {
          id: number;
          restaurant_id: string;
          requested_by: string | null;
          current_data: Json;
          requested_data: Json;
          status: ChangeRequestStatus;
          reviewed_by: string | null;
          reviewed_at: string | null;
          review_notes: string | null;
          created_at: string;
        };
        Insert: {
          id?: number;
          restaurant_id: string;
          requested_by?: string | null;
          current_data: Json;
          requested_data: Json;
          status?: ChangeRequestStatus;
          reviewed_by?: string | null;
          reviewed_at?: string | null;
          review_notes?: string | null;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["restaurant_change_requests"]["Insert"]>;
        Relationships: [];
      };

      audit_logs: {
        Row: {
          id: number;
          user_id: string | null;
          action: string;
          entity_type: string;
          entity_id: string | null;
          old_values: Json | null;
          new_values: Json | null;
          ip_hash: string | null;
          created_at: string;
        };
        // Escrita somente via private.write_audit_log() (SECURITY DEFINER).
        Insert: Partial<Database["public"]["Tables"]["audit_logs"]["Row"]>;
        Update: Partial<Database["public"]["Tables"]["audit_logs"]["Row"]>;
        Relationships: [];
      };
    };

    Views: {
      [_ in never]: never;
    };

    Functions: {
      register_vote: {
        Args: {
          p_festival_id: string;
          p_category_id: string;
          p_restaurant_id: string;
          p_dish_id: string | null;
          p_voter_name: string;
          p_voter_cpf: string;
          p_cpf_hash_salt: string;
          p_cpf_encryption_key: string;
          p_consent_privacy: boolean;
          p_consent_regulation: boolean;
          p_terms_version: string;
          p_ip_hash?: string | null;
          p_user_agent?: string | null;
          p_risk_score?: number;
          p_risk_reasons?: Json;
        };
        Returns: { protocol: string; status: VoteStatus; created_at: string }[];
      };
      request_vote_otp: {
        Args: {
          p_festival_id: string;
          p_category_id: string;
          p_restaurant_id: string;
          p_dish_id: string | null;
          p_voter_name: string;
          p_whatsapp_e164: string;
          p_whatsapp_salt: string;
          p_encryption_key: string;
          p_otp_hash: string;
          p_otp_ttl_seconds: number;
          p_resend_min_seconds: number;
          p_max_sends_per_window: number;
          p_consent_regulation: boolean;
          p_consent_privacy: boolean;
          p_terms_version: string;
          p_ip_hash?: string | null;
          p_user_agent?: string | null;
        };
        Returns: {
          verification_id: number;
          whatsapp_last_digits: string;
          resend_count: number;
        }[];
      };
      verify_vote_otp: {
        Args: { p_verification_id: number; p_otp_hash_attempt: string };
        Returns: { protocol: string; restaurant_id: string; created_at: string }[];
      };
      get_whatsapp_voting_metrics: {
        Args: { p_festival_id: string };
        Returns: Json;
      };
      moderate_vote: {
        Args: {
          p_vote_id: number;
          p_new_status: VoteStatus;
          p_reason?: string | null;
        };
        Returns: undefined;
      };
      update_own_profile: {
        Args: { p_full_name?: string | null; p_avatar_url?: string | null };
        Returns: undefined;
      };
      get_public_settings: {
        Args: { p_festival_id: string };
        Returns: Json;
      };
      get_public_vote_counts: {
        Args: { p_festival_id: string };
        Returns: { restaurant_id: string; votes_count: number }[];
      };
      get_restaurant_metrics: {
        Args: { p_restaurant_id: string };
        Returns: Json;
      };
      get_admin_dashboard_stats: {
        Args: { p_festival_id: string };
        Returns: Json;
      };
      anonymize_festival_votes: {
        Args: { p_festival_id: string };
        Returns: undefined;
      };
    };

    Enums: {
      user_role: UserRole;
      entity_status: EntityStatus;
      festival_status: FestivalStatus;
      voting_rule: VotingRule;
      vote_status: VoteStatus;
      change_request_status: ChangeRequestStatus;
      verification_status: VerificationStatus;
    };
  };
};
