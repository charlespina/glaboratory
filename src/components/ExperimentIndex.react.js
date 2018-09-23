import ExperimentStore from '../stores/ExperimentStore';
import React, { Component } from 'react';
import { Link } from 'react-router-dom';

console.log('react component', Component);

export default class ExperimentIndex extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    var experiments = ExperimentStore.experiments;
    console.log('experiments', experiments);
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
      <div className="experiment-index">
        <div className="topbar">
          <div className="ui breadcrumb">
            <div className="active section">Experiments</div>
          </div>
        </div>
        <div className="content">
          <div className="ui five cards">
            {experimentList}
          </div>
        </div>
      </div>
    );
  }
}
