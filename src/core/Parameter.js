var Parameter = function(name, desc) {
  this.name = name;
  this.min = desc.min;
  this.max = desc.max;
  this.value = desc.value;
  this.type = desc.type;
  this.choices = desc.choices;
  this.onChange = desc.onChange;
}

Parameter.prototype.clamp = function(v) {
  if (this.min !== undefined)
    v = Math.max(this.min, v);

  if (this.max !== undefined)
    v = Math.min(this.max, v);

  return v;
}

Parameter.prototype.setValue = function(value) {
  this.value = this.clamp(value);
  if (this.onChange)
    this.onChange(this.value)
}

Parameter.prototype.getValue = function() {
  return this.value;
}

module.exports = Parameter;