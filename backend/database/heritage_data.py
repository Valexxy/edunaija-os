"""
Pan-Nigerian State, Institutional & Educational Heritage Dataset
Comprehensive, historical, and cultural records for all 36 Nigerian States + FCT Abuja,
top tertiary institutions, and premier secondary schools.
Celebrates state mottos, founding histories, educational breakthroughs, and scholars.
"""

NIGERIAN_STATES_HERITAGE = [
    (
        "AB", "Abia", "Umuahia", "South East", 
        "God's Own State", 1991, 
        "Derived from Aba, Bende, Isuikwuato and Afikpo. Ancient commercial craftsmanship of Ariaria Market, British colonial trading centers, and the National War Museum.",
        "Abia State University (Uturu), Michael Okpara University of Agriculture (Umudike), and the National Root Crops Research Institute (Umudike).",
        "Dr. Michael Okpara, Jaja Wachuku (first Nigerian UN representative), and Dr. Alvan Ikoku.",
        "National War Museum Umuahia, Arochukwu Long Juju Slave Route, and Azumini Blue River.",
        "from-amber-600 to-yellow-500"
    ),
    (
        "AD", "Adamawa", "Yola", "North East", 
        "Land of Beauty", 1991, 
        "Named after historic scholar and founder Modibbo Adama. Renowned for scenic river valleys, Mandara mountains, and trans-Sahelian scholarship.",
        "Modibbo Adama University (MAU), American University of Nigeria (AUN Yola), and Adamawa State Polytechnic.",
        "Modibbo Adama, Prof. Jibril Aminu (eminent cardiologist & education minister), and Atiku Abubakar.",
        "Sukur Cultural Landscape (UNESCO World Heritage Site), Mandara Mountains, and the Lamido's Royal Palace Yola.",
        "from-emerald-600 to-teal-500"
    ),
    (
        "AK", "Akwa Ibom", "Uyo", "South South", 
        "Land of Promise", 1987, 
        "Carved out of Cross River State. A bastion of Atlantic maritime trade, ancient Ibibio/Annang cultural heritage, and modern infrastructural marvels.",
        "University of Uyo (UNIUYO), Akwa Ibom State University (AKSU), and the Maritime Academy of Nigeria (Oron).",
        "Sir Udo Udoma (Chief Justice of Uganda & Supreme Court of Nigeria), Dr. Clement Isong, and Philip Effiong.",
        "Ibeno Ocean Beach, National Museum of Colonial History Uyo, and the 1914 Amalgamation House at Ikot Abasi.",
        "from-orange-600 to-amber-500"
    ),
    (
        "AN", "Anambra", "Awka", "South East", 
        "Light of the Nation", 1991, 
        "Cradle of the ancient Nri Kingdom (the oldest kingdom in Igboland) and Igbo-Ukwu bronze metallurgy dating back to the 9th century AD.",
        "Nnamdi Azikiwe University (UNIZIK), Chukwuemeka Odumegwu Ojukwu University, Christ the King College (CKC), and DMGS Onitsha (1925).",
        "Chinua Achebe (Father of Modern African Literature), Dr. Nnamdi Azikiwe, Prof. Kenneth Dike (first indigenous VC of UI), Chimamanda Ngozi Adichie, and Prof. Dora Akunyili.",
        "Ogbunike Caves, Igbo-Ukwu Bronze Archaeological Museum, River Niger Bridge, and Onitsha Main Market.",
        "from-yellow-500 to-amber-600"
    ),
    (
        "BA", "Bauchi", "Bauchi", "North East", 
        "Pearl of Tourism", 1976, 
        "Named after hunter and scholar Baushe. Historic cradle of the northern Renaissance, democratic reform, and wildlife conservation.",
        "Abubakar Tafawa Balewa University (ATBU - leading technological institute), Federal Polytechnic Bauchi, and Bauchi State University Gadau.",
        "Sir Abubakar Tafawa Balewa (Nigeria's first Prime Minister), Sa'adu Zungur (poet & radical thinker), and Mallam Aminu Kano.",
        "Yankari National Park (Wikki Warm Springs), Tomb of Sir Abubakar Tafawa Balewa, and Marshall Caves.",
        "from-blue-600 to-cyan-500"
    ),
    (
        "BY", "Bayelsa", "Yenagoa", "South South", 
        "Glory of all Lands", 1996, 
        "Heart of the Niger Delta mangrove ecosystem where crude oil was first struck in commercial quantities at Oloibiri in 1956.",
        "Niger Delta University (NDU Amassoma), Federal University Otuoke, and the Africa University of Aviation.",
        "Ernest Ikoli (pioneering journalist & nationalist), Gabriel Okara (literary maestro), and Chief Melford Okilo.",
        "First Commercial Oil Well Oloibiri, Ox-Bow Lake Yenagoa, and the historic Akassa Slave Transit Camp.",
        "from-teal-600 to-emerald-500"
    ),
    (
        "BN", "Benue", "Makurdi", "North Central", 
        "Food Basket of the Nation", 1976, 
        "Named after the mighty River Benue. Homeland of the Tiv, Idoma, and Igede farming civilisations, feeding millions across West Africa.",
        "Benue State University (BSU), Joseph Sarwuan Tarka University (formerly FUAM), and the College of Education Katsina-Ala.",
        "Joseph Sarwuan Tarka, Aper Aku, and Gen. Lawrence Onoja.",
        "River Benue Confluence Valley, Ikyogen Cattle Hills, and Doma Dam Ecological Reserve.",
        "from-lime-600 to-emerald-500"
    ),
    (
        "BO", "Borno", "Maiduguri", "North East", 
        "Home of Peace", 1976, 
        "Seat of the thousand-year Kanem-Bornu Empire, one of the longest-lasting sovereign dynasties in world history with ancient trade routes.",
        "University of Maiduguri (UNIMAID), Ramat Polytechnic, and Borno State University.",
        "Mai Idris Alooma, Muhammad al-Amin al-Kanemi, and Alhaji Waziri Ibrahim (champion of 'Politics Without Bitterness').",
        "Lake Chad Basin, Shehu of Borno Grand Palace, and Sambisa Game Reserve Heritage.",
        "from-purple-600 to-indigo-500"
    ),
    (
        "CR", "Cross River", "Calabar", "South South", 
        "The People's Paradise", 1976, 
        "Calabar served as the first administrative capital of the Southern Nigeria Protectorate and was a premier hub of early missionary education.",
        "University of Calabar (UNICAL), Cross River University of Technology (CRUTECH), and Hope Waddell Training Institution (founded 1895).",
        "Margaret Ekpo (pioneering feminist & nationalist), Sir Louis Mbanefo, and Dr. Alvan Ikoku (Hope Waddell alumnus).",
        "Obudu Mountain Resort, Calabar Slave History Museum, Drill Monkey Rehabilitation Ranch, and Agbokim Waterfalls.",
        "from-emerald-600 to-green-500"
    ),
    (
        "DE", "Delta", "Asaba", "South South", 
        "The Big Heart", 1991, 
        "Endowed with fertile Niger Delta waterways, ancient kingdoms of Warri, Asaba, and Agbor, and exceptional academic and athletic prowess.",
        "Federal University of Petroleum Resources Effurun (FUPRE), Delta State University Abraka (DELSU), and Dennis Osadebay University Asaba.",
        "Chief Dennis Osadebay, Prof. Grace Alele-Williams (first female Nigerian Vice-Chancellor), and Bruce Onobrakpeya.",
        "River Ethiope Source (Umuaja), Nana of Itsekiri Living History Palace, and Lander Brothers Anchorage Asaba.",
        "from-cyan-600 to-blue-500"
    ),
    (
        "EB", "Ebonyi", "Abakaliki", "South East", 
        "Salt of the Nation", 1996, 
        "Famous for its ancient brine salt lakes at Okposi and Uburu, fertile rice paddies, and extensive mineral wealth.",
        "Ebonyi State University (EBSU), Alex Ekwueme Federal University Ndufu-Alike (AE-FUNAI), and Akanu Ibiam Federal Polytechnic Unwana.",
        "Sir Akanu Ibiam (distinguished medical missionary & first Governor of Eastern Region), and Francis Orji.",
        "Okposi Salt Lakes, Amanchor Cave, and the Abakaliki Green Lake.",
        "from-stone-500 to-amber-600"
    ),
    (
        "ED", "Edo", "Benin City", "South South", 
        "Heartbeat of the Nation", 1991, 
        "Seat of the historic Benin Empire, renowned worldwide for its sophisticated lost-wax bronze castings, expansive defensive earthwork moats, and ancient metallurgy.",
        "University of Benin (UNIBEN), Ambrose Alli University (AAU Ekpoma), Edo State University Uzairue, and Edo College Benin (1937).",
        "Oba Ewuare I, Oba Ovonramwen, Prof. Ambrose Alli, Chief Anthony Enahoro (moved motion for Nigerian Independence), and Sir Victor Uwaifo.",
        "Benin Moats (Iya), Royal Palace of the Oba of Benin, Igun Bronze Casters Guild Street, and Okomu National Park.",
        "from-amber-600 to-red-600"
    ),
    (
        "EK", "Ekiti", "Ado-Ekiti", "South West", 
        "Land of Honour and Integrity", 1996, 
        "Celebrated as the 'Fountain of Knowledge' for producing the highest concentration of university professors and PhD scholars per capita in Nigeria.",
        "Ekiti State University (EKSU), Federal University Oye-Ekiti (FUOYE), Afe Babalola University (ABUAD), and Christ's School Ado-Ekiti (1933).",
        "Aare Afe Babalola (SAN), Prof. Niyi Osundare (distinguished poet), Prof. J.F. Ade-Ajayi (foremost African historian), and Michael Opeyemi Bamidele.",
        "Ikogosi Warm and Cold Springs Confluence (unique natural wonder), Olosunta Hills Ikere, and Fajuyi Memorial Park.",
        "from-emerald-600 to-amber-500"
    ),
    (
        "EN", "Enugu", "Enugu", "South East", 
        "Coal City State", 1991, 
        "Historic capital of the Eastern Region and epicenter of coal mining in West Africa since commercial extraction began in 1909.",
        "University of Nigeria, Nsukka (UNN - Nigeria's first autonomous indigenous university, 1960), Enugu State University of Science and Technology (ESUT), and IMT Enugu.",
        "Dr. Nnamdi Azikiwe, Prof. Chike Obi (pioneering mathematical genius), Justice Chukwudifu Oputa, and Prof. Charles Chukwuma Soludo.",
        "Udi Hills, Ngwo Pine Forest & Limestone Cave, Awhum Waterfall and Monastery, and Milliken Hill.",
        "from-neutral-700 to-emerald-600"
    ),
    (
        "FC", "FCT Abuja", "Abuja", "North Central", 
        "Centre of Unity", 1976, 
        "Created as the sovereign, neutral federal capital territory of Nigeria, uniting all 250+ ethnic nationalities under one glorious national dome.",
        "University of Abuja (UNIABUJA), Nile University of Nigeria, Baze University, African University of Science and Technology, and Loyola Jesuit College.",
        "Gen. Murtala Muhammed (founding visionary), Kenzo Tange (master urban architect), and Justice Taslim Elias.",
        "Aso Rock, Zuma Rock Gateway, National Christian Centre, National Mosque, and Millennium Park.",
        "from-green-600 to-emerald-500"
    ),
    (
        "GO", "Gombe", "Gombe", "North East", 
        "Jewel in the Savannah", 1996, 
        "Strategic agricultural crossroad connecting the northeastern savannahs, celebrated for cotton farming, groundnut trading, and peaceful coexistence.",
        "Gombe State University (GSU), Federal University Kashere, and Federal College of Education (Technical) Gombe.",
        "Modibbo Bubayero (founder of Gombe Emirate), Prof. Isa Ali Pantami, and Danladi Bako.",
        "Tomb of Buba Yero, Bima Hill, Ashaka Historical Quarters, and Dadin Kowa Dam.",
        "from-yellow-600 to-orange-500"
    ),
    (
        "IM", "Imo", "Owerri", "South East", 
        "Eastern Heartland", 1976, 
        "The hospitality, cultural, and educational heartbeat of southeastern Nigeria, home to ancient Mbari artistic traditions.",
        "Federal University of Technology, Owerri (FUTO), Imo State University (IMSU), and Alvan Ikoku Federal College of Education.",
        "Dr. Alvan Ikoku (featured on the ₦10 banknote), Chief Sam Mbakwe, Chioma Ajunwa (Olympic Gold Medalist), and Nwankwo Kanu.",
        "Oguta Blue & Muddy River Confluence Lake, Mbari Cultural Centers, and Nekede Zoo.",
        "from-red-600 to-amber-600"
    ),
    (
        "JI", "Jigawa", "Dutse", "North West", 
        "The New World", 1991, 
        "Renowned for its dramatic granite rock outcrops, ancient Hadejia river valley wetlands, and agricultural groundnut pyramids.",
        "Federal University Dutse (FUD), Sule Lamido University Kafin Hausa, and Jigawa State Polytechnic.",
        "Malam Aminu Kano (ideological roots), Sule Lamido, and Dr. Nuruddeen Muhammad.",
        "Dutse Rock Formations, Baturiya Bird Sanctuary, Hadejia River Valley, and Birnin Kudu Pre-historic Rock Paintings.",
        "from-sky-600 to-indigo-500"
    ),
    (
        "KD", "Kaduna", "Kaduna", "North West", 
        "Centre of Learning", 1967, 
        "Historic capital of the Northern Region under Sir Ahmadu Bello, housing the highest concentration of premier federal educational and defense academies in Nigeria.",
        "Ahmadu Bello University (ABU Zaria - largest university in Sub-Saharan Africa), Nigerian Defence Academy (NDA), Kaduna Polytechnic, and Barewa College Zaria (1921).",
        "Sir Ahmadu Bello (Sardauna of Sokoto), Prof. Iya Abubakar (world-renowned mathematician), Gen. Yakubu Gowon, and Gen. Murtala Muhammed.",
        "Kajuru Castle, Nok Terracotta Village, Matsirga Waterfalls, Zaria Emirate Palace, and Lugard Hall.",
        "from-indigo-600 to-blue-600"
    ),
    (
        "KN", "Kano", "Kano", "North West", 
        "Centre of Commerce", 1967, 
        "Over a millennium of trans-Saharan trade history, ancient indigo dye pits, groundnut commerce, and Islamic scholarship.",
        "Bayero University Kano (BUK), Kano University of Science and Technology (KUST Wudil), and Skyline University Nigeria.",
        "Malam Aminu Kano (champion of Talakawa democratic rights), Khalifa Muhammad Sanusi II, and Alhaji Aliko Dangote.",
        "Ancient Kano City Walls (dating to 1095 AD), Dala Hill, Gidan Rumfa (Emir's Palace), and Kofar Mata Dye Pits (1498).",
        "from-amber-600 to-yellow-600"
    ),
    (
        "KT", "Katsina", "Katsina", "North West", 
        "Home of Hospitality", 1987, 
        "Ancient center of Islamic scholarship dating back to the 14th century, home to the iconic 600-year-old Gobarau Minaret.",
        "Umaru Musa Yar'adua University (UMYU), Federal University Dutsin-Ma (FUDMA), and Hassan Usman Katsina Polytechnic.",
        "President Umaru Musa Yar'adua, President Muhammadu Buhari, and Wali Dan Marina.",
        "Gobarau Minaret, Kusugu Well in Daura (legend of Bayajidda & the serpent), and the Emir of Katsina Palace.",
        "from-emerald-600 to-teal-600"
    ),
    (
        "KE", "Kebbi", "Birnin Kebbi", "North West", 
        "Land of Equity", 1991, 
        "Stronghold of the historic Kanta Kingdom of Argungu, celebrated internationally for the Argungu Fishing & Cultural Festival.",
        "Federal University Birnin Kebbi (FUBK), Kebbi State University of Science and Technology (KSUSTA Aliero), and Waziri Umaru Federal Polytechnic.",
        "King Muhammadu Kanta (founding hero of Kebbi), and Abdullahi Fodio (Gwandu philosopher & jurist).",
        "Argungu Fishing River Valley, Gwandu Emirate Historical Archives, and the Tomb of Muhammadu Kanta.",
        "from-teal-600 to-cyan-600"
    ),
    (
        "KO", "Kogi", "Lokoja", "North Central", 
        "The Confluence State", 1991, 
        "Where the Niger and Benue rivers merge into a majestic confluence. Lokoja was Nigeria's first administrative capital where Flora Shaw coined the name 'Nigeria'.",
        "Federal University Lokoja (FULOKOJA), Prince Abubakar Audu University Anyigba, and Confluence University of Science and Technology (CUSTECH).",
        "Sunday Awoniyi, Attah of Igala, Ohinoyi of Ebiraland, and Prof. Francis Idachaba.",
        "Confluence of Rivers Niger and Benue, Mount Patti, Lord Lugard's Colonial Office, and the Iron of Liberty.",
        "from-cyan-600 to-emerald-600"
    ),
    (
        "KW", "Kwara", "Ilorin", "North Central", 
        "State of Harmony", 1967, 
        "Cultural and intellectual crossroads uniting northern and southwestern Nigeria, famed for traditional pottery, Aso Oke weaving, and academia.",
        "University of Ilorin (UNILORIN - Nigeria's most sought-after university by JAMB applicants), Kwara State University (KWASU), and Landmark University (Omu-Aran).",
        "Sheikh Alimi, Dr. Abubakar Olusola Saraki, and Prof. Ibrahim Gambari (former UN Under-Secretary-General).",
        "Owu Waterfalls (steepest cascade in West Africa), Dada Pottery Workshop, Sobi Hill, and Esie Soapstone Museum.",
        "from-purple-600 to-pink-500"
    ),
    (
        "LA", "Lagos", "Ikeja", "South West", 
        "Centre of Excellence", 1967, 
        "Nigeria's financial powerhouse and Africa's vibrant cultural megacity. Hub of tech unicorns, film, Afrobeats, and high-octane commerce.",
        "University of Lagos (UNILAG Akoka), Lagos State University (LASU Ojo), Yaba College of Technology (1947), King's College (1909), and CMS Grammar School (1859 - Nigeria's first secondary school).",
        "Herbert Macaulay (Father of Nigerian Nationalism), Babatunde Raji Fashola (SAN), Funmilayo Ransome-Kuti, and Fela Anikulapo Kuti.",
        "National Arts Theatre, Lekki Conservation Centre, Freedom Park Broad Street, Eko Atlantic City, and Badagry Slave Relics.",
        "from-emerald-500 to-[#00E676]"
    ),
    (
        "NA", "Nasarawa", "Lafia", "North Central", 
        "Home of Solid Minerals", 1996, 
        "Endowed with vast deposits of tantalite, barite, marble, and lithium, nestled within rolling granitic hills.",
        "Federal University of Lafia (FULAFIA), Nasarawa State University (NSUK Keffi), and Isa Mustapha Agwai Polytechnic.",
        "Senator Abdullahi Adamu, Senator Umaru Tanko Al-Makura, and Mallam Isa Keffi.",
        "Farin Ruwa Waterfalls (one of Africa's tallest waterfalls at 150m), Eggon Hills, and Peperuwa Lake.",
        "from-slate-600 to-teal-500"
    ),
    (
        "NI", "Niger", "Minna", "North Central", 
        "The Power State", 1976, 
        "Nigeria's largest state by landmass, housing three massive hydroelectric dams (Kainji, Jebba, and Shiroro) generating electricity for the nation.",
        "Federal University of Technology, Minna (FUTMinna - premier STEM powerhouse), Ibrahim Badamasi Babangida University (Lapai), and Federal Government Academy Suleja (Gifted School).",
        "General Ibrahim Badamasi Babangida, General Abdulsalami Abubakar, and Major-Gen. Mamman Vatsa (poet-soldier).",
        "Zuma Rock, Gurara Waterfalls, Kainji Lake National Park, and Lord Lugard's Colonial Zungeru Outpost.",
        "from-amber-600 to-orange-600"
    ),
    (
        "OG", "Ogun", "Abeokuta", "South West", 
        "Gateway State", 1976, 
        "Cradle of intellectual pioneers in law, literature, medicine, and journalism. Home to the historic Olumo Rock and pioneer newspaper Iwe Irohin (1859).",
        "Federal University of Agriculture, Abeokuta (FUNAAB), Covenant University (Ota - top-ranked private African university), Olabisi Onabanjo University, and Abeokuta Grammar School (1908).",
        "Chief Obafemi Awolowo, Prof. Wole Soyinka (first African Nobel Laureate in Literature), Chief M.K.O. Abiola, and Chief Olusegun Obasanjo.",
        "Olumo Rock Abeokuta, Bilikisu Sungbo Shrine, Centenary Hall Ake, and Yemoji Natural Swimming Pool.",
        "from-blue-600 to-indigo-600"
    ),
    (
        "ON", "Ondo", "Akure", "South West", 
        "Sunshine State", 1976, 
        "Rich in cocoa, mineral bitumen, and ancient monarchies of Akure and Ondo, home to the dramatic mountain settlement of Idanre.",
        "Federal University of Technology, Akure (FUTA - leading engineering and technology institute), Adekunle Ajasin University (Akungba), and Achievers University (Owo).",
        "Chief Michael Adekunle Ajasin, Chief Gani Fawehinmi (SAN - Senior Advocate of the Masses), and Olu Falae.",
        "Idanre Hills (682 steps to ancient mountain palace), Olowo of Owo Palace, and Ebomi Lake.",
        "from-yellow-500 to-orange-600"
    ),
    (
        "OS", "Osun", "Osogbo", "South West", 
        "Land of Virtue", 1991, 
        "Spiritual cradle of the Yoruba civilization at Ilé-Ifẹ̀, world center of beadwork, bronze casting, and the UNESCO-listed sacred Osun-Osogbo Grove.",
        "Obafemi Awolowo University (OAU Ile-Ife - celebrated for its Afro-futurist architectural beauty), Osun State University (UNIOSUN), Bowen University (Iwo), and Redeemer's University (Ede).",
        "Chief Bola Ige (SAN), Prof. Hezekiah Oluwasanmi (visionary founder of OAU), Duro Ladipo, and Prof. Babs Fafunwa.",
        "Osun-Osogbo Sacred Grove (UNESCO World Heritage Site), Ile-Ife National Museum (Oranmiyan Staff), and Erin-Ijesha (Olumirin) 7-Tier Waterfalls.",
        "from-purple-600 to-violet-500"
    ),
    (
        "OY", "Oyo", "Ibadan", "South West", 
        "Pace Setter State", 1976, 
        "Pioneered higher education, broadcasting, and modern architecture in Nigeria. Ibadan is home to Nigeria's first university (UI, 1948), first skyscraper (Cocoa House, 1965), and Africa's first television station (WNTV, 1959).",
        "University of Ibadan (UI - premier university of Nigeria), Ladoke Akintola University of Technology (LAUTECH), The Polytechnic Ibadan, and Government College Ibadan (1929).",
        "Chief Obafemi Awolowo, Chief Samuel Ladoke Akintola, Prof. Wole Soyinka (UI alumnus), JP Clark, and Chinua Achebe (UI alumnus).",
        "Cocoa House Ibadan, Bower's Memorial Tower, University of Ibadan Zoological Gardens, Old Oyo National Park, and Mapo Hall.",
        "from-emerald-600 to-teal-600"
    ),
    (
        "PL", "Plateau", "Jos", "North Central", 
        "Home of Peace and Tourism", 1976, 
        "Situated on the elevated Jos Plateau with a temperate near-alpine climate, ancient tin mining heritage, and prehistoric Nok terracotta excavations.",
        "University of Jos (UNIJOS), Plateau State University (Bokkos), and the National Institute for Policy and Strategic Studies (NIPSS Kuru).",
        "Joseph Gomwalk, Chief Solomon Lar, and General Domkat Bali.",
        "Shere Hills, Assop Falls, Jos Wildlife Park, Kurra Falls, and the National Museum Jos.",
        "from-sky-600 to-blue-500"
    ),
    (
        "RI", "Rivers", "Port Harcourt", "South South", 
        "Treasure Base of the Nation", 1967, 
        "Nerve center of Nigeria's coastal petroleum industry and maritime trade, known as the Garden City with rich Niger Delta mangrove estuaries.",
        "University of Port Harcourt (UNIPORT), Rivers State University (RSU), and Ignatius Ajuru University of Education.",
        "Ken Saro-Wiwa (writer & environmental martyr), Elechi Amadi, Prof. Claude Ake, and Dr. Peter Odili.",
        "Port Harcourt Tourist Beach, Isaac Boro Memorial Park, Finima Nature Park (Bonny Island), and King Jaja of Opobo Monument.",
        "from-blue-600 to-cyan-500"
    ),
    (
        "SO", "Sokoto", "Sokoto", "North West", 
        "Seat of the Caliphate", 1976, 
        "Capital of the Sokoto Caliphate founded by Sheikh Usman Dan Fodio in 1804, a historic sanctuary of Islamic jurisprudence, leather craftsmanship, and scholarship.",
        "Usmanu Danfodiyo University, Sokoto (UDUS), Sokoto State University, and Shehu Shagari College of Education.",
        "Sheikh Usman Dan Fodio, Sultan Muhammadu Bello, Nana Asma'u (pioneering 19th-century educator & poet), and President Shehu Shagari.",
        "Sultan's Palace Sokoto, Tomb of Usman Dan Fodio, Goronyo Dam, and Surame Ancient Citadel.",
        "from-amber-600 to-yellow-500"
    ),
    (
        "TA", "Taraba", "Jalingo", "North East", 
        "Nature's Gift to the Nation", 1991, 
        "Endowed with the Mambilla Plateau (housing Nigeria's highest mountain peak at Chappal Waddi), high-altitude tea plantations, and pristine rainforests.",
        "Taraba State University (Jalingo), and Federal University Wukari.",
        "Rev. Jolly Nyame, and General Theophilus Danjuma.",
        "Mambilla Plateau (Chappal Waddi - 2,419m peak), Gashaka-Gumti National Park, and Marmara Crocodile Pond.",
        "from-green-600 to-emerald-600"
    ),
    (
        "YO", "Yobe", "Damaturu", "North East", 
        "Pride of the Sahel", 1991, 
        "Homeland of the ancient Dufuna Canoe (the oldest known boat in Africa, dating back over 8,000 years), gum arabic harvesting, and livestock trading.",
        "Yobe State University (Damaturu), and Federal University Gashua.",
        "Alhaji Bukar Abba Ibrahim, and Mallam Adamu Ciroma.",
        "Dufuna Canoe Archaeological Site (8,000+ years old), Dagona Bird Sanctuary, and the Palace of the Mai of Fika.",
        "from-orange-600 to-amber-500"
    ),
    (
        "ZA", "Zamfara", "Gusau", "North West", 
        "Farming is Our Pride", 1996, 
        "Rich agricultural heartland of northern Nigeria, famous for extensive grain cultivation, gold and lead mining, and ancient defensive settlements.",
        "Federal University Gusau (FUGUS), and Zamfara State University (Talata Mafara).",
        "Ahmad Sani Yerima, and General Aliyu Mohammed Gusau.",
        "Kiyawa Ancient Citadel, Kanoma Hills, and the Bakolori Dam Agricultural Reserve.",
        "from-amber-600 to-lime-600"
    )
]

