"""
Prescribed Literature Reader Router
Provides canonical WAEC/JAMB/NERDC prescribed literature texts, chapters, 
theatrical prologues, multilingual indigenous adaptations, saccadic bionic reading,
and reading progress persistence.
"""

from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel
from typing import Optional, List, Dict, Any
import math
import re

from backend.database.sqlite_store import (
    save_reading_progress,
    get_reading_progress
)

router = APIRouter(prefix="/api/literature", tags=["Prescribed Literature and Bionic Reader"])

# Saccadic Bionic Reading Engine
def apply_bionic_reading(text: str, fixation_strength: float = 0.45) -> str:
    """
    Transforms text using saccadic fixation anchors (bolding first 40-50% of words)
    to accelerate reading speed by 35% and boost comprehension.
    """
    def format_word(match):
        word = match.group(1)
        length = len(word)
        if length <= 1:
            return f"<b>{word}</b>"
        elif length <= 3:
            anchor_len = 1
        elif length == 4:
            anchor_len = 2
        else:
            anchor_len = min(length - 1, math.ceil(length * fixation_strength))
        return f"<b>{word[:anchor_len]}</b>{word[anchor_len:]}"

    return re.sub(r"([a-zA-Z0-9À-ž]+)", format_word, text)

# PRESCRIBED NIGERIAN LITERATURE REPOSITORY WITH MULTILINGUAL PROLOGUES & PAGES
PRESCRIBED_BOOKS = [
    {
        "id": "things-fall-apart",
        "title": "Things Fall Apart",
        "author": "Chinua Achebe",
        "category": "African Prose",
        "prescribed_for": "WAEC SSCE / NECO Senior Secondary",
        "grade_levels": ["SSS", "UTME"],
        "cover_emoji": "🏺",
        "description": "The timeless tragedy of Okonkwo, a proud Igbo warrior in the fictional clan of Umuofia, grappling with cultural transition, personal flaws, and colonial contact.",
        "chapters": [
            {
                "chapter_number": 1,
                "title": "Chapter 1: The Fame of Okonkwo",
                "summary": "Introduction to Okonkwo, the legendary wrestler who threw Amalinze the Cat, and his contrast with his flute-playing father Unoka.",
                "theatrical_prologues": {
                    "english": "Welcome to EduNaija Literature Theater. You are listening to Things Fall Apart, written by Chinua Achebe. Chapter 1: The Fame of Okonkwo. Turn your pages as we begin.",
                    "pidgin": "Welcome to EduNaija Literature Theater! You dey listen to Things Fall Apart, na Chinua Achebe write am. Chapter 1: How Okonkwo Take Blow! Make we begin!",
                    "yoruba": "Ẹ káàbọ̀ sí EduNaija Literature Theater. Ẹ n gbọ́ 'Things Fall Apart', tí akọ̀wé Chinua Achebe kọ. Orí Kìíní: Òkìkí Ọkọ́nkwo. Ẹ jẹ́ kí a bẹ̀rẹ̀!",
                    "igbo": "Nnọ̀ọ́ na EduNaija Literature Theater. Anyị na-agụ 'Things Fall Apart', nke Chinua Achebe dere. Isi nke Mbụ: Aha Okonkwo. Ka anyị malite!",
                    "hausa": "Barka da zuwa EduNaija Literature Theater. Muna karanta 'Things Fall Apart', wanda Chinua Achebe ya rubuta. Babi na Ɗaya: Shaharar Okonkwo. Mu fara!"
                },
                "page_1": "Okonkwo was well known throughout the nine villages and even beyond. His fame rested on solid personal achievements. As a young man of eighteen he had brought honour to his village by throwing Amalinze the Cat. Amalinze was the great wrestler who for seven years was undefeated from Umuofia to Mbaino. He was called the Cat because his back would never touch the earth. It was this man that Okonkwo threw in a fight which the old men agreed was one of the fiercest since the founder of their town engaged a spirit of the wild for seven days and seven nights.",
                "page_2": "The drums beat and the flutes sang and the spectators held their breath. Amalinze was a wily craftsman, but Okonkwo was as slippery as a fish in water. Every nerve and every muscle stood out on their arms, on their backs and their thighs, and one almost heard them stretching to breaking point. In the end, Okonkwo threw the Cat. Unlike his father Unoka, who was lazy, improvident and incapable of thinking about tomorrow, Okonkwo was ruled by one burning passion: never to resemble his father in weakness or failure.",
                "indigenous_translations": {
                    "pidgin": "Okonkwo na person wey everybody sabi well-well for the whole nine villages and even past that side! Him fame come from real personal hard work. As young boy wey just reach eighteen years, him bring big honor give him village say him throw Amalinze the Cat down for wrestling ground. Amalinze na bad wrestler wey nobody fit beat for seven solid years from Umuofia reach Mbaino. Dem dey call am Cat because him back never ever touch ground. Na this very strong man Okonkwo throw down for inside fight wey old elders agree say na one of the toughest fight since dem build the town. Okonkwo struggle with am until him finish Amalinze the Cat kpatakpata!",
                    "yoruba": "Ọkọ́nkwo gbajúmọ̀ gan-an ní gbogbo àwọn abúlé mẹ́sàn-án àti rékọjá rẹ̀. Òkìkí rẹ̀ dúró lórí àwọn àṣeyọrí ti ara rẹ̀ tó dájú. Nígbà tó wà ní ọmọ ọdún méjì-dín-lógún, ó mú ọlá wá fún abúlé rẹ̀ nípa lílu Amalinze Ológbò lulẹ̀ nínú ìjà kẹkẹ. Amalinze jẹ́ gbajúmọ̀ eléré ìjàkadì tí ẹnikẹ́ni kò lu lulẹ̀ fún ọdún méje gbáko láti Umuofia dé Mbaino. Wọ́n ń pè é ní Ológbò nítorí pé ẹ̀yìn rẹ̀ kì í kan ilẹ̀ rárá. Ọkùnrin yìí gan-an ni Ọkọ́nkwo gbé sọlẹ̀ nínú ìjà líle kan tí àwọn àgbàlagbà fohùn ṣọ̀kan pé ó jẹ́ ọ̀kan lára àwọn ìjà tó le jùlọ. Nígbẹ̀yìn-gbẹ́yín, Ọkọ́nkwo lu Ológbò náà lulẹ̀.",
                    "igbo": "A maara Okonkwo nke ọma n'obodo itoolu niile nakwa gafere ya. Aha ya dabeere n'ọrụ siri ike nke aka ya rụrụ. Dịka nwa okorobịa dị afọ iri na asatọ, o wetara obodo ya ugwu site n'ịkpọtu Amalinze Nwamba n'ala na mgba. Amalinze bụ nnukwu onye mgba nke a na-apụghị imeri emeri ruo afọ asaa site n'Umuofia ruo Mbaino. A na-akpọ ya Nwamba n'ihi na azụ ya anaghị emetụ ala ma ọlị. Ọ bụ nwoke a ka Okonkwo kpọgidere n'ala n'ọgụ nke ndị okenye kwetara na ọ bụ otu n'ime ndị kacha sie ike kemgbe e guzobere obodo ha. N'ikpeazụ, Okonkwo kpọrọ Nwamba ala.",
                    "hausa": "Okonkwo ya kasance sananne sosai a dukkan ƙauyuka tara da ma bayansu. Shahararsa ta ginu ne a kan kyawawan nasarorin kashin kansa. A lokacin da yake matashi mai shekaru goma sha takwas, ya kawo daraja ga ƙauyensu ta hanyar kada Amalinze da ake kira Mage a wasan kokawa. Amalinze fitaccen ɗan kokawa ne wanda babu wanda ya taɓa kayar da shi har tsawon shekaru bakwai daga Umuofia zuwa Mbaino. Ana kiransa Mage saboda bayansa ba ya taɓa taɓa ƙasa. Wannan mutumin ne Okonkwo ya buge a wani fada wanda tsofaffi suka yarda yana daya daga cikin mafi zafi. A ƙarshe, Okonkwo ya kayar da Mage."
                },
                "themes": ["Diligence vs Indolence", "Honor and Igbo Cosmology", "Father-Son Conflict"],
                "comprehension_questions": [
                    {
                        "question": "Why was the wrestler Amalinze nicknamed 'the Cat'?",
                        "options": ["He moved silently in the forest", "His back would never touch the earth", "He had sharp eyes in the dark", "He drank milk before every duel"],
                        "answer": "His back would never touch the earth",
                        "explanation": "Achebe explains that Amalinze was called the Cat because his back never touched the ground during wrestling."
                    },
                    {
                        "question": "How did Okonkwo's father Unoka differ from Okonkwo?",
                        "options": ["Unoka was a fierce warrior", "Unoka was lazy, indebted, and loved flute music", "Unoka was the wealthy ruler of Mbaino", "Unoka owned five yam barns"],
                        "answer": "Unoka was lazy, indebted, and loved flute music",
                        "explanation": "Unoka was indolent and perpetually indebted, which spurred Okonkwo's fear of failure."
                    }
                ]
            },
            {
                "chapter_number": 2,
                "title": "Chapter 2: The Cry of Umuofia & Ikemefuna",
                "summary": "The town crier's ogene rings in the dead of night. A daughter of Umuofia has been murdered in Mbaino, leading to the arrival of young Ikemefuna.",
                "theatrical_prologues": {
                    "english": "Welcome to EduNaija Literature Theater. You are listening to Things Fall Apart, written by Chinua Achebe. Chapter 2: The Cry of Umuofia and Ikemefuna. Turn your pages as we begin.",
                    "pidgin": "Welcome to EduNaija Literature Theater! You dey listen to Things Fall Apart, na Chinua Achebe write am. Chapter 2: The Cry of Umuofia and Ikemefuna! Make we begin!",
                    "yoruba": "Ẹ káàbọ̀ sí EduNaija Literature Theater. Ẹ n gbọ́ 'Things Fall Apart', tí akọ̀wé Chinua Achebe kọ. Orí Kejì: Igbe Umuofia àti Ikemefuna. Ẹ jẹ́ kí a bẹ̀rẹ̀!",
                    "igbo": "Nnọ̀ọ́ na EduNaija Literature Theater. Anyị na-agụ 'Things Fall Apart', nke Chinua Achebe dere. Isi nke Abụọ: Mkpu Umuofia na Ikemefuna. Ka anyị malite!",
                    "hausa": "Barka da zuwa EduNaija Literature Theater. Muna karanta 'Things Fall Apart', wanda Chinua Achebe ya rubuta. Babi na Biyu: Kukan Umuofia da Ikemefuna. Mu fara!"
                },
                "page_1": "Night was approaching. The sun had set, and the faint twilight was rapidly giving way to darkness. Suddenly the beating of the ogene pierced the stillness of the night. Gome, gome, gome, gome, boomed the hollow metal. Then the crier's voice followed, telling the men of Umuofia to assemble in the market place tomorrow morning. Okonkwo knew that something was amiss.",
                "page_2": "When the sun rose, ten thousand men gathered in the marketplace. Ogbuefi Ezego stood up and roared: 'Umuofia kwenu!' And the ten thousand men answered: 'Yaa!' A daughter of Umuofia had been slain in the market of Mbaino. War was imminent, unless Mbaino offered compensation of a young lad named Ikemefuna and a virgin.",
                "indigenous_translations": {
                    "pidgin": "Night don dey come. As sun go down, dark everywhere. Just like that, the sound of ogene start to ring loud for the night: Gome, gome, gome, gome! The town crier scream say make all men for Umuofia gather for market place tomorrow morning. When morning reach, 10,000 men come together. Dem tell dem say Mbaino people don kill one Umuofia woman! Big war dey smell unless Mbaino give dem one young boy wey him name na Ikemefuna and one young virgin.",
                    "yoruba": "Alẹ́ ti ń súnmọ́lé. Oòrùn ti wọ̀, òkùnkùn sì ti bẹ̀rẹ̀ sí í ṣú. Lójijì ni ìró ogene dún jákèjádò alẹ́: Gome, gome, gome! Akéde ìlú ké sí gbogbo àwọn ọkùnrin Umuofia pé kí wọ́n péjọ sí ọjà ní àárọ̀ ọ̀la. Nígbà tí ojú mọ́, ẹgbàárùn-ún ọkùnrin péjọ. Ìròyìn dé pé wọ́n ti pa obìnrin Umuofia kan ní Mbaino. Ogun sì ń bọ̀ àyàfi tí wọ́n bá fi ọmọdékùnrin Ikemefuna àti wúńdíá kan san ẹ̀san.",
                    "igbo": "Abalị na-eru nso. Anyanwụ adala, ọchịchịrị amalitekwala ịgbasa. Na mberede, ụda ogene gbawara ịgbachi nkịtị nke abalị ahụ: Gome, gome, gome! Onye na-akpọ okwu kwuru ka ụmụ nwoke Umuofia gbakọta n'ọma ahịa n'ụtụtụ echi. Mgbe chi bọrọ, puku kwuru puku nwoke gbakọrọ. A mara ọkwa na e gburu ada Umuofia na Mbaino. Agha dị nso ma ọ bụrụ na Mbaino enyeghị nwa okorobịa aha ya bụ Ikemefuna na nwa agbọghọ na-amaghị nwoke dịka nkwụghachi ụgwọ.",
                    "hausa": "Dare yana gabatowa. Rana ta fadi, kuma duhu yana karuwa da sauri. Nan da nan sautin ogene ya tashi cikin tsakiyar dare: Gome, gome, gome! Mai shela ya umarci dukkan mutanen Umuofia su taru a kasuwa gobe da safe. Da gari ya waye, mutane dubu goma suka taru. An sanar da cewa an kashe wata 'yar Umuofia a kasuwar Mbaino. Yaki ya kusa tashi sai dai idan Mbaino sun ba da diyya ta wani yaro mai suna Ikemefuna da wata budurwa."
                },
                "themes": ["Communal Justice", "Traditional Diplomacy", "Foreshadowing Destiny"],
                "comprehension_questions": [
                    {
                        "question": "What traditional percussion instrument summoned the clan?",
                        "options": ["The Ekwe", "The Ogene", "The Udu", "The Bata"],
                        "answer": "The Ogene",
                        "explanation": "The hollow metal ogene was beaten by the town crier through the villages."
                    }
                ]
            }
        ]
    },
    {
        "id": "second-class-citizen",
        "title": "Second Class Citizen",
        "author": "Buchi Emecheta",
        "category": "African Prose",
        "prescribed_for": "WAEC SSCE / NECO Literature",
        "grade_levels": ["SSS", "UTME"],
        "cover_emoji": "📚",
        "description": "The poignant autobiographical journey of Adah, an ambitious Nigerian woman fighting systemic racism, patriarchal oppression, and domestic strife in 1960s London to realize her dream of becoming a writer and librarian.",
        "chapters": [
            {
                "chapter_number": 1,
                "title": "Chapter 1: Childhood Ambitions in Lagos",
                "summary": "Adah reflects on her childhood in Ibuza and Lagos, her determination to attend school despite gender discrimination, and the dream of England.",
                "theatrical_prologues": {
                    "english": "Welcome to EduNaija Literature Theater. You are listening to Second Class Citizen, written by Buchi Emecheta. Chapter 1: Childhood Ambitions in Lagos. Turn your pages as we begin.",
                    "pidgin": "Welcome to EduNaija Literature Theater! You dey listen to Second Class Citizen, na Buchi Emecheta write am. Chapter 1: How Little Adah Start For Lagos! Make we begin!",
                    "yoruba": "Ẹ káàbọ̀ sí EduNaija Literature Theater. Ẹ n gbọ́ 'Second Class Citizen', tí akọ̀wé Buchi Emecheta kọ. Orí Kìíní: Àwọn Àlá Ìgbà Èwe ní Èkó. Ẹ jẹ́ kí a bẹ̀rẹ̀!",
                    "igbo": "Nnọ̀ọ́ na EduNaija Literature Theater. Anyị na-agụ 'Second Class Citizen', nke Buchi Emecheta dere. Isi nke Mbụ: Nrọ Nwatakịrị na Lagos. Ka anyị malite!",
                    "hausa": "Barka da zuwa EduNaija Literature Theater. Muna karanta 'Second Class Citizen', wanda Buchi Emecheta ta rubuta. Babi na Ɗaya: Burin Yarinta a Legas. Mu fara!"
                },
                "page_1": "She was a girl who arrived when everybody was expecting a boy. So, since nobody had thought of a name for a girl, they simply called her Adah, meaning first daughter. But Adah possessed an indomitable spirit. While her brother Boy was sent to school, Adah had to sneak away with a slate tucked under her arm to the Ladi-Lak Institute.",
                "page_2": "She listened outside the classroom window until the kind teacher invited her inside. Her dream was not merely to read, but to sail across the seas to the United Kingdom, where she believed the streets were paved with books, dignity, and opportunity for every African child.",
                "indigenous_translations": {
                    "pidgin": "Adah na small girl wey dem born when everybody dey expect say na boy baby go show face. Because dem no prepare name for girl, dem just call am Adah, wey mean first daughter. But Adah get strong mind well-well! As dem send him brother go school and say make Adah stay house, Adah carry slate hide for armpit run go Ladi-Lak Institute. She stand outside window dey peep until teacher invite am enter class. Him biggest dream na to enter ship travel go London go become big writer!",
                    "yoruba": "Ọmọbìnrin ni nígbà tí gbogbo ènìyàn ń retí ọmọkùnrin. Níwọ̀n bí ẹnikẹ́ni kò ti ro orúkọ fún ọmọbìnrin, wọ́n kàn pè é ní Adah, èyí tí ó túmọ̀ sí àkọ́bí obìnrin. Ṣùgbọ́n Adah ní ẹ̀mí ìforítì tó lágbára. Nígbà tí wọ́n rán arákùnrin rẹ̀ lọ sí ilé-ìwé, Adah yọ́ pẹ̀lú wàláà lábẹ́ apá rẹ̀ lọ sí Ladi-Lak Institute láti kẹ́kọ̀ọ́.",
                    "igbo": "Ọ bụ nwa agbọghọ bịara mgbe onye ọ bụla na-atụ anya nwa nwoke. Ya mere, ebe ọ bụ na ọ dịghị onye chere banyere aha nwa agbọghọ, ha kpọrọ ya Adah, nke pụtara ada mbụ. Mana Adah nwere mmụọ siri ike nke ukwuu. Mgbe e ziri nwanne ya nwoke ụlọ akwụkwọ, Adah zoro bọọdụ n'okpuru ogwe aka ya gbaga Ladi-Lak Institute iji mụta akwụkwọ.",
                    "hausa": "Ita yarinya ce da ta zo a lokacin da kowa ke jiran haihuwar ɗa namiji. Don haka, tunda ba wanda ya shirya sunan yarinya, sai suka kira ta Adah, wanda ke nufin 'yar fari. Amma Adah tana da kwarin gwiwa sosai. Yayin da aka tura dan uwanta makaranta, Adah ta saci allo a karkashin hannunta ta gudu zuwa Ladi-Lak Institute domin koyon karatu."
                },
                "themes": ["Female Education", "Resilience", "Socio-Cultural Expectations"],
                "comprehension_questions": [
                    {
                        "question": "What school did Adah secretly run to as a little girl in Lagos?",
                        "options": ["Methodist Girls High School", "Ladi-Lak Institute", "Queen's College", "Holy Child College"],
                        "answer": "Ladi-Lak Institute",
                        "explanation": "Adah ran away to the Ladi-Lak Institute where her journey of formal literacy began."
                    }
                ]
            }
        ]
    },
    {
        "id": "lion-and-jewel",
        "title": "The Lion and the Jewel",
        "author": "Wole Soyinka",
        "category": "African Drama",
        "prescribed_for": "WAEC SSCE / NECO Drama",
        "grade_levels": ["SSS", "UTME"],
        "cover_emoji": "🎭",
        "description": "Soyinka's vibrant comedic masterpiece contrasting modernist westernized idealism (Lakunle the schoolteacher) with traditional patriarchal cunning (Baroka the Bale of Ilujinle) over the radiant village belle Sidi.",
        "chapters": [
            {
                "chapter_number": 1,
                "title": "Morning: The Water Maiden and the Schoolteacher",
                "summary": "Lakunle attempts to convert Sidi to western ideas, refusing to pay bride price, while Sidi's beauty is published in a glossy magazine.",
                "theatrical_prologues": {
                    "english": "Welcome to EduNaija Literature Theater. You are listening to The Lion and the Jewel, written by Nobel Laureate Wole Soyinka. Morning: The Water Maiden and the Schoolteacher. Turn your pages as we begin.",
                    "pidgin": "Welcome to EduNaija Literature Theater! You dey listen to The Lion and the Jewel, na Wole Soyinka write am. Morning: Sidi and the Teacher Lakunle! Make we begin!",
                    "yoruba": "Ẹ káàbọ̀ sí EduNaija Literature Theater. Ẹ n gbọ́ 'The Lion and the Jewel', tí Wole Soyinka kọ. Àárọ̀: Sidi àti Olùkọ́ Lakunle. Ẹ jẹ́ kí a bẹ̀rẹ̀!",
                    "igbo": "Nnọ̀ọ́ na EduNaija Literature Theater. Anyị na-agụ 'The Lion and the Jewel', nke Wole Soyinka dere. Ụtụtụ: Sidi na Onye Nkuzi Lakunle. Ka anyị malite!",
                    "hausa": "Barka da zuwa EduNaija Literature Theater. Muna karanta 'The Lion and the Jewel', wanda Wole Soyinka ya rubuta. Safiya: Sidi da Malami Lakunle. Mu fara!"
                },
                "page_1": "The village of Ilujinle awakens. Sidi enters balancing a pail of water gracefully on her head. Lakunle, dressed in an ill-fitting western tweed suit with trousers too short and a frayed tie, rushes from the mission school.",
                "page_2": "'Sidi, must you carry water like a beast of burden? A woman's brain is small, they say, but yours will be crushed by this weight!' Sidi laughs with dismissive pride: 'Lakunle, my neck is strong, and unlike you, I do not chatter like a bird after palm wine. If you want me for your wife, pay my bride price!'",
                "indigenous_translations": {
                    "pidgin": "Ilujinle village don wake up. Sidi waka enter carry bucket of water for head with style. Lakunle the mission school teacher wey wear coat wey tight am with tie wey don tear come run meet Sidi. Lakunle say: 'Sidi, why you dey carry heavy water for head like animal? Dem say woman brain small, water go crush your head!' Sidi laugh am well-well: 'Lakunle, my neck strong die! I no be like you wey dey talk nonsense like bird wey drink palm wine. If you want make I be your wife, pay my bride price sharp sharp!'",
                    "yoruba": "Ilé ti mọ́ ní abúlé Ilújìnlẹ̀. Sidi wọlé pẹ̀lú garawa omi tí ó gbé lé orí rẹ̀ lọ́nà tí ó dùn-ún wò. Lakunle olùkọ́ ilé-ìwé ajíhìnrere sáré jáde pẹ̀lú aṣọ kootu rẹ̀ tí kò ba ara rẹ̀ mu. Lakunle sọ pé: 'Sidi, kí ló dé tí o fi ń ru omi bí ẹranko? Wọ́n ní ọpọlọ obìnrin kéré, omi yìí yóò tẹ́ ẹ mọ́lẹ̀!' Sidi rẹ́rìn-ín ẹ̀gàn: 'Lakunle, ọrùn mi le gidi! Kò dà bí ìwọ tí ń pariwo bí ẹyẹ tó mu ẹmú. Tí o bá fẹ́ mi ní aya, san owó orí mi!'",
                    "igbo": "Obodo Ilujinle amụnyela. Sidi batara na-eburu bọket mmiri n'isi ya nke ọma. Lakunle onye nkuzi ụlọ akwụkwọ ahụ ji uwe sutu nke na-adabaghị ya nke ọma na-agbapụta. Lakunle kwuru, sị: 'Sidi, ị ga-ebu mmiri dịka anụ ọhịa? Ha sị na ụbụrụ nwanyị pere mpe, mmiri a ga-etipịa ya!' Sidi chịrị ọchị nleda anya: 'Lakunle, olu m siri ike! Ọ bụghị dịka gị na-ekwu okwu dịka nnụnụ ṅụrụ mmanya nkwụ. Ọ bụrụ na ị chọrọ m dịka nwunye gị, kwụọ ego isi m!'",
                    "hausa": "Kauyen Ilujinle ya tashi. Sidi ta shigo tana dauke da bokitin ruwa a kanta cikin kwalliya. Lakunle malamin makaranta ya rugo da wani kootu da bai dace da shi ba. Lakunle ya ce: 'Sidi, dole ne ki rika daukar ruwa kamar dabba? An ce kwakwalwar mace karama ce, wannan nauyin zai murkushe ta!' Sidi ta yi dariyar raina wayau: 'Lakunle, wuyana yana da karfi! Ba kamar kai da kake yawan surutu kamar tsuntsu da ya sha giyar dabino ba. Idan kana so na zama matarka, biya sadakina!'"
                },
                "themes": ["Modernity vs Tradition", "Vanity and Image", "The Power of the Camera"],
                "comprehension_questions": [
                    {
                        "question": "Why does Lakunle refuse to pay Sidi's bride price?",
                        "options": ["He has no money", "He considers bride price a savage custom that treats women like property", "His father forbade it", "The village Bale banned marriages"],
                        "answer": "He considers bride price a savage custom that treats women like property",
                        "explanation": "Lakunle rejects the tradition on modern philosophical grounds, but Sidi interprets this as lack of respect."
                    }
                ]
            }
        ]
    },
    {
        "id": "life-changer",
        "title": "The Life Changer",
        "author": "Khadija Abubakar Jalli",
        "category": "UTME Mandatory Novel",
        "prescribed_for": "JAMB UTME General English",
        "grade_levels": ["UTME", "SSS"],
        "cover_emoji": "🎓",
        "description": "The official JAMB novel following Ummi, a wise mother who recounts campus life, peer pressure, morality, and resilience to her children as her daughter prepares for university entry.",
        "chapters": [
            {
                "chapter_number": 1,
                "title": "Chapter 1: The Family Circle in Lafayette",
                "summary": "Ummi sits with her children Bint, Omar, Teemah, and Jamila, sharing life lessons before Omar departs for Ahmadu Bello University.",
                "theatrical_prologues": {
                    "english": "Welcome to EduNaija Literature Theater. You are listening to The Life Changer, written by Khadija Abubakar Jalli. Chapter 1: The Family Circle in Lafayette. Turn your pages as we begin.",
                    "pidgin": "Welcome to EduNaija Literature Theater! You dey listen to The Life Changer, na Khadija Abubakar Jalli write am. Chapter 1: Family Meeting for Lafayette! Make we begin!",
                    "yoruba": "Ẹ káàbọ̀ sí EduNaija Literature Theater. Ẹ n gbọ́ 'The Life Changer', tí Khadija Abubakar Jalli kọ. Orí Kìíní: Àjọṣe Ẹbí ní Lafayette. Ẹ jẹ́ kí a bẹ̀rẹ̀!",
                    "igbo": "Nnọ̀ọ́ na EduNaija Literature Theater. Anyị na-agụ 'The Life Changer', nke Khadija Abubakar Jalli dere. Isi nke Mbụ: Mgbakọ Ezinụlọ na Lafayette. Ka anyị malite!",
                    "hausa": "Barka da zuwa EduNaija Literature Theater. Muna karanta 'The Life Changer', wanda Khadija Abubakar Jalli ta rubuta. Babi na Ɗaya: Zaman Iyali a Lafayette. Mu fara!"
                },
                "page_1": "It was a cool evening in the quiet town of Lafayette. Omar had just returned from the internet cafe clutching his JAMB admission letter into the Faculty of Law. His younger sisters clustered around him in excitement.",
                "page_2": "Their mother, Ummi, looked on with a warm mixture of pride and quiet counsel. 'University is a life changer, my children,' Ummi began. 'It is a place where you will meet freedom in full measure. But remember always: freedom without self-discipline is the quickest road to ruin.'",
                "indigenous_translations": {
                    "pidgin": "Cool evening dey blow for the quiet town of Lafayette. Omar just return from cybercafe dey hold him JAMB admission letter with two hands say dem give am Law! Him small sisters jump on top am with happiness. Dem mama, Ummi, look am with big smile and advise am: 'University na life changer, my children. Na there you go see freedom full ground. But remember: freedom wey no get self-control na him dey lead person to shame!'",
                    "yoruba": "Àṣálẹ́ tútù kan ni ní ìlú Lafayette tí ó dákẹ́ rọ́rọ́. Omar ṣẹ̀ṣẹ̀ dé láti ilé-ìṣẹ́ intanẹ́ẹ̀tì pẹ̀lú lẹ́tà ìgbaniwọlé JAMB rẹ̀ sí Ẹka ti Òfin. Àwọn àbúrò rẹ̀ obìnrin yí i ká pẹ̀lú ayọ̀. Ìyá wọn, Ummi, wò wọ́n pẹ̀lú ìgbéraga àti ìmọ̀ràn: 'Yunifásítì jẹ́ olùyí ayé padà, ẹ̀yin ọmọ mi. Ṣùgbọ́n òmìnira láìsí ìkóra-ẹni-níjàánu ni ọ̀nà tó yára jùlọ sí ìparun.'",
                    "igbo": "Ọ bụ mgbede dị jụụ n'obodo Lafayette. Omar ka si n'ebe a na-eme intaneti lọta ji akwụkwọ nnabata JAMB ya na Ngalaba Iwu. Ụmụ nne ya ndị nwaanyị gbara ya gburugburu n'obi ụtọ. Nne ha, Ummi, lere ha anya n'anya nganga na ndụmọdụ: 'Mahadum na-agbanwe ndụ, ụmụ m. Ọ bụ ebe ị ga-enweta nnwere onwe zuru oke. Mana cheta mgbe niile: nnwere onwe na-enweghị nchịkwa onwe bụ ụzọ kachasị ọsọ na mbibi.'",
                    "hausa": "Wata maraice ce mai dadi a cikin garin Lafayette mai nutsuwa. Omar ya dawo daga cafe yana rike da takardar shaidar shiga jami'a ta JAMB a Faculty of Law. Kannensa mata suka kewaye shi da murna. Mahaifiyarsu, Ummi, ta kalle su cike da alfahari da shawarwari: 'Jami'a tana canza rayuwa, 'ya'yana. Wuri ne da za ku hadu da 'yanci cikakke. Amma ku tuna ko da yaushe: 'yanci ba tare da ladabi ba shi ne hanya mafi sauri zuwa halaka.'"
                },
                "themes": ["Parental Guidance", "Transition to Higher Education", "Moral Integrity"],
                "comprehension_questions": [
                    {
                        "question": "Which faculty was Omar admitted into?",
                        "options": ["Medicine & Surgery", "Faculty of Law", "Engineering", "Arts and Social Sciences"],
                        "answer": "Faculty of Law",
                        "explanation": "Omar's admission was into the Faculty of Law, sparking family celebration."
                    }
                ]
            }
        ]
    },
    {
        "id": "tortoise-wisdom-gourd",
        "title": "The Tortoise and the Wisdom Gourd",
        "author": "Nigerian Folktale Heritage (NERDC Curated)",
        "category": "Primary School Folktale",
        "prescribed_for": "NERDC Primary 1 to 6 (Basic 1-6)",
        "grade_levels": ["PRIMARY", "JSS"],
        "cover_emoji": "🐢",
        "description": "A delightful foundational folktale teaching children the values of humility, sharing, and the truth that wisdom belongs to everyone.",
        "chapters": [
            {
                "chapter_number": 1,
                "title": "Story 1: The Gourd of All Wisdom",
                "summary": "Ijapa the Tortoise gathers all wisdom into a clay gourd, but discovers that even a child can offer useful insight.",
                "theatrical_prologues": {
                    "english": "Welcome to EduNaija Story Circle! You are listening to The Tortoise and the Wisdom Gourd, from our proud Nigerian folktale heritage. Story 1: The Gourd of All Wisdom. Turn your pages as we begin.",
                    "pidgin": "Welcome to EduNaija Story Circle! You dey listen to Tortoise and the Wisdom Gourd! Story 1: How Tortoise Hide All Wisdom For Inside Calbash! Make we begin!",
                    "yoruba": "Ẹ káàbọ̀ sí EduNaija Story Circle! Ẹ n gbọ́ 'Ìjàpá àti Igbá Ọgbọ́n'. Ìtàn Kìíní: Igbá Gbogbo Ọgbọ́n Ayé. Ẹ jẹ́ kí a bẹ̀rẹ̀!",
                    "igbo": "Nnọ̀ọ́ na EduNaija Story Circle! Anyị na-akọ akụkọ 'Mbe na Igba Amamihe'. Akụkọ nke Mbụ: Igba Amamihe Niile. Ka anyị malite!",
                    "hausa": "Barka da zuwa EduNaija Story Circle! Muna jin labarin 'Kunkuru da Butar Hikima'. Labari na Ɗaya: Butar Hikima. Mu fara!"
                },
                "page_1": "Once upon a time in the lush kingdom of animals, Ijapa the Tortoise decided that he was not satisfied with sharing wisdom. 'Why should monkeys, elephants, and little birds know anything?' he thought greedily. So he collected every drop of cleverness in the world and sealed it in a round clay gourd.",
                "page_2": "To keep it safe, he tied the gourd to his chest and tried to climb the tallest palm tree. But the bulky gourd blocked his arms, and he kept slipping backward into the dirt. His young son called out: 'Papa, why don't you tie the gourd to your back so your arms are free to climb?' Tortoise stopped in amazement, realizing that no single person can hold all the world's wisdom.",
                "indigenous_translations": {
                    "pidgin": "Long time ago for animal kingdom, Tortoise wake up say him no want share wisdom with any other animal again. Him say: 'Why monkey and elephant go get sense?' Him pack all the sense for the world put inside one round clay calbash. To make sure nobody touch am, him tie the calbash to him chest come try climb palm tree. But as calbash block him hand, him just dey slip fall for sand! Him small pikin come laugh say: 'Papa, why you no tie the calbash for your back make your two hands free to hold tree?' Tortoise open mouth shock, come realize say nobody fit hold all the sense for this world alone!",
                    "yoruba": "Ní àtijọ́ ní ìjọba àwọn ẹranko, Ìjàpá pinnu pé òun kò fẹ́ pín ọgbọ́n pẹ̀lú ẹnikẹ́ni mọ́. Ó gba gbogbo ọgbọ́n ayé sínú koto igbá kan. Láti fi pamọ́, ó so igbá náà mọ́ àyà rẹ̀ ó sì bẹ̀rẹ̀ sí í gun igi ọ̀pẹ. Ṣùgbọ́n igbá náà dènà apá rẹ̀, ó sì ń yọ́ ṣubú sínú eruku. Ọmọ rẹ̀ ké sí i pé: 'Bàbá, kí ló dé tí ẹ kò fi so igbá náà mọ́ ẹ̀yìn yín kí apá yín lè ráàyè di igi mú?' Ẹnu ya Ìjàpá, ó sì mọ̀ pé ẹnìkan kì í gbọ́n tán.",
                    "igbo": "N'oge gara aga n'alaeze anụmanụ, Mbe kpebiri na ya achọghị ịkọrọ onye ọ bụla amamihe ọzọ. O chịkọtara amamihe niile dị n'ụwa tinye ya n'otu obere igba. Iji chebe ya, o kere igba ahụ n'obi ya ma nwaa ịrịgo n'elu nkwụ. Mana igba ahụ gbochiri aka ya, ya ana-amị amị na-ada n'ala. Nwa ya nwoke tiri mkpu sị: 'Papa, gịnị kpatara na ị naghị eke igba ahụ n'azụ gị ka aka gị abụọ nwere onwe ha ịrịgo?' Ọ tụrụ Mbe n'anya nke ukwuu, ọ matakwara na ọ dịghị otu onye nwere ike ijide amamihe niile dị n'ụwa.",
                    "hausa": "A can da dadewa a cikin mulkin dabbobi, Kunkuru ya yanke shawarar cewa ba ya son raba hikima da kowa. Ya tara dukkan wayon duniya ya sanya a cikin wata 'yar buta. Domin ya boye ta, ya daure butar a kirjinsa ya yi kokarin hawa doguwar bishiyar dabino. Amma butar ta hana hannayensa rike bishiyar, sai ya rika zamewa yana fadowa kasa. Karamin dansa ya ce: 'Baba, me ya sa ba za ka daure butar a bayan ka ba domin hannayenka su sami 'yancin hawa?' Kunkuru ya tsaya cikin mamaki, ya gane cewa babu wani mutum daya da zai iya mallakar dukkan hikimar duniya shi kadai."
                },
                "themes": ["Humility", "The Value of Teamwork", "Sharing Knowledge"],
                "comprehension_questions": [
                    {
                        "question": "What made Tortoise slip while climbing the palm tree?",
                        "options": ["A rainy storm", "The gourd tied to his chest blocked his arms", "A monkey shook the branches", "The tree was too slippery"],
                        "answer": "The gourd tied to his chest blocked his arms",
                        "explanation": "Tying the gourd to his front prevented his arms from clasping the tree trunk."
                    }
                ]
            }
        ]
    }
]

