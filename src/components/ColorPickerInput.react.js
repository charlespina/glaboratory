import React from 'react';
import ReactDOM from 'react-dom';
import { ChromePicker as ColorPicker } from 'react-color';

class ColorPickerInput extends React.Component {
  handleToggle(e) {
    e.stopPropagation();
    e.preventDefault();
  }

  componentDidMount() {
    $(ReactDOM.findDOMNode(this.refs.input)).popup({
      on: 'click',
      position: 'bottom center',
      lastResort: 'bottom center'
    });
    this.width = $(ReactDOM.findDOMNode(this.refs.input)).width();
  }

  componentWillUpdate() {
    this.width = $(ReactDOM.findDOMNode(this.refs.input)).width();
  }

  componentWillUnmount() {
  }

  onChange(value) {
    // re-use existing color structure
    var c = this.props.parameter.getValue();
    c.setHex(value.hex.replace("#", "0x"));

    this.props.parameter.setValue(c)
    this.forceUpdate();
  }

  render() {
    var width = this.width;
    var colorPickerModal = (
      <div>
        <div className="content">
          <ColorPicker color={this.props.parameter.getValue().getHexString()}
            onChangeComplete={this.onChange.bind(this)}
            onChange={this.onChange.bind(this)} />
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
};

export default ColorPickerInput;