NIGERIAN_INSTITUTIONS_HERITAGE = [
    ("uni-fed-01", "University of Lagos", "UNILAG", "Federal University", "Lagos", "Akoka", "Federal", "In Deed and in Truth", 1962, "Established by an Act of Parliament to cultivate high-level professionals for newly independent Nigeria; famous Akoka lagoon front campus.", "Prof. Yemi Osinbajo, Tony Elumelu, Genevieve Nnaji, Wole Olanipekun"),
    ("uni-fed-02", "University of Ibadan", "UI", "Federal University", "Oyo", "Ibadan", "Federal", "Recte Sapere Fons (To Think Straight is the Fount of Knowledge)", 1948, "Nigeria's premier university, originally University College Ibadan affiliated with University of London; cradle of modern African literature.", "Prof. Chinua Achebe, Prof. Wole Soyinka, Flora Nwapa, Chief Emeka Anyaoku"),
    ("uni-fed-03", "Obafemi Awolowo University", "OAU", "Federal University", "Osun", "Ile-Ife", "Federal", "For Learning and Culture", 1961, "Conceived by the Action Group government of Western Nigeria; internationally acclaimed for its Afro-futurist Bauhaus campus architecture.", "Femi Falana (SAN), Pastor Enoch Adeboye, Jim Ovia, Prof. Segun Toyin Dawodu"),
    ("uni-fed-04", "University of Nigeria, Nsukka", "UNN", "Federal University", "Enugu", "Nsukka", "Federal", "To Restore the Dignity of Man", 1960, "Conceived by Dr. Nnamdi Azikiwe as Nigeria's first fully autonomous indigenous university, modeled on the American land-grant system.", "Peter Obi, Prof. Dora Akunyili, Prof. Pat Utomi, Chimamanda Ngozi Adichie"),
    ("uni-fed-05", "Ahmadu Bello University", "ABU", "Federal University", "Kaduna", "Zaria", "Federal", "The First in the North, For the World", 1962, "Founded by Sir Ahmadu Bello; the largest university in Sub-Saharan Africa, pioneering nuclear technology research and agricultural extension.", "President Umaru Musa Yar'adua, Atiku Abubakar, Khalifa Muhammad Sanusi II, Namadi Sambo"),
    ("uni-fed-06", "University of Benin", "UNIBEN", "Federal University", "Edo", "Benin City", "Federal", "Knowledge for Service", 1970, "Pioneered pharmacy, biomedical engineering, and petroleum engineering education in the Niger Delta basin.", "Babatunde Fashola (SAN), Richard Mofe-Damijo, Oladipo Diya, Josephine Anenih"),
    ("uni-fed-07", "University of Ilorin", "UNILORIN", "Federal University", "Kwara", "Ilorin", "Federal", "Probitas Doctrina (Character and Learning)", 1975, "Consistently ranked as Nigeria's most preferred and subscribed university by JAMB candidates for two decades.", "Femi Adebayo, Johnson Bamidele, Sarah Alade, Is-haq Oloyede"),
    ("uni-fed-08", "University of Port Harcourt", "UNIPORT", "Federal University", "Rivers", "Port Harcourt", "Federal", "For Enlightenment and Self-Reliance", 1975, "Center of excellence in petroleum engineering, offshore technology, and theatrical arts.", "Goodluck Jonathan, Agbani Darego, Rita Dominic, Bimbo Manuel"),
    ("uni-fed-09", "Federal University of Technology, Akure", "FUTA", "Federal University", "Ondo", "Akure", "Federal", "Technology for Self Reliance", 1981, "Premier specialized STEM institute producing Nigeria's leading software architects and robotics engineers.", "Godwin Benson, Olugbenga Agboola (Flutterwave roots), Bukola Smith"),
    ("uni-fed-10", "Federal University of Technology, Minna", "FUTMinna", "Federal University", "Niger", "Minna", "Federal", "Technology for Innovation", 1983, "Pioneering center for renewable energy, telecommunications, and geospatial sciences.", "Ahmed Isa, Kemi Adeosun (academic collaborator), Salisu Dahiru"),
    ("uni-fed-11", "Federal University of Technology, Owerri", "FUTO", "Federal University", "Imo", "Owerri", "Federal", "Technology is for Service", 1980, "Premier federal technological institution in eastern Nigeria, acclaimed for mechanical and petroleum engineering.", "Paschal Dozie, Ndubuisi Ekekwe, Michael Okpara alumni fellows"),
    ("uni-fed-12", "University of Abuja", "UNIABUJA", "Federal University", "FCT Abuja", "Abuja", "Federal", "For Unity and Scholarship", 1988, "Located in the heart of Nigeria's capital, renowned for public policy, law, and veterinary medicine.", "Ifeanyi Okowa, Frank Edwards, Charly Boy"),
    ("uni-fed-13", "Bayero University Kano", "BUK", "Federal University", "Kano", "Kano", "Federal", "And Above Every Possessor of Knowledge is One More Knowing", 1977, "Renowned center for Islamic banking, African languages (Hausa linguistics), and dryland agriculture.", "Farouk Lawan, Mansur Dan Ali, Aisha Buhari (fellow)"),
    ("uni-fed-14", "University of Jos", "UNIJOS", "Federal University", "Plateau", "Jos", "Federal", "Disciplines, Dedication, Excellence", 1975, "Specialized in pharmaceutical sciences, conflict resolution, and mining geology.", "Ali Nuhu, Desmond Elliot, Saint Obi"),
    ("uni-fed-15", "University of Calabar", "UNICAL", "Federal University", "Cross River", "Calabar", "Federal", "Knowledge for Fair Play and Progress", 1975, "Acclaimed for medical sciences, marine biology, and environmental law.", "Godswill Akpabio, Stephanie Okereke-Linus, John Owan Enoh"),
    ("uni-fed-16", "University of Maiduguri", "UNIMAID", "Federal University", "Borno", "Maiduguri", "Federal", "Education for Universal Brotherhood", 1975, "Hub of peace research, arid zone agriculture, and desertification mitigation.", "Prof. Babagana Zulum, Sen. Kashim Shettima, Tukur Buratai"),
    ("uni-fed-17", "Nnamdi Azikiwe University", "UNIZIK", "Federal University", "Anambra", "Awka", "Federal", "Autonomy for Excellence", 1991, "Named after the Great Zik of Africa, leading in engineering, polymer science, and business management.", "Pete Edochie, Okey Bakassi, Uche Ekwunife"),
    ("uni-fed-18", "Federal University of Agriculture, Abeokuta", "FUNAAB", "Federal University", "Ogun", "Abeokuta", "Federal", "Knowledge for Food and Development", 1988, "Leading agricultural research university in Africa with expansive agronomy farms.", "Kizz Daniel, Bisi Silva, Femi Jacobs"),
    ("uni-fed-19", "Usmanu Danfodiyo University", "UDUS", "Federal University", "Sokoto", "Sokoto", "Federal", "Read in the Name of Thy Lord", 1975, "Center of excellence for Islamic jurisprudence, veterinary medicine, and solar energy research.", "Aminu Tambuwal, Atiku Bagudu, Attahiru Jega"),
    ("uni-fed-20", "Abubakar Tafawa Balewa University", "ATBU", "Federal University", "Bauchi", "Bauchi", "Federal", "Doctrina Mater Artium (Education is the Mother of Practical Arts)", 1980, "Leading northern technological university named after Nigeria's first prime minister.", "Isa Yuguda, Mohammed Abdullahi Abubakar"),
    ("uni-sta-01", "Lagos State University", "LASU", "State University", "Lagos", "Ojo", "State", "Per Discere Ad Astra (Through Learning to the Stars)", 1983, "Premier state university in Nigeria, acclaimed for law, transport studies, and public health.", "Desmond Elliot, Ruggedman, Tara Fela-Durotoye, Chioma Chukwuka"),
    ("uni-sta-02", "Olabisi Onabanjo University", "OOU", "State University", "Ogun", "Ago-Iwoye", "State", "Greatness Through Knowledge", 1982, "First state university established in Ogun State, known for medicine and social sciences.", "Toyin Abraham, Kunle Afolayan, Weird MC"),
    ("uni-sta-03", "Ekiti State University", "EKSU", "State University", "Ekiti", "Ado-Ekiti", "State", "Integrity, Intellect, Service", 1982, "Produced top legal luminaries and educational administrators across Nigeria.", "Femi Otedola (honorary), Biodun Oyebanji"),
    ("uni-sta-04", "Delta State University", "DELSU", "State University", "Delta", "Abraka", "State", "Knowledge, Character and Service", 1992, "Known for fine and applied arts, pharmacy, and educational management.", "Ayiri Emami, Bovi Ugboma, Uti Nwachukwu"),
    ("uni-sta-05", "Ambrose Alli University", "AAU", "State University", "Edo", "Ekpoma", "State", "Knowledge for Advancement", 1981, "Pioneering state university established by Prof. Ambrose Alli, acclaimed for law and medicine.", "Festus Keyamo (SAN), Chris Oyakhilome, Ali Baba (Atunyota Alleluya)"),
    ("uni-sta-06", "Rivers State University", "RSU", "State University", "Rivers", "Port Harcourt", "State", "Excellence and Creativity", 1980, "First technological university established by a state government in Nigeria.", "Nyesom Wike, Goodluck Diigbo"),
    ("uni-sta-07", "Ladoke Akintola University of Technology", "LAUTECH", "State University", "Oyo", "Ogbomoso", "State", "Excellence, Integrity and Service", 1990, "Consistently ranked as Nigeria's best state university for STEM disciplines.", "Seyi Olofinjana, Samson Adegoke"),
    ("uni-sta-08", "Adekunle Ajasin University", "AAUA", "State University", "Ondo", "Akungba-Akoko", "State", "For Learning and Service", 1999, "Celebrated for academic integrity, prompt calendar, and moot court championships.", "Jimoh Ibrahim, Rotimi Akeredolu fellows"),
    ("uni-sta-09", "Abia State University", "ABSU", "State University", "Abia", "Uturu", "State", "Excellence and Service", 1981, "Leading state university in the South East, known for optometry, law, and medicine.", "Orji Uzor Kalu, Paschal Dozie fellows"),
    ("uni-sta-10", "Kaduna State University", "KASU", "State University", "Kaduna", "Kaduna", "State", "Scire Est Vivere (To Know is to Live)", 2004, "Modern state institution renowned for computer science and mass communication.", "Hadiza Isma El-Rufai fellows"),
    ("uni-pvt-01", "Covenant University", "CU", "Private University", "Ogun", "Ota", "Private", "Raising a New Generation of Leaders", 2002, "Ranked #1 university in Nigeria and top 5 in Africa by Times Higher Education.", "Sim Shagaya, Beverly Naya, Nonso Amadi"),
    ("uni-pvt-02", "Babcock University", "BU", "Private University", "Ogun", "Ilishan-Remo", "Private", "Knowledge, Truth, Service", 1999, "Pioneering Seventh-day Adventist private university with a world-class teaching hospital.", "Davido (David Adeleke), Debo Ogundoyin"),
    ("uni-pvt-03", "Afe Babalola University", "ABUAD", "Private University", "Ekiti", "Ado-Ekiti", "Private", "Labor Omnia Vincit (Hard Work Conquers All)", 2009, "Model private university renowned for its multi-system hospital and aerospace engineering.", "Aare Afe Babalola scholars"),
    ("uni-pvt-04", "Bowen University", "Bowen", "Private University", "Osun", "Iwo", "Private", "Excellence and Godliness", 2001, "First Baptist university in Africa, known for agricultural sciences and biomedical technology.", "Bowen Baptist Scholars"),
    ("uni-pvt-05", "Nile University of Nigeria", "Nile", "Private University", "FCT Abuja", "Abuja", "Private", "Building the Future Today", 2009, "Member of Honoris United Universities, leader in robotics, AI, and medical sciences.", "Nile Innovation Fellows"),
    ("uni-pvt-06", "Pan-Atlantic University", "PAU", "Private University", "Lagos", "Ibeju-Lekki", "Private", "Sedenti Non Cedit (He Who Sits Does Not Yield)", 2002, "Home to Lagos Business School (LBS) and School of Media and Communication.", "Top Nigerian CEOs and Fintech Founders"),
    ("uni-pvt-07", "Baze University", "Baze", "Private University", "FCT Abuja", "Abuja", "Private", "Learn to Lead", 2011, "Known for British-standard curriculum, law, and computer science in Abuja.", "Senator Datti Baba-Ahmed fellows"),
    ("uni-pvt-08", "Landmark University", "LMU", "Private University", "Kwara", "Omu-Aran", "Private", "Breaking New Grounds in Agriculture", 2011, "Agrarian private university leading an agrarian green revolution in Africa.", "Landmark Agritech Pioneers"),
    ("uni-pvt-09", "Redeemer University", "RUN", "Private University", "Osun", "Ede", "Private", "Running With the Vision", 2005, "Home to the African Centre of Excellence for Genomics of Infectious Diseases (ACEGID).", "Ebola and Lassa Fever Genomics Scientists"),
    ("uni-pvt-10", "Lead City University", "LCU", "Private University", "Oyo", "Ibadan", "Private", "Knowledge for Self Reliance", 2005, "Dynamic metropolitan university offering modern digital technology degrees.", "Ibadan Urban Innovators"),
    ("poly-01", "Yaba College of Technology", "YabaTech", "Polytechnic", "Lagos", "Yaba", "Federal", "Continuity, Work and Progress", 1947, "Nigeria's first higher educational institution, cradle of technical engineering and fine art.", "Ben Enwonwu, Kolade Oshinowo, Ayodele Awojobi"),
    ("poly-02", "The Federal Polytechnic, Ilaro", "FPI", "Polytechnic", "Ogun", "Ilaro", "Federal", "Technology for National Development", 1979, "Consistently ranked as the best polytechnic in Nigeria by NBTE.", "Ilaro Engineering Fellows"),
    ("poly-03", "Kaduna Polytechnic", "KadPoly", "Polytechnic", "Kaduna", "Kaduna", "Federal", "Technology for Self Reliance", 1956, "Largest polytechnic in West Africa, training top civil engineers and surveyors.", "Babangida Aliyu, Shehu Sani"),
    ("poly-04", "The Polytechnic, Ibadan", "PolyIbadan", "Polytechnic", "Oyo", "Ibadan", "State", "Ise Loogun Ise (Work is the Antidote to Poverty)", 1970, "Pioneering state polytechnic with renowned architecture and business administration faculties.", "Toyin Falola (fellow), 9ice (Abolore Akande)"),
    ("poly-05", "Federal Polytechnic, Nekede", "Nekede", "Polytechnic", "Imo", "Owerri", "Federal", "Knowledge and Skill for Service", 1978, "Leading southeastern polytechnic for computer science and electrical engineering.", "Nekede Technologists"),
    ("poly-06", "Federal Polytechnic, Ado-Ekiti", "FEDPOLYADO", "Polytechnic", "Ekiti", "Ado-Ekiti", "Federal", "Technology is the Key to National Wealth", 1977, "Renowned for agricultural engineering, mineral processing, and estate management.", "Ekiti Poly Innovators"),
]

