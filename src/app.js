import ExperimentStore from './stores/ExperimentStore';
import THREE from 'three';

require("./css/main.scss");

var React = require('react');
var ReactDOM = require('react-dom');
var ReactRouter = require('react-router');
var Link = ReactRouter.Link;
var Route = ReactRouter.Route;
var IndexRoute = ReactRouter.IndexRoute;
var Router = ReactRouter.Router;

var ExperimentIndex = require('./components/ExperimentIndex.react');
var ExperimentDetail = require('./components/ExperimentDetail.react');


[ require('./experiments/EnvironmentBlur/index'),
  require('./experiments/ReactionDiffusion/index'),
  require('./experiments/PBR/index'),
  require('./experiments/Tea/index'),
  require('./experiments/HelloWorld/index'),
  require('./experiments/Photograph/index'),
  require('./experiments/ParticleSystem/index'),
  require('./experiments/HDR/index'),
  require('./experiments/PBR-ImageBasedLighting/index'),
].map(ExperimentStore.registerExperiment.bind(ExperimentStore));

var App = React.createClass( {
  render: function() {
    return (
      <div id="site" className="container-fluid">
        {this.props.children}
      </div>
    );
  }
});

ReactDOM.render((
    <Router>
      <Route path="/" component={App}>
        <IndexRoute name="index" component={ExperimentIndex} />
        <Route name="exp" path="/exp/:experimentName" component={ExperimentDetail} />
      </Route>
    </Router>
  ), document.getElementById("app"));
