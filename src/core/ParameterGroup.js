var ParameterGroup = function(name, options) {
  this.name = name;
  this.type = 'group';
  this.active = options.active === undefined? true : options.active;
  this.parameters = options.parameters === undefined? [] : options.parameters;
};

ParameterGroup.prototype.addParameter = function(param) {
  this.parameters.push(param);
};

ParameterGroup.prototype.addParameters = function(params) {
  if (params)
    params.map(this.addParameter.bind(this));
};

module.exports = ParameterGroup;
