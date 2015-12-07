var ExperimentStore = function() {
  this.experiments = [];
};

ExperimentStore.prototype.registerExperiment = function(experiment) {
  this.experiments.push(experiment);
};

module.exports = new ExperimentStore();
