let platforms = [];

let doodles = [], // active doodles
  savedDoodles = []; // all doodles that die, are used for next generation

let frameCounter = 0;

// Slider to speed up simulation
let speedSlider;
let speedSpan;

const TOTAL_DOODLE_POPULATION = 300;

function setup() {
  createCanvas(400, 550).parent("sketch-holder");

  speedSlider = select("#speedSlider");
  speedSpan = select("#speed");

  for (let i = 0; i < TOTAL_DOODLE_POPULATION; i++) {
    doodles.push(new Doodle());
  }

  generateInitialPlatforms();
  //one platform right under the doodle when it starts
  platforms.push(new Platform(doodles[0].x - 50, doodles[0].y + 100));
}

function draw() {
  // How fast should we speed up
  let cycles = speedSlider.value();
  speedSpan.html(cycles);

  for (let n = 0; n < cycles; n++) {
    if (frameCounter % 50 === 0) {
      generatePlatformGroup(0);
    }

    frameCounter++;

    for (let doodle of doodles) {
      for (let b of platforms) {
        if (doodle.collidesWith(b)) {
          doodle.y = b.getTopCoordinate();
          doodle.jump();
          break; // hit a platform no need to iterate over the rest
        }
      }
    }

    removePlatforms(); //remove the ones that have fallen below canvas
    removeDoodles(); // remove any doodles that have hit the ground.

    //ran out of doodles, so make new ones
    if (doodles.length === 0) {
      nextGeneration();
      //one platform right under the doodle when it starts
      platforms.push(new Platform(width / 2 - 30, doodles[0].y + 15));
    }
    //platforms updates
    for (let platform of platforms) {
      platform.update();
    }

    //doodle updates
    for (let doodle of doodles) {
      doodle.think(platforms); // predict and set action (left | right)
      doodle.update(); // apply the action & change pos.
    }
  }

  // -------------------------- DRAWING -----------------------------------
  background(0);

  //draw pips
  for (let platform of platforms) {
    platform.draw();
  }

  //draw doodles
  for (let doodle of doodles) {
    doodle.draw(); // draw
  }
}

function removeDoodles() {
  for (let j = doodles.length - 1; j >= 0; j--) {
    let doodle = doodles[j];

    if (doodle.hitTheGround()) {
      savedDoodles.push(doodles.splice(j, 1)[0]); //remove and save the doodle
    }
  }
}

function removePlatforms() {
  for (let j = platforms.length - 1; j >= 0; j--) {
    let platform = platforms[j];

    if (platform.isOffScreen()) {
      platforms.splice(j, 1); //removed
    }
  }
}

/**
 * create initial platforms
 */
function generateInitialPlatforms() {
  // might be from here: https://youtu.be/CyAOEisE8_k

  var field = []; // returning array

  for (var y = 0; y < height; y += 40) {
    // loop through Y

    for (var i = 0; i < 3; i++) {
      // attempt 3 new platforms
      var x = noise(i, y) * width;

      if (noise(y, i) > 0.5)
        // 50% chance of a new platform
        platforms.push(new Platform(x, y));
    }
  }

  return field;
}

function generatePlatformGroup(y = 300) {
  const padCount = 1;

  for (let i = 0; i < padCount; i++) {
    platforms.push(new Platform(random(30, width - 120), i * random(10, 30)));
  }

  //show an platform  10% of the time.
  if (random(1) < 0.1) {
    platforms.push(new Platform(random(20, width - 120), random(20, 30)));
  }
}
