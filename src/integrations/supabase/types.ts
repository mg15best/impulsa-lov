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
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      asesoramientos: {
        Row: {
          acta: string | null
          compromisos: string | null
          created_at: string
          created_by: string | null
          duracion_minutos: number | null
          empresa_id: string
          estado: Database["public"]["Enums"]["estado_asesoramiento"]
          fecha: string
          hora_inicio: string | null
          id: string
          informe_generado: boolean | null
          proximos_pasos: string | null
          tecnico_id: string
          tema: string | null
          updated_at: string
        }
        Insert: {
          acta?: string | null
          compromisos?: string | null
          created_at?: string
          created_by?: string | null
          duracion_minutos?: number | null
          empresa_id: string
          estado?: Database["public"]["Enums"]["estado_asesoramiento"]
          fecha: string
          hora_inicio?: string | null
          id?: string
          informe_generado?: boolean | null
          proximos_pasos?: string | null
          tecnico_id: string
          tema?: string | null
          updated_at?: string
        }
        Update: {
          acta?: string | null
          compromisos?: string | null
          created_at?: string
          created_by?: string | null
          duracion_minutos?: number | null
          empresa_id?: string
          estado?: Database["public"]["Enums"]["estado_asesoramiento"]
          fecha?: string
          hora_inicio?: string | null
          id?: string
          informe_generado?: boolean | null
          proximos_pasos?: string | null
          tecnico_id?: string
          tema?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "asesoramientos_empresa_id_fkey"
            columns: ["empresa_id"]
            isOneToOne: false
            referencedRelation: "empresas"
            referencedColumns: ["id"]
          },
        ]
      }
      contactos: {
        Row: {
          cargo: string | null
          created_at: string
          created_by: string | null
          email: string | null
          empresa_id: string
          es_principal: boolean | null
          id: string
          nombre: string
          notas: string | null
          telefono: string | null
          updated_at: string
        }
        Insert: {
          cargo?: string | null
          created_at?: string
          created_by?: string | null
          email?: string | null
          empresa_id: string
          es_principal?: boolean | null
          id?: string
          nombre: string
          notas?: string | null
          telefono?: string | null
          updated_at?: string
        }
        Update: {
          cargo?: string | null
          created_at?: string
          created_by?: string | null
          email?: string | null
          empresa_id?: string
          es_principal?: boolean | null
          id?: string
          nombre?: string
          notas?: string | null
          telefono?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "contactos_empresa_id_fkey"
            columns: ["empresa_id"]
            isOneToOne: false
            referencedRelation: "empresas"
            referencedColumns: ["id"]
          },
        ]
      }
      empresas: {
        Row: {
          cif: string | null
          codigo_estado_pipeline: string | null
          codigo_motivo_cierre: string | null
          codigo_origen_lead: string | null
          codigo_postal: string | null
          contacto_principal: string | null
          created_at: string
          created_by: string | null
          descripcion: string | null
          direccion: string | null
          email: string | null
          es_caso_exito: boolean | null
          estado: Database["public"]["Enums"]["estado_empresa"]
          fase_madurez: Database["public"]["Enums"]["fase_madurez"]
          fecha_constitucion: string | null
          fecha_finalizacion: string | null
          fecha_inicio: string | null
          fecha_recepcion_diagnostico: string | null
          forma_juridica: string | null
          id: string
          isla: string | null
          municipio: string | null
          nombre: string
          nombre_comercial: string | null
          redes_sociales: Json | null
          resumen_diagnostico: string | null
          sector: Database["public"]["Enums"]["sector_empresa"]
          subsector: string | null
          tecnico_asignado_id: string | null
          telefono: string | null
          updated_at: string
          url_formulario_diagnostico: string | null
          web: string | null
        }
        Insert: {
          cif?: string | null
          codigo_estado_pipeline?: string | null
          codigo_motivo_cierre?: string | null
          codigo_origen_lead?: string | null
          codigo_postal?: string | null
          contacto_principal?: string | null
          created_at?: string
          created_by?: string | null
          descripcion?: string | null
          direccion?: string | null
          email?: string | null
          es_caso_exito?: boolean | null
          estado?: Database["public"]["Enums"]["estado_empresa"]
          fase_madurez?: Database["public"]["Enums"]["fase_madurez"]
          fecha_constitucion?: string | null
          fecha_finalizacion?: string | null
          fecha_inicio?: string | null
          fecha_recepcion_diagnostico?: string | null
          forma_juridica?: string | null
          id?: string
          isla?: string | null
          municipio?: string | null
          nombre: string
          nombre_comercial?: string | null
          redes_sociales?: Json | null
          resumen_diagnostico?: string | null
          sector?: Database["public"]["Enums"]["sector_empresa"]
          subsector?: string | null
          tecnico_asignado_id?: string | null
          telefono?: string | null
          updated_at?: string
          url_formulario_diagnostico?: string | null
          web?: string | null
        }
        Update: {
          cif?: string | null
          codigo_estado_pipeline?: string | null
          codigo_motivo_cierre?: string | null
          codigo_origen_lead?: string | null
          codigo_postal?: string | null
          contacto_principal?: string | null
          created_at?: string
          created_by?: string | null
          descripcion?: string | null
          direccion?: string | null
          email?: string | null
          es_caso_exito?: boolean | null
          estado?: Database["public"]["Enums"]["estado_empresa"]
          fase_madurez?: Database["public"]["Enums"]["fase_madurez"]
          fecha_constitucion?: string | null
          fecha_finalizacion?: string | null
          fecha_inicio?: string | null
          fecha_recepcion_diagnostico?: string | null
          forma_juridica?: string | null
          id?: string
          isla?: string | null
          municipio?: string | null
          nombre?: string
          nombre_comercial?: string | null
          redes_sociales?: Json | null
          resumen_diagnostico?: string | null
          sector?: Database["public"]["Enums"]["sector_empresa"]
          subsector?: string | null
          tecnico_asignado_id?: string | null
          telefono?: string | null
          updated_at?: string
          url_formulario_diagnostico?: string | null
          web?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          email: string
          full_name: string | null
          id: string
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          email: string
          full_name?: string | null
          id: string
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          email?: string
          full_name?: string | null
          id?: string
          updated_at?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      eventos: {
        Row: {
          id: string
          nombre: string
          tipo: Database["public"]["Enums"]["tipo_evento"]
          estado: Database["public"]["Enums"]["estado_evento"]
          fecha: string | null
          hora_inicio: string | null
          duracion_minutos: number | null
          ubicacion: string | null
          descripcion: string | null
          ponentes: string | null
          asistentes_esperados: number | null
          asistentes_confirmados: number | null
          observaciones: string | null
          empresa_id: string | null
          created_by: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          nombre: string
          tipo?: Database["public"]["Enums"]["tipo_evento"]
          estado?: Database["public"]["Enums"]["estado_evento"]
          fecha?: string | null
          hora_inicio?: string | null
          duracion_minutos?: number | null
          ubicacion?: string | null
          descripcion?: string | null
          ponentes?: string | null
          asistentes_esperados?: number | null
          asistentes_confirmados?: number | null
          observaciones?: string | null
          empresa_id?: string | null
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          nombre?: string
          tipo?: Database["public"]["Enums"]["tipo_evento"]
          estado?: Database["public"]["Enums"]["estado_evento"]
          fecha?: string | null
          hora_inicio?: string | null
          duracion_minutos?: number | null
          ubicacion?: string | null
          descripcion?: string | null
          ponentes?: string | null
          asistentes_esperados?: number | null
          asistentes_confirmados?: number | null
          observaciones?: string | null
          empresa_id?: string | null
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "eventos_empresa_id_fkey"
            columns: ["empresa_id"]
            isOneToOne: false
            referencedRelation: "empresas"
            referencedColumns: ["id"]
          },
        ]
      }
      formaciones: {
        Row: {
          id: string
          titulo: string
          tipo: Database["public"]["Enums"]["tipo_formacion"]
          estado: Database["public"]["Enums"]["estado_formacion"]
          fecha_inicio: string | null
          fecha_fin: string | null
          duracion_horas: number | null
          formador: string | null
          descripcion: string | null
          objetivos: string | null
          contenido: string | null
          participantes_max: number | null
          participantes_inscritos: number | null
          modalidad: string | null
          ubicacion: string | null
          materiales: string | null
          observaciones: string | null
          created_by: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          titulo: string
          tipo?: Database["public"]["Enums"]["tipo_formacion"]
          estado?: Database["public"]["Enums"]["estado_formacion"]
          fecha_inicio?: string | null
          fecha_fin?: string | null
          duracion_horas?: number | null
          formador?: string | null
          descripcion?: string | null
          objetivos?: string | null
          contenido?: string | null
          participantes_max?: number | null
          participantes_inscritos?: number | null
          modalidad?: string | null
          ubicacion?: string | null
          materiales?: string | null
          observaciones?: string | null
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          titulo?: string
          tipo?: Database["public"]["Enums"]["tipo_formacion"]
          estado?: Database["public"]["Enums"]["estado_formacion"]
          fecha_inicio?: string | null
          fecha_fin?: string | null
          duracion_horas?: number | null
          formador?: string | null
          descripcion?: string | null
          objetivos?: string | null
          contenido?: string | null
          participantes_max?: number | null
          participantes_inscritos?: number | null
          modalidad?: string | null
          ubicacion?: string | null
          materiales?: string | null
          observaciones?: string | null
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      evidencias: {
        Row: {
          id: string
          titulo: string
          tipo: Database["public"]["Enums"]["tipo_evidencia"]
          descripcion: string | null
          fecha: string
          archivo_url: string | null
          archivo_nombre: string | null
          empresa_id: string | null
          evento_id: string | null
          formacion_id: string | null
          asesoramiento_id: string | null
          observaciones: string | null
          created_by: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          titulo: string
          tipo?: Database["public"]["Enums"]["tipo_evidencia"]
          descripcion?: string | null
          fecha?: string
          archivo_url?: string | null
          archivo_nombre?: string | null
          empresa_id?: string | null
          evento_id?: string | null
          formacion_id?: string | null
          asesoramiento_id?: string | null
          observaciones?: string | null
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          titulo?: string
          tipo?: Database["public"]["Enums"]["tipo_evidencia"]
          descripcion?: string | null
          fecha?: string
          archivo_url?: string | null
          archivo_nombre?: string | null
          empresa_id?: string | null
          evento_id?: string | null
          formacion_id?: string | null
          asesoramiento_id?: string | null
          observaciones?: string | null
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "evidencias_empresa_id_fkey"
            columns: ["empresa_id"]
            isOneToOne: false
            referencedRelation: "empresas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "evidencias_evento_id_fkey"
            columns: ["evento_id"]
            isOneToOne: false
            referencedRelation: "eventos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "evidencias_formacion_id_fkey"
            columns: ["formacion_id"]
            isOneToOne: false
            referencedRelation: "formaciones"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "evidencias_asesoramiento_id_fkey"
            columns: ["asesoramiento_id"]
            isOneToOne: false
            referencedRelation: "asesoramientos"
            referencedColumns: ["id"]
          },
        ]
      }
      colaboradores: {
        Row: {
          id: string
          nombre: string
          tipo: Database["public"]["Enums"]["tipo_colaborador"]
          estado: Database["public"]["Enums"]["estado_colaborador"]
          cif: string | null
          descripcion: string | null
          direccion: string | null
          telefono: string | null
          email: string | null
          web: string | null
          contacto_principal: string | null
          cargo_contacto: string | null
          email_contacto: string | null
          telefono_contacto: string | null
          fecha_inicio_colaboracion: string | null
          ambito_colaboracion: string | null
          convenio_firmado: boolean | null
          observaciones: string | null
          codigo_alcance: string | null
          sectores_interes: string[] | null
          tipos_apoyo: string[] | null
          codigo_rango_ticket: string | null
          requisitos_habituales: string | null
          asignado_a: string | null
          created_by: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          nombre: string
          tipo?: Database["public"]["Enums"]["tipo_colaborador"]
          estado?: Database["public"]["Enums"]["estado_colaborador"]
          cif?: string | null
          descripcion?: string | null
          direccion?: string | null
          telefono?: string | null
          email?: string | null
          web?: string | null
          contacto_principal?: string | null
          cargo_contacto?: string | null
          email_contacto?: string | null
          telefono_contacto?: string | null
          fecha_inicio_colaboracion?: string | null
          ambito_colaboracion?: string | null
          convenio_firmado?: boolean | null
          observaciones?: string | null
          codigo_alcance?: string | null
          sectores_interes?: string[] | null
          tipos_apoyo?: string[] | null
          codigo_rango_ticket?: string | null
          requisitos_habituales?: string | null
          asignado_a?: string | null
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          nombre?: string
          tipo?: Database["public"]["Enums"]["tipo_colaborador"]
          estado?: Database["public"]["Enums"]["estado_colaborador"]
          cif?: string | null
          descripcion?: string | null
          direccion?: string | null
          telefono?: string | null
          email?: string | null
          web?: string | null
          contacto_principal?: string | null
          cargo_contacto?: string | null
          email_contacto?: string | null
          telefono_contacto?: string | null
          fecha_inicio_colaboracion?: string | null
          ambito_colaboracion?: string | null
          convenio_firmado?: boolean | null
          observaciones?: string | null
          codigo_alcance?: string | null
          sectores_interes?: string[] | null
          tipos_apoyo?: string[] | null
          codigo_rango_ticket?: string | null
          requisitos_habituales?: string | null
          asignado_a?: string | null
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_admin: { Args: { _user_id: string }; Returns: boolean }
    }
    Enums: {
      app_role: "admin" | "tecnico" | "auditor" | "it"
      estado_asesoramiento:
        | "programado"
        | "en_curso"
        | "completado"
        | "cancelado"
      estado_empresa: "pendiente" | "en_proceso" | "asesorada" | "completada"
      fase_madurez: "idea" | "validacion" | "crecimiento" | "consolidacion"
      sector_empresa:
        | "tecnologia"
        | "industria"
        | "servicios"
        | "comercio"
        | "turismo"
        | "energia"
        | "construccion"
        | "agroalimentario"
        | "otro"
      tipo_evento:
        | "taller"
        | "seminario"
        | "networking"
        | "conferencia"
        | "presentacion"
        | "otro"
      estado_evento:
        | "planificado"
        | "confirmado"
        | "en_curso"
        | "completado"
        | "cancelado"
      tipo_formacion:
        | "pildora_formativa"
        | "curso"
        | "masterclass"
        | "webinar"
        | "otro"
      estado_formacion:
        | "planificada"
        | "en_curso"
        | "completada"
        | "cancelada"
      tipo_evidencia:
        | "informe"
        | "acta"
        | "fotografia"
        | "video"
        | "certificado"
        | "documento"
        | "otro"
      tipo_colaborador:
        | "entidad_publica"
        | "entidad_privada"
        | "asociacion"
        | "universidad"
        | "centro_investigacion"
        | "otro"
      estado_colaborador:
        | "activo"
        | "inactivo"
        | "pendiente"
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
      app_role: ["admin", "tecnico"],
      estado_asesoramiento: [
        "programado",
        "en_curso",
        "completado",
        "cancelado",
      ],
      estado_empresa: ["pendiente", "en_proceso", "asesorada", "completada"],
      fase_madurez: ["idea", "validacion", "crecimiento", "consolidacion"],
      sector_empresa: [
        "tecnologia",
        "industria",
        "servicios",
        "comercio",
        "turismo",
        "energia",
        "construccion",
        "agroalimentario",
        "otro",
      ],
      tipo_evento: [
        "taller",
        "seminario",
        "networking",
        "conferencia",
        "presentacion",
        "otro",
      ],
      estado_evento: [
        "planificado",
        "confirmado",
        "en_curso",
        "completado",
        "cancelado",
      ],
      tipo_formacion: [
        "pildora_formativa",
        "curso",
        "masterclass",
        "webinar",
        "otro",
      ],
      estado_formacion: [
        "planificada",
        "en_curso",
        "completada",
        "cancelada",
      ],
      tipo_evidencia: [
        "informe",
        "acta",
        "fotografia",
        "video",
        "certificado",
        "documento",
        "otro",
      ],
      tipo_colaborador: [
        "entidad_publica",
        "entidad_privada",
        "asociacion",
        "universidad",
        "centro_investigacion",
        "otro",
      ],
      estado_colaborador: ["activo", "inactivo", "pendiente"],
    },
  },
} as const
