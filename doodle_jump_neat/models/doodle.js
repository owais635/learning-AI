const DOODLE_GRAVITY = 0.7; //not -1 b/c we want the y to increase (top of canvas is 0).

const DOODLE_LIFT_FORCE = -15; // -1 b/c we want the y to decrease (top of canvas is 0).

const DOODLE_DIAMETER = 32;

const HORIZONTAL_FORCE = 0.19;

const MAX_HORIZONTAL_VELOCITY = 15;

const MOVE_LEFT = "left";
const MOVE_RIGHT = "right";
const MOVE_STILL = "still";

class Doodle {
  constructor(brain) {
    this.x = width / 2;
    this.y = height / 2;
    this.velocity = { x: 0, y: 0 };

    this.score = 0;
    this.updatesAboveYThreshold = 0;

    this.fitness = 0;

    this.brain = brain ? brain : new NeuralNetwork(11, 10, 3); // brain is given or not given.


    this.sensors = [
      new Sensor(0),
      new Sensor(Math.PI / 4),
      // new Sensor(Math.PI / 2),
      new Sensor((3 * Math.PI) / 4),
      new Sensor(Math.PI),
      new Sensor((5 * Math.PI) / 4),
      new Sensor((3 * Math.PI) / 2),

      new Sensor((7 * Math.PI) / 4)
    ];
  }

  draw(debugMode = false) {
    if (debugMode) {
      for (let s of this.sensors) {
        s.draw({ x: this.x, y: this.y });
      }
    }

    noStroke();

    fill(255);
    circle(this.x, this.y, DOODLE_DIAMETER);

    fill(color(255, 0, 0));
    text(this.score, this.getLeftCoordinate() + 5, this.y + 5);
  }

  update() {
    for (let sensor of this.sensors) {
      sensor.calculateValue({ x: this.x, y: this.y }, platforms);
    }

    this.score++;

    // if doodle was in the top 3/4 of the canvas
    // want to encourage them to stay above 3/4 of screen.
    if (this.y < (3 * height) / 4) {
      this.score += 2;
    }

    this.fall();

    this.x += this.velocity.x;

    // if go off the right side
    if (this.x > width) {
      this.x = 0;
    }

    // if goes off left side
    if (this.x < 0) {
      this.x = width;
    }

    //hit the ground (bottom of canvas)
    if (this.hitTheGround()) {
      this.y = height;
      this.velocity.y = 0;
      this.jump();
    }
  }


  jump() {
    //change velocity to have upwards direction, and large in magnitude
    this.velocity.y = DOODLE_LIFT_FORCE;
    this.y += this.velocity.y;
  }

  fall() {
    this.velocity.y += DOODLE_GRAVITY;
    this.y += this.velocity.y;
  }

  move(direction) {
    // using p5js variables for direction.

    if (
      direction !== MOVE_STILL &&
      direction !== MOVE_LEFT &&
      direction !== MOVE_RIGHT
    ) {
      console.error("Invalid Move");
    }

    if (direction === MOVE_STILL) {
      this.velocity.x = 0;
      return;
    }

    if (direction == MOVE_LEFT) {
      // was facing right before, now face let
      if (this.velocity.x > 0) {
        this.velocity.x = 0;
      }

      this.velocity.x -= HORIZONTAL_FORCE;

      //escape
      if (this.velocity.x < -MAX_HORIZONTAL_VELOCITY) {
        this.velocity.x = -MAX_HORIZONTAL_VELOCITY;
      }
    } else if (direction == MOVE_RIGHT) {
      // was facing left before, now face right
      if (this.velocity.x < 0) {
        this.velocity.x = 0;
      }

      this.velocity.x += HORIZONTAL_FORCE;

      //escape
      if (this.velocity.x > MAX_HORIZONTAL_VELOCITY) {
        this.velocity.x = MAX_HORIZONTAL_VELOCITY;
      }
    }
  }


