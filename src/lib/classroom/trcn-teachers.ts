/**
 * TRCN Accredited Faculty and Classroom Scheduling Definitions
 */

export interface TrcnTeacherSchedule {
  roomName: string;
  fullName: string;
  trcnNumber: string;
  trcnCategory: string;
  stateOfPractice: string;
  qualification: string;
  specialization: string;
  ninVerified: boolean;
  rating: number;
  scheduledTopic: string;
}

export const MOCK_TRCN_TEACHERS: TrcnTeacherSchedule[] = [
  {
    roomName: "maths-mechanics",
    fullName: "Mr. Babatunde Alabi, M.Ed",
    trcnNumber: "TRCN/LA/CAT-B/2021/0081",
    trcnCategory: "Category B (Post-Graduate)",
    stateOfPractice: "Lagos",
    qualification: "B.Ed, M.Ed Mathematics Education (UNILAG)",
    specialization: "General Mathematics & Further Maths",
    ninVerified: true,
    rating: 4.95,
    scheduledTopic: "Calculus: Differentiation from First Principles"
  },
  {
    roomName: "physics-kinematics",
    fullName: "Mrs. Ngozi Eze, B.Sc, PGDE",
    trcnNumber: "TRCN/AN/CAT-C/2020/0394",
    trcnCategory: "Category C (Degree Holder)",
    stateOfPractice: "Anambra",
    qualification: "B.Sc Pure Physics (UNN), PGDE",
    specialization: "Physics & Mechanics",
    ninVerified: true,
    rating: 4.88,
    scheduledTopic: "Linear Momentum and Newton\'s Laws of Motion"
  },
  {
    roomName: "english-lexis",
    fullName: "Mallam Ibrahim Danfulani, NCE, B.Ed",
    trcnNumber: "TRCN/KD/CAT-C/2019/0712",
    trcnCategory: "Category C (Degree Holder)",
    stateOfPractice: "Kaduna",
    qualification: "NCE, B.Ed English Language (ABU Zaria)",
    specialization: "English Concord & Oral Phonetics",
    ninVerified: true,
    rating: 4.92,
    scheduledTopic: "Concord and Sentence Structure Patterns"
  }
];
