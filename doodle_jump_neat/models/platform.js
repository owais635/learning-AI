const PLATFORM_VELOCITY = 1.5; //not -1 b/c we want the y to increase (top of canvas is 0).

const PLATFORM_HEIGHT = 10;
const PLATFORM_WIDTH = 80;

class Platform {
  constructor(x = 100, y = 400, width) {
    this.x = x;
    this.y = y;

    this.width = width ? width : PLATFORM_WIDTH;
    this.height = PLATFORM_HEIGHT;

    this.color = {
      r: random(100, 255),
      g: random(50, 255),
      b: random(100, 255)
    };
  }

  draw(debug = false) {
    noStroke();

    fill(color(this.color.r, this.color.g, this.color.b));
    rect(this.x, this.y, this.width, this.height);

    if (debug) {
      fill(color(250, 0, 0));
      rect(this.x, this.y, this.width, 5);
    }
  }

  update() {
    this.y += PLATFORM_VELOCITY; // fall towards bottom of canvas
  }

  getCenterPositionVector = () =>
    createVector(this.x + this.width / 2, this.y + this.height / 2);

  getTopMidCoordinate = () => this.x + this.width / 2;

  getLeftCoordinate = () => this.x;
  getRightCoordinate = () => this.x + this.width;

  getTopCoordinate = () => this.y;
  getBottomCoordinate = () => this.y + this.height;

  // fallen off the bottom of the canvas
  isOffScreen = () => this.getTopCoordinate() >= height;
}
