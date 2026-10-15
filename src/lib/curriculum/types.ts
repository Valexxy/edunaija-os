export type EducationLevel =
  | "primary"
  | "junior_secondary"
  | "senior_secondary"
  | "exam_prep"
  | "tertiary"
  | "other";

export type ContentStatus = "draft" | "in_review" | "published" | "archived";

export type SourceType =
  | "official"
  | "school_provided"
  | "teacher_provided"
  | "parent_uploaded"
  | "community"
  | "ai_generated"
  | "licensed";

export type QuestionType = "single_choice" | "multiple_choice" | "short_answer" | "essay";

export type AcademicTrack =
  | "science"
  | "arts"
  | "commercial"
  | "technical"
  | "general";

export interface Subject {
  id: string;
  slug: string;
  name: string;
  description: string;
  education_levels: EducationLevel[];
  track?: AcademicTrack;
}

export interface CurriculumSource {
  id: string;
  title: string;
  source_type: SourceType;
  issuing_body: string;
  source_url?: string;
  version_label?: string;
  is_official_verified: boolean;
  status: ContentStatus;
}

export interface CurriculumTopic {
  id: string;
  source_id: string;
  subject_id: string;
  parent_topic_id?: string;
  code: string;
  title: string;
  description: string;
  education_level: EducationLevel;
  sort_order: number;
  status: ContentStatus;
}

export interface QuestionOption {
  id: string;
  text: string;
}

export interface Question {
  id: string;
  topic_id: string;
  question_type: QuestionType;
  prompt: string;
  options: QuestionOption[];
  answer_key: {
    correctOptionId?: string;
    correctOptionIds?: string[];
    acceptableAnswers?: string[];
  };
  explanation: string;
  difficulty: number; // 1 to 5
  status: ContentStatus;
  provenance: SourceType;
  license_notes?: string;
}

// Client-safe projection: answer keys and explanations are omitted until after submission
export interface PublicQuestionItem {
  id: string;
  topic_id: string;
  question_type: QuestionType;
  prompt: string;
  options: QuestionOption[];
  difficulty: number;
  status: ContentStatus;
  provenance: SourceType;
}
