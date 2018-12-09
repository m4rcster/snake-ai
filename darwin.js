const fs = require('fs');
const util = require('util');
const logFile = fs.createWriteStream('log.txt', { flags: 'w' });
const saveFile = fs.createWriteStream('save.json', { flags: 'w' });

function log() {
  logFile.write(util.format.apply(null, arguments) + '\n');
  //logFile.write(util.format.apply(null, arguments) + '\n');
}

function save() {
  saveFile.write(util.format.apply(null, arguments));
}

const Brain = require('./brain');

let inputLayer = 6;
let hiddenLayer = [4];
let outputLayer = 3;

class Darwin {
  constructor(individualsPerGeneration) {
    this.individualsPerGeneration = individualsPerGeneration;
    this.mutationRate = 0.1;
    this.winnerRate = 0.1;

    this.individuals = [];

    this.currentGeneration = 0;
    this.currentIndividual = 0;

    for(let i = 0; i < this.individualsPerGeneration; i++) {
      let brain = new Brain([inputLayer, ...hiddenLayer, outputLayer]);
      brain.id = i;
      brain.score = 0;
      this.individuals.push(brain);
    }
    log('generation: ' + this.currentGeneration + ', new snakes: ', this.individuals.length);
    //log(this)
  }

  fromJson(json) {
    this.individuals = JSON.parse(json.individuals);
  }

  get individual() {
    return this.individuals[this.currentIndividual];
  }

  next() {
    this.currentIndividual++;
    if(this.currentIndividual >= this.individuals.length) {
      this.currentIndividual = 0;
      this.breed();
    }
  }

  breed() {
    this.individuals.sort((a, b) => b.score - a.score);
    save(JSON.stringify(this));

    let winnerCount = Math.ceil(this.individuals.length * this.winnerRate);

    let nextIndividuals = [];

    var average = this.individuals.map(s => s.score).reduce((p, c) => p + c, 0) / this.individuals.length;
    log('generation ' + this.currentGeneration + ' average: ' + average);

    for(let i = 0; i < winnerCount; i++) {
      let individual = this.individuals[i];
      log('winner: ' + individual.id + ', score: ' + individual.score);
      for(let j = 0; j < 1 / this.winnerRate; j++) {
        nextIndividuals.push(this.mutate(individual, i * winnerCount + j));
      }
    }

    //log('\n***\n');
    this.currentGeneration++;

    log('generation: ' + this.currentGeneration + ', new snakes', nextIndividuals.length);
    this.individuals = nextIndividuals;
    //log(this);
  }

  mutate(individual, id) {
    let copy = JSON.parse(JSON.stringify(individual));
    let brain = new Brain();
    brain.layers = copy.layers;
    brain.id = copy.id + '-' + id;

    let range = { min: -10, max: 10 };

    let mutationCount = Math.round(brain.synapses * this.mutationRate);


    for(let i = 0; i < mutationCount; i++) {
      let layerIndex = Math.floor(Math.random() * brain.layers.length);
      let layer = brain.layers[layerIndex];
      let neuronIndex = Math.floor(Math.random() * layer.length);
      let neuron = layer[neuronIndex];
      let synapseIndex = Math.floor(Math.random() * neuron.length);
      let synapse = neuron[synapseIndex];
      synapse = this.randomFromTo(range.min, range.max);
    }

    /*
    // loop through layers
    for(let i = 0; i < brain.layers.length; i++) {
      let layer = brain.layers[i];

      // loop through neurons
      for(let n = 0; n < layer.length; n++) {
        let neuron = layer[n];

        let mutationCount = Math.ceil(neuron.length * this.mutationRate);

        for(let j = 0; j < mutationCount; j++) {
          let index = Math.floor(Math.random() * neuron.length);
          let weight = this.randomFromTo(range.min, range.max);

          neuron[index] = weight;
        }
      }
    }
    */
    return brain;
  }

  randomFromTo(a, b) {
    return a + Math.random() * (b - a)
  }

  log() {
    log(...arguments);
  }
}

module.exports = Darwin;