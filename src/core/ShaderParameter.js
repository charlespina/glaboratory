import Parameter from './Parameter';

function prettyPrint(s) {
  return s.replace(/_/g, " ");
}

class ShaderParameter extends Parameter {
  constructor(name, desc) {
    var displayName = prettyPrint(name);
    super(displayName, desc);

    // we have to keep the uniform description around
    // so that updates are properly forwarded to threejs
    this.uniform = desc;
  }

  filter(params) {
    return params.filter(function(p) {
      return p instanceof ShaderParameter;
    });
  }

  static fromUniformHash(uniforms) {
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

  static createUniformHash(params) {
    var uniforms = {};
    params.forEach(function(p) {
      uniforms[p.name] = p.uniform;
    });
    return uniforms;
  }

  setValue(value) {
    Parameter.prototype.setValue.call(this, value);
    this.uniform.value = value;
    this.uniform.needsUpdate = true;
  }

  getValue() {
    return this.uniform.value;
  }
}

export default ShaderParameter;
