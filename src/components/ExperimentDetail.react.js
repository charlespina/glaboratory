import React from 'react';
import { Link } from 'react-router-dom';
import ExperimentActions from '../actions/ExperimentActions';

import ContentPanel from './ContentPanel.react';
import Sidebar from './Sidebar.react';

import ExperimentStore from '../stores/ExperimentStore';

class ExperimentDetail extends React.Component {
  componentDidMount() {
    this.setExperiment(this.props.experimentName);
  }

  componentWillReceiveProps(props) {
    this.setExperiment(props.experimentName);
  }

  setExperiment(name) {
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
  }

  render() {
    var expName = this.props.experimentName.replace(/\+/g, ' ');
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
};


export default ExperimentDetail;
