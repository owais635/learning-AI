const SENSOR_LENGTH = 200;

const SENSOR_PERCEPTION_ANGLE = 20; // in deg

const SENSOR_NO_READ_VAL = 0; // when no platform interact with sensor

class Sensor {
  constructor(angle, sensorLength = SENSOR_LENGTH) {
    this.dir = p5.Vector.fromAngle(-angle); // multiply - b/c to draw CCW
    this.val = SENSOR_NO_READ_VAL; // This is the sensor's reading
    this.sensorLength = sensorLength;
  }

  calculateValue(doodlePos, platforms) {
    let doodlePosVec = createVector(doodlePos.x, doodlePos.y);

    let val = Infinity;

    for (let platform of platforms) {
      let platformPos = platform.getCenterPositionVector();

      // How far away?
      let dist = p5.Vector.dist(doodlePosVec, platformPos);
      // Skip if it's too far away
      if (dist > this.sensorLength) {
        continue;
      }

      // What is vector pointing to platform
      let toPlatform = p5.Vector.sub(platformPos, doodlePosVec);

      let delta = this.dir.angleBetween(toPlatform);

      // console.log((delta * 180) / Math.PI);
      if (delta <= (SENSOR_PERCEPTION_ANGLE * Math.PI) / 180 && dist < val) {
        // distance is less than val & less than the given angle around the sensor
        val = dist;
      }
    }

    this.val = val === Infinity ? SENSOR_NO_READ_VAL : val;
    return this.val;
  }

  draw(doodlePos) {
    stroke(0, 255, 0);
    strokeWeight(map(this.val, 0, SENSOR_LENGTH, 1, 4));

    const magnitude = this.val; //this.sensorLength

    line(
      doodlePos.x,
      doodlePos.y,
      doodlePos.x + this.dir.x * magnitude,
      doodlePos.y + this.dir.y * magnitude
    );

    // Display angles weight
    noStroke();
    fill(255, 200);
    text(
      this.val,
      doodlePos.x + this.dir.x * magnitude,
      doodlePos.y + this.dir.y * magnitude
    );
  }
}
