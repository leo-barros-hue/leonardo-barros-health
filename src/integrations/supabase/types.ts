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
      anamneses: {
        Row: {
          content: string
          created_at: string
          id: string
          patient_id: string
          updated_at: string
        }
        Insert: {
          content?: string
          created_at?: string
          id?: string
          patient_id: string
          updated_at?: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          patient_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "anamneses_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
        ]
      }
      body_measurements: {
        Row: {
          body_fat_pct: number | null
          created_at: string
          id: string
          measured_at: string
          muscle_mass_pct: number | null
          patient_id: string
          weight: number | null
        }
        Insert: {
          body_fat_pct?: number | null
          created_at?: string
          id?: string
          measured_at?: string
          muscle_mass_pct?: number | null
          patient_id: string
          weight?: number | null
        }
        Update: {
          body_fat_pct?: number | null
          created_at?: string
          id?: string
          measured_at?: string
          muscle_mass_pct?: number | null
          patient_id?: string
          weight?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "body_measurements_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
        ]
      }
      diet_meal_foods: {
        Row: {
          carbs: number
          diet_meal_id: string
          fat: number
          food_id: string | null
          food_name: string
          id: string
          measure: string
          protein: number
          quantity: number
          sort_order: number
        }
        Insert: {
          carbs?: number
          diet_meal_id: string
          fat?: number
          food_id?: string | null
          food_name: string
          id?: string
          measure?: string
          protein?: number
          quantity?: number
          sort_order?: number
        }
        Update: {
          carbs?: number
          diet_meal_id?: string
          fat?: number
          food_id?: string | null
          food_name?: string
          id?: string
          measure?: string
          protein?: number
          quantity?: number
          sort_order?: number
        }
        Relationships: [
          {
            foreignKeyName: "diet_meal_foods_diet_meal_id_fkey"
            columns: ["diet_meal_id"]
            isOneToOne: false
            referencedRelation: "diet_meals"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "diet_meal_foods_food_id_fkey"
            columns: ["food_id"]
            isOneToOne: false
            referencedRelation: "foods"
            referencedColumns: ["id"]
          },
        ]
      }
      diet_meals: {
        Row: {
          diet_id: string
          id: string
          name: string
          sort_order: number
          time: string | null
        }
        Insert: {
          diet_id: string
          id?: string
          name: string
          sort_order?: number
          time?: string | null
        }
        Update: {
          diet_id?: string
          id?: string
          name?: string
          sort_order?: number
          time?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "diet_meals_diet_id_fkey"
            columns: ["diet_id"]
            isOneToOne: false
            referencedRelation: "diets"
            referencedColumns: ["id"]
          },
        ]
      }
      diets: {
        Row: {
          calories_snapshot: number | null
          created_at: string
          id: string
          name: string
          notes: string
          patient_id: string
          released_at: string | null
          updated_at: string
          weight_snapshot: number | null
        }
        Insert: {
          calories_snapshot?: number | null
          created_at?: string
          id?: string
          name?: string
          notes?: string
          patient_id: string
          released_at?: string | null
          updated_at?: string
          weight_snapshot?: number | null
        }
        Update: {
          calories_snapshot?: number | null
          created_at?: string
          id?: string
          name?: string
          notes?: string
          patient_id?: string
          released_at?: string | null
          updated_at?: string
          weight_snapshot?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "diets_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
        ]
      }
      exercise_catalog: {
        Row: {
          created_at: string
          id: string
          muscle_group: string
          name: string
        }
        Insert: {
          created_at?: string
          id?: string
          muscle_group?: string
          name: string
        }
        Update: {
          created_at?: string
          id?: string
          muscle_group?: string
          name?: string
        }
        Relationships: []
      }
      foods: {
        Row: {
          carbs_per_unit: number
          category: string
          created_at: string
          fat_per_unit: number
          fiber_per_unit: number
          id: string
          kcal_per_unit: number
          measure: string
          name: string
          protein_per_unit: number
        }
        Insert: {
          carbs_per_unit?: number
          category?: string
          created_at?: string
          fat_per_unit?: number
          fiber_per_unit?: number
          id?: string
          kcal_per_unit?: number
          measure?: string
          name: string
          protein_per_unit?: number
        }
        Update: {
          carbs_per_unit?: number
          category?: string
          created_at?: string
          fat_per_unit?: number
          fiber_per_unit?: number
          id?: string
          kcal_per_unit?: number
          measure?: string
          name?: string
          protein_per_unit?: number
        }
        Relationships: []
      }
      form_assignments: {
        Row: {
          access_token: string | null
          assigned_at: string
          completed_at: string | null
          form_template_id: string
          id: string
          patient_id: string
        }
        Insert: {
          access_token?: string | null
          assigned_at?: string
          completed_at?: string | null
          form_template_id: string
          id?: string
          patient_id: string
        }
        Update: {
          access_token?: string | null
          assigned_at?: string
          completed_at?: string | null
          form_template_id?: string
          id?: string
          patient_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "form_assignments_form_template_id_fkey"
            columns: ["form_template_id"]
            isOneToOne: false
            referencedRelation: "form_templates"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "form_assignments_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
        ]
      }
      form_questions: {
        Row: {
          description: string
          form_template_id: string
          id: string
          image_url: string | null
          multi_select: boolean
          options: Json | null
          question_text: string
          question_type: string
          required: boolean
          scale_label_max: string
          scale_label_min: string
          scale_max: number | null
          scale_min: number | null
          sort_order: number
        }
        Insert: {
          description?: string
          form_template_id: string
          id?: string
          image_url?: string | null
          multi_select?: boolean
          options?: Json | null
          question_text: string
          question_type?: string
          required?: boolean
          scale_label_max?: string
          scale_label_min?: string
          scale_max?: number | null
          scale_min?: number | null
          sort_order?: number
        }
        Update: {
          description?: string
          form_template_id?: string
          id?: string
          image_url?: string | null
          multi_select?: boolean
          options?: Json | null
          question_text?: string
          question_type?: string
          required?: boolean
          scale_label_max?: string
          scale_label_min?: string
          scale_max?: number | null
          scale_min?: number | null
          sort_order?: number
        }
        Relationships: [
          {
            foreignKeyName: "form_questions_form_template_id_fkey"
            columns: ["form_template_id"]
            isOneToOne: false
            referencedRelation: "form_templates"
            referencedColumns: ["id"]
          },
        ]
      }
      form_responses: {
        Row: {
          answer_number: number | null
          answer_text: string | null
          created_at: string
          form_assignment_id: string
          form_question_id: string
          id: string
        }
        Insert: {
          answer_number?: number | null
          answer_text?: string | null
          created_at?: string
          form_assignment_id: string
          form_question_id: string
          id?: string
        }
        Update: {
          answer_number?: number | null
          answer_text?: string | null
          created_at?: string
          form_assignment_id?: string
          form_question_id?: string
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "form_responses_form_assignment_id_fkey"
            columns: ["form_assignment_id"]
            isOneToOne: false
            referencedRelation: "form_assignments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "form_responses_form_question_id_fkey"
            columns: ["form_question_id"]
            isOneToOne: false
            referencedRelation: "form_questions"
            referencedColumns: ["id"]
          },
        ]
      }
      form_templates: {
        Row: {
          created_at: string
          description: string
          id: string
          name: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string
          id?: string
          name: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string
          id?: string
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      lab_exam_results: {
        Row: {
          id: string
          lab_exam_id: string
          marker_name: string
          reference_max: number | null
          reference_min: number | null
          sort_order: number
          unit: string
          value: number
        }
        Insert: {
          id?: string
          lab_exam_id: string
          marker_name: string
          reference_max?: number | null
          reference_min?: number | null
          sort_order?: number
          unit?: string
          value: number
        }
        Update: {
          id?: string
          lab_exam_id?: string
          marker_name?: string
          reference_max?: number | null
          reference_min?: number | null
          sort_order?: number
          unit?: string
          value?: number
        }
        Relationships: [
          {
            foreignKeyName: "lab_exam_results_lab_exam_id_fkey"
            columns: ["lab_exam_id"]
            isOneToOne: false
            referencedRelation: "lab_exams"
            referencedColumns: ["id"]
          },
        ]
      }
      lab_exams: {
        Row: {
          created_at: string
          exam_date: string
          id: string
          notes: string | null
          patient_id: string
        }
        Insert: {
          created_at?: string
          exam_date?: string
          id?: string
          notes?: string | null
          patient_id: string
        }
        Update: {
          created_at?: string
          exam_date?: string
          id?: string
          notes?: string | null
          patient_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "lab_exams_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
        ]
      }
      materials_pdfs: {
        Row: {
          category: string
          created_at: string
          description: string
          file_name: string
          file_url: string
          id: string
          name: string
        }
        Insert: {
          category?: string
          created_at?: string
          description?: string
          file_name: string
          file_url: string
          id?: string
          name: string
        }
        Update: {
          category?: string
          created_at?: string
          description?: string
          file_name?: string
          file_url?: string
          id?: string
          name?: string
        }
        Relationships: []
      }
      materials_videos: {
        Row: {
          created_at: string
          description: string
          id: string
          title: string
          youtube_id: string
          youtube_url: string
        }
        Insert: {
          created_at?: string
          description?: string
          id?: string
          title: string
          youtube_id: string
          youtube_url: string
        }
        Update: {
          created_at?: string
          description?: string
          id?: string
          title?: string
          youtube_id?: string
          youtube_url?: string
        }
        Relationships: []
      }
      patient_energy_profiles: {
        Row: {
          activity_factor: number
          height: number | null
          id: string
          patient_id: string
          selected_formula: string | null
          updated_at: string
        }
        Insert: {
          activity_factor?: number
          height?: number | null
          id?: string
          patient_id: string
          selected_formula?: string | null
          updated_at?: string
        }
        Update: {
          activity_factor?: number
          height?: number | null
          id?: string
          patient_id?: string
          selected_formula?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "patient_energy_profiles_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: true
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
        ]
      }
      patient_plans: {
        Row: {
          diet_active: boolean
          id: string
          medical_active: boolean
          patient_id: string
          plan_expires_at: string | null
          plan_starts_at: string | null
          updated_at: string
          workout_active: boolean
        }
        Insert: {
          diet_active?: boolean
          id?: string
          medical_active?: boolean
          patient_id: string
          plan_expires_at?: string | null
          plan_starts_at?: string | null
          updated_at?: string
          workout_active?: boolean
        }
        Update: {
          diet_active?: boolean
          id?: string
          medical_active?: boolean
          patient_id?: string
          plan_expires_at?: string | null
          plan_starts_at?: string | null
          updated_at?: string
          workout_active?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "patient_plans_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: true
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
        ]
      }
      patient_schedule_dates: {
        Row: {
          created_at: string
          id: string
          label: string
          patient_id: string
          scheduled_date: string
        }
        Insert: {
          created_at?: string
          id?: string
          label?: string
          patient_id: string
          scheduled_date: string
        }
        Update: {
          created_at?: string
          id?: string
          label?: string
          patient_id?: string
          scheduled_date?: string
        }
        Relationships: [
          {
            foreignKeyName: "patient_schedule_dates_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
        ]
      }
      patients: {
        Row: {
          birth_date: string | null
          cpf: string | null
          created_at: string
          email: string | null
          id: string
          name: string
          objective: string | null
          phone: string | null
          sex: string | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          birth_date?: string | null
          cpf?: string | null
          created_at?: string
          email?: string | null
          id?: string
          name: string
          objective?: string | null
          phone?: string | null
          sex?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          birth_date?: string | null
          cpf?: string | null
          created_at?: string
          email?: string | null
          id?: string
          name?: string
          objective?: string | null
          phone?: string | null
          sex?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      photo_sessions: {
        Row: {
          back_url: string | null
          created_at: string
          crop_data: Json | null
          front_url: string | null
          id: string
          left_url: string | null
          patient_id: string
          right_url: string | null
          session_date: string
        }
        Insert: {
          back_url?: string | null
          created_at?: string
          crop_data?: Json | null
          front_url?: string | null
          id?: string
          left_url?: string | null
          patient_id: string
          right_url?: string | null
          session_date?: string
        }
        Update: {
          back_url?: string | null
          created_at?: string
          crop_data?: Json | null
          front_url?: string | null
          id?: string
          left_url?: string | null
          patient_id?: string
          right_url?: string | null
          session_date?: string
        }
        Relationships: [
          {
            foreignKeyName: "photo_sessions_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
        ]
      }
      prescriptions: {
        Row: {
          content: string
          created_at: string
          id: string
          patient_id: string
          prescribed_at: string
          title: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          patient_id: string
          prescribed_at?: string
          title: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          patient_id?: string
          prescribed_at?: string
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "prescriptions_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
        ]
      }
      technique_catalog: {
        Row: {
          created_at: string
          description: string
          id: string
          name: string
        }
        Insert: {
          created_at?: string
          description?: string
          id?: string
          name: string
        }
        Update: {
          created_at?: string
          description?: string
          id?: string
          name?: string
        }
        Relationships: []
      }
      workout_days: {
        Row: {
          id: string
          name: string
          program_id: string
          rep_range: string | null
          rest_interval: string | null
          sort_order: number
        }
        Insert: {
          id?: string
          name: string
          program_id: string
          rep_range?: string | null
          rest_interval?: string | null
          sort_order?: number
        }
        Update: {
          id?: string
          name?: string
          program_id?: string
          rep_range?: string | null
          rest_interval?: string | null
          sort_order?: number
        }
        Relationships: [
          {
            foreignKeyName: "workout_days_program_id_fkey"
            columns: ["program_id"]
            isOneToOne: false
            referencedRelation: "workout_programs"
            referencedColumns: ["id"]
          },
        ]
      }
      workout_exercises: {
        Row: {
          id: string
          load_s1: string | null
          load_s2: string | null
          load_s3: string | null
          load_s4: string | null
          load_s5: string | null
          load_s6: string | null
          name: string
          notes: string | null
          reps: string
          reps_s1: number | null
          reps_s2: number | null
          reps_s3: number | null
          reps_s4: number | null
          reps_s5: number | null
          reps_s6: number | null
          rest_seconds: number | null
          sets: number
          sort_order: number
          technique: string | null
          workout_day_id: string
        }
        Insert: {
          id?: string
          load_s1?: string | null
          load_s2?: string | null
          load_s3?: string | null
          load_s4?: string | null
          load_s5?: string | null
          load_s6?: string | null
          name: string
          notes?: string | null
          reps?: string
          reps_s1?: number | null
          reps_s2?: number | null
          reps_s3?: number | null
          reps_s4?: number | null
          reps_s5?: number | null
          reps_s6?: number | null
          rest_seconds?: number | null
          sets?: number
          sort_order?: number
          technique?: string | null
          workout_day_id: string
        }
        Update: {
          id?: string
          load_s1?: string | null
          load_s2?: string | null
          load_s3?: string | null
          load_s4?: string | null
          load_s5?: string | null
          load_s6?: string | null
          name?: string
          notes?: string | null
          reps?: string
          reps_s1?: number | null
          reps_s2?: number | null
          reps_s3?: number | null
          reps_s4?: number | null
          reps_s5?: number | null
          reps_s6?: number | null
          rest_seconds?: number | null
          sets?: number
          sort_order?: number
          technique?: string | null
          workout_day_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "workout_exercises_workout_day_id_fkey"
            columns: ["workout_day_id"]
            isOneToOne: false
            referencedRelation: "workout_days"
            referencedColumns: ["id"]
          },
        ]
      }
      workout_programs: {
        Row: {
          created_at: string
          description: string | null
          id: string
          name: string
          patient_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          patient_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          patient_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "workout_programs_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
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
