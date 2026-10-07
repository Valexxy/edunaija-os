"""
EduNaija OS — Socratic Street Case Studies Router
World-First: Applied Nigerian-context real-world scenarios requiring curriculum knowledge
Student is dropped into a narrative scenario, not a question — deepest applied learning mode
"""
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Optional
import time
from backend.database.sqlite_store import save_case_submission, get_student_case_submissions

router = APIRouter(prefix="/case-studies", tags=["Socratic Cases"])

# ─── Case Study Bank ──────────────────────────────────────────────────────────
CASES = [
    {
        "id": "case-01",
        "title": "Lagos Emergency Room Crisis",
        "setting": "Lagos University Teaching Hospital, Lagos",
        "subject": "Biology / Chemistry",
        "class_tier": "UTME",
        "difficulty": 4,
        "icon": "🏥",
        "color": "red",
        "scenario_narrative": (
            "You are the on-call doctor at LUTH Emergency Room on a rainy Thursday evening. A 45-year-old man is brought in "
            "by his family, barely conscious. His lab results show serum potassium at 7.8 mmol/L (normal: 3.5–5.0 mmol/L) "
            "and his ECG shows peaked T-waves — a sign of hyperkalemia. \n\n"
            "His family mentions he has not urinated in 18 hours and his face and ankles are severely swollen. "
            "The nephrologist (kidney specialist) is 40 minutes away. Your senior nurse asks: 'Doctor, should we start "
            "calcium gluconate or insulin-dextrose first?' \n\n"
            "You must decide quickly. Every second counts as cardiac arrest may be minutes away. "
            "Your JAMB Biology and Chemistry knowledge is the only tool you have right now."
        ),
        "curriculum_link": "JAMB Biology: Excretory System, Homeostasis | JAMB Chemistry: Electrolytes & Ionic Equilibrium",
        "challenge_questions": [
            {
                "question": "High serum potassium (hyperkalemia) most directly affects which body system?",
                "options": ["A. Skeletal system", "B. Nervous and cardiac system", "C. Digestive system", "D. Endocrine system"],
                "correct": "B",
                "explanation": "Potassium is the main intracellular ion. Hyperkalemia disrupts the cardiac resting membrane potential, causing arrhythmias and potentially cardiac arrest."
            },
            {
                "question": "The patient has not urinated — this suggests failure of which organ?",
                "options": ["A. Liver", "B. Pancreas", "C. Kidneys", "D. Spleen"],
                "correct": "C",
                "explanation": "Urine production is the kidney's function. Anuria (no urine output) combined with electrolyte imbalance indicates acute kidney failure."
            },
            {
                "question": "Insulin-dextrose is given to treat hyperkalemia because insulin:",
                "options": [
                    "A. Destroys potassium ions",
                    "B. Drives potassium from blood into cells",
                    "C. Increases kidney excretion of potassium",
                    "D. Neutralizes potassium with glucose"
                ],
                "correct": "B",
                "explanation": "Insulin activates the Na⁺/K⁺-ATPase pump, shifting K⁺ from extracellular to intracellular compartments. Dextrose prevents hypoglycemia."
            },
            {
                "question": "The swelling (oedema) in the patient's face and ankles is caused by:",
                "options": [
                    "A. Excess fat deposits",
                    "B. Accumulation of fluid due to loss of osmotic pressure",
                    "C. Calcium buildup in tissues",
                    "D. Excess bone marrow production"
                ],
                "correct": "B",
                "explanation": "When kidneys fail, protein (albumin) is lost or fluid regulation fails. Reduced oncotic pressure causes fluid to leak from blood vessels into tissues."
            },
        ],
        "real_curriculum_topics": ["Excretory system", "Osmosis", "Electrolytes", "Kidney function", "Homeostasis"],
        "verdict_message": "You applied Biology and Chemistry to save a patient. This is what the JAMB curriculum is actually for.",
    },
    {
        "id": "case-02",
        "title": "Abuja Construction Site Collapse",
        "setting": "Maitama Construction Site, Abuja FCT",
        "subject": "Physics",
        "class_tier": "UTME",
        "difficulty": 3,
        "icon": "🏗️",
        "color": "amber",
        "scenario_narrative": (
            "You are a young structural engineer at a high-rise construction site in Maitama, Abuja. "
            "Three floors of scaffolding are being erected 12 metres above ground. The site foreman tells you "
            "a new load-bearing beam needs to be hoisted up using a pulley system. \n\n"
            "The beam weighs 800kg. The pulley system available has a mechanical advantage of 4. "
            "One of the labourers asks if a single rope with a 200kg breaking tension is safe for this job. "
            "Another labourer is standing directly beneath the load — a serious safety violation. \n\n"
            "You have 2 minutes to decide: Is the rope safe? And what is the maximum height the beam "
            "can fall from before it becomes lethal to the person below? Use your Physics knowledge."
        ),
        "curriculum_link": "JAMB Physics: Mechanics, Pulleys, Work-Energy Theorem, Projectile Motion",
        "challenge_questions": [
            {
                "question": "With a mechanical advantage of 4, the effort needed to lift the 800kg beam is:",
                "options": ["A. 200kg-force", "B. 3200kg-force", "C. 400kg-force", "D. 100kg-force"],
                "correct": "A",
                "explanation": "Mechanical Advantage (MA) = Load / Effort. 4 = 800 / Effort. Effort = 200kg-force. The rope with 200kg breaking tension is at EXACTLY its limit — dangerously risky."
            },
            {
                "question": "If the beam falls from 12m height, its velocity just before hitting the ground is approximately:",
                "options": ["A. 15.3 m/s", "B. 10 m/s", "C. 120 m/s", "D. 5 m/s"],
                "correct": "A",
                "explanation": "v² = u² + 2as. v² = 0 + 2 × 10 × 12 = 240. v = √240 ≈ 15.3 m/s (taking g = 10 m/s²)"
            },
            {
                "question": "The type of pulley that provides mechanical advantage greater than 1 is a:",
                "options": ["A. Fixed single pulley", "B. Movable pulley", "C. Block and tackle system", "D. Both B and C"],
                "correct": "D",
                "explanation": "A single fixed pulley only changes direction (MA=1). A movable pulley gives MA=2. A block and tackle (multiple pulleys) gives MA > 2."
            },
            {
                "question": "If the labourer weighs 70kg, the force impact when the 800kg beam hits him at 15.3 m/s lasts 0.1s. The force is:",
                "options": ["A. 12,240 N", "B. 800 N", "C. 1,530 N", "D. 70 N"],
                "correct": "A",
                "explanation": "Impulse = Change in momentum. F × t = m × Δv. F × 0.1 = 800 × 15.3. F = 12,240 N. This is why beam falls are lethal."
            },
        ],
        "real_curriculum_topics": ["Pulleys and machines", "Free fall", "Impulse and momentum", "Mechanical advantage"],
        "verdict_message": "Physics saved a life today. Mechanics is not abstract — it's the difference between life and death on construction sites.",
    },
    {
        "id": "case-03",
        "title": "Lagos Stock Exchange Crisis",
        "setting": "Nigerian Stock Exchange, Lagos Island",
        "subject": "Economics / Mathematics",
        "class_tier": "UTME",
        "difficulty": 4,
        "icon": "📈",
        "color": "emerald",
        "scenario_narrative": (
            "You are a junior investment analyst at Lagos Stock Exchange. It is Monday morning and "
            "Dangote Cement stock has dropped 15% overnight due to a forex devaluation rumour. "
            "Your client, a retired civil servant, has ₦2,000,000 invested in Dangote Cement shares. \n\n"
            "The managing director asks you to calculate three things before the market opens: "
            "(1) How much has your client lost in naira value? "
            "(2) If she had instead put the money in a fixed deposit at 12% annual interest, compounded quarterly, "
            "what would her balance be after 2 years? "
            "(3) Inflation is running at 22% — in real terms, is the fixed deposit profitable? \n\n"
            "You have 5 minutes before trading begins. Millions of naira depend on your Economics knowledge."
        ),
        "curriculum_link": "JAMB Economics: Inflation, Interest Rates, Investment | JAMB Math: Compound Interest, Percentage",
        "challenge_questions": [
            {
                "question": "If ₦2,000,000 dropped by 15%, the client's loss in naira is:",
                "options": ["A. ₦300,000", "B. ₦150,000", "C. ₦30,000", "D. ₦200,000"],
                "correct": "A",
                "explanation": "15% of ₦2,000,000 = 0.15 × 2,000,000 = ₦300,000. Remaining value: ₦1,700,000."
            },
            {
                "question": "Compound interest formula: A = P(1 + r/n)^(nt). At 12% p.a. compounded quarterly for 2 years on ₦2M:",
                "options": ["A. ₦2,537,600", "B. ₦2,480,000", "C. ₦2,600,000", "D. ₦2,400,000"],
                "correct": "A",
                "explanation": "A = 2,000,000 × (1 + 0.12/4)^(4×2) = 2,000,000 × (1.03)^8 = 2,000,000 × 1.2668 ≈ ₦2,533,600"
            },
            {
                "question": "If inflation is 22% and the bank offers 12% return, the REAL interest rate is approximately:",
                "options": ["A. +10%", "B. -10%", "C. +22%", "D. +34%"],
                "correct": "B",
                "explanation": "Real interest rate ≈ Nominal rate - Inflation rate = 12% - 22% = -10%. The money loses purchasing power even in a fixed deposit."
            },
            {
                "question": "This type of investment where real returns are negative due to high inflation is called:",
                "options": ["A. Deflation trap", "B. Financial repression", "C. Stagflation", "D. Liquidity trap"],
                "correct": "B",
                "explanation": "Financial repression occurs when interest rates are kept below inflation, eroding the real returns of savers. Common in developing economies with high inflation."
            },
        ],
        "real_curriculum_topics": ["Compound interest", "Inflation", "Real vs nominal rates", "Investment types", "Percentage change"],
        "verdict_message": "Economics is not theory — your advice on this call could preserve or destroy a family's retirement savings.",
    },
    {
        "id": "case-04",
        "title": "Port Harcourt Oil Spill Response",
        "setting": "Bodo Creek, Rivers State",
        "subject": "Chemistry / Biology",
        "class_tier": "UTME",
        "difficulty": 4,
        "icon": "🛢️",
        "color": "orange",
        "scenario_narrative": (
            "You are a young environmental chemist deployed to Bodo Creek in Rivers State after "
            "a major crude oil pipeline rupture. The oil spill has spread across 5 kilometers of creek. "
            "Local fishing communities are in panic — fish are dying and drinking water is contaminated. \n\n"
            "The NOSDRA response team asks you: Which chemical dispersant should be used, "
            "and what is the mechanism by which crude oil kills aquatic organisms? "
            "A local politician wants to use quicklime (CaO) to 'neutralize' the oil — "
            "your job is to tell him if this is scientifically correct. \n\n"
            "Your answer will determine the ecological response strategy for this crisis."
        ),
        "curriculum_link": "JAMB Chemistry: Organic Chemistry, Hydrocarbons | JAMB Biology: Aquatic Ecosystems, Pollution",
        "challenge_questions": [
            {
                "question": "Crude oil kills fish primarily because it:",
                "options": [
                    "A. Acidifies the water",
                    "B. Forms a surface film that blocks oxygen exchange",
                    "C. Increases water temperature",
                    "D. Removes all minerals from water"
                ],
                "correct": "B",
                "explanation": "Oil forms a hydrophobic film on water surface, preventing atmospheric oxygen from dissolving. Fish suffer hypoxia (oxygen starvation). Also clogs fish gills directly."
            },
            {
                "question": "Crude oil is primarily composed of:",
                "options": ["A. Carbohydrates", "B. Hydrocarbons", "C. Proteins", "D. Halides"],
                "correct": "B",
                "explanation": "Crude oil is a mixture of hydrocarbons — compounds containing only carbon and hydrogen (alkanes, alkenes, aromatics). This is core JAMB organic chemistry."
            },
            {
                "question": "Using quicklime (CaO) to neutralize crude oil is incorrect because:",
                "options": [
                    "A. CaO is too expensive",
                    "B. Oil is non-polar and doesn't react with ionic/polar compounds like CaO",
                    "C. CaO evaporates too quickly",
                    "D. CaO would react with fish"
                ],
                "correct": "B",
                "explanation": "Like dissolves like (polarity principle). Crude oil is non-polar. CaO is ionic. They don't react chemically. The politician's suggestion would be useless — and CaO would also raise the pH harmfully."
            },
            {
                "question": "The correct chemical principle for oil spill dispersants is:",
                "options": [
                    "A. Acid-base neutralization",
                    "B. Surfactant action — breaking oil into tiny droplets via amphiphilic molecules",
                    "C. Precipitation by heavy metals",
                    "D. Photodegradation by UV light"
                ],
                "correct": "B",
                "explanation": "Dispersants contain surfactants — molecules with a hydrophilic head and hydrophobic tail. They surround oil droplets (micelles), allowing bacteria to biodegrade them."
            },
        ],
        "real_curriculum_topics": ["Hydrocarbons", "Organic chemistry", "Aquatic ecosystems", "Pollution", "Polarity and solubility"],
        "verdict_message": "Chemistry saves ecosystems. Every oil spill in the Niger Delta could be better managed with the science you're learning.",
    },
    {
        "id": "case-05",
        "title": "Kano Agricultural Drought Crisis",
        "setting": "Kano State Agricultural Commission",
        "subject": "Biology / Geography",
        "class_tier": "WAEC",
        "difficulty": 3,
        "icon": "🌾",
        "color": "yellow",
        "scenario_narrative": (
            "You are a young agronomist advising the Kano State government during the worst drought in 30 years. "
            "Groundnut and millet crops are wilting across 40,000 hectares of farmland in Kano, Jigawa, and Katsina. "
            "Farmers are losing everything. \n\n"
            "The Agricultural Commissioner asks you three urgent questions: "
            "(1) Why are the crops wilting even when the soil appears moist? "
            "(2) A company wants to sell 'mineral fertilizer salts' — will applying high-concentration "
            "fertilizer help the wilting crops? "
            "(3) Recommend an irrigation strategy based on rainfall patterns (the Sahel has bimodal rainfall). \n\n"
            "Millions of people's food security depends on your Biology and Geography knowledge."
        ),
        "curriculum_link": "JAMB Biology: Osmosis, Transpiration, Plant Water Relations | WAEC Geography: Climate, Soil, Agriculture",
        "challenge_questions": [
            {
                "question": "Crops wilt even in moist soil when the soil water potential is lower than the root cell potential due to:",
                "options": [
                    "A. Too much photosynthesis",
                    "B. High solute concentration in soil making osmosis move water OUT of roots",
                    "C. Root cells lacking chlorophyll",
                    "D. Excess transpiration only"
                ],
                "correct": "B",
                "explanation": "This is plasmolysis in action — if soil solution concentration is higher than root cell sap (e.g., from salt or drought), water moves OUT of roots by osmosis. The plant wilts despite 'moist' soil."
            },
            {
                "question": "Applying high-concentration mineral fertilizer to already-stressed crops will:",
                "options": [
                    "A. Immediately revive the crops",
                    "B. Worsen wilting by increasing soil solute concentration",
                    "C. Have no effect",
                    "D. Cause the crops to flower faster"
                ],
                "correct": "B",
                "explanation": "High fertilizer concentration increases soil osmolarity, further drawing water OUT of plant roots by reverse osmosis. This is called fertilizer burn. Never apply fertilizer to drought-stressed crops."
            },
            {
                "question": "The Sahel region (including Kano) receives rainfall in which pattern?",
                "options": [
                    "A. Unimodal — one peak in July-August",
                    "B. Bimodal — two peaks: March-May and September-November",
                    "C. Constant year-round rainfall",
                    "D. Rainfall only in December-January"
                ],
                "correct": "A",
                "explanation": "The Sahel has a unimodal rainfall pattern with one peak typically in July-August. The Sudan Savanna belt gets slight bimodal influence but the deep Sahel is unimodal. WAEC Geography tests this frequently."
            },
            {
                "question": "The BEST irrigation strategy for Kano's millet and groundnut crops during drought is:",
                "options": [
                    "A. Flood irrigation — maximizing water coverage",
                    "B. Drip irrigation — delivering water directly to root zones with minimal evaporation",
                    "C. Overhead sprinkler — simulating rainfall",
                    "D. Reservoir damming only"
                ],
                "correct": "B",
                "explanation": "Drip irrigation (trickle irrigation) delivers water directly to plant root zones, reducing evapotranspiration loss by 40-60% vs flood irrigation. Critical in arid Sahel conditions."
            },
        ],
        "real_curriculum_topics": ["Osmosis", "Plant water relations", "Plasmolysis", "Sahel climate", "Agricultural irrigation"],
        "verdict_message": "Biology is food security. Understanding osmosis could save the livelihoods of millions of farmers across Nigeria's North.",
    },
    {
        "id": "case-06",
        "title": "Ibadan Traffic Algorithm Challenge",
        "setting": "Ibadan Metropolitan Transport Authority",
        "subject": "Mathematics",
        "class_tier": "UTME",
        "difficulty": 3,
        "icon": "🚦",
        "color": "cyan",
        "scenario_narrative": (
            "You are a young data scientist hired by Ibadan Metropolitan Transport Authority to solve "
            "the city's chronic traffic congestion. The Dugbe-Mokola-Agodi corridor handles 50,000 vehicles per day "
            "but was designed for 20,000. Three traffic lights at intersections A, B, and C need optimizing. \n\n"
            "Traffic count data shows: Intersection A gets 1,800 cars/hour, B gets 1,200 cars/hour, "
            "C gets 900 cars/hour. The average car speed on the corridor is 15 km/h (down from design speed of 45 km/h). "
            "The corridor is 4.5 km long. Your job is to calculate key metrics and propose signal timing changes. \n\n"
            "The Governor will review your report in 2 hours. Pure Mathematics is your only tool."
        ),
        "curriculum_link": "JAMB Mathematics: Speed-Distance-Time, Ratios, Optimization | WAEC Math: Percentages, Rates",
        "challenge_questions": [
            {
                "question": "At 15 km/h, how many minutes does it take to travel the 4.5 km corridor?",
                "options": ["A. 18 minutes", "B. 10 minutes", "C. 30 minutes", "D. 4.5 minutes"],
                "correct": "A",
                "explanation": "Time = Distance/Speed = 4.5/15 hours = 0.3 hours = 0.3 × 60 = 18 minutes. (At design speed 45 km/h it would take just 6 minutes.)"
            },
            {
                "question": "If intersection A processes 1,800 cars/hour but only has 45 seconds of green time per minute, the effective throughput is:",
                "options": ["A. 1,350 cars/hr", "B. 1,800 cars/hr", "C. 900 cars/hr", "D. 2,400 cars/hr"],
                "correct": "A",
                "explanation": "Effective green time fraction = 45/60 = 0.75. Throughput = 1800 × 0.75 = 1,350 cars/hr. 450 cars/hr are being held and causing backup."
            },
            {
                "question": "The corridor is running at what percentage of its designed capacity?",
                "options": ["A. 150%", "B. 250%", "C. 50%", "D. 200%"],
                "correct": "B",
                "explanation": "50,000 / 20,000 × 100% = 250% of design capacity. The road is running at 2.5 times its intended load."
            },
            {
                "question": "If extending intersection A's green cycle from 45s to 54s (20% increase) increases throughput proportionally, the new hourly capacity would be:",
                "options": ["A. 1,620 cars/hr", "B. 2,160 cars/hr", "C. 1,800 cars/hr", "D. 1,440 cars/hr"],
                "correct": "A",
                "explanation": "New throughput = 1,350 × 1.20 = 1,620 cars/hr. Simple proportional scaling — a 20% green time increase gives 20% more throughput."
            },
        ],
        "real_curriculum_topics": ["Speed, distance, time", "Percentages", "Ratios and rates", "Optimization"],
        "verdict_message": "Mathematics runs cities. Every traffic signal in Ibadan, Lagos, and Abuja can be optimized with the exact equations you learned for JAMB.",
    },
    {
        "id": "case-07",
        "title": "Enugu Coal Mine Gas Explosion",
        "setting": "Ogbete Coal Mine, Enugu State",
        "subject": "Chemistry / Physics",
        "class_tier": "WAEC",
        "difficulty": 5,
        "icon": "⛏️",
        "color": "stone",
        "scenario_narrative": (
            "You are a young safety chemist at Ogbete Coal Mine in Enugu. At 6:47am, methane gas detectors "
            "in Shaft 3 start beeping at 4.5% concentration. The lower explosive limit (LEL) for methane is 5%. "
            "You have an estimated 8 minutes before concentration reaches LEL. \n\n"
            "120 miners are underground. The ventilation fan in Shaft 3 has a flow rate of 200 m³/min. "
            "The shaft volume is 1,200 m³. A colleague suggests 'burning off' the gas "
            "using a controlled ignition — your job is to evaluate this. \n\n"
            "What is the combustion equation for methane? Is the colleague's suggestion correct? "
            "At current fan flow, how many minutes to dilute methane from 4.5% to 1% (safe level)?"
        ),
        "curriculum_link": "JAMB Chemistry: Combustion, Gas Laws | JAMB Physics: Fluid dynamics, pressure",
        "challenge_questions": [
            {
                "question": "The balanced equation for complete combustion of methane is:",
                "options": [
                    "A. CH₄ + O₂ → CO + 2H₂",
                    "B. CH₄ + 2O₂ → CO₂ + 2H₂O",
                    "C. 2CH₄ + O₂ → 2CO + 4H₂",
                    "D. CH₄ + O₂ → CH₂O + H₂"
                ],
                "correct": "B",
                "explanation": "Complete combustion: CH₄ + 2O₂ → CO₂ + 2H₂O. Methane needs 2 moles of O₂ to fully combust to CO₂ and water. This is a core JAMB chemistry equation."
            },
            {
                "question": "The colleague's suggestion to 'ignite' the methane at 4.5% concentration is:",
                "options": [
                    "A. Safe — burning removes the gas quickly",
                    "B. Catastrophically dangerous — 4.5% is just below LEL and ignition would cause explosion",
                    "C. Acceptable if done slowly",
                    "D. Harmless because CO₂ produced is safe"
                ],
                "correct": "B",
                "explanation": "At 4.5% (approaching the 5% LEL), any ignition source would cause a violent explosion. Controlled ignition at near-LEL concentrations is absolutely forbidden in mining safety."
            },
            {
                "question": "The shaft has 1,200 m³ volume with 4.5% methane = 54 m³ of methane. To dilute to 1%, how many shaft volumes of air are needed?",
                "options": ["A. 3.5 volumes", "B. 4.5 volumes", "C. 1 volume", "D. 10 volumes"],
                "correct": "A",
                "explanation": "Using dilution formula: C₁V₁ = C₂V₂. 4.5% × 1200 = 1% × V₂. V₂ = 5400 m³. Additional air needed = 5400 - 1200 = 4200 m³ = 3.5 shaft volumes."
            },
            {
                "question": "At 200 m³/min fan flow rate, the time to safely dilute the shaft is approximately:",
                "options": ["A. 21 minutes", "B. 6 minutes", "C. 1 minute", "D. 45 minutes"],
                "correct": "A",
                "explanation": "4200 m³ additional air ÷ 200 m³/min = 21 minutes. But we only have 8 minutes! Immediate shaft evacuation is required while the fan runs."
            },
        ],
        "real_curriculum_topics": ["Combustion equations", "Gas laws", "Dilution calculations", "Explosive limits"],
        "verdict_message": "Chemistry is industrial safety. Understanding combustion equations could save the lives of miners across Enugu's coal shafts.",
    },
    {
        "id": "case-08",
        "title": "Eko Atlantic Climate Emergency Brief",
        "setting": "Eko Atlantic City, Lagos Waterfront",
        "subject": "Geography / Chemistry",
        "class_tier": "WAEC",
        "difficulty": 3,
        "icon": "🌊",
        "color": "blue",
        "scenario_narrative": (
            "You are a climate advisor to the Lagos State Government. Eko Atlantic — Nigeria's ambitious "
            "sea-reclaimed city — is under threat. Sea levels have risen 8cm since 2015, and "
            "scientists predict a further 15-25cm rise by 2050. \n\n"
            "The Governor wants to know: Is this rise caused by humans? What is the chemistry behind "
            "greenhouse gases? And if we plant 500,000 trees across Lagos, how much CO₂ could we sequester? "
            "(One tree absorbs approximately 21kg of CO₂ per year.) \n\n"
            "Your briefing note will determine Lagos' climate policy for the next decade."
        ),
        "curriculum_link": "WAEC Geography: Climate Change, Coastal Erosion | JAMB Chemistry: Carbon cycle, Greenhouse gases",
        "challenge_questions": [
            {
                "question": "The primary cause of accelerating sea level rise is:",
                "options": [
                    "A. Increased rainfall globally",
                    "B. Thermal expansion of oceans and melting of polar ice due to global warming",
                    "C. Underwater volcanic eruptions",
                    "D. The Moon's gravitational pull increasing"
                ],
                "correct": "B",
                "explanation": "Global warming (from greenhouse gases) causes: (1) Ocean thermal expansion — water expands as it warms. (2) Melting of Greenland/Antarctic ice sheets adding liquid water. Both contribute to sea level rise."
            },
            {
                "question": "Which greenhouse gas has the highest global warming potential (GWP) per molecule over 100 years?",
                "options": ["A. CO₂", "B. Methane (CH₄)", "C. Nitrous oxide (N₂O)", "D. Water vapor"],
                "correct": "C",
                "explanation": "Nitrous oxide (N₂O) has a GWP of ~265-298 over 100 years. Methane is 25-28. CO₂ is the baseline (GWP=1). However, CO₂ is most abundant, making it the biggest net contributor."
            },
            {
                "question": "500,000 trees each absorbing 21kg CO₂/year would sequester how many tonnes of CO₂ annually?",
                "options": ["A. 10,500 tonnes", "B. 1,050 tonnes", "C. 105,000 tonnes", "D. 21,000 tonnes"],
                "correct": "A",
                "explanation": "500,000 × 21 kg = 10,500,000 kg = 10,500 tonnes of CO₂ per year. Lagos generates approximately 45 million tonnes per year — trees alone are insufficient but important."
            },
            {
                "question": "Coastal erosion at Eko Atlantic is worsened by:",
                "options": [
                    "A. Reduced longshore drift due to sea walls altering natural sediment transport",
                    "B. Increased freshwater from Lagos lagoon",
                    "C. High traffic from the Victoria Island bridge",
                    "D. Underground limestone dissolution"
                ],
                "correct": "A",
                "explanation": "Sea walls and land reclamation interrupt longshore drift — the natural movement of sand along coastlines. This starves downstream beaches of sediment and accelerates erosion. A known consequence of the Eko Atlantic project."
            },
        ],
        "real_curriculum_topics": ["Climate change", "Greenhouse gases", "Coastal erosion", "Carbon sequestration", "Sea level rise"],
        "verdict_message": "Geography and Chemistry are governance tools. Understanding climate science is what separates good policy from catastrophic inaction.",
    },
    {
        "id": "case-09",
        "title": "Calabar Tourism & Fiscal Policy",
        "setting": "Calabar International Carnival, Cross River State",
        "subject": "Economics / Government",
        "class_tier": "UTME",
        "difficulty": 3,
        "icon": "🎪",
        "color": "pink",
        "scenario_narrative": (
            "You are an economic policy advisor to the Cross River State Government. The Calabar Carnival "
            "brings 400,000 tourists to the city each December. In 2023, each tourist spent an average of ₦75,000. "
            "The state government spent ₦12 billion organising the carnival. \n\n"
            "A critic claims the carnival is 'wasteful government spending.' Your job is to calculate "
            "the economic multiplier effect, determine the fiscal impact, and recommend whether the government "
            "should continue funding it. Also: the Federal Government has cut the state's FAAC allocation by 30% "
            "this year — how should the state raise alternative revenue? \n\n"
            "Economics and Government knowledge are your tools."
        ),
        "curriculum_link": "JAMB Economics: Fiscal Policy, Multiplier Effect, GDP | JAMB Government: Nigerian Federalism, FAAC",
        "challenge_questions": [
            {
                "question": "Total tourist spending at the 2023 Calabar Carnival was approximately:",
                "options": ["A. ₦30 billion", "B. ₦75 billion", "C. ₦12 billion", "D. ₦400 million"],
                "correct": "A",
                "explanation": "400,000 tourists × ₦75,000 = ₦30,000,000,000 = ₦30 billion in direct tourist spending — compared to ₦12 billion government spend."
            },
            {
                "question": "If the economic multiplier is 2.5, the total GDP impact of the carnival is:",
                "options": ["A. ₦75 billion", "B. ₦30 billion", "C. ₦12 billion", "D. ₦37.5 billion"],
                "correct": "A",
                "explanation": "Multiplier effect: Total impact = Initial spending × Multiplier = ₦30 billion × 2.5 = ₦75 billion. Each naira spent by tourists circulates through local businesses multiple times."
            },
            {
                "question": "FAAC (Federation Account Allocation Committee) distributes revenue to states based on:",
                "options": [
                    "A. Population only",
                    "B. A formula combining population, land area, derivation, and equality",
                    "C. Each state gets equal shares",
                    "D. States that drill the most oil get everything"
                ],
                "correct": "B",
                "explanation": "FAAC shares are based on a multi-factor formula: equality (40%), population (30%), land mass/terrain (10%), social development (10%), internal revenue generation (10%). Oil-producing states get an additional 13% derivation."
            },
            {
                "question": "To compensate for the 30% FAAC cut, Cross River State should prioritize:",
                "options": [
                    "A. Reducing civil service wages immediately",
                    "B. Improving Internally Generated Revenue (IGR) through tourism taxes and VAT enforcement",
                    "C. Borrowing from the World Bank only",
                    "D. Cancelling the carnival"
                ],
                "correct": "B",
                "explanation": "IGR expansion is the sustainable fiscal policy response. States like Lagos generate 80%+ of revenue from IGR (taxes, levies, licenses). Cross River's carnival itself generates taxable revenue from hotels, transport, and trade."
            },
        ],
        "real_curriculum_topics": ["Fiscal policy", "Multiplier effect", "GDP", "FAAC", "IGR", "Nigerian federalism"],
        "verdict_message": "Economics is governance. The Calabar Carnival debate is exactly the kind of fiscal analysis Nigeria's next generation of policymakers must master.",
    },
    {
        "id": "case-10",
        "title": "Kaduna STEM Academy Hackathon",
        "setting": "Kaduna State STEM Academy, Kaduna",
        "subject": "All Subjects — Interdisciplinary",
        "class_tier": "UTME",
        "difficulty": 5,
        "icon": "💡",
        "color": "violet",
        "scenario_narrative": (
            "You are team captain at the inaugural Northern Nigeria STEM Hackathon at Kaduna State Academy. "
            "Your team has 4 hours to design a solution for one of Nigeria's biggest problems: "
            "clean water scarcity affecting 70 million Nigerians. \n\n"
            "Your solution: A solar-powered atmospheric water harvester that extracts moisture from the air. "
            "For your pitch, you must explain: the Chemistry of water extraction from air, "
            "the Physics of solar cell operation, the Biology of clean water standards (pathogens), "
            "the Mathematics of how many litres your device can produce per day, "
            "and the Economics of making it affordable for rural Nigerian families. \n\n"
            "Every subject you studied for JAMB feeds into this one real-world innovation."
        ),
        "curriculum_link": "All JAMB subjects: Chemistry, Physics, Biology, Math, Economics",
        "challenge_questions": [
            {
                "question": "Atmospheric water harvesting extracts water from air by cooling it below the:",
                "options": ["A. Boiling point", "B. Dew point", "C. Flash point", "D. Triple point"],
                "correct": "B",
                "explanation": "The dew point is the temperature at which air becomes saturated and water vapor condenses to liquid. AWG (Atmospheric Water Generators) cool air below the dew point to extract water."
            },
            {
                "question": "A silicon solar cell converts sunlight to electricity via the:",
                "options": ["A. Thermoelectric effect", "B. Photovoltaic effect", "C. Piezoelectric effect", "D. Electrolytic effect"],
                "correct": "B",
                "explanation": "The photovoltaic effect: photons from sunlight knock electrons loose from semiconductor material (silicon), creating a voltage difference and electric current. Core JAMB Physics."
            },
            {
                "question": "If the harvester captures 0.5 litres per hour and operates for 8 sunlight hours, and one family needs 20 litres/day, how many units does a village of 50 families need?",
                "options": ["A. 250 units", "B. 500 units", "C. 25 units", "D. 100 units"],
                "correct": "A",
                "explanation": "1 unit produces 0.5 × 8 = 4 litres/day. 1 family needs 20 litres. So 20/4 = 5 units per family. 50 families × 5 = 250 units total."
            },
            {
                "question": "Water collected from the atmosphere MUST be purified because atmospheric moisture can contain:",
                "options": [
                    "A. Only dust particles",
                    "B. Dissolved particulates, microorganisms, and atmospheric pollutants",
                    "C. Only CO₂",
                    "D. Only nitrogen gas"
                ],
                "correct": "B",
                "explanation": "Atmospheric moisture collects dust, airborne bacteria/fungi, acid rain compounds (SO₂, NOₓ dissolved as acids), and industrial pollutants. Purification (UV treatment, filtration) is mandatory before human consumption."
            },
        ],
        "real_curriculum_topics": ["All JAMB subjects — interdisciplinary integration", "Photovoltaic effect", "Dew point", "Water purification", "Economics of innovation"],
        "verdict_message": "Every subject you studied for JAMB was preparing you for this moment: to solve Nigeria's real problems with science and mathematics.",
    },
]


