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
      attachments: {
        Row: {
          id: string
          owner_type: Database["public"]["Enums"]["attachment_owner_type"]
          owner_id: string
          file_name: string
          file_url: string
          file_size: number | null
          mime_type: string | null
          title: string | null
          description: string | null
          category: Database["public"]["Enums"]["attachment_category"]
          tags: string[] | null
          is_public: boolean | null
          created_by: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          owner_type: Database["public"]["Enums"]["attachment_owner_type"]
          owner_id: string
          file_name: string
          file_url: string
          file_size?: number | null
          mime_type?: string | null
          title?: string | null
          description?: string | null
          category?: Database["public"]["Enums"]["attachment_category"]
          tags?: string[] | null
          is_public?: boolean | null
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          owner_type?: Database["public"]["Enums"]["attachment_owner_type"]
          owner_id?: string
          file_name?: string
          file_url?: string
          file_size?: number | null
          mime_type?: string | null
          title?: string | null
          description?: string | null
          category?: Database["public"]["Enums"]["attachment_category"]
          tags?: string[] | null
          is_public?: boolean | null
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
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
      action_plans: {
        Row: {
          id: string
          company_id: string
          title: string
          description: string | null
          status_code: string
          category_code: string | null
          priority_code: string | null
          start_date: string | null
          end_date: string | null
          progress: number | null
          responsible_user_id: string | null
          notes: string | null
          created_by: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          company_id: string
          title: string
          description?: string | null
          status_code?: string
          category_code?: string | null
          priority_code?: string | null
          start_date?: string | null
          end_date?: string | null
          progress?: number | null
          responsible_user_id?: string | null
          notes?: string | null
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          company_id?: string
          title?: string
          description?: string | null
          status_code?: string
          category_code?: string | null
          priority_code?: string | null
          start_date?: string | null
          end_date?: string | null
          progress?: number | null
          responsible_user_id?: string | null
          notes?: string | null
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "action_plans_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "empresas"
            referencedColumns: ["id"]
          },
        ]
      }
      action_plan_items: {
        Row: {
          id: string
          action_plan_id: string
          title: string
          description: string | null
          status_code: string
          priority_code: string | null
          due_date: string | null
          completed_date: string | null
          assigned_to_id: string | null
          order_index: number | null
          notes: string | null
          created_by: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          action_plan_id: string
          title: string
          description?: string | null
          status_code?: string
          priority_code?: string | null
          due_date?: string | null
          completed_date?: string | null
          assigned_to_id?: string | null
          order_index?: number | null
          notes?: string | null
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          action_plan_id?: string
          title?: string
          description?: string | null
          status_code?: string
          priority_code?: string | null
          due_date?: string | null
          completed_date?: string | null
          assigned_to_id?: string | null
          order_index?: number | null
          notes?: string | null
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "action_plan_items_action_plan_id_fkey"
            columns: ["action_plan_id"]
            isOneToOne: false
            referencedRelation: "action_plans"
            referencedColumns: ["id"]
          },
        ]
      }
      company_compliance: {
        Row: {
          id: string
          company_id: string
          data_protection_consent: boolean | null
          data_consent_date: string | null
          image_rights_consent: boolean | null
          image_consent_date: string | null
          created_at: string
          updated_at: string
          created_by: string | null
          updated_by: string | null
        }
        Insert: {
          id?: string
          company_id: string
          data_protection_consent?: boolean | null
          data_consent_date?: string | null
          image_rights_consent?: boolean | null
          image_consent_date?: string | null
          created_at?: string
          updated_at?: string
          created_by?: string | null
          updated_by?: string | null
        }
        Update: {
          id?: string
          company_id?: string
          data_protection_consent?: boolean | null
          data_consent_date?: string | null
          image_rights_consent?: boolean | null
          image_consent_date?: string | null
          created_at?: string
          updated_at?: string
          created_by?: string | null
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "company_compliance_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: true
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
      reports: {
        Row: {
          id: string
          company_id: string
          title: string
          description: string | null
          status_code: string
          report_type_code: string | null
          report_date: string | null
          content: string | null
          conclusions: string | null
          recommendations: string | null
          responsible_user_id: string | null
          notes: string | null
          created_by: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          company_id: string
          title: string
          description?: string | null
          status_code?: string
          report_type_code?: string | null
          report_date?: string | null
          content?: string | null
          conclusions?: string | null
          recommendations?: string | null
          responsible_user_id?: string | null
          notes?: string | null
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          company_id?: string
          title?: string
          description?: string | null
          status_code?: string
          report_type_code?: string | null
          report_date?: string | null
          content?: string | null
          conclusions?: string | null
          recommendations?: string | null
          responsible_user_id?: string | null
          notes?: string | null
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "reports_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "empresas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reports_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reports_responsible_user_id_fkey"
            columns: ["responsible_user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
      opportunities: {
        Row: {
          id: string
          company_id: string
          title: string
          description: string | null
          stage_code: string
          status_code: string
          source_code: string | null
          estimated_value: number | null
          probability: number | null
          expected_close_date: string | null
          actual_close_date: string | null
          assigned_to_id: string | null
          notes: string | null
          created_by: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          company_id: string
          title: string
          description?: string | null
          stage_code?: string
          status_code?: string
          source_code?: string | null
          estimated_value?: number | null
          probability?: number | null
          expected_close_date?: string | null
          actual_close_date?: string | null
          assigned_to_id?: string | null
          notes?: string | null
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          company_id?: string
          title?: string
          description?: string | null
          stage_code?: string
          status_code?: string
          source_code?: string | null
          estimated_value?: number | null
          probability?: number | null
          expected_close_date?: string | null
          actual_close_date?: string | null
          assigned_to_id?: string | null
          notes?: string | null
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "opportunities_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "empresas"
            referencedColumns: ["id"]
          }
        ]
      }
      opportunity_notes: {
        Row: {
          id: string
          opportunity_id: string
          note: string
          created_by: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          opportunity_id: string
          note: string
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          opportunity_id?: string
          note?: string
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "opportunity_notes_opportunity_id_fkey"
            columns: ["opportunity_id"]
            isOneToOne: false
            referencedRelation: "opportunities"
            referencedColumns: ["id"]
          }
        ]
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
      training_attendance: {
        Row: {
          id: string
          formacion_id: string
          company_id: string | null
          attendee_name: string
          attendee_email: string | null
          attendee_phone: string | null
          attendee_position: string | null
          status: Database["public"]["Enums"]["attendance_status"]
          registration_date: string | null
          attendance_date: string | null
          certificate_issued: boolean | null
          certificate_url: string | null
          notes: string | null
          created_by: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          formacion_id: string
          company_id?: string | null
          attendee_name: string
          attendee_email?: string | null
          attendee_phone?: string | null
          attendee_position?: string | null
          status?: Database["public"]["Enums"]["attendance_status"]
          registration_date?: string | null
          attendance_date?: string | null
          certificate_issued?: boolean | null
          certificate_url?: string | null
          notes?: string | null
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          formacion_id?: string
          company_id?: string | null
          attendee_name?: string
          attendee_email?: string | null
          attendee_phone?: string | null
          attendee_position?: string | null
          status?: Database["public"]["Enums"]["attendance_status"]
          registration_date?: string | null
          attendance_date?: string | null
          certificate_issued?: boolean | null
          certificate_url?: string | null
          notes?: string | null
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "training_attendance_formacion_id_fkey"
            columns: ["formacion_id"]
            isOneToOne: false
            referencedRelation: "formaciones"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "training_attendance_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "empresas"
            referencedColumns: ["id"]
          },
        ]
      }
      event_invites: {
        Row: {
          id: string
          evento_id: string
          company_id: string | null
          invitee_name: string
          invitee_email: string | null
          invitee_phone: string | null
          invitee_position: string | null
          status: Database["public"]["Enums"]["invite_status"]
          sent_date: string | null
          response_date: string | null
          response_notes: string | null
          notes: string | null
          created_by: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          evento_id: string
          company_id?: string | null
          invitee_name: string
          invitee_email?: string | null
          invitee_phone?: string | null
          invitee_position?: string | null
          status?: Database["public"]["Enums"]["invite_status"]
          sent_date?: string | null
          response_date?: string | null
          response_notes?: string | null
          notes?: string | null
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          evento_id?: string
          company_id?: string | null
          invitee_name?: string
          invitee_email?: string | null
          invitee_phone?: string | null
          invitee_position?: string | null
          status?: Database["public"]["Enums"]["invite_status"]
          sent_date?: string | null
          response_date?: string | null
          response_notes?: string | null
          notes?: string | null
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "event_invites_evento_id_fkey"
            columns: ["evento_id"]
            isOneToOne: false
            referencedRelation: "eventos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "event_invites_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "empresas"
            referencedColumns: ["id"]
          },
        ]
      }
      event_attendance: {
        Row: {
          id: string
          evento_id: string
          invite_id: string | null
          company_id: string | null
          attendee_name: string
          attendee_email: string | null
          attendee_phone: string | null
          attendee_position: string | null
          status: Database["public"]["Enums"]["attendance_status"]
          registration_date: string | null
          attendance_date: string | null
          certificate_issued: boolean | null
          certificate_url: string | null
          notes: string | null
          created_by: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          evento_id: string
          invite_id?: string | null
          company_id?: string | null
          attendee_name: string
          attendee_email?: string | null
          attendee_phone?: string | null
          attendee_position?: string | null
          status?: Database["public"]["Enums"]["attendance_status"]
          registration_date?: string | null
          attendance_date?: string | null
          certificate_issued?: boolean | null
          certificate_url?: string | null
          notes?: string | null
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          evento_id?: string
          invite_id?: string | null
          company_id?: string | null
          attendee_name?: string
          attendee_email?: string | null
          attendee_phone?: string | null
          attendee_position?: string | null
          status?: Database["public"]["Enums"]["attendance_status"]
          registration_date?: string | null
          attendance_date?: string | null
          certificate_issued?: boolean | null
          certificate_url?: string | null
          notes?: string | null
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "event_attendance_evento_id_fkey"
            columns: ["evento_id"]
            isOneToOne: false
            referencedRelation: "eventos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "event_attendance_invite_id_fkey"
            columns: ["invite_id"]
            isOneToOne: false
            referencedRelation: "event_invites"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "event_attendance_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "empresas"
            referencedColumns: ["id"]
          },
        ]
      }
      event_surveys: {
        Row: {
          id: string
          evento_id: string
          attendance_id: string | null
          company_id: string | null
          respondent_name: string | null
          respondent_email: string | null
          status: Database["public"]["Enums"]["survey_status"]
          satisfaction_rating: number | null
          content_rating: number | null
          organization_rating: number | null
          usefulness_rating: number | null
          highlights: string | null
          improvements: string | null
          impact_description: string | null
          follow_up_interest: boolean | null
          follow_up_notes: string | null
          custom_responses: Json | null
          submitted_at: string | null
          created_by: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          evento_id: string
          attendance_id?: string | null
          company_id?: string | null
          respondent_name?: string | null
          respondent_email?: string | null
          status?: Database["public"]["Enums"]["survey_status"]
          satisfaction_rating?: number | null
          content_rating?: number | null
          organization_rating?: number | null
          usefulness_rating?: number | null
          highlights?: string | null
          improvements?: string | null
          impact_description?: string | null
          follow_up_interest?: boolean | null
          follow_up_notes?: string | null
          custom_responses?: Json | null
          submitted_at?: string | null
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          evento_id?: string
          attendance_id?: string | null
          company_id?: string | null
          respondent_name?: string | null
          respondent_email?: string | null
          status?: Database["public"]["Enums"]["survey_status"]
          satisfaction_rating?: number | null
          content_rating?: number | null
          organization_rating?: number | null
          usefulness_rating?: number | null
          highlights?: string | null
          improvements?: string | null
          impact_description?: string | null
          follow_up_interest?: boolean | null
          follow_up_notes?: string | null
          custom_responses?: Json | null
          submitted_at?: string | null
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "event_surveys_evento_id_fkey"
            columns: ["evento_id"]
            isOneToOne: false
            referencedRelation: "eventos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "event_surveys_attendance_id_fkey"
            columns: ["attendance_id"]
            isOneToOne: false
            referencedRelation: "event_attendance"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "event_surveys_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "empresas"
            referencedColumns: ["id"]
          },
        ]
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
          fecha_fin: string | null
          hora_fin: string | null
          formato: string | null
          objetivo: string | null
          notas_programa: string | null
          notas_evidencia: string | null
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
          fecha_fin?: string | null
          hora_fin?: string | null
          formato?: string | null
          objetivo?: string | null
          notas_programa?: string | null
          notas_evidencia?: string | null
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
          fecha_fin?: string | null
          hora_fin?: string | null
          formato?: string | null
          objetivo?: string | null
          notas_programa?: string | null
          notas_evidencia?: string | null
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
          tema: string | null
          hora_inicio: string | null
          hora_fin: string | null
          notas_evidencia: string | null
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
          tema?: string | null
          hora_inicio?: string | null
          hora_fin?: string | null
          notas_evidencia?: string | null
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
          tema?: string | null
          hora_inicio?: string | null
          hora_fin?: string | null
          notas_evidencia?: string | null
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      grants: {
        Row: {
          id: string
          company_id: string
          title: string
          description: string | null
          status_code: string
          type_code: string | null
          program_code: string | null
          priority_code: string | null
          amount_requested: number | null
          amount_awarded: number | null
          application_deadline: string | null
          decision_date: string | null
          grant_period_start: string | null
          grant_period_end: string | null
          responsible_user_id: string | null
          notes: string | null
          created_by: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          company_id: string
          title: string
          description?: string | null
          status_code?: string
          type_code?: string | null
          program_code?: string | null
          priority_code?: string | null
          amount_requested?: number | null
          amount_awarded?: number | null
          application_deadline?: string | null
          decision_date?: string | null
          grant_period_start?: string | null
          grant_period_end?: string | null
          responsible_user_id?: string | null
          notes?: string | null
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          company_id?: string
          title?: string
          description?: string | null
          status_code?: string
          type_code?: string | null
          program_code?: string | null
          priority_code?: string | null
          amount_requested?: number | null
          amount_awarded?: number | null
          application_deadline?: string | null
          decision_date?: string | null
          grant_period_start?: string | null
          grant_period_end?: string | null
          responsible_user_id?: string | null
          notes?: string | null
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "grants_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "empresas"
            referencedColumns: ["id"]
          }
        ]
      }
      grant_applications: {
        Row: {
          id: string
          grant_id: string
          title: string
          description: string | null
          status_code: string
          submitted_date: string | null
          review_date: string | null
          decision_date: string | null
          assigned_to_id: string | null
          feedback: string | null
          documents_url: string | null
          order_index: number | null
          notes: string | null
          created_by: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          grant_id: string
          title: string
          description?: string | null
          status_code?: string
          submitted_date?: string | null
          review_date?: string | null
          decision_date?: string | null
          assigned_to_id?: string | null
          feedback?: string | null
          documents_url?: string | null
          order_index?: number | null
          notes?: string | null
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          grant_id?: string
          title?: string
          description?: string | null
          status_code?: string
          submitted_date?: string | null
          review_date?: string | null
          decision_date?: string | null
          assigned_to_id?: string | null
          feedback?: string | null
          documents_url?: string | null
          order_index?: number | null
          notes?: string | null
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "grant_applications_grant_id_fkey"
            columns: ["grant_id"]
            isOneToOne: false
            referencedRelation: "grants"
            referencedColumns: ["id"]
          }
        ]
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
      materials: {
        Row: {
          id: string
          titulo: string
          descripcion: string | null
          tipo: string
          categoria: string | null
          formato: string | null
          estado: Database["public"]["Enums"]["material_status"]
          empresa_ids: string[] | null
          evento_ids: string[] | null
          formacion_ids: string[] | null
          url_descarga: string | null
          es_descargable: boolean | null
          requiere_autenticacion: boolean | null
          numero_descargas: number | null
          fecha_publicacion: string | null
          tags: string[] | null
          keywords: string | null
          idioma: string | null
          version: string | null
          created_by: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          titulo: string
          descripcion?: string | null
          tipo: string
          categoria?: string | null
          formato?: string | null
          estado?: Database["public"]["Enums"]["material_status"]
          empresa_ids?: string[] | null
          evento_ids?: string[] | null
          formacion_ids?: string[] | null
          url_descarga?: string | null
          es_descargable?: boolean | null
          requiere_autenticacion?: boolean | null
          numero_descargas?: number | null
          fecha_publicacion?: string | null
          tags?: string[] | null
          keywords?: string | null
          idioma?: string | null
          version?: string | null
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          titulo?: string
          descripcion?: string | null
          tipo?: string
          categoria?: string | null
          formato?: string | null
          estado?: Database["public"]["Enums"]["material_status"]
          empresa_ids?: string[] | null
          evento_ids?: string[] | null
          formacion_ids?: string[] | null
          url_descarga?: string | null
          es_descargable?: boolean | null
          requiere_autenticacion?: boolean | null
          numero_descargas?: number | null
          fecha_publicacion?: string | null
          tags?: string[] | null
          keywords?: string | null
          idioma?: string | null
          version?: string | null
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      dissemination_impacts: {
        Row: {
          id: string
          titulo: string
          descripcion: string | null
          canal: string
          tipo: string | null
          estado: Database["public"]["Enums"]["dissemination_status"]
          entity_type: Database["public"]["Enums"]["dissemination_entity_type"]
          entity_id: string | null
          empresa_ids: string[] | null
          fecha_inicio: string | null
          fecha_fin: string | null
          fecha_ejecucion: string | null
          alcance: number | null
          visualizaciones: number | null
          descargas: number | null
          interacciones: number | null
          conversiones: number | null
          metricas_adicionales: Json | null
          presupuesto: number | null
          coste_real: number | null
          publico_objetivo: string | null
          segmento: string | null
          material_ids: string[] | null
          tags: string[] | null
          observaciones: string | null
          created_by: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          titulo: string
          descripcion?: string | null
          canal: string
          tipo?: string | null
          estado?: Database["public"]["Enums"]["dissemination_status"]
          entity_type?: Database["public"]["Enums"]["dissemination_entity_type"]
          entity_id?: string | null
          empresa_ids?: string[] | null
          fecha_inicio?: string | null
          fecha_fin?: string | null
          fecha_ejecucion?: string | null
          alcance?: number | null
          visualizaciones?: number | null
          descargas?: number | null
          interacciones?: number | null
          conversiones?: number | null
          metricas_adicionales?: Json | null
          presupuesto?: number | null
          coste_real?: number | null
          publico_objetivo?: string | null
          segmento?: string | null
          material_ids?: string[] | null
          tags?: string[] | null
          observaciones?: string | null
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          titulo?: string
          descripcion?: string | null
          canal?: string
          tipo?: string | null
          estado?: Database["public"]["Enums"]["dissemination_status"]
          entity_type?: Database["public"]["Enums"]["dissemination_entity_type"]
          entity_id?: string | null
          empresa_ids?: string[] | null
          fecha_inicio?: string | null
          fecha_fin?: string | null
          fecha_ejecucion?: string | null
          alcance?: number | null
          visualizaciones?: number | null
          descargas?: number | null
          interacciones?: number | null
          conversiones?: number | null
          metricas_adicionales?: Json | null
          presupuesto?: number | null
          coste_real?: number | null
          publico_objetivo?: string | null
          segmento?: string | null
          material_ids?: string[] | null
          tags?: string[] | null
          observaciones?: string | null
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      tasks: {
        Row: {
          id: string
          entity_type: Database["public"]["Enums"]["task_entity_type"]
          entity_id: string | null
          titulo: string
          descripcion: string | null
          estado: Database["public"]["Enums"]["task_status"]
          prioridad: Database["public"]["Enums"]["task_priority"]
          fecha_vencimiento: string | null
          fecha_inicio: string | null
          fecha_completado: string | null
          responsable_id: string | null
          source: string | null
          template_id: string | null
          tags: string[] | null
          observaciones: string | null
          created_by: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          entity_type?: Database["public"]["Enums"]["task_entity_type"]
          entity_id?: string | null
          titulo: string
          descripcion?: string | null
          estado?: Database["public"]["Enums"]["task_status"]
          prioridad?: Database["public"]["Enums"]["task_priority"]
          fecha_vencimiento?: string | null
          fecha_inicio?: string | null
          fecha_completado?: string | null
          responsable_id?: string | null
          source?: string | null
          template_id?: string | null
          tags?: string[] | null
          observaciones?: string | null
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          entity_type?: Database["public"]["Enums"]["task_entity_type"]
          entity_id?: string | null
          titulo?: string
          descripcion?: string | null
          estado?: Database["public"]["Enums"]["task_status"]
          prioridad?: Database["public"]["Enums"]["task_priority"]
          fecha_vencimiento?: string | null
          fecha_inicio?: string | null
          fecha_completado?: string | null
          responsable_id?: string | null
          source?: string | null
          template_id?: string | null
          tags?: string[] | null
          observaciones?: string | null
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "tasks_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "task_templates"
            referencedColumns: ["id"]
          },
        ]
      }
      task_templates: {
        Row: {
          id: string
          name: string
          trigger: Database["public"]["Enums"]["template_trigger"]
          title_template: string
          description_template: string | null
          default_due_days: number | null
          default_priority: Database["public"]["Enums"]["task_priority"] | null
          default_estado: Database["public"]["Enums"]["task_status"] | null
          required_role: Database["public"]["Enums"]["app_role"] | null
          assign_to_creator: boolean | null
          is_active: boolean | null
          metadata: Json | null
          tags: string[] | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          trigger: Database["public"]["Enums"]["template_trigger"]
          title_template: string
          description_template?: string | null
          default_due_days?: number | null
          default_priority?: Database["public"]["Enums"]["task_priority"] | null
          default_estado?: Database["public"]["Enums"]["task_status"] | null
          required_role?: Database["public"]["Enums"]["app_role"] | null
          assign_to_creator?: boolean | null
          is_active?: boolean | null
          metadata?: Json | null
          tags?: string[] | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          trigger?: Database["public"]["Enums"]["template_trigger"]
          title_template?: string
          description_template?: string | null
          default_due_days?: number | null
          default_priority?: Database["public"]["Enums"]["task_priority"] | null
          default_estado?: Database["public"]["Enums"]["task_status"] | null
          required_role?: Database["public"]["Enums"]["app_role"] | null
          assign_to_creator?: boolean | null
          is_active?: boolean | null
          metadata?: Json | null
          tags?: string[] | null
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
      attachment_category:
        | "document"
        | "image"
        | "video"
        | "certificate"
        | "report"
        | "contract"
        | "invoice"
        | "presentation"
        | "other"
      attachment_owner_type:
        | "empresa"
        | "contacto"
        | "asesoramiento"
        | "evento"
        | "formacion"
        | "evidencia"
        | "colaborador"
        | "activity"
        | "action_plan"
        | "action_plan_item"
        | "report"
        | "opportunity"
        | "opportunity_note"
        | "grant"
        | "grant_application"
        | "company_compliance"
        | "material"
        | "dissemination_impact"
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
      attendance_status:
        | "registered"
        | "confirmed"
        | "attended"
        | "no_show"
        | "cancelled"
      invite_status:
        | "sent"
        | "accepted"
        | "declined"
        | "pending"
      survey_status:
        | "draft"
        | "published"
        | "closed"
      material_status:
        | "draft"
        | "review"
        | "published"
        | "archived"
      dissemination_status:
        | "planned"
        | "active"
        | "completed"
        | "cancelled"
      dissemination_entity_type:
        | "empresa"
        | "evento"
        | "formacion"
        | "material"
        | "general"
      task_status:
        | "pending"
        | "in_progress"
        | "completed"
        | "cancelled"
        | "on_hold"
      task_priority:
        | "low"
        | "medium"
        | "high"
        | "urgent"
      task_entity_type:
        | "empresa"
        | "evento"
        | "formacion"
        | "colaborador"
        | "material"
        | "dissemination_impact"
        | "opportunity"
        | "grant"
        | "action_plan"
        | "report"
        | "general"
      template_trigger:
        | "empresa_created"
        | "evento_created"
        | "formacion_created"
        | "colaborador_created"
        | "opportunity_created"
        | "grant_created"
        | "manual"
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
      material_status: ["draft", "review", "published", "archived"],
      dissemination_status: ["planned", "active", "completed", "cancelled"],
      dissemination_entity_type: ["empresa", "evento", "formacion", "material", "general"],
      task_status: ["pending", "in_progress", "completed", "cancelled", "on_hold"],
      task_priority: ["low", "medium", "high", "urgent"],
      task_entity_type: ["empresa", "evento", "formacion", "colaborador", "material", "dissemination_impact", "opportunity", "grant", "action_plan", "report", "general"],
      template_trigger: ["empresa_created", "evento_created", "formacion_created", "colaborador_created", "opportunity_created", "grant_created", "manual"],
    },
  },
} as const
