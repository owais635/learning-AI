const xValues = [];
const yValues = [];

const learningRate = 0.5;
const optimizer = tf.train.sgd(learningRate);

const predictedLine = { m: 0, b: 0 };
let equationP; // <p> tag to show the equation of the line.

function setup() {
  createCanvas(400, 400).parent('sketch-holder');
  background(0);
  equationP = select('#equation');

  //tf.scalar(random(1)).variable() - can also chain
  predictedLine.m = tf.variable(tf.scalar(random(1)));
  predictedLine.b = tf.variable(tf.scalar(random(1)));
}

function mousePressed() {
  if (mouseX > width || mouseX < 0 || mouseY > height || mouseY < 0) {
    return; //ignore clicks outside canvas
  }

  /* Normalize the data so that xs and ys are from -1 to 1. */
  xValues.push(normalizeX(mouseX));
  yValues.push(normalizeY(mouseY));
}

const loss = (pred, label) => pred.sub(label).square().mean(); //(guess-y)^2

function predict(xsArray) {
  let tf_xs = tf.tensor1d(xsArray); // 1d array
  let tf_ys = tf_xs.mul(predictedLine.m).add(predictedLine.b); // y= mx+b
  return tf_ys;
}

function draw() {
  if (xValues.length > 0) {
    // Train the model.

    /* Since we're not providing the trainable variables 
    explicity, tf will train over all trainable variables. */

    // tidy will clean up all the tensors produced by predict & tf_ys
    tf.tidy(() => {
      const tf_ys = tf.tensor1d(yValues);
      optimizer.minimize(() => loss(predict(xValues), tf_ys));
    });
  }

  background(0);
  stroke(255);
  strokeWeight(8);

  //draw the points
  for (let i = 0; i < xValues.length; i++) {
    let px = denormalizeX(xValues[i]);
    let py = denormalizeY(yValues[i]);
    point(px, py);
  }

  drawLine(); //draw line

  // useful for debugging and looking at any memory leaks.
  // console.log("tf.memory().numTensors", tf.memory().numTensors);
}

/**
 * Predict and Draw the line.
 */
function drawLine() {
  //predict being called in draw will produce a lot of tensors.
  tf.tidy(() => {
    let xs = [-1, 1];
    let ys = predict(xs);

    let x1 = denormalizeX(xs[0]);
    let x2 = denormalizeX(xs[1]);

    //ys[0] won't work because we need actual number.
    let y1 = denormalizeY(ys.dataSync()[0]);
    let y2 = denormalizeY(ys.dataSync()[1]);

    strokeWeight(2);
    line(x1, y1, x2, y2);

    const m = nf(predictedLine.m.dataSync()[0], 1, 3);
    const b = nf(predictedLine.b.dataSync()[0], 1, 3);

    equationP.html(`y = ${m}x + ${b}`);
  });
}

/* Map canvas's (x, y) coordinates to to (-1, 1) */
const normalizeX = x => map(x, 0, width, -1, 1);
const normalizeY = y => map(y, 0, height, 1, -1);
const denormalizeX = x => map(x, -1, 1, 0, width);
const denormalizeY = y => map(y, -1, 1, height, 0);
