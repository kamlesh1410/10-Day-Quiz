import { Question, MultiplierPhaseInfo } from '../types';

export const MULTIPLIER_PHASES: Record<number, MultiplierPhaseInfo> = {
  1: {
    phase: 1,
    name: 'Standard Points',
    multiplier: 1,
    maxDaily: 600,
    description: 'Up to 600 points daily per staff member (3,000 max group surge)',
    tagColor: 'bg-slate-100 text-slate-800 border-slate-200',
  },
  2: {
    phase: 1,
    name: 'Standard Points',
    multiplier: 1,
    maxDaily: 600,
    description: 'Up to 600 points daily per staff member (3,000 max group surge)',
    tagColor: 'bg-slate-100 text-slate-800 border-slate-200',
  },
  3: {
    phase: 1,
    name: 'Standard Points',
    multiplier: 1,
    maxDaily: 600,
    description: 'Up to 600 points daily per staff member (3,000 max group surge)',
    tagColor: 'bg-slate-100 text-slate-800 border-slate-200',
  },
  4: {
    phase: 1,
    name: 'Standard Points',
    multiplier: 1,
    maxDaily: 600,
    description: 'Up to 600 points daily per staff member (3,000 max group surge)',
    tagColor: 'bg-slate-100 text-slate-800 border-slate-200',
  },
  5: {
    phase: 2,
    name: '2× Double Points',
    multiplier: 2,
    maxDaily: 1200,
    description: 'Base points doubled! Up to 1,200 points per staff member (6,000 max group surge)',
    tagColor: 'bg-amber-100 text-amber-900 border-amber-300',
  },
  6: {
    phase: 2,
    name: '2× Double Points',
    multiplier: 2,
    maxDaily: 1200,
    description: 'Base points doubled! Up to 1,200 points per staff member (6,000 max group surge)',
    tagColor: 'bg-amber-100 text-amber-900 border-amber-300',
  },
  7: {
    phase: 2,
    name: '2× Double Points',
    multiplier: 2,
    maxDaily: 1200,
    description: 'Base points doubled! Up to 1,200 points per staff member (6,000 max group surge)',
    tagColor: 'bg-amber-100 text-amber-900 border-amber-300',
  },
  8: {
    phase: 3,
    name: '4× Super Multiplier',
    multiplier: 4,
    maxDaily: 2400,
    description: 'Base points quadrupled! Up to 2,400 points per staff member (12,000 max group surge)',
    tagColor: 'bg-emerald-100 text-emerald-900 border-emerald-300',
  },
  9: {
    phase: 3,
    name: '4× Super Multiplier',
    multiplier: 4,
    maxDaily: 2400,
    description: 'Base points quadrupled! Up to 2,400 points per staff member (12,000 max group surge)',
    tagColor: 'bg-emerald-100 text-emerald-900 border-emerald-300',
  },
  10: {
    phase: 3,
    name: '4× Grand Finale Super Multiplier',
    multiplier: 4,
    maxDaily: 2400,
    description: 'Final championship booster! High stakes podium battle up to 2,400 points',
    tagColor: 'bg-emerald-100 text-emerald-900 border-emerald-300',
  },
};

export function getMultiplierForDay(day: number): MultiplierPhaseInfo {
  return MULTIPLIER_PHASES[day] || MULTIPLIER_PHASES[1];
}

