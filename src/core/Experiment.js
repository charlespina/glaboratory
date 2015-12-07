var Experiment = function(name) {
  this.name = name;
  this.parameters = [];
}

Experiment.prototype.setup = function(context) {
  // TO BE OVERWRITTEN
}

Experiment.prototype.update = function(dt) {
  // TO BE OVERWRITTEN
}

Experiment.prototype.render = function(context) {
  // TO BE OVERWRITTEN, OPTIONALLY
  context.renderDefaultCamera();
}

Experiment.prototype.addParameter = function(param) {
  this.parameters.push(param);
}

Experiment.prototype.addParameters = function(params) {
  console.log("adding params", params);
  params.forEach(function(p) {
    this.parameters.push(p);
  }.bind(this));
}

Experiment.prototype.updateParameter = function(param, value) {
  param.setValue(value);
}

module.exports = Experiment;
