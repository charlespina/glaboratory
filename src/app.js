var React = require('react');
var Router = require('react-router');
var Route = Router.Route;
var RouteHandler = Router.RouteHandler;
var BS = require('react-bootstrap');
var WebGLView = require('./components/WebGLView.react');
var assign = require('object-assign');
var ReactSlider = require('react-slider');
var Navbar = BS.Navbar;
var Input = BS.Input;

var THREE = require('./lib/three');

var experiments = [
  require('./experiments/PBR'),
  require('./experiments/HelloWorld'),
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

var SliderInput = React.createClass({
  onChange: function(value) {
    this.props.parameter.setValue(value);
  },

  render: function() {
    var data = this.props.parameter;
    return (
      <div className="slider-input">
        <label>
          {this.props.parameter.name}
          <ReactSlider
            name={this.props.parameter.name}
            step={data.step === undefined? 0.01 : data.step}
            min={data.min === undefined? 0 : data.min}
            max={data.max === undefined? 1 : data.max}
            onChange={this.onChange}
            defaultValue={data.value}
            value={data.value} />
        </label>
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
      // TODO: decide based on type of param which input type to create
      inputs.push(
        <SliderInput key={i} parameter={param} />
      );
    });

    var experimentOptions = [];
    this.props.experiments.forEach(function(exp, i) {
      experimentOptions.push(
        <option key={i} value={i}>
          {exp.name}
        </option>
      );
    });

    return (
      <div className="col-xs-5 col-sm-3 sidebar">
        <Input type="select" onChange={this.onChangeExperiment}>
          {experimentOptions}
        </Input>
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
          <Navbar />
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
