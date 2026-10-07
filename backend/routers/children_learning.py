from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Dict, Any, List, Optional
import logging
from backend.services.groq_service import call_groq_chat

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/children", tags=["Children Learning & Visual Pedagogy"])

class StoryRequest(BaseModel):
    topic: str
    age_group: Optional[str] = "8-14"
    character_name: Optional[str] = "Kemi"

# Curated Nigerian & African Memory Mnemonics
MNEMONICS_DATABASE = [
    {
        "id": "mr-niger-d",
        "title": "Characteristics of Living Things",
        "subject": "Biology",
        "acronym": "MR NIGER D",
        "expansion": [
            {"letter": "M", "word": "Movement", "meaning": "Changing position or posture"},
            {"letter": "R", "word": "Respiration", "meaning": "Releasing energy from food"},
            {"letter": "N", "word": "Nutrition", "meaning": "Taking in nutrients and food"},
            {"letter": "I", "word": "Irritability / Sensitivity", "meaning": "Responding to surroundings"},
            {"letter": "G", "word": "Growth", "meaning": "Permanent increase in size"},
            {"letter": "E", "word": "Excretion", "meaning": "Removing poisonous waste"},
            {"letter": "R", "word": "Reproduction", "meaning": "Giving birth to young ones"},
            {"letter": "D", "word": "Death", "meaning": "All living things must eventually expire"}
        ],
        "naija_hook": "Remember: Mr. Niger D is the most famous Nigerian uncle who is 100% alive!",
        "fun_fact": "Without 'Irritability', a child wouldn't pull their hand away from a hot pot of Jollof rice!"
    },
    {
        "id": "reactivity-series",
        "title": "Reactivity Series of Metals",
        "subject": "Chemistry",
        "acronym": "Please Stop Calling Me A Zebra In Class",
        "expansion": [
            {"letter": "P", "word": "Potassium (K)", "meaning": "Most reactive! Explodes violently in cold water"},
            {"letter": "S", "word": "Sodium (Na)", "meaning": "Fizzes and darts around water on fire"},
            {"letter": "C", "word": "Calcium (Ca)", "meaning": "Bubbles vigorously in water"},
            {"letter": "M", "word": "Magnesium (Mg)", "meaning": "Burns with blinding bright white light"},
            {"letter": "A", "word": "Aluminium (Al)", "meaning": "Protected by its oxide layer coat"},
            {"letter": "Z", "word": "Zinc (Zn)", "meaning": "Reacts with steam and acids"},
            {"letter": "I", "word": "Iron (Fe)", "meaning": "Rusts slowly when air and water meet"},
            {"letter": "C", "word": "Copper (Cu)", "meaning": "Very gentle, used for household pipes"}
        ],
        "naija_hook": "Please Stop Calling Me A Zebra In Class! The louder you shout it, the faster you remember Potassium to Copper!",
        "fun_fact": "Potassium is so reactive that chemists have to store it inside kerosene oil so it doesn't catch fire from humid air!"
    },
    {
        "id": "soh-cah-toa",
        "title": "Trigonometry Right-Angle Ratios",
        "subject": "Mathematics",
        "acronym": "SOH - CAH - TOA",
        "expansion": [
            {"letter": "SOH", "word": "Sin = Opposite / Hypotenuse", "meaning": "Sine ratio: side opposite to the angle divided by longest side"},
            {"letter": "CAH", "word": "Cos = Adjacent / Hypotenuse", "meaning": "Cosine ratio: side next to the angle divided by longest side"},
            {"letter": "TOA", "word": "Tan = Opposite / Adjacent", "meaning": "Tangent ratio: opposite side divided by adjacent side"}
        ],
        "naija_hook": "Say it like a Nigerian warrior chant: SOH-CAH-TOA! SOH-CAH-TOA!",
        "fun_fact": "Egyptian pyramid builders used these exact triangle proportions 4,000 years ago!"
    },
    {
        "id": "roygbiv",
        "title": "Colors of the Rainbow & Visible Spectrum",
        "subject": "Physics",
        "acronym": "ROY G. BIV",
        "expansion": [
            {"letter": "R", "word": "Red", "meaning": "Longest wavelength, bends the least in glass prism"},
            {"letter": "O", "word": "Orange", "meaning": "Between red and yellow"},
            {"letter": "Y", "word": "Yellow", "meaning": "Bright sunshine wavelength"},
            {"letter": "G", "word": "Green", "meaning": "Center of the visible human spectrum"},
            {"letter": "B", "word": "Blue", "meaning": "Scatters most in atmosphere, making sky blue"},
            {"letter": "I", "word": "Indigo", "meaning": "Deep dark blue"},
            {"letter": "V", "word": "Violet", "meaning": "Shortest wavelength, bends the most"}
        ],
        "naija_hook": "Richard Of York Gave Battle In Vain — or simply Uncle Roy G. Biv with his 7 colorful caps!",
        "fun_fact": "Raindrops act as millions of tiny triangular glass prisms floating in the sky!"
    },
    {
        "id": "taxonomic-hierarchy",
        "title": "Biological Classification System",
        "subject": "Biology",
        "acronym": "Dear King Philip Came Over For Good Soup",
        "expansion": [
            {"letter": "D", "word": "Domain", "meaning": "Broadest biological category"},
            {"letter": "K", "word": "Kingdom", "meaning": "E.g. Animalia or Plantae"},
            {"letter": "P", "word": "Phylum", "meaning": "Body plan (e.g. Chordata - animals with backbones)"},
            {"letter": "C", "word": "Class", "meaning": "E.g. Mammalia (warm blood, fur, milk)"},
            {"letter": "O", "word": "Order", "meaning": "E.g. Carnivora (meat eaters) or Primates"},
            {"letter": "F", "word": "Family", "meaning": "Close relatives like Felidae (all cats)"},
            {"letter": "G", "word": "Genus", "meaning": "First part of scientific name (e.g. Homo)"},
            {"letter": "S", "word": "Species", "meaning": "Exact individual type (e.g. sapiens)"}
        ],
        "naija_hook": "Dear King Philip Came Over For Good Soup (Egusi soup with pounded yam!)",
        "fun_fact": "Humans are: Animalia -> Chordata -> Mammalia -> Primates -> Hominidae -> Homo -> sapiens!"
    }
]