  collidesWith(platform) {
    //taken from https://youtu.be/CyAOEisE8_k

    var platformTop = platform.getTopCoordinate();
    var doodlerBottom = this.getBottomCoordinate();

    if (
      Math.abs(platformTop - doodlerBottom) < this.velocity.y &&
      platformTop < doodlerBottom
    ) {
      var platformLeftX = platform.getLeftCoordinate(); // platform lefter-most x bound
      var platformRightX = platform.getRightCoordinate(); // platform righter-most x bound

      var doodlerLeftX = this.getLeftCoordinate(); // doodler lefter-most x bound
      var doodlerRightX = this.getRightCoordinate(); // doodler righter-most x bound

      return (
        (doodlerLeftX >= platformLeftX && // if the doodler's left X falls between the platform
          doodlerLeftX <= platformRightX) ||
        (doodlerRightX >= platformLeftX && // if the doodler's right X falls between the platform
          doodlerRightX <= platformRightX)
      );
    }

    return false;
  }

  hitTheGround = () => this.getBottomCoordinate() >= height;

  isFallingDown = () => this.velocity.y > 0;

  getTopCoordinate = () => this.y - DOODLE_DIAMETER / 2;
  getBottomCoordinate = () => this.y + DOODLE_DIAMETER / 2;

  getLeftCoordinate = () => this.x - DOODLE_DIAMETER / 2;
  getRightCoordinate = () => this.x + DOODLE_DIAMETER / 2;

  // ----------- GENETIC ALGORITHM & Neural Net RELATED METHODS ---------------

  mutate() {
    this.brain.mutate(x => {
      if (random(1) < MUTATION_RATE) {
        // console.log(" was callin.....")
        let offset = randomGaussian() * 0.5;
        let newx = x + offset;
        return newx;
      } else {
        return x;
      }
    });
  }

  think() {
    let input = [];

    input[0] = this.x / width; //distance from left
    input[1] = (height - this.y) / height; // distance from bottom
    input[2] = this.velocity.x / MAX_HORIZONTAL_VELOCITY; //x velocity
    input[3] = this.velocity.y / 10; //y velocity

    //get sensor readings
    for (let j = 0; j < this.sensors.length; j++) {
      input[j + 4] = this.sensors[j].val / SENSOR_LENGTH;
    }

    let move = this.brain.predict(input); // [still, leftProb, rightProb]
    move = Array.from(move);

    const i = move.indexOf(max(move)); // what has the max prob

    if (i === 0) {
      this.move(MOVE_STILL);
    } else if (i === 1) {
      this.move(MOVE_LEFT);
    } else {
      this.move(MOVE_RIGHT);
    }
  }

  copy() {
    let newDoodle = new Doodle(this.brain.copy()); //only copy the brain.
    newDoodle.mutate(MUTATION_RATE);
    // could do cross over here.
    return newDoodle;
  }

  crossover(other) {
    let crossBrain = NeuralNetwork.crossover(
      this.brain.copy(),
      other.brain.copy()
    );

    let newDoodle = new Doodle(crossBrain); //only copy the brain.
    newDoodle.mutate(MUTATION_RATE);
    // could do cross over here.
    return newDoodle;
  }

  dispose = () => this.brain.dispose();
} //End Class

/*
// helper functions
findClosestPlatforms(platforms) {

returns a flat array: [p1_x, p1_y, p2_x, p2_y, .... ,  p5_x, p5_y]
If there aren't enough platforms, then -1 is used.


  // init with 0 to mean there is no p1_x, p1_y for a platform
  const returnVal = Array(numberOfPlatforms * 4).fill(0);
  const temp = platforms; // don't want to change the acutal array

  temp.sort((platform1, platform2) => {
    let doodleVector = createVector(this.x, this.y);
    let p1Vector = createVector(platform1.x, platform1.y);
    let p2Vector = createVector(platform2.x, platform2.y);
    let distance1 = doodleVector.dist(p1Vector);
    let distance2 = doodleVector.dist(p2Vector);
    return distance1 - distance2;
  });

  for (let i = 0; i < numberOfPlatforms; i++) {
    let platform = temp[i];

    let xIndex = i * 2;
    let xDiffIndex = i * 2 + 1;

    let yIndex = i * 2 + 2;
    let yDiffIndex = i * 2 + 3;

    returnVal[xIndex] = platform.getTopMidCoordinate() / width; // normalize
    returnVal[xDiffIndex] = (this.x - platform.getTopMidCoordinate()) / width; // normalize
    returnVal[yIndex] = platform.y / height; // normalize

    returnVal[yDiffIndex] = (this.y - platform.y) / height; // normalize
  }

  // console.log("ret", returnVal)

  return returnVal;
} */
