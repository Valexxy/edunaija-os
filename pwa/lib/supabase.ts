import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
  realtime: {
    params: {
      eventsPerSecond: 10,
    },
  },
});

// Type definitions for our database
export type Database = {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          telegram_id: number;
          first_name: string;
          hearts: number;
          max_hearts: number;
          streak_days: number;
          xp_points: number;
          referral_code: string;
          created_at: string;
        };
      };
      past_questions: {
        Row: {
          id: string;
          question_text: string;
          option_a: string;
          option_b: string;
          option_c: string;
          option_d: string;
          correct_option: string;
          explanation: string;
          year: number;
          exam_type: string;
          difficulty_score: number;
        };
      };
      competition_rooms: {
        Row: {
          id: string;
          room_code: string;
          name: string;
          status: string;
          max_players: number;
          question_count: number;
        };
      };
    };
  };
};
