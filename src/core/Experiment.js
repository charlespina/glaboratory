var NotImplementedError = function(methodName) {
  this.message = "Experiment expects method '"+methodName+"' to be implemented, but it has not been overwritten.";
};

var Experiment = function(name) {
  this.name = name;
  this.parameters = [];
}

Experiment.prototype.setup = function(context) {
  // TO BE OVERWRITTEN
  throw new NotImplementedError('setup');
}

Experiment.prototype.dispose = function() {
  // TO BE OVERWRITTEN, OPTIONALLY
}

Experiment.prototype.update = function(dt) {
  // TO BE OVERWRITTEN
  throw new NotImplementedError('update');
}

Experiment.prototype.render = function(context) {
  // TO BE OVERWRITTEN, OPTIONALLY
  context.renderDefaultCamera();
}

Experiment.prototype.addParameter = function(param) {
  this.parameters.push(param);
}

Experiment.prototype.addParameters = function(params) {
  params.forEach(function(p) {
    this.parameters.push(p);
  }.bind(this));
}

Experiment.prototype.updateParameter = function(param, value) {
  param.setValue(value);
}

Experiment.prototype.getFlattenedParameters = function(params) {
  params = params === undefined? this.parameters : params;
  return params.reduce(function (flat, param) {
    return flat.concat(param.type == 'group'
      ? this.getFlattenedParameters(param.parameters)
      : param);
    }.bind(this), []);
}

module.exports = Experiment;
