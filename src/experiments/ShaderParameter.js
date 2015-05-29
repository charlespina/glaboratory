var assign = require('object-assign');
var Parameter = require('./Parameter');

var ShaderParameter = function(name, desc) {
  Parameter.call(this, name, desc);
  this.uniform = {
    value: this.value,
    type: desc.type,
  };
}

ShaderParameter.prototype = assign(ShaderParameter.prototype, Parameter.prototype);

ShaderParameter.filter = function(params) {
  return params.filter(function(p) {
    return p instanceof ShaderParameter;
  });
}

ShaderParameter.fromUniformHash = function(uniforms) {
  var params = [];

  Object.keys(uniforms).sort().forEach(function(name) {
    var uniform = uniforms[name];
    if (uniform.type != 't')
      params.push(new ShaderParameter(name, uniform));
  });

  return params;
}

ShaderParameter.createUniformHash = function(params) {
  var uniforms;
  params.forEach(function(p) {
    uniforms[p.name] = p.uniform;
  });
  return uniforms;
}

ShaderParameter.prototype.setValue = function(value) {
  Parameter.prototype.setValue.call(this, value);
  this.uniform.value = value;
  this.uniform.needsUpdate = true;
}

module.exports = ShaderParameter;
