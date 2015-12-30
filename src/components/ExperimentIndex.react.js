import ExperimentStore from '../stores/ExperimentStore';
var React = require('react');
var ReactRouter = require('react-router');
var Link = ReactRouter.Link;

var ExperimentIndex = React.createClass({
  render: function() {
    var experiments = ExperimentStore.experiments;
    var experimentList = experiments.map(function(exp, i) {
      return (
        <Link to={"exp/"+exp.name} key={i} className="ui card">
            <div className="image">
              <img src={exp.thumbnail} style={{width: "100%", height: "100%"}} />
            </div>
          <div className="content">
            <div className="header">
              {exp.name}
            </div>
            <div className="description">
              {exp.description}
            </div>
          </div>
        </Link>
      );
    });

    return (
      <div>
        <div className="topbar">
          <div className="ui breadcrumb">
            <div className="active section">Experiments</div>
          </div>
        </div>
        <div className="experiment-index">
          <div className="ui five cards">
            {experimentList}
          </div>
        </div>
      </div>
    );
  }
});

module.exports = ExperimentIndex;
