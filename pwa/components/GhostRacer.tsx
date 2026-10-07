"use client";

import GhostPacingEngine from "./GhostPacingEngine";

interface GhostRacerProps {
  currentQuestion: number;
  totalQuestions: number;
  ghostQuestion?: number;
  examType?: string;
  timeElapsed?: number;
}

export default function GhostRacer({ 
  currentQuestion, 
  totalQuestions, 
  examType = "UTME",
  timeElapsed = 0
}: GhostRacerProps) {
  // If timeElapsed is not passed, estimate it based on question index (approx 45s per Q)
  const effectiveElapsed = timeElapsed > 0 ? timeElapsed : Math.max(1, currentQuestion * 45);

  return (
    <GhostPacingEngine 
      examType={examType}
      questionCount={totalQuestions}
      currentQuestion={currentQuestion}
      timeElapsed={effectiveElapsed}
      isActive={true}
    />
  );
}
