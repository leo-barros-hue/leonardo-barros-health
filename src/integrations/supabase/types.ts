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
          created_at: string
          id: string
          name: string
          patient_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          name?: string
          patient_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          patient_id?: string
          updated_at?: string
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
      foods: {
        Row: {
          carbs_per_unit: number
          category: string
          created_at: string
          fat_per_unit: number
          id: string
          measure: string
          name: string
          protein_per_unit: number
        }
        Insert: {
          carbs_per_unit?: number
          category?: string
          created_at?: string
          fat_per_unit?: number
          id?: string
          measure?: string
          name: string
          protein_per_unit?: number
        }
        Update: {
          carbs_per_unit?: number
          category?: string
          created_at?: string
          fat_per_unit?: number
          id?: string
          measure?: string
          name?: string
          protein_per_unit?: number
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
      workout_days: {
        Row: {
          id: string
          name: string
          program_id: string
          sort_order: number
        }
        Insert: {
          id?: string
          name: string
          program_id: string
          sort_order?: number
        }
        Update: {
          id?: string
          name?: string
          program_id?: string
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
          name: string
          notes: string | null
          reps: string
          rest_seconds: number | null
          sets: number
          sort_order: number
          workout_day_id: string
        }
        Insert: {
          id?: string
          name: string
          notes?: string | null
          reps?: string
          rest_seconds?: number | null
          sets?: number
          sort_order?: number
          workout_day_id: string
        }
        Update: {
          id?: string
          name?: string
          notes?: string | null
          reps?: string
          rest_seconds?: number | null
          sets?: number
          sort_order?: number
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
