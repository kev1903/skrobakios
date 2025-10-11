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
      ai_suggestions: {
        Row: {
          action_items: Json | null
          actioned: boolean | null
          category: string
          company_id: string
          created_at: string | null
          description: string
          dismissed: boolean | null
          expires_at: string | null
          id: string
          metadata: Json | null
          priority: string
          project_id: string | null
          suggestion_type: string
          title: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          action_items?: Json | null
          actioned?: boolean | null
          category: string
          company_id: string
          created_at?: string | null
          description: string
          dismissed?: boolean | null
          expires_at?: string | null
          id?: string
          metadata?: Json | null
          priority?: string
          project_id?: string | null
          suggestion_type: string
          title: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          action_items?: Json | null
          actioned?: boolean | null
          category?: string
          company_id?: string
          created_at?: string | null
          description?: string
          dismissed?: boolean | null
          expires_at?: string | null
          id?: string
          metadata?: Json | null
          priority?: string
          project_id?: string | null
          suggestion_type?: string
          title?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ai_suggestions_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      audit_logs: {
        Row: {
          action: string
          created_at: string | null
          id: string
          metadata: Json | null
          resource_id: string | null
          resource_type: string
          user_id: string | null
        }
        Insert: {
          action: string
          created_at?: string | null
          id?: string
          metadata?: Json | null
          resource_id?: string | null
          resource_type: string
          user_id?: string | null
        }
        Update: {
          action?: string
          created_at?: string | null
          id?: string
          metadata?: Json | null
          resource_id?: string | null
          resource_type?: string
          user_id?: string | null
        }
        Relationships: []
      }
      bill_approvals: {
        Row: {
          approver: string
          bill_id: string
          comment: string | null
          decided_at: string
          decision: Database["public"]["Enums"]["approval_decision"]
          id: string
        }
        Insert: {
          approver: string
          bill_id: string
          comment?: string | null
          decided_at?: string
          decision: Database["public"]["Enums"]["approval_decision"]
          id?: string
        }
        Update: {
          approver?: string
          bill_id?: string
          comment?: string | null
          decided_at?: string
          decision?: Database["public"]["Enums"]["approval_decision"]
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "bill_approvals_bill_id_fkey"
            columns: ["bill_id"]
            isOneToOne: false
            referencedRelation: "bills"
            referencedColumns: ["id"]
          },
        ]
      }
      bill_items: {
        Row: {
          amount: number
          bill_id: string
          created_at: string
          description: string
          id: string
          qty: number
          rate: number
          wbs_code: string | null
        }
        Insert: {
          amount?: number
          bill_id: string
          created_at?: string
          description: string
          id?: string
          qty?: number
          rate?: number
          wbs_code?: string | null
        }
        Update: {
          amount?: number
          bill_id?: string
          created_at?: string
          description?: string
          id?: string
          qty?: number
          rate?: number
          wbs_code?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "bill_items_bill_id_fkey"
            columns: ["bill_id"]
            isOneToOne: false
            referencedRelation: "bills"
            referencedColumns: ["id"]
          },
        ]
      }
      bill_payments: {
        Row: {
          amount: number
          bill_id: string
          created_at: string
          created_by: string | null
          id: string
          method: Database["public"]["Enums"]["payment_method"]
          notes: string | null
          paid_on: string
          receipt_file_id: string | null
        }
        Insert: {
          amount: number
          bill_id: string
          created_at?: string
          created_by?: string | null
          id?: string
          method?: Database["public"]["Enums"]["payment_method"]
          notes?: string | null
          paid_on: string
          receipt_file_id?: string | null
        }
        Update: {
          amount?: number
          bill_id?: string
          created_at?: string
          created_by?: string | null
          id?: string
          method?: Database["public"]["Enums"]["payment_method"]
          notes?: string | null
          paid_on?: string
          receipt_file_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "bill_payments_bill_id_fkey"
            columns: ["bill_id"]
            isOneToOne: false
            referencedRelation: "bills"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bill_payments_receipt_file_id_fkey"
            columns: ["receipt_file_id"]
            isOneToOne: false
            referencedRelation: "files"
            referencedColumns: ["id"]
          },
        ]
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
      bills: {
        Row: {
          bill_date: string
          bill_no: string
          created_at: string
          created_by: string | null
          due_date: string
          file_attachments: Json | null
          forwarded_bill: boolean | null
          id: string
          paid_to_date: number
          project_id: string
          reference_number: string | null
          source_system: string | null
          status: Database["public"]["Enums"]["bill_status"]
          subtotal: number
          supplier_email: string | null
          supplier_name: string
          tax: number
          total: number
          updated_at: string
        }
        Insert: {
          bill_date: string
          bill_no: string
          created_at?: string
          created_by?: string | null
          due_date: string
          file_attachments?: Json | null
          forwarded_bill?: boolean | null
          id?: string
          paid_to_date?: number
          project_id: string
          reference_number?: string | null
          source_system?: string | null
          status?: Database["public"]["Enums"]["bill_status"]
          subtotal?: number
          supplier_email?: string | null
          supplier_name: string
          tax?: number
          total?: number
          updated_at?: string
        }
        Update: {
          bill_date?: string
          bill_no?: string
          created_at?: string
          created_by?: string | null
          due_date?: string
          file_attachments?: Json | null
          forwarded_bill?: boolean | null
          id?: string
          paid_to_date?: number
          project_id?: string
          reference_number?: string | null
          source_system?: string | null
          status?: Database["public"]["Enums"]["bill_status"]
          subtotal?: number
          supplier_email?: string | null
          supplier_name?: string
          tax?: number
          total?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "bills_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      calendar_integrations: {
        Row: {
          access_token: string
          access_token_encrypted: string | null
          calendar_id: string | null
          calendar_name: string | null
          created_at: string | null
          encryption_algorithm: string | null
          encryption_key_id: string | null
          id: string
          key_version: number | null
          last_sync_at: string | null
          provider: string
          provider_user_id: string
          refresh_token: string | null
          refresh_token_encrypted: string | null
          sync_enabled: boolean | null
          sync_frequency_minutes: number | null
          token_expires_at: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          access_token: string
          access_token_encrypted?: string | null
          calendar_id?: string | null
          calendar_name?: string | null
          created_at?: string | null
          encryption_algorithm?: string | null
          encryption_key_id?: string | null
          id?: string
          key_version?: number | null
          last_sync_at?: string | null
          provider: string
          provider_user_id: string
          refresh_token?: string | null
          refresh_token_encrypted?: string | null
          sync_enabled?: boolean | null
          sync_frequency_minutes?: number | null
          token_expires_at?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          access_token?: string
          access_token_encrypted?: string | null
          calendar_id?: string | null
          calendar_name?: string | null
          created_at?: string | null
          encryption_algorithm?: string | null
          encryption_key_id?: string | null
          id?: string
          key_version?: number | null
          last_sync_at?: string | null
          provider?: string
          provider_user_id?: string
          refresh_token?: string | null
          refresh_token_encrypted?: string | null
          sync_enabled?: boolean | null
          sync_frequency_minutes?: number | null
          token_expires_at?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      commitments: {
        Row: {
          attachments: Json | null
          commitment_number: string
          commitment_status: string
          created_at: string
          end_date: string | null
          gst: number | null
          id: string
          project_id: string
          quote_id: string
          retention_percent: number | null
          rfq_id: string
          start_date: string | null
          terms: string | null
          type: string
          updated_at: string
          value_ex_gst: number | null
          value_inc_gst: number | null
          vendor_id: string
        }
        Insert: {
          attachments?: Json | null
          commitment_number: string
          commitment_status?: string
          created_at?: string
          end_date?: string | null
          gst?: number | null
          id?: string
          project_id: string
          quote_id: string
          retention_percent?: number | null
          rfq_id: string
          start_date?: string | null
          terms?: string | null
          type?: string
          updated_at?: string
          value_ex_gst?: number | null
          value_inc_gst?: number | null
          vendor_id: string
        }
        Update: {
          attachments?: Json | null
          commitment_number?: string
          commitment_status?: string
          created_at?: string
          end_date?: string | null
          gst?: number | null
          id?: string
          project_id?: string
          quote_id?: string
          retention_percent?: number | null
          rfq_id?: string
          start_date?: string | null
          terms?: string | null
          type?: string
          updated_at?: string
          value_ex_gst?: number | null
          value_inc_gst?: number | null
          vendor_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "commitments_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "commitments_quote_id_fkey"
            columns: ["quote_id"]
            isOneToOne: false
            referencedRelation: "quotes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "commitments_rfq_id_fkey"
            columns: ["rfq_id"]
            isOneToOne: false
            referencedRelation: "rfqs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "commitments_vendor_id_fkey"
            columns: ["vendor_id"]
            isOneToOne: false
            referencedRelation: "vendors"
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
          public_profile_enabled: boolean | null
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
          public_profile_enabled?: boolean | null
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
          public_profile_enabled?: boolean | null
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
      company_overrides: {
        Row: {
          company_id: string
          created_at: string
          created_by: string | null
          expires_at: string | null
          id: string
          is_active: boolean
          last_modified_by: string | null
          override_key: string
          override_type: string
          override_value: Json
          reason: string | null
          updated_at: string
        }
        Insert: {
          company_id: string
          created_at?: string
          created_by?: string | null
          expires_at?: string | null
          id?: string
          is_active?: boolean
          last_modified_by?: string | null
          override_key: string
          override_type: string
          override_value?: Json
          reason?: string | null
          updated_at?: string
        }
        Update: {
          company_id?: string
          created_at?: string
          created_by?: string | null
          expires_at?: string | null
          id?: string
          is_active?: boolean
          last_modified_by?: string | null
          override_key?: string
          override_type?: string
          override_value?: Json
          reason?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "company_overrides_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      company_permission_settings: {
        Row: {
          company_id: string | null
          configured_by: string | null
          created_at: string
          id: string
          is_enabled: boolean
          permission_key: string
          updated_at: string
        }
        Insert: {
          company_id?: string | null
          configured_by?: string | null
          created_at?: string
          id?: string
          is_enabled?: boolean
          permission_key: string
          updated_at?: string
        }
        Update: {
          company_id?: string | null
          configured_by?: string | null
          created_at?: string
          id?: string
          is_enabled?: boolean
          permission_key?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "company_permission_settings_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      compliance_docs: {
        Row: {
          commitment_id: string | null
          created_at: string
          doc_type: string
          expiry_date: string | null
          file_url: string | null
          id: string
          issue_date: string | null
          reference_no: string | null
          status: string
          updated_at: string
          vendor_id: string
        }
        Insert: {
          commitment_id?: string | null
          created_at?: string
          doc_type: string
          expiry_date?: string | null
          file_url?: string | null
          id?: string
          issue_date?: string | null
          reference_no?: string | null
          status?: string
          updated_at?: string
          vendor_id: string
        }
        Update: {
          commitment_id?: string | null
          created_at?: string
          doc_type?: string
          expiry_date?: string | null
          file_url?: string | null
          id?: string
          issue_date?: string | null
          reference_no?: string | null
          status?: string
          updated_at?: string
          vendor_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "compliance_docs_commitment_id_fkey"
            columns: ["commitment_id"]
            isOneToOne: false
            referencedRelation: "commitments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "compliance_docs_vendor_id_fkey"
            columns: ["vendor_id"]
            isOneToOne: false
            referencedRelation: "vendors"
            referencedColumns: ["id"]
          },
        ]
      }
      contract_actions: {
        Row: {
          action_description: string
          assigned_to: string | null
          completed: boolean | null
          contract_id: string
          created_at: string
          due_date: string | null
          id: string
        }
        Insert: {
          action_description: string
          assigned_to?: string | null
          completed?: boolean | null
          contract_id: string
          created_at?: string
          due_date?: string | null
          id?: string
        }
        Update: {
          action_description?: string
          assigned_to?: string | null
          completed?: boolean | null
          contract_id?: string
          created_at?: string
          due_date?: string | null
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "contract_actions_contract_id_fkey"
            columns: ["contract_id"]
            isOneToOne: false
            referencedRelation: "project_contracts"
            referencedColumns: ["id"]
          },
        ]
      }
      contract_milestones: {
        Row: {
          amount: number | null
          contract_id: string
          created_at: string
          description: string | null
          due_date: string | null
          id: string
          name: string
          status: string | null
        }
        Insert: {
          amount?: number | null
          contract_id: string
          created_at?: string
          description?: string | null
          due_date?: string | null
          id?: string
          name: string
          status?: string | null
        }
        Update: {
          amount?: number | null
          contract_id?: string
          created_at?: string
          description?: string | null
          due_date?: string | null
          id?: string
          name?: string
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "contract_milestones_contract_id_fkey"
            columns: ["contract_id"]
            isOneToOne: false
            referencedRelation: "project_contracts"
            referencedColumns: ["id"]
          },
        ]
      }
      contract_risks: {
        Row: {
          contract_id: string
          created_at: string
          id: string
          mitigation_strategy: string | null
          risk_description: string
          risk_level: string
        }
        Insert: {
          contract_id: string
          created_at?: string
          id?: string
          mitigation_strategy?: string | null
          risk_description: string
          risk_level?: string
        }
        Update: {
          contract_id?: string
          created_at?: string
          id?: string
          mitigation_strategy?: string | null
          risk_description?: string
          risk_level?: string
        }
        Relationships: [
          {
            foreignKeyName: "contract_risks_contract_id_fkey"
            columns: ["contract_id"]
            isOneToOne: false
            referencedRelation: "project_contracts"
            referencedColumns: ["id"]
          },
        ]
      }
      contract_versions: {
        Row: {
          ai_confidence: number | null
          ai_summary_json: Json | null
          contract_id: string
          created_at: string
          file_name: string | null
          file_size: number | null
          id: string
          is_canonical: boolean | null
          status: string
          storage_path: string
          updated_at: string
        }
        Insert: {
          ai_confidence?: number | null
          ai_summary_json?: Json | null
          contract_id: string
          created_at?: string
          file_name?: string | null
          file_size?: number | null
          id?: string
          is_canonical?: boolean | null
          status?: string
          storage_path: string
          updated_at?: string
        }
        Update: {
          ai_confidence?: number | null
          ai_summary_json?: Json | null
          contract_id?: string
          created_at?: string
          file_name?: string | null
          file_size?: number | null
          id?: string
          is_canonical?: boolean | null
          status?: string
          storage_path?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "contract_versions_contract_id_fkey"
            columns: ["contract_id"]
            isOneToOne: false
            referencedRelation: "contracts"
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
      daily_data: {
        Row: {
          created_at: string
          date: string
          id: string
          notes: string | null
          priorities: string[] | null
          priority_checked: boolean[] | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          date: string
          id?: string
          notes?: string | null
          priorities?: string[] | null
          priority_checked?: boolean[] | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          date?: string
          id?: string
          notes?: string | null
          priorities?: string[] | null
          priority_checked?: boolean[] | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      daily_priorities_notes: {
        Row: {
          created_at: string
          date: string
          id: string
          notes: string | null
          priorities: string[] | null
          priority_checked: boolean[] | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          date: string
          id?: string
          notes?: string | null
          priorities?: string[] | null
          priority_checked?: boolean[] | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          date?: string
          id?: string
          notes?: string | null
          priorities?: string[] | null
          priority_checked?: boolean[] | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      defect_reports: {
        Row: {
          company_id: string
          created_at: string
          created_by: string | null
          description: string | null
          id: string
          project_id: string
          status: string
          title: string
          updated_at: string
        }
        Insert: {
          company_id: string
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          project_id: string
          status?: string
          title: string
          updated_at?: string
        }
        Update: {
          company_id?: string
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          project_id?: string
          status?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      defects: {
        Row: {
          assigned_to: string | null
          attachments: Json | null
          category: string | null
          comments: Json | null
          company_id: string
          created_at: string
          created_by: string | null
          defect_number: string
          description: string | null
          due_date: string | null
          fixed_date: string | null
          id: string
          location: string | null
          priority: string
          project_id: string
          report_id: string | null
          severity: string | null
          status: string
          title: string
          updated_at: string
          verified_date: string | null
        }
        Insert: {
          assigned_to?: string | null
          attachments?: Json | null
          category?: string | null
          comments?: Json | null
          company_id: string
          created_at?: string
          created_by?: string | null
          defect_number: string
          description?: string | null
          due_date?: string | null
          fixed_date?: string | null
          id?: string
          location?: string | null
          priority?: string
          project_id: string
          report_id?: string | null
          severity?: string | null
          status?: string
          title: string
          updated_at?: string
          verified_date?: string | null
        }
        Update: {
          assigned_to?: string | null
          attachments?: Json | null
          category?: string | null
          comments?: Json | null
          company_id?: string
          created_at?: string
          created_by?: string | null
          defect_number?: string
          description?: string | null
          due_date?: string | null
          fixed_date?: string | null
          id?: string
          location?: string | null
          priority?: string
          project_id?: string
          report_id?: string | null
          severity?: string | null
          status?: string
          title?: string
          updated_at?: string
          verified_date?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "defects_report_id_fkey"
            columns: ["report_id"]
            isOneToOne: false
            referencedRelation: "defect_reports"
            referencedColumns: ["id"]
          },
        ]
      }
      document_categories: {
        Row: {
          created_at: string
          description: string | null
          document_type: string
          id: string
          is_active: boolean
          name: string
          section_name: string
          section_number: number
          sort_order: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          document_type: string
          id?: string
          is_active?: boolean
          name: string
          section_name: string
          section_number: number
          sort_order?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          document_type?: string
          id?: string
          is_active?: boolean
          name?: string
          section_name?: string
          section_number?: number
          sort_order?: number
          updated_at?: string
        }
        Relationships: []
      }
      estimate_drawings: {
        Row: {
          created_by: string | null
          drawing_type: string | null
          estimate_id: string
          file_path: string
          id: string
          name: string
          pages: number | null
          uploaded_at: string
        }
        Insert: {
          created_by?: string | null
          drawing_type?: string | null
          estimate_id: string
          file_path: string
          id?: string
          name: string
          pages?: number | null
          uploaded_at?: string
        }
        Update: {
          created_by?: string | null
          drawing_type?: string | null
          estimate_id?: string
          file_path?: string
          id?: string
          name?: string
          pages?: number | null
          uploaded_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "estimate_drawings_estimate_id_fkey"
            columns: ["estimate_id"]
            isOneToOne: false
            referencedRelation: "estimates"
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
      events: {
        Row: {
          created_at: string
          created_by: string | null
          id: string
          name: string
          payload: Json | null
          project_id: string
          ref_id: string | null
          ref_table: string | null
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          id?: string
          name: string
          payload?: Json | null
          project_id: string
          ref_id?: string | null
          ref_table?: string | null
        }
        Update: {
          created_at?: string
          created_by?: string | null
          id?: string
          name?: string
          payload?: Json | null
          project_id?: string
          ref_id?: string | null
          ref_table?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "events_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      external_calendar_events: {
        Row: {
          attendees: Json | null
          created_at: string | null
          description: string | null
          end_time: string
          external_event_id: string
          id: string
          integration_id: string
          is_all_day: boolean | null
          location: string | null
          start_time: string
          status: string | null
          title: string
          updated_at: string | null
        }
        Insert: {
          attendees?: Json | null
          created_at?: string | null
          description?: string | null
          end_time: string
          external_event_id: string
          id?: string
          integration_id: string
          is_all_day?: boolean | null
          location?: string | null
          start_time: string
          status?: string | null
          title: string
          updated_at?: string | null
        }
        Update: {
          attendees?: Json | null
          created_at?: string | null
          description?: string | null
          end_time?: string
          external_event_id?: string
          id?: string
          integration_id?: string
          is_all_day?: boolean | null
          location?: string | null
          start_time?: string
          status?: string | null
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "external_calendar_events_integration_id_fkey"
            columns: ["integration_id"]
            isOneToOne: false
            referencedRelation: "calendar_integrations"
            referencedColumns: ["id"]
          },
        ]
      }
      feature_flags: {
        Row: {
          conditions: Json | null
          created_at: string
          created_by: string | null
          description: string | null
          flag_key: string
          flag_name: string
          id: string
          is_enabled: boolean
          last_modified_by: string | null
          rollout_percentage: number | null
          target_companies: Json | null
          target_users: Json | null
          updated_at: string
        }
        Insert: {
          conditions?: Json | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          flag_key: string
          flag_name: string
          id?: string
          is_enabled?: boolean
          last_modified_by?: string | null
          rollout_percentage?: number | null
          target_companies?: Json | null
          target_users?: Json | null
          updated_at?: string
        }
        Update: {
          conditions?: Json | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          flag_key?: string
          flag_name?: string
          id?: string
          is_enabled?: boolean
          last_modified_by?: string | null
          rollout_percentage?: number | null
          target_companies?: Json | null
          target_users?: Json | null
          updated_at?: string
        }
        Relationships: []
      }
      files: {
        Row: {
          content_type: string | null
          created_at: string
          created_by: string | null
          file_size: number | null
          id: string
          kind: Database["public"]["Enums"]["file_kind"]
          meta: Json | null
          path: string
          project_id: string
        }
        Insert: {
          content_type?: string | null
          created_at?: string
          created_by?: string | null
          file_size?: number | null
          id?: string
          kind?: Database["public"]["Enums"]["file_kind"]
          meta?: Json | null
          path: string
          project_id: string
        }
        Update: {
          content_type?: string | null
          created_at?: string
          created_by?: string | null
          file_size?: number | null
          id?: string
          kind?: Database["public"]["Enums"]["file_kind"]
          meta?: Json | null
          path?: string
          project_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "files_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      finance_snapshots: {
        Row: {
          as_of: string
          bills_paid: number | null
          bills_total: number | null
          budget: number | null
          committed: number | null
          created_at: string
          id: string
          inv_paid: number | null
          inv_total: number | null
          project_id: string
        }
        Insert: {
          as_of?: string
          bills_paid?: number | null
          bills_total?: number | null
          budget?: number | null
          committed?: number | null
          created_at?: string
          id?: string
          inv_paid?: number | null
          inv_total?: number | null
          project_id: string
        }
        Update: {
          as_of?: string
          bills_paid?: number | null
          bills_total?: number | null
          budget?: number | null
          committed?: number | null
          created_at?: string
          id?: string
          inv_paid?: number | null
          inv_total?: number | null
          project_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "finance_snapshots_project_id_fkey"
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
          id?: string
          invoice_id?: string
          notes?: string | null
          project_id?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      invoice_items: {
        Row: {
          amount: number
          created_at: string
          description: string
          id: string
          invoice_id: string
          qty: number
          rate: number
          wbs_code: string | null
        }
        Insert: {
          amount?: number
          created_at?: string
          description: string
          id?: string
          invoice_id: string
          qty?: number
          rate?: number
          wbs_code?: string | null
        }
        Update: {
          amount?: number
          created_at?: string
          description?: string
          id?: string
          invoice_id?: string
          qty?: number
          rate?: number
          wbs_code?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "invoice_items_invoice_id_fkey"
            columns: ["invoice_id"]
            isOneToOne: false
            referencedRelation: "invoices"
            referencedColumns: ["id"]
          },
        ]
      }
      invoice_payments: {
        Row: {
          amount: number
          created_at: string
          created_by: string | null
          id: string
          invoice_id: string
          method: Database["public"]["Enums"]["payment_method"]
          notes: string | null
          paid_on: string
          receipt_file_id: string | null
        }
        Insert: {
          amount: number
          created_at?: string
          created_by?: string | null
          id?: string
          invoice_id: string
          method?: Database["public"]["Enums"]["payment_method"]
          notes?: string | null
          paid_on: string
          receipt_file_id?: string | null
        }
        Update: {
          amount?: number
          created_at?: string
          created_by?: string | null
          id?: string
          invoice_id?: string
          method?: Database["public"]["Enums"]["payment_method"]
          notes?: string | null
          paid_on?: string
          receipt_file_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "invoice_payments_invoice_id_fkey"
            columns: ["invoice_id"]
            isOneToOne: false
            referencedRelation: "invoices"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoice_payments_receipt_file_id_fkey"
            columns: ["receipt_file_id"]
            isOneToOne: false
            referencedRelation: "files"
            referencedColumns: ["id"]
          },
        ]
      }
      invoices: {
        Row: {
          client_email: string | null
          client_name: string
          contract_id: string | null
          created_at: string
          created_by: string | null
          due_date: string
          id: string
          issue_date: string
          notes: string | null
          number: string
          paid_to_date: number
          progress_percentage: number | null
          project_id: string
          status: Database["public"]["Enums"]["invoice_status"]
          subtotal: number
          tax: number
          total: number
          updated_at: string
        }
        Insert: {
          client_email?: string | null
          client_name: string
          contract_id?: string | null
          created_at?: string
          created_by?: string | null
          due_date: string
          id?: string
          issue_date?: string
          notes?: string | null
          number: string
          paid_to_date?: number
          progress_percentage?: number | null
          project_id: string
          status?: Database["public"]["Enums"]["invoice_status"]
          subtotal?: number
          tax?: number
          total?: number
          updated_at?: string
        }
        Update: {
          client_email?: string | null
          client_name?: string
          contract_id?: string | null
          created_at?: string
          created_by?: string | null
          due_date?: string
          id?: string
          issue_date?: string
          notes?: string | null
          number?: string
          paid_to_date?: number
          progress_percentage?: number | null
          project_id?: string
          status?: Database["public"]["Enums"]["invoice_status"]
          subtotal?: number
          tax?: number
          total?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "invoices_contract_id_fkey"
            columns: ["contract_id"]
            isOneToOne: false
            referencedRelation: "project_contracts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoices_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      issue_reports: {
        Row: {
          attachments: Json | null
          company_id: string
          created_at: string
          created_by: string | null
          description: string | null
          id: string
          project_id: string
          status: string
          title: string
          updated_at: string
        }
        Insert: {
          attachments?: Json | null
          company_id: string
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          project_id: string
          status?: string
          title: string
          updated_at?: string
        }
        Update: {
          attachments?: Json | null
          company_id?: string
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          project_id?: string
          status?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      issues: {
        Row: {
          assigned_to: string | null
          attachments: Json | null
          category: string | null
          comments: Json | null
          company_id: string
          created_at: string
          created_by: string | null
          description: string | null
          due_date: string | null
          id: string
          location: string | null
          priority: string
          project_id: string
          report_id: string | null
          resolved_date: string | null
          rfi_number: string
          status: string
          title: string
          updated_at: string
        }
        Insert: {
          assigned_to?: string | null
          attachments?: Json | null
          category?: string | null
          comments?: Json | null
          company_id: string
          created_at?: string
          created_by?: string | null
          description?: string | null
          due_date?: string | null
          id?: string
          location?: string | null
          priority?: string
          project_id: string
          report_id?: string | null
          resolved_date?: string | null
          rfi_number: string
          status?: string
          title: string
          updated_at?: string
        }
        Update: {
          assigned_to?: string | null
          attachments?: Json | null
          category?: string | null
          comments?: Json | null
          company_id?: string
          created_at?: string
          created_by?: string | null
          description?: string | null
          due_date?: string | null
          id?: string
          location?: string | null
          priority?: string
          project_id?: string
          report_id?: string | null
          resolved_date?: string | null
          rfi_number?: string
          status?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "issues_report_id_fkey"
            columns: ["report_id"]
            isOneToOne: false
            referencedRelation: "issue_reports"
            referencedColumns: ["id"]
          },
        ]
      }
      knowledge_sync_jobs: {
        Row: {
          company_id: string
          completed_at: string | null
          created_at: string | null
          error_message: string | null
          id: string
          job_type: string
          project_id: string | null
          retry_count: number | null
          source_id: string | null
          started_at: string | null
          status: string | null
        }
        Insert: {
          company_id: string
          completed_at?: string | null
          created_at?: string | null
          error_message?: string | null
          id?: string
          job_type: string
          project_id?: string | null
          retry_count?: number | null
          source_id?: string | null
          started_at?: string | null
          status?: string | null
        }
        Update: {
          company_id?: string
          completed_at?: string | null
          created_at?: string | null
          error_message?: string | null
          id?: string
          job_type?: string
          project_id?: string | null
          retry_count?: number | null
          source_id?: string | null
          started_at?: string | null
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "knowledge_sync_jobs_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
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
      maintenance_windows: {
        Row: {
          actual_end: string | null
          actual_start: string | null
          affected_services: Json | null
          created_at: string
          created_by: string | null
          description: string | null
          id: string
          maintenance_type: string
          notification_sent: boolean
          scheduled_end: string
          scheduled_start: string
          status: string
          title: string
          updated_at: string
        }
        Insert: {
          actual_end?: string | null
          actual_start?: string | null
          affected_services?: Json | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          maintenance_type?: string
          notification_sent?: boolean
          scheduled_end: string
          scheduled_start: string
          status?: string
          title: string
          updated_at?: string
        }
        Update: {
          actual_end?: string | null
          actual_start?: string | null
          affected_services?: Json | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          maintenance_type?: string
          notification_sent?: boolean
          scheduled_end?: string
          scheduled_start?: string
          status?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
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
      platform_audit_logs: {
        Row: {
          action_details: Json | null
          action_type: string
          created_at: string
          id: string
          ip_address: unknown | null
          resource_id: string | null
          resource_type: string
          session_id: string | null
          severity_level: string
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          action_details?: Json | null
          action_type: string
          created_at?: string
          id?: string
          ip_address?: unknown | null
          resource_id?: string | null
          resource_type: string
          session_id?: string | null
          severity_level?: string
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          action_details?: Json | null
          action_type?: string
          created_at?: string
          id?: string
          ip_address?: unknown | null
          resource_id?: string | null
          resource_type?: string
          session_id?: string | null
          severity_level?: string
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      platform_permissions: {
        Row: {
          category: string
          created_at: string
          created_by: string | null
          description: string | null
          id: string
          is_active: boolean
          name: string
          permission_key: string
          updated_at: string
        }
        Insert: {
          category?: string
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          is_active?: boolean
          name: string
          permission_key: string
          updated_at?: string
        }
        Update: {
          category?: string
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          is_active?: boolean
          name?: string
          permission_key?: string
          updated_at?: string
        }
        Relationships: []
      }
      platform_settings: {
        Row: {
          created_at: string
          created_by: string | null
          description: string | null
          id: string
          is_sensitive: boolean
          last_modified_by: string | null
          requires_restart: boolean
          setting_key: string
          setting_type: string
          setting_value: Json
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          is_sensitive?: boolean
          last_modified_by?: string | null
          requires_restart?: boolean
          setting_key: string
          setting_type?: string
          setting_value?: Json
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          is_sensitive?: boolean
          last_modified_by?: string | null
          requires_restart?: boolean
          setting_key?: string
          setting_type?: string
          setting_value?: Json
          updated_at?: string
        }
        Relationships: []
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
      processed_invoices: {
        Row: {
          bill_id: string | null
          created_at: string
          extracted_data: Json | null
          file_name: string
          file_url: string
          id: string
          processing_status: string
          project_id: string
          updated_at: string
        }
        Insert: {
          bill_id?: string | null
          created_at?: string
          extracted_data?: Json | null
          file_name: string
          file_url: string
          id?: string
          processing_status?: string
          project_id: string
          updated_at?: string
        }
        Update: {
          bill_id?: string | null
          created_at?: string
          extracted_data?: Json | null
          file_name?: string
          file_url?: string
          id?: string
          processing_status?: string
          project_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "processed_invoices_bill_id_fkey"
            columns: ["bill_id"]
            isOneToOne: false
            referencedRelation: "bills"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "processed_invoices_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      procurement_approvals: {
        Row: {
          approval_date: string | null
          approval_status: string
          approved_value: number | null
          approvers: Json | null
          created_at: string
          id: string
          justification_notes: string | null
          recommended_quote_id: string
          rfq_id: string
          updated_at: string
        }
        Insert: {
          approval_date?: string | null
          approval_status?: string
          approved_value?: number | null
          approvers?: Json | null
          created_at?: string
          id?: string
          justification_notes?: string | null
          recommended_quote_id: string
          rfq_id: string
          updated_at?: string
        }
        Update: {
          approval_date?: string | null
          approval_status?: string
          approved_value?: number | null
          approvers?: Json | null
          created_at?: string
          id?: string
          justification_notes?: string | null
          recommended_quote_id?: string
          rfq_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "approvals_quote_id_fkey"
            columns: ["recommended_quote_id"]
            isOneToOne: false
            referencedRelation: "quotes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "approvals_rfq_id_fkey"
            columns: ["rfq_id"]
            isOneToOne: false
            referencedRelation: "rfqs"
            referencedColumns: ["id"]
          },
        ]
      }
      profile_access_logs: {
        Row: {
          access_type: string
          accessed_profile_id: string
          accessor_id: string | null
          created_at: string | null
          id: string
          ip_address: unknown | null
          user_agent: string | null
        }
        Insert: {
          access_type: string
          accessed_profile_id: string
          accessor_id?: string | null
          created_at?: string | null
          id?: string
          ip_address?: unknown | null
          user_agent?: string | null
        }
        Update: {
          access_type?: string
          accessed_profile_id?: string
          accessor_id?: string | null
          created_at?: string | null
          id?: string
          ip_address?: unknown | null
          user_agent?: string | null
        }
        Relationships: []
      }
      profile_contact_requests: {
        Row: {
          contact_reason: string
          created_at: string | null
          id: string
          message: string
          requester_id: string | null
          status: string | null
          target_profile_id: string
          updated_at: string | null
        }
        Insert: {
          contact_reason: string
          created_at?: string | null
          id?: string
          message: string
          requester_id?: string | null
          status?: string | null
          target_profile_id: string
          updated_at?: string | null
        }
        Update: {
          contact_reason?: string
          created_at?: string | null
          id?: string
          message?: string
          requester_id?: string | null
          status?: string | null
          target_profile_id?: string
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
          data_processing_consent: boolean | null
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
          privacy_level: string | null
          professional_title: string | null
          public_profile: boolean | null
          qualifications: string[] | null
          rating: number | null
          review_count: number | null
          services: string[] | null
          show_birth_date: boolean | null
          show_email: boolean | null
          show_location: boolean | null
          show_phone: boolean | null
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
          data_processing_consent?: boolean | null
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
          privacy_level?: string | null
          professional_title?: string | null
          public_profile?: boolean | null
          qualifications?: string[] | null
          rating?: number | null
          review_count?: number | null
          services?: string[] | null
          show_birth_date?: boolean | null
          show_email?: boolean | null
          show_location?: boolean | null
          show_phone?: boolean | null
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
          data_processing_consent?: boolean | null
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
          privacy_level?: string | null
          professional_title?: string | null
          public_profile?: boolean | null
          qualifications?: string[] | null
          rating?: number | null
          review_count?: number | null
          services?: string[] | null
          show_birth_date?: boolean | null
          show_email?: boolean | null
          show_location?: boolean | null
          show_phone?: boolean | null
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
      project_contracts: {
        Row: {
          ai_summary_json: Json | null
          confidence: number | null
          contract_amount: number | null
          contract_data: Json | null
          created_at: string | null
          file_path: string
          file_size: number | null
          file_url: string
          id: string
          is_canonical: boolean | null
          name: string
          project_id: string
          status: string | null
          updated_at: string | null
          uploaded_by: string | null
        }
        Insert: {
          ai_summary_json?: Json | null
          confidence?: number | null
          contract_amount?: number | null
          contract_data?: Json | null
          created_at?: string | null
          file_path: string
          file_size?: number | null
          file_url: string
          id?: string
          is_canonical?: boolean | null
          name: string
          project_id: string
          status?: string | null
          updated_at?: string | null
          uploaded_by?: string | null
        }
        Update: {
          ai_summary_json?: Json | null
          confidence?: number | null
          contract_amount?: number | null
          contract_data?: Json | null
          created_at?: string | null
          file_path?: string
          file_size?: number | null
          file_url?: string
          id?: string
          is_canonical?: boolean | null
          name?: string
          project_id?: string
          status?: string | null
          updated_at?: string | null
          uploaded_by?: string | null
        }
        Relationships: []
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
      project_daily_checks: {
        Row: {
          checked_date: string
          created_at: string
          id: string
          project_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          checked_date?: string
          created_at?: string
          id?: string
          project_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          checked_date?: string
          created_at?: string
          id?: string
          project_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      project_document_categories: {
        Row: {
          company_id: string
          created_at: string
          created_by: string | null
          id: string
          project_id: string
          sort_order: number | null
          title: string
          updated_at: string
        }
        Insert: {
          company_id: string
          created_at?: string
          created_by?: string | null
          id?: string
          project_id: string
          sort_order?: number | null
          title: string
          updated_at?: string
        }
        Update: {
          company_id?: string
          created_at?: string
          created_by?: string | null
          id?: string
          project_id?: string
          sort_order?: number | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      project_documents: {
        Row: {
          ai_confidence: number | null
          ai_rationale: string | null
          ai_summary: string | null
          category_id: string | null
          content_type: string | null
          created_at: string
          created_by: string | null
          document_status: string | null
          document_type: string | null
          error_message: string | null
          estimate_id: string | null
          extracted_text: string | null
          file_size: number | null
          file_url: string
          id: string
          image_only: boolean | null
          metadata: Json | null
          name: string
          processing_status: string | null
          project_id: string | null
          updated_at: string
        }
        Insert: {
          ai_confidence?: number | null
          ai_rationale?: string | null
          ai_summary?: string | null
          category_id?: string | null
          content_type?: string | null
          created_at?: string
          created_by?: string | null
          document_status?: string | null
          document_type?: string | null
          error_message?: string | null
          estimate_id?: string | null
          extracted_text?: string | null
          file_size?: number | null
          file_url: string
          id?: string
          image_only?: boolean | null
          metadata?: Json | null
          name: string
          processing_status?: string | null
          project_id?: string | null
          updated_at?: string
        }
        Update: {
          ai_confidence?: number | null
          ai_rationale?: string | null
          ai_summary?: string | null
          category_id?: string | null
          content_type?: string | null
          created_at?: string
          created_by?: string | null
          document_status?: string | null
          document_type?: string | null
          error_message?: string | null
          estimate_id?: string | null
          extracted_text?: string | null
          file_size?: number | null
          file_url?: string
          id?: string
          image_only?: boolean | null
          metadata?: Json | null
          name?: string
          processing_status?: string | null
          project_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "project_documents_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "document_categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "project_documents_estimate_id_fkey"
            columns: ["estimate_id"]
            isOneToOne: false
            referencedRelation: "estimates"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "project_documents_project_id_fkey"
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
      project_links: {
        Row: {
          category: string
          created_at: string
          created_by: string | null
          description: string | null
          id: string
          project_id: string
          title: string
          updated_at: string
          url: string
        }
        Insert: {
          category?: string
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          project_id: string
          title: string
          updated_at?: string
          url: string
        }
        Update: {
          category?: string
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          project_id?: string
          title?: string
          updated_at?: string
          url?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_project_links_project"
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
          banner_image: string | null
          banner_position: Json | null
          bim_model_url: string | null
          company_id: string
          contract_price: string | null
          created_at: string
          deadline: string | null
          description: string | null
          geocoded_at: string | null
          id: string
          iot_status: Json | null
          is_public: boolean | null
          latitude: number | null
          location: string | null
          longitude: number | null
          name: string
          priority: string | null
          project_id: string
          project_type: string | null
          start_date: string | null
          status: string | null
          updated_at: string
        }
        Insert: {
          banner_image?: string | null
          banner_position?: Json | null
          bim_model_url?: string | null
          company_id: string
          contract_price?: string | null
          created_at?: string
          deadline?: string | null
          description?: string | null
          geocoded_at?: string | null
          id?: string
          iot_status?: Json | null
          is_public?: boolean | null
          latitude?: number | null
          location?: string | null
          longitude?: number | null
          name: string
          priority?: string | null
          project_id: string
          project_type?: string | null
          start_date?: string | null
          status?: string | null
          updated_at?: string
        }
        Update: {
          banner_image?: string | null
          banner_position?: Json | null
          bim_model_url?: string | null
          company_id?: string
          contract_price?: string | null
          created_at?: string
          deadline?: string | null
          description?: string | null
          geocoded_at?: string | null
          id?: string
          iot_status?: Json | null
          is_public?: boolean | null
          latitude?: number | null
          location?: string | null
          longitude?: number | null
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
      qaqc_checklists: {
        Row: {
          assigned_to: string | null
          attachments: Json | null
          checklist_number: string
          company_id: string
          completed_date: string | null
          created_at: string
          created_by: string | null
          description: string | null
          due_date: string | null
          id: string
          items: Json | null
          project_id: string
          status: string
          title: string
          type: string
          updated_at: string
        }
        Insert: {
          assigned_to?: string | null
          attachments?: Json | null
          checklist_number: string
          company_id: string
          completed_date?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          due_date?: string | null
          id?: string
          items?: Json | null
          project_id: string
          status?: string
          title: string
          type?: string
          updated_at?: string
        }
        Update: {
          assigned_to?: string | null
          attachments?: Json | null
          checklist_number?: string
          company_id?: string
          completed_date?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          due_date?: string | null
          id?: string
          items?: Json | null
          project_id?: string
          status?: string
          title?: string
          type?: string
          updated_at?: string
        }
        Relationships: []
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
        ]
      }
      quality_inspections: {
        Row: {
          attachments: Json | null
          company_id: string
          completion_date: string | null
          created_at: string
          equipment_used: string | null
          id: string
          inspection_number: string
          inspector_name: string
          notes: string | null
          pass_fail: string | null
          project_id: string
          results: Json | null
          scheduled_date: string | null
          standards_reference: string | null
          status: string
          title: string
          type: string
          updated_at: string
        }
        Insert: {
          attachments?: Json | null
          company_id: string
          completion_date?: string | null
          created_at?: string
          equipment_used?: string | null
          id?: string
          inspection_number: string
          inspector_name: string
          notes?: string | null
          pass_fail?: string | null
          project_id: string
          results?: Json | null
          scheduled_date?: string | null
          standards_reference?: string | null
          status?: string
          title: string
          type: string
          updated_at?: string
        }
        Update: {
          attachments?: Json | null
          company_id?: string
          completion_date?: string | null
          created_at?: string
          equipment_used?: string | null
          id?: string
          inspection_number?: string
          inspector_name?: string
          notes?: string | null
          pass_fail?: string | null
          project_id?: string
          results?: Json | null
          scheduled_date?: string | null
          standards_reference?: string | null
          status?: string
          title?: string
          type?: string
          updated_at?: string
        }
        Relationships: []
      }
      quality_plans: {
        Row: {
          approval_date: string | null
          approved_by: string | null
          attachments: Json | null
          company_id: string
          created_at: string
          description: string | null
          hold_points: Json | null
          id: string
          inspection_criteria: Json | null
          phase: string | null
          plan_number: string
          project_id: string
          responsible_party: string
          revision_number: number | null
          status: string
          title: string
          type: string
          updated_at: string
          witness_points: Json | null
        }
        Insert: {
          approval_date?: string | null
          approved_by?: string | null
          attachments?: Json | null
          company_id: string
          created_at?: string
          description?: string | null
          hold_points?: Json | null
          id?: string
          inspection_criteria?: Json | null
          phase?: string | null
          plan_number: string
          project_id: string
          responsible_party: string
          revision_number?: number | null
          status?: string
          title: string
          type?: string
          updated_at?: string
          witness_points?: Json | null
        }
        Update: {
          approval_date?: string | null
          approved_by?: string | null
          attachments?: Json | null
          company_id?: string
          created_at?: string
          description?: string | null
          hold_points?: Json | null
          id?: string
          inspection_criteria?: Json | null
          phase?: string | null
          plan_number?: string
          project_id?: string
          responsible_party?: string
          revision_number?: number | null
          status?: string
          title?: string
          type?: string
          updated_at?: string
          witness_points?: Json | null
        }
        Relationships: []
      }
      quotes: {
        Row: {
          attachments: Json | null
          created_at: string
          evaluation_score: number | null
          gst: number | null
          id: string
          inclusions_exclusions: string | null
          is_compliant: boolean | null
          lead_time_days: number | null
          quote_amount_ex_gst: number | null
          quote_amount_inc_gst: number | null
          quote_ref: string | null
          rank: number | null
          rfq_id: string
          scope_coverage_percent: number | null
          status: string
          updated_at: string
          validity_date: string | null
          vendor_id: string
        }
        Insert: {
          attachments?: Json | null
          created_at?: string
          evaluation_score?: number | null
          gst?: number | null
          id?: string
          inclusions_exclusions?: string | null
          is_compliant?: boolean | null
          lead_time_days?: number | null
          quote_amount_ex_gst?: number | null
          quote_amount_inc_gst?: number | null
          quote_ref?: string | null
          rank?: number | null
          rfq_id: string
          scope_coverage_percent?: number | null
          status?: string
          updated_at?: string
          validity_date?: string | null
          vendor_id: string
        }
        Update: {
          attachments?: Json | null
          created_at?: string
          evaluation_score?: number | null
          gst?: number | null
          id?: string
          inclusions_exclusions?: string | null
          is_compliant?: boolean | null
          lead_time_days?: number | null
          quote_amount_ex_gst?: number | null
          quote_amount_inc_gst?: number | null
          quote_ref?: string | null
          rank?: number | null
          rfq_id?: string
          scope_coverage_percent?: number | null
          status?: string
          updated_at?: string
          validity_date?: string | null
          vendor_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "quotes_rfq_id_fkey"
            columns: ["rfq_id"]
            isOneToOne: false
            referencedRelation: "rfqs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "quotes_vendor_id_fkey"
            columns: ["vendor_id"]
            isOneToOne: false
            referencedRelation: "vendors"
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
      rfi_comments: {
        Row: {
          comment_text: string
          company_id: string
          created_at: string
          id: string
          project_id: string
          rfi_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          comment_text: string
          company_id: string
          created_at?: string
          id?: string
          project_id: string
          rfi_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          comment_text?: string
          company_id?: string
          created_at?: string
          id?: string
          project_id?: string
          rfi_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_company"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_project"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_rfi"
            columns: ["rfi_id"]
            isOneToOne: false
            referencedRelation: "issues"
            referencedColumns: ["id"]
          },
        ]
      }
      rfi_reports: {
        Row: {
          company_id: string
          created_at: string
          created_by: string | null
          description: string | null
          id: string
          project_id: string
          status: string
          title: string
          updated_at: string
        }
        Insert: {
          company_id: string
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          project_id: string
          status?: string
          title: string
          updated_at?: string
        }
        Update: {
          company_id?: string
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          project_id?: string
          status?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      rfis: {
        Row: {
          assigned_to: string | null
          attachments: Json | null
          category: string | null
          company_id: string
          created_at: string
          created_by: string | null
          description: string | null
          due_date: string | null
          id: string
          location: string | null
          priority: string
          project_id: string
          report_id: string | null
          resolved_date: string | null
          response_required_by: string | null
          responses: Json | null
          rfi_number: string
          status: string
          title: string
          updated_at: string
        }
        Insert: {
          assigned_to?: string | null
          attachments?: Json | null
          category?: string | null
          company_id: string
          created_at?: string
          created_by?: string | null
          description?: string | null
          due_date?: string | null
          id?: string
          location?: string | null
          priority?: string
          project_id: string
          report_id?: string | null
          resolved_date?: string | null
          response_required_by?: string | null
          responses?: Json | null
          rfi_number: string
          status?: string
          title: string
          updated_at?: string
        }
        Update: {
          assigned_to?: string | null
          attachments?: Json | null
          category?: string | null
          company_id?: string
          created_at?: string
          created_by?: string | null
          description?: string | null
          due_date?: string | null
          id?: string
          location?: string | null
          priority?: string
          project_id?: string
          report_id?: string | null
          resolved_date?: string | null
          response_required_by?: string | null
          responses?: Json | null
          rfi_number?: string
          status?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "rfis_report_id_fkey"
            columns: ["report_id"]
            isOneToOne: false
            referencedRelation: "rfi_reports"
            referencedColumns: ["id"]
          },
        ]
      }
      rfqs: {
        Row: {
          attachments: Json | null
          company_id: string
          created_at: string
          created_by: string | null
          due_date: string | null
          id: string
          project_id: string
          rfq_number: string
          scope_summary: string | null
          status: string
          trade_category: string
          updated_at: string
          work_package: string
        }
        Insert: {
          attachments?: Json | null
          company_id: string
          created_at?: string
          created_by?: string | null
          due_date?: string | null
          id?: string
          project_id: string
          rfq_number: string
          scope_summary?: string | null
          status?: string
          trade_category: string
          updated_at?: string
          work_package: string
        }
        Update: {
          attachments?: Json | null
          company_id?: string
          created_at?: string
          created_by?: string | null
          due_date?: string | null
          id?: string
          project_id?: string
          rfq_number?: string
          scope_summary?: string | null
          status?: string
          trade_category?: string
          updated_at?: string
          work_package?: string
        }
        Relationships: [
          {
            foreignKeyName: "rfqs_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      security_events: {
        Row: {
          created_at: string
          event_type: string
          id: string
          ip_address: unknown | null
          metadata: Json | null
          severity: string | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string
          event_type: string
          id?: string
          ip_address?: unknown | null
          metadata?: Json | null
          severity?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string
          event_type?: string
          id?: string
          ip_address?: unknown | null
          metadata?: Json | null
          severity?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      security_rate_limits: {
        Row: {
          action_type: string
          attempt_count: number
          created_at: string
          id: string
          identifier: string
          window_start: string
        }
        Insert: {
          action_type: string
          attempt_count?: number
          created_at?: string
          id?: string
          identifier: string
          window_start?: string
        }
        Update: {
          action_type?: string
          attempt_count?: number
          created_at?: string
          id?: string
          identifier?: string
          window_start?: string
        }
        Relationships: []
      }
      security_rate_limits_enhanced: {
        Row: {
          action_type: string
          attempt_count: number
          blocked_until: string | null
          created_at: string
          id: string
          identifier: string
          updated_at: string
          window_start: string
        }
        Insert: {
          action_type: string
          attempt_count?: number
          blocked_until?: string | null
          created_at?: string
          id?: string
          identifier: string
          updated_at?: string
          window_start?: string
        }
        Update: {
          action_type?: string
          attempt_count?: number
          blocked_until?: string | null
          created_at?: string
          id?: string
          identifier?: string
          updated_at?: string
          window_start?: string
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
      skai_knowledge: {
        Row: {
          ai_confidence: number | null
          category: string | null
          company_id: string | null
          content: string
          created_at: string | null
          created_by: string | null
          id: string
          is_active: boolean | null
          knowledge_type: Database["public"]["Enums"]["knowledge_type"]
          last_processed_at: string | null
          metadata: Json | null
          processing_status: string | null
          source_ids: Json | null
          tags: string[] | null
          title: string
          updated_at: string | null
          updated_by: string | null
        }
        Insert: {
          ai_confidence?: number | null
          category?: string | null
          company_id?: string | null
          content: string
          created_at?: string | null
          created_by?: string | null
          id?: string
          is_active?: boolean | null
          knowledge_type: Database["public"]["Enums"]["knowledge_type"]
          last_processed_at?: string | null
          metadata?: Json | null
          processing_status?: string | null
          source_ids?: Json | null
          tags?: string[] | null
          title: string
          updated_at?: string | null
          updated_by?: string | null
        }
        Update: {
          ai_confidence?: number | null
          category?: string | null
          company_id?: string | null
          content?: string
          created_at?: string | null
          created_by?: string | null
          id?: string
          is_active?: boolean | null
          knowledge_type?: Database["public"]["Enums"]["knowledge_type"]
          last_processed_at?: string | null
          metadata?: Json | null
          processing_status?: string | null
          source_ids?: Json | null
          tags?: string[] | null
          title?: string
          updated_at?: string | null
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "skai_knowledge_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
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
      stakeholder_activities: {
        Row: {
          activity_date: string | null
          activity_type: string
          created_at: string
          created_by: string | null
          description: string | null
          id: string
          stakeholder_id: string
          title: string
        }
        Insert: {
          activity_date?: string | null
          activity_type: string
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          stakeholder_id: string
          title: string
        }
        Update: {
          activity_date?: string | null
          activity_type?: string
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          stakeholder_id?: string
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "stakeholder_activities_stakeholder_id_fkey"
            columns: ["stakeholder_id"]
            isOneToOne: false
            referencedRelation: "stakeholders"
            referencedColumns: ["id"]
          },
        ]
      }
      stakeholder_addresses: {
        Row: {
          access_level: string | null
          address_line_1: string
          address_line_2: string | null
          city: string
          country: string | null
          created_at: string
          id: string
          is_primary: boolean | null
          last_accessed_at: string | null
          last_accessed_by: string | null
          latitude: number | null
          longitude: number | null
          postal_code: string
          security_classification: string | null
          stakeholder_id: string
          state: string
          type: string
        }
        Insert: {
          access_level?: string | null
          address_line_1: string
          address_line_2?: string | null
          city: string
          country?: string | null
          created_at?: string
          id?: string
          is_primary?: boolean | null
          last_accessed_at?: string | null
          last_accessed_by?: string | null
          latitude?: number | null
          longitude?: number | null
          postal_code: string
          security_classification?: string | null
          stakeholder_id: string
          state: string
          type: string
        }
        Update: {
          access_level?: string | null
          address_line_1?: string
          address_line_2?: string | null
          city?: string
          country?: string | null
          created_at?: string
          id?: string
          is_primary?: boolean | null
          last_accessed_at?: string | null
          last_accessed_by?: string | null
          latitude?: number | null
          longitude?: number | null
          postal_code?: string
          security_classification?: string | null
          stakeholder_id?: string
          state?: string
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "stakeholder_addresses_stakeholder_id_fkey"
            columns: ["stakeholder_id"]
            isOneToOne: false
            referencedRelation: "stakeholders"
            referencedColumns: ["id"]
          },
        ]
      }
      stakeholder_contacts: {
        Row: {
          created_at: string
          email: string | null
          id: string
          is_preferred: boolean | null
          is_primary: boolean | null
          mobile: string | null
          name: string
          phone: string | null
          stakeholder_id: string
          title: string | null
        }
        Insert: {
          created_at?: string
          email?: string | null
          id?: string
          is_preferred?: boolean | null
          is_primary?: boolean | null
          mobile?: string | null
          name: string
          phone?: string | null
          stakeholder_id: string
          title?: string | null
        }
        Update: {
          created_at?: string
          email?: string | null
          id?: string
          is_preferred?: boolean | null
          is_primary?: boolean | null
          mobile?: string | null
          name?: string
          phone?: string | null
          stakeholder_id?: string
          title?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "stakeholder_contacts_stakeholder_id_fkey"
            columns: ["stakeholder_id"]
            isOneToOne: false
            referencedRelation: "stakeholders"
            referencedColumns: ["id"]
          },
        ]
      }
      stakeholder_documents: {
        Row: {
          created_at: string
          document_name: string
          document_type: string
          expiry_date: string | null
          file_url: string | null
          id: string
          stakeholder_id: string
          status: Database["public"]["Enums"]["compliance_status"] | null
          updated_at: string
          uploaded_by: string | null
        }
        Insert: {
          created_at?: string
          document_name: string
          document_type: string
          expiry_date?: string | null
          file_url?: string | null
          id?: string
          stakeholder_id: string
          status?: Database["public"]["Enums"]["compliance_status"] | null
          updated_at?: string
          uploaded_by?: string | null
        }
        Update: {
          created_at?: string
          document_name?: string
          document_type?: string
          expiry_date?: string | null
          file_url?: string | null
          id?: string
          stakeholder_id?: string
          status?: Database["public"]["Enums"]["compliance_status"] | null
          updated_at?: string
          uploaded_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "stakeholder_documents_stakeholder_id_fkey"
            columns: ["stakeholder_id"]
            isOneToOne: false
            referencedRelation: "stakeholders"
            referencedColumns: ["id"]
          },
        ]
      }
      stakeholder_project_roles: {
        Row: {
          created_at: string
          end_date: string | null
          id: string
          is_active: boolean | null
          project_id: string
          role: string
          stakeholder_id: string
          start_date: string | null
        }
        Insert: {
          created_at?: string
          end_date?: string | null
          id?: string
          is_active?: boolean | null
          project_id: string
          role: string
          stakeholder_id: string
          start_date?: string | null
        }
        Update: {
          created_at?: string
          end_date?: string | null
          id?: string
          is_active?: boolean | null
          project_id?: string
          role?: string
          stakeholder_id?: string
          start_date?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "stakeholder_project_roles_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "stakeholder_project_roles_stakeholder_id_fkey"
            columns: ["stakeholder_id"]
            isOneToOne: false
            referencedRelation: "stakeholders"
            referencedColumns: ["id"]
          },
        ]
      }
      stakeholders: {
        Row: {
          abn: string | null
          category: Database["public"]["Enums"]["stakeholder_category"]
          company_id: string
          compliance_expiry_date: string | null
          compliance_status:
            | Database["public"]["Enums"]["compliance_status"]
            | null
          created_at: string
          created_by: string | null
          display_name: string
          id: string
          notes: string | null
          primary_contact_name: string | null
          primary_email: string | null
          primary_phone: string | null
          status: Database["public"]["Enums"]["stakeholder_status"]
          tags: string[] | null
          trade_industry: string | null
          updated_at: string
          website: string | null
        }
        Insert: {
          abn?: string | null
          category: Database["public"]["Enums"]["stakeholder_category"]
          company_id: string
          compliance_expiry_date?: string | null
          compliance_status?:
            | Database["public"]["Enums"]["compliance_status"]
            | null
          created_at?: string
          created_by?: string | null
          display_name: string
          id?: string
          notes?: string | null
          primary_contact_name?: string | null
          primary_email?: string | null
          primary_phone?: string | null
          status?: Database["public"]["Enums"]["stakeholder_status"]
          tags?: string[] | null
          trade_industry?: string | null
          updated_at?: string
          website?: string | null
        }
        Update: {
          abn?: string | null
          category?: Database["public"]["Enums"]["stakeholder_category"]
          company_id?: string
          compliance_expiry_date?: string | null
          compliance_status?:
            | Database["public"]["Enums"]["compliance_status"]
            | null
          created_at?: string
          created_by?: string | null
          display_name?: string
          id?: string
          notes?: string | null
          primary_contact_name?: string | null
          primary_email?: string | null
          primary_phone?: string | null
          status?: Database["public"]["Enums"]["stakeholder_status"]
          tags?: string[] | null
          trade_industry?: string | null
          updated_at?: string
          website?: string | null
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
      takeoffs: {
        Row: {
          created_at: string
          created_by: string | null
          estimate_id: string
          id: string
          measurements: Json | null
          name: string
          quantity: string | null
          status: string
          type: string
          unit: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          estimate_id: string
          id?: string
          measurements?: Json | null
          name: string
          quantity?: string | null
          status?: string
          type: string
          unit: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          estimate_id?: string
          id?: string
          measurements?: Json | null
          name?: string
          quantity?: string | null
          status?: string
          type?: string
          unit?: string
          updated_at?: string
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
      task_costs: {
        Row: {
          actual_cost: number | null
          cost_description: string | null
          cost_type: string
          created_at: string
          created_by: string | null
          estimated_cost: number | null
          id: string
          impact_level: string | null
          justification: string | null
          task_id: string
          updated_at: string
        }
        Insert: {
          actual_cost?: number | null
          cost_description?: string | null
          cost_type: string
          created_at?: string
          created_by?: string | null
          estimated_cost?: number | null
          id?: string
          impact_level?: string | null
          justification?: string | null
          task_id: string
          updated_at?: string
        }
        Update: {
          actual_cost?: number | null
          cost_description?: string | null
          cost_type?: string
          created_at?: string
          created_by?: string | null
          estimated_cost?: number | null
          id?: string
          impact_level?: string | null
          justification?: string | null
          task_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "task_costs_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "tasks"
            referencedColumns: ["id"]
          },
        ]
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
        Relationships: []
      }
      task_qa: {
        Row: {
          attachments: Json | null
          checked_at: string | null
          checked_by: string | null
          checklist_item: string
          created_at: string
          id: string
          notes: string | null
          qa_type: string
          status: string
          task_id: string
          updated_at: string
        }
        Insert: {
          attachments?: Json | null
          checked_at?: string | null
          checked_by?: string | null
          checklist_item: string
          created_at?: string
          id?: string
          notes?: string | null
          qa_type: string
          status?: string
          task_id: string
          updated_at?: string
        }
        Update: {
          attachments?: Json | null
          checked_at?: string | null
          checked_by?: string | null
          checklist_item?: string
          created_at?: string
          id?: string
          notes?: string | null
          qa_type?: string
          status?: string
          task_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "task_qa_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "tasks"
            referencedColumns: ["id"]
          },
        ]
      }
      task_reviews: {
        Row: {
          created_at: string
          id: string
          rating: number | null
          review_comments: string | null
          review_status: string
          reviewed_at: string | null
          reviewer_id: string | null
          submittal_id: string
          task_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          rating?: number | null
          review_comments?: string | null
          review_status?: string
          reviewed_at?: string | null
          reviewer_id?: string | null
          submittal_id: string
          task_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          rating?: number | null
          review_comments?: string | null
          review_status?: string
          reviewed_at?: string | null
          reviewer_id?: string | null
          submittal_id?: string
          task_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "task_reviews_submittal_id_fkey"
            columns: ["submittal_id"]
            isOneToOne: false
            referencedRelation: "task_submittals"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "task_reviews_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "tasks"
            referencedColumns: ["id"]
          },
        ]
      }
      task_submittals: {
        Row: {
          created_at: string
          description: string | null
          file_size: number | null
          file_url: string | null
          id: string
          status: string
          submittal_name: string
          submittal_type: string | null
          submitted_at: string | null
          submitted_by: string | null
          task_id: string
          updated_at: string
          version: number | null
        }
        Insert: {
          created_at?: string
          description?: string | null
          file_size?: number | null
          file_url?: string | null
          id?: string
          status?: string
          submittal_name: string
          submittal_type?: string | null
          submitted_at?: string | null
          submitted_by?: string | null
          task_id: string
          updated_at?: string
          version?: number | null
        }
        Update: {
          created_at?: string
          description?: string | null
          file_size?: number | null
          file_url?: string | null
          id?: string
          status?: string
          submittal_name?: string
          submittal_type?: string | null
          submitted_at?: string | null
          submitted_by?: string | null
          task_id?: string
          updated_at?: string
          version?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "task_submittals_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "tasks"
            referencedColumns: ["id"]
          },
        ]
      }
      tasks: {
        Row: {
          actual_hours: number | null
          assigned_to_avatar: string | null
          assigned_to_name: string | null
          assigned_to_user_id: string | null
          category: string | null
          created_at: string
          description: string | null
          due_date: string | null
          duration: number | null
          estimated_duration: unknown | null
          estimated_hours: number | null
          id: string
          is_critical_path: boolean | null
          is_milestone: boolean | null
          priority: string
          progress: number | null
          project_id: string
          status: string
          task_name: string
          task_number: string | null
          task_type: string
          updated_at: string
          wbs_item_id: string | null
        }
        Insert: {
          actual_hours?: number | null
          assigned_to_avatar?: string | null
          assigned_to_name?: string | null
          assigned_to_user_id?: string | null
          category?: string | null
          created_at?: string
          description?: string | null
          due_date?: string | null
          duration?: number | null
          estimated_duration?: unknown | null
          estimated_hours?: number | null
          id?: string
          is_critical_path?: boolean | null
          is_milestone?: boolean | null
          priority?: string
          progress?: number | null
          project_id: string
          status?: string
          task_name: string
          task_number?: string | null
          task_type?: string
          updated_at?: string
          wbs_item_id?: string | null
        }
        Update: {
          actual_hours?: number | null
          assigned_to_avatar?: string | null
          assigned_to_name?: string | null
          assigned_to_user_id?: string | null
          category?: string | null
          created_at?: string
          description?: string | null
          due_date?: string | null
          duration?: number | null
          estimated_duration?: unknown | null
          estimated_hours?: number | null
          id?: string
          is_critical_path?: boolean | null
          is_milestone?: boolean | null
          priority?: string
          progress?: number | null
          project_id?: string
          status?: string
          task_name?: string
          task_number?: string | null
          task_type?: string
          updated_at?: string
          wbs_item_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "tasks_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tasks_wbs_item_id_fkey"
            columns: ["wbs_item_id"]
            isOneToOne: false
            referencedRelation: "wbs_items"
            referencedColumns: ["id"]
          },
        ]
      }
      time_blocks: {
        Row: {
          category: string
          color: string
          created_at: string
          day_of_week: number
          description: string | null
          end_time: string
          id: string
          start_time: string
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          category: string
          color: string
          created_at?: string
          day_of_week: number
          description?: string | null
          end_time: string
          id?: string
          start_time: string
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          category?: string
          color?: string
          created_at?: string
          day_of_week?: number
          description?: string | null
          end_time?: string
          id?: string
          start_time?: string
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      time_categories: {
        Row: {
          color: string | null
          company_id: string | null
          created_at: string
          id: string
          is_default: boolean
          name: string
          updated_at: string
          user_id: string
        }
        Insert: {
          color?: string | null
          company_id?: string | null
          created_at?: string
          id?: string
          is_default?: boolean
          name: string
          updated_at?: string
          user_id: string
        }
        Update: {
          color?: string | null
          company_id?: string | null
          created_at?: string
          id?: string
          is_default?: boolean
          name?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "time_categories_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
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
          status: string
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
          status?: string
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
          status?: string
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
          encryption_key_id: string | null
          expires_at: string
          id: string
          last_used_at: string | null
          token: string
          token_encrypted: string | null
          token_type: string
          updated_at: string
          used_at: string | null
          used_count: number | null
          user_id: string
        }
        Insert: {
          created_at?: string
          encryption_key_id?: string | null
          expires_at: string
          id?: string
          last_used_at?: string | null
          token: string
          token_encrypted?: string | null
          token_type: string
          updated_at?: string
          used_at?: string | null
          used_count?: number | null
          user_id: string
        }
        Update: {
          created_at?: string
          encryption_key_id?: string | null
          expires_at?: string
          id?: string
          last_used_at?: string | null
          token?: string
          token_encrypted?: string | null
          token_type?: string
          updated_at?: string
          used_at?: string | null
          used_count?: number | null
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
          {
            foreignKeyName: "user_access_tokens_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "safe_public_profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      user_audit_log: {
        Row: {
          action: string
          created_at: string
          details: Json | null
          id: string
          ip_address: unknown | null
          target_user_id: string | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          action: string
          created_at?: string
          details?: Json | null
          id?: string
          ip_address?: unknown | null
          target_user_id?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          action?: string
          created_at?: string
          details?: Json | null
          id?: string
          ip_address?: unknown | null
          target_user_id?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: []
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
      user_invitations: {
        Row: {
          accepted_at: string | null
          company_id: string | null
          created_at: string
          email: string
          expires_at: string
          id: string
          invited_by: string
          metadata: Json | null
          revoked_at: string | null
          role: Database["public"]["Enums"]["app_role"]
          status: string
          token: string
          updated_at: string
        }
        Insert: {
          accepted_at?: string | null
          company_id?: string | null
          created_at?: string
          email: string
          expires_at?: string
          id?: string
          invited_by: string
          metadata?: Json | null
          revoked_at?: string | null
          role?: Database["public"]["Enums"]["app_role"]
          status?: string
          token?: string
          updated_at?: string
        }
        Update: {
          accepted_at?: string | null
          company_id?: string | null
          created_at?: string
          email?: string
          expires_at?: string
          id?: string
          invited_by?: string
          metadata?: Json | null
          revoked_at?: string | null
          role?: Database["public"]["Enums"]["app_role"]
          status?: string
          token?: string
          updated_at?: string
        }
        Relationships: []
      }
      user_module_permissions: {
        Row: {
          access_level: string
          company_id: string
          created_at: string
          created_by: string | null
          id: string
          module_id: string
          sub_module_id: string | null
          updated_at: string
          updated_by: string | null
          user_id: string
        }
        Insert: {
          access_level: string
          company_id: string
          created_at?: string
          created_by?: string | null
          id?: string
          module_id: string
          sub_module_id?: string | null
          updated_at?: string
          updated_by?: string | null
          user_id: string
        }
        Update: {
          access_level?: string
          company_id?: string
          created_at?: string
          created_by?: string | null
          id?: string
          module_id?: string
          sub_module_id?: string | null
          updated_at?: string
          updated_by?: string | null
          user_id?: string
        }
        Relationships: []
      }
      user_permissions: {
        Row: {
          company_id: string | null
          created_at: string
          granted: boolean
          granted_at: string | null
          granted_by: string | null
          id: string
          permission_key: string
          updated_at: string
          user_id: string
        }
        Insert: {
          company_id?: string | null
          created_at?: string
          granted?: boolean
          granted_at?: string | null
          granted_by?: string | null
          id?: string
          permission_key: string
          updated_at?: string
          user_id: string
        }
        Update: {
          company_id?: string | null
          created_at?: string
          granted?: boolean
          granted_at?: string | null
          granted_by?: string | null
          id?: string
          permission_key?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_permissions_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
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
      vendors: {
        Row: {
          company_id: string
          compliance_rating: string | null
          contact_person: string | null
          created_at: string
          email: string | null
          id: string
          is_active: boolean | null
          name: string
          phone: string | null
          trade_category: string
          updated_at: string
        }
        Insert: {
          company_id: string
          compliance_rating?: string | null
          contact_person?: string | null
          created_at?: string
          email?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          phone?: string | null
          trade_category: string
          updated_at?: string
        }
        Update: {
          company_id?: string
          compliance_rating?: string | null
          contact_person?: string | null
          created_at?: string
          email?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          phone?: string | null
          trade_category?: string
          updated_at?: string
        }
        Relationships: []
      }
      voice_chat_sessions: {
        Row: {
          created_at: string
          id: string
          max_duration_minutes: number | null
          max_requests_per_session: number | null
          session_end: string | null
          session_start: string
          total_duration_seconds: number | null
          total_requests: number | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          max_duration_minutes?: number | null
          max_requests_per_session?: number | null
          session_end?: string | null
          session_start?: string
          total_duration_seconds?: number | null
          total_requests?: number | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          max_duration_minutes?: number | null
          max_requests_per_session?: number | null
          session_end?: string | null
          session_start?: string
          total_duration_seconds?: number | null
          total_requests?: number | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      wbs_items: {
        Row: {
          actual_cost: number | null
          actual_hours: number | null
          assigned_to: string | null
          at_risk: boolean | null
          budgeted_cost: number | null
          category: string | null
          company_id: string
          cost_link: string | null
          created_at: string
          description: string | null
          duration: number | null
          end_date: string | null
          estimated_hours: number | null
          health: string | null
          id: string
          is_expanded: boolean | null
          is_task_enabled: boolean | null
          level: number | null
          linked_task_id: string | null
          linked_tasks: Json | null
          parent_id: string | null
          predecessors: Json | null
          priority: string | null
          progress: number | null
          progress_status: string | null
          project_id: string
          revised_budget: number | null
          rfq_required: boolean | null
          scope_link: string | null
          start_date: string | null
          status: string | null
          task_conversion_date: string | null
          task_type: string | null
          text_formatting: Json | null
          time_link: string | null
          title: string
          updated_at: string
          variations: number | null
          wbs_id: string
        }
        Insert: {
          actual_cost?: number | null
          actual_hours?: number | null
          assigned_to?: string | null
          at_risk?: boolean | null
          budgeted_cost?: number | null
          category?: string | null
          company_id: string
          cost_link?: string | null
          created_at?: string
          description?: string | null
          duration?: number | null
          end_date?: string | null
          estimated_hours?: number | null
          health?: string | null
          id?: string
          is_expanded?: boolean | null
          is_task_enabled?: boolean | null
          level?: number | null
          linked_task_id?: string | null
          linked_tasks?: Json | null
          parent_id?: string | null
          predecessors?: Json | null
          priority?: string | null
          progress?: number | null
          progress_status?: string | null
          project_id: string
          revised_budget?: number | null
          rfq_required?: boolean | null
          scope_link?: string | null
          start_date?: string | null
          status?: string | null
          task_conversion_date?: string | null
          task_type?: string | null
          text_formatting?: Json | null
          time_link?: string | null
          title: string
          updated_at?: string
          variations?: number | null
          wbs_id: string
        }
        Update: {
          actual_cost?: number | null
          actual_hours?: number | null
          assigned_to?: string | null
          at_risk?: boolean | null
          budgeted_cost?: number | null
          category?: string | null
          company_id?: string
          cost_link?: string | null
          created_at?: string
          description?: string | null
          duration?: number | null
          end_date?: string | null
          estimated_hours?: number | null
          health?: string | null
          id?: string
          is_expanded?: boolean | null
          is_task_enabled?: boolean | null
          level?: number | null
          linked_task_id?: string | null
          linked_tasks?: Json | null
          parent_id?: string | null
          predecessors?: Json | null
          priority?: string | null
          progress?: number | null
          progress_status?: string | null
          project_id?: string
          revised_budget?: number | null
          rfq_required?: boolean | null
          scope_link?: string | null
          start_date?: string | null
          status?: string | null
          task_conversion_date?: string | null
          task_type?: string | null
          text_formatting?: Json | null
          time_link?: string | null
          title?: string
          updated_at?: string
          variations?: number | null
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
          access_token_encrypted: string | null
          access_token_encrypted_v2: string | null
          connected_at: string
          created_at: string
          encryption_algorithm: string | null
          encryption_key_id: string | null
          expires_at: string
          id: string
          key_version: number | null
          last_sync: string | null
          refresh_token: string
          refresh_token_encrypted: string | null
          refresh_token_encrypted_v2: string | null
          tenant_id: string
          tenant_name: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          access_token: string
          access_token_encrypted?: string | null
          access_token_encrypted_v2?: string | null
          connected_at?: string
          created_at?: string
          encryption_algorithm?: string | null
          encryption_key_id?: string | null
          expires_at: string
          id?: string
          key_version?: number | null
          last_sync?: string | null
          refresh_token: string
          refresh_token_encrypted?: string | null
          refresh_token_encrypted_v2?: string | null
          tenant_id: string
          tenant_name?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          access_token?: string
          access_token_encrypted?: string | null
          access_token_encrypted_v2?: string | null
          connected_at?: string
          created_at?: string
          encryption_algorithm?: string | null
          encryption_key_id?: string | null
          expires_at?: string
          id?: string
          key_version?: number | null
          last_sync?: string | null
          refresh_token?: string
          refresh_token_encrypted?: string | null
          refresh_token_encrypted_v2?: string | null
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
          sub_total: number | null
          sync_timestamp: string
          total: number | null
          total_tax: number | null
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
          sub_total?: number | null
          sync_timestamp: string
          total?: number | null
          total_tax?: number | null
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
          sub_total?: number | null
          sync_timestamp?: string
          total?: number | null
          total_tax?: number | null
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
      project_scope_view: {
        Row: {
          actual_cost: number | null
          assigned_to: string | null
          at_risk: boolean | null
          budgeted_cost: number | null
          category: string | null
          company_id: string | null
          created_at: string | null
          depth: number | null
          description: string | null
          duration: number | null
          end_date: string | null
          health: string | null
          id: string | null
          is_expanded: boolean | null
          level: number | null
          linked_tasks: Json | null
          parent_id: string | null
          path: string[] | null
          predecessors: Json | null
          priority: string | null
          progress: number | null
          progress_status: string | null
          project_id: string | null
          start_date: string | null
          status: string | null
          title: string | null
          updated_at: string | null
          wbs_id: string | null
        }
        Relationships: []
      }
      safe_public_profiles: {
        Row: {
          avatar_url: string | null
          bio: string | null
          birth_date: string | null
          company: string | null
          created_at: string | null
          email: string | null
          first_name: string | null
          id: string | null
          last_name: string | null
          location: string | null
          meta_description: string | null
          meta_title: string | null
          phone: string | null
          professional_title: string | null
          rating: number | null
          review_count: number | null
          services: string[] | null
          skills: string[] | null
          slug: string | null
          social_links: Json | null
          updated_at: string | null
          user_id: string | null
          verified: boolean | null
          website: string | null
          years_experience: number | null
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          birth_date?: never
          company?: string | null
          created_at?: string | null
          email?: never
          first_name?: string | null
          id?: string | null
          last_name?: string | null
          location?: never
          meta_description?: string | null
          meta_title?: string | null
          phone?: never
          professional_title?: string | null
          rating?: number | null
          review_count?: number | null
          services?: string[] | null
          skills?: string[] | null
          slug?: string | null
          social_links?: Json | null
          updated_at?: string | null
          user_id?: string | null
          verified?: boolean | null
          website?: string | null
          years_experience?: number | null
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          birth_date?: never
          company?: string | null
          created_at?: string | null
          email?: never
          first_name?: string | null
          id?: string | null
          last_name?: string | null
          location?: never
          meta_description?: string | null
          meta_title?: string | null
          phone?: never
          professional_title?: string | null
          rating?: number | null
          review_count?: number | null
          services?: string[] | null
          skills?: string[] | null
          slug?: string | null
          social_links?: Json | null
          updated_at?: string | null
          user_id?: string | null
          verified?: boolean | null
          website?: string | null
          years_experience?: number | null
        }
        Relationships: []
      }
      stakeholder_contacts_safe: {
        Row: {
          created_at: string | null
          email_masked: string | null
          id: string | null
          is_preferred: boolean | null
          is_primary: boolean | null
          mobile_masked: string | null
          name: string | null
          phone_masked: string | null
          stakeholder_id: string | null
          title: string | null
        }
        Insert: {
          created_at?: string | null
          email_masked?: never
          id?: string | null
          is_preferred?: boolean | null
          is_primary?: boolean | null
          mobile_masked?: never
          name?: string | null
          phone_masked?: never
          stakeholder_id?: string | null
          title?: string | null
        }
        Update: {
          created_at?: string | null
          email_masked?: never
          id?: string | null
          is_preferred?: boolean | null
          is_primary?: boolean | null
          mobile_masked?: never
          name?: string | null
          phone_masked?: never
          stakeholder_id?: string | null
          title?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "stakeholder_contacts_stakeholder_id_fkey"
            columns: ["stakeholder_id"]
            isOneToOne: false
            referencedRelation: "stakeholders"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Functions: {
      accept_project_invitation: {
        Args: { invitation_token: string }
        Returns: Json
      }
      can_access_profile_data: {
        Args: {
          data_type?: string
          requesting_user_id?: string
          target_user_id: string
        }
        Returns: boolean
      }
      can_access_project_contracts: {
        Args: { project_id_param: string }
        Returns: boolean
      }
      can_access_stakeholder_address: {
        Args: {
          access_type?: string
          requesting_user_id?: string
          target_stakeholder_id: string
        }
        Returns: boolean
      }
      can_access_stakeholder_contacts: {
        Args: { target_stakeholder_id: string }
        Returns: boolean
      }
      can_manage_company: {
        Args: { target_company_id: string; target_user_id: string }
        Returns: boolean
      }
      can_manage_company_projects: {
        Args: { target_company_id: string; target_user_id: string }
        Returns: boolean
      }
      can_manage_project_secure: {
        Args: { target_project_id: string; target_user_id: string }
        Returns: boolean
      }
      can_manage_stakeholder_contacts: {
        Args: { target_stakeholder_id: string }
        Returns: boolean
      }
      can_manage_user: {
        Args: { target_user_id: string }
        Returns: boolean
      }
      can_view_company_projects: {
        Args: { target_company_id: string; target_user_id: string }
        Returns: boolean
      }
      can_view_profile_safely: {
        Args: { target_user_id: string }
        Returns: boolean
      }
      check_contact_access_rate_limit: {
        Args: { operation_type?: string }
        Returns: boolean
      }
      check_profile_access_rate_limit: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      check_rate_limit: {
        Args: {
          action_type_param: string
          block_minutes_param?: number
          identifier_param: string
          max_attempts_param?: number
          window_minutes_param?: number
        }
        Returns: Json
      }
      check_security_rate_limit: {
        Args: {
          action_type_param: string
          identifier_param: string
          max_attempts?: number
          window_minutes?: number
        }
        Returns: boolean
      }
      cleanup_non_business_accounts: {
        Args: Record<PropertyKey, never>
        Returns: {
          company_name: string
          deleted_company_id: string
          deletion_result: Json
        }[]
      }
      cleanup_old_suggestions: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      copy_monday_blocks_to_weekdays: {
        Args: { target_user_id: string }
        Returns: undefined
      }
      copy_my_monday_blocks: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      create_invoice: {
        Args: {
          p_client_email?: string
          p_client_name: string
          p_due_date?: string
          p_items?: Json
          p_project_id: string
        }
        Returns: string
      }
      debug_user_company_access: {
        Args: { target_user_id?: string }
        Returns: {
          can_see_projects: boolean
          company_id: string
          company_name: string
          membership_status: string
          user_role: string
        }[]
      }
      decrypt_sensitive_data: {
        Args: { encrypted_data: string }
        Returns: string
      }
      delete_company_completely: {
        Args: { target_company_id: string }
        Returns: Json
      }
      delete_user_completely: {
        Args: { target_user_id: string }
        Returns: Json
      }
      delete_wbs_item_with_children: {
        Args: { item_id: string }
        Returns: undefined
      }
      encrypt_sensitive_data: {
        Args: { data: string }
        Returns: string
      }
      generate_access_token: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      generate_commitment_number: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      generate_contract_number: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      generate_defect_number: {
        Args: { project_id_param: string }
        Returns: string
      }
      generate_invitation_token: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      generate_invoice_number: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      generate_issue_number: {
        Args: { project_id_param: string }
        Returns: string
      }
      generate_rfi_number: {
        Args: { project_id_param: string }
        Returns: string
      }
      generate_rfq_number: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      generate_slug: {
        Args: { input_text: string }
        Returns: string
      }
      generate_task_number: {
        Args: { project_id_param: string }
        Returns: string
      }
      get_all_users_for_admin: {
        Args: Record<PropertyKey, never>
        Returns: {
          avatar_url: string
          company: string
          created_at: string
          email: string
          first_name: string
          last_name: string
          phone: string
          status: string
          updated_at: string
          user_id: string
          user_roles: Json
        }[]
      }
      get_calendar_tokens: {
        Args: { integration_id: string }
        Returns: {
          access_token: string
          refresh_token: string
          token_expires_at: string
        }[]
      }
      get_current_business_context: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      get_current_context: {
        Args: Record<PropertyKey, never>
        Returns: {
          context_id: string
          context_name: string
          context_type: string
        }[]
      }
      get_leads_with_masked_contact: {
        Args: Record<PropertyKey, never> | { requesting_user_id?: string }
        Returns: {
          avatar_url: string
          company: string
          company_id: string
          contact_email: string
          contact_name: string
          contact_phone: string
          created_at: string
          description: string
          id: string
          last_activity: string
          location: string
          notes: string
          priority: string
          project_address: string
          source: string
          stage: string
          updated_at: string
          value: number
          website: string
        }[]
      }
      get_manageable_users_for_user: {
        Args: { requesting_user_id: string }
        Returns: {
          app_role: Database["public"]["Enums"]["app_role"]
          app_roles: Database["public"]["Enums"]["app_role"][]
          avatar_url: string
          can_assign_to_companies: boolean
          can_manage_roles: boolean
          company: string
          company_role: string
          created_at: string
          email: string
          first_name: string
          last_name: string
          phone: string
          status: string
          user_id: string
        }[]
      }
      get_masked_lead_contact: {
        Args: {
          lead_company_id: string
          lead_contact_email: string
          lead_contact_phone: string
          requesting_user_id: string
        }
        Returns: {
          masked_email: string
          masked_phone: string
        }[]
      }
      get_masked_lead_data: {
        Args: { lead_id: string }
        Returns: {
          company: string
          company_id: string
          contact_email: string
          contact_name: string
          contact_phone: string
          description: string
          id: string
          location: string
          priority: string
          project_address: string
          source: string
          stage: string
          value: number
          website: string
        }[]
      }
      get_project_scope: {
        Args: { target_project_id: string }
        Returns: {
          actual_cost: number
          assigned_to: string
          at_risk: boolean
          budgeted_cost: number
          category: string
          company_id: string
          created_at: string
          depth: number
          description: string
          duration: number
          end_date: string
          health: string
          id: string
          is_expanded: boolean
          level: number
          linked_tasks: Json
          parent_id: string
          path: string[]
          priority: string
          progress: number
          progress_status: string
          project_id: string
          start_date: string
          status: string
          title: string
          updated_at: string
          wbs_id: string
        }[]
      }
      get_public_company_profile: {
        Args: { company_slug: string }
        Returns: {
          id: string
          industry: string
          logo_url: string
          meta_description: string
          meta_title: string
          name: string
          rating: number
          review_count: number
          service_areas: string[]
          slogan: string
          slug: string
          social_links: Json
          website: string
          year_established: number
        }[]
      }
      get_public_profile_safe: {
        Args: { profile_user_id: string }
        Returns: {
          avatar_url: string
          company: string
          email: string
          first_name: string
          last_name: string
          phone: string
          rating: number
          review_count: number
          slug: string
          status: string
          user_id: string
        }[]
      }
      get_public_profile_safely: {
        Args: { profile_user_id: string }
        Returns: {
          avatar_url: string
          bio: string
          company: string
          created_at: string
          first_name: string
          id: string
          last_name: string
          meta_description: string
          meta_title: string
          professional_title: string
          rating: number
          review_count: number
          services: string[]
          skills: string[]
          slug: string
          social_links: Json
          updated_at: string
          user_id: string
          verified: boolean
          website: string
          years_experience: number
        }[]
      }
      get_safe_profile_data: {
        Args: { profile_user_id: string }
        Returns: {
          avatar_url: string
          company: string
          email: string
          first_name: string
          id: string
          last_name: string
          phone: string
          public_profile: boolean
          rating: number
          review_count: number
          slug: string
          status: string
          user_id: string
        }[]
      }
      get_safe_public_profile_data: {
        Args: { profile_user_id: string }
        Returns: {
          avatar_url: string
          bio: string
          company: string
          email: string
          first_name: string
          id: string
          last_name: string
          location: string
          meta_description: string
          meta_title: string
          phone: string
          professional_title: string
          rating: number
          review_count: number
          services: string[]
          skills: string[]
          slug: string
          social_links: Json
          user_id: string
          verified: boolean
          website: string
          years_experience: number
        }[]
      }
      get_secure_public_profile: {
        Args: { profile_user_id: string }
        Returns: {
          avatar_url: string
          bio: string
          company: string
          email: string
          first_name: string
          id: string
          last_name: string
          location: string
          meta_description: string
          meta_title: string
          phone: string
          professional_title: string
          rating: number
          review_count: number
          services: string[]
          skills: string[]
          slug: string
          social_links: Json
          user_id: string
          verified: boolean
          website: string
          years_experience: number
        }[]
      }
      get_secure_stakeholder_address: {
        Args: { show_full_address?: boolean; target_stakeholder_id: string }
        Returns: {
          address_line_1: string
          address_line_2: string
          city: string
          country: string
          id: string
          is_primary: boolean
          latitude: number
          longitude: number
          postal_code: string
          stakeholder_id: string
          state: string
          type: string
        }[]
      }
      get_security_config: {
        Args: Record<PropertyKey, never>
        Returns: Json
      }
      get_security_metrics: {
        Args: Record<PropertyKey, never>
        Returns: Json
      }
      get_security_overview: {
        Args: Record<PropertyKey, never>
        Returns: {
          current_value: number
          risk_level: string
          security_metric: string
        }[]
      }
      get_stakeholder_contacts_secure: {
        Args: {
          include_sensitive_data?: boolean
          target_stakeholder_id: string
        }
        Returns: {
          created_at: string
          email: string
          id: string
          is_preferred: boolean
          is_primary: boolean
          mobile: string
          name: string
          phone: string
          stakeholder_id: string
          title: string
        }[]
      }
      get_user_birth_date_secure: {
        Args: { target_user_id: string }
        Returns: string
      }
      get_user_companies: {
        Args: { target_user_id?: string }
        Returns: {
          id: string
          logo_url: string
          name: string
          role: string
          slug: string
          status: string
        }[]
      }
      get_user_company_ids: {
        Args: { target_user_id: string }
        Returns: string[]
      }
      get_user_company_memberships: {
        Args: { target_user_id: string }
        Returns: string[]
      }
      get_user_count: {
        Args: Record<PropertyKey, never>
        Returns: number
      }
      get_user_current_company_id: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      get_user_highest_role_level: {
        Args: { target_user_id: string }
        Returns: number
      }
      get_user_permissions_for_company: {
        Args: { target_company_id: string; target_user_id: string }
        Returns: {
          category: string
          description: string
          granted: boolean
          is_available: boolean
          name: string
          permission_key: string
        }[]
      }
      get_user_profile: {
        Args: { _user_id: string }
        Returns: {
          avatar_url: string
          email: string
          first_name: string
          id: string
          last_name: string
        }[]
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
          billing_cycle: string
          current_period_end: string
          features: string[]
          max_projects: number
          max_storage_gb: number
          max_team_members: number
          plan_description: string
          plan_name: string
          price_monthly: number
          price_yearly: number
          status: string
          subscription_id: string
          trial_ends_at: string
        }[]
      }
      handle_user_permission_upsert: {
        Args: {
          p_access_level: string
          p_company_id: string
          p_module_id: string
          p_sub_module_id: string
          p_user_id: string
        }
        Returns: undefined
      }
      has_role: {
        Args:
          | { _role: Database["public"]["Enums"]["app_role"]; _user_id: string }
          | { _role: string; _user_id: string }
        Returns: boolean
      }
      has_role_secure: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
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
      is_member_of_company: {
        Args: { target_company_id: string; target_user_id: string }
        Returns: boolean
      }
      is_platform_admin: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      is_project_accessible: {
        Args: { target_project_id: string; target_user_id: string }
        Returns: boolean
      }
      is_project_admin_secure: {
        Args: { target_project_id: string; target_user_id: string }
        Returns: boolean
      }
      is_project_member: {
        Args: { target_project_id: string; target_user_id: string }
        Returns: boolean
      }
      is_project_member_secure: {
        Args: { target_project_id: string; target_user_id: string }
        Returns: boolean
      }
      is_superadmin: {
        Args: { target_user_id?: string }
        Returns: boolean
      }
      is_user_company_admin: {
        Args: { target_company_id: string; target_user_id: string }
        Returns: boolean
      }
      is_user_member_of_company: {
        Args: { target_company_id: string; target_user_id: string }
        Returns: boolean
      }
      log_security_event: {
        Args: {
          event_type_param: string
          metadata_param?: Json
          severity_param?: string
          user_id_param?: string
        }
        Returns: string
      }
      log_user_action: {
        Args: {
          _action: string
          _metadata?: Json
          _resource_id?: string
          _resource_type: string
        }
        Returns: undefined
      }
      manage_user_role: {
        Args: {
          operation: string
          role_to_manage: Database["public"]["Enums"]["app_role"]
          target_user_id: string
        }
        Returns: Json
      }
      mask_contact_info: {
        Args: { input_text: string }
        Returns: string
      }
      mask_invitation_email: {
        Args: { invitation_email: string; requesting_user_id: string }
        Returns: string
      }
      mask_sensitive_data: {
        Args: {
          context_company_id: string
          input_value: string
          requesting_user_id: string
        }
        Returns: string
      }
      migrate_linked_tasks_to_predecessors: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      sanitize_user_input: {
        Args: { input_text: string }
        Returns: string
      }
      set_active_context: {
        Args: { p_context_id?: string; p_context_type: string }
        Returns: boolean
      }
      set_user_permissions: {
        Args: {
          permissions_data: Json
          target_company_id: string
          target_user_id: string
        }
        Returns: Json
      }
      set_user_primary_role: {
        Args: {
          new_role: Database["public"]["Enums"]["app_role"]
          target_user_id: string
        }
        Returns: Json
      }
      switch_user_company: {
        Args: { target_company_id: string; target_user_id: string }
        Returns: Json
      }
      track_first_login: {
        Args: { target_user_id: string }
        Returns: undefined
      }
      update_calendar_tokens: {
        Args: {
          integration_id: string
          new_access_token: string
          new_expires_at?: string
          new_refresh_token?: string
        }
        Returns: boolean
      }
      use_access_token: {
        Args: { token_value: string }
        Returns: {
          error: string
          success: boolean
          token_type: string
          user_id: string
        }[]
      }
      user_can_access_project_direct: {
        Args: { project_id_param: string; user_id_param: string }
        Returns: boolean
      }
      user_can_view_lead_contacts: {
        Args: { company_id: string; user_id: string }
        Returns: boolean
      }
      user_has_permission: {
        Args: {
          permission_key_param: string
          target_company_id: string
          target_user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      access_level: "private_to_members" | "public" | "restricted"
      app_role:
        | "superadmin"
        | "business_admin"
        | "project_admin"
        | "user"
        | "client"
        | "platform_admin"
        | "company_admin"
      approval_decision: "approved" | "rejected"
      bill_status:
        | "draft"
        | "submitted"
        | "approved"
        | "scheduled"
        | "paid"
        | "void"
      business_type: "sole_trader" | "partnership" | "company" | "trust"
      compliance_status: "valid" | "expired" | "expiring"
      document_status_enum:
        | "issue_for_review"
        | "issue_for_approval"
        | "issue_for_construction"
        | "issue_for_use"
        | "void"
      file_kind: "invoice_pdf" | "receipt" | "bill_pdf" | "other"
      invoice_status:
        | "draft"
        | "sent"
        | "part_paid"
        | "paid"
        | "overdue"
        | "void"
      knowledge_type: "business" | "industry" | "project"
      member_role: "project_admin" | "editor" | "viewer" | "guest"
      payment_method: "bank_transfer" | "check" | "cash" | "card" | "other"
      stakeholder_category:
        | "client"
        | "trade"
        | "subcontractor"
        | "supplier"
        | "consultant"
      stakeholder_status: "active" | "inactive" | "pending"
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
        "business_admin",
        "project_admin",
        "user",
        "client",
        "platform_admin",
        "company_admin",
      ],
      approval_decision: ["approved", "rejected"],
      bill_status: [
        "draft",
        "submitted",
        "approved",
        "scheduled",
        "paid",
        "void",
      ],
      business_type: ["sole_trader", "partnership", "company", "trust"],
      compliance_status: ["valid", "expired", "expiring"],
      document_status_enum: [
        "issue_for_review",
        "issue_for_approval",
        "issue_for_construction",
        "issue_for_use",
        "void",
      ],
      file_kind: ["invoice_pdf", "receipt", "bill_pdf", "other"],
      invoice_status: ["draft", "sent", "part_paid", "paid", "overdue", "void"],
      knowledge_type: ["business", "industry", "project"],
      member_role: ["project_admin", "editor", "viewer", "guest"],
      payment_method: ["bank_transfer", "check", "cash", "card", "other"],
      stakeholder_category: [
        "client",
        "trade",
        "subcontractor",
        "supplier",
        "consultant",
      ],
      stakeholder_status: ["active", "inactive", "pending"],
    },
  },
} as const
