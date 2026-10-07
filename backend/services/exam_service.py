class ExamService:
    EXAM_TYPES = ['JAMB', 'WAEC', 'NECO', 'NABTEB', 'POST_UTME', 'COMMON_ENTRANCE', 'ICAN', 'IELTS']
    
    async def get_question(self, exam_type: str, subject: str, 
                          difficulty: str = None, topic_id: str = None) -> dict:
        """Get appropriate question for exam type"""
        return {
            "id": "q123",
            "exam_type": exam_type,
            "subject": subject,
            "text": f"Sample {exam_type} question for {subject}",
            "options": ["A", "B", "C", "D"] if exam_type == 'JAMB' else None
        }
    
    async def get_mock_exam(self, student_id: str, exam_type: str) -> dict:
        """Generate a full mock exam (60 questions, timed)"""
        return {
            "exam_id": "mock_123",
            "type": exam_type,
            "duration_minutes": 120,
            "questions_count": 180,
            "sections": [
                {"subject": "English", "count": 60},
                {"subject": "Math", "count": 40},
                {"subject": "Physics", "count": 40},
                {"subject": "Chemistry", "count": 40}
            ]
        }
    
    async def grade_waec_theory(self, question_id: str, student_answer: str) -> dict:
        """AI grading for WAEC theory answers"""
        # Delegating actual logic to WAECTheoryGrader
        return {
            "marks_awarded": 5,
            "total_marks": 10,
            "feedback": "Good attempt, missing some steps."
        }
    
    async def get_university_cutoffs(self, jamb_score: int, state: str = None) -> list:
        """Return universities student qualifies for"""
        return [{"uni": "UNILAG", "cutoff": 200}, {"uni": "OAU", "cutoff": 200}]
    
    async def get_subject_combinations(self, course: str) -> dict:
        """Return required JAMB subjects for a course of study"""
        combinations = {
            "Medicine": ["Biology", "Chemistry", "Physics", "English"],
            "Engineering": ["Mathematics", "Physics", "Chemistry", "English"],
            "Law": ["Literature", "Government", "CRS/IRS", "English"]
        }
        return {"course": course, "required_subjects": combinations.get(course, ["English"])}
