"""
Nigerian Curriculum Knowledge Graph for EduNaija OS

Maps ALL prerequisite dependencies in JAMB/WAEC subjects.
If student fails topic X, graph traversal finds prerequisite
topics they must master first.
"""
import networkx as nx
import json

class NigerianCurriculumGraph:
    def __init__(self):
        self.graph = nx.DiGraph()  # Directed: A (prereq) -> requires -> B (target)
        self._build_chemistry_graph()
        self._build_physics_graph()
        self._build_mathematics_graph()
        self._build_biology_graph()
        self._build_english_graph()
    
    def _add_edges(self, subject: str, edges: list):
        for u, v in edges:
            self.graph.add_edge(f"{subject}_{u}", f"{subject}_{v}")
            # Add metadata to nodes
            self.graph.nodes[f"{subject}_{u}"]['subject'] = subject
            self.graph.nodes[f"{subject}_{u}"]['name'] = u
            self.graph.nodes[f"{subject}_{v}"]['subject'] = subject
            self.graph.nodes[f"{subject}_{v}"]['name'] = v

    def _build_chemistry_graph(self):
        edges = [
            ("Matter", "Elements"), ("Elements", "Atoms"), ("Atoms", "Atomic Structure"),
            ("Atomic Structure", "Electronic Configuration"), ("Electronic Configuration", "Periodicity"),
            ("Periodicity", "Periodic Table"), ("Atomic Structure", "Isotopes"),
            ("Isotopes", "Radioactivity"), ("Electronic Configuration", "Chemical Bonding"),
            ("Chemical Bonding", "Electrovalent Bond"), ("Chemical Bonding", "Covalent Bond"),
            ("Covalent Bond", "Intermolecular Forces"), ("Elements", "Compounds"),
            ("Compounds", "Mixtures"), ("Atoms", "Mole Concept"),
            ("Mole Concept", "Stoichiometry"), ("Stoichiometry", "Balancing Equations"),
            ("Compounds", "Acids Bases Salts"), ("Acids Bases Salts", "pH"),
            ("pH", "Buffer Solutions"), ("Electronic Configuration", "Oxidation States"),
            ("Oxidation States", "Redox Reactions"), ("Redox Reactions", "Electrolysis"),
            ("Electrolysis", "Faraday Laws"), ("Stoichiometry", "Chemical Kinetics"),
            ("Chemical Kinetics", "Rates of Reaction"), ("Rates of Reaction", "Chemical Equilibrium"),
            ("Chemical Equilibrium", "Le Chatelier Principle"), ("Covalent Bond", "Organic Chemistry"),
            ("Organic Chemistry", "Alkanes"), ("Alkanes", "Alkenes"), ("Alkenes", "Alkynes"),
            ("Organic Chemistry", "Functional Groups"), ("Functional Groups", "Alkanols"),
            ("Functional Groups", "Organic Acids"), ("Alkanols", "Esters"), ("Organic Acids", "Esters"),
            ("Alkenes", "Polymers")
        ]
        self._add_edges("chemistry", edges)
    
    def _build_physics_graph(self):
        edges = [
            ("Physical Quantities", "Units"), ("Units", "Measurements"),
            ("Physical Quantities", "Scalars and Vectors"),
            ("Scalars and Vectors", "Kinematics"), ("Kinematics", "Distance and Displacement"),
            ("Distance and Displacement", "Speed and Velocity"), ("Speed and Velocity", "Acceleration"),
            ("Acceleration", "Equations of Motion"), ("Equations of Motion", "Projectile Motion"),
            ("Equations of Motion", "Dynamics"), ("Dynamics", "Newton Laws"),
            ("Newton Laws", "Friction"), ("Newton Laws", "Circular Motion"),
            ("Newton Laws", "Gravitation"), ("Dynamics", "Work Energy Power"),
            ("Work Energy Power", "Machines"), ("Matter", "Elasticity"),
            ("Elasticity", "Hooke Law"), ("Matter", "Hydrostatics"),
            ("Hydrostatics", "Pressure"), ("Pressure", "Archimedes Principle"),
            ("Physical Quantities", "Heat"), ("Heat", "Temperature"),
            ("Temperature", "Thermal Expansion"), ("Heat", "Specific Heat Capacity"),
            ("Specific Heat Capacity", "Latent Heat"), ("Temperature", "Gas Laws"),
            ("Gas Laws", "Thermodynamics"), ("Kinematics", "Waves"),
            ("Waves", "Sound"), ("Waves", "Light"), ("Light", "Reflection"),
            ("Light", "Refraction"), ("Refraction", "Lenses"), ("Lenses", "Optical Instruments"),
            ("Matter", "Electrostatics"), ("Electrostatics", "Coulomb Law"),
            ("Coulomb Law", "Electric Field"), ("Electric Field", "Current Electricity"),
            ("Current Electricity", "Ohm Law"), ("Ohm Law", "Circuits"),
            ("Current Electricity", "Magnetism"), ("Magnetism", "Electromagnetism"),
            ("Electromagnetism", "Electromagnetic Induction"), ("Electromagnetic Induction", "AC Circuits"),
            ("Electromagnetism", "Modern Physics"), ("Modern Physics", "Radioactivity")
        ]
        self._add_edges("physics", edges)
    
    def _build_mathematics_graph(self):
        edges = [
            ("Numbers", "Fractions"), ("Numbers", "Decimals"), ("Numbers", "Percentages"),
            ("Numbers", "Ratio and Proportion"), ("Ratio and Proportion", "Rates"),
            ("Numbers", "Indices"), ("Indices", "Logarithms"), ("Indices", "Surds"),
            ("Numbers", "Sets"), ("Sets", "Venn Diagrams"), ("Sets", "Logic"),
            ("Numbers", "Algebra"), ("Algebra", "Polynomials"), ("Algebra", "Equations"),
            ("Equations", "Linear Equations"), ("Linear Equations", "Simultaneous Equations"),
            ("Equations", "Quadratic Equations"), ("Equations", "Inequalities"),
            ("Equations", "Matrices"), ("Matrices", "Determinants"),
            ("Numbers", "Progressions"), ("Progressions", "Arithmetic Progression"),
            ("Progressions", "Geometric Progression"), ("Algebra", "Functions"),
            ("Functions", "Relations"), ("Geometry", "Lines and Angles"),
            ("Lines and Angles", "Triangles"), ("Triangles", "Polygons"), ("Polygons", "Circles"),
            ("Geometry", "Coordinate Geometry"), ("Triangles", "Trigonometry"),
            ("Trigonometry", "Sine and Cosine Rules"), ("Geometry", "Mensuration"),
            ("Mensuration", "Perimeter and Area"), ("Perimeter and Area", "Volume"),
            ("Numbers", "Statistics"), ("Statistics", "Mean Median Mode"),
            ("Mean Median Mode", "Dispersion"), ("Dispersion", "Variance and Standard Deviation"),
            ("Sets", "Probability"), ("Functions", "Calculus"),
            ("Calculus", "Differentiation"), ("Differentiation", "Integration")
        ]
        self._add_edges("mathematics", edges)
    
    def _build_biology_graph(self):
        edges = [
            ("Living Things", "Cell"), ("Cell", "Cell Structure"),
            ("Cell Structure", "Cell Division"), ("Cell Division", "Mitosis"),
            ("Cell Division", "Meiosis"), ("Cell", "Tissues"), ("Tissues", "Organs"),
            ("Organs", "Systems"), ("Living Things", "Taxonomy"),
            ("Taxonomy", "Viruses"), ("Taxonomy", "Monera"), ("Taxonomy", "Protista"),
            ("Taxonomy", "Fungi"), ("Taxonomy", "Plantae"), ("Taxonomy", "Animalia"),
            ("Living Things", "Nutrition"), ("Nutrition", "Autotrophic"),
            ("Autotrophic", "Photosynthesis"), ("Nutrition", "Heterotrophic"),
            ("Heterotrophic", "Digestion"), ("Systems", "Transport System"),
            ("Transport System", "Blood"), ("Blood", "Heart"), ("Heart", "Circulatory System"),
            ("Systems", "Respiration"), ("Respiration", "Aerobic Respiration"),
            ("Respiration", "Anaerobic Respiration"), ("Systems", "Excretion"),
            ("Excretion", "Kidneys"), ("Systems", "Homeostasis"), ("Homeostasis", "Regulation"),
            ("Systems", "Nervous System"), ("Nervous System", "Brain and Spinal Cord"),
            ("Nervous System", "Sense Organs"), ("Systems", "Endocrine System"),
            ("Endocrine System", "Hormones"), ("Systems", "Reproduction"),
            ("Reproduction", "Asexual Reproduction"), ("Reproduction", "Sexual Reproduction"),
            ("Plantae", "Flowers"), ("Flowers", "Seeds and Fruits"),
            ("Meiosis", "Genetics"), ("Genetics", "Heredity"), ("Heredity", "Mendel Laws"),
            ("Genetics", "DNA and RNA"), ("Genetics", "Variation"), ("Variation", "Evolution"),
            ("Evolution", "Adaptation"), ("Living Things", "Ecology"),
            ("Ecology", "Ecosystem"), ("Ecosystem", "Food Chain and Web"),
            ("Ecology", "Pollution"), ("Pollution", "Conservation")
        ]
        self._add_edges("biology", edges)
    
    def _build_english_graph(self):
        edges = [
            ("Parts of Speech", "Nouns"), ("Parts of Speech", "Pronouns"),
            ("Parts of Speech", "Verbs"), ("Parts of Speech", "Adjectives"),
            ("Parts of Speech", "Adverbs"), ("Parts of Speech", "Prepositions"),
            ("Parts of Speech", "Conjunctions"), ("Parts of Speech", "Interjections"),
            ("Parts of Speech", "Articles"), ("Words", "Sentences"),
            ("Sentences", "Subjects and Predicates"), ("Sentences", "Clauses"),
            ("Clauses", "Independent Clauses"), ("Clauses", "Dependent Clauses"),
            ("Sentences", "Phrases"), ("Phrases", "Noun Phrases"), ("Phrases", "Verb Phrases"),
            ("Verbs", "Tenses"), ("Tenses", "Present Tense"), ("Tenses", "Past Tense"),
            ("Tenses", "Future Tense"), ("Verbs", "Active and Passive Voice"),
            ("Sentences", "Direct and Indirect Speech"), ("Sentences", "Punctuation"),
            ("Punctuation", "Commas and Full Stops"), ("Punctuation", "Colons and Semicolons"),
            ("Words", "Vocabulary"), ("Vocabulary", "Synonyms and Antonyms"),
            ("Vocabulary", "Homophones"), ("Vocabulary", "Idioms"),
            ("Vocabulary", "Phrasal Verbs"), ("Sentences", "Comprehension"),
            ("Comprehension", "Main Idea"), ("Comprehension", "Inference"),
            ("Comprehension", "Summary"), ("Summary", "Summary Writing"),
            ("Sentences", "Essay Writing"), ("Essay Writing", "Narrative Essays"),
            ("Essay Writing", "Descriptive Essays"), ("Essay Writing", "Expository Essays"),
            ("Essay Writing", "Argumentative Essays"), ("Essay Writing", "Letter Writing"),
            ("Letter Writing", "Formal Letters"), ("Letter Writing", "Informal Letters"),
            ("Essay Writing", "Speech Writing"), ("Words", "Literature"),
            ("Literature", "Poetry"), ("Literature", "Prose"), ("Literature", "Drama"),
            ("Literature", "Figures of Speech"), ("Figures of Speech", "Simile and Metaphor"),
            ("Figures of Speech", "Personification and Hyperbole")
        ]
        self._add_edges("english", edges)
    
    def get_prerequisites(self, topic_id: str) -> list:
        """All direct and indirect prerequisites for a topic"""
        if topic_id not in self.graph:
            return []
        # Ancestors are the prerequisites in this directed graph (A -> B means A is prereq for B)
        return list(nx.ancestors(self.graph, topic_id))
    
    def get_learning_path(self, weak_topic: str) -> list:
        """Ordered path from foundational topics to target topic using topological sort"""
        if weak_topic not in self.graph:
            return []
        
        prereqs = self.get_prerequisites(weak_topic)
        subgraph = self.graph.subgraph(prereqs + [weak_topic])
        
        try:
            return list(nx.topological_sort(subgraph))
        except nx.NetworkXUnfeasible:
            # Cycle detected (shouldn't happen in our DAG but safe fallback)
            return prereqs + [weak_topic]
    
    def find_prerequisite_gap(self, student_id: str, target_topic: str, bkt_model, supabase_client) -> str:
        """Given a topic student fails, find the deepest prerequisite gap that lacks mastery"""
        if target_topic not in self.graph:
            return target_topic
            
        path = self.get_learning_path(target_topic)
        
        # Traverse from most fundamental up to target topic
        for topic in path:
            if topic == target_topic:
                continue
            mastery = bkt_model.get_topic_mastery(student_id, topic, supabase_client)
            if not bkt_model.is_mastered(mastery):
                return topic
                
        return target_topic
    
    def export_json_ld(self) -> dict:
        """Export graph as JSON-LD for open-source publication"""
        nodes = []
        for node in self.graph.nodes():
            subj = self.graph.nodes[node].get('subject', 'unknown')
            name = self.graph.nodes[node].get('name', node)
            nodes.append({
                "@id": f"edunaija:{node}",
                "@type": "EducationalTopic",
                "name": name,
                "subjectOf": subj,
                "prerequisiteFor": [f"edunaija:{n}" for n in self.graph.successors(node)]
            })
            
        return {
            "@context": "https://schema.org",
            "@type": "Dataset",
            "name": "Nigerian Curriculum Knowledge Graph",
            "creator": "EduNaija OS",
            "hasPart": nodes
        }
