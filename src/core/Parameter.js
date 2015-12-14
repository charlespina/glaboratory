class Parameter {

  constructor(name, desc) {
    this.name = name;
    this.min = desc.min;
    this.max = desc.max;
    this.value = desc.value;
    this.type = desc.type;
    this.choices = desc.choices;
    this.onChange = desc.onChange;
  }

  clamp(v) {
    if (this.min !== undefined)
      v = Math.max(this.min, v);

    if (this.max !== undefined)
      v = Math.min(this.max, v);

    return v;
  }

  setValue(value) {
    this.value = this.clamp(value);
    if (this.onChange)
      this.onChange(this.value)
  }

  getValue() {
    return this.value;
  }
}

export default Parameter;
