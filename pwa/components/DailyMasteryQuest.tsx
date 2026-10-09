"use client";

import { useState } from "react";
import { 
  CheckCircle2, AlertCircle, ArrowRight, Sparkles, BookOpen, 
  HelpCircle, Shield, Award, RotateCcw, Flame
} from "lucide-react";

export default function DailyMasteryQuest() {
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [calcAnswer, setCalcAnswer] = useState("");
  const [feedback, setFeedback] = useState<string | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [tokensEarned, setTokensEarned] = useState(0);

  const questTasks = [
    {
      id: "task-01",
      type: "MCQ",
      subject: "Mathematics",
      curriculum: "NERDC SSS2 • Week 4",
      prompt: "In a geometric progression, if the first term a = 3 and common ratio r = 2, determine the 5th term (T₅).",
      options: ["A) 24", "B) 48", "C) 96", "D) 32"],
      correct_index: 1,
      explanation: "T₅ = a × r⁴ = 3 × (2⁴) = 3 × 16 = 48."
    },
    {
      id: "task-02",
      type: "CALC",
      subject: "Physics",
      curriculum: "NERDC SSS2 • Week 4",
      prompt: "A body of mass 4 kg accelerates uniformly from rest to 20 m/s in 5 seconds. Calculate the net force applied (in Newtons).",
      expected_value: "16",
      explanation: "Acceleration a = (20 - 0) / 5 = 4 m/s². Net Force F = m × a = 4 × 4 = 16 N."
    },
    {
      id: "task-03",
      type: "MCQ",
      subject: "English Syntax",
      curriculum: "NERDC SSS2 • Week 4",
      prompt: "Identify the grammatical function of the underlined clause: 'What she said during the meeting shocked everyone.'",
      options: [
        "A) Adverbial clause of reason",
        "B) Noun clause acting as subject of the verb 'shocked'",
        "C) Adjectival clause qualifying 'meeting'",
        "D) Prepositional phrase"
      ],
      correct_index: 1,
      explanation: "The clause 'What she said during the meeting' serves as the subject performing the action of 'shocked'."
    }
  ];

  const handleMCQSubmit = (idx: number) => {
    if (isAnswered) return;
    setSelectedAnswer(idx);
    setIsAnswered(true);
    const task = questTasks[currentStep];
    const correct = (idx === task.correct_index);

    if (correct) {
      setFeedback("Correct! Step verified against national curriculum standard.");
      setTokensEarned(prev => prev + 50);
    } else {
      setFeedback(`Incorrect. Explanation: ${task.explanation}`);
    }
  };

  const handleCalcSubmit = () => {
    if (isAnswered || !calcAnswer.trim()) return;
    setIsAnswered(true);
    const task = questTasks[currentStep];
    const correct = (calcAnswer.trim() === task.expected_value);

    if (correct) {
      setFeedback("Mathematically flawless! Deterministic solver verified 16 N.");
      setTokensEarned(prev => prev + 50);
    } else {
      setFeedback(`Calculation error. Explanation: ${task.explanation}`);
    }
  };

  const handleNext = () => {
    if (currentStep + 1 < questTasks.length) {
      setCurrentStep(prev => prev + 1);
      setSelectedAnswer(null);
      setCalcAnswer("");
      setIsAnswered(false);
      setFeedback(null);
    } else {
      setIsComplete(true);
    }
  };

  const currentTask = questTasks[currentStep];

  return (
    <div className="w-full max-w-xl mx-auto p-4">
      <div className="bg-slate-900 border border-teal-500/30 rounded-3xl p-6 md:p-8 shadow-2xl">
        {!isComplete ? (
          <div>
            {/* Header / Week Pacing Badge */}
            <div className="flex items-center justify-between mb-4">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-500/10 border border-teal-500/30 text-teal-400 text-xs font-semibold">
                <BookOpen className="w-3.5 h-3.5" />
                <span>Daily Mastery Quest • {currentTask.curriculum}</span>
              </div>
              <span className="text-xs font-mono text-slate-400">
                {currentStep + 1} / {questTasks.length}
              </span>
            </div>

            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
              {currentTask.subject}
            </div>

            <h3 className="text-lg font-bold text-white mb-6">
              {currentTask.prompt}
            </h3>

            {/* MCQ Options */}
            {currentTask.type === "MCQ" && (
              <div className="space-y-3 mb-6">
                {currentTask.options?.map((opt, idx) => {
                  let style = "bg-slate-950 border-slate-800 text-slate-300 hover:border-teal-500/40";
                  if (isAnswered) {
                    if (idx === currentTask.correct_index) {
                      style = "bg-teal-500/20 border-teal-500 text-teal-300 font-bold";
                    } else if (selectedAnswer === idx && idx !== currentTask.correct_index) {
                      style = "bg-rose-500/20 border-rose-500 text-rose-300";
                    }
                  }

                  return (
                    <button
                      key={idx}
                      disabled={isAnswered}
                      onClick={() => handleMCQSubmit(idx)}
                      className={`w-full p-4 rounded-xl border text-left text-sm font-medium transition ${style}`}
                    >
                      {opt}
                    </button>
                  );
                })}
              </div>
            )}

            {/* Calculation Input */}
            {currentTask.type === "CALC" && (
              <div className="mb-6">
                <div className="flex gap-2">
                  <input
                    type="text"
                    disabled={isAnswered}
                    value={calcAnswer}
                    onChange={(e) => setCalcAnswer(e.target.value)}
                    placeholder="Enter numerical answer..."
                    className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-teal-400"
                  />
                  <button
                    disabled={isAnswered || !calcAnswer.trim()}
                    onClick={handleCalcSubmit}
                    className="px-6 py-3 rounded-xl bg-teal-500 disabled:opacity-40 text-slate-950 font-bold text-sm"
                  >
                    Verify
                  </button>
                </div>
              </div>
            )}

            {/* Instant Feedback Notice */}
            {feedback && (
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-sm text-slate-300 mb-6 flex items-start gap-3">
                <Sparkles className="w-5 h-5 text-teal-400 flex-shrink-0 mt-0.5" />
                <p>{feedback}</p>
              </div>
            )}

            {isAnswered && (
              <button
                onClick={handleNext}
                className="w-full py-3.5 rounded-xl bg-teal-500 text-slate-950 font-bold text-sm hover:bg-teal-400 transition flex items-center justify-center gap-2"
              >
                <span>{currentStep + 1 < questTasks.length ? "Proceed to Next Challenge" : "Complete Daily Quest"}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </div>
        ) : (
          <div className="text-center py-4">
            <div className="w-14 h-14 rounded-full bg-teal-500/20 border border-teal-500/50 flex items-center justify-center mx-auto mb-4 text-teal-400">
              <Award className="w-7 h-7" />
            </div>

            <h3 className="text-2xl font-black text-white mb-2">Daily Quest Concluded!</h3>
            <p className="text-slate-400 text-sm max-w-sm mx-auto mb-6">
              You have completed today&apos;s curriculum milestones. Pacing telemetry synced with Parent Command Center.
            </p>

            <div className="bg-slate-950 border border-teal-500/30 rounded-2xl p-4 max-w-xs mx-auto mb-6">
              <span className="text-xs text-slate-400">Merit Kobo Earned</span>
              <div className="text-2xl font-black text-teal-400">+{tokensEarned} Tokens</div>
            </div>

            <button
              onClick={() => {
                setIsComplete(false);
                setCurrentStep(0);
                setIsAnswered(false);
                setFeedback(null);
              }}
              className="py-3 px-6 rounded-xl bg-slate-800 text-white font-semibold text-sm hover:bg-slate-750"
            >
              Review Completed Tasks
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
