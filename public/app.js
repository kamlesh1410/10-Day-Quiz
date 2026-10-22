/**
 * ============================================================================
 * 10-DAY GENERAL KNOWLEDGE & SOP QUIZ CHALLENGE - FRONTEND ENGINE
 * File: app.js
 * Clean Vanilla JavaScript (ES6+) State Management, GAS API, Timer & Rendering
 * ============================================================================
 */

(function () {
  'use strict';

  // --- Configuration & Constants ---
  const STORAGE_KEYS = {
    CURRENT_USER: 'sop_quiz_current_user',
    ALL_DRIVERS: 'sop_quiz_all_drivers',
    GAS_URL: 'sop_quiz_gas_web_app_url',
  };

  const TEAMS = [
    'Group Alpha', 'Group Bravo', 'Group Charlie', 'Group Delta', 'Group Echo',
    'Group Foxtrot', 'Group Golf', 'Group Hotel', 'Group India', 'Group Juliet'
  ];

  const MULTIPLIERS = {
    1: { phase: 1, name: 'Standard Points', multiplier: 1, maxDaily: 600, badge: 'bg-slate-700 text-slate-200' },
    2: { phase: 1, name: 'Standard Points', multiplier: 1, maxDaily: 600, badge: 'bg-slate-700 text-slate-200' },
    3: { phase: 1, name: 'Standard Points', multiplier: 1, maxDaily: 600, badge: 'bg-slate-700 text-slate-200' },
    4: { phase: 1, name: 'Standard Points', multiplier: 1, maxDaily: 600, badge: 'bg-slate-700 text-slate-200' },
    5: { phase: 2, name: '2× Double Points', multiplier: 2, maxDaily: 1200, badge: 'bg-amber-500/20 text-amber-400 border border-amber-500/30' },
    6: { phase: 2, name: '2× Double Points', multiplier: 2, maxDaily: 1200, badge: 'bg-amber-500/20 text-amber-400 border border-amber-500/30' },
    7: { phase: 2, name: '2× Double Points', multiplier: 2, maxDaily: 1200, badge: 'bg-amber-500/20 text-amber-400 border border-amber-500/30' },
    8: { phase: 3, name: '4× Super Multiplier', multiplier: 4, maxDaily: 2400, badge: 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' },
    9: { phase: 3, name: '4× Super Multiplier', multiplier: 4, maxDaily: 2400, badge: 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' },
    10: { phase: 3, name: '4× Grand Finale Super', multiplier: 4, maxDaily: 2400, badge: 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/30' },
  };

  const AVATAR_OPTIONS = [
    { id: 'kahoot_1', name: 'Bear', role: 'Operator', emoji: '🐻' },
    { id: 'kahoot_2', name: 'Moose', role: 'Operator', emoji: '🦌' },
    { id: 'kahoot_3', name: 'Pug', role: 'Operator', emoji: '🐶' },
    { id: 'kahoot_4', name: 'Cat', role: 'Operator', emoji: '🐱' },
    { id: 'kahoot_5', name: 'Mouse', role: 'Operator', emoji: '🐭' },
    { id: 'kahoot_6', name: 'Bunny', role: 'Operator', emoji: '🐰' },
    { id: 'kahoot_7', name: 'Fox', role: 'Operator', emoji: '🦊' },
    { id: 'kahoot_8', name: 'Wolf', role: 'Operator', emoji: '🐺' },
    { id: 'kahoot_9', name: 'Raccoon', role: 'Operator', emoji: '🦝' },
    { id: 'kahoot_10', name: 'Panda', role: 'Operator', emoji: '🐼' },
    { id: 'kahoot_11', name: 'Frog', role: 'Operator', emoji: '🐸' },
    { id: 'kahoot_12', name: 'Owl', role: 'Operator', emoji: '🦉' },
    { id: 'kahoot_13', name: 'Chick', role: 'Operator', emoji: '🐥' },
    { id: 'kahoot_14', name: 'Parrot', role: 'Operator', emoji: '🦜' },
    { id: 'kahoot_15', name: 'Penguin', role: 'Operator', emoji: '🐧' },
    { id: 'kahoot_16', name: 'Yeti', role: 'Operator', emoji: '❄️' },
    { id: 'kahoot_17', name: 'Snowman', role: 'Operator', emoji: '⛄' },
    { id: 'kahoot_18', name: 'Llama', role: 'Operator', emoji: '🦙' },
    { id: 'kahoot_19', name: 'Tiger', role: 'Operator', emoji: '🐯' },
    { id: 'kahoot_20', name: 'Koala', role: 'Operator', emoji: '🐨' },
    { id: 'kahoot_21', name: 'Kangaroo', role: 'Operator', emoji: '🦘' },
    { id: 'kahoot_22', name: 'Horse', role: 'Operator', emoji: '🐴' },
    { id: 'kahoot_23', name: 'Unicorn', role: 'Operator', emoji: '🦄' },
    { id: 'kahoot_24', name: 'Dragon', role: 'Operator', emoji: '🐉' },
    { id: 'kahoot_25', name: 'Monster', role: 'Operator', emoji: '👾' },
    { id: 'kahoot_26', name: 'Pinky', role: 'Operator', emoji: '🌸' },
    { id: 'kahoot_27', name: 'Brain', role: 'Operator', emoji: '🧠' },
    { id: 'kahoot_28', name: 'Zombie', role: 'Operator', emoji: '🧟' },
    { id: 'kahoot_29', name: 'Skeleton', role: 'Operator', emoji: '💀' },
    { id: 'kahoot_30', name: 'Earth', role: 'Operator', emoji: '🌍' },
  ];

  const HARDCODED_SHEET_IDS = {
    USER_SCORES_DB: '1Wa7g6PVvPrUgHFZSLEOm3ChVEKnKDF9Qqc8V4Nrm5V4',
    GEN_QUIZ: '1H6K9jTBY6pSBt9EBjUVaTIjGifQMmqxlA9GWpCXtWqA',
  };

  // Complete Question Bank for 10 Days (10 questions per day)
  const QUESTION_BANK = {
    1: [
      { id: 'd1_q1', question: 'What is the capital of France?', options: ['London', 'Paris', 'Rome', 'Berlin'], correctAnswer: 'Paris' },
      { id: 'd1_q2', question: 'Which is the largest planet in our solar system?', options: ['Earth', 'Mars', 'Jupiter', 'Saturn'], correctAnswer: 'Jupiter' },
      { id: 'd1_q3', question: 'What is the chemical symbol for gold?', options: ['Ag', 'Au', 'Fe', 'Cu'], correctAnswer: 'Au' },
      { id: 'd1_q4', question: 'Which planet is known as the Red Planet?', options: ['Venus', 'Mars', 'Mercury', 'Neptune'], correctAnswer: 'Mars' },
      { id: 'd1_q5', question: 'What is the largest ocean on Earth?', options: ['Atlantic Ocean', 'Indian Ocean', 'Arctic Ocean', 'Pacific Ocean'], correctAnswer: 'Pacific Ocean' },
      { id: 'd1_q6', question: 'How many continents are there?', options: ['5', '6', '7', '8'], correctAnswer: '7' },
      { id: 'd1_q7', question: 'Which is the smallest continent?', options: ['Europe', 'Australia', 'South America', 'Antarctica'], correctAnswer: 'Australia' },
      { id: 'd1_q8', question: 'What is the capital of Japan?', options: ['Beijing', 'Tokyo', 'Seoul', 'Bangkok'], correctAnswer: 'Tokyo' },
      { id: 'd1_q9', question: 'Which gas do plants absorb during photosynthesis?', options: ['Oxygen', 'Nitrogen', 'Carbon dioxide', 'Hydrogen'], correctAnswer: 'Carbon dioxide' },
      { id: 'd1_q10', question: 'What is the national animal of India?', options: ['Lion', 'Bengal tiger', 'Elephant', 'Leopard'], correctAnswer: 'Bengal tiger' },
    ],
    2: [
      { id: 'd2_q1', question: 'What is the maximum speed limit in depot zones according to SOP?', options: ['10 km/h', '15 km/h', '25 km/h', '30 km/h'], correctAnswer: '15 km/h' },
      { id: 'd2_q2', question: 'What should a driver inspect first during the pre-departure checklist?', options: ['Interior lights', 'Braking & emergency sander systems', 'Air conditioning', 'Ticket validator'], correctAnswer: 'Braking & emergency sander systems' },
      { id: 'd2_q3', question: 'What is the primary function of pantograph contact strips?', options: ['Track alignment', 'Electrical power transfer from catenary', 'Mechanical braking', 'Horn sound amplifier'], correctAnswer: 'Electrical power transfer from catenary' },
      { id: 'd2_q4', question: 'What is the boiling point of water at sea level?', options: ['90°C', '95°C', '100°C', '110°C'], correctAnswer: '100°C' },
      { id: 'd2_q5', question: 'Which organ in the human body pumps blood?', options: ['Lungs', 'Brain', 'Heart', 'Liver'], correctAnswer: 'Heart' },
      { id: 'd2_q6', question: 'Who painted the Mona Lisa?', options: ['Vincent van Gogh', 'Pablo Picasso', 'Leonardo da Vinci', 'Claude Monet'], correctAnswer: 'Leonardo da Vinci' },
      { id: 'd2_q7', question: "What does 'SOP' stand for in operations?", options: ['Standard Operating Procedure', 'System Operational Process', 'Safety Order Protocol', 'Shift Operating Program'], correctAnswer: 'Standard Operating Procedure' },
      { id: 'd2_q8', question: 'How many degrees are in a full circle?', options: ['180°', '270°', '360°', '400°'], correctAnswer: '360°' },
      { id: 'd2_q9', question: 'Which metal is liquid at room temperature?', options: ['Lead', 'Mercury', 'Tin', 'Copper'], correctAnswer: 'Mercury' },
      { id: 'd2_q10', question: 'What is the standard railway track gauge width in millimeters?', options: ['1000 mm', '1435 mm', '1520 mm', '1676 mm'], correctAnswer: '1435 mm' },
    ],
    3: [
      { id: 'd3_q1', question: 'When approaching a junction with amber signaling, what is the required SOP action?', options: ['Accelerate through', 'Prepare to stop safely before stop line', 'Sound horn continuously', 'Disable brake'], correctAnswer: 'Prepare to stop safely before stop line' },
      { id: 'd3_q2', question: 'What is the currency of the United Kingdom?', options: ['Euro', 'Pound Sterling', 'Dollar', 'Franc'], correctAnswer: 'Pound Sterling' },
      { id: 'd3_q3', question: 'Which instrument measures atmospheric pressure?', options: ['Thermometer', 'Barometer', 'Anemometer', 'Hygrometer'], correctAnswer: 'Barometer' },
      { id: 'd3_q4', question: 'In transit communications, what word signifies immediate life safety distress?', options: ['Pan-Pan', 'Mayday', 'Security', 'Code Blue'], correctAnswer: 'Mayday' },
      { id: 'd3_q5', question: 'What is the hardest natural substance on Earth?', options: ['Granite', 'Titanium', 'Diamond', 'Quartz'], correctAnswer: 'Diamond' },
      { id: 'd3_q6', question: 'How many players are on a standard football team on the pitch?', options: ['9', '10', '11', '12'], correctAnswer: '11' },
      { id: 'd3_q7', question: "What is the primary constituent gas of Earth's atmosphere?", options: ['Oxygen', 'Nitrogen', 'Carbon dioxide', 'Argon'], correctAnswer: 'Nitrogen' },
      { id: 'd3_q8', question: 'What is the procedure if door sensors detect an obstruction?', options: ['Force doors closed', 'Re-open doors automatically and inspect visually', 'Depart immediately', 'Power cycle cab'], correctAnswer: 'Re-open doors automatically and inspect visually' },
      { id: 'd3_q9', question: 'What is the speed of light approximately?', options: ['300,000 km/s', '150,000 km/s', '30,000 km/s', '3,000 km/s'], correctAnswer: '300,000 km/s' },
      { id: 'd3_q10', question: 'Which country is home to the Great Barrier Reef?', options: ['Brazil', 'Australia', 'Indonesia', 'South Africa'], correctAnswer: 'Australia' },
    ],
    4: [
      { id: 'd4_q1', question: 'Under Phase 1 scoring rules (Days 1-4), what is the active daily multiplier?', options: ['0.5x', '1x Standard', '2x Double', '4x Super'], correctAnswer: '1x Standard' },
      { id: 'd4_q2', question: 'What is the participation baseline bonus awarded per completed daily session?', options: ['50 points', '100 points', '200 points', '500 points'], correctAnswer: '100 points' },
      { id: 'd4_q3', question: 'How many members make up each operational group team?', options: ['3 members', '5 members', '8 members', '10 members'], correctAnswer: '5 members' },
      { id: 'd4_q4', question: 'What is the maximum daily score achievable in Days 1 to 4?', options: ['300 points', '500 points', '600 points', '1,200 points'], correctAnswer: '600 points' },
      { id: 'd4_q5', question: 'Which planet is closest to the Sun?', options: ['Venus', 'Mercury', 'Earth', 'Mars'], correctAnswer: 'Mercury' },
      { id: 'd4_q6', question: 'What does CCTV stand for in station security?', options: ['Central Cable Transit Video', 'Closed-Circuit Television', 'Continuous Camera Track Visual', 'Control Center Terminal View'], correctAnswer: 'Closed-Circuit Television' },
      { id: 'd4_q7', question: 'What is the chemical formula for common table salt?', options: ['NaCl', 'KCl', 'CaCl2', 'Na2SO4'], correctAnswer: 'NaCl' },
      { id: 'd4_q8', question: 'In customer service SOP, what is recommended during unexpected delays?', options: ['Wait 30 minutes', 'Provide calm, clear updates every 2-3 minutes', 'Never announce delays', 'Advise passengers to walk'], correctAnswer: 'Provide calm, clear updates every 2-3 minutes' },
      { id: 'd4_q9', question: 'What is the primary color obtained by mixing blue and yellow?', options: ['Purple', 'Green', 'Orange', 'Brown'], correctAnswer: 'Green' },
      { id: 'd4_q10', question: 'How many seconds are in one hour?', options: ['1,800', '3,600', '7,200', '60,000'], correctAnswer: '3,600' },
    ],
    5: [
      { id: 'd5_q1', question: 'Phase 2 begins today on Day 5! What is the active daily multiplier?', options: ['1x', '2x Double Multiplier', '3x Triple', '4x Super'], correctAnswer: '2x Double Multiplier' },
      { id: 'd5_q2', question: 'With 2x multiplier active, what is the maximum points a driver can earn today?', options: ['600 points', '1,000 points', '1,200 points', '2,400 points'], correctAnswer: '1,200 points' },
      { id: 'd5_q3', question: 'What is the maximum daily team surge a group of 5 can score during Phase 2?', options: ['3,000 points', '5,000 points', '6,000 points', '12,000 points'], correctAnswer: '6,000 points' },
      { id: 'd5_q4', question: 'What is the recommended braking technique on wet or leaf-fall rails?', options: ['Harsh emergency lockup', 'Early, progressive service braking with sanding', 'Accelerate through slip', 'Coast without brakes'], correctAnswer: 'Early, progressive service braking with sanding' },
      { id: 'd5_q5', question: 'Which mountain is the tallest above sea level?', options: ['K2', 'Mount Kilimanjaro', 'Mount Everest', 'Matterhorn'], correctAnswer: 'Mount Everest' },
      { id: 'd5_q6', question: 'What is the term for a group of lions?', options: ['Pack', 'Herd', 'Pride', 'Flock'], correctAnswer: 'Pride' },
      { id: 'd5_q7', question: 'Which component converts alternating current (AC) to direct current (DC)?', options: ['Transformer', 'Inverter', 'Rectifier', 'Capacitor'], correctAnswer: 'Rectifier' },
      { id: 'd5_q8', question: 'What is the official daily deadline by which shift drivers must complete their quiz?', options: ['18:00', '20:00', '22:00', '23:59'], correctAnswer: '23:59' },
      { id: 'd5_q9', question: 'Who developed the theory of general relativity?', options: ['Isaac Newton', 'Albert Einstein', 'Nikola Tesla', 'Niels Bohr'], correctAnswer: 'Albert Einstein' },
      { id: 'd5_q10', question: 'What does AED stand for in emergency first aid kits?', options: ['Automated External Defibrillator', 'Advanced Emergency Detector', 'Auxiliary Electrical Device', 'Airway Extraction Duct'], correctAnswer: 'Automated External Defibrillator' },
    ],
    6: [
      { id: 'd6_q1', question: "What is the purpose of the driver's vigilance device (deadman's control)?", options: ['Measure weight', 'Verify driver alertness and automatically brake if unresponsive', 'Adjust seat', 'Tune radio'], correctAnswer: 'Verify driver alertness and automatically brake if unresponsive' },
      { id: 'd6_q2', question: 'Which sea borders Egypt to the east?', options: ['Black Sea', 'Red Sea', 'Baltic Sea', 'Caspian Sea'], correctAnswer: 'Red Sea' },
      { id: 'd6_q3', question: 'In team dynamics, why does full participation beat spotty individual brilliance?', options: ['No bonus exists', '100-pt show-up baseline across 5 drivers lifts the whole group score', 'Only captain scores', 'Scores are divided'], correctAnswer: '100-pt show-up baseline across 5 drivers lifts the whole group score' },
      { id: 'd6_q4', question: 'What is the square root of 144?', options: ['10', '11', '12', '14'], correctAnswer: '12' },
      { id: 'd6_q5', question: 'What is the primary function of track switches (turnouts)?', options: ['Measure rail temp', 'Guide rolling stock from one track to another', 'Clean wheel flanges', 'Supply catenary voltage'], correctAnswer: 'Guide rolling stock from one track to another' },
      { id: 'd6_q6', question: 'Which gas gives soda drinks their characteristic fizz?', options: ['Oxygen', 'Carbon dioxide', 'Nitrous oxide', 'Helium'], correctAnswer: 'Carbon dioxide' },
      { id: 'd6_q7', question: 'Which continent has the most countries?', options: ['Asia', 'Africa', 'Europe', 'South America'], correctAnswer: 'Africa' },
      { id: 'd6_q8', question: 'In safety regulations, what does PPE stand for?', options: ['Public Protection Equipment', 'Personal Protective Equipment', 'Preventive Power Enclosure', 'Primary Phase Earth'], correctAnswer: 'Personal Protective Equipment' },
      { id: 'd6_q9', question: 'What is the SI unit of electric resistance?', options: ['Volt', 'Ampere', 'Ohm', 'Watt'], correctAnswer: 'Ohm' },
      { id: 'd6_q10', question: 'What is the mandatory action upon encountering an amber aspect on a route signal?', options: ['Accelerate', 'Prepare to stop safely before next signal', 'Reverse vehicle', 'Sound emergency horn'], correctAnswer: 'Prepare to stop safely before next signal' },
    ],
    7: [
      { id: 'd7_q1', question: 'Today is Day 7: final day of Phase 2! What is the base bonus per correct answer?', options: ['50 points', '100 points', '200 points', '500 points'], correctAnswer: '100 points' },
      { id: 'd7_q2', question: 'With 2x multiplier, how many points do 5 correct answers yield today (excluding baseline)?', options: ['500 points', '800 points', '1,000 points', '1,200 points'], correctAnswer: '1,000 points' },
      { id: 'd7_q3', question: 'Which river is the longest river in South America?', options: ['Nile', 'Amazon River', 'Paraná', 'Orinoco'], correctAnswer: 'Amazon River' },
      { id: 'd7_q4', question: 'In transit SOP guidelines, who must be informed immediately of track trespassing?', options: ['Ticket vendor', 'Operations Control Center (OCC)', 'Cleaning crew', 'Local media'], correctAnswer: 'Operations Control Center (OCC)' },
      { id: 'd7_q5', question: 'What is the capital of Canada?', options: ['Toronto', 'Vancouver', 'Ottawa', 'Montreal'], correctAnswer: 'Ottawa' },
      { id: 'd7_q6', question: 'How many bones are in the adult human body?', options: ['196', '206', '216', '226'], correctAnswer: '206' },
      { id: 'd7_q7', question: 'What type of fire extinguisher should NEVER be used on electrical equipment fires?', options: ['CO2 extinguisher', 'Dry Chemical Powder', 'Water extinguisher', 'Clean Agent'], correctAnswer: 'Water extinguisher' },
      { id: 'd7_q8', question: 'Which country gifted the Statue of Liberty to the United States?', options: ['United Kingdom', 'France', 'Spain', 'Germany'], correctAnswer: 'France' },
      { id: 'd7_q9', question: 'What is the term for tramways sharing right-of-way with street vehicles without segregation?', options: ['Segregated Alignment', 'Street Running / Mixed Traffic', 'Grade Separation', 'Dedicated Corridor'], correctAnswer: 'Street Running / Mixed Traffic' },
      { id: 'd7_q10', question: "Which chemical element has the symbol 'Fe'?", options: ['Fluorine', 'Iron', 'Francium', 'Lead'], correctAnswer: 'Iron' },
    ],
    8: [
      { id: 'd8_q1', question: 'Phase 3 begins! What is the active Super Multiplier for Days 8 to 10?', options: ['2x', '3x', '4x Super Multiplier', '5x Mega'], correctAnswer: '4x Super Multiplier' },
      { id: 'd8_q2', question: 'With 4x multiplier active, what is the maximum score a single driver can win today?', options: ['600 points', '1,200 points', '1,800 points', '2,400 points'], correctAnswer: '2,400 points' },
      { id: 'd8_q3', question: 'What is the maximum team surge points an entire group of 5 can earn in one day in Phase 3?', options: ['3,000 points', '6,000 points', '10,000 points', '12,000 points'], correctAnswer: '12,000 points' },
      { id: 'd8_q4', question: 'What is the capital of Germany?', options: ['Munich', 'Frankfurt', 'Berlin', 'Hamburg'], correctAnswer: 'Berlin' },
      { id: 'd8_q5', question: "What is the primary function of a tram's magnetic track brake?", options: ['Parking brake', 'High-deceleration emergency stopping directly on rail head', 'Wheel polishing', 'Energy recovery'], correctAnswer: 'High-deceleration emergency stopping directly on rail head' },
      { id: 'd8_q6', question: 'Which planet in our solar system has prominent rings visible through amateur telescopes?', options: ['Mars', 'Saturn', 'Mercury', 'Venus'], correctAnswer: 'Saturn' },
      { id: 'd8_q7', question: 'What is typical normal human body temperature in Celsius?', options: ['35.0°C', '37.0°C', '39.5°C', '40.0°C'], correctAnswer: '37.0°C' },
      { id: 'd8_q8', question: "In transit radio protocol, what does the expression 'ROGER' signify?", options: ['I disagree', 'Message received and understood', 'Repeat transmission', 'End of shift'], correctAnswer: 'Message received and understood' },
      { id: 'd8_q9', question: 'What is the largest living mammal on Earth?', options: ['African Elephant', 'Blue Whale', 'Giraffe', 'Hippopotamus'], correctAnswer: 'Blue Whale' },
      { id: 'd8_q10', question: 'How many days are in a leap year?', options: ['364', '365', '366', '367'], correctAnswer: '366' },
    ],
    9: [
      { id: 'd9_q1', question: 'In Phase 3 (4x Multiplier), what is the value of the 100-point base participation bonus?', options: ['100 points', '200 points', '400 points', '800 points'], correctAnswer: '400 points' },
      { id: 'd9_q2', question: 'What is the capital city of Australia?', options: ['Sydney', 'Melbourne', 'Canberra', 'Brisbane'], correctAnswer: 'Canberra' },
      { id: 'd9_q3', question: 'Under low visibility / dense fog SOP, what is the mandatory driving precaution?', options: ['Maintain top speed', 'Reduce speed, engage low beams, and increase headway spacing', 'Overtake other trams', 'Switch off cab radio'], correctAnswer: 'Reduce speed, engage low beams, and increase headway spacing' },
      { id: 'd9_q4', question: 'Which scientist discovered penicillin in 1928?', options: ['Alexander Fleming', 'Louis Pasteur', 'Marie Curie', 'Robert Koch'], correctAnswer: 'Alexander Fleming' },
      { id: 'd9_q5', question: 'What is the perimeter of a rectangular workshop with length 10m and width 5m?', options: ['15m', '30m', '50m', '100m'], correctAnswer: '30m' },
      { id: 'd9_q6', question: 'What is the primary source of natural light and energy for the Earth?', options: ['The Moon', 'The Sun', 'Geothermal vents', 'Atmospheric Aurora'], correctAnswer: 'The Sun' },
      { id: 'd9_q7', question: 'Which color is universally designated for caution and warning signs in transportation?', options: ['Green', 'Amber / Yellow', 'Blue', 'White'], correctAnswer: 'Amber / Yellow' },
      { id: 'd9_q8', question: 'What does HVAC stand for in transit vehicle maintenance?', options: ['Heating, Ventilation, and Air Conditioning', 'High Voltage Auxiliary Circuit', 'Heavy Vehicle Access Control', 'Hydraulic Valve Actuator Component'], correctAnswer: 'Heating, Ventilation, and Air Conditioning' },
      { id: 'd9_q9', question: 'Which ocean separates North America from Europe?', options: ['Pacific Ocean', 'Atlantic Ocean', 'Arctic Ocean', 'Indian Ocean'], correctAnswer: 'Atlantic Ocean' },
      { id: 'd9_q10', question: 'In the group standings, how is the total team score calculated?', options: ['Highest individual score only', 'Sum of all 5 team members total scores', 'Average divided by 10', 'Only supervisor score'], correctAnswer: 'Sum of all 5 team members total scores' },
    ],
    10: [
      { id: 'd10_q1', question: 'Grand Finale Day 10! What is the final daily multiplier active today?', options: ['1x', '2x', '4x Super Multiplier', '10x'], correctAnswer: '4x Super Multiplier' },
      { id: 'd10_q2', question: 'Across all 10 days of the challenge, what is the maximum theoretical score a perfect driver can achieve?', options: ['6,000 points', '9,600 points', '15,600 points', '24,000 points'], correctAnswer: '15,600 points' },
      { id: 'd10_q3', question: 'What is the capital city of Spain?', options: ['Barcelona', 'Madrid', 'Seville', 'Valencia'], correctAnswer: 'Madrid' },
      { id: 'd10_q4', question: 'When are the final group and individual standings confirmed according to the operational schedule?', options: ['At the Day 10 operations debrief', 'Next month', 'Never', 'During morning inspection'], correctAnswer: 'At the Day 10 operations debrief' },
      { id: 'd10_q5', question: 'What is the chemical symbol for Silver?', options: ['Si', 'Ag', 'Au', 'Sn'], correctAnswer: 'Ag' },
      { id: 'd10_q6', question: 'What is the primary role of the onboard passenger emergency intercom?', options: ['Order cafeteria snacks', 'Allow passengers to alert driver immediately of onboard emergency', 'Play cabin music', 'Inquire about ticket fares'], correctAnswer: 'Allow passengers to alert driver immediately of onboard emergency' },
      { id: 'd10_q7', question: 'Which planet is fourth from the Sun in our solar system?', options: ['Venus', 'Earth', 'Mars', 'Jupiter'], correctAnswer: 'Mars' },
      { id: 'd10_q8', question: 'What is 15 multiplied by 8?', options: ['100', '110', '120', '130'], correctAnswer: '120' },
      { id: 'd10_q9', question: 'In operational group dynamics, why is no team out of contention until Day 10 finishes?', options: ['Ties are impossible', 'The 4x Super Multiplier creates massive group surges of up to 12,000 pts daily', 'Scores reset every day', 'Teams are reshuffled'], correctAnswer: 'The 4x Super Multiplier creates massive group surges of up to 12,000 pts daily' },
      { id: 'd10_q10', question: 'What is the primary operational mission of the 10-Day Quiz Challenge?', options: ['Speed over safety', '10 Days of Continuous Learning & Operational Excellence', 'Compete without teamwork', 'Individual rankings only'], correctAnswer: '10 Days of Continuous Learning & Operational Excellence' },
    ],
  };

  // --- State Object ---
  const state = {
    currentUser: null,
    currentPage: 'page-registration', // 'page-registration', 'page-dashboard', 'page-quiz'
    activeDay: 1,
    activeLeaderboardTab: 'individual', // 'individual' or 'group'
    quiz: {
      questions: [],
      currentIndex: 0,
      selectedAnswer: null,
      isAnswered: false,
      answersHistory: [],
    },
    leaderboard: {
      individuals: [],
      groups: [],
    },
  };

  // --- Initializer ---
  function init() {
    loadUserFromStorage();
    initCountdownTimer();
    renderAvatarSelector();
    setupEventListeners();
    refreshLeaderboard();

    if (state.currentUser) {
      navigateTo('page-dashboard');
    } else {
      navigateTo('page-registration');
    }
  }

  // --- Navigation & Page Switching ---
  function navigateTo(pageId) {
    state.currentPage = pageId;
    ['page-registration', 'page-dashboard', 'page-quiz'].forEach((id) => {
      const el = document.getElementById(id);
      if (el) {
        if (id === pageId) {
          el.classList.remove('hidden');
        } else {
          el.classList.add('hidden');
        }
      }
    });

    if (pageId === 'page-dashboard') {
      renderDashboard();
    }
  }

  // --- Storage & API Helpers ---
  function loadUserFromStorage() {
    const raw = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
    if (raw) {
      try {
        state.currentUser = JSON.parse(raw);
        state.activeDay = Math.min(10, Math.max(1, (state.currentUser.lastCompletedDay || 0) + 1));
      } catch (e) {
        state.currentUser = null;
      }
    }
  }

  function saveUserToStorage(user) {
    state.currentUser = user;
    localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(user));
  }

  function getGasUrl() {
    return localStorage.getItem(STORAGE_KEYS.GAS_URL) || '';
  }

  function setGasUrl(url) {
    if (url) localStorage.setItem(STORAGE_KEYS.GAS_URL, url.trim());
    else localStorage.removeItem(STORAGE_KEYS.GAS_URL);
  }

  // --- Leaderboard Calculation & Sync ---
  async function refreshLeaderboard() {
    const gasUrl = getGasUrl();
    if (gasUrl) {
      try {
        const res = await fetch(`${gasUrl}?action=getLeaderboardData`);
        const data = await res.json();
        if (data.status === 'success' && data.data) {
          state.leaderboard = data.data;
          renderLeaderboard();
          return;
        }
      } catch (e) {
        console.warn('Falling back to local leaderboard computation:', e);
      }
    }

    // Local calculation (starts blank with 0 staff until registered)
    let drivers = [];
    const raw = localStorage.getItem(STORAGE_KEYS.ALL_DRIVERS);
    if (raw) {
      try { 
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          // Filter out any legacy mock data
          drivers = parsed.filter(d => d.staffName !== 'Alex Mercer' && d.staffId !== 'DRV-1001');
        }
      } catch (e) {}
    }

    // Sort individuals descending with tie-breaker (less time taken ranks higher)
    drivers.sort((a, b) => {
      if (b.totalPoints !== a.totalPoints) {
        return b.totalPoints - a.totalPoints;
      }
      return (a.totalTimeSeconds || 999) - (b.totalTimeSeconds || 999);
    });
    drivers.forEach((d, idx) => { d.rank = idx + 1; });

    // Group aggregate
    const groupMap = {};
    TEAMS.forEach((t) => {
      groupMap[t] = { teamName: t, aggregatePoints: 0, memberCount: 0, members: [] };
    });

    drivers.forEach((d) => {
      if (!groupMap[d.groupName]) {
        groupMap[d.groupName] = { teamName: d.groupName, aggregatePoints: 0, memberCount: 0, members: [] };
      }
      groupMap[d.groupName].aggregatePoints += d.totalPoints;
      groupMap[d.groupName].memberCount += 1;
      groupMap[d.groupName].members.push({ name: d.staffName, points: d.totalPoints });
    });

    const groups = Object.values(groupMap).sort((a, b) => b.aggregatePoints - a.aggregatePoints);
    groups.forEach((g, idx) => { g.rank = idx + 1; });

    state.leaderboard = {
      individuals: drivers.slice(0, 10),
      groups: groups,
      allIndividuals: drivers,
    };

    renderLeaderboard();
  }

  // --- Registration Engine ---
  let selectedAvatarId = 'avatar_1';

  function renderAvatarSelector() {
    const container = document.getElementById('avatar-grid');
    if (!container) return;

    container.innerHTML = AVATAR_OPTIONS.map((a) => {
      const isSelected = a.id === selectedAvatarId;
      return `
        <button type="button" data-avatar="${a.id}" class="avatar-option p-2 rounded-xl border text-center transition-all ${
          isSelected
            ? 'border-emerald-400 bg-emerald-500/20 ring-2 ring-emerald-400/50'
            : 'border-slate-700 bg-slate-800/80 hover:border-slate-500'
        }">
          <div class="text-3xl mb-1">${a.emoji}</div>
          <div class="text-xs font-bold text-white truncate">${a.name}</div>
          <div class="text-[10px] text-slate-400 truncate">${a.role}</div>
        </button>
      `;
    }).join('');

    container.querySelectorAll('.avatar-option').forEach((btn) => {
      btn.addEventListener('click', () => {
        selectedAvatarId = btn.getAttribute('data-avatar');
        renderAvatarSelector();
      });
    });
  }

  async function handleRegister(staffId, staffName) {
    const trimmedId = staffId.trim().toUpperCase();
    const trimmedName = staffName.trim();
    const gasUrl = getGasUrl();

    if (gasUrl) {
      try {
        const res = await fetch(gasUrl, {
          method: 'POST',
          body: JSON.stringify({
            action: 'registerUser',
            staffId: trimmedId,
            staffName: trimmedName,
            avatarId: selectedAvatarId,
          }),
        });
        const data = await res.json();
        if (data.status === 'success' && data.user) {
          saveUserToStorage(data.user);
          await refreshLeaderboard();
          navigateTo('page-dashboard');
          return;
        }
      } catch (e) {
        console.warn('GAS registration failed, using local fallback:', e);
      }
    }

    // Local balanced team assignment
    let drivers = [];
    try {
      drivers = JSON.parse(localStorage.getItem(STORAGE_KEYS.ALL_DRIVERS) || '[]');
    } catch (e) {}

    const teamCounts = {};
    TEAMS.forEach((t) => (teamCounts[t] = 0));
    drivers.forEach((d) => { if (teamCounts[d.groupName] !== undefined) teamCounts[d.groupName]++; });

    let min = Infinity;
    let candidates = [];
    TEAMS.forEach((t) => {
      if (teamCounts[t] < min) { min = teamCounts[t]; candidates = [t]; }
      else if (teamCounts[t] === min) { candidates.push(t); }
    });

    const assignedGroup = candidates[Math.floor(Math.random() * candidates.length)];

    const newUser = {
      staffId: trimmedId,
      staffName: trimmedName,
      avatarId: selectedAvatarId,
      groupName: assignedGroup,
      scores: {},
      totalPoints: 0,
      lastCompletedDay: 0,
    };

    drivers.push({
      rank: drivers.length + 1,
      staffId: trimmedId,
      staffName: trimmedName,
      avatarId: selectedAvatarId,
      groupName: assignedGroup,
      totalPoints: 0,
      lastCompletedDay: 0,
    });

    localStorage.setItem(STORAGE_KEYS.ALL_DRIVERS, JSON.stringify(drivers));
    saveUserToStorage(newUser);
    await refreshLeaderboard();
    navigateTo('page-dashboard');
  }

  // --- Dashboard Rendering ---
  function renderDashboard() {
    if (!state.currentUser) return;
    const user = state.currentUser;
    const multInfo = MULTIPLIERS[state.activeDay] || MULTIPLIERS[1];

    // Header values
    const avatarData = AVATAR_OPTIONS.find((a) => a.id === user.avatarId) || AVATAR_OPTIONS[0];
    const userAvatarEl = document.getElementById('user-avatar-display');
    if (userAvatarEl) userAvatarEl.textContent = avatarData.emoji;

    const userNameEl = document.getElementById('user-name-display');
    if (userNameEl) userNameEl.textContent = user.staffName;

    const userStaffIdEl = document.getElementById('user-staffid-display');
    if (userStaffIdEl) userStaffIdEl.textContent = user.staffId;

    const userGroupEl = document.getElementById('user-group-display');
    if (userGroupEl) userGroupEl.textContent = user.groupName;

    const userPointsEl = document.getElementById('user-points-display');
    if (userPointsEl) userPointsEl.textContent = Number(user.totalPoints || 0).toLocaleString();

    // Day & Multiplier info
    const dayBadgeEl = document.getElementById('dash-day-badge');
    if (dayBadgeEl) dayBadgeEl.textContent = `Day ${state.activeDay} of 10 Challenge`;

    const multBadgeEl = document.getElementById('dash-multiplier-badge');
    if (multBadgeEl) {
      multBadgeEl.textContent = `${multInfo.multiplier}× Multiplier Active (${multInfo.name})`;
      multBadgeEl.className = `text-xs font-bold px-2.5 py-1 rounded-md ${multInfo.badge}`;
    }

    const multDescEl = document.getElementById('dash-multiplier-desc');
    if (multDescEl) {
      multDescEl.textContent = `Up to ${multInfo.maxDaily} pts maximum daily. 100 pt baseline + 100 pt accuracy × ${multInfo.multiplier}x.`;
    }

    // Day Selector Strip
    const stripEl = document.getElementById('dash-day-selector');
    if (stripEl) {
      stripEl.innerHTML = Array.from({ length: 10 }, (_, i) => i + 1).map((d) => {
        const isCurrent = d === state.activeDay;
        const hasDone = !!(user.scores && user.scores['Day' + d]);
        const m = MULTIPLIERS[d].multiplier;
        return `
          <button data-day="${d}" class="day-btn px-3 py-1.5 rounded-lg text-xs font-semibold flex flex-col items-center shrink-0 transition-all ${
            isCurrent
              ? 'bg-emerald-500 text-slate-950 font-bold'
              : hasDone
              ? 'bg-slate-800 text-emerald-300 border border-emerald-500/30'
              : 'bg-slate-800/80 text-slate-400 border border-slate-700 hover:text-white'
          }">
            <span>Day ${d}</span>
            <span class="text-[9px] opacity-80">${m}x</span>
          </button>
        `;
      }).join('');

      stripEl.querySelectorAll('.day-btn').forEach((b) => {
        b.addEventListener('click', () => {
          state.activeDay = parseInt(b.getAttribute('data-day'), 10);
          renderDashboard();
        });
      });
    }

    // Start Quiz Action Button
    const quizActionContainer = document.getElementById('dash-quiz-action');
    if (quizActionContainer) {
      const isCompleted = !!(user.scores && user.scores['Day' + state.activeDay]);
      const earned = (user.scores && user.scores['Day' + state.activeDay]) || 0;

      if (isCompleted) {
        quizActionContainer.innerHTML = `
          <div class="bg-slate-900 border border-emerald-500/40 rounded-xl p-3.5 text-center space-y-1">
            <div class="text-emerald-400 font-bold text-sm">✓ Day ${state.activeDay} Quiz Completed (+${earned} pts)</div>
            <p class="text-xs text-slate-400">Locked. One attempt per day. Next quiz window opens tomorrow!</p>
          </div>
        `;
      } else {
        quizActionContainer.innerHTML = `
          <button id="btn-start-quiz" class="w-full py-3.5 px-5 bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 text-slate-950 font-black rounded-xl text-sm sm:text-base tracking-wide shadow-lg shadow-emerald-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer">
            <span>Start Day ${state.activeDay} Quiz</span>
            <span class="text-xs font-bold bg-slate-950/20 px-2 py-0.5 rounded-full">Up to ${multInfo.maxDaily} pts</span>
          </button>
        `;
        document.getElementById('btn-start-quiz')?.addEventListener('click', () => startQuiz(state.activeDay));
      }
    }

    renderLeaderboard();
  }

  function renderLeaderboard() {
    const indContainer = document.getElementById('leaderboard-individual');
    const grpContainer = document.getElementById('leaderboard-group');

    if (state.activeLeaderboardTab === 'individual') {
      indContainer?.classList.remove('hidden');
      grpContainer?.classList.add('hidden');
    } else {
      indContainer?.classList.add('hidden');
      grpContainer?.classList.remove('hidden');
    }

    // Render Individual Top 10
    const tbody = document.getElementById('individual-table-body');
    if (tbody && state.leaderboard.individuals) {
      tbody.innerHTML = state.leaderboard.individuals.map((ind) => {
        const isCurrent = state.currentUser && ind.staffId.toUpperCase() === state.currentUser.staffId.toUpperCase();
        return `
          <tr class="border-b border-slate-700/40 ${isCurrent ? 'bg-emerald-500/10 font-bold' : 'hover:bg-slate-700/30'}">
            <td class="py-2.5 px-4 font-mono">${ind.rank}</td>
            <td class="py-2.5 px-4">
              <span class="font-semibold text-white">${ind.staffName}</span>
              ${isCurrent ? '<span class="text-[10px] text-emerald-400 ml-1">(You)</span>' : ''}
              <span class="text-[11px] font-mono text-slate-400 block">${ind.staffId}</span>
            </td>
            <td class="py-2.5 px-4 text-xs text-slate-300">${ind.groupName}</td>
            <td class="py-2.5 px-4 text-center font-mono text-slate-400">${ind.lastCompletedDay} / 10</td>
            <td class="py-2.5 px-4 text-right font-mono font-bold text-emerald-400">${Number(ind.totalPoints).toLocaleString()} pts</td>
          </tr>
        `;
      }).join('');
    }

    // Render All 10 Groups
    const groupGrid = document.getElementById('group-grid');
    if (groupGrid && state.leaderboard.groups) {
      groupGrid.innerHTML = state.leaderboard.groups.map((grp) => {
        const isUserTeam = state.currentUser && grp.teamName === state.currentUser.groupName;
        return `
          <div class="p-4 rounded-xl border ${
            isUserTeam ? 'bg-slate-800 border-indigo-500 shadow-md' : 'bg-slate-800/60 border-slate-700/60'
          }">
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-3">
                <span class="w-7 h-7 rounded-lg bg-slate-700 text-xs font-bold flex items-center justify-center text-white">#${grp.rank}</span>
                <div>
                  <h4 class="text-sm font-bold text-white">${grp.teamName} ${isUserTeam ? '<span class="text-[10px] text-indigo-400 uppercase font-normal">(Your Team)</span>' : ''}</h4>
                  <span class="text-xs text-slate-400">${grp.memberCount} of 5 Active Drivers</span>
                </div>
              </div>
              <div class="text-right">
                <span class="font-mono text-base font-black text-white">${Number(grp.aggregatePoints).toLocaleString()}</span>
                <span class="text-[11px] text-slate-400 block">Total pts</span>
              </div>
            </div>
          </div>
        `;
      }).join('');
    }
  }

  // --- Daily Quiz Engine ---
  async function startQuiz(day) {
    state.activeDay = day;
    state.quiz.currentIndex = 0;
    state.quiz.selectedAnswer = null;
    state.quiz.isAnswered = false;
    state.quiz.answersHistory = [];

    // Pull 5 questions
    const pool = QUESTION_BANK[day] || QUESTION_BANK[1];
    const shuffled = [...pool].sort(() => Math.random() - 0.5);
    state.quiz.questions = shuffled.slice(0, 5);

    navigateTo('page-quiz');
    renderQuizQuestion();
  }

  function renderQuizQuestion() {
    const q = state.quiz.questions[state.quiz.currentIndex];
    const multInfo = MULTIPLIERS[state.activeDay] || MULTIPLIERS[1];

    document.getElementById('quiz-header-day').textContent = `Day ${state.activeDay} of 10 Challenge`;
    document.getElementById('quiz-header-multiplier').textContent = `${multInfo.multiplier}× Multiplier Active`;
    document.getElementById('quiz-question-counter').textContent = `Question ${state.quiz.currentIndex + 1} of ${state.quiz.questions.length}`;
    document.getElementById('quiz-question-text').textContent = q.question;

    const optionsContainer = document.getElementById('quiz-options-container');
    const letters = ['A', 'B', 'C', 'D'];

    optionsContainer.innerHTML = q.options.map((opt, i) => {
      return `
        <button type="button" data-option="${opt}" class="quiz-option-btn w-full p-4 rounded-xl border border-slate-700 bg-slate-900/80 hover:bg-slate-800 text-slate-200 text-left flex items-center justify-between text-sm sm:text-base transition-all cursor-pointer">
          <div class="flex items-center gap-3">
            <span class="w-8 h-8 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center font-bold text-xs">${letters[i]}</span>
            <span>${opt}</span>
          </div>
        </button>
      `;
    }).join('');

    const feedbackContainer = document.getElementById('quiz-feedback-banner');
    feedbackContainer.classList.add('hidden');

    // Attach click events
    optionsContainer.querySelectorAll('.quiz-option-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        if (state.quiz.isAnswered) return;
        const selected = btn.getAttribute('data-option');
        handleAnswerSelected(selected, btn, optionsContainer);
      });
    });
  }

  function handleAnswerSelected(selectedOption, clickedBtn, container) {
    state.quiz.isAnswered = true;
    state.quiz.selectedAnswer = selectedOption;

    const q = state.quiz.questions[state.quiz.currentIndex];
    const isCorrect = selectedOption.trim().toLowerCase() === q.correctAnswer.trim().toLowerCase();
    const mult = MULTIPLIERS[state.activeDay].multiplier;

    state.quiz.answersHistory.push({
      questionId: q.id,
      selectedAnswer: selectedOption,
      correctAnswer: q.correctAnswer,
      isCorrect,
    });

    // Style options
    container.querySelectorAll('.quiz-option-btn').forEach((b) => {
      const opt = b.getAttribute('data-option');
      if (opt.trim().toLowerCase() === q.correctAnswer.trim().toLowerCase()) {
        b.className = 'quiz-option-btn w-full p-4 rounded-xl border border-emerald-400 bg-emerald-500/20 text-emerald-100 flex items-center justify-between';
      } else if (b === clickedBtn && !isCorrect) {
        b.className = 'quiz-option-btn w-full p-4 rounded-xl border border-rose-500 bg-rose-500/20 text-rose-200 flex items-center justify-between';
      } else {
        b.className = 'quiz-option-btn w-full p-4 rounded-xl border border-slate-800 bg-slate-900/40 text-slate-500 opacity-50 flex items-center justify-between';
      }
    });

    // Show feedback banner
    const feedbackContainer = document.getElementById('quiz-feedback-banner');
    feedbackContainer.classList.remove('hidden');

    const msgEl = document.getElementById('quiz-feedback-msg');
    if (isCorrect) {
      msgEl.innerHTML = `<span class="text-emerald-400 font-bold">🎉 Congratulations! +${100 * mult} points earned!</span>`;
    } else {
      msgEl.innerHTML = `<span class="text-rose-400 font-bold">Incorrect.</span> <span class="text-slate-400 text-xs">Correct answer: <strong class="text-emerald-300">${q.correctAnswer}</strong></span>`;
    }

    const nextBtn = document.getElementById('btn-next-question');
    nextBtn.textContent = state.quiz.currentIndex + 1 < state.quiz.questions.length ? 'Next Question →' : 'Finish & View Daily Score →';
  }

  function handleNextQuestion() {
    if (state.quiz.currentIndex + 1 < state.quiz.questions.length) {
      state.quiz.currentIndex++;
      state.quiz.selectedAnswer = null;
      state.quiz.isAnswered = false;
      renderQuizQuestion();
    } else {
      showCompletionView();
    }
  }

  function showCompletionView() {
    const correctCount = state.quiz.answersHistory.filter((a) => a.isCorrect).length;
    const baseBaseline = 100;
    const baseAccuracy = correctCount * 100;
    const subtotal = baseBaseline + baseAccuracy;
    const mult = MULTIPLIERS[state.activeDay].multiplier;
    const finalScore = subtotal * mult;

    document.getElementById('quiz-in-progress-view')?.classList.add('hidden');
    const compView = document.getElementById('quiz-completion-view');
    compView?.classList.remove('hidden');

    document.getElementById('comp-total-score').textContent = `+${finalScore.toLocaleString()} pts`;
    document.getElementById('comp-group-name').textContent = state.currentUser?.groupName || 'Group Alpha';
    document.getElementById('comp-correct-count').textContent = `${correctCount} of 5 correct (${baseAccuracy} pts)`;
    document.getElementById('comp-multiplier-applied').textContent = `${mult}× (${MULTIPLIERS[state.activeDay].name})`;
    document.getElementById('comp-final-score').textContent = `${finalScore.toLocaleString()} pts`;

    // Save score
    submitQuizScore(state.activeDay, finalScore, correctCount);
  }

  async function submitQuizScore(day, score, correctCount) {
    if (!state.currentUser) return;
    const staffId = state.currentUser.staffId;

    // Update currentUser state
    state.currentUser.scores['Day' + day] = score;
    state.currentUser.totalPoints = (state.currentUser.totalPoints || 0) + score;
    state.currentUser.lastCompletedDay = Math.max(state.currentUser.lastCompletedDay || 0, day);
    saveUserToStorage(state.currentUser);

    // Update local driver entry
    let drivers = [];
    try { drivers = JSON.parse(localStorage.getItem(STORAGE_KEYS.ALL_DRIVERS) || '[]'); } catch (e) {}
    const idx = drivers.findIndex((d) => d.staffId.toUpperCase() === staffId.toUpperCase());
    if (idx >= 0) {
      drivers[idx].totalPoints += score;
      drivers[idx].lastCompletedDay = Math.max(drivers[idx].lastCompletedDay, day);
      localStorage.setItem(STORAGE_KEYS.ALL_DRIVERS, JSON.stringify(drivers));
    }

    // Post to Google Apps Script if set
    const gasUrl = getGasUrl();
    if (gasUrl) {
      try {
        await fetch(gasUrl, {
          method: 'POST',
          body: JSON.stringify({
            action: 'submitQuizScore',
            staffId,
            day,
            score,
            correctCount,
          }),
        });
      } catch (e) {
        console.warn('GAS submission failed, cached locally:', e);
      }
    }

    await refreshLeaderboard();
  }

  // --- Countdown Timer ---
  function initCountdownTimer() {
    function update() {
      const now = new Date();
      const end = new Date();
      end.setHours(23, 59, 59, 999);
      const diff = end - now;
      if (diff > 0) {
        const h = Math.floor(diff / 3600000);
        const m = Math.floor((diff % 3600000) / 60000);
        const s = Math.floor((diff % 60000) / 1000);
        const timerEl = document.getElementById('daily-countdown-timer');
        if (timerEl) {
          timerEl.textContent = `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
        }
      }
    }
    update();
    setInterval(update, 1000);
  }

  // --- Event Listeners Setup ---
  function setupEventListeners() {
    // Registration form
    document.getElementById('registration-form')?.addEventListener('submit', (e) => {
      e.preventDefault();
      const id = document.getElementById('reg-staff-id').value;
      const name = document.getElementById('reg-staff-name').value;
      handleRegister(id, name);
    });

    // Leaderboard Tabs
    document.getElementById('tab-btn-individual')?.addEventListener('click', () => {
      state.activeLeaderboardTab = 'individual';
      document.getElementById('tab-btn-individual').className = 'px-3 py-1.5 text-xs font-semibold rounded-lg bg-emerald-500 text-slate-950';
      document.getElementById('tab-btn-group').className = 'px-3 py-1.5 text-xs font-semibold rounded-lg text-slate-400 hover:text-white';
      renderLeaderboard();
    });

    document.getElementById('tab-btn-group')?.addEventListener('click', () => {
      state.activeLeaderboardTab = 'group';
      document.getElementById('tab-btn-group').className = 'px-3 py-1.5 text-xs font-semibold rounded-lg bg-emerald-500 text-slate-950';
      document.getElementById('tab-btn-individual').className = 'px-3 py-1.5 text-xs font-semibold rounded-lg text-slate-400 hover:text-white';
      renderLeaderboard();
    });

    // Next Question Button
    document.getElementById('btn-next-question')?.addEventListener('click', handleNextQuestion);

    // Return to Dashboard from Quiz
    document.getElementById('btn-return-dashboard')?.addEventListener('click', () => {
      document.getElementById('quiz-in-progress-view')?.classList.remove('hidden');
      document.getElementById('quiz-completion-view')?.classList.add('hidden');
      navigateTo('page-dashboard');
    });

    // Exit quiz button
    document.getElementById('btn-exit-quiz')?.addEventListener('click', () => {
      navigateTo('page-dashboard');
    });

    // Sign out button
    document.getElementById('btn-sign-out')?.addEventListener('click', () => {
      localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
      state.currentUser = null;
      navigateTo('page-registration');
    });
  }

  // Run on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
