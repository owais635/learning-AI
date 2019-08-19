// Daniel Shiffman
// Nature of Code: Intelligence and Learning
// https://github.com/shiffman/NOC-S17-2-Intelligence-Learning

// This flappy doodle implementation is adapted from:
// https://youtu.be/cXgA1d_E-jY&

// This file includes functions for creating a new generation
// of doodles.

let generationsCount = 1;

const MUTATION_RATE = 0.08;

// Create the next generation
function nextGeneration() {
  let scoresSum = 0,
    highest = 0;
  for (let s of savedDoodles) {
    scoresSum += s.score;
    if (s.score > highest) {
      highest = s.score;
    }
  }

  showResults(generationsCount, scoresSum / TOTAL_DOODLE_POPULATION, highest);

  normalizeFitness(savedDoodles); // Normalize the fitness values 0-1

  doodles = generate(); // Generate a new set of doodles

  savedDoodles = [];
  generationsCount++;
}

function showResults(genNum, avgScore, highScore) {
  const genNumTag = document.getElementById("generation-number");
  const avgScoreTag = document.getElementById("avg-score");
  const highScoreTag = document.getElementById("high-score");

  genNumTag.innerHTML = genNum;
  avgScoreTag.innerHTML = avgScore;
  highScoreTag.innerHTML = highScore;

  console.log(
    "Generation:",
    genNum,
    "avg_score:",
    avgScore,
    "highest_score:",
    highScore
  );
}

// Generate a new population of doodles
function generate() {
  let doodles = [];
  for (let i = 0; i < TOTAL_DOODLE_POPULATION; i++) {
    let p1 = poolSelection(savedDoodles);

    let p2 = poolSelection(savedDoodles);
    doodles[i] = p1.crossover(p2);

    // can just copy 1 parent or cross over two parents
    // doodles[i] = p1.copy();
  }
  return doodles;
}

// function pickOne() {
//   let doodle = random(savedDoodles);
//   let child = new Doodle(doodle.brain); //only copy the brain.
//   child.mutate(MUTATION_RATE);
//   // could do cross over here.
//   return child;
// }

// Normalize the fitness of all doodles
function normalizeFitness(doodles) {
  // Make score exponentially better?
  for (let i = 0; i < doodles.length; i++) {
    doodles[i].score = pow(doodles[i].score, 2.5);
  }

  // Add up all the scores
  let sum = 0;
  for (let i = 0; i < doodles.length; i++) {
    sum += doodles[i].score;
  }

  // Divide by the sum
  for (let i = 0; i < doodles.length; i++) {
    doodles[i].fitness = doodles[i].score / sum;
  }
}

// An algorithm for picking one doodle from an array based on fitness
function poolSelection(doodles) {
  // Start at 0
  let index = 0;

  // Pick a random number between 0 and 1
  let r = random(1);

  // Keep subtracting probabilities until you get less than zero
  // Higher probabilities will be more likely to be fixed since they will
  // subtract a larger number towards zero
  while (r > 0) {
    r -= doodles[index].fitness;
    // And move on to the next
    index += 1;
  }

  // Go back one
  index -= 1;

  // Make sure it's a copy!
  // (this includes mutation)
  return doodles[index].copy();
}
