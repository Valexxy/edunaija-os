"""
Nigerian Multilingual AI Prompt System for EduNaija OS
"""

from typing import Dict, Any

SUPPORTED_LANGUAGES = {
    'english': 'Standard Nigerian English',
    'pidgin': 'Nigerian Pidgin English',
    'yoruba': 'Yoruba language',
    'hausa': 'Hausa language',
    'igbo': 'Igbo language',
}

SYSTEM_PROMPTS = {
    'english': """
You are an expert Nigerian tutor for EduNaija OS.
Provide clear, accurate, and structured explanations.
Use relatable examples from the Nigerian context where appropriate.
Be encouraging and maintain a professional yet accessible tone.
""",
    'pidgin': """
You are JAMB-GPT speaking Nigerian Pidgin English.
Always explain in relatable Pidgin:
- Use: 'Na wetin dem dey call...', 'E simple like say...', 'Omo, correct!'
- Make examples with Nigerian context (Danfo bus, suya, naira, Baba Ijebu)
- Keep it encouraging: 'You sabi!', 'E no hard like dem dey think'
- NEVER use British or American slang. Always keep it authentic Naija street-smart.
""",
    'yoruba': """
O jẹ olukọni to peye fun EduNaija OS. 
Lo èdè Yorùbá tí ó tọ́, tí ó sì yé ni.
Ṣàlàyé àwọn ǹkan nípa lílo àpẹẹrẹ láti inú àṣà àti àyíká wa ní Nàìjíríà.
Jẹ́ ẹni tí ń gbani níyànjú, kí o sì máa kọ́ni lẹ́kọ̀ọ́ dáradára.
(You are an expert tutor for EduNaija OS. Use correct and understandable Yoruba. Explain using examples from our culture and environment in Nigeria. Be encouraging and teach well.)
""",
    'hausa': """
Kai kwararren malami ne na EduNaija OS.
Ka yi amfani da hausa mai kyau da fahimta.
Ka bayyana abubuwa ta hanyar amfani da misalai daga al'adunmu da muhallinmu na Najeriya.
Ka kasance mai ƙarfafawa kuma ka koyar da kyau.
(You are an expert tutor for EduNaija OS. Use good and understandable Hausa. Explain things using examples from our Nigerian culture and environment. Be encouraging and teach well.)
""",
    'igbo': """
Ị bụ onye nkuzi maara nke ọma maka EduNaija OS.
Jiri asụsụ Igbo ziri ezi ma doo anya kọwaa ihe.
Kọwaa ihe site n'iji ihe atụ sitere na omenaala na gburugburu anyị na Nigeria.
Bụrụ onye na-agba ume ma na-akụzi ihe nke ọma.
(You are an expert tutor for EduNaija OS. Use correct and clear Igbo to explain things. Explain using examples from our culture and environment in Nigeria. Be encouraging and teach well.)
"""
}

ENCOURAGEMENTS = {
    'english': ["Excellent work!", "You're doing great!", "Keep it up, well done!"],
    'pidgin': ["You sabi pass book!", "Omo, you burst brain!", "Correct person, nothing do you!"],
    'yoruba': ["O káre láéláé!", "O dara pupọ!", "Tẹ̀síwájú, o ń gbìyànjú!"],
    'hausa': ["Kyau sosai!", "Ka yi kokari!", "Ci gaba da aiki mai kyau!"],
    'igbo': ["Ime mma!", "Jisie ike!", "Ọ dị mma nke ukwuu!"]
}

class NigerianLanguageRouter:
    def get_prompt(self, language: str, exam: str, subject: str) -> str:
        """Get the base system prompt combined with subject/exam context"""
        lang_key = language.lower()
        base_prompt = SYSTEM_PROMPTS.get(lang_key, SYSTEM_PROMPTS['english'])
        
        context = f"\n\nYou are tutoring a student preparing for {exam.upper()} {subject.title()}."
        return base_prompt + context
        
    def translate_feedback(self, feedback: str, language: str) -> str:
        """
        In a real scenario, this would call an LLM to translate the feedback 
        into the target language. For now, we return a structural prompt.
        """
        lang_name = SUPPORTED_LANGUAGES.get(language.lower(), 'English')
        return f"Translate this feedback to {lang_name}: {feedback}"
        
    def format_question(self, question: dict, language: str) -> str:
        """Format the question text based on the language preferences"""
        q_text = question.get('text', '')
        options = question.get('options', [])
        
        # In a real app, this might trigger an LLM translation if the language 
        # is not English and the question is only in English.
        formatted = f"{q_text}\n\n"
        for i, opt in enumerate(options):
            label = chr(65 + i)
            formatted += f"{label}. {opt}\n"
            
        return formatted
        
    def get_encouragement(self, language: str, score: float) -> str:
        """Return culturally appropriate encouragement based on score and language"""
        lang_key = language.lower()
        phrases = ENCOURAGEMENTS.get(lang_key, ENCOURAGEMENTS['english'])
        
        import random
        # If score is good (e.g., above 70%), give positive reinforcement
        if score > 0.7:
            return random.choice(phrases)
        elif score > 0.4:
            if lang_key == 'pidgin': return "No shake, you go get am next time!"
            elif lang_key == 'yoruba': return "Má bẹ̀rù, o máa gba àmì gíga nígbà míràn!"
            elif lang_key == 'hausa': return "Kada ka damu, za ka samu a gaba!"
            elif lang_key == 'igbo': return "Echegbula, ị ga-eme nke ọma oge ọzọ!"
            else: return "Keep practicing, you'll get it!"
        else:
            if lang_key == 'pidgin': return "Omo, we need double up on this one o."
            elif lang_key == 'yoruba': return "A gbọ́dọ̀ tẹra mọ́ ẹ̀kọ́ yìí dáadáa."
            elif lang_key == 'hausa': return "Muna buƙatar ƙara himma a kan wannan."
            elif lang_key == 'igbo': return "Anyị kwesịrị ịrụsi ọrụ ike na nke a."
            else: return "Let's review this topic more carefully."
