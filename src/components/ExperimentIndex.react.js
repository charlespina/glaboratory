var React = require('react');
import ExperimentStore from '../stores/ExperimentStore';
var ReactRouter = require('react-router');
var Link = ReactRouter.Link;

var ExperimentIndex = React.createClass({
  render: function() {
    var experiments = ExperimentStore.experiments;
    var experimentList = experiments.map(function(exp, i) {
      return (
        <li key={i}>
          <Link to={"exp/"+exp.name}>
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

module.exports = ExperimentIndex;
