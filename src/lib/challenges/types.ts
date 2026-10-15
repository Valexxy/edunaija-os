export type ChallengeStatus =
  | "draft"
  | "open"
  | "in_progress"
  | "under_review"
  | "finalized"
  | "cancelled";

export type ChallengeTier =
  | "all"
  | "primary"
  | "junior"
  | "senior_science"
  | "senior_arts"
  | "senior_commercial";

export type CompetitionStage = "lga" | "state" | "zonal" | "national";

export type ChallengeCategory = "national_pyramid" | "peer_duel" | "study_circle";

export interface Challenge {
  id: string;
  title: string;
  created_by: string;
  assessment_id: string;
  status: ChallengeStatus;
  starts_at?: string;
  ends_at?: string;
  prize_description?: string;
  rules_version: string;
  tier?: ChallengeTier;
  stage?: CompetitionStage;
  category?: ChallengeCategory;
  join_code?: string;
  subject_id?: string;
  topic_id?: string;
  created_by_name?: string;
  participants_count?: number;
}

export interface ChallengeParticipant {
  challenge_id: string;
  user_id: string;
  displayName: string;
  attempt_id?: string;
  score?: number;
  completion_seconds?: number;
  verification_status: "unverified" | "pending" | "verified" | "rejected";
  review_status: "pending" | "clear" | "flagged" | "appealed" | "disqualified";
  joined_at: string;
}

export interface LeaderboardRankItem {
  rank: number;
  userId: string;
  displayName: string;
  score: number;
  completionSeconds: number;
  verificationStatus: string;
}
