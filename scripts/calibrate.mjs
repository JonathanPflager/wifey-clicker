// Throwaway calibration tool (NOT bundled). Estimates how much happiness a
// player earns in ~1 hour of greedy play under the current economy, then picks
// ROSE_K so that first wall (~1 hour) pays about TARGET_ROSES roses:
//   roses = floor(sqrt(runHappiness / K))  =>  K = E / TARGET_ROSES^2
//
// Run:  node scripts/calibrate.mjs
//
// The item numbers below MUST mirror src/game/items.ts. If you rebalance the
// economy, update this table and re-run to get a fresh K.

const ITEMS = [
  { id: "coffee", baseCost: 5, costGrowth: 1.09, baseReward: 1, cycleSeconds: 4 },
  { id: "nap", baseCost: 75, costGrowth: 1.1, baseReward: 4, cycleSeconds: 8 },
  { id: "target", baseCost: 900, costGrowth: 1.1, baseReward: 18, cycleSeconds: 14 },
  { id: "sims", baseCost: 11000, costGrowth: 1.11, baseReward: 80, cycleSeconds: 22 },
  { id: "book", baseCost: 130000, costGrowth: 1.11, baseReward: 350, cycleSeconds: 32 },
  { id: "barnesnoble", baseCost: 1600000, costGrowth: 1.12, baseReward: 1600, cycleSeconds: 48 },
  { id: "dinner", baseCost: 20000000, costGrowth: 1.12, baseReward: 7500, cycleSeconds: 70 },
  { id: "datenight", baseCost: 250000000, costGrowth: 1.13, baseReward: 38000, cycleSeconds: 100 },
  { id: "yesday", baseCost: 3200000000, costGrowth: 1.13, baseReward: 200000, cycleSeconds: 140 },
];

const HALVE_EVERY = 25;
const speedTier = (owned) => Math.floor(owned / HALVE_EVERY);
const effCycle = (it, owned) => it.cycleSeconds / Math.pow(2, speedTier(owned));
const nextCost = (it, owned) => Math.round(it.baseCost * Math.pow(it.costGrowth, owned));
const hps = (it, owned) => (owned < 1 ? 0 : (it.baseReward * owned) / effCycle(it, owned));

const DURATION_S = 3600; // one hour
const DT_MS = 100; // matches the live tick
const TARGET_ROSES = 10;

function simulate() {
  const owned = ITEMS.map(() => 0);
  const progressMs = ITEMS.map(() => 0);
  let happiness = 5;
  let totalEarned = 0;

  const steps = (DURATION_S * 1000) / DT_MS;
  for (let step = 0; step < steps; step++) {
    // 1) Award completed cycles for every owned item.
    for (let i = 0; i < ITEMS.length; i++) {
      if (owned[i] < 1) continue;
      progressMs[i] += DT_MS;
      const cycleMs = effCycle(ITEMS[i], owned[i]) * 1000;
      if (progressMs[i] >= cycleMs) {
        const completed = Math.floor(progressMs[i] / cycleMs);
        const pay = completed * ITEMS[i].baseReward * owned[i];
        happiness += pay;
        totalEarned += pay;
        progressMs[i] -= completed * cycleMs;
      }
    }

    // 2) Greedy buying: keep buying the best ROI affordable copy.
    // ROI = gain in happiness-per-second from one more copy, per happiness spent.
    for (;;) {
      let bestIdx = -1;
      let bestRoi = 0;
      for (let i = 0; i < ITEMS.length; i++) {
        const cost = nextCost(ITEMS[i], owned[i]);
        if (cost > happiness) continue;
        const deltaHps = hps(ITEMS[i], owned[i] + 1) - hps(ITEMS[i], owned[i]);
        const roi = deltaHps / cost;
        if (roi > bestRoi) {
          bestRoi = roi;
          bestIdx = i;
        }
      }
      if (bestIdx === -1) break;
      happiness -= nextCost(ITEMS[bestIdx], owned[bestIdx]);
      if (owned[bestIdx] === 0) progressMs[bestIdx] = 0;
      owned[bestIdx] += 1;
    }
  }

  return { totalEarned, owned };
}

const { totalEarned, owned } = simulate();
const K = Math.max(1, Math.round(totalEarned / (TARGET_ROSES * TARGET_ROSES)));
const rosesAtE = Math.floor(Math.sqrt(totalEarned / K));

console.log("=== Wifey Clicker prestige calibration ===");
console.log(`Simulated ${DURATION_S}s of greedy play.`);
console.log(`Total happiness earned (E): ${totalEarned.toLocaleString()}`);
console.log(`Copies owned by item:`, Object.fromEntries(ITEMS.map((it, i) => [it.id, owned[i]])));
console.log(`Target roses at 1 hour: ${TARGET_ROSES}`);
console.log(`=> ROSE_K = ${K}`);
console.log(`   check: floor(sqrt(E / K)) = ${rosesAtE} roses`);