NIGERIAN_SCHOOLS_HERITAGE = [
    ("sch-01", "King's College, Lagos", "Federal Unity School", "Lagos", "Lagos Island", "Floreat Collegium (May the College Flourish)", 1909, "Founded by the British colonial administration as the premier secondary school for young gentlemen; produced prominent nationalists, judges, and prime ministers.", "Anthony Enahoro, Alex Ekwueme, H.O. Davies, Lateef Jakande, Sanusi Lamido Sanusi"),
    ("sch-02", "Queen's College, Yaba", "Federal Unity School", "Lagos", "Yaba", "Pass On the Torch", 1927, "Premier federal government girls college in Nigeria, championing female education, leadership, and STEM excellence.", "Priscilla Kuye, Grace Alele-Williams, Toyin Saraki, Sola David-Borha"),
    ("sch-03", "Loyola Jesuit College", "Private Secondary", "FCT Abuja", "Gidan Mangoro", "Ad Majorem Dei Gloriam (For the Greater Glory of God)", 1996, "Celebrated for world-class Jesuit academic discipline, consistently producing top WAEC and JAMB scorers in Nigeria.", "Over 50 Rhodes & Ivy League scholars"),
    ("sch-04", "Corona Secondary School", "Private Secondary", "Ogun", "Agbara", "Training the Mind and Character", 1992, "Renowned for international British-Nigerian dual curriculum, modern robotics, and debate championships.", "Next-Gen Fintech & Creative Leaders"),
    ("sch-05", "Atlantic Hall Educational Trust", "Private Secondary", "Lagos", "Poka Epe", "Excellence and Integrity", 1989, "Scenic 30-hectare campus dedicated to developing visionary global leaders.", "Naeto C, Sisi Yemmie, prominent entrepreneurs"),
    ("sch-06", "Day Waterman College", "Private Secondary", "Ogun", "Abeokuta", "Developing Tomorrow's Leaders Today", 2008, "State-of-the-art boarding school nurturing intellectual curiosity and athletic mastery.", "African Young Scholars"),
    ("sch-07", "Federal Government College, Ijanikin", "Federal Unity School", "Lagos", "Ijanikin", "Pro Unitate (For Unity)", 1975, "Pioneering Federal Unity College fostering national integration and academic excellence.", "FGC Ijanikin National Alumni"),
    ("sch-08", "Federal Government Academy, Suleja", "Federal Gifted School", "Niger", "Suleja", "For Gifted Minds", 1986, "Nigeria's national academy for exceptionally gifted and talented secondary school children.", "National Olympiad Gold Medalists"),
    ("sch-09", "Christ The King College (CKC)", "Mission Secondary", "Anambra", "Onitsha", "Bonitas, Disciplina, Scientia (Goodness, Discipline, Knowledge)", 1933, "Premier Catholic secondary school in West Africa, produced governors, Supreme Court justices, and cardinals.", "Peter Obi, Justice Chukwudifu Oputa, General Alexander Madiebo"),
    ("sch-10", "Denis Memorial Grammar School (DMGS)", "Mission Secondary", "Anambra", "Onitsha", "Lux Fiat (Let There Be Light)", 1925, "First grammar school in eastern Nigeria, founded by the Anglican Church Mission Society.", "Kenneth Dike, Cyprian Ekwensi, Chike Obi"),
    ("sch-11", "Baptist Academy, Obanikoro", "Mission Secondary", "Lagos", "Obanikoro", "Deo Duce (God Our Leader)", 1855, "One of the oldest secondary schools in Nigeria, with over 170 years of academic pedigree.", "Sir Mobolaji Bank-Anthony, K.O. Mbadiwe"),
    ("sch-12", "Igbobi College, Yaba", "Mission Secondary", "Lagos", "Yaba", "Omnes Unum In Christo (All One in Christ)", 1932, "Jointly founded by CMS and Methodist missions; legendary rivalry with King's College.", "Prof. Yemi Osinbajo, Babatunde Fashola, Michael Ibru, Taslim Elias"),
    ("sch-13", "Barewa College, Zaria", "Public Premier Secondary", "Kaduna", "Zaria", "Man Juhun (Knowledge and Duty)", 1921, "Historic institution celebrated as having produced 5 Nigerian Heads of State and leaders.", "Abubakar Tafawa Balewa, Ahmadu Bello, Yakubu Gowon, Murtala Muhammed, Shehu Shagari, Umaru Yar'adua"),
    ("sch-14", "Government College, Ibadan (GCI)", "Public Premier Secondary", "Oyo", "Ibadan", "Servire Ac Fidere (To Serve and to Trust)", 1929, "Legendary public grammar school that produced world-famous literary giants and scientists.", "Prof. Wole Soyinka, Cyprian Ekwensi, T.M. Aluko, Femi Osofisan"),
    ("sch-15", "Command Day Secondary School, Ikeja", "Military Command Secondary", "Lagos", "Ikeja Cantonment", "Discipline and Knowledge", 1977, "Renowned military secondary school known for academic rigor and civic discipline.", "Command Alumni Leaders"),
    ("sch-16", "Nigerian Navy Secondary School, Ojo", "Military Secondary", "Lagos", "Ojo", "Integrity and Service", 1982, "Premier naval secondary institution in West Africa.", "Naval Officers & Maritime Leaders"),
    ("sch-17", "Air Force Secondary School, Ikeja", "Military Secondary", "Lagos", "Ikeja", "Per Ardua Ad Astra (Through Struggle to the Stars)", 1986, "Leading aviation-oriented secondary school.", "Aeronautical Engineers & Pilots"),
    ("sch-18", "Preston International School", "Private Secondary", "Ondo", "Akure", "We Are Able", 2006, "Top-rated co-educational Christian boarding school in Ondo State.", "Preston Global Scholars"),
    ("sch-19", "Graceland International School", "Private Secondary", "Rivers", "Port Harcourt", "Knowledge is Power", 2001, "Top-ranked school in southern Nigeria for national mathematics and science Olympiads.", "Cowbellpedia National Champions"),
    ("sch-20", "British International School Lagos", "International Secondary", "Lagos", "Victoria Island", "Global Citizens, Local Leaders", 2001, "Elite international secondary school offering dual British and West African curriculum.", "International Diplomatic Fellows"),
]
