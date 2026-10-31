// =====================================================================
// MATH RACE – CLASS 12 APTITUDE QUESTION BANK
// 120 questions · 12 topics · 10 per topic (3 Warm-up, 5 Normal, 2 Challenge = 30% / 50% / 20%)
//
// Row format: [question, verification expression, [3 wrong options], optional display of the correct option,
//              optional explanation]
// * The correct answer is COMPUTED from the expression, then re-checked by validateBank() (server start + `npm run validate`).
// * If no explanation is given, one is generated from the expression ("Working: 150 × 20/100 = 30").
// * Explanations and answers are only ever sent to players AFTER they answer or the timer expires.
// =====================================================================

const W = 'Warm-up', N = 'Normal', C = 'Challenge';

const SECTIONS = [
  ['Percentages', '%', [
    [W, 'What is 20% of 150?', '150*20/100', ['15', '20', '45']],
    [W, 'What is 3/4 expressed as a percentage?', '3/4*100', ['34%', '70%', '80%'], '75%'],
    [W, 'A shirt costs ₹500 with a 10% discount. What is the discount?', '500*10/100', ['₹5', '₹10', '₹450'], '₹50'],
    [N, 'What is 35% of 240?', '240*35/100', ['72', '90', '78']],
    [N, 'Riya scored 72 out of 90. What is her percentage?', '72/90*100', ['70%', '75%', '82%'], '80%'],
    [N, 'A ₹800 bag has a 15% discount. What is the sale price?', '800*0.85', ['₹120', '₹720', '₹785'], '₹680'],
    [N, 'A price rises from ₹200 to ₹250. What is the percentage increase?', '(250-200)/200*100', ['20%', '50%', '30%'], '25%'],
    [N, 'In a class of 40 students, 60% are girls. How many boys are there?', '40-40*60/100', ['24', '20', '12']],
    [C, 'A number increased by 20% becomes 360. What is the number?', '360/1.2', ['288', '432', '320']],
    [C, 'A price rises by 25% and then falls by 20%. What is the net change?', '(1.25*0.8-1)*100', ['5%', '−5%', '20%'], '0%', 'Price × 1.25 × 0.8 = price × 1, so there is no net change.'],
  ]],
  ['Profit & Loss', '₹', [
    [W, 'An item bought for ₹80 is sold for ₹100. What is the profit?', '100-80', ['₹10', '₹25', '₹180'], '₹20'],
    [W, 'A pen costs ₹40 and is sold for ₹35. What is the loss?', '40-35', ['₹10', '₹75', '₹35'], '₹5'],
    [W, 'Cost price is ₹120 and profit is ₹30. What is the selling price?', '120+30', ['₹90', '₹180', '₹140'], '₹150'],
    [N, 'Cost price ₹400, selling price ₹500. What is the profit percent?', '(500-400)/400*100', ['20%', '15%', '100%'], '25%'],
    [N, 'A bike costing ₹2000 is sold at a 20% loss. What is the selling price?', '2000*0.8', ['₹400', '₹2400', '₹1800'], '₹1600'],
    [N, 'An article is sold for ₹660 at a 10% profit. What is its cost price?', '660/1.1', ['₹594', '₹726', '₹650'], '₹600'],
    [N, 'A shopkeeper buys 10 pens at ₹12 each and sells all at ₹15 each. Total profit?', '10*(15-12)', ['₹3', '₹120', '₹150'], '₹30'],
    [N, 'A phone marked ₹10000 is sold at 15% off. What is the selling price?', '10000*0.85', ['₹1500', '₹9000', '₹9500'], '₹8500'],
    [C, 'Two items sell at ₹990 each: one at 10% profit, one at 10% loss. Overall result?', '(990/1.1+990/0.9)-990*2', ['Loss of ₹40', 'Profit of ₹10', 'No gain, no loss'], 'Loss of ₹20', 'Cost prices are ₹900 and ₹1100 = ₹2000, but sales total ₹1980, so the loss is ₹20.'],
    [C, 'A ₹500 item is sold after a 20% discount at a 25% profit. What is its cost price?', '500*0.8/1.25', ['₹300', '₹350', '₹375'], '₹320'],
  ]],
  ['Ratio & Proportion', '⚖️', [
    [W, 'Simplify the ratio 10:20.', '10/20', ['2:1', '1:10', '1:4'], '1:2'],
    [W, 'If 2 pens cost ₹10, what do 6 pens cost?', '10/2*6', ['₹20', '₹40', '₹12'], '₹30'],
    [W, 'Boys to girls is 1:2. If there are 5 boys, how many girls are there?', '5*2', ['3', '7', '15']],
    [N, 'Divide ₹120 in the ratio 3:5. What is the larger share?', '120*5/8', ['₹45', '₹60', '₹72'], '₹75'],
    [N, 'Boys to girls is 4:5. With 20 boys, how many girls are there?', '20*5/4', ['16', '24', '30']],
    [N, 'A car travels 150 km in 3 hours. How far in 5 hours at the same speed?', '150/3*5', ['200 km', '300 km', '450 km'], '250 km'],
    [N, 'Flour and sugar are in the ratio 5:2. With 350 g of flour, how many grams of sugar?', '350*2/5', ['100', '175', '700']],
    [N, '8 workers finish a job in 6 days. How many days will 12 workers take?', '8*6/12', ['3', '8', '9'], '4', 'Total work = 8 × 6 = 48 worker-days, so 12 workers need 48/12 = 4 days.'],
    [C, 'If a:b = 2:3 and b:c = 4:5, what is a:c?', '(2/3)*(4/5)', ['2:5', '3:4', '8:12'], '8:15', 'a/c = (a/b) × (b/c) = 2/3 × 4/5 = 8/15, so a:c = 8:15.'],
    [C, 'Two ages are in the ratio 3:5 and add up to 64. What is their difference?', '64/8*2', ['8', '24', '32'], '16', 'Each part = 64/8 = 8, and the difference is 2 parts = 16.'],
  ]],
  ['Averages', '📊', [
    [W, 'Find the average of 10, 20 and 30.', '(10+20+30)/3', ['15', '25', '60']],
    [W, 'What is the average of 4 and 8?', '(4+8)/2', ['5', '7', '12']],
    [W, 'Find the average of 5, 7, 9 and 11.', '(5+7+9+11)/4', ['7', '9', '32']],
    [N, 'A batter scored 40, 55 and 70 in three innings. What is the average score?', '(40+55+70)/3', ['50', '60', '165']],
    [N, 'The average of five numbers is 20. What is their sum?', '5*20', ['25', '80', '120']],
    [N, 'Marks in 4 tests: 70, 80, 90, 60. What mark in a 5th test gives an average of 78?', '78*5-(70+80+90+60)', ['88', '80', '85']],
    [N, 'The average age of 4 children is 9. A child aged 14 joins. What is the new average?', '(4*9+14)/5', ['11', '9.5', '12']],
    [N, 'The average of 6 numbers is 15. The number 20 is removed. What is the average of the other 5?', '(6*15-20)/5', ['13', '15', '16']],
    [C, 'The average of three numbers is 12. If two of them are 8 and 14, what is the third?', '3*12-8-14', ['12', '10', '16']],
    [C, 'The average of 5 numbers is 18. The average of 3 of them is 16. What is the average of the other two?', '(5*18-3*16)/2', ['19', '20', '22']],
  ]],
  ['Number Series', '🔢', [
    [W, 'Complete the series: 2, 4, 6, 8, __', '8+2', ['9', '12', '14'], '10', 'The series adds 2 each time: 8 + 2 = 10.'],
    [W, 'What comes next? 5, 10, 15, 20, __', '20+5', ['22', '30', '35'], '25', 'Add 5 each time: 20 + 5 = 25.'],
    [W, 'What comes next? 1, 4, 9, 16, __', '5**2', ['20', '36', '24'], '25', 'These are square numbers: 1², 2², 3², 4², so next is 5² = 25.'],
    [N, 'What comes next? 3, 6, 12, 24, __', '24*2', ['36', '30', '42'], '48', 'Each number doubles: 24 × 2 = 48.'],
    [N, 'What comes next? 2, 5, 10, 17, 26, __', '26+11', ['36', '35', '38'], '37', 'The gaps are 3, 5, 7, 9, 11, so next is 26 + 11 = 37.'],
    [N, 'What comes next? 1, 1, 2, 3, 5, 8, __', '5+8', ['11', '12', '15'], '13', 'Each term is the sum of the previous two (Fibonacci): 5 + 8 = 13.'],
    [N, 'What comes next? 81, 27, 9, 3, __', '3/3', ['0', '2', '6'], '1', 'Divide by 3 each time: 3 ÷ 3 = 1.'],
    [N, 'What comes next? 100, 91, 82, 73, __', '73-9', ['63', '65', '66'], '64', 'Subtract 9 each time: 73 − 9 = 64.'],
    [C, 'What comes next? 2, 6, 12, 20, 30, __', '30+12', ['40', '44', '36'], '42', 'The gaps are 4, 6, 8, 10, 12, so next is 30 + 12 = 42.'],
    [C, 'What comes next? 1, 3, 7, 15, 31, __', '31*2+1', ['62', '65', '47'], '63', 'Double and add 1: 31 × 2 + 1 = 63.'],
  ]],
  ['Simple Algebra', 'x', [
    [W, 'If x + 5 = 12, find x.', '12-5', ['6', '8', '17']],
    [W, 'If 3x = 27, find x.', '27/3', ['8', '24', '81']],
    [W, 'If x − 7 = 15, find x.', '15+7', ['8', '21', '23']],
    [N, 'Solve: 3x − 5 = 22', '(22+5)/3', ['7', '8', '27']],
    [N, 'Solve: 5x + 3 = 38', '(38-3)/5', ['6', '8', '35']],
    [N, 'If x = 4, what is 2x² − 3x?', '2*4**2-3*4', ['14', '26', '8']],
    [N, 'Solve: 4(x − 2) = 20', '20/4+2', ['3', '5', '12']],
    [N, 'If 2x + 3x = 45, what is x?', '45/5', ['5', '15', '11']],
    [C, 'If x + y = 10 and x − y = 4, what is x × y?', '((10+4)/2)*((10-4)/2)', ['24', '40', '28'], '21', 'Adding gives x = 7 and then y = 3, so x × y = 21.'],
    [C, 'If x² − y² = 45 and x − y = 5, what is x + y?', '45/5', ['8', '10', '11'], '9', 'x² − y² = (x − y)(x + y), so x + y = 45/5 = 9.'],
  ]],
  ['Squares & Roots', '√', [
    [W, 'What is the square root of 144?', 'Math.sqrt(144)', ['14', '11', '72']],
    [W, 'What is 9²?', '9**2', ['72', '91', '18']],
    [W, 'What is 12²?', '12**2', ['124', '132', '142']],
    [N, 'What is 15²?', '15**2', ['125', '215', '250']],
    [N, 'What is √196?', 'Math.sqrt(196)', ['16', '13', '18']],
    [N, 'What is 12² + 5²?', '12**2+5**2', ['119', '149', '289']],
    [N, 'A square has an area of 144 cm². What is its perimeter?', '4*Math.sqrt(144)', ['36 cm', '24 cm', '96 cm'], '48 cm', 'Side = √144 = 12 cm, so perimeter = 4 × 12 = 48 cm.'],
    [N, 'Which of these numbers is a perfect square?', '64', ['50', '80', '90'], '64', '8 × 8 = 64, so 64 is a perfect square.'],
    [C, 'What is the value of √(25 × 36)?', 'Math.sqrt(25*36)', ['15', '60', '180']],
    [C, 'A right triangle has sides 9 cm and 12 cm. What is its hypotenuse?', 'Math.sqrt(9*9+12*12)', ['21 cm', '14 cm', '18 cm'], '15 cm', 'Hypotenuse = √(9² + 12²) = √225 = 15 cm.'],
  ]],
  ['Probability', '🎲', [
    [W, 'A coin is tossed once. What is the probability of getting heads?', '1/2', ['1/4', '1', '2/3'], '1/2', 'Heads is 1 of 2 equally likely outcomes, so 1/2.'],
    [W, 'A fair die is rolled. What is the probability of getting a 6?', '1/6', ['1/3', '1/2', '1/12'], '1/6', 'One face out of 6 shows a 6, so 1/6.'],
    [W, 'A bag has 3 red and 7 blue balls. What is the probability of picking a red ball?', '3/10', ['3/7', '7/10', '1/3'], '3/10', '3 red balls out of 10 in total = 3/10.'],
    [N, 'A fair die is rolled. What is the probability of getting an even number?', '3/6', ['1/6', '1/3', '2/3'], '1/2', 'Even numbers are 2, 4 and 6: 3 out of 6 = 1/2.'],
    [N, 'A card is drawn from a pack of 52. What is the probability that it is a king?', '4/52', ['1/4', '1/26', '1/52'], '1/13', 'There are 4 kings in 52 cards: 4/52 = 1/13.'],
    [N, 'Two coins are tossed. What is the probability of two heads?', '1/4', ['1/2', '1/3', '3/4'], '1/4', 'Only HH works out of the 4 outcomes HH, HT, TH, TT.'],
    [N, 'A bag has 5 green and 5 yellow balls. What is the probability of a green ball?', '5/10', ['1/5', '2/5', '3/5'], '1/2', '5 green out of 10 balls = 1/2.'],
    [N, 'A die is rolled. What is the probability of a number greater than 4?', '2/6', ['1/6', '1/2', '2/3'], '1/3', 'Only 5 and 6 work: 2 out of 6 = 1/3.'],
    [C, 'Two dice are rolled. What is the probability that the sum is 12?', '1/36', ['1/12', '1/6', '1/18'], '1/36', 'Only (6, 6) works out of 36 outcomes.'],
    [C, 'A box has 4 red, 3 blue and 3 green balls. What is the probability of NOT picking blue?', '7/10', ['3/10', '2/5', '1/2'], '7/10', '7 of the 10 balls are not blue, so 7/10.'],
  ]],
  ['Speed & Distance', '🚗', [
    [W, 'A car travels 60 km in one hour. How far does it travel in 2 hours at the same speed?', '60*2', ['100 km', '90 km', '30 km'], '120 km'],
    [W, 'A cyclist rides at 15 km/h for 2 hours. How far does he go?', '15*2', ['17 km', '45 km', '7.5 km'], '30 km'],
    [W, 'A bus covers 100 km in 2 hours. What is its speed?', '100/2', ['25 km/h', '200 km/h', '102 km/h'], '50 km/h'],
    [N, 'A train travels 240 km in 4 hours. What is its speed?', '240/4', ['50 km/h', '80 km/h', '960 km/h'], '60 km/h'],
    [N, 'How long does a car at 40 km/h take to travel 100 km?', '100/40', ['2 hours', '3 hours', '4 hours'], '2.5 hours'],
    [N, 'A 200 m long train passes a pole in 8 seconds. What is its speed?', '200/8', ['16 m/s', '40 m/s', '50 m/s'], '25 m/s'],
    [N, 'Convert 36 km/h into m/s.', '36*1000/3600', ['3.6 m/s', '36 m/s', '100 m/s'], '10 m/s'],
    [N, 'A bus leaves at 8:50 and arrives at 10:20. How long is the trip?', '(10*60+20)-(8*60+50)', ['70 min', '80 min', '100 min'], '90 min', 'From 8:50 to 10:20 is 1 hour 30 minutes = 90 minutes.'],
    [C, 'Two cars 300 km apart drive towards each other at 60 and 40 km/h. When do they meet?', '300/(60+40)', ['2 hours', '4 hours', '5 hours'], '3 hours', 'They close 60 + 40 = 100 km every hour, so 300/100 = 3 hours.'],
    [C, 'A trip: 60 km at 30 km/h, then 60 km at 60 km/h. What is the average speed?', '120/(60/30+60/60)', ['45 km/h', '50 km/h', '35 km/h'], '40 km/h', 'Total distance 120 km, total time 2 + 1 = 3 hours, so 120/3 = 40 km/h.'],
  ]],
  ['Logical Reasoning', '🧠', [
    [W, 'A bus has 40 seats and 28 are taken. How many seats are empty?', '40-28', ['22', '18', '68']],
    [W, 'Ravi has 3 bags with 4 books in each. How many books does he have?', '3*4', ['7', '10', '14']],
    [W, 'Anu is 8 years old. Her brother is 3 years older. How old is her brother?', '8+3', ['5', '10', '12']],
    [N, 'Three consecutive numbers add up to 48. What is the largest?', '48/3+1', ['15', '16', '18'], '17', 'The middle number is 48/3 = 16, so the largest is 17.'],
    [N, 'A tank fills at 15 litres per minute. How many minutes to fill 120 litres?', '120/15', ['6', '9', '10']],
    [N, 'In a code, A = 1, B = 2, C = 3 and so on. What is the value of C + D?', '3+4', ['6', '8', '9']],
    [N, '8 friends shake hands once with each other. How many handshakes happen?', '8*7/2', ['56', '16', '64']],
    [N, 'A pizza has 8 slices. 3 friends eat 2 slices each. How many slices are left?', '8-3*2', ['3', '5', '6']],
    [C, 'A farm has hens and cows with 20 heads and 56 legs in total. How many cows are there?', '(56-2*20)/2', ['6', '10', '12'], '8', 'If all 20 were hens there would be 40 legs. The extra 16 legs mean 16/2 = 8 cows.'],
    [C, 'In a row, Priya is 7th from the left and 10th from the right. How many students are in the row?', '7+10-1', ['15', '17', '18'], '16', 'Add the two positions and subtract 1 for Priya: 7 + 10 − 1 = 16.'],
  ]],
  ['Fractions & Decimals', '½', [
    [W, 'What is 1/2 of 90?', '90/2', ['40', '50', '35']],
    [W, 'What is 0.5 + 0.25?', '0.5+0.25', ['0.7', '0.8', '0.55'], '0.75'],
    [W, 'Write 3/5 as a decimal.', '3/5', ['0.35', '0.5', '0.65'], '0.6'],
    [N, 'What is 3/4 + 1/8?', '3/4+1/8', ['4/12', '5/8', '9/8'], '7/8', '3/4 = 6/8, and 6/8 + 1/8 = 7/8.'],
    [N, 'What is 2/3 of 45?', '45*2/3', ['15', '20', '35']],
    [N, 'What is 5/6 − 1/2?', '5/6-1/2', ['1/2', '2/3', '1/6'], '1/3', '1/2 = 3/6, and 5/6 − 3/6 = 2/6 = 1/3.'],
    [N, 'What is 1/2 ÷ 1/4?', '(1/2)/(1/4)', ['1/8', '4', '1/2'], '2', 'Dividing by 1/4 means multiplying by 4: 1/2 × 4 = 2.'],
    [N, 'What is 2.5 × 4?', '2.5*4', ['8', '12', '25']],
    [C, 'What is 0.6 × 0.5?', '0.6*0.5', ['0.03', '3', '0.11'], '0.3', '6 × 5 = 30, and with two decimal places that is 0.30 = 0.3.'],
    [C, 'What is 2/3 + 3/4?', '2/3+3/4', ['5/7', '5/12', '7/12'], '17/12', 'The common denominator is 12: 8/12 + 9/12 = 17/12.'],
  ]],
  ['Geometry & Mensuration', '📐', [
    [W, 'What is the perimeter of a square with side 9 cm?', '4*9', ['18 cm', '81 cm', '27 cm'], '36 cm'],
    [W, 'What is the area of a rectangle 8 cm by 5 cm?', '8*5', ['26 cm²', '13 cm²', '45 cm²'], '40 cm²'],
    [W, 'What is the sum of the angles in a triangle?', '180', ['90°', '360°', '270°'], '180°', 'The three angles of any triangle always add up to 180°.'],
    [N, 'What is the area of a triangle with base 12 cm and height 7 cm?', '12*7/2', ['84 cm²', '19 cm²', '48 cm²'], '42 cm²'],
    [N, 'What is the circumference of a circle of radius 7 cm? (use π = 22/7)', '2*22/7*7', ['22 cm', '154 cm', '49 cm'], '44 cm'],
    [N, 'What is the volume of a cuboid 5 cm × 4 cm × 3 cm?', '5*4*3', ['12 cm³', '47 cm³', '35 cm³'], '60 cm³'],
    [N, 'What is each interior angle of a regular hexagon?', '(6-2)*180/6', ['108°', '135°', '60°'], '120°'],
    [N, 'What is the area of a circle of radius 7 cm? (use π = 22/7)', '22/7*7*7', ['44 cm²', '49 cm²', '308 cm²'], '154 cm²'],
    [C, 'A cube has a total surface area of 150 cm². What is its volume?', '(150/6)**1.5', ['25 cm³', '216 cm³', '150 cm³'], '125 cm³', 'Each face = 150/6 = 25 cm², so the side is 5 cm and the volume is 5³ = 125 cm³.'],
    [C, 'A cylinder has radius 7 cm and height 10 cm. What is its volume? (π = 22/7)', '22/7*7*7*10', ['440 cm³', '1400 cm³', '154 cm³'], '1540 cm³'],
  ]],
];

