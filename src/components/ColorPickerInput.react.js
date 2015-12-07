var React = require('react');
var ReactDOM = require('react-dom');
var ColorPicker = require('react-color-picker');

var ColorPickerInput = React.createClass({
  handleToggle: function(e) {
    e.stopPropagation();
    e.preventDefault();
  },

  componentDidMount: function() {
    $(ReactDOM.findDOMNode(this.refs.input)).popup({
      on: 'click',
      position: 'bottom center',
      lastResort: 'bottom center'
    });
    this.width = $(ReactDOM.findDOMNode(this.refs.input)).width();
  },

  componentWillUpdate: function() {
    this.width = $(ReactDOM.findDOMNode(this.refs.input)).width();
  },

  componentWillUnmount: function() {
  },

  onChange: function(value) {
    // re-use existing color structure
    var c = this.props.parameter.getValue();
    c.setHex(value.replace("#", "0x"));

    this.props.parameter.setValue(c)
    this.forceUpdate();
  },

  render: function() {
    var width = this.width;
    var colorPickerModal = (
      <div>
        <div className="content">
          <ColorPicker defaultValue={this.props.parameter.getValue().getHexString()}
            onChange={this.onChange}
            saturationWidth={130}
            saturationHeight={130}
            hueWidth={20}
            hueHeight={130}
            onDrag={this.onChange} />
        </div>
      </div>
    );

    return (
      <div className="color-picker-input">
        <div ref="input" className="ui fluid action input">
          <span className="color-swatch"
            style={{
              backgroundColor: "#" + this.props.parameter.getValue().getHexString()
            }}>
          </span>
          <div className="ui icon button">
            <i className="eyedropper icon" />
          </div>
        </div>
        <div ref="modal" className="ui popup color-picker-modal">
          {colorPickerModal}
        </div>
      </div>
    );
  }
});

module.exports = ColorPickerInput;
