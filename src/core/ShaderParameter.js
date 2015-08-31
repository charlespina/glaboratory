var assign = require('object-assign');
var Parameter = require('./Parameter');

function prettyPrint(s) {
  return s.replace(/_/g, " ");
}

var ShaderParameter = function(name, desc) {
  var displayName = prettyPrint(name);
  Parameter.call(this, displayName, desc);

  // we have to keep the uniform description around
  // so that updates are properly forwarded to threejs
  this.uniform = desc;
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
    if (uniform.type == 't')
      return;
    if (uniform.hidden)
      return;
    params.push(new ShaderParameter(name, uniform));
  });

  return params;
}

ShaderParameter.createUniformHash = function(params) {
  var uniforms = {};
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
