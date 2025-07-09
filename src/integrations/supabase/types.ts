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
      digital_objects: {
        Row: {
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
      member_permissions: {
        Row: {
          allowed: boolean
          created_at: string
          id: string
          member_id: string
          permission_type: string
        }
        Insert: {
          allowed?: boolean
          created_at?: string
          id?: string
          member_id: string
          permission_type: string
        }
        Update: {
          allowed?: boolean
          created_at?: string
          id?: string
          member_id?: string
          permission_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "member_permissions_member_id_fkey"
            columns: ["member_id"]
            isOneToOne: false
            referencedRelation: "team_members"
            referencedColumns: ["id"]
          },
        ]
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
      profiles: {
        Row: {
          avatar_url: string | null
          bio: string | null
          birth_date: string | null
          company: string | null
          company_slogan: string | null
          created_at: string
          email: string | null
          first_name: string | null
          id: string
          job_title: string | null
          last_name: string | null
          location: string | null
          phone: string | null
          status: string
          updated_at: string
          user_id: string | null
          website: string | null
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          birth_date?: string | null
          company?: string | null
          company_slogan?: string | null
          created_at?: string
          email?: string | null
          first_name?: string | null
          id?: string
          job_title?: string | null
          last_name?: string | null
          location?: string | null
          phone?: string | null
          status?: string
          updated_at?: string
          user_id?: string | null
          website?: string | null
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          birth_date?: string | null
          company?: string | null
          company_slogan?: string | null
          created_at?: string
          email?: string | null
          first_name?: string | null
          id?: string
          job_title?: string | null
          last_name?: string | null
          location?: string | null
          phone?: string | null
          status?: string
          updated_at?: string
          user_id?: string | null
          website?: string | null
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
      projects: {
        Row: {
          contract_price: string | null
          created_at: string
          deadline: string | null
          description: string | null
          id: string
          location: string | null
          name: string
          priority: string | null
          project_id: string
          start_date: string | null
          status: string | null
          updated_at: string
        }
        Insert: {
          contract_price?: string | null
          created_at?: string
          deadline?: string | null
          description?: string | null
          id?: string
          location?: string | null
          name: string
          priority?: string | null
          project_id: string
          start_date?: string | null
          status?: string | null
          updated_at?: string
        }
        Update: {
          contract_price?: string | null
          created_at?: string
          deadline?: string | null
          description?: string | null
          id?: string
          location?: string | null
          name?: string
          priority?: string | null
          project_id?: string
          start_date?: string | null
          status?: string | null
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
      tasks: {
        Row: {
          assigned_to_avatar: string | null
          assigned_to_name: string | null
          category: string | null
          created_at: string
          description: string | null
          digital_object_id: string | null
          due_date: string | null
          duration: number | null
          id: string
          priority: string
          progress: number
          project_id: string
          status: string
          task_name: string
          updated_at: string
        }
        Insert: {
          assigned_to_avatar?: string | null
          assigned_to_name?: string | null
          category?: string | null
          created_at?: string
          description?: string | null
          digital_object_id?: string | null
          due_date?: string | null
          duration?: number | null
          id?: string
          priority?: string
          progress?: number
          project_id: string
          status?: string
          task_name: string
          updated_at?: string
        }
        Update: {
          assigned_to_avatar?: string | null
          assigned_to_name?: string | null
          category?: string | null
          created_at?: string
          description?: string | null
          digital_object_id?: string | null
          due_date?: string | null
          duration?: number | null
          id?: string
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
      team_invitations: {
        Row: {
          created_at: string
          email: string
          expires_at: string
          id: string
          invited_by_email: string
          project_id: string
          token: string
          used_at: string | null
        }
        Insert: {
          created_at?: string
          email: string
          expires_at?: string
          id?: string
          invited_by_email: string
          project_id: string
          token?: string
          used_at?: string | null
        }
        Update: {
          created_at?: string
          email?: string
          expires_at?: string
          id?: string
          invited_by_email?: string
          project_id?: string
          token?: string
          used_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "team_invitations_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      team_members: {
        Row: {
          avatar_url: string | null
          created_at: string
          email: string
          id: string
          invited_at: string
          invited_by: string | null
          joined_at: string | null
          name: string | null
          notify_on_task_added: boolean | null
          project_id: string
          role: Database["public"]["Enums"]["member_role"]
          status: string
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          email: string
          id?: string
          invited_at?: string
          invited_by?: string | null
          joined_at?: string | null
          name?: string | null
          notify_on_task_added?: boolean | null
          project_id: string
          role?: Database["public"]["Enums"]["member_role"]
          status?: string
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          email?: string
          id?: string
          invited_at?: string
          invited_by?: string | null
          joined_at?: string | null
          name?: string | null
          notify_on_task_added?: boolean | null
          project_id?: string
          role?: Database["public"]["Enums"]["member_role"]
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "team_members_project_id_fkey"
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
      user_invitations: {
        Row: {
          created_at: string
          email: string
          expires_at: string
          id: string
          invited_by_user_id: string
          invited_role: Database["public"]["Enums"]["user_role"]
          token: string
          used_at: string | null
        }
        Insert: {
          created_at?: string
          email: string
          expires_at?: string
          id?: string
          invited_by_user_id: string
          invited_role?: Database["public"]["Enums"]["user_role"]
          token?: string
          used_at?: string | null
        }
        Update: {
          created_at?: string
          email?: string
          expires_at?: string
          id?: string
          invited_by_user_id?: string
          invited_role?: Database["public"]["Enums"]["user_role"]
          token?: string
          used_at?: string | null
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string | null
          id: string
          role: Database["public"]["Enums"]["user_role"]
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      wbs_items: {
        Row: {
          actual_cost: number | null
          assigned_to: string | null
          budgeted_cost: number | null
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
      get_user_role: {
        Args: { user_id: string }
        Returns: Database["public"]["Enums"]["user_role"]
      }
      is_superadmin: {
        Args: { user_id: string }
        Returns: boolean
      }
    }
    Enums: {
      access_level: "private_to_members" | "public" | "restricted"
      member_role: "project_admin" | "editor" | "viewer" | "guest"
      user_role:
        | "superadmin"
        | "admin"
        | "user"
        | "project_manager"
        | "project_admin"
        | "consultant"
        | "subcontractor"
        | "estimator"
        | "accounts"
        | "client_viewer"
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
      member_role: ["project_admin", "editor", "viewer", "guest"],
      user_role: [
        "superadmin",
        "admin",
        "user",
        "project_manager",
        "project_admin",
        "consultant",
        "subcontractor",
        "estimator",
        "accounts",
        "client_viewer",
      ],
    },
  },
} as const
