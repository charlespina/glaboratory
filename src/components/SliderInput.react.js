var React = require('react');
var ReactSlider = require('react-slider');

var SliderInput = React.createClass({
  getInitialState: function() {
    return {
      value: this.props.parameter.getValue()
    }
  },

  isValidInput: function(v) {
    if (this.props.parameter.type == 'f') {
      v = parseFloat(v);
    } else if (this.props.parameter.type == 'i') {
      v = parseInt(v);
    } else {
      v = NaN;
    }

    return !isNaN(v);
  },

  onTextChange: function(e) {
    if (this.isValidInput(e.target.value))
      this.onTextChanged(e);
    this.setState({value: e.target.value});
  },

  onTextChanged: function(e) {
    var value = e.target.value;

    if (this.props.parameter.type == 'f')
      value = parseFloat(value);
    if (this.props.parameter.type == 'i')
      value = parseInt(value);

    if (isNaN(value))
      this.setState({value: this.props.parameter.getValue()});
    else
      this.onChange(value);
  },

  onChange: function(value) {
    this.props.parameter.setValue(value);
    this.setState({value: value});
  },

  render: function() {
    var data = this.props.parameter;
    var step = data.step;
    if (step === undefined) {
      if(data.type == 'i') step = 1;
      else if (data.min !== undefined && data.max !== undefined) step = (data.max - data.min)/100.0;
      else step = 0.01;
    }
    return (
      <div className="slider-input">
        <div className="ui grid">
          <div className="ten wide column">
            <ReactSlider
              name={this.props.parameter.name}
              step={step}
              min={data.min === undefined? 0 : data.min}
              max={data.max === undefined? 1 : data.max}
              onChange={this.onChange}
              value={data.value} />
          </div>
          <div className="six wide column ui small input">
            <input value={this.state.value}
              type="text"
              pattern="[1234567890.]*"
              onChange={this.onTextChange}
              onBlur={this.onTextChanged} />
          </div>
        </div>
      </div>
    );
  }
});

export default SliderInput;