# Curated "Catch Chidi's Mistake" Detective Cases
DETECTIVE_CASES = [
    {
        "case_id": "case-01",
        "title": "The Mystery of the Runaway Sign in Algebra",
        "subject": "Mathematics",
        "difficulty": "Junior (Ages 10-14)",
        "scenario": "Chidi was solving the equation 3x + 8 = 29 on the chalkboard, but his final answer was marked WRONG by Uncle Emeka. Can you spot the exact line where Chidi made a blunder?",
        "steps": [
            {"line_number": 1, "text": "Given equation: 3x + 8 = 29", "is_error": False},
            {"line_number": 2, "text": "Subtract 8 from both sides: 3x = 29 + 8", "is_error": True, "correction": "Chidi added 8 instead of subtracting! When +8 crosses the equals sign, it turns into -8 (so 3x = 29 - 8 = 21)."},
            {"line_number": 3, "text": "Simplify: 3x = 37", "is_error": False},
            {"line_number": 4, "text": "Divide by 3: x = 37 / 3 = 12.33", "is_error": False}
        ],
        "culprit_line": 2,
        "correct_answer": "x = 7",
        "rule_learned": "When any term moves across the equal sign bridge (=), its sign flips! Plus turns to minus, minus turns to plus!"
    },
    {
        "case_id": "case-02",
        "title": "The Upside-Down Density Dilemma",
        "subject": "Physics",
        "difficulty": "Junior (Ages 11-15)",
        "scenario": "Chidi found a shiny metal block with mass 120 grams and volume 30 cubic centimetres (cm³). He calculated its density to find out if it is real gold. Where did his calculation crash?",
        "steps": [
            {"line_number": 1, "text": "Recall formula: Density = Mass ÷ Volume", "is_error": False},
            {"line_number": 2, "text": "Substitute numbers: Density = 30 ÷ 120", "is_error": True, "correction": "Chidi flipped the formula! He put Volume (30) on top and Mass (120) below. It must be Mass (120) ÷ Volume (30)."},
            {"line_number": 3, "text": "Calculate fraction: Density = 0.25 g/cm³", "is_error": False},
            {"line_number": 4, "text": "Conclusion: The metal is lighter than water", "is_error": False}
        ],
        "culprit_line": 2,
        "correct_answer": "Density = 120 ÷ 30 = 4.0 g/cm³",
        "rule_learned": "Mass is always heavy on top, volume sits comfortably at the bottom! Think of M on top like a Mountain!"
    },
    {
        "case_id": "case-03",
        "title": "The Salty Soup Boiling Point Trap",
        "subject": "Chemistry",
        "difficulty": "All Ages (9-16)",
        "scenario": "Chidi was cooking noodles in the kitchen. He wondered how adding 3 spoons of table salt to pure boiling water would affect the cooking temperature.",
        "steps": [
            {"line_number": 1, "text": "Pure water boils at standard pressure at 100°C", "is_error": False},
            {"line_number": 2, "text": "He poured 3 spoons of dissolved table salt into the water", "is_error": False},
            {"line_number": 3, "text": "Chidi claimed: 'The salt will lower the boiling point to 92°C so it boils faster!'", "is_error": True, "correction": "Dissolved impurities like salt RAISE (elevate) the boiling point above 100°C (e.g. to 102°C), not lower it!"},
            {"line_number": 4, "text": "He waited for the noodles to cook", "is_error": False}
        ],
        "culprit_line": 3,
        "correct_answer": "Boiling point increases above 100°C (Elevation of Boiling Point)",
        "rule_learned": "Impurities make boiling HARDER (raising the boiling point) but make freezing EASIER (lowering the freezing point)!"
    }
]