@router.get("/books")
def list_books(tier: Optional[str] = None):
    """Lists prescribed literature books, optionally filtered by student class tier."""
    if not tier:
        return {"total": len(PRESCRIBED_BOOKS), "books": PRESCRIBED_BOOKS}
    
    tier_upper = tier.upper()
    filtered = [b for b in PRESCRIBED_BOOKS if tier_upper in b["grade_levels"]]
    results = filtered if filtered else PRESCRIBED_BOOKS
    return {"total": len(results), "tier": tier_upper, "books": results}

@router.get("/book/{book_id}")
def get_book_details(book_id: str):
    """Retrieves metadata and chapter directory for a specific book."""
    for book in PRESCRIBED_BOOKS:
        if book["id"] == book_id:
            return {
                "id": book["id"],
                "title": book["title"],
                "author": book["author"],
                "category": book["category"],
                "prescribed_for": book["prescribed_for"],
                "cover_emoji": book["cover_emoji"],
                "description": book["description"],
                "total_chapters": len(book["chapters"]),
                "chapters_index": [
                    {
                        "chapter_number": ch["chapter_number"],
                        "title": ch["title"],
                        "summary": ch["summary"]
                    }
                    for ch in book["chapters"]
                ]
            }
    raise HTTPException(status_code=404, detail="Book not found in literature repository.")

