var React = require('react');
var Router = require('react-router');
var Route = Router.Route;
var RouteHandler = Router.RouteHandler;
var BS = require('react-bootstrap');
var WebGLView = require('./components/WebGLView.react');
var assign = require('object-assign');
var ReactSlider = require('react-slider');
var ColorPicker = require('react-color-picker');
var Navbar = BS.Navbar;
var Input = BS.Input;
var OverlayMixin = BS.OverlayMixin;
var Button = BS.Button;
var Modal = BS.Modal;
var Row = BS.Row;
var Col = BS.Col;

var THREE = require('./lib/three');

var experiments = [
  require('./experiments/PhysicallyBasedRendering'),
  // require('./experiments/HelloWorld'),
];

var ContentPanel = React.createClass({
  init: function(experiment) {
    if (!experiment) return;

    var context = this.refs.view.getContext();
    experiment.setup(context);
    context.addListener('update', experiment.update.bind(experiment));
    context.addListener('render', experiment.render.bind(experiment));
  },

  componentDidMount: function() {
    this.init(this.props.experiment);
  },

  componentWillReceiveProps: function(props) {
    this.refs.view.reset();
    this.init(props.experiment);
  },

  render: function() {
    return (
      <div className="col-xs-7 col-sm-9 content-panel">
        <WebGLView ref="view" />
      </div>
    );
  }
});

var ColorPickerInput = React.createClass({
  mixins: [OverlayMixin],

  getInitialState: function() {
    return {
      isModalOpen: false
    };
  },

  handleToggle: function() {
    this.setState({isModalOpen: !this.state.isModalOpen});
  },

  onChange: function(value) {
    // re-use existing color structure
    var c = this.props.parameter.uniform.value;
    c.setHex(value.replace("#", "0x"));

    this.props.parameter.setValue(c)
  },

  render: function() {
    return (
      <div className="color-picker-input">
        <Input wrapperClassName="wrapper" bsSize="small" label={this.props.parameter.name}>
          <Row>
            <Col xs={5} sm={4}>
              <a href="#" className="color-swatch" onClick={this.handleToggle}
                style={{
                  backgroundColor: "#" + this.props.parameter.uniform.value.getHexString()
                }} />
            </Col>
            <Col xs={5} sm={4}>
              <a href="#" className="color-name" onClick={this.handleToggle}>
                #{this.props.parameter.uniform.value.getHexString()}
              </a>
            </Col>
          </Row>
        </Input>
      </div>
    );
  },

  renderOverlay: function() {
    if (!this.state.isModalOpen) {
      return <span/>;
    }

    return (
      <Modal className="color-picker-modal" title={this.props.parameter.name} closeButton onRequestHide={this.handleToggle}>
        <div className='modal-body'>
          <ColorPicker defaultValue={this.props.parameter.uniform.value.getHexString()}
            onChange={this.onChange}
            onDrag={this.onChange} />
        </div>
      </Modal>
    );
  }
})

var SliderInput = React.createClass({
  getInitialState: function() {
    return {
      value: this.props.parameter.value
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
      this.setState({value: this.props.parameter.value});
    else
      this.onChange(value);
  },

  onChange: function(value) {
    this.props.parameter.setValue(value);
    this.setState({value: value});
  },

  render: function() {
    var data = this.props.parameter;
    return (
      <div className="slider-input">
        <Input wrapperClassName="wrapper" bsSize="small" label={this.props.parameter.name}>
          <Row>
            <Col xs={5} sm={4}>
              <Input value={this.state.value}
                type="text"
                pattern="[1234567890.]*"
                onChange={this.onTextChange}
                onBlur={this.onTextChanged} />
            </Col>
            <Col xs={7} sm={8}>
              <ReactSlider
                name={this.props.parameter.name}
                step={data.step === undefined? 0.01 : data.step}
                min={data.min === undefined? 0 : data.min}
                max={data.max === undefined? 1 : data.max}
                onChange={this.onChange}
                value={data.value} />
            </Col>
          </Row>
        </Input>
      </div>
    );
  }
});

var Sidebar = React.createClass({
  onChangeExperiment: function(e) {
    this.props.onChangeExperiment(e.target.value);
  },

  render: function() {
    var Button = BS.Button;
    var ButtonToolbar = BS.ButtonToolbar;

    var inputs = [];
    this.props.parameters.forEach(function(param, i) {
      if (param.uniform.type == 'c') {
        inputs.push(
          <ColorPickerInput key={i} parameter={param} />
        );
      } else {
        inputs.push(
          <SliderInput key={i} parameter={param} />
        );
      }
    });

    var experimentOptions = [];
    this.props.experiments.forEach(function(exp, i) {
      experimentOptions.push(
        <option key={i} value={i}>
          {exp.name}
        </option>
      );
    });

    var experimentSelector;
    if (this.props.experiments.length > 1) {
      experimentSelector = (
        <Input type="select" onChange={this.onChangeExperiment}>
          {experimentOptions}
        </Input>
      );
    }

    return (
      <div className="col-xs-5 col-sm-3 sidebar">
        {experimentSelector}
        {inputs}
      </div>
    );
  }
});

var Routes;

var App = React.createClass({
  getInitialState: function() {
    return {
      activeExperimentIndex: 0
    };
  },

  onChangeExperiment: function(idx) {
    this.setState({activeExperimentIndex: idx});
  },

  render: function() {
    var Navbar = BS.Navbar;
    var activeExperiment = experiments[this.state.activeExperimentIndex];
    return (
      <div id="site" className="container-fluid">
        <div className="row">
          <Navbar brand={activeExperiment.name}>
          </Navbar>
          <ContentPanel experiment={activeExperiment}/>
          <Sidebar onChangeExperiment={this.onChangeExperiment}
            experiments={experiments}
            parameters={activeExperiment.parameters}/>
        </div>
      </div>
    );
  }
});

var routes = (
  <Route name="app" path="/" handler={App} />
);

Router.run(routes, function(Handler, state) {
  React.render(<Handler />, document.getElementById("app"));
});