// ---------------------------------------------------------------------
// Build the bank
// ---------------------------------------------------------------------
const evalExpr = (expr) => Function(`"use strict"; return (${expr});`)();
const fmt = (n) => String(Math.round(n * 1e6) / 1e6);

// "(8+4)/3*2" -> "(8 + 4)/3 × 2";  "Math.sqrt(144)" -> "√(144)";  "9**2" -> "9²"
const pretty = (expr) =>
  expr
    .replace(/Math\.sqrt\(/g, '√(')
    .replace(/\*\*2/g, '²')
    .replace(/\*\*3/g, '³')
    .replace(/\*/g, ' × ')
    .replace(/\+/g, ' + ')
    .replace(/-/g, ' − ');

// Numeric value of an option string ("₹30", "25%", "3/4", "2:3", "−7"). NaN if it has no number.
function parseNum(s) {
  const t = String(s).replace(/−/g, '-').replace(/,/g, '').trim();
  let m = t.match(/^(-?\d+(?:\.\d+)?)\s*[/:]\s*(\d+(?:\.\d+)?)$/);
  if (m) return parseFloat(m[1]) / parseFloat(m[2]);
  m = t.match(/-?\d+(?:\.\d+)?/);
  return m ? parseFloat(m[0]) : NaN;
}

const BANK = [];
SECTIONS.forEach(([category, icon, rows]) =>
  rows.forEach(([difficulty, question, expr, wrong, display, explanation]) => {
    const value = evalExpr(expr);
    const correct = display ?? fmt(value);
    BANK.push({
      id: 'Q' + String(BANK.length + 1).padStart(3, '0'),
      category,
      icon,
      difficulty,
      question,
      expr,
      value,
      correct,
      wrong,
      explanation: explanation || `Working: ${pretty(expr)} = ${correct}`,
    });
  })
);

// ---------------------------------------------------------------------
// Validation – returns a list of problems (empty list = bank is valid)
// ---------------------------------------------------------------------
const DIFFICULTIES = ['Warm-up', 'Normal', 'Challenge'];

function validateBank(bank = BANK) {
  const problems = [];
  const texts = new Set();
  const cats = new Set();
  const diffs = Object.fromEntries(DIFFICULTIES.map((d) => [d, 0]));
  const close = (a, b) => Math.abs(a - b) < 1e-6;

  if (bank.length < 100) problems.push(`Only ${bank.length} questions (need at least 100)`);
  bank.forEach((q) => {
    const tag = `${q.id} "${q.question}"`;
    if (texts.has(q.question)) problems.push(`${tag}: duplicate question text`);
    texts.add(q.question);
    cats.add(q.category);
    if (!DIFFICULTIES.includes(q.difficulty)) problems.push(`${tag}: bad difficulty ${q.difficulty}`);
    else diffs[q.difficulty]++;
    if (q.question.length > 105) problems.push(`${tag}: wording too long for a 15-second question`);
    if (!q.explanation || q.explanation.length < 8) problems.push(`${tag}: missing explanation`);
    if (!Number.isFinite(q.value)) problems.push(`${tag}: expression did not evaluate`);
    if (Math.abs(q.value) > 100000) problems.push(`${tag}: answer too large for a no-calculator question`);
    if (!Array.isArray(q.wrong) || q.wrong.length !== 3) return problems.push(`${tag}: needs exactly 3 wrong options`);
    const options = [q.correct, ...q.wrong];
    if (new Set(options.map((o) => o.trim().toLowerCase())).size !== 4) problems.push(`${tag}: duplicate options`);
    if (options.some((o) => !String(o).trim())) problems.push(`${tag}: empty option`);
    if (!close(parseNum(q.correct), q.value)) problems.push(`${tag}: displayed answer "${q.correct}" != computed ${fmt(q.value)}`);
    q.wrong.forEach((w) => {
      const v = parseNum(w);
      if (!Number.isNaN(v) && close(v, q.value)) problems.push(`${tag}: wrong option "${w}" is also correct`);
    });
  });
  const n = bank.length;
  const share = (d) => diffs[d] / n;
  if (Math.abs(share('Warm-up') - 0.3) > 0.03 || Math.abs(share('Normal') - 0.5) > 0.03 || Math.abs(share('Challenge') - 0.2) > 0.03)
    problems.push(`Difficulty split off target (want 30/50/20): ${JSON.stringify(diffs)}`);
  if (cats.size < 12) problems.push(`Only ${cats.size} topics (need 12)`);
  return problems;
}

const startupProblems = validateBank();
if (startupProblems.length) {
  throw new Error('Question bank is invalid:\n - ' + startupProblems.join('\n - '));
}

// ---------------------------------------------------------------------
// Random selection (runs ONLY on the server)
// ---------------------------------------------------------------------
const shuffle = (arr) => {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};
const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
const adjacentSame = (list) => list.reduce((n, q, i) => n + (i > 0 && q.category === list[i - 1].category ? 1 : 0), 0);

// Balanced mixes for a 10-question race (roughly 30% warm-up / 50% normal / 20% challenge)
const MIXES = [
  { 'Warm-up': 3, Normal: 5, Challenge: 2 },
  { 'Warm-up': 3, Normal: 5, Challenge: 2 },
  { 'Warm-up': 4, Normal: 4, Challenge: 2 },
  { 'Warm-up': 3, Normal: 4, Challenge: 3 },
  { 'Warm-up': 2, Normal: 6, Challenge: 2 },
];

/**
 * Picks `count` unique questions at random: balanced difficulty, every topic used before any repeats,
 * avoiding ids in `excludeIds` (the previous race) whenever the bank allows it.
 * Returns fresh objects { id, category, icon, difficulty, question, options, answer, explanation } with shuffled options.
 */
function selectRandomQuestions(count = 10, excludeIds = new Set()) {
  const base = pick(MIXES);
  const w = Math.round(count * 0.3);
  const c = Math.round(count * 0.2);
  const mix = count === 10 ? base : { 'Warm-up': w, Normal: count - w - c, Challenge: c };
  const chosen = [];
  const used = new Set();
  const catCount = {};

  for (const diff of ['Challenge', 'Normal', 'Warm-up']) {
    for (let i = 0; i < mix[diff]; i++) {
      let pool = BANK.filter((q) => q.difficulty === diff && !used.has(q.id) && !excludeIds.has(q.id));
      if (pool.length === 0) pool = BANK.filter((q) => q.difficulty === diff && !used.has(q.id));
      if (pool.length === 0) pool = BANK.filter((q) => !used.has(q.id));
      const min = Math.min(...pool.map((q) => catCount[q.category] || 0));
      const q = pick(pool.filter((x) => (catCount[x.category] || 0) === min));
      chosen.push(q);
      used.add(q.id);
      catCount[q.category] = (catCount[q.category] || 0) + 1;
    }
  }

  // shuffle order, then swap to avoid the same topic twice in a row
  const list = shuffle(chosen);
  for (let pass = 0; pass < 3; pass++) {
    for (let i = 0; i < list.length; i++) {
      for (let j = i + 1; j < list.length; j++) {
        const before = adjacentSame(list);
        [list[i], list[j]] = [list[j], list[i]];
        if (adjacentSame(list) >= before) [list[i], list[j]] = [list[j], list[i]];
      }
    }
  }

  return list.map((q) => {
    const options = shuffle([q.correct, ...q.wrong]);
    return {
      id: q.id, category: q.category, icon: q.icon, difficulty: q.difficulty,
      question: q.question, options, answer: options.indexOf(q.correct), explanation: q.explanation,
    };
  });
}

const buildQuestionSet = (count = 10, excludeIds) => selectRandomQuestions(count, excludeIds);

module.exports = { BANK, selectRandomQuestions, buildQuestionSet, validateBank, parseNum, DIFFICULTIES };