# ─── In-Memory submission store ───────────────────────────────────────────────
submissions: dict = {}

# ─── Models ───────────────────────────────────────────────────────────────────
class CaseSubmission(BaseModel):
    student_id: str
    answers: List[str]


# ─── Routes ───────────────────────────────────────────────────────────────────
@router.get("/")
async def get_cases(subject: Optional[str] = None, class_tier: Optional[str] = None):
    cases = CASES
    if subject:
        cases = [c for c in cases if subject.lower() in c["subject"].lower()]
    if class_tier:
        cases = [c for c in cases if c["class_tier"] == class_tier.upper()]

    # Strip challenge_questions for list view (bandwidth)
    summary = [{k: v for k, v in c.items() if k != "challenge_questions"} for c in cases]
    return {"cases": summary, "total": len(summary)}


@router.get("/{case_id}")
async def get_case(case_id: str):
    case = next((c for c in CASES if c["id"] == case_id), None)
    if not case:
        raise HTTPException(status_code=404, detail="Case not found")
    return case


@router.post("/{case_id}/submit")
async def submit_case(case_id: str, req: CaseSubmission):
    case = next((c for c in CASES if c["id"] == case_id), None)
    if not case:
        raise HTTPException(status_code=404, detail="Case not found")

    questions = case["challenge_questions"]
    correct = 0
    results = []
    for i, q in enumerate(questions):
        student_ans = req.answers[i].strip().upper() if i < len(req.answers) else ""
        is_correct = student_ans == q["correct"].upper()
        if is_correct:
            correct += 1
        results.append({
            "question": q["question"][:60] + "...",
            "correct_answer": q["correct"],
            "student_answer": student_ans,
            "is_correct": is_correct,
            "explanation": q["explanation"],
        })

    score_pct = round((correct / len(questions)) * 100, 1)
    xp_earned = int(score_pct * 2) + (case["difficulty"] * 10)
    cert_earned = score_pct >= 75

    submission_payload = {
        "case_id": case_id,
        "case_title": case["title"],
        "student_id": req.student_id,
        "score": correct,
        "total": len(questions),
        "score_pct": score_pct,
        "xp_earned": xp_earned,
        "certificate_earned": cert_earned,
        "answers": req.answers,
        "results": results
    }
    try:
        save_case_submission(submission_payload)
    except Exception:
        pass

    return {
        "case_title": case["title"],
        "score": correct,
        "total": len(questions),
        "score_pct": score_pct,
        "xp_earned": xp_earned,
        "results": results,
        "verdict_message": case["verdict_message"],
        "curriculum_link": case["curriculum_link"],
        "real_curriculum_topics": case["real_curriculum_topics"],
        "certificate_earned": cert_earned,
    }
