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
      agendamentos: {
        Row: {
          closer_id: string | null
          closer_nome: string | null
          created_at: string | null
          data_agendamento: string
          id: string
          lead_nome: string | null
          observacao: string | null
          origem: string | null
          qualificado: boolean | null
          sdr_id: string | null
          sdr_nome: string
          status: string | null
        }
        Insert: {
          closer_id?: string | null
          closer_nome?: string | null
          created_at?: string | null
          data_agendamento: string
          id?: string
          lead_nome?: string | null
          observacao?: string | null
          origem?: string | null
          qualificado?: boolean | null
          sdr_id?: string | null
          sdr_nome: string
          status?: string | null
        }
        Update: {
          closer_id?: string | null
          closer_nome?: string | null
          created_at?: string | null
          data_agendamento?: string
          id?: string
          lead_nome?: string | null
          observacao?: string | null
          origem?: string | null
          qualificado?: boolean | null
          sdr_id?: string | null
          sdr_nome?: string
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "agendamentos_closer_id_fkey"
            columns: ["closer_id"]
            isOneToOne: false
            referencedRelation: "colaboradores"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "agendamentos_sdr_id_fkey"
            columns: ["sdr_id"]
            isOneToOne: false
            referencedRelation: "colaboradores"
            referencedColumns: ["id"]
          },
        ]
      }
      colaboradores: {
        Row: {
          ativo: boolean | null
          created_at: string | null
          id: string
          nome: string
          squad: string | null
          tipo: string
        }
        Insert: {
          ativo?: boolean | null
          created_at?: string | null
          id?: string
          nome: string
          squad?: string | null
          tipo: string
        }
        Update: {
          ativo?: boolean | null
          created_at?: string | null
          id?: string
          nome?: string
          squad?: string | null
          tipo?: string
        }
        Relationships: []
      }
      leads_crm: {
        Row: {
          closer_nome: string | null
          created_at: string | null
          data_closer: string | null
          data_entrada: string | null
          data_ganho: string | null
          data_mql: string | null
          data_perdido: string | null
          data_reuniao: string | null
          email: string | null
          empresa: string | null
          id: string
          is_mql: boolean | null
          kommo_id: number
          kommo_payload: Json | null
          motivo_perda: string | null
          nome: string | null
          pipeline_nome: string | null
          responsavel_id: number | null
          responsavel_nome: string | null
          sdr_nome: string | null
          stage_nome: string | null
          status: string
          tags: string[] | null
          telefone: string | null
          updated_at: string | null
          valor_contrato: number | null
        }
        Insert: {
          closer_nome?: string | null
          created_at?: string | null
          data_closer?: string | null
          data_entrada?: string | null
          data_ganho?: string | null
          data_mql?: string | null
          data_perdido?: string | null
          data_reuniao?: string | null
          email?: string | null
          empresa?: string | null
          id?: string
          is_mql?: boolean | null
          kommo_id: number
          kommo_payload?: Json | null
          motivo_perda?: string | null
          nome?: string | null
          pipeline_nome?: string | null
          responsavel_id?: number | null
          responsavel_nome?: string | null
          sdr_nome?: string | null
          stage_nome?: string | null
          status?: string
          tags?: string[] | null
          telefone?: string | null
          updated_at?: string | null
          valor_contrato?: number | null
        }
        Update: {
          closer_nome?: string | null
          created_at?: string | null
          data_closer?: string | null
          data_entrada?: string | null
          data_ganho?: string | null
          data_mql?: string | null
          data_perdido?: string | null
          data_reuniao?: string | null
          email?: string | null
          empresa?: string | null
          id?: string
          is_mql?: boolean | null
          kommo_id?: number
          kommo_payload?: Json | null
          motivo_perda?: string | null
          nome?: string | null
          pipeline_nome?: string | null
          responsavel_id?: number | null
          responsavel_nome?: string | null
          sdr_nome?: string | null
          stage_nome?: string | null
          status?: string
          tags?: string[] | null
          telefone?: string | null
          updated_at?: string | null
          valor_contrato?: number | null
        }
        Relationships: []
      }
      leads_crm_historico: {
        Row: {
          campo_alterado: string | null
          created_at: string | null
          id: string
          kommo_id: number | null
          lead_id: string | null
          status_anterior: string | null
          status_novo: string | null
          valor_anterior: string | null
          valor_novo: string | null
        }
        Insert: {
          campo_alterado?: string | null
          created_at?: string | null
          id?: string
          kommo_id?: number | null
          lead_id?: string | null
          status_anterior?: string | null
          status_novo?: string | null
          valor_anterior?: string | null
          valor_novo?: string | null
        }
        Update: {
          campo_alterado?: string | null
          created_at?: string | null
          id?: string
          kommo_id?: number | null
          lead_id?: string | null
          status_anterior?: string | null
          status_novo?: string | null
          valor_anterior?: string | null
          valor_novo?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "leads_crm_historico_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads_crm"
            referencedColumns: ["id"]
          },
        ]
      }
      metas_mensais: {
        Row: {
          created_at: string | null
          id: string
          mes: string
          meta_individual_closer: number | null
          meta_mensal: number
          meta_taxa_conversao: number | null
          meta_taxa_qualificacao_sdr: number | null
          meta_taxa_show_sdr: number | null
          meta_ticket_medio: number | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          mes: string
          meta_individual_closer?: number | null
          meta_mensal?: number
          meta_taxa_conversao?: number | null
          meta_taxa_qualificacao_sdr?: number | null
          meta_taxa_show_sdr?: number | null
          meta_ticket_medio?: number | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          mes?: string
          meta_individual_closer?: number | null
          meta_mensal?: number
          meta_taxa_conversao?: number | null
          meta_taxa_qualificacao_sdr?: number | null
          meta_taxa_show_sdr?: number | null
          meta_ticket_medio?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string | null
          id: string
          nome: string | null
          updated_at: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          id: string
          nome?: string | null
          updated_at?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          id?: string
          nome?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      vendas: {
        Row: {
          colaborador_id: string | null
          colaborador_nome: string
          created_at: string | null
          data_fechamento: string
          id: string
          lead_nome: string | null
          observacao: string | null
          origem: string
          valor: number
        }
        Insert: {
          colaborador_id?: string | null
          colaborador_nome: string
          created_at?: string | null
          data_fechamento?: string
          id?: string
          lead_nome?: string | null
          observacao?: string | null
          origem: string
          valor: number
        }
        Update: {
          colaborador_id?: string | null
          colaborador_nome?: string
          created_at?: string | null
          data_fechamento?: string
          id?: string
          lead_nome?: string | null
          observacao?: string | null
          origem?: string
          valor?: number
        }
        Relationships: [
          {
            foreignKeyName: "vendas_colaborador_id_fkey"
            columns: ["colaborador_id"]
            isOneToOne: false
            referencedRelation: "colaboradores"
            referencedColumns: ["id"]
          },
        ]
      }
      workspace_members: {
        Row: {
          created_at: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
          workspace_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id: string
          workspace_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "workspace_members_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      workspaces: {
        Row: {
          ativo: boolean | null
          configuracoes: Json | null
          created_at: string | null
          id: string
          nome: string
          plano: string | null
          slug: string
          updated_at: string | null
        }
        Insert: {
          ativo?: boolean | null
          configuracoes?: Json | null
          created_at?: string | null
          id?: string
          nome: string
          plano?: string | null
          slug: string
          updated_at?: string | null
        }
        Update: {
          ativo?: boolean | null
          configuracoes?: Json | null
          created_at?: string | null
          id?: string
          nome?: string
          plano?: string | null
          slug?: string
          updated_at?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_user_role: {
        Args: { _workspace_id: string }
        Returns: Database["public"]["Enums"]["app_role"]
      }
      get_user_workspaces: { Args: never; Returns: string[] }
      has_workspace_access: {
        Args: {
          _min_role?: Database["public"]["Enums"]["app_role"]
          _workspace_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "owner" | "admin" | "editor" | "viewer"
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
      app_role: ["owner", "admin", "editor", "viewer"],
    },
  },
} as const
