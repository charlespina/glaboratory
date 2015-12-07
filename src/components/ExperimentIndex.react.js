var React = require('react');
var ExperimentStore = require('../stores/ExperimentStore');
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
        <h1>Hello?</h1>
        <div>
          {experimentList}
        </div>
      </div>
    );
  }
});

module.exports = ExperimentIndex;
