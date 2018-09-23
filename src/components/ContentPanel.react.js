import React from 'react';
import WebGLView from './WebGLView.react';
import ExperimentStore from '../stores/ExperimentStore';
import ExperimentActions from '../actions/ExperimentActions';
import keycode from 'keycode';

class ContentPanel extends React.Component {
  constructor(props) {
    super(props);

    this.state = this.getState();
  }

  getState() {
    return {
      experiment: ExperimentStore.currentExperiment
    }
  }

  updateState() {
    if (this.state.experiment !== ExperimentStore.currentExperiment) {
      if (ExperimentStore.currentExperiment) this.init();
    }
    this.setState(this.getState());
  }

  init() {
    var context = this.refs.view.getContext();
    setTimeout(() => ExperimentActions.setupExperiment(context));
  }

  onKeyPress(e) {
    if (!this.state.experiment)
      return;

    this.state.experiment.getFlattenedParameters().forEach(function(param) {
      if (param.type == 'trigger' && param.hotKey == keycode(e.keyCode)) {
        param.fire();
      }
    });
  }

  componentDidMount() {
    ExperimentStore.addChangeListener(this.updateState.bind(this));
    $(window).on('keydown', this.onKeyPress.bind(this));
  }

  componentWillReceiveProps(props) {
    // this.refs.view.reset();
    this.updateState();
  }

  componentWillUnmount() {
    ExperimentStore.removeChangeListener(this.updateState);
    $(window).off('keydown', this.onKeyPress);
  }

  render() {
    var hotKeys;
    var experiment = this.state.experiment;
    if (experiment) {
      hotKeys = experiment.getFlattenedParameters().filter(function(param) {
        return (param.type == 'trigger' && param.hotKey !== undefined);
      }).map(function(param, i) {
        return (
          <tr className='hot-key' key={i}>
            <td>{param.name}</td>
            <td>{param.hotKey}</td>
          </tr>
        );
      });
    }

    var legend;
    if (hotKeys && hotKeys.length > 0) {
      legend = (
        <div className='legend'>
          <table className='ui inverted table'>
            <thead>
              <tr>
                <th>Action</th>
                <th>Key</th>
              </tr>
            </thead>
            <tbody>
              {hotKeys}
            </tbody>
          </table>
        </div>
      );
    }

    return (
      <div className="content-panel">
        <WebGLView key="glview" ref="view" />
        {legend}
      </div>
    );
  }
};

export default ContentPanel;
