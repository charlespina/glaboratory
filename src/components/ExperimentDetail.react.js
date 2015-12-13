var React = require('react');
var ReactRouter = require('react-router');
var ExperimentActions = require('../actions/ExperimentActions');
var Link = ReactRouter.Link;

var ContentPanel = require('./ContentPanel.react');
var Sidebar = require('./Sidebar.react');

import ExperimentStore from '../stores/ExperimentStore';

var ExperimentDetail = React.createClass({
  getInitialState: function() {
    return this.getState();
  },

  getState: function() {
    return {
      experimentName: "",
    };
  },

  updateState: function() {
    this.setState(this.getState());
  },

  componentDidMount: function() {
    this.setExperiment(this.props.params.experimentName);
  },

  componentDidReceiveProps: function(props) {
    this.setExperiment(props.params.experimentName);
  },

  componentWillUnmount: function() {
  },

  setExperiment: function(name) {
    var experimentName = name.replace(/\+/g, ' ');
    var experiments = ExperimentStore.experiments;
    var activeExperimentIndex = 0;
    experiments.forEach(function(exp, i) {
      if (exp.name == experimentName) {
        activeExperimentIndex = i;
      }
    });
    var activeExperiment = experiments[activeExperimentIndex];
    ExperimentActions.setExperiment(activeExperiment);
    this.setState({experimentName: experimentName});
  },

  render: function() {
    return (
      <div className="experiment-viewer">
        <div className="topbar">
          <div className="ui breadcrumb">
            <div className="section">
              <Link to="/">Home</Link>
            </div>
            <div className="divider"> / </div>
            <div className="active section">{this.state.experimentName}</div>
          </div>
        </div>
        <div className="ui padded equal height grid content experiment-viewer-grid">
          <ContentPanel />
          <Sidebar />
        </div>
      </div>
    );
  }
});


module.exports = ExperimentDetail;
