// Run with: npm run validate   (checks the question bank + the random selector)
const { BANK, selectRandomQuestions, validateBank, DIFFICULTIES } = require('./questions');

const RACE_SIZE = 10;
const problems = validateBank();
const by = (k) => BANK.reduce((m, q) => ((m[q[k]] = (m[q[k]] || 0) + 1), m), {});
console.log(`Questions in bank: ${BANK.length}`);
const diff = by('difficulty');
console.log('Difficulty:', Object.fromEntries(DIFFICULTIES.map((d) => [d, `${diff[d]} (${((diff[d] / BANK.length) * 100).toFixed(0)}%)`])));
console.log('Topics:', by('category'));
if (problems.length) {
  console.error('\n❌ BANK PROBLEMS:\n - ' + problems.join('\n - '));
  process.exit(1);
}
console.log('✓ every answer verified, no duplicates, 4 unique options each, exactly one correct option, every question has an explanation');

// Selector checks over many simulated races
const RACES = 3000;
let adj = 0, maxTopic = 0, sameSet = 0, overlap = 0, badMix = 0;
const combos = new Set();
const useCount = {};
const mixTotals = Object.fromEntries(DIFFICULTIES.map((d) => [d, 0]));
let prev = new Set(), prevSig = '';
for (let g = 0; g < RACES; g++) {
  const qs = selectRandomQuestions(RACE_SIZE, prev);
  const ids = qs.map((q) => q.id);
  if (qs.length !== RACE_SIZE || new Set(ids).size !== RACE_SIZE) { console.error(`❌ not ${RACE_SIZE} unique questions`); process.exit(1); }
  const dc = Object.fromEntries(DIFFICULTIES.map((d) => [d, 0]));
  qs.forEach((q) => {
    useCount[q.id] = (useCount[q.id] || 0) + 1;
    dc[q.difficulty]++; mixTotals[q.difficulty]++;
    if (q.options.length !== 4 || q.options[q.answer] === undefined || !q.explanation) { console.error('❌ bad question object'); process.exit(1); }
  });
  if (dc['Warm-up'] < 2 || dc['Warm-up'] > 4 || dc.Challenge < 2 || dc.Challenge > 3 || dc.Normal < 4 || dc.Normal > 6) badMix++;
  qs.forEach((q, i) => { if (i && q.category === qs[i - 1].category) adj++; });
  const cc = {}; qs.forEach((q) => (cc[q.category] = (cc[q.category] || 0) + 1)); maxTopic = Math.max(maxTopic, ...Object.values(cc));
  combos.add([...ids].sort().join());
  if (ids.join() === prevSig) sameSet++;
  overlap += ids.filter((id) => prev.has(id)).length;
  prev = new Set(ids); prevSig = ids.join();
}
const uses = Object.values(useCount);
console.log(`✓ ${RACES} simulated races: always ${RACE_SIZE} unique questions with a valid answer index and explanation`);
console.log('  average difficulty per race:', Object.fromEntries(DIFFICULTIES.map((d) => [d, (mixTotals[d] / RACES).toFixed(2)])), `| unbalanced races: ${badMix}`);
console.log(`  distinct combinations: ${combos.size} of ${RACES} | every question used (min ${Math.min(...uses)}, max ${Math.max(...uses)} times)`);
console.log(`  same-topic neighbours per race: ${(adj / RACES).toFixed(2)} | max questions from one topic in a race: ${maxTopic}`);
console.log(`  identical consecutive sets: ${sameSet} | questions repeated from the previous race: ${overlap}`);
if (overlap !== 0 || sameSet !== 0 || badMix !== 0 || Object.keys(useCount).length !== BANK.length) { console.error('❌ selector check failed'); process.exit(1); }
console.log('\n✅ QUESTION SYSTEM VALID');
