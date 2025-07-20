export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instanciate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      activities: {
        Row: {
          company_id: string
          cost_actual: number | null
          cost_est: number | null
          created_at: string
          dependencies: string[] | null
          description: string | null
          duration: unknown | null
          end_date: string | null
          id: string
          is_expanded: boolean | null
          level: number | null
          name: string
          parent_id: string | null
          project_id: string | null
          quality_metrics: Json | null
          sort_order: number | null
          stage: string | null
          start_date: string | null
          updated_at: string
        }
        Insert: {
          company_id: string
          cost_actual?: number | null
          cost_est?: number | null
          created_at?: string
          dependencies?: string[] | null
          description?: string | null
          duration?: unknown | null
          end_date?: string | null
          id?: string
          is_expanded?: boolean | null
          level?: number | null
          name: string
          parent_id?: string | null
          project_id?: string | null
          quality_metrics?: Json | null
          sort_order?: number | null
          stage?: string | null
          start_date?: string | null
          updated_at?: string
        }
        Update: {
          company_id?: string
          cost_actual?: number | null
          cost_est?: number | null
          created_at?: string
          dependencies?: string[] | null
          description?: string | null
          duration?: unknown | null
          end_date?: string | null
          id?: string
          is_expanded?: boolean | null
          level?: number | null
          name?: string
          parent_id?: string | null
          project_id?: string | null
          quality_metrics?: Json | null
          sort_order?: number | null
          stage?: string | null
          start_date?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "activities_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "activities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "activities_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      ai_chat_interactions: {
        Row: {
          command_text: string
          command_type: string | null
          company_id: string | null
          context_data: Json | null
          created_at: string
          error_message: string | null
          execution_time_ms: number | null
          id: string
          project_id: string | null
          response_summary: string | null
          success: boolean | null
          user_id: string
        }
        Insert: {
          command_text: string
          command_type?: string | null
          company_id?: string | null
          context_data?: Json | null
          created_at?: string
          error_message?: string | null
          execution_time_ms?: number | null
          id?: string
          project_id?: string | null
          response_summary?: string | null
          success?: boolean | null
          user_id: string
        }
        Update: {
          command_text?: string
          command_type?: string | null
          company_id?: string | null
          context_data?: Json | null
          created_at?: string
          error_message?: string | null
          execution_time_ms?: number | null
          id?: string
          project_id?: string | null
          response_summary?: string | null
          success?: boolean | null
          user_id?: string
        }
        Relationships: []
      }
      ai_chat_logs: {
        Row: {
          context: Json | null
          created_at: string
          id: string
          message_type: string
          response_length: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          context?: Json | null
          created_at?: string
          id?: string
          message_type: string
          response_length?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          context?: Json | null
          created_at?: string
          id?: string
          message_type?: string
          response_length?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      billing_history: {
        Row: {
          amount: number
          billing_date: string
          created_at: string
          currency: string
          id: string
          status: string
          stripe_invoice_id: string | null
          subscription_id: string | null
          user_id: string
        }
        Insert: {
          amount: number
          billing_date?: string
          created_at?: string
          currency?: string
          id?: string
          status: string
          stripe_invoice_id?: string | null
          subscription_id?: string | null
          user_id: string
        }
        Update: {
          amount?: number
          billing_date?: string
          created_at?: string
          currency?: string
          id?: string
          status?: string
          stripe_invoice_id?: string | null
          subscription_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "billing_history_subscription_id_fkey"
            columns: ["subscription_id"]
            isOneToOne: false
            referencedRelation: "user_subscriptions"
            referencedColumns: ["id"]
          },
        ]
      }
      companies: {
        Row: {
          abn: string | null
          address: string | null
          business_hours: Json | null
          business_type: Database["public"]["Enums"]["business_type"] | null
          certification_status: string | null
          company_size: string | null
          contact_preferences: Json | null
          created_at: string
          created_by: string | null
          id: string
          industry: string | null
          logo_url: string | null
          meta_description: string | null
          meta_title: string | null
          name: string
          onboarding_completed: boolean | null
          phone: string | null
          portfolio_highlights: string[] | null
          public_page: boolean | null
          rating: number | null
          review_count: number | null
          service_areas: string[] | null
          slogan: string | null
          slug: string
          social_links: Json | null
          subscription_tier: string | null
          updated_at: string
          verified: boolean | null
          website: string | null
          year_established: number | null
        }
        Insert: {
          abn?: string | null
          address?: string | null
          business_hours?: Json | null
          business_type?: Database["public"]["Enums"]["business_type"] | null
          certification_status?: string | null
          company_size?: string | null
          contact_preferences?: Json | null
          created_at?: string
          created_by?: string | null
          id?: string
          industry?: string | null
          logo_url?: string | null
          meta_description?: string | null
          meta_title?: string | null
          name: string
          onboarding_completed?: boolean | null
          phone?: string | null
          portfolio_highlights?: string[] | null
          public_page?: boolean | null
          rating?: number | null
          review_count?: number | null
          service_areas?: string[] | null
          slogan?: string | null
          slug: string
          social_links?: Json | null
          subscription_tier?: string | null
          updated_at?: string
          verified?: boolean | null
          website?: string | null
          year_established?: number | null
        }
        Update: {
          abn?: string | null
          address?: string | null
          business_hours?: Json | null
          business_type?: Database["public"]["Enums"]["business_type"] | null
          certification_status?: string | null
          company_size?: string | null
          contact_preferences?: Json | null
          created_at?: string
          created_by?: string | null
          id?: string
          industry?: string | null
          logo_url?: string | null
          meta_description?: string | null
          meta_title?: string | null
          name?: string
          onboarding_completed?: boolean | null
          phone?: string | null
          portfolio_highlights?: string[] | null
          public_page?: boolean | null
          rating?: number | null
          review_count?: number | null
          service_areas?: string[] | null
          slogan?: string | null
          slug?: string
          social_links?: Json | null
          subscription_tier?: string | null
          updated_at?: string
          verified?: boolean | null
          website?: string | null
          year_established?: number | null
        }
        Relationships: []
      }
      company_members: {
        Row: {
          company_id: string
          created_at: string
          id: string
          joined_at: string
          role: string
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          company_id: string
          created_at?: string
          id?: string
          joined_at?: string
          role?: string
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          company_id?: string
          created_at?: string
          id?: string
          joined_at?: string
          role?: string
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "company_members_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      company_modules: {
        Row: {
          company_id: string
          created_at: string
          enabled: boolean
          id: string
          module_name: string
          updated_at: string
        }
        Insert: {
          company_id: string
          created_at?: string
          enabled?: boolean
          id?: string
          module_name: string
          updated_at?: string
        }
        Update: {
          company_id?: string
          created_at?: string
          enabled?: boolean
          id?: string
          module_name?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "company_modules_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      contracts: {
        Row: {
          agreed_price: number
          client_id: string
          contract_number: string
          created_at: string
          currency: string | null
          end_date: string | null
          id: string
          milestones: Json | null
          payment_schedule: Json | null
          project_request_id: string | null
          proposal_id: string | null
          provider_id: string
          start_date: string
          status: string | null
          terms: string
          updated_at: string
        }
        Insert: {
          agreed_price: number
          client_id: string
          contract_number: string
          created_at?: string
          currency?: string | null
          end_date?: string | null
          id?: string
          milestones?: Json | null
          payment_schedule?: Json | null
          project_request_id?: string | null
          proposal_id?: string | null
          provider_id: string
          start_date: string
          status?: string | null
          terms: string
          updated_at?: string
        }
        Update: {
          agreed_price?: number
          client_id?: string
          contract_number?: string
          created_at?: string
          currency?: string | null
          end_date?: string | null
          id?: string
          milestones?: Json | null
          payment_schedule?: Json | null
          project_request_id?: string | null
          proposal_id?: string | null
          provider_id?: string
          start_date?: string
          status?: string | null
          terms?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "contracts_project_request_id_fkey"
            columns: ["project_request_id"]
            isOneToOne: false
            referencedRelation: "project_requests"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contracts_proposal_id_fkey"
            columns: ["proposal_id"]
            isOneToOne: false
            referencedRelation: "proposals"
            referencedColumns: ["id"]
          },
        ]
      }
      digital_objects: {
        Row: {
          company_id: string
          created_at: string
          description: string | null
          expanded: boolean | null
          id: string
          level: number
          name: string
          object_type: string
          parent_id: string | null
          project_id: string | null
          stage: string
          status: string
          updated_at: string
        }
        Insert: {
          company_id: string
          created_at?: string
          description?: string | null
          expanded?: boolean | null
          id?: string
          level?: number
          name: string
          object_type: string
          parent_id?: string | null
          project_id?: string | null
          stage?: string
          status?: string
          updated_at?: string
        }
        Update: {
          company_id?: string
          created_at?: string
          description?: string | null
          expanded?: boolean | null
          id?: string
          level?: number
          name?: string
          object_type?: string
          parent_id?: string | null
          project_id?: string | null
          stage?: string
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "digital_objects_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "digital_objects_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "digital_objects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "digital_objects_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      estimate_line_items: {
        Row: {
          created_at: string
          estimate_id: string
          id: string
          item_description: string
          line_total: number | null
          quantity: number
          sort_order: number | null
          unit_price: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          estimate_id: string
          id?: string
          item_description: string
          line_total?: number | null
          quantity?: number
          sort_order?: number | null
          unit_price?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          estimate_id?: string
          id?: string
          item_description?: string
          line_total?: number | null
          quantity?: number
          sort_order?: number | null
          unit_price?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "estimate_line_items_estimate_id_fkey"
            columns: ["estimate_id"]
            isOneToOne: false
            referencedRelation: "estimates"
            referencedColumns: ["id"]
          },
        ]
      }
      estimates: {
        Row: {
          client_email: string | null
          client_name: string | null
          company_id: string
          created_at: string
          created_by: string | null
          estimate_date: string
          estimate_name: string
          estimate_number: string
          expiry_date: string | null
          id: string
          last_modified_by: string | null
          notes: string | null
          project_id: string | null
          status: string
          subtotal: number | null
          tax_amount: number | null
          total_amount: number | null
          updated_at: string
        }
        Insert: {
          client_email?: string | null
          client_name?: string | null
          company_id: string
          created_at?: string
          created_by?: string | null
          estimate_date?: string
          estimate_name: string
          estimate_number: string
          expiry_date?: string | null
          id?: string
          last_modified_by?: string | null
          notes?: string | null
          project_id?: string | null
          status?: string
          subtotal?: number | null
          tax_amount?: number | null
          total_amount?: number | null
          updated_at?: string
        }
        Update: {
          client_email?: string | null
          client_name?: string | null
          company_id?: string
          created_at?: string
          created_by?: string | null
          estimate_date?: string
          estimate_name?: string
          estimate_number?: string
          expiry_date?: string | null
          id?: string
          last_modified_by?: string | null
          notes?: string | null
          project_id?: string | null
          status?: string
          subtotal?: number | null
          tax_amount?: number | null
          total_amount?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "estimates_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "estimates_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      invoice_allocations: {
        Row: {
          account_id: string | null
          allocated_amount: number | null
          created_at: string
          digital_object_id: string | null
          id: string
          invoice_id: string
          notes: string | null
          project_id: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          account_id?: string | null
          allocated_amount?: number | null
          created_at?: string
          digital_object_id?: string | null
          id?: string
          invoice_id: string
          notes?: string | null
          project_id?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          account_id?: string | null
          allocated_amount?: number | null
          created_at?: string
          digital_object_id?: string | null
          id?: string
          invoice_id?: string
          notes?: string | null
          project_id?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      leads: {
        Row: {
          avatar_url: string | null
          company: string
          company_id: string
          contact_email: string | null
          contact_name: string
          contact_phone: string | null
          created_at: string
          description: string | null
          id: string
          last_activity: string | null
          location: string | null
          notes: string | null
          priority: string
          project_address: string | null
          source: string
          stage: string
          updated_at: string
          value: number
          website: string | null
        }
        Insert: {
          avatar_url?: string | null
          company: string
          company_id: string
          contact_email?: string | null
          contact_name: string
          contact_phone?: string | null
          created_at?: string
          description?: string | null
          id?: string
          last_activity?: string | null
          location?: string | null
          notes?: string | null
          priority?: string
          project_address?: string | null
          source?: string
          stage?: string
          updated_at?: string
          value?: number
          website?: string | null
        }
        Update: {
          avatar_url?: string | null
          company?: string
          company_id?: string
          contact_email?: string | null
          contact_name?: string
          contact_phone?: string | null
          created_at?: string
          description?: string | null
          id?: string
          last_activity?: string | null
          location?: string | null
          notes?: string | null
          priority?: string
          project_address?: string | null
          source?: string
          stage?: string
          updated_at?: string
          value?: number
          website?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "leads_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      map_configurations: {
        Row: {
          bearing: number | null
          center_lat: number
          center_lng: number
          created_at: string
          id: string
          is_active: boolean | null
          name: string
          pitch: number | null
          updated_at: string
          zoom: number
        }
        Insert: {
          bearing?: number | null
          center_lat: number
          center_lng: number
          created_at?: string
          id?: string
          is_active?: boolean | null
          name?: string
          pitch?: number | null
          updated_at?: string
          zoom: number
        }
        Update: {
          bearing?: number | null
          center_lat?: number
          center_lng?: number
          created_at?: string
          id?: string
          is_active?: boolean | null
          name?: string
          pitch?: number | null
          updated_at?: string
          zoom?: number
        }
        Relationships: []
      }
      model_3d: {
        Row: {
          coordinates: unknown | null
          created_at: string
          description: string | null
          elevation: number | null
          file_size: number | null
          file_url: string
          id: string
          name: string
          project_id: string | null
          rotation_x: number | null
          rotation_y: number | null
          rotation_z: number | null
          scale: number | null
          updated_at: string
          uploaded_by: string | null
        }
        Insert: {
          coordinates?: unknown | null
          created_at?: string
          description?: string | null
          elevation?: number | null
          file_size?: number | null
          file_url: string
          id?: string
          name: string
          project_id?: string | null
          rotation_x?: number | null
          rotation_y?: number | null
          rotation_z?: number | null
          scale?: number | null
          updated_at?: string
          uploaded_by?: string | null
        }
        Update: {
          coordinates?: unknown | null
          created_at?: string
          description?: string | null
          elevation?: number | null
          file_size?: number | null
          file_url?: string
          id?: string
          name?: string
          project_id?: string | null
          rotation_x?: number | null
          rotation_y?: number | null
          rotation_z?: number | null
          scale?: number | null
          updated_at?: string
          uploaded_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_model_3d_project"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          created_at: string
          id: string
          is_read: boolean
          message: string | null
          title: string
          type: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_read?: boolean
          message?: string | null
          title: string
          type?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          is_read?: boolean
          message?: string | null
          title?: string
          type?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      platform_invitations: {
        Row: {
          accepted_at: string | null
          company_id: string | null
          created_at: string
          declined_at: string | null
          email: string
          expires_at: string
          id: string
          invitation_type: string
          invited_by: string
          message: string | null
          role: Database["public"]["Enums"]["app_role"]
          status: string | null
          token: string
          updated_at: string
        }
        Insert: {
          accepted_at?: string | null
          company_id?: string | null
          created_at?: string
          declined_at?: string | null
          email: string
          expires_at?: string
          id?: string
          invitation_type: string
          invited_by: string
          message?: string | null
          role?: Database["public"]["Enums"]["app_role"]
          status?: string | null
          token?: string
          updated_at?: string
        }
        Update: {
          accepted_at?: string | null
          company_id?: string | null
          created_at?: string
          declined_at?: string | null
          email?: string
          expires_at?: string
          id?: string
          invitation_type?: string
          invited_by?: string
          message?: string | null
          role?: Database["public"]["Enums"]["app_role"]
          status?: string | null
          token?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "platform_invitations_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      portfolio_items: {
        Row: {
          case_study_url: string | null
          category: string
          created_at: string | null
          description: string | null
          id: string
          is_featured: boolean | null
          is_public: boolean | null
          media_urls: string[] | null
          owner_id: string
          owner_type: string
          project_date: string | null
          title: string
          updated_at: string | null
        }
        Insert: {
          case_study_url?: string | null
          category: string
          created_at?: string | null
          description?: string | null
          id?: string
          is_featured?: boolean | null
          is_public?: boolean | null
          media_urls?: string[] | null
          owner_id: string
          owner_type: string
          project_date?: string | null
          title: string
          updated_at?: string | null
        }
        Update: {
          case_study_url?: string | null
          category?: string
          created_at?: string | null
          description?: string | null
          id?: string
          is_featured?: boolean | null
          is_public?: boolean | null
          media_urls?: string[] | null
          owner_id?: string
          owner_type?: string
          project_date?: string | null
          title?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          account_activated: boolean | null
          avatar_url: string | null
          awards: string[] | null
          bio: string | null
          birth_date: string | null
          company: string | null
          company_slogan: string | null
          created_at: string
          email: string | null
          first_login_at: string | null
          first_name: string | null
          id: string
          job_title: string | null
          last_name: string | null
          licenses: string[] | null
          location: string | null
          meta_description: string | null
          meta_title: string | null
          password_change_required: boolean | null
          phone: string | null
          professional_title: string | null
          public_profile: boolean | null
          qualifications: string[] | null
          rating: number | null
          review_count: number | null
          services: string[] | null
          skills: string[] | null
          slug: string | null
          social_links: Json | null
          status: string
          updated_at: string
          user_id: string | null
          verified: boolean | null
          website: string | null
          years_experience: number | null
        }
        Insert: {
          account_activated?: boolean | null
          avatar_url?: string | null
          awards?: string[] | null
          bio?: string | null
          birth_date?: string | null
          company?: string | null
          company_slogan?: string | null
          created_at?: string
          email?: string | null
          first_login_at?: string | null
          first_name?: string | null
          id?: string
          job_title?: string | null
          last_name?: string | null
          licenses?: string[] | null
          location?: string | null
          meta_description?: string | null
          meta_title?: string | null
          password_change_required?: boolean | null
          phone?: string | null
          professional_title?: string | null
          public_profile?: boolean | null
          qualifications?: string[] | null
          rating?: number | null
          review_count?: number | null
          services?: string[] | null
          skills?: string[] | null
          slug?: string | null
          social_links?: Json | null
          status?: string
          updated_at?: string
          user_id?: string | null
          verified?: boolean | null
          website?: string | null
          years_experience?: number | null
        }
        Update: {
          account_activated?: boolean | null
          avatar_url?: string | null
          awards?: string[] | null
          bio?: string | null
          birth_date?: string | null
          company?: string | null
          company_slogan?: string | null
          created_at?: string
          email?: string | null
          first_login_at?: string | null
          first_name?: string | null
          id?: string
          job_title?: string | null
          last_name?: string | null
          licenses?: string[] | null
          location?: string | null
          meta_description?: string | null
          meta_title?: string | null
          password_change_required?: boolean | null
          phone?: string | null
          professional_title?: string | null
          public_profile?: boolean | null
          qualifications?: string[] | null
          rating?: number | null
          review_count?: number | null
          services?: string[] | null
          skills?: string[] | null
          slug?: string | null
          social_links?: Json | null
          status?: string
          updated_at?: string
          user_id?: string | null
          verified?: boolean | null
          website?: string | null
          years_experience?: number | null
        }
        Relationships: []
      }
      project_access_settings: {
        Row: {
          access_level: Database["public"]["Enums"]["access_level"]
          allow_member_invites: boolean | null
          created_at: string
          id: string
          project_id: string
          require_approval_for_join: boolean | null
          updated_at: string
        }
        Insert: {
          access_level?: Database["public"]["Enums"]["access_level"]
          allow_member_invites?: boolean | null
          created_at?: string
          id?: string
          project_id: string
          require_approval_for_join?: boolean | null
          updated_at?: string
        }
        Update: {
          access_level?: Database["public"]["Enums"]["access_level"]
          allow_member_invites?: boolean | null
          created_at?: string
          id?: string
          project_id?: string
          require_approval_for_join?: boolean | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "project_access_settings_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: true
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      project_costs: {
        Row: {
          actual_amount: number | null
          allocated_amount: number | null
          budget_amount: number | null
          company_id: string | null
          cost_category: string
          created_at: string
          created_by: string | null
          currency: string | null
          deposit_paid: boolean | null
          deposit_percentage: number | null
          description: string | null
          gst_included: boolean | null
          id: string
          last_modified_by: string | null
          notes: string | null
          project_id: string | null
          updated_at: string
        }
        Insert: {
          actual_amount?: number | null
          allocated_amount?: number | null
          budget_amount?: number | null
          company_id?: string | null
          cost_category: string
          created_at?: string
          created_by?: string | null
          currency?: string | null
          deposit_paid?: boolean | null
          deposit_percentage?: number | null
          description?: string | null
          gst_included?: boolean | null
          id?: string
          last_modified_by?: string | null
          notes?: string | null
          project_id?: string | null
          updated_at?: string
        }
        Update: {
          actual_amount?: number | null
          allocated_amount?: number | null
          budget_amount?: number | null
          company_id?: string | null
          cost_category?: string
          created_at?: string
          created_by?: string | null
          currency?: string | null
          deposit_paid?: boolean | null
          deposit_percentage?: number | null
          description?: string | null
          gst_included?: boolean | null
          id?: string
          last_modified_by?: string | null
          notes?: string | null
          project_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "project_costs_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "project_costs_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      project_invitations: {
        Row: {
          accepted_at: string | null
          created_at: string
          declined_at: string | null
          email: string
          expires_at: string
          id: string
          invited_by: string
          message: string | null
          project_id: string
          role: string
          status: string
          token: string
          updated_at: string
        }
        Insert: {
          accepted_at?: string | null
          created_at?: string
          declined_at?: string | null
          email: string
          expires_at: string
          id?: string
          invited_by: string
          message?: string | null
          project_id: string
          role?: string
          status?: string
          token: string
          updated_at?: string
        }
        Update: {
          accepted_at?: string | null
          created_at?: string
          declined_at?: string | null
          email?: string
          expires_at?: string
          id?: string
          invited_by?: string
          message?: string | null
          project_id?: string
          role?: string
          status?: string
          token?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "project_invitations_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      project_members: {
        Row: {
          created_at: string
          email: string | null
          id: string
          invited_at: string | null
          invited_by: string | null
          joined_at: string | null
          permissions: Json | null
          project_id: string
          role: string
          status: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          email?: string | null
          id?: string
          invited_at?: string | null
          invited_by?: string | null
          joined_at?: string | null
          permissions?: Json | null
          project_id: string
          role?: string
          status?: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          email?: string | null
          id?: string
          invited_at?: string | null
          invited_by?: string | null
          joined_at?: string | null
          permissions?: Json | null
          project_id?: string
          role?: string
          status?: string
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "project_members_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      project_requests: {
        Row: {
          attachments: string[] | null
          budget_max: number | null
          budget_min: number | null
          client_id: string
          created_at: string
          currency: string | null
          deadline: string | null
          description: string
          id: string
          location_preference: string | null
          priority: string | null
          required_skills: string[] | null
          service_category_id: string | null
          status: string | null
          title: string
          updated_at: string
        }
        Insert: {
          attachments?: string[] | null
          budget_max?: number | null
          budget_min?: number | null
          client_id: string
          created_at?: string
          currency?: string | null
          deadline?: string | null
          description: string
          id?: string
          location_preference?: string | null
          priority?: string | null
          required_skills?: string[] | null
          service_category_id?: string | null
          status?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          attachments?: string[] | null
          budget_max?: number | null
          budget_min?: number | null
          client_id?: string
          created_at?: string
          currency?: string | null
          deadline?: string | null
          description?: string
          id?: string
          location_preference?: string | null
          priority?: string | null
          required_skills?: string[] | null
          service_category_id?: string | null
          status?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "project_requests_service_category_id_fkey"
            columns: ["service_category_id"]
            isOneToOne: false
            referencedRelation: "service_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      projects: {
        Row: {
          bim_model_url: string | null
          company_id: string
          contract_price: string | null
          created_at: string
          deadline: string | null
          description: string | null
          digital_twin_events: Json | null
          id: string
          iot_status: Json | null
          is_public: boolean | null
          location: string | null
          name: string
          priority: string | null
          project_id: string
          project_type: string | null
          start_date: string | null
          status: string | null
          updated_at: string
        }
        Insert: {
          bim_model_url?: string | null
          company_id: string
          contract_price?: string | null
          created_at?: string
          deadline?: string | null
          description?: string | null
          digital_twin_events?: Json | null
          id?: string
          iot_status?: Json | null
          is_public?: boolean | null
          location?: string | null
          name: string
          priority?: string | null
          project_id: string
          project_type?: string | null
          start_date?: string | null
          status?: string | null
          updated_at?: string
        }
        Update: {
          bim_model_url?: string | null
          company_id?: string
          contract_price?: string | null
          created_at?: string
          deadline?: string | null
          description?: string | null
          digital_twin_events?: Json | null
          id?: string
          iot_status?: Json | null
          is_public?: boolean | null
          location?: string | null
          name?: string
          priority?: string | null
          project_id?: string
          project_type?: string | null
          start_date?: string | null
          status?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "projects_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      proposals: {
        Row: {
          created_at: string
          currency: string | null
          delivery_date: string | null
          estimated_duration: number | null
          id: string
          project_request_id: string | null
          proposal_text: string
          proposed_price: number
          provider_id: string
          service_id: string | null
          status: string | null
          terms_and_conditions: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          currency?: string | null
          delivery_date?: string | null
          estimated_duration?: number | null
          id?: string
          project_request_id?: string | null
          proposal_text: string
          proposed_price: number
          provider_id: string
          service_id?: string | null
          status?: string | null
          terms_and_conditions?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          currency?: string | null
          delivery_date?: string | null
          estimated_duration?: number | null
          id?: string
          project_request_id?: string | null
          proposal_text?: string
          proposed_price?: number
          provider_id?: string
          service_id?: string | null
          status?: string | null
          terms_and_conditions?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "proposals_project_request_id_fkey"
            columns: ["project_request_id"]
            isOneToOne: false
            referencedRelation: "project_requests"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "proposals_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "services"
            referencedColumns: ["id"]
          },
        ]
      }
      quality_checks: {
        Row: {
          check_name: string
          check_type: string
          checked_at: string | null
          checked_by: string | null
          company_id: string | null
          compliance_standard: string | null
          created_at: string
          description: string | null
          due_date: string | null
          findings: string | null
          id: string
          priority: string | null
          project_id: string | null
          remediation_notes: string | null
          status: string | null
          task_id: string | null
          updated_at: string
        }
        Insert: {
          check_name: string
          check_type: string
          checked_at?: string | null
          checked_by?: string | null
          company_id?: string | null
          compliance_standard?: string | null
          created_at?: string
          description?: string | null
          due_date?: string | null
          findings?: string | null
          id?: string
          priority?: string | null
          project_id?: string | null
          remediation_notes?: string | null
          status?: string | null
          task_id?: string | null
          updated_at?: string
        }
        Update: {
          check_name?: string
          check_type?: string
          checked_at?: string | null
          checked_by?: string | null
          company_id?: string | null
          compliance_standard?: string | null
          created_at?: string
          description?: string | null
          due_date?: string | null
          findings?: string | null
          id?: string
          priority?: string | null
          project_id?: string | null
          remediation_notes?: string | null
          status?: string | null
          task_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "quality_checks_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "quality_checks_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "quality_checks_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "tasks"
            referencedColumns: ["id"]
          },
        ]
      }
      reviews: {
        Row: {
          created_at: string | null
          id: string
          is_verified_collaboration: boolean | null
          project_context: string | null
          rating: number
          review_text: string | null
          reviewee_id: string
          reviewee_type: string
          reviewer_id: string
          status: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_verified_collaboration?: boolean | null
          project_context?: string | null
          rating: number
          review_text?: string | null
          reviewee_id: string
          reviewee_type: string
          reviewer_id: string
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          is_verified_collaboration?: boolean | null
          project_context?: string | null
          rating?: number
          review_text?: string | null
          reviewee_id?: string
          reviewee_type?: string
          reviewer_id?: string
          status?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      service_categories: {
        Row: {
          created_at: string
          description: string | null
          icon: string | null
          id: string
          is_active: boolean | null
          name: string
          parent_id: string | null
          sort_order: number | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          icon?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          parent_id?: string | null
          sort_order?: number | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          icon?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          parent_id?: string | null
          sort_order?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "service_categories_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "service_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      services: {
        Row: {
          base_price: number | null
          category_id: string | null
          created_at: string
          currency: string | null
          deliverables: string | null
          description: string
          duration_estimate: number | null
          featured: boolean | null
          id: string
          is_active: boolean | null
          price_type: string | null
          provider_id: string
          requirements: string | null
          short_description: string | null
          skills_required: string[] | null
          title: string
          updated_at: string
        }
        Insert: {
          base_price?: number | null
          category_id?: string | null
          created_at?: string
          currency?: string | null
          deliverables?: string | null
          description: string
          duration_estimate?: number | null
          featured?: boolean | null
          id?: string
          is_active?: boolean | null
          price_type?: string | null
          provider_id: string
          requirements?: string | null
          short_description?: string | null
          skills_required?: string[] | null
          title: string
          updated_at?: string
        }
        Update: {
          base_price?: number | null
          category_id?: string | null
          created_at?: string
          currency?: string | null
          deliverables?: string | null
          description?: string
          duration_estimate?: number | null
          featured?: boolean | null
          id?: string
          is_active?: boolean | null
          price_type?: string | null
          provider_id?: string
          requirements?: string | null
          short_description?: string | null
          skills_required?: string[] | null
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "services_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "service_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      sk_25008_design: {
        Row: {
          client_feedback: string | null
          company_id: string | null
          compliance_notes: string | null
          created_at: string
          created_by: string | null
          description: string | null
          design_files: Json | null
          duration_days: number
          end_date: string | null
          id: string
          progress_percentage: number | null
          requirements: string | null
          start_date: string | null
          status: string
          task_name: string
          task_type: string
          updated_at: string
        }
        Insert: {
          client_feedback?: string | null
          company_id?: string | null
          compliance_notes?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          design_files?: Json | null
          duration_days: number
          end_date?: string | null
          id?: string
          progress_percentage?: number | null
          requirements?: string | null
          start_date?: string | null
          status?: string
          task_name: string
          task_type: string
          updated_at?: string
        }
        Update: {
          client_feedback?: string | null
          company_id?: string | null
          compliance_notes?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          design_files?: Json | null
          duration_days?: number
          end_date?: string | null
          id?: string
          progress_percentage?: number | null
          requirements?: string | null
          start_date?: string | null
          status?: string
          task_name?: string
          task_type?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "sk_25008_design_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      skai_action_log: {
        Row: {
          action_description: string
          action_type: string
          command_data: Json
          company_id: string
          created_at: string | null
          error_message: string | null
          execution_result: Json | null
          execution_time_ms: number | null
          id: string
          project_id: string | null
          success: boolean | null
          user_id: string
        }
        Insert: {
          action_description: string
          action_type: string
          command_data: Json
          company_id: string
          created_at?: string | null
          error_message?: string | null
          execution_result?: Json | null
          execution_time_ms?: number | null
          id?: string
          project_id?: string | null
          success?: boolean | null
          user_id: string
        }
        Update: {
          action_description?: string
          action_type?: string
          command_data?: Json
          company_id?: string
          created_at?: string | null
          error_message?: string | null
          execution_result?: Json | null
          execution_time_ms?: number | null
          id?: string
          project_id?: string | null
          success?: boolean | null
          user_id?: string
        }
        Relationships: []
      }
      skai_memory: {
        Row: {
          action_history: Json | null
          company_id: string
          conversation_context: Json | null
          created_at: string | null
          id: string
          learned_patterns: Json | null
          project_id: string | null
          updated_at: string | null
          user_id: string
          user_preferences: Json | null
        }
        Insert: {
          action_history?: Json | null
          company_id: string
          conversation_context?: Json | null
          created_at?: string | null
          id?: string
          learned_patterns?: Json | null
          project_id?: string | null
          updated_at?: string | null
          user_id: string
          user_preferences?: Json | null
        }
        Update: {
          action_history?: Json | null
          company_id?: string
          conversation_context?: Json | null
          created_at?: string | null
          id?: string
          learned_patterns?: Json | null
          project_id?: string | null
          updated_at?: string | null
          user_id?: string
          user_preferences?: Json | null
        }
        Relationships: []
      }
      subscription_plans: {
        Row: {
          created_at: string
          description: string | null
          features: string[] | null
          id: string
          is_active: boolean | null
          max_projects: number | null
          max_storage_gb: number | null
          max_team_members: number | null
          name: string
          price_monthly: number
          price_yearly: number
          sort_order: number | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          features?: string[] | null
          id?: string
          is_active?: boolean | null
          max_projects?: number | null
          max_storage_gb?: number | null
          max_team_members?: number | null
          name: string
          price_monthly?: number
          price_yearly?: number
          sort_order?: number | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          features?: string[] | null
          id?: string
          is_active?: boolean | null
          max_projects?: number | null
          max_storage_gb?: number | null
          max_team_members?: number | null
          name?: string
          price_monthly?: number
          price_yearly?: number
          sort_order?: number | null
          updated_at?: string
        }
        Relationships: []
      }
      subtasks: {
        Row: {
          assigned_to_avatar: string | null
          assigned_to_name: string | null
          completed: boolean
          created_at: string
          description: string | null
          due_date: string | null
          id: string
          parent_task_id: string
          title: string
          updated_at: string
        }
        Insert: {
          assigned_to_avatar?: string | null
          assigned_to_name?: string | null
          completed?: boolean
          created_at?: string
          description?: string | null
          due_date?: string | null
          id?: string
          parent_task_id: string
          title: string
          updated_at?: string
        }
        Update: {
          assigned_to_avatar?: string | null
          assigned_to_name?: string | null
          completed?: boolean
          created_at?: string
          description?: string | null
          due_date?: string | null
          id?: string
          parent_task_id?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      system_configurations: {
        Row: {
          config_key: string
          config_value: string
          created_at: string | null
          created_by: string | null
          description: string | null
          id: string
          is_active: boolean | null
          updated_at: string | null
        }
        Insert: {
          config_key: string
          config_value: string
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          updated_at?: string | null
        }
        Update: {
          config_key?: string
          config_value?: string
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          updated_at?: string | null
        }
        Relationships: []
      }
      task_activity_log: {
        Row: {
          action_description: string
          action_type: string
          created_at: string
          id: string
          task_id: string
          user_avatar: string | null
          user_name: string
        }
        Insert: {
          action_description: string
          action_type: string
          created_at?: string
          id?: string
          task_id: string
          user_avatar?: string | null
          user_name: string
        }
        Update: {
          action_description?: string
          action_type?: string
          created_at?: string
          id?: string
          task_id?: string
          user_avatar?: string | null
          user_name?: string
        }
        Relationships: []
      }
      task_attachments: {
        Row: {
          created_at: string
          file_name: string
          file_size: number | null
          file_type: string | null
          file_url: string
          id: string
          task_id: string
          updated_at: string
          uploaded_by_avatar: string | null
          uploaded_by_name: string | null
        }
        Insert: {
          created_at?: string
          file_name: string
          file_size?: number | null
          file_type?: string | null
          file_url: string
          id?: string
          task_id: string
          updated_at?: string
          uploaded_by_avatar?: string | null
          uploaded_by_name?: string | null
        }
        Update: {
          created_at?: string
          file_name?: string
          file_size?: number | null
          file_type?: string | null
          file_url?: string
          id?: string
          task_id?: string
          updated_at?: string
          uploaded_by_avatar?: string | null
          uploaded_by_name?: string | null
        }
        Relationships: []
      }
      task_comments: {
        Row: {
          comment: string
          created_at: string
          id: string
          task_id: string
          user_avatar: string | null
          user_name: string
        }
        Insert: {
          comment: string
          created_at?: string
          id?: string
          task_id: string
          user_avatar?: string | null
          user_name: string
        }
        Update: {
          comment?: string
          created_at?: string
          id?: string
          task_id?: string
          user_avatar?: string | null
          user_name?: string
        }
        Relationships: []
      }
      task_dependencies: {
        Row: {
          created_at: string
          dependency_type: string
          id: string
          lag_days: number | null
          predecessor_task_id: string
          successor_task_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          dependency_type?: string
          id?: string
          lag_days?: number | null
          predecessor_task_id: string
          successor_task_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          dependency_type?: string
          id?: string
          lag_days?: number | null
          predecessor_task_id?: string
          successor_task_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "task_dependencies_predecessor_task_id_fkey"
            columns: ["predecessor_task_id"]
            isOneToOne: false
            referencedRelation: "tasks"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "task_dependencies_successor_task_id_fkey"
            columns: ["successor_task_id"]
            isOneToOne: false
            referencedRelation: "tasks"
            referencedColumns: ["id"]
          },
        ]
      }
      tasks: {
        Row: {
          actual_duration: number | null
          assigned_to_avatar: string | null
          assigned_to_name: string | null
          category: string | null
          created_at: string
          description: string | null
          digital_object_id: string | null
          due_date: string | null
          estimated_duration: number | null
          id: string
          is_critical_path: boolean | null
          is_milestone: boolean | null
          priority: string
          progress: number
          project_id: string
          status: string
          task_name: string
          updated_at: string
        }
        Insert: {
          actual_duration?: number | null
          assigned_to_avatar?: string | null
          assigned_to_name?: string | null
          category?: string | null
          created_at?: string
          description?: string | null
          digital_object_id?: string | null
          due_date?: string | null
          estimated_duration?: number | null
          id?: string
          is_critical_path?: boolean | null
          is_milestone?: boolean | null
          priority?: string
          progress?: number
          project_id: string
          status?: string
          task_name: string
          updated_at?: string
        }
        Update: {
          actual_duration?: number | null
          assigned_to_avatar?: string | null
          assigned_to_name?: string | null
          category?: string | null
          created_at?: string
          description?: string | null
          digital_object_id?: string | null
          due_date?: string | null
          estimated_duration?: number | null
          id?: string
          is_critical_path?: boolean | null
          is_milestone?: boolean | null
          priority?: string
          progress?: number
          project_id?: string
          status?: string
          task_name?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "tasks_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      time_entries: {
        Row: {
          category: string
          company_id: string
          created_at: string
          duration: number | null
          end_time: string | null
          id: string
          is_active: boolean | null
          notes: string | null
          project_id: string | null
          project_name: string | null
          start_time: string
          task_activity: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          category?: string
          company_id: string
          created_at?: string
          duration?: number | null
          end_time?: string | null
          id?: string
          is_active?: boolean | null
          notes?: string | null
          project_id?: string | null
          project_name?: string | null
          start_time: string
          task_activity: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          category?: string
          company_id?: string
          created_at?: string
          duration?: number | null
          end_time?: string | null
          id?: string
          is_active?: boolean | null
          notes?: string | null
          project_id?: string | null
          project_name?: string | null
          start_time?: string
          task_activity?: string
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "time_entries_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "time_entries_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      time_tracking_settings: {
        Row: {
          category_colors: Json | null
          created_at: string
          default_work_end: string | null
          default_work_start: string | null
          id: string
          productive_categories: string[] | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          category_colors?: Json | null
          created_at?: string
          default_work_end?: string | null
          default_work_start?: string | null
          id?: string
          productive_categories?: string[] | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          category_colors?: Json | null
          created_at?: string
          default_work_end?: string | null
          default_work_start?: string | null
          id?: string
          productive_categories?: string[] | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      user_access_tokens: {
        Row: {
          created_at: string
          expires_at: string
          id: string
          token: string
          token_type: string
          updated_at: string
          used_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          expires_at: string
          id?: string
          token: string
          token_type: string
          updated_at?: string
          used_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          expires_at?: string
          id?: string
          token?: string
          token_type?: string
          updated_at?: string
          used_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_access_tokens_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      user_contexts: {
        Row: {
          context_id: string | null
          context_type: string
          created_at: string | null
          id: string
          is_active: boolean | null
          user_id: string
        }
        Insert: {
          context_id?: string | null
          context_type: string
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          user_id: string
        }
        Update: {
          context_id?: string | null
          context_type?: string
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          user_id?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_sort_preferences: {
        Row: {
          created_at: string
          id: string
          sort_direction: string
          sort_field: string
          table_name: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          sort_direction: string
          sort_field: string
          table_name: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          sort_direction?: string
          sort_field?: string
          table_name?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_subscriptions: {
        Row: {
          billing_cycle: string
          created_at: string
          current_period_end: string | null
          current_period_start: string | null
          id: string
          plan_id: string
          status: string
          stripe_customer_id: string | null
          stripe_subscription_id: string | null
          trial_ends_at: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          billing_cycle?: string
          created_at?: string
          current_period_end?: string | null
          current_period_start?: string | null
          id?: string
          plan_id: string
          status?: string
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          trial_ends_at?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          billing_cycle?: string
          created_at?: string
          current_period_end?: string | null
          current_period_start?: string | null
          id?: string
          plan_id?: string
          status?: string
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          trial_ends_at?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_subscriptions_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "subscription_plans"
            referencedColumns: ["id"]
          },
        ]
      }
      wbs_items: {
        Row: {
          actual_cost: number | null
          assigned_to: string | null
          budgeted_cost: number | null
          company_id: string
          created_at: string
          description: string | null
          duration: number | null
          end_date: string | null
          id: string
          is_expanded: boolean | null
          level: number | null
          linked_tasks: Json | null
          parent_id: string | null
          progress: number | null
          project_id: string
          start_date: string | null
          title: string
          updated_at: string
          wbs_id: string
        }
        Insert: {
          actual_cost?: number | null
          assigned_to?: string | null
          budgeted_cost?: number | null
          company_id: string
          created_at?: string
          description?: string | null
          duration?: number | null
          end_date?: string | null
          id?: string
          is_expanded?: boolean | null
          level?: number | null
          linked_tasks?: Json | null
          parent_id?: string | null
          progress?: number | null
          project_id: string
          start_date?: string | null
          title: string
          updated_at?: string
          wbs_id: string
        }
        Update: {
          actual_cost?: number | null
          assigned_to?: string | null
          budgeted_cost?: number | null
          company_id?: string
          created_at?: string
          description?: string | null
          duration?: number | null
          end_date?: string | null
          id?: string
          is_expanded?: boolean | null
          level?: number | null
          linked_tasks?: Json | null
          parent_id?: string | null
          progress?: number | null
          project_id?: string
          start_date?: string | null
          title?: string
          updated_at?: string
          wbs_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "wbs_items_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "wbs_items_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "wbs_items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "wbs_items_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      xero_accounts: {
        Row: {
          class: string | null
          code: string | null
          created_at: string
          enable_payments_to_account: boolean | null
          id: string
          name: string
          show_in_expense_claims: boolean | null
          sync_timestamp: string
          tax_type: string | null
          type: string | null
          updated_at: string
          user_id: string
          xero_account_id: string
        }
        Insert: {
          class?: string | null
          code?: string | null
          created_at?: string
          enable_payments_to_account?: boolean | null
          id?: string
          name: string
          show_in_expense_claims?: boolean | null
          sync_timestamp: string
          tax_type?: string | null
          type?: string | null
          updated_at?: string
          user_id: string
          xero_account_id: string
        }
        Update: {
          class?: string | null
          code?: string | null
          created_at?: string
          enable_payments_to_account?: boolean | null
          id?: string
          name?: string
          show_in_expense_claims?: boolean | null
          sync_timestamp?: string
          tax_type?: string | null
          type?: string | null
          updated_at?: string
          user_id?: string
          xero_account_id?: string
        }
        Relationships: []
      }
      xero_connections: {
        Row: {
          access_token: string
          connected_at: string
          created_at: string
          expires_at: string
          id: string
          last_sync: string | null
          refresh_token: string
          tenant_id: string
          tenant_name: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          access_token: string
          connected_at?: string
          created_at?: string
          expires_at: string
          id?: string
          last_sync?: string | null
          refresh_token: string
          tenant_id: string
          tenant_name?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          access_token?: string
          connected_at?: string
          created_at?: string
          expires_at?: string
          id?: string
          last_sync?: string | null
          refresh_token?: string
          tenant_id?: string
          tenant_name?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      xero_contacts: {
        Row: {
          contact_status: string | null
          created_at: string
          email: string | null
          id: string
          is_customer: boolean | null
          is_supplier: boolean | null
          name: string
          phone: string | null
          sync_timestamp: string
          updated_at: string
          user_id: string
          xero_contact_id: string
        }
        Insert: {
          contact_status?: string | null
          created_at?: string
          email?: string | null
          id?: string
          is_customer?: boolean | null
          is_supplier?: boolean | null
          name: string
          phone?: string | null
          sync_timestamp: string
          updated_at?: string
          user_id: string
          xero_contact_id: string
        }
        Update: {
          contact_status?: string | null
          created_at?: string
          email?: string | null
          id?: string
          is_customer?: boolean | null
          is_supplier?: boolean | null
          name?: string
          phone?: string | null
          sync_timestamp?: string
          updated_at?: string
          user_id?: string
          xero_contact_id?: string
        }
        Relationships: []
      }
      xero_invoices: {
        Row: {
          amount_due: number | null
          contact_name: string | null
          created_at: string
          currency_code: string | null
          date: string | null
          due_date: string | null
          id: string
          invoice_number: string | null
          reference: string | null
          status: string | null
          sync_timestamp: string
          total: number | null
          type: string | null
          updated_at: string
          user_id: string
          xero_invoice_id: string
        }
        Insert: {
          amount_due?: number | null
          contact_name?: string | null
          created_at?: string
          currency_code?: string | null
          date?: string | null
          due_date?: string | null
          id?: string
          invoice_number?: string | null
          reference?: string | null
          status?: string | null
          sync_timestamp: string
          total?: number | null
          type?: string | null
          updated_at?: string
          user_id: string
          xero_invoice_id: string
        }
        Update: {
          amount_due?: number | null
          contact_name?: string | null
          created_at?: string
          currency_code?: string | null
          date?: string | null
          due_date?: string | null
          id?: string
          invoice_number?: string | null
          reference?: string | null
          status?: string | null
          sync_timestamp?: string
          total?: number | null
          type?: string | null
          updated_at?: string
          user_id?: string
          xero_invoice_id?: string
        }
        Relationships: []
      }
      xero_oauth_states: {
        Row: {
          created_at: string
          expires_at: string
          id: string
          state: string
          user_id: string
        }
        Insert: {
          created_at?: string
          expires_at: string
          id?: string
          state: string
          user_id: string
        }
        Update: {
          created_at?: string
          expires_at?: string
          id?: string
          state?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      accept_project_invitation: {
        Args: { invitation_token: string }
        Returns: Json
      }
      can_manage_company: {
        Args: { company_id: string; user_id: string }
        Returns: boolean
      }
      delete_company_completely: {
        Args: { target_company_id: string }
        Returns: Json
      }
      delete_user_completely: {
        Args: { target_user_id: string }
        Returns: Json
      }
      generate_access_token: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      generate_contract_number: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      generate_invitation_token: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      generate_slug: {
        Args: { input_text: string }
        Returns: string
      }
      get_current_context: {
        Args: Record<PropertyKey, never>
        Returns: {
          context_type: string
          context_id: string
          context_name: string
        }[]
      }
      get_manageable_users_for_user: {
        Args: { requesting_user_id: string }
        Returns: {
          user_id: string
          email: string
          first_name: string
          last_name: string
          avatar_url: string
          phone: string
          company: string
          app_role: Database["public"]["Enums"]["app_role"]
          app_roles: Database["public"]["Enums"]["app_role"][]
          company_role: string
          status: string
          created_at: string
          can_manage_roles: boolean
          can_assign_to_companies: boolean
        }[]
      }
      get_user_companies: {
        Args: { target_user_id?: string }
        Returns: {
          id: string
          name: string
          slug: string
          logo_url: string
          role: string
          status: string
        }[]
      }
      get_user_current_company_id: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      get_user_highest_role_level: {
        Args: { target_user_id: string }
        Returns: number
      }
      get_user_role: {
        Args: { target_user_id: string }
        Returns: Database["public"]["Enums"]["app_role"]
      }
      get_user_roles: {
        Args: { target_user_id: string }
        Returns: Database["public"]["Enums"]["app_role"][]
      }
      get_user_subscription: {
        Args: Record<PropertyKey, never> | { target_user_id?: string }
        Returns: {
          subscription_id: string
          plan_name: string
          plan_description: string
          status: string
          billing_cycle: string
          trial_ends_at: string
          current_period_end: string
          price_monthly: number
          price_yearly: number
          features: string[]
          max_projects: number
          max_team_members: number
          max_storage_gb: number
        }[]
      }
      has_role: {
        Args: {
          _user_id: string
          _role: Database["public"]["Enums"]["app_role"]
        }
        Returns: boolean
      }
      initialize_company_modules: {
        Args: { target_company_id: string }
        Returns: undefined
      }
      is_company_admin_or_owner: {
        Args: { target_company_id: string; target_user_id: string }
        Returns: boolean
      }
      is_company_member: {
        Args: { target_company_id: string; target_user_id: string }
        Returns: boolean
      }
      is_company_member_secure: {
        Args: { company_id: string; user_id: string }
        Returns: boolean
      }
      is_company_owner: {
        Args: { target_company_id: string; target_user_id: string }
        Returns: boolean
      }
      is_platform_admin: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      set_active_context: {
        Args: { p_context_type: string; p_context_id?: string }
        Returns: boolean
      }
      track_first_login: {
        Args: { target_user_id: string }
        Returns: undefined
      }
      use_access_token: {
        Args: { token_value: string }
        Returns: Json
      }
    }
    Enums: {
      access_level: "private_to_members" | "public" | "restricted"
      app_role:
        | "superadmin"
        | "platform_admin"
        | "company_admin"
        | "service_provider"
      business_type: "sole_trader" | "partnership" | "company" | "trust"
      member_role: "project_admin" | "editor" | "viewer" | "guest"
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
      access_level: ["private_to_members", "public", "restricted"],
      app_role: [
        "superadmin",
        "platform_admin",
        "company_admin",
        "service_provider",
      ],
      business_type: ["sole_trader", "partnership", "company", "trust"],
      member_role: ["project_admin", "editor", "viewer", "guest"],
    },
  },
} as const
