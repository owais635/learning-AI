// training data
const xsTensor = tf.tensor2d([[0, 0], [0, 1], [1, 0], [1, 1]]);
const ysTensor = tf.tensor2d([[0], [1], [1], [0]]);

const xsInputs = []
let resolution = 20;
let cols;
let rows;
let xs;

let model;
let lossPTag;
const optimizer = tf.train.adam(0.1); // learningRate = 0.5

function createCanvasInputs() {
  cols = width / resolution;
  rows = height / resolution;

  // create input data
  /* getting data is costly, so we should first create a batch of inputs, and then predict */
  for (let i = 0; i < cols; i++) {
    for (let j = 0; j < rows; j++) {
      let x1 = i / cols;
      let x2 = j / rows;
      xsInputs.push([x1, x2])
    }
  }
  xs = tf.tensor2d(xsInputs);
}

function setup() {
  lossPTag = select('#loss-value');
  createCanvas(400, 400).parent('sketch-holder');
  createCanvasInputs();

  model = tf.sequential(); //basic feed-forward model

  //2 layers
  const hiddenLayer = tf.layers.dense({
    inputShape: [2],  // takes in two inputs (nodes)
    units: 2,  //has two nodes in this layer
    activation: 'sigmoid'
  });

  // can infer inputShape when added sequential
  const outputLayer = tf.layers.dense({ units: 1, activation: 'sigmoid' });

  model.add(hiddenLayer);
  model.add(outputLayer);

  model.compile({
    optimizer: optimizer,
    loss: 'meanSquaredError'  // can also do tf.losses.meanSquaredError
  })

  train(); // start the call to train
}

function train() {
  model.fit(xsTensor, ysTensor, { shuffle: true, epochs: 10 })
    .then(result => {
      lossPTag.html(`Current Loss Value: ${result.history.loss[0]}`);
      train(); // recursively call train now that current call to fit() is done.
    });
}

function draw() {
  background(0);

  tf.tidy(() => {
    let ys = model.predict(xs).dataSync();

    // Draw the results
    let index = 0;
    for (let i = 0; i < cols; i++) {
      for (let j = 0; j < rows; j++) {
        let br = ys[index] * 255
        fill(br);
        rect(i * resolution, j * resolution, resolution, resolution);
        fill(255 - br);
        textSize(8);
        textAlign(CENTER, CENTER);
        text(nf(ys[index], 1, 2), i * resolution + resolution / 2, j * resolution + resolution / 2)
        index++;
      }
    }
  });
}
