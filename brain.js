const randomFromTo = (a, b) => {
  return a + Math.random() * (b - a)
}

const Weights = (inputLength) => {
  let range = { min: -10, max: 10 };
  let weights = [];

  for(let i = 0; i < inputLength; i++) {
    weights.push(randomFromTo(range.min, range.max));
  }

  return weights;
}


class Brain {
  constructor(layers = []) {
    this.layers = [];
    this.layersLengths = layers;

    for(let i = 1; i < layers.length; i++) {
      let layer = [];
      for(let j = 0; j < layers[i]; j++) {
        layer.push(Weights(layers[i - 1]));
      }
      this.layers.push(layer);
    }
  }

  run(inputs) {
    for(let i = 0; i < this.layers.length; i++) {
      let layer = this.layers[i];
      inputs = this.activateLayer(inputs, layer);
    }
    return inputs;
  }

  get synapses() {
    let count = 0;
    for(let i = 1; i < this.layersLengths.length; i++) {
      count += this.layersLengths[i - 1] * this.layersLengths[i];
    }
    return count;
  }

  activateLayer(inputs, layer) {
    let output = [];
    for(let i = 0; i < layer.length; i++) {
      output.push(this.activateNeuron(inputs, layer[i]))
    }
    return output;
  }

  activateNeuron(inputs, weights) {
    if(inputs.length !== weights.length) {
      return console.error(`Feedforward: #inputs ${inputs.length} != #weights ${weights.length}`);
    }

    let score = 0;

    for(let i = 0; i < weights.length; i++) {
      score += inputs[i] * weights[i];
    }

    const sig = (x) => {
      return 1 / (1 + Math.exp(-x));
    }

    return sig(score);
  }
}

module.exports = Brain;