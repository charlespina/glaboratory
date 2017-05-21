var React = require('react');
var ReactRouter = require('react-router');
import ExperimentActions from '../actions/ExperimentActions';
var Link = ReactRouter.Link;

var ContentPanel = require('./ContentPanel.react');
var Sidebar = require('./Sidebar.react');

import ExperimentStore from '../stores/ExperimentStore';

var ExperimentDetail = React.createClass({
  componentDidMount: function() {
    this.setExperiment(this.props.params.experimentName);
  },

  componentDidReceiveProps: function(props) {
    this.setExperiment(props.params.experimentName);
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
  },

  render: function() {
    var expName = this.props.params.experimentName.replace(/\+/g, ' ');
    return (
      <div className="experiment-detail">
        <div className="topbar">
          <div className="ui breadcrumb">
            <div className="section">
              <Link to="/">Experiments</Link>
            </div>
            <div className="divider"> / </div>
            <div className="active section">{expName}</div>
          </div>
        </div>
        <ContentPanel />
        <Sidebar />
      </div>
    );
  }
});


module.exports = ExperimentDetail;
