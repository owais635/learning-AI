/**
 * TensorFlow Neural Network Wrapper.
 *
 * Credits: (Dan Shiffman) https://github.com/CodingTrain/website/blob/master/Courses/natureofcode/11.3_neuroevolution_tfjs.js/nn.js
 */

/*
Import the following before importing this file.
<script src="https://cdn.jsdelivr.net/npm/@tensorflow/tfjs@1.0.0/dist/tf.min.js"></script>
*/

tf.setBackend("cpu"); // just use cpu, no need for gpu (when using GPU for this simple game the performance is slower)

class NeuralNetwork {
  constructor(a, b, c, d, e) {
    if (a instanceof tf.Sequential) {
      this.model = a;
      this.inputNodesNum = b;
      this.hiddenNodesNum = c;
      this.secHiddenNodesNum = d;
      this.outputNodesNum = e;
    } else {
      this.inputNodesNum = a;
      this.hiddenNodesNum = b;
      this.secHiddenNodesNum = c;

      this.outputNodesNum = d;

      this.model = this.createModel(); // create TensorFlow Model.
    }
  }

  createModel() {
    const model = tf.sequential(); //basic feed-forward model

    //2 layers
    const hiddenLayer = tf.layers.dense({
      inputShape: [this.inputNodesNum],
      units: this.hiddenNodesNum,
      activation: "sigmoid"
    });

    const secHiddenLayer = tf.layers.dense({
      units: this.secHiddenNodesNum,
      activation: "sigmoid"
    });

    // can infer inputShape when added sequentially
    const outputLayer = tf.layers.dense({
      units: this.outputNodesNum,
      activation: "softmax"
    });

    model.add(hiddenLayer);
    model.add(secHiddenLayer);
    model.add(outputLayer);

    return model;
  }

  copy() {
    // only copy the weights

    return tf.tidy(() => {
      const modelCopy = this.createModel();
      const weights = this.model.getWeights();
      const weightCopies = [];
      for (let i = 0; i < weights.length; i++) {
        weightCopies[i] = weights[i].clone();
      }
      modelCopy.setWeights(weightCopies);
      return new NeuralNetwork(
        modelCopy,
        this.inputNodesNum,
        this.hiddenNodesNum,
        this.secHiddenNodesNum,

        this.outputNodesNum
      );
    });
  }

  mutate(rate) {
    tf.tidy(() => {
      const weights = this.model.getWeights();
      const mutatedWeights = [];
      for (let i = 0; i < weights.length; i++) {
        let tensor = weights[i];
        let shape = weights[i].shape;
        let values = tensor.dataSync().slice(); // hack to copy the array, so that we don't mutate underlying info.
        for (let j = 0; j < values.length; j++) {
          if (random(1) < rate) {
            let w = values[j];
            values[j] = w + randomGaussian();
          }
        }
        let newTensor = tf.tensor(values, shape);
        mutatedWeights[i] = newTensor;
      }
      this.model.setWeights(mutatedWeights);
    });
  }

  dispose = () => {
    this.model.dispose();
  };

  predict(inputs) {
    return tf.tidy(() => {
      const xs = tf.tensor2d([inputs]);
      const ys = this.model.predict(xs);
      const outputs = ys.dataSync();
      // console.log(outputs);
      return outputs;
    });
  }
}