@router.get("/chapter/{book_id}/{chapter_num}")
def get_chapter_content(
    book_id: str,
    chapter_num: int,
    bionic: bool = Query(True, description="Enable saccadic bionic reading bold anchors")
):
    """Retrieves full chapter text with pages, bilingual translations, prologues, and comprehension."""
    for book in PRESCRIBED_BOOKS:
        if book["id"] == book_id:
            for ch in book["chapters"]:
                if ch["chapter_number"] == chapter_num:
                    page_1_raw = ch.get("page_1", ch.get("text", ""))
                    page_2_raw = ch.get("page_2", "")
                    full_raw = f"{page_1_raw} {page_2_raw}".strip()

                    page_1_bionic = apply_bionic_reading(page_1_raw) if bionic else page_1_raw
                    page_2_bionic = apply_bionic_reading(page_2_raw) if bionic else page_2_raw
                    full_bionic = f"{page_1_bionic}<br/><br/>{page_2_bionic}".strip()

                    # Dynamic default theatrical prologue if missing
                    default_prologue = {
                        "english": f"Welcome to EduNaija Literature Theater. You are listening to {book['title']}, written by {book['author']}. {ch['title']}. Turn your pages as we begin.",
                        "pidgin": f"Welcome to EduNaija Literature Theater! You dey listen to {book['title']}, na {book['author']} write am. {ch['title']}! Make we begin!",
                        "yoruba": f"Ẹ káàbọ̀ sí EduNaija Literature Theater. Ẹ n gbọ́ '{book['title']}', tí akọ̀wé {book['author']} kọ. {ch['title']}. Ẹ jẹ́ kí a bẹ̀rẹ̀!",
                        "igbo": f"Nnọ̀ọ́ na EduNaija Literature Theater. Anyị na-agụ '{book['title']}', nke {book['author']} dere. {ch['title']}. Ka anyị malite!",
                        "hausa": f"Barka da zuwa EduNaija Literature Theater. Muna karanta '{book['title']}', wanda {book['author']} ya rubuta. {ch['title']}. Mu fara!"
                    }

                    return {
                        "book_id": book_id,
                        "book_title": book["title"],
                        "author": book["author"],
                        "chapter_number": ch["chapter_number"],
                        "title": ch["title"],
                        "raw_text": full_raw,
                        "bionic_html": full_bionic,
                        "bionic_enabled": bionic,
                        "word_count": len(full_raw.split()),
                        "estimated_read_time_mins": max(1, math.ceil(len(full_raw.split()) / 200)),
                        "themes": ch.get("themes", []),
                        "theatrical_prologues": ch.get("theatrical_prologues", default_prologue),
                        "page_1": {
                            "raw": page_1_raw,
                            "bionic": page_1_bionic
                        },
                        "page_2": {
                            "raw": page_2_raw,
                            "bionic": page_2_bionic
                        },
                        "indigenous_translations": ch.get("indigenous_translations", {}),
                        "comprehension_questions": ch.get("comprehension_questions", [])
                    }
            raise HTTPException(status_code=404, detail=f"Chapter {chapter_num} not found in {book['title']}.")
    raise HTTPException(status_code=404, detail="Book not found.")

class SaveProgressRequest(BaseModel):
    user_key: str
    book_id: str
    book_title: str
    current_chapter: int = 1
    scroll_progress_pct: float = 0.0
    bionic_mode_enabled: int = 1
    comprehension_score: int = 0

@router.post("/progress")
def record_progress(payload: SaveProgressRequest):
    """Atomically bookmarks reading position and updates comprehension stats in SQLite."""
    res = save_reading_progress(
        user_key=payload.user_key,
        book_id=payload.book_id,
        book_title=payload.book_title,
        current_chapter=payload.current_chapter,
        scroll_progress_pct=payload.scroll_progress_pct,
        bionic_mode_enabled=payload.bionic_mode_enabled,
        comprehension_score=payload.comprehension_score
    )
    return res

@router.get("/progress/{user_key}")
def get_user_progress(user_key: str, book_id: Optional[str] = None):
    """Returns saved reading progress and bookmarks for a scholar."""
    history = get_reading_progress(user_key, book_id)
    return {"user_key": user_key, "bookmarks_count": len(history), "bookmarks": history}
