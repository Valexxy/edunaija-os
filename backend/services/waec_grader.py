import json

class WAECTheoryGrader:
    """
    First-ever AI grader for WAEC-style theory answers in Nigeria.
    This is the feature that makes global developers notice us.
    
    WAEC awards partial marks:
    - Full marks: Complete, accurate answer with all steps
    - Partial: Correct method, arithmetic error -> -1 mark
    - Partial: Right formula, wrong substitution -> -2 marks
    - Zero: Wrong approach entirely
    """
    
    GRADER_PROMPT = """
    You are a WAEC examiner grading a student's answer.
    
    MARKING GUIDE: {marking_guide}
    STUDENT ANSWER: {student_answer}
    TOTAL MARKS: {total_marks}
    
    Award marks based on the marking guide. 
    For each step in the marking guide:
    - Award the specified marks if the student shows that work
    - Award partial marks if approach is correct but there's a minor error
    - Award 0 if step is missing or fundamentally wrong
    
    Return JSON: {{
        'marks_awarded': X,
        'total_marks': Y,
        'grade': 'A1/B2/B3/C4/C5/C6/D7/E8/F9',
        'feedback': 'Step-by-step feedback',
        'missed_marks_explanation': 'What was missing'
    }}
    """
    
    async def grade(self, question_id: str, student_answer: str) -> dict:
        # Mocking the AI call for demonstration
        marking_guide = "Step 1: Formula (2 marks), Step 2: Substitution (3 marks), Step 3: Result (5 marks)"
        total_marks = 10
        
        # Simulate AI processing
        return {
            'marks_awarded': 7,
            'total_marks': total_marks,
            'grade': 'C4',
            'feedback': 'Good attempt. You got the formula and substitution right, but the final calculation was wrong.',
            'missed_marks_explanation': 'Lost 3 marks for incorrect final result.'
        }
