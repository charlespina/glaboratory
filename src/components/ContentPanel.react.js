var React = require('react');
var WebGLView = require('./WebGLView.react');
var keycode = require('keycode');

var ContentPanel = React.createClass({
  init: function(experiment) {
    if (!experiment) return;

    var context = this.refs.view.getContext();
    experiment.setup(context);
    context.addListener('update', experiment.update.bind(experiment));
    context.addListener('render', experiment.render.bind(experiment));
    context.addListener('dispose', experiment.dispose.bind(experiment));
  },

  onKeyPress: function(e) {
    this.props.experiment.getFlattenedParameters().forEach(function(param) {
      if (param.type == 'trigger' && param.hotKey == keycode(e.keyCode)) {
        param.fire();
      }
    });
  },

  componentDidMount: function() {
    this.init(this.props.experiment);
    $(window).on('keydown', this.onKeyPress);
  },

  componentWillReceiveProps: function(props) {
    this.refs.view.reset();
    this.init(props.experiment);
  },

  componentWillUnmount: function() {
    $(window).off('keydown', this.onKeyPress);
  },

  render: function() {
    var hotKeys;
    if (this.props.experiment) {
      hotKeys = this.props.experiment.getFlattenedParameters().filter(function(param) {
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
      <div className="twelve wide column content-panel">
        <WebGLView ref="view" />
        {legend}
      </div>
    );
  }
});

module.exports = ContentPanel;
