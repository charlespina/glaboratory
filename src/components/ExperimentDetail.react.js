var React = require('react');
var ReactRouter = require('react-router');
var Link = ReactRouter.Link;

var ContentPanel = require('./ContentPanel.react');
var Sidebar = require('./Sidebar.react');

var ExperimentStore = require('../stores/ExperimentStore');

var ExperimentDetail = React.createClass({
  render: function() {

    var activeExperimentIndex = 0;
    var experimentName = this.props.params.experimentName.replace(/\+/g, ' ');
    var experiments = ExperimentStore.experiments;

    experiments.forEach(function(exp, i) {
      if (exp.name == experimentName) {
        activeExperimentIndex = i;
      }
    }.bind(this));

    var activeExperiment = experiments[activeExperimentIndex];

    return (
      <div className="experiment-viewer">
        <div className="topbar">
          <div className="ui breadcrumb">
            <div className="section">Home</div>
            <div className="divider"> / </div>
            <div className="active section">{activeExperiment.name}</div>
          </div>
        </div>
        <div className="ui padded equal height grid content experiment-viewer-grid">
          <ContentPanel experiment={activeExperiment}/>
          <Sidebar parameters={activeExperiment.parameters}/>
        </div>
      </div>
    );
  }
});


module.exports = ExperimentDetail;
