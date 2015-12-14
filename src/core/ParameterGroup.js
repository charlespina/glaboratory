class ParameterGroup {
  constructor(name, options) {
    this.name = name;
    this.type = 'group';
    this.active = options.active === undefined? true : options.active;
    this.parameters = options.parameters === undefined? [] : options.parameters;
  }

  addParameter(param) {
    this.parameters.push(param);
  }

  addParameters(params) {
    if (params)
      params.map((p)=>this.addParameter(p));
  }
}

export default ParameterGroup;