export const QUESTION_BANK: Record<number, Question[]> = {
  // Day 1 from Google Sheet screenshot
  1: [
    {
      id: 'd1_q1',
      question: 'What is the capital of France?',
      options: ['London', 'Paris', 'Rome', 'Berlin'],
      correctAnswer: 'Paris',
    },
    {
      id: 'd1_q2',
      question: 'Which is the largest planet in our solar system?',
      options: ['Earth', 'Mars', 'Jupiter', 'Saturn'],
      correctAnswer: 'Jupiter',
    },
    {
      id: 'd1_q3',
      question: 'What is the chemical symbol for gold?',
      options: ['Ag', 'Au', 'Fe', 'Cu'],
      correctAnswer: 'Au',
    },
    {
      id: 'd1_q4',
      question: 'Which planet is known as the Red Planet?',
      options: ['Venus', 'Mars', 'Mercury', 'Neptune'],
      correctAnswer: 'Mars',
    },
    {
      id: 'd1_q5',
      question: 'What is the largest ocean on Earth?',
      options: ['Atlantic Ocean', 'Indian Ocean', 'Arctic Ocean', 'Pacific Ocean'],
      correctAnswer: 'Pacific Ocean',
    },
    {
      id: 'd1_q6',
      question: 'How many continents are there?',
      options: ['5', '6', '7', '8'],
      correctAnswer: '7',
    },
    {
      id: 'd1_q7',
      question: 'Which is the smallest continent?',
      options: ['Europe', 'Australia', 'South America', 'Antarctica'],
      correctAnswer: 'Australia',
    },
    {
      id: 'd1_q8',
      question: 'What is the capital of Japan?',
      options: ['Beijing', 'Tokyo', 'Seoul', 'Bangkok'],
      correctAnswer: 'Tokyo',
    },
    {
      id: 'd1_q9',
      question: 'Which gas do plants absorb during photosynthesis?',
      options: ['Oxygen', 'Nitrogen', 'Carbon dioxide', 'Hydrogen'],
      correctAnswer: 'Carbon dioxide',
    },
    {
      id: 'd1_q10',
      question: 'What is the national animal of India?',
      options: ['Lion', 'Bengal tiger', 'Elephant', 'Leopard'],
      correctAnswer: 'Bengal tiger',
    },
  ],

  2: [
    {
      id: 'd2_q1',
      question: 'What is the maximum speed limit in depot zones according to Standard Operating Procedure?',
      options: ['10 km/h', '15 km/h', '25 km/h', '30 km/h'],
      correctAnswer: '15 km/h',
    },
    {
      id: 'd2_q2',
      question: 'What should an operator inspect first during the pre-departure vehicle checklist?',
      options: ['Interior lights', 'Braking & emergency sander systems', 'Air conditioning', 'Ticket validator'],
      correctAnswer: 'Braking & emergency sander systems',
    },
    {
      id: 'd2_q3',
      question: 'What is the primary function of pantograph contact strips?',
      options: ['Track alignment', 'Electrical power transfer from catenary', 'Mechanical braking', 'Horn sound amplifier'],
      correctAnswer: 'Electrical power transfer from catenary',
    },
    {
      id: 'd2_q4',
      question: 'What is the boiling point of water at sea level?',
      options: ['90°C', '95°C', '100°C', '110°C'],
      correctAnswer: '100°C',
    },
    {
      id: 'd2_q5',
      question: 'Which organ in the human body pumps blood?',
      options: ['Lungs', 'Brain', 'Heart', 'Liver'],
      correctAnswer: 'Heart',
    },
    {
      id: 'd2_q6',
      question: 'Who painted the Mona Lisa?',
      options: ['Vincent van Gogh', 'Pablo Picasso', 'Leonardo da Vinci', 'Claude Monet'],
      correctAnswer: 'Leonardo da Vinci',
    },
    {
      id: 'd2_q7',
      question: "What does 'SOP' stand for in operations?",
      options: ['Standard Operating Procedure', 'System Operational Process', 'Safety Order Protocol', 'Shift Operating Program'],
      correctAnswer: 'Standard Operating Procedure',
    },
    {
      id: 'd2_q8',
      question: 'How many degrees are in a full circle?',
      options: ['180°', '270°', '360°', '400°'],
      correctAnswer: '360°',
    },
    {
      id: 'd2_q9',
      question: 'Which metal is liquid at room temperature?',
      options: ['Lead', 'Mercury', 'Tin', 'Copper'],
      correctAnswer: 'Mercury',
    },
    {
      id: 'd2_q10',
      question: 'What is the standard railway track gauge width in millimeters?',
      options: ['1000 mm', '1435 mm', '1520 mm', '1676 mm'],
      correctAnswer: '1435 mm',
    },
  ],

  3: [
    {
      id: 'd3_q1',
      question: 'When approaching a road junction with amber signaling, what is the required SOP action?',
      options: ['Accelerate through', 'Prepare to stop safely before the stop line', 'Sound horn continuously', 'Disable regenerative brake'],
      correctAnswer: 'Prepare to stop safely before the stop line',
    },
    {
      id: 'd3_q2',
      question: 'What is the currency of the United Kingdom?',
      options: ['Euro', 'Pound Sterling', 'Dollar', 'Franc'],
      correctAnswer: 'Pound Sterling',
    },
    {
      id: 'd3_q3',
      question: 'Which instrument is used to measure atmospheric pressure?',
      options: ['Thermometer', 'Barometer', 'Anemometer', 'Hygrometer'],
      correctAnswer: 'Barometer',
    },
    {
      id: 'd3_q4',
      question: 'In transit communications, what word signifies immediate life safety distress?',
      options: ['Pan-Pan', 'Mayday', 'Security', 'Code Blue'],
      correctAnswer: 'Mayday',
    },
    {
      id: 'd3_q5',
      question: 'What is the hardest natural substance on Earth?',
      options: ['Granite', 'Titanium', 'Diamond', 'Quartz'],
      correctAnswer: 'Diamond',
    },
    {
      id: 'd3_q6',
      question: 'How many players are on a standard football (soccer) team on the pitch?',
      options: ['9', '10', '11', '12'],
      correctAnswer: '11',
    },
    {
      id: 'd3_q7',
      question: "What is the primary constituent gas of Earth's atmosphere?",
      options: ['Oxygen', 'Nitrogen', 'Carbon dioxide', 'Argon'],
      correctAnswer: 'Nitrogen',
    },
    {
      id: 'd3_q8',
      question: 'What is the standard procedure if passenger door sensors detect an obstruction?',
      options: ['Force doors closed', 'Re-open doors automatically and inspect visually', 'Depart immediately', 'Power cycle cab'],
      correctAnswer: 'Re-open doors automatically and inspect visually',
    },
    {
      id: 'd3_q9',
      question: 'What is the speed of light approximately?',
      options: ['300,000 km/s', '150,000 km/s', '30,000 km/s', '3,000 km/s'],
      correctAnswer: '300,000 km/s',
    },
    {
      id: 'd3_q10',
      question: 'Which country is home to the Great Barrier Reef?',
      options: ['Brazil', 'Australia', 'Indonesia', 'South Africa'],
      correctAnswer: 'Australia',
    },
  ],

  4: [
    {
      id: 'd4_q1',
      question: 'Under Phase 1 scoring rules (Days 1-4), what is the active daily point multiplier?',
      options: ['0.5x', '1x Standard', '2x Double', '4x Super'],
      correctAnswer: '1x Standard',
    },
    {
      id: 'd4_q2',
      question: 'What is the participation baseline bonus awarded automatically just for taking the quiz?',
      options: ['50 points', '100 points', '200 points', '500 points'],
      correctAnswer: '100 points',
    },
    {
      id: 'd4_q3',
      question: 'How many members make up each operational group team?',
      options: ['3 members', '5 members', '8 members', '10 members'],
      correctAnswer: '5 members',
    },
    {
      id: 'd4_q4',
      question: 'What is the maximum daily score achievable per staff member in Days 1 to 4?',
      options: ['300 points', '500 points', '600 points', '1,200 points'],
      correctAnswer: '600 points',
    },
    {
      id: 'd4_q5',
      question: 'Which planet is closest to the Sun?',
      options: ['Venus', 'Mercury', 'Earth', 'Mars'],
      correctAnswer: 'Mercury',
    },
    {
      id: 'd4_q6',
      question: 'What does CCTV stand for in station security?',
      options: ['Central Cable Transit Video', 'Closed-Circuit Television', 'Continuous Camera Track Visual', 'Control Center Terminal View'],
      correctAnswer: 'Closed-Circuit Television',
    },
    {
      id: 'd4_q7',
      question: 'What is the chemical formula for common table salt?',
      options: ['NaCl', 'KCl', 'CaCl2', 'Na2SO4'],
      correctAnswer: 'NaCl',
    },
    {
      id: 'd4_q8',
      question: 'In customer service standard protocol, what is recommended during unexpected delays?',
      options: ['Wait 30 minutes', 'Provide calm, clear updates every 2-3 minutes', 'Never announce delays', 'Advise passengers to walk'],
      correctAnswer: 'Provide calm, clear updates every 2-3 minutes',
    },
    {
      id: 'd4_q9',
      question: 'What is the primary color obtained by mixing blue and yellow pigments?',
      options: ['Purple', 'Green', 'Orange', 'Brown'],
      correctAnswer: 'Green',
    },
    {
      id: 'd4_q10',
      question: 'How many seconds are in one hour?',
      options: ['1,800', '3,600', '7,200', '60,000'],
      correctAnswer: '3,600',
    },
  ],

  5: [
    {
      id: 'd5_q1',
      question: 'Phase 2 begins today on Day 5! What is the active daily multiplier?',
      options: ['1x', '2x Double Multiplier', '3x Triple', '4x Super'],
      correctAnswer: '2x Double Multiplier',
    },
    {
      id: 'd5_q2',
      question: 'With the 2x multiplier active, what is the maximum points a staff member can earn today?',
      options: ['600 points', '1,000 points', '1,200 points', '2,400 points'],
      correctAnswer: '1,200 points',
    },
    {
      id: 'd5_q3',
      question: 'What is the maximum daily team surge a group of 5 can score during Phase 2?',
      options: ['3,000 points', '5,000 points', '6,000 points', '12,000 points'],
      correctAnswer: '6,000 points',
    },
    {
      id: 'd5_q4',
      question: 'What is the recommended braking technique on wet or leaf-fall rails?',
      options: ['Harsh emergency lockup', 'Early, progressive service braking with sanding', 'Accelerate through slip', 'Coast without brakes'],
      correctAnswer: 'Early, progressive service braking with sanding',
    },
    {
      id: 'd5_q5',
      question: 'Which mountain is the tallest above sea level in the world?',
      options: ['K2', 'Mount Kilimanjaro', 'Mount Everest', 'Matterhorn'],
      correctAnswer: 'Mount Everest',
    },
    {
      id: 'd5_q6',
      question: 'What is the term for a group of lions?',
      options: ['Pack', 'Herd', 'Pride', 'Flock'],
      correctAnswer: 'Pride',
    },
    {
      id: 'd5_q7',
      question: 'Which component converts alternating current (AC) to direct current (DC)?',
      options: ['Transformer', 'Inverter', 'Rectifier', 'Capacitor'],
      correctAnswer: 'Rectifier',
    },
    {
      id: 'd5_q8',
      question: 'What is the official daily deadline by which shift staff must complete their quiz?',
      options: ['18:00', '20:00', '22:00', '23:59'],
      correctAnswer: '23:59',
    },
    {
      id: 'd5_q9',
      question: 'Who developed the theory of general relativity?',
      options: ['Isaac Newton', 'Albert Einstein', 'Nikola Tesla', 'Niels Bohr'],
      correctAnswer: 'Albert Einstein',
    },
    {
      id: 'd5_q10',
      question: 'What does AED stand for in emergency first aid kits?',
      options: ['Automated External Defibrillator', 'Advanced Emergency Detector', 'Auxiliary Electrical Device', 'Airway Extraction Duct'],
      correctAnswer: 'Automated External Defibrillator',
    },
  ],

  6: [
    {
      id: 'd6_q1',
      question: "What is the main purpose of an operator's vigilance device (deadman's control)?",
      options: ['Measure operator weight', 'Verify operator alertness and automatically brake if unresponsive', 'Adjust cab seat height', 'Tune transit radio'],
      correctAnswer: 'Verify operator alertness and automatically brake if unresponsive',
    },
    {
      id: 'd6_q2',
      question: 'Which sea borders Egypt to the east?',
      options: ['Black Sea', 'Red Sea', 'Baltic Sea', 'Caspian Sea'],
      correctAnswer: 'Red Sea',
    },
    {
      id: 'd6_q3',
      question: 'In team dynamics, why does full participation beat spotty individual brilliance?',
      options: ['No bonus exists', '100-pt show-up baseline across 5 staff lifts the whole group score', 'Only the captain gets points', 'Scores are divided'],
      correctAnswer: '100-pt show-up baseline across 5 staff lifts the whole group score',
    },
    {
      id: 'd6_q4',
      question: 'What is the square root of 144?',
      options: ['10', '11', '12', '14'],
      correctAnswer: '12',
    },
    {
      id: 'd6_q5',
      question: 'What is the primary function of track switches (turnouts)?',
      options: ['Measure rail temperature', 'Guide rolling stock from one track to another', 'Clean wheel flanges', 'Supply catenary voltage'],
      correctAnswer: 'Guide rolling stock from one track to another',
    },
    {
      id: 'd6_q6',
      question: 'Which gas gives soda drinks their characteristic carbonation?',
      options: ['Oxygen', 'Carbon dioxide', 'Nitrous oxide', 'Helium'],
      correctAnswer: 'Carbon dioxide',
    },
    {
      id: 'd6_q7',
      question: 'Which continent has the most countries?',
      options: ['Asia', 'Africa', 'Europe', 'South America'],
      correctAnswer: 'Africa',
    },
    {
      id: 'd6_q8',
      question: 'In safety regulations, what does PPE stand for?',
      options: ['Public Protection Equipment', 'Personal Protective Equipment', 'Preventive Power Enclosure', 'Primary Phase Earth'],
      correctAnswer: 'Personal Protective Equipment',
    },
    {
      id: 'd6_q9',
      question: 'What is the SI unit of electric resistance?',
      options: ['Volt', 'Ampere', 'Ohm', 'Watt'],
      correctAnswer: 'Ohm',
    },
    {
      id: 'd6_q10',
      question: 'What is the mandatory action upon encountering an amber aspect on a route signal?',
      options: ['Accelerate', 'Prepare to stop at next signal or marker', 'Reverse vehicle', 'Sound emergency horn'],
      correctAnswer: 'Prepare to stop at next signal or marker',
    },
  ],

  7: [
    {
      id: 'd7_q1',
      question: 'Today is Day 7: final day of Phase 2! What is the base bonus per correct answer before multiplier?',
      options: ['50 points', '100 points', '200 points', '500 points'],
      correctAnswer: '100 points',
    },
    {
      id: 'd7_q2',
      question: 'With 2x multiplier, how many points do 5 correct answers yield today (excluding baseline)?',
      options: ['500 points', '800 points', '1,000 points', '1,200 points'],
      correctAnswer: '1,000 points',
    },
    {
      id: 'd7_q3',
      question: 'Which river is the longest river in South America?',
      options: ['Nile', 'Amazon River', 'Paraná', 'Orinoco'],
      correctAnswer: 'Amazon River',
    },
    {
      id: 'd7_q4',
      question: 'In transit SOP guidelines, who must be immediately informed in the event of track trespassing?',
      options: ['Ticket vendor', 'Operations Control Center (OCC)', 'Cleaning crew', 'Local media'],
      correctAnswer: 'Operations Control Center (OCC)',
    },
    {
      id: 'd7_q5',
      question: 'What is the capital of Canada?',
      options: ['Toronto', 'Vancouver', 'Ottawa', 'Montreal'],
      correctAnswer: 'Ottawa',
    },
    {
      id: 'd7_q6',
      question: 'How many bones are in the adult human body?',
      options: ['196', '206', '216', '226'],
      correctAnswer: '206',
    },
    {
      id: 'd7_q7',
      question: 'What type of fire extinguisher should NEVER be used on electrical equipment fires?',
      options: ['CO2 extinguisher', 'Dry Chemical Powder', 'Water extinguisher', 'Clean Agent'],
      correctAnswer: 'Water extinguisher',
    },
    {
      id: 'd7_q8',
      question: 'Which country gifted the Statue of Liberty to the United States?',
      options: ['United Kingdom', 'France', 'Spain', 'Germany'],
      correctAnswer: 'France',
    },
    {
      id: 'd7_q9',
      question: 'What is the term for tramways sharing right-of-way with street vehicles without physical segregation?',
      options: ['Segregated Alignment', 'Street Running / Mixed Traffic', 'Grade Separation', 'Dedicated Corridor'],
      correctAnswer: 'Street Running / Mixed Traffic',
    },
    {
      id: 'd7_q10',
      question: "Which chemical element has the symbol 'Fe'?",
      options: ['Fluorine', 'Iron', 'Francium', 'Lead'],
      correctAnswer: 'Iron',
    },
  ],

  8: [
    {
      id: 'd8_q1',
      question: 'Phase 3 begins! What is the active Super Multiplier for Days 8 to 10?',
      options: ['2x', '3x', '4x Super Multiplier', '5x Mega'],
      correctAnswer: '4x Super Multiplier',
    },
    {
      id: 'd8_q2',
      question: 'With 4x multiplier active, what is the maximum score a single staff member can win today?',
      options: ['600 points', '1,200 points', '1,800 points', '2,400 points'],
      correctAnswer: '2,400 points',
    },
    {
      id: 'd8_q3',
      question: 'What is the maximum team surge points an entire group of 5 can earn in one day in Phase 3?',
      options: ['3,000 points', '6,000 points', '10,000 points', '12,000 points'],
      correctAnswer: '12,000 points',
    },
    {
      id: 'd8_q4',
      question: 'What is the capital of Germany?',
      options: ['Munich', 'Frankfurt', 'Berlin', 'Hamburg'],
      correctAnswer: 'Berlin',
    },
    {
      id: 'd8_q5',
      question: "What is the primary function of a tram's magnetic track brake?",
      options: ['Parking brake', 'High-deceleration emergency stopping directly on rail head', 'Wheel polishing', 'Energy recovery'],
      correctAnswer: 'High-deceleration emergency stopping directly on rail head',
    },
    {
      id: 'd8_q6',
      question: 'Which planet in our solar system has prominent rings visible through amateur telescopes?',
      options: ['Mars', 'Saturn', 'Mercury', 'Venus'],
      correctAnswer: 'Saturn',
    },
    {
      id: 'd8_q7',
      question: 'What is typical normal human body temperature in Celsius?',
      options: ['35.0°C', '37.0°C', '39.5°C', '40.0°C'],
      correctAnswer: '37.0°C',
    },
    {
      id: 'd8_q8',
      question: "In transit radio protocol, what does the expression 'ROGER' signify?",
      options: ['I disagree', 'Message received and understood', 'Repeat transmission', 'End of shift'],
      correctAnswer: 'Message received and understood',
    },
    {
      id: 'd8_q9',
      question: 'What is the largest living mammal on Earth?',
      options: ['African Elephant', 'Blue Whale', 'Giraffe', 'Hippopotamus'],
      correctAnswer: 'Blue Whale',
    },
    {
      id: 'd8_q10',
      question: 'How many days are in a leap year?',
      options: ['364', '365', '366', '367'],
      correctAnswer: '366',
    },
  ],

  9: [
    {
      id: 'd9_q1',
      question: 'In Phase 3 (4x Multiplier), what is the value of the 100-point base participation bonus?',
      options: ['100 points', '200 points', '400 points', '800 points'],
      correctAnswer: '400 points',
    },
    {
      id: 'd9_q2',
      question: 'What is the capital city of Australia?',
      options: ['Sydney', 'Melbourne', 'Canberra', 'Brisbane'],
      correctAnswer: 'Canberra',
    },
    {
      id: 'd9_q3',
      question: 'Under low visibility / dense fog SOP, what is the mandatory driving precaution?',
      options: ['Maintain top speed', 'Reduce speed, engage low beams, and increase headway spacing', 'Overtake other trams', 'Switch off cab radio'],
      correctAnswer: 'Reduce speed, engage low beams, and increase headway spacing',
    },
    {
      id: 'd9_q4',
      question: 'Which scientist discovered penicillin in 1928?',
      options: ['Alexander Fleming', 'Louis Pasteur', 'Marie Curie', 'Robert Koch'],
      correctAnswer: 'Alexander Fleming',
    },
    {
      id: 'd9_q5',
      question: 'What is the perimeter of a rectangular workshop with length 10m and width 5m?',
      options: ['15m', '30m', '50m', '100m'],
      correctAnswer: '30m',
    },
    {
      id: 'd9_q6',
      question: 'What is the primary source of natural light and energy for the Earth?',
      options: ['The Moon', 'The Sun', 'Geothermal vents', 'Atmospheric Aurora'],
      correctAnswer: 'The Sun',
    },
    {
      id: 'd9_q7',
      question: 'Which color is universally designated for caution and warning signs in transportation?',
      options: ['Green', 'Amber / Yellow', 'Blue', 'White'],
      correctAnswer: 'Amber / Yellow',
    },
    {
      id: 'd9_q8',
      question: 'What does HVAC stand for in transit vehicle maintenance?',
      options: ['Heating, Ventilation, and Air Conditioning', 'High Voltage Auxiliary Circuit', 'Heavy Vehicle Access Control', 'Hydraulic Valve Actuator Component'],
      correctAnswer: 'Heating, Ventilation, and Air Conditioning',
    },
    {
      id: 'd9_q9',
      question: 'Which ocean separates North America from Europe?',
      options: ['Pacific Ocean', 'Atlantic Ocean', 'Arctic Ocean', 'Indian Ocean'],
      correctAnswer: 'Atlantic Ocean',
    },
    {
      id: 'd9_q10',
      question: 'In the group standings, how is the total team score calculated?',
      options: ['Highest individual score only', 'Sum of all 5 team members total scores', 'Average divided by 10', 'Only supervisor score'],
      correctAnswer: 'Sum of all 5 team members total scores',
    },
  ],

  10: [
    {
      id: 'd10_q1',
      question: 'Grand Finale Day 10! What is the final daily multiplier active today?',
      options: ['1x', '2x', '4x Super Multiplier', '10x'],
      correctAnswer: '4x Super Multiplier',
    },
    {
      id: 'd10_q2',
      question: 'Across all 10 days of the challenge, what is the maximum theoretical score a perfect staff member can achieve?',
      options: ['6,000 points', '9,600 points', '15,600 points', '24,000 points'],
      correctAnswer: '15,600 points',
    },
    {
      id: 'd10_q3',
      question: 'What is the capital city of Spain?',
      options: ['Barcelona', 'Madrid', 'Seville', 'Valencia'],
      correctAnswer: 'Madrid',
    },
    {
      id: 'd10_q4',
      question: 'When are the final group and individual standings confirmed according to the operational schedule?',
      options: ['At the Day 10 operations debrief', 'Next month', 'Never', 'During morning inspection'],
      correctAnswer: 'At the Day 10 operations debrief',
    },
    {
      id: 'd10_q5',
      question: 'What is the chemical symbol for Silver?',
      options: ['Si', 'Ag', 'Au', 'Sn'],
      correctAnswer: 'Ag',
    },
    {
      id: 'd10_q6',
      question: 'What is the primary role of the onboard passenger emergency intercom?',
      options: ['Order cafeteria snacks', 'Allow passengers to alert staff immediately of onboard emergency', 'Play cabin music', 'Inquire about ticket fares'],
      correctAnswer: 'Allow passengers to alert staff immediately of onboard emergency',
    },
    {
      id: 'd10_q7',
      question: 'Which planet is fourth from the Sun in our solar system?',
      options: ['Venus', 'Earth', 'Mars', 'Jupiter'],
      correctAnswer: 'Mars',
    },
    {
      id: 'd10_q8',
      question: 'What is 15 multiplied by 8?',
      options: ['100', '110', '120', '130'],
      correctAnswer: '120',
    },
    {
      id: 'd10_q9',
      question: 'In operational group dynamics, why is no team out of contention until Day 10 finishes?',
      options: ['Ties are impossible', 'The 4x Super Multiplier creates massive group surges of up to 12,000 pts daily', 'Scores reset every day', 'Teams are reshuffled'],
      correctAnswer: 'The 4x Super Multiplier creates massive group surges of up to 12,000 pts daily',
    },
    {
      id: 'd10_q10',
      question: 'What is the primary operational mission of the 10-Day Quiz Challenge?',
      options: ['Speed over safety', '10 Days of Continuous Learning & Operational Excellence', 'Compete without teamwork', 'Individual rankings only'],
      correctAnswer: '10 Days of Continuous Learning & Operational Excellence',
    },
  ],
};

/**
 * Returns 5 random distinct questions for a given day
 */
export function getRandomDailyQuestions(day: number): Question[] {
  const pool = QUESTION_BANK[day] || QUESTION_BANK[1];
  const shuffled = [...pool];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled.slice(0, 5);
}
