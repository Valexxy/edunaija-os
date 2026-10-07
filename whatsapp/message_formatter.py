def format_question(q: dict, hearts: int, streak: int) -> str:
    """Format question for WhatsApp"""
    return f"""
*{q.get('subject', 'Subject')}* (JAMB {q.get('year', '2023')})
Difficulty: {q.get('difficulty', 'Medium')}

{q.get('text', '')}

A) {q.get('options', {}).get('A', '')}
B) {q.get('options', {}).get('B', '')}
C) {q.get('options', {}).get('C', '')}
D) {q.get('options', {}).get('D', '')}

Reply A, B, C, or D!
❤️ {hearts} | 🔥 Streak: {streak}
    """.strip()

def format_correct_answer(explanation: str, xp_earned: int, new_streak: int) -> str:
    return f"""
✅ *CORRECT!* 🔥 Streak: {new_streak}
+{xp_earned} XP

_Explanation:_
{explanation}

Type *QUIZ* for the next question!
    """.strip()

def format_wrong_answer(correct: str, explanation: str, topic_to_review: str) -> str:
    return f"""
❌ *WRONG*

The correct answer was *{correct}*.

_Explanation:_
{explanation}

📚 Recommended Review: {topic_to_review}

Type *QUIZ* to try another one!
    """.strip()

def format_hearts_empty(share_link: str, cram_pass_link: str) -> str:
    return f"""
💔 *Out of Hearts!*

You've practiced a lot today!
Get more hearts:
1️⃣ Share with a friend: {share_link}
2️⃣ Upgrade to Cram & Pass: {cram_pass_link}

Or wait until tomorrow for a free refill!
    """.strip()

def format_parent_report(student_name: str, week_data: dict) -> str:
    return f"""
📊 *EduNaija Weekly Report*
Student: {student_name}

📝 Questions attempted: {week_data.get('attempted', 0)}
🎯 Accuracy: {week_data.get('accuracy', 0)}%
📈 Predicted JAMB Score: {week_data.get('predicted_score', 0)}

_Weak Topics:_
{', '.join(week_data.get('weak_topics', []))}

Upgrade their account for unlimited practice: edunaija.com/parent
    """.strip()

def format_leaderboard(entries: list, user_rank: int) -> str:
    lines = ["🏆 *Leaderboard* 🏆", ""]
    for i, entry in enumerate(entries[:5], 1):
        lines.append(f"{i}. {entry['name']} - {entry['xp']} XP")
    lines.append("")
    lines.append(f"Your Rank: #{user_rank}")
    return "\\n".join(lines)

def format_score_prediction(predicted_score: int, target: int, days_needed: int) -> str:
    return f"""
🔮 *JAMB Score Prediction*

Current Prediction: *{predicted_score}*
Your Target: *{target}*

Keep practicing for {days_needed} more days to reach your target!
    """.strip()
