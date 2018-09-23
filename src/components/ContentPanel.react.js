var React = require('react');
var WebGLView = require('./WebGLView.react');
import ExperimentStore from '../stores/ExperimentStore';
import ExperimentActions from '../actions/ExperimentActions';
var keycode = require('keycode');

var ContentPanel = React.createClass({
  getState: function() {
    return {
      experiment: ExperimentStore.currentExperiment
    }
  },

  updateState: function() {
    if (this.state.experiment !== ExperimentStore.currentExperiment) {
      if (ExperimentStore.currentExperiment) this.init();
    }
    this.setState(this.getState());
  },

  getInitialState: function() {
    return this.getState();
  },

  init: function() {
    var context = this.refs.view.getContext();
    setTimeout(ExperimentActions.setupExperiment.bind(ExperimentActions, context));
  },

  onKeyPress: function(e) {
    if (!this.state.experiment)
      return;

    this.state.experiment.getFlattenedParameters().forEach(function(param) {
      if (param.type == 'trigger' && param.hotKey == keycode(e.keyCode)) {
        param.fire();
      }
    });
  },

  componentDidMount: function() {
    ExperimentStore.addChangeListener(this.updateState);
    $(window).on('keydown', this.onKeyPress);
  },

  componentWillReceiveProps: function(props) {
    // this.refs.view.reset();
    this.updateState();
  },

  componentWillUnmount: function() {
    ExperimentStore.removeChangeListener(this.updateState);
    $(window).off('keydown', this.onKeyPress);
  },

  render: function() {
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
});

export default ContentPanel;
