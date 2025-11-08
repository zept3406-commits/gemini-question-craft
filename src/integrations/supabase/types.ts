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
    PostgrestVersion: "12.2.12 (cd3cf9e)"
  }
  public: {
    Tables: {
      chapter_questions: {
        Row: {
          answer: string | null
          answer_diagram: Json | null
          chapter_id: string | null
          chapter_name: string
          correct_marks: number | null
          created_at: string | null
          diagram_json: Json | null
          id: string
          incorrect_marks: number | null
          is_pyq: boolean | null
          options: string[] | null
          options_diagrams: Json | null
          part: string | null
          partial_marks: number | null
          pyq_year: number | null
          question_statement: string
          question_type: string
          skipped_marks: number | null
          slot: string | null
          solution: string | null
          solution_diagram: Json | null
          time_minutes: number | null
        }
        Insert: {
          answer?: string | null
          answer_diagram?: Json | null
          chapter_id?: string | null
          chapter_name: string
          correct_marks?: number | null
          created_at?: string | null
          diagram_json?: Json | null
          id?: string
          incorrect_marks?: number | null
          is_pyq?: boolean | null
          options?: string[] | null
          options_diagrams?: Json | null
          part?: string | null
          partial_marks?: number | null
          pyq_year?: number | null
          question_statement: string
          question_type: string
          skipped_marks?: number | null
          slot?: string | null
          solution?: string | null
          solution_diagram?: Json | null
          time_minutes?: number | null
        }
        Update: {
          answer?: string | null
          answer_diagram?: Json | null
          chapter_id?: string | null
          chapter_name?: string
          correct_marks?: number | null
          created_at?: string | null
          diagram_json?: Json | null
          id?: string
          incorrect_marks?: number | null
          is_pyq?: boolean | null
          options?: string[] | null
          options_diagrams?: Json | null
          part?: string | null
          partial_marks?: number | null
          pyq_year?: number | null
          question_statement?: string
          question_type?: string
          skipped_marks?: number | null
          slot?: string | null
          solution?: string | null
          solution_diagram?: Json | null
          time_minutes?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "chapter_questions_chapter_id_fkey"
            columns: ["chapter_id"]
            isOneToOne: false
            referencedRelation: "chapters"
            referencedColumns: ["id"]
          },
        ]
      }
      chapter_weightage: {
        Row: {
          chapter_id: string | null
          created_at: string
          id: string
          part_id: string | null
          slot_id: string | null
          weightage_percent: number | null
        }
        Insert: {
          chapter_id?: string | null
          created_at?: string
          id?: string
          part_id?: string | null
          slot_id?: string | null
          weightage_percent?: number | null
        }
        Update: {
          chapter_id?: string | null
          created_at?: string
          id?: string
          part_id?: string | null
          slot_id?: string | null
          weightage_percent?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "chapter_weightage_chapter_id_fkey"
            columns: ["chapter_id"]
            isOneToOne: false
            referencedRelation: "chapters"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "chapter_weightage_part_id_fkey"
            columns: ["part_id"]
            isOneToOne: false
            referencedRelation: "parts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "chapter_weightage_slot_id_fkey"
            columns: ["slot_id"]
            isOneToOne: false
            referencedRelation: "slots"
            referencedColumns: ["id"]
          },
        ]
      }
      chapters: {
        Row: {
          course_id: string | null
          created_at: string | null
          description: string | null
          id: string
          name: string
          notes: string | null
          parts: string | null
          short_notes: string | null
          slots: string | null
          unit_id: string | null
          updated_at: string | null
        }
        Insert: {
          course_id?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          name: string
          notes?: string | null
          parts?: string | null
          short_notes?: string | null
          slots?: string | null
          unit_id?: string | null
          updated_at?: string | null
        }
        Update: {
          course_id?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          name?: string
          notes?: string | null
          parts?: string | null
          short_notes?: string | null
          slots?: string | null
          unit_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "chapters_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "chapters_unit_id_fkey"
            columns: ["unit_id"]
            isOneToOne: false
            referencedRelation: "units"
            referencedColumns: ["id"]
          },
        ]
      }
      chapters_backup: {
        Row: {
          course_id: string | null
          created_at: string | null
          description: string | null
          id: string | null
          name: string | null
          notes: string | null
          parts: string | null
          short_notes: string | null
          slots: string | null
          unit_id: string | null
          updated_at: string | null
        }
        Insert: {
          course_id?: string | null
          created_at?: string | null
          description?: string | null
          id?: string | null
          name?: string | null
          notes?: string | null
          parts?: string | null
          short_notes?: string | null
          slots?: string | null
          unit_id?: string | null
          updated_at?: string | null
        }
        Update: {
          course_id?: string | null
          created_at?: string | null
          description?: string | null
          id?: string | null
          name?: string | null
          notes?: string | null
          parts?: string | null
          short_notes?: string | null
          slots?: string | null
          unit_id?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      course_blog: {
        Row: {
          admission_procedure: string | null
          alumni_stories: string | null
          average_package: string | null
          campus_life: string | null
          chapter_wise_questions: string | null
          course_comparison: string | null
          course_curriculum: string | null
          course_id: string | null
          course_overview: string | null
          created_at: string | null
          day_in_life: string | null
          degree_type: string | null
          description: string | null
          duration: string | null
          entrance_exam_details: string | null
          exam_id: string | null
          exam_pattern: string | null
          freemium_group: string | null
          full_length_mocks: string | null
          global_exposure: string | null
          id: string
          intake_capacity: string | null
          is_calculator: boolean | null
          is_parts: boolean | null
          name: string
          notes: string | null
          placement_statistics: string | null
          premium_group: string | null
          preparation_strategy: string | null
          projects_assignments: string | null
          quick_facts: string | null
          short_notes: string | null
          skills_learning_outcomes: string | null
          syllabus: string | null
          test_parts: string | null
        }
        Insert: {
          admission_procedure?: string | null
          alumni_stories?: string | null
          average_package?: string | null
          campus_life?: string | null
          chapter_wise_questions?: string | null
          course_comparison?: string | null
          course_curriculum?: string | null
          course_id?: string | null
          course_overview?: string | null
          created_at?: string | null
          day_in_life?: string | null
          degree_type?: string | null
          description?: string | null
          duration?: string | null
          entrance_exam_details?: string | null
          exam_id?: string | null
          exam_pattern?: string | null
          freemium_group?: string | null
          full_length_mocks?: string | null
          global_exposure?: string | null
          id?: string
          intake_capacity?: string | null
          is_calculator?: boolean | null
          is_parts?: boolean | null
          name: string
          notes?: string | null
          placement_statistics?: string | null
          premium_group?: string | null
          preparation_strategy?: string | null
          projects_assignments?: string | null
          quick_facts?: string | null
          short_notes?: string | null
          skills_learning_outcomes?: string | null
          syllabus?: string | null
          test_parts?: string | null
        }
        Update: {
          admission_procedure?: string | null
          alumni_stories?: string | null
          average_package?: string | null
          campus_life?: string | null
          chapter_wise_questions?: string | null
          course_comparison?: string | null
          course_curriculum?: string | null
          course_id?: string | null
          course_overview?: string | null
          created_at?: string | null
          day_in_life?: string | null
          degree_type?: string | null
          description?: string | null
          duration?: string | null
          entrance_exam_details?: string | null
          exam_id?: string | null
          exam_pattern?: string | null
          freemium_group?: string | null
          full_length_mocks?: string | null
          global_exposure?: string | null
          id?: string
          intake_capacity?: string | null
          is_calculator?: boolean | null
          is_parts?: boolean | null
          name?: string
          notes?: string | null
          placement_statistics?: string | null
          premium_group?: string | null
          preparation_strategy?: string | null
          projects_assignments?: string | null
          quick_facts?: string | null
          short_notes?: string | null
          skills_learning_outcomes?: string | null
          syllabus?: string | null
          test_parts?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "course_blog_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "course_blog_exam_id_fkey"
            columns: ["exam_id"]
            isOneToOne: false
            referencedRelation: "exams"
            referencedColumns: ["id"]
          },
        ]
      }
      courses: {
        Row: {
          admission_procedure: string | null
          alumni_stories: string | null
          average_package: string | null
          campus_life: string | null
          chapter_wise_questions: Json | null
          course_comparison: string | null
          course_curriculum: string | null
          course_overview: string | null
          created_at: string | null
          day_in_life: string | null
          degree_type: string | null
          description: string | null
          duration: string | null
          entrance_exam_details: string | null
          exam_id: string | null
          exam_pattern: string | null
          freemium_group: Json | null
          full_length_mocks: Json | null
          global_exposure: string | null
          id: string
          intake_capacity: string | null
          is_calculator: boolean | null
          is_parts: boolean | null
          name: string
          notes: string | null
          placement_statistics: string | null
          premium_group: Json | null
          preparation_strategy: string | null
          projects_assignments: string | null
          quick_facts: string | null
          short_notes: string | null
          skills_learning_outcomes: string | null
          syllabus: string | null
          test_parts: Json | null
          time: number | null
          updated_at: string | null
        }
        Insert: {
          admission_procedure?: string | null
          alumni_stories?: string | null
          average_package?: string | null
          campus_life?: string | null
          chapter_wise_questions?: Json | null
          course_comparison?: string | null
          course_curriculum?: string | null
          course_overview?: string | null
          created_at?: string | null
          day_in_life?: string | null
          degree_type?: string | null
          description?: string | null
          duration?: string | null
          entrance_exam_details?: string | null
          exam_id?: string | null
          exam_pattern?: string | null
          freemium_group?: Json | null
          full_length_mocks?: Json | null
          global_exposure?: string | null
          id?: string
          intake_capacity?: string | null
          is_calculator?: boolean | null
          is_parts?: boolean | null
          name: string
          notes?: string | null
          placement_statistics?: string | null
          premium_group?: Json | null
          preparation_strategy?: string | null
          projects_assignments?: string | null
          quick_facts?: string | null
          short_notes?: string | null
          skills_learning_outcomes?: string | null
          syllabus?: string | null
          test_parts?: Json | null
          time?: number | null
          updated_at?: string | null
        }
        Update: {
          admission_procedure?: string | null
          alumni_stories?: string | null
          average_package?: string | null
          campus_life?: string | null
          chapter_wise_questions?: Json | null
          course_comparison?: string | null
          course_curriculum?: string | null
          course_overview?: string | null
          created_at?: string | null
          day_in_life?: string | null
          degree_type?: string | null
          description?: string | null
          duration?: string | null
          entrance_exam_details?: string | null
          exam_id?: string | null
          exam_pattern?: string | null
          freemium_group?: Json | null
          full_length_mocks?: Json | null
          global_exposure?: string | null
          id?: string
          intake_capacity?: string | null
          is_calculator?: boolean | null
          is_parts?: boolean | null
          name?: string
          notes?: string | null
          placement_statistics?: string | null
          premium_group?: Json | null
          preparation_strategy?: string | null
          projects_assignments?: string | null
          quick_facts?: string | null
          short_notes?: string | null
          skills_learning_outcomes?: string | null
          syllabus?: string | null
          test_parts?: Json | null
          time?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "courses_exam_id_fkey"
            columns: ["exam_id"]
            isOneToOne: false
            referencedRelation: "exams"
            referencedColumns: ["id"]
          },
        ]
      }
      exam_blog: {
        Row: {
          admission_procedure: string | null
          campus: string | null
          campuses: string | null
          created_at: string | null
          cutoff_trends: string | null
          description: string | null
          detailed_description: string | null
          eligibility_criteria: string | null
          established_year: number | null
          exam_centers: string | null
          exam_id: string | null
          exam_pattern: string | null
          fees_scholarships: string | null
          global_collaborations: string | null
          history: string | null
          id: string
          important_dates: string | null
          infrastructure: string | null
          introduction: string | null
          location: string | null
          name: string
          placements: string | null
          preparation_tips: string | null
          pyqs: string | null
          rankings: string | null
          recognition: string | null
          recommended_books: string | null
          scholarships_stipends: string | null
          short_description: string | null
          short_notes: string | null
          syllabus: string | null
          why_choose: string | null
        }
        Insert: {
          admission_procedure?: string | null
          campus?: string | null
          campuses?: string | null
          created_at?: string | null
          cutoff_trends?: string | null
          description?: string | null
          detailed_description?: string | null
          eligibility_criteria?: string | null
          established_year?: number | null
          exam_centers?: string | null
          exam_id?: string | null
          exam_pattern?: string | null
          fees_scholarships?: string | null
          global_collaborations?: string | null
          history?: string | null
          id?: string
          important_dates?: string | null
          infrastructure?: string | null
          introduction?: string | null
          location?: string | null
          name: string
          placements?: string | null
          preparation_tips?: string | null
          pyqs?: string | null
          rankings?: string | null
          recognition?: string | null
          recommended_books?: string | null
          scholarships_stipends?: string | null
          short_description?: string | null
          short_notes?: string | null
          syllabus?: string | null
          why_choose?: string | null
        }
        Update: {
          admission_procedure?: string | null
          campus?: string | null
          campuses?: string | null
          created_at?: string | null
          cutoff_trends?: string | null
          description?: string | null
          detailed_description?: string | null
          eligibility_criteria?: string | null
          established_year?: number | null
          exam_centers?: string | null
          exam_id?: string | null
          exam_pattern?: string | null
          fees_scholarships?: string | null
          global_collaborations?: string | null
          history?: string | null
          id?: string
          important_dates?: string | null
          infrastructure?: string | null
          introduction?: string | null
          location?: string | null
          name?: string
          placements?: string | null
          preparation_tips?: string | null
          pyqs?: string | null
          rankings?: string | null
          recognition?: string | null
          recommended_books?: string | null
          scholarships_stipends?: string | null
          short_description?: string | null
          short_notes?: string | null
          syllabus?: string | null
          why_choose?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "exam_blog_exam_id_fkey"
            columns: ["exam_id"]
            isOneToOne: false
            referencedRelation: "exams"
            referencedColumns: ["id"]
          },
        ]
      }
      exams: {
        Row: {
          admission_procedure: string | null
          campus: string | null
          campuses: string | null
          created_at: string | null
          cutoff_trends: string | null
          description: string | null
          detailed_description: string | null
          eligibility_criteria: string | null
          established_year: string | null
          exam_centers: string | null
          exam_pattern: string | null
          faqs: string | null
          fees_scholarships: string | null
          global_collaborations: string | null
          history: string | null
          id: string
          important_dates: string | null
          infrastructure: string | null
          introduction: string | null
          location: string | null
          name: string
          placements: string | null
          preparation_tips: string | null
          pyqs: string | null
          rankings: string | null
          recognition: string | null
          recommended_books: string | null
          scholarships_stipends: string | null
          short_description: string | null
          short_notes: string | null
          syllabus: string | null
          updated_at: string | null
          why_choose: string | null
        }
        Insert: {
          admission_procedure?: string | null
          campus?: string | null
          campuses?: string | null
          created_at?: string | null
          cutoff_trends?: string | null
          description?: string | null
          detailed_description?: string | null
          eligibility_criteria?: string | null
          established_year?: string | null
          exam_centers?: string | null
          exam_pattern?: string | null
          faqs?: string | null
          fees_scholarships?: string | null
          global_collaborations?: string | null
          history?: string | null
          id?: string
          important_dates?: string | null
          infrastructure?: string | null
          introduction?: string | null
          location?: string | null
          name: string
          placements?: string | null
          preparation_tips?: string | null
          pyqs?: string | null
          rankings?: string | null
          recognition?: string | null
          recommended_books?: string | null
          scholarships_stipends?: string | null
          short_description?: string | null
          short_notes?: string | null
          syllabus?: string | null
          updated_at?: string | null
          why_choose?: string | null
        }
        Update: {
          admission_procedure?: string | null
          campus?: string | null
          campuses?: string | null
          created_at?: string | null
          cutoff_trends?: string | null
          description?: string | null
          detailed_description?: string | null
          eligibility_criteria?: string | null
          established_year?: string | null
          exam_centers?: string | null
          exam_pattern?: string | null
          faqs?: string | null
          fees_scholarships?: string | null
          global_collaborations?: string | null
          history?: string | null
          id?: string
          important_dates?: string | null
          infrastructure?: string | null
          introduction?: string | null
          location?: string | null
          name?: string
          placements?: string | null
          preparation_tips?: string | null
          pyqs?: string | null
          rankings?: string | null
          recognition?: string | null
          recommended_books?: string | null
          scholarships_stipends?: string | null
          short_description?: string | null
          short_notes?: string | null
          syllabus?: string | null
          updated_at?: string | null
          why_choose?: string | null
        }
        Relationships: []
      }
      generation_runs: {
        Row: {
          course_id: string
          created_at: string
          created_by: string | null
          id: string
          kind: string
          message: string | null
          params_json: Json | null
          slot_id: string | null
          status: string | null
        }
        Insert: {
          course_id: string
          created_at?: string
          created_by?: string | null
          id?: string
          kind: string
          message?: string | null
          params_json?: Json | null
          slot_id?: string | null
          status?: string | null
        }
        Update: {
          course_id?: string
          created_at?: string
          created_by?: string | null
          id?: string
          kind?: string
          message?: string | null
          params_json?: Json | null
          slot_id?: string | null
          status?: string | null
        }
        Relationships: []
      }
      mock_questions: {
        Row: {
          answer: string | null
          answer_diagram: Json | null
          correct_marks: number | null
          course_id: string | null
          created_at: string | null
          diagram_json: Json | null
          id: string
          incorrect_marks: number | null
          mock_name: string
          options: string[] | null
          options_diagrams: Json | null
          part: string | null
          part_id: string | null
          partial_marks: number | null
          question_statement: string
          question_type: string
          skipped_marks: number | null
          solution: string | null
          solution_diagram: Json | null
          time_minutes: number | null
        }
        Insert: {
          answer?: string | null
          answer_diagram?: Json | null
          correct_marks?: number | null
          course_id?: string | null
          created_at?: string | null
          diagram_json?: Json | null
          id?: string
          incorrect_marks?: number | null
          mock_name: string
          options?: string[] | null
          options_diagrams?: Json | null
          part?: string | null
          part_id?: string | null
          partial_marks?: number | null
          question_statement: string
          question_type: string
          skipped_marks?: number | null
          solution?: string | null
          solution_diagram?: Json | null
          time_minutes?: number | null
        }
        Update: {
          answer?: string | null
          answer_diagram?: Json | null
          correct_marks?: number | null
          course_id?: string | null
          created_at?: string | null
          diagram_json?: Json | null
          id?: string
          incorrect_marks?: number | null
          mock_name?: string
          options?: string[] | null
          options_diagrams?: Json | null
          part?: string | null
          part_id?: string | null
          partial_marks?: number | null
          question_statement?: string
          question_type?: string
          skipped_marks?: number | null
          solution?: string | null
          solution_diagram?: Json | null
          time_minutes?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "mock_questions_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
        ]
      }
      new_questions: {
        Row: {
          answer: string | null
          answer_diagram: Json | null
          chapter_id: string | null
          correct_marks: number | null
          created_at: string | null
          diagram_json: Json | null
          difficulty_level: string | null
          id: string
          incorrect_marks: number | null
          is_wrong: boolean | null
          options: string[] | null
          options_diagrams: Json | null
          part: string | null
          part_id: string | null
          partial_marks: number | null
          purpose: string | null
          question_statement: string
          question_type: string
          recheck_count: number | null
          skipped_marks: number | null
          slot: string | null
          slot_id: string | null
          solution: string | null
          solution_diagram: Json | null
          status: string | null
          time_minutes: number | null
          topic_id: string | null
          topic_name: string
          updated_at: string | null
          used_in_video: boolean | null
        }
        Insert: {
          answer?: string | null
          answer_diagram?: Json | null
          chapter_id?: string | null
          correct_marks?: number | null
          created_at?: string | null
          diagram_json?: Json | null
          difficulty_level?: string | null
          id?: string
          incorrect_marks?: number | null
          is_wrong?: boolean | null
          options?: string[] | null
          options_diagrams?: Json | null
          part?: string | null
          part_id?: string | null
          partial_marks?: number | null
          purpose?: string | null
          question_statement: string
          question_type: string
          recheck_count?: number | null
          skipped_marks?: number | null
          slot?: string | null
          slot_id?: string | null
          solution?: string | null
          solution_diagram?: Json | null
          status?: string | null
          time_minutes?: number | null
          topic_id?: string | null
          topic_name: string
          updated_at?: string | null
          used_in_video?: boolean | null
        }
        Update: {
          answer?: string | null
          answer_diagram?: Json | null
          chapter_id?: string | null
          correct_marks?: number | null
          created_at?: string | null
          diagram_json?: Json | null
          difficulty_level?: string | null
          id?: string
          incorrect_marks?: number | null
          is_wrong?: boolean | null
          options?: string[] | null
          options_diagrams?: Json | null
          part?: string | null
          part_id?: string | null
          partial_marks?: number | null
          purpose?: string | null
          question_statement?: string
          question_type?: string
          recheck_count?: number | null
          skipped_marks?: number | null
          slot?: string | null
          slot_id?: string | null
          solution?: string | null
          solution_diagram?: Json | null
          status?: string | null
          time_minutes?: number | null
          topic_id?: string | null
          topic_name?: string
          updated_at?: string | null
          used_in_video?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_part"
            columns: ["part_id"]
            isOneToOne: false
            referencedRelation: "parts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_slot"
            columns: ["slot_id"]
            isOneToOne: false
            referencedRelation: "slots"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "new_questions_chapter_id_fkey"
            columns: ["chapter_id"]
            isOneToOne: false
            referencedRelation: "chapters"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "new_questions_topic_id_fkey"
            columns: ["topic_id"]
            isOneToOne: false
            referencedRelation: "topics"
            referencedColumns: ["id"]
          },
        ]
      }
      parts: {
        Row: {
          course_id: string | null
          id: string
          part_name: string
          slot_id: string | null
        }
        Insert: {
          course_id?: string | null
          id?: string
          part_name: string
          slot_id?: string | null
        }
        Update: {
          course_id?: string | null
          id?: string
          part_name?: string
          slot_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "parts_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "parts_slot_id_fkey"
            columns: ["slot_id"]
            isOneToOne: false
            referencedRelation: "slots"
            referencedColumns: ["id"]
          },
        ]
      }
      question_usage: {
        Row: {
          created_at: string
          id: string
          question_id: string
          source_table: string
          used_in: string
          used_ref_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          question_id: string
          source_table: string
          used_in: string
          used_ref_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          question_id?: string
          source_table?: string
          used_in?: string
          used_ref_id?: string | null
        }
        Relationships: []
      }
      questions: {
        Row: {
          answer: string | null
          answer_diagram: Json | null
          categorized: boolean | null
          chapter_id: string | null
          correct_marks: number | null
          course_id: string | null
          created_at: string | null
          diagram_json: Json | null
          id: string
          incorrect_marks: number | null
          options: string[] | null
          options_diagrams: Json | null
          part: string | null
          part_id: string | null
          partial_marks: number | null
          question_statement: string
          question_type: string
          skipped_marks: number | null
          slot: string | null
          slot_id: string | null
          solution: string | null
          solution_diagram: Json | null
          time_minutes: number | null
          topic_id: string | null
          updated_at: string | null
          year: number | null
        }
        Insert: {
          answer?: string | null
          answer_diagram?: Json | null
          categorized?: boolean | null
          chapter_id?: string | null
          correct_marks?: number | null
          course_id?: string | null
          created_at?: string | null
          diagram_json?: Json | null
          id?: string
          incorrect_marks?: number | null
          options?: string[] | null
          options_diagrams?: Json | null
          part?: string | null
          part_id?: string | null
          partial_marks?: number | null
          question_statement: string
          question_type: string
          skipped_marks?: number | null
          slot?: string | null
          slot_id?: string | null
          solution?: string | null
          solution_diagram?: Json | null
          time_minutes?: number | null
          topic_id?: string | null
          updated_at?: string | null
          year?: number | null
        }
        Update: {
          answer?: string | null
          answer_diagram?: Json | null
          categorized?: boolean | null
          chapter_id?: string | null
          correct_marks?: number | null
          course_id?: string | null
          created_at?: string | null
          diagram_json?: Json | null
          id?: string
          incorrect_marks?: number | null
          options?: string[] | null
          options_diagrams?: Json | null
          part?: string | null
          part_id?: string | null
          partial_marks?: number | null
          question_statement?: string
          question_type?: string
          skipped_marks?: number | null
          slot?: string | null
          slot_id?: string | null
          solution?: string | null
          solution_diagram?: Json | null
          time_minutes?: number | null
          topic_id?: string | null
          updated_at?: string | null
          year?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "questions_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "questions_part_id_fkey"
            columns: ["part_id"]
            isOneToOne: false
            referencedRelation: "parts"
            referencedColumns: ["id"]
          },
        ]
      }
      questions_chapter_wise: {
        Row: {
          answer: string | null
          chapter_id: string | null
          chapter_name: string
          confidence_score: number | null
          correct_marks: number | null
          created_at: string | null
          id: string
          incorrect_marks: number | null
          options: string[] | null
          part: string | null
          part_id: string | null
          partial_marks: number | null
          question_id: string | null
          question_statement: string | null
          skipped_marks: number | null
          slot: string | null
          slot_id: string | null
          solution: string | null
          time_minutes: number | null
          updated_at: string | null
          year: number | null
        }
        Insert: {
          answer?: string | null
          chapter_id?: string | null
          chapter_name: string
          confidence_score?: number | null
          correct_marks?: number | null
          created_at?: string | null
          id?: string
          incorrect_marks?: number | null
          options?: string[] | null
          part?: string | null
          part_id?: string | null
          partial_marks?: number | null
          question_id?: string | null
          question_statement?: string | null
          skipped_marks?: number | null
          slot?: string | null
          slot_id?: string | null
          solution?: string | null
          time_minutes?: number | null
          updated_at?: string | null
          year?: number | null
        }
        Update: {
          answer?: string | null
          chapter_id?: string | null
          chapter_name?: string
          confidence_score?: number | null
          correct_marks?: number | null
          created_at?: string | null
          id?: string
          incorrect_marks?: number | null
          options?: string[] | null
          part?: string | null
          part_id?: string | null
          partial_marks?: number | null
          question_id?: string | null
          question_statement?: string | null
          skipped_marks?: number | null
          slot?: string | null
          slot_id?: string | null
          solution?: string | null
          time_minutes?: number | null
          updated_at?: string | null
          year?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "questions_chapter_wise_chapter_id_fkey"
            columns: ["chapter_id"]
            isOneToOne: false
            referencedRelation: "chapters"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "questions_chapter_wise_question_id_fkey"
            columns: ["question_id"]
            isOneToOne: false
            referencedRelation: "questions"
            referencedColumns: ["id"]
          },
        ]
      }
      questions_topic_wise: {
        Row: {
          answer: string | null
          answer_diagram: Json | null
          answer_done: boolean | null
          chapter_id: string | null
          confidence_score: number | null
          correct_marks: number | null
          created_at: string | null
          diagram_json: Json[] | null
          formatting_checked: string | null
          id: string
          incorrect_marks: number | null
          is_primary: boolean | null
          is_wrong: string | null
          options: string[] | null
          options_diagrams: Json[] | null
          part: string | null
          part_id: string | null
          partial_marks: number | null
          purpose: string | null
          question_id: string | null
          question_statement: string | null
          question_type: string | null
          skipped_marks: number | null
          slot: string | null
          slot_id: string | null
          solution: string | null
          solution_diagram: Json | null
          solution_done: boolean | null
          time_minutes: number | null
          topic_id: string | null
          topic_name: string | null
          updated_at: string | null
          year: number | null
        }
        Insert: {
          answer?: string | null
          answer_diagram?: Json | null
          answer_done?: boolean | null
          chapter_id?: string | null
          confidence_score?: number | null
          correct_marks?: number | null
          created_at?: string | null
          diagram_json?: Json[] | null
          formatting_checked?: string | null
          id?: string
          incorrect_marks?: number | null
          is_primary?: boolean | null
          is_wrong?: string | null
          options?: string[] | null
          options_diagrams?: Json[] | null
          part?: string | null
          part_id?: string | null
          partial_marks?: number | null
          purpose?: string | null
          question_id?: string | null
          question_statement?: string | null
          question_type?: string | null
          skipped_marks?: number | null
          slot?: string | null
          slot_id?: string | null
          solution?: string | null
          solution_diagram?: Json | null
          solution_done?: boolean | null
          time_minutes?: number | null
          topic_id?: string | null
          topic_name?: string | null
          updated_at?: string | null
          year?: number | null
        }
        Update: {
          answer?: string | null
          answer_diagram?: Json | null
          answer_done?: boolean | null
          chapter_id?: string | null
          confidence_score?: number | null
          correct_marks?: number | null
          created_at?: string | null
          diagram_json?: Json[] | null
          formatting_checked?: string | null
          id?: string
          incorrect_marks?: number | null
          is_primary?: boolean | null
          is_wrong?: string | null
          options?: string[] | null
          options_diagrams?: Json[] | null
          part?: string | null
          part_id?: string | null
          partial_marks?: number | null
          purpose?: string | null
          question_id?: string | null
          question_statement?: string | null
          question_type?: string | null
          skipped_marks?: number | null
          slot?: string | null
          slot_id?: string | null
          solution?: string | null
          solution_diagram?: Json | null
          solution_done?: boolean | null
          time_minutes?: number | null
          topic_id?: string | null
          topic_name?: string | null
          updated_at?: string | null
          year?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "questions_topic_wise_question_id_fkey"
            columns: ["question_id"]
            isOneToOne: false
            referencedRelation: "questions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "questions_topic_wise_topic_id_fkey"
            columns: ["topic_id"]
            isOneToOne: false
            referencedRelation: "topics"
            referencedColumns: ["id"]
          },
        ]
      }
      slots: {
        Row: {
          course_id: string | null
          id: string
          slot_name: string
        }
        Insert: {
          course_id?: string | null
          id?: string
          slot_name: string
        }
        Update: {
          course_id?: string | null
          id?: string
          slot_name?: string
        }
        Relationships: [
          {
            foreignKeyName: "slots_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
        ]
      }
      subject_weightage: {
        Row: {
          course_id: string
          created_at: string | null
          id: string
          part_id: string | null
          slot_id: string | null
          subject_id: string
          updated_at: string | null
          weightage_percent: number
        }
        Insert: {
          course_id: string
          created_at?: string | null
          id?: string
          part_id?: string | null
          slot_id?: string | null
          subject_id: string
          updated_at?: string | null
          weightage_percent?: number
        }
        Update: {
          course_id?: string
          created_at?: string | null
          id?: string
          part_id?: string | null
          slot_id?: string | null
          subject_id?: string
          updated_at?: string | null
          weightage_percent?: number
        }
        Relationships: []
      }
      subjects: {
        Row: {
          course_id: string | null
          created_at: string | null
          description: string | null
          id: string
          name: string
          order_index: number | null
          parts: string | null
          slots: string | null
          updated_at: string | null
        }
        Insert: {
          course_id?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          name: string
          order_index?: number | null
          parts?: string | null
          slots?: string | null
          updated_at?: string | null
        }
        Update: {
          course_id?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          name?: string
          order_index?: number | null
          parts?: string | null
          slots?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "subjects_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
        ]
      }
      test_questions: {
        Row: {
          answer: string | null
          answer_diagram: Json | null
          correct_marks: number | null
          course_id: string | null
          created_at: string | null
          diagram_json: Json | null
          id: string
          incorrect_marks: number | null
          options: string[] | null
          options_diagrams: Json | null
          part: string | null
          part_id: string | null
          partial_marks: number | null
          question_statement: string
          question_type: string
          skipped_marks: number | null
          solution: string | null
          solution_diagram: Json | null
          test_name: string
          time_minutes: number | null
        }
        Insert: {
          answer?: string | null
          answer_diagram?: Json | null
          correct_marks?: number | null
          course_id?: string | null
          created_at?: string | null
          diagram_json?: Json | null
          id?: string
          incorrect_marks?: number | null
          options?: string[] | null
          options_diagrams?: Json | null
          part?: string | null
          part_id?: string | null
          partial_marks?: number | null
          question_statement: string
          question_type: string
          skipped_marks?: number | null
          solution?: string | null
          solution_diagram?: Json | null
          test_name: string
          time_minutes?: number | null
        }
        Update: {
          answer?: string | null
          answer_diagram?: Json | null
          correct_marks?: number | null
          course_id?: string | null
          created_at?: string | null
          diagram_json?: Json | null
          id?: string
          incorrect_marks?: number | null
          options?: string[] | null
          options_diagrams?: Json | null
          part?: string | null
          part_id?: string | null
          partial_marks?: number | null
          question_statement?: string
          question_type?: string
          skipped_marks?: number | null
          solution?: string | null
          solution_diagram?: Json | null
          test_name?: string
          time_minutes?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "test_questions_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
        ]
      }
      topics: {
        Row: {
          chapter_id: string | null
          created_at: string | null
          description: string | null
          id: string
          is_mcq_done: boolean | null
          is_msq_done: boolean | null
          is_nat_done: boolean | null
          is_notes_done: boolean | null
          is_short_notes_done: boolean | null
          is_sub_done: boolean | null
          name: string
          notes: string | null
          parts: string | null
          short_notes: string | null
          slots: string | null
          updated_at: string | null
          weightage: number | null
        }
        Insert: {
          chapter_id?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          is_mcq_done?: boolean | null
          is_msq_done?: boolean | null
          is_nat_done?: boolean | null
          is_notes_done?: boolean | null
          is_short_notes_done?: boolean | null
          is_sub_done?: boolean | null
          name: string
          notes?: string | null
          parts?: string | null
          short_notes?: string | null
          slots?: string | null
          updated_at?: string | null
          weightage?: number | null
        }
        Update: {
          chapter_id?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          is_mcq_done?: boolean | null
          is_msq_done?: boolean | null
          is_nat_done?: boolean | null
          is_notes_done?: boolean | null
          is_short_notes_done?: boolean | null
          is_sub_done?: boolean | null
          name?: string
          notes?: string | null
          parts?: string | null
          short_notes?: string | null
          slots?: string | null
          updated_at?: string | null
          weightage?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "topics_chapter_id_fkey"
            columns: ["chapter_id"]
            isOneToOne: false
            referencedRelation: "chapters"
            referencedColumns: ["id"]
          },
        ]
      }
      topics_weightage: {
        Row: {
          created_at: string
          id: string
          part_id: string | null
          slot_id: string | null
          topic_id: string | null
          weightage_percent: number | null
        }
        Insert: {
          created_at?: string
          id?: string
          part_id?: string | null
          slot_id?: string | null
          topic_id?: string | null
          weightage_percent?: number | null
        }
        Update: {
          created_at?: string
          id?: string
          part_id?: string | null
          slot_id?: string | null
          topic_id?: string | null
          weightage_percent?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "topics_weightage_part_id_fkey"
            columns: ["part_id"]
            isOneToOne: false
            referencedRelation: "parts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "topics_weightage_slot_id_fkey"
            columns: ["slot_id"]
            isOneToOne: false
            referencedRelation: "slots"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "topics_weightage_topic_id_fkey"
            columns: ["topic_id"]
            isOneToOne: false
            referencedRelation: "topics"
            referencedColumns: ["id"]
          },
        ]
      }
      units: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          name: string
          order_index: number | null
          parts: string | null
          slots: string | null
          subject_id: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          name: string
          order_index?: number | null
          parts?: string | null
          slots?: string | null
          subject_id?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          name?: string
          order_index?: number | null
          parts?: string | null
          slots?: string | null
          subject_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "units_subject_id_fkey"
            columns: ["subject_id"]
            isOneToOne: false
            referencedRelation: "subjects"
            referencedColumns: ["id"]
          },
        ]
      }
      videos: {
        Row: {
          answer_solution: string | null
          audio: string | null
          audio_url: string | null
          captions_data: Json | null
          course_id: string
          created_at: string
          id: string
          question_id: string | null
          script: string
          status: string | null
          template_id: number | null
          updated_at: string | null
          video_url: string | null
        }
        Insert: {
          answer_solution?: string | null
          audio?: string | null
          audio_url?: string | null
          captions_data?: Json | null
          course_id?: string
          created_at?: string
          id?: string
          question_id?: string | null
          script: string
          status?: string | null
          template_id?: number | null
          updated_at?: string | null
          video_url?: string | null
        }
        Update: {
          answer_solution?: string | null
          audio?: string | null
          audio_url?: string | null
          captions_data?: Json | null
          course_id?: string
          created_at?: string
          id?: string
          question_id?: string | null
          script?: string
          status?: string | null
          template_id?: number | null
          updated_at?: string | null
          video_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "videos_question_id_fkey"
            columns: ["question_id"]
            isOneToOne: false
            referencedRelation: "new_questions"
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
