var React = require('react');
var Router = require('react-router');
var Link = Router.Link;
var Route = Router.Route;
var RouteHandler = Router.RouteHandler;
var BS = require('react-bootstrap');
var WebGLView = require('./components/WebGLView.react');
var assign = require('object-assign');
var ReactSlider = require('react-slider');
var ColorPicker = require('react-color-picker');

var THREE = require('./lib/three');

var experiments = [
  require('./experiments/EnvironmentBlur/index'),
  require('./experiments/PBR/index'),
  require('./experiments/Tea/index')
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
      <div className="twelve wide column content-panel">
        <WebGLView ref="view" />
      </div>
    );
  }
});

var ColorPickerInput = React.createClass({
  handleToggle: function(e) {
    e.stopPropagation();
    e.preventDefault();
  },

  componentDidMount: function() {
    console.log(this.refs.modal.getDOMNode());
    $(this.refs.input.getDOMNode()).popup({
      on: 'click',
      position: 'bottom center'
    });
  },

  componentWillUnmount: function() {
  },

  onChange: function(value) {
    // re-use existing color structure
    var c = this.props.parameter.uniform.value;
    c.setHex(value.replace("#", "0x"));

    this.props.parameter.setValue(c)
    this.forceUpdate();
  },

  render: function() {
    var colorPickerModal = (
      <div>
        <div className="ui small header">
          {this.props.parameter.name}
        </div>
        <div className="content">
          <ColorPicker defaultValue={this.props.parameter.uniform.value.getHexString()}
            onChange={this.onChange}
            saturationWidth="calc(100% - 30px)"
            hueWidth="20px"
            onDrag={this.onChange} />
        </div>
      </div>
    );

    return (
      <div className="color-picker-input">
        <div ref="input" className="ui fluid action input">
          <span className="color-swatch"
            style={{
              backgroundColor: "#" + this.props.parameter.uniform.value.getHexString()
            }}>
          </span>
          <div className="ui icon button">
            <i className="eyedropper icon" />
          </div>
        </div>
        <div ref="modal" className="ui fluid popup bottom center color-picker-modal">
          {colorPickerModal}
        </div>
      </div>
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
        <div className="ui grid">
          <div className="ten wide column">
            <ReactSlider
              name={this.props.parameter.name}
              step={data.step === undefined? 0.01 : data.step}
              min={data.min === undefined? 0 : data.min}
              max={data.max === undefined? 1 : data.max}
              onChange={this.onChange}
              value={data.value} />
          </div>
          <div className="six wide column">
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

var Sidebar = React.createClass({
  render: function() {
    var inputs = [];
    this.props.parameters.forEach(function(param, i) {
      if (param.uniform.type == 'c') {
        inputs.push(
          <div className="ui form" key={i}>
            <div className="field">
              <label>{param.name}</label>
              <ColorPickerInput parameter={param} />
            </div>
          </div>
        );
      } else {
        inputs.push(
          <div className="ui form" key={i}>
            <div className="field">
              <label>{param.name}</label>
              <SliderInput parameter={param} />
            </div>
          </div>
        );
      }
    });

    return (
      <div className="four wide column sidebar">
        {inputs}
      </div>
    );
  }
});

var Routes;

var ExperimentIndex = React.createClass({
  render: function() {
    var experimentList = experiments.map(function(exp, i) {
      return (
        <li key={i}>
          <Link to="exp" params={{experimentName:exp.name}}>
            {exp.name}
          </Link>
        </li>
      );
    });

    experimentList = <ul>{experimentList}</ul>;
    return (
      <div className="ui grid">
        <div>
          {experimentList}
        </div>
      </div>
    );
  }
});

var ExperimentViewer = React.createClass({
  mixins: [Router.State],

  render: function() {

    var activeExperimentIndex = 0;
    experiments.forEach(function(exp, i) {
      if (exp.name == this.getParams().experimentName) {
        activeExperimentIndex = i;
      }
    }.bind(this));

    var activeExperiment = experiments[activeExperimentIndex];

    return (
      <div className="ui padded equal height grid experiment-viewer-grid">
        <ContentPanel experiment={activeExperiment}/>
        <Sidebar parameters={activeExperiment.parameters}/>
      </div>
    );
  }
});

var App = React.createClass({
  render: function() {
    return (
      <div id="site" className="container-fluid">
        <RouteHandler />
      </div>
    );
  }
});

var routes = (
  <Route path="/" handler={App}>
    <Route name="index" path="/" handler={ExperimentIndex} />
    <Route name="exp" path="/exp/:experimentName" handler={ExperimentViewer} />
  </Route>
);

Router.run(routes, function(Handler, state) {
  React.render(<Handler />, document.getElementById("app"));
});