@router.get("/mnemonics")
async def get_all_mnemonics():
    """Returns curated memory mnemonics with Naija hooks."""
    return {"status": "success", "count": len(MNEMONICS_DATABASE), "mnemonics": MNEMONICS_DATABASE}

@router.get("/detective-cases")
async def get_detective_cases():
    """Returns interactive error-catching detective challenges."""
    return {"status": "success", "count": len(DETECTIVE_CASES), "cases": DETECTIVE_CASES}

@router.post("/story")
async def generate_children_story(req: StoryRequest):
    """Generates an engaging, illustrated African educational story for children using Groq AI."""
    system_prompt = (
        "You are 'Auntie Simi', a beloved African children's science and mathematics storyteller. "
        "Your mission is to explain complex school concepts to children (aged 8-14) through delightful, "
        "vivid, humorous, and heartwarming African story adventures. "
        "Structure your response strictly in JSON with these keys:\n"
        "1. 'title': Catchy story title with emoji\n"
        "2. 'scenes': Array of 3 scenes (Scene 1: The Problem/Curiosity, Scene 2: The Discovery/Experiment, Scene 3: The AHA! Moment)\n"
        "   Each scene has 'scene_title', 'story_text' (2-3 sentences), 'visual_description' (what the cartoon illustration shows)\n"
        "3. 'big_lesson': A simple 1-sentence memorable summary for a child\n"
        "4. 'fun_word': A new science/math word introduced with its simple definition\n"
        "Speak in warm, encouraging Nigerian English with rich relatable metaphors."
    )
    user_prompt = (
        f"Topic to explain: {req.topic}\n"
        f"Target Age: {req.age_group}\n"
        f"Hero Character: {req.character_name}\n"
        "Write a magical, educational story that will make a child gasp in wonder and remember this concept forever!"
    )

    ai_text = await call_groq_chat(system_prompt, user_prompt, max_tokens=700)
    
    # If Groq returns valid text or fallback
    if not ai_text:
        return {
            "status": "success",
            "title": f"✨ {req.character_name} and the Magic of {req.topic}",
            "scenes": [
                {
                    "scene_title": "Scene 1: A Curious Afternoon",
                    "story_text": f"{req.character_name} was sitting under a big mango tree when she noticed something puzzling about {req.topic}. 'Grandpa,' she asked, 'how does this work?'",
                    "visual_description": f"Cartoon illustration of {req.character_name} looking curious under a bright Nigerian mango tree."
                },
                {
                    "scene_title": "Scene 2: Grandpa's Kitchen Experiment",
                    "story_text": f"Grandpa smiled and brought out a flashlight and a bowl of water. 'Watch closely, my child! Everything in nature follows a simple rule.'",
                    "visual_description": "Grandpa demonstrating a fun kitchen experiment while smiling."
                },
                {
                    "scene_title": "Scene 3: The AHA! Wonder Moment",
                    "story_text": f"Suddenly, {req.character_name}'s eyes went wide! 'I get it now! When {req.topic} happens, it is just like sharing chin-chin fairly!'",
                    "visual_description": f"{req.character_name} jumping with joy with a bright yellow lightbulb shining above her head."
                }
            ],
            "big_lesson": f"Never be afraid to ask questions! {req.topic} is just nature's clever way of keeping balance.",
            "fun_word": f"{req.topic}: Nature's special rule that keeps our universe running smoothly!"
        }

    import json
    import re
    try:
        # Robustly extract JSON object matching { ... }
        match = re.search(r"\{[\s\S]*\}", ai_text)
        if match:
            parsed = json.loads(match.group(0).strip())
            return {"status": "success", **parsed}
        
        # If no JSON braces found, clean markdown fences
        clean_text = ai_text.replace("```json", "").replace("```", "").strip()
        parsed = json.loads(clean_text)
        return {"status": "success", **parsed}
    except Exception:
        # Clean any code fences from ai_text before returning
        clean_text = re.sub(r"```(json)?", "", ai_text).strip()
        paragraphs = [p.strip() for p in clean_text.split("\n\n") if p.strip()]
        
        return {
            "status": "success",
            "title": f"🌟 {req.character_name}'s Adventure with {req.topic}",
            "scenes": [
                {
                    "scene_title": "Scene 1: The Curious Beginning",
                    "story_text": paragraphs[0] if len(paragraphs) > 0 else f"{req.character_name} wondered deeply about {req.topic}.",
                    "visual_description": f"Illustration of {req.character_name} looking curiously at nature."
                },
                {
                    "scene_title": "Scene 2: Auntie Simi's Explanation",
                    "story_text": paragraphs[1] if len(paragraphs) > 1 else f"Auntie Simi demonstrated how {req.topic} works in our everyday world.",
                    "visual_description": "Auntie Simi smiling and explaining with everyday home objects."
                },
                {
                    "scene_title": "Scene 3: The AHA! Moment",
                    "story_text": paragraphs[2] if len(paragraphs) > 2 else f"Now {req.character_name} understood {req.topic} perfectly and couldn't wait to share!",
                    "visual_description": f"{req.character_name} celebrating with a bright smile."
                }
            ],
            "big_lesson": f"Every complex topic like {req.topic} becomes simple when you explore it step by step!",
            "fun_word": f"{req.topic}: An exciting mystery of nature and science!"
        }

