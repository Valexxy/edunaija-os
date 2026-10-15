export type TutorRequest = {
  question: string;
  learnerLevel: "primary" | "junior_secondary" | "senior_secondary" | "exam_prep";
  subject?: string;
  topic?: string;
  language?: "en" | "pcm";
  curriculumGuidance?: string;
  citation?: string;
};

export type TutorResponse = {
  explanation: string;
  keyPoints: string[];
  practiceQuestion?: string;
  provider: string;
  model: string;
  citation?: string;
  curriculumSource?: string;
};

export interface TutorProvider {
  explain(input: TutorRequest): Promise<TutorResponse>;
}

