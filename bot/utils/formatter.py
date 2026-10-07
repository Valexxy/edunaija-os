def format_question(data: dict) -> str:
    subject = data["subject"].upper()
    number = data["number"]
    total = data["total"]
    text = data["text"]
    opts = data["options"]
    hearts = data["hearts_remaining"]
    streak = data["streak"]
    time_limit = data["time_limit"]
    
    return (
        f"📚 {subject} | Question {number} of {total}\n"
        f"━━━━━━━━━━━━━━━━━━━━━━\n"
        f"{text}\n\n"
        f"🅐 {opts['A']}\n"
        f"🅑 {opts['B']}\n"
        f"🅒 {opts['C']}\n"
        f"🅓 {opts['D']}\n\n"
        f"❤️ {hearts} hearts remaining | 🔥 Day {streak} streak\n"
        f"━━━━━━━━━━━━━━━━━━━━━━\n"
        f"⏱️ Time: {time_limit}"
    )

def format_leaderboard(entries: list[dict], user_rank: dict) -> str:
    text = "🏆 LEADERBOARD 🏆\n━━━━━━━━━━━━━━━━━━━━━━\n"
    medals = ["🥇", "🥈", "🥉"]
    for i, entry in enumerate(entries):
        medal = medals[i] if i < len(medals) else f"{i+1}."
        text += f"{medal} {entry['name']} - {entry['score']} XP\n"
    
    text += f"\n...\n{user_rank['rank']}. {user_rank['name']} - {user_rank['score']} XP"
    return text

def format_parent_report(report_data: dict) -> str:
    return (
        f"📊 Parent Report for {report_data['student_name']}:\n"
        f"Subjects: {report_data['subjects']}\n"
        f"Performance: {report_data['performance']}%"
    )

def hearts_bar(current: int, max_hearts: int) -> str:
    filled = "❤️" * current
    empty = "🤍" * (max_hearts - current)
    return filled + empty

def format_streak(days: int) -> str:
    return f"🔥 {days} Day Streak"

def format_exam_countdown() -> str:
    return "JAMB is in 60 days! WAEC is in 47 days!"
