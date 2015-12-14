class NotImplementedError {
  constructor(methodName) {
    this.message = "Experiment expects method '"+methodName+"' to be implemented, but it has not been overwritten.";
  }
}

class Experiment {
  constructor(name) {
    this.name = name;
    this.parameters = [];
  }

  setup(context) {
    // TO BE OVERWRITTEN
    throw new NotImplementedError('setup');
  }

  dispose() {
    // TO BE OVERWRITTEN, OPTIONALLY
  }

  update(dt) {
    // TO BE OVERWRITTEN
    throw new NotImplementedError('update');
  }

  render(context) {
    // TO BE OVERWRITTEN, OPTIONALLY
    context.renderDefaultCamera();
  }

  addParameter(param) {
    this.parameters.push(param);
  }

  addParameters(params) {
    params.forEach(function(p) {
      this.parameters.push(p);
    }.bind(this));
  }

  clearParameters() {
    this.parameters = [];
  }

  updateParameter(param, value) {
    param.setValue(value);
  }

  getFlattenedParameters(params) {
    params = params === undefined? this.parameters : params;
    return params.reduce(function (flat, param) {
      return flat.concat(param.type == 'group'
        ? this.getFlattenedParameters(param.parameters)
        : param);
      }.bind(this), []);
  }
}

export default Experiment;