class WonderBuddyRequest(BaseModel):
    query: str
    tier: Optional[str] = "PRIMARY"

@router.post("/wonder-buddy")
async def wonder_buddy_endpoint(req: WonderBuddyRequest):
    """
    Ijapa Wonder Buddy intelligent assistant for primary school pupils.
    Responds distinctly based on whether the child asked to Read, Hint, Pidgin, or Math.
    """
    q_lower = req.query.lower()

    if "read" in q_lower or "slowly" in q_lower:
        explanation = "Welcome, little scholar! Here is your lesson: Every big idea starts with a simple step. Look at the words on your screen, say them with me, and take your time. You are doing fantastic!"
    elif "hint" in q_lower:
        explanation = "Here is a secret hint from Ijapa the wise tortoise: Think about going to the market with your mommy. When you count oranges, you group them in fives and tens. Look for patterns in your question just like counting fruits!"
    elif "pidgin" in q_lower:
        explanation = "Na so, my young champ! No dey fear at all at all! Small small na him dey make tortoise reach town. Read the question well-well, choose wetin make sense, and make your people proud!"
    elif "math" in q_lower or "count" in q_lower or "number" in q_lower:
        explanation = "Let us do some counting magic! Count your fingers: 1, 2, 3, 4, 5! When you add numbers together, they grow bigger like a big tree. What numbers are you working on right now?"
    else:
        explanation = f"Great question! Ijapa says: Keep your curious eyes open! Every time you practice on EduNaija, your brain grows stronger and stronger."

    return {
        "status": "success",
        "explanation": explanation,
        "persona": "auntie_bola",
        "tier": req.tier
    }
