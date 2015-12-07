var React = require('react');
var WebGLView = require('./WebGLView.react');


var ContentPanel = React.createClass({
  init: function(experiment) {
    if (!experiment) return;

    var context = this.refs.view.getContext();
    experiment.setup(context);
    context.addListener('update', experiment.update.bind(experiment));
    context.addListener('render', experiment.render.bind(experiment));
  },

  componentDidMount: function() {
    this.init(this.props.experiment);
  },

  componentWillReceiveProps: function(props) {
    this.refs.view.reset();
    this.init(props.experiment);
  },

  render: function() {
    return (
      <div className="twelve wide column content-panel">
        <WebGLView ref="view" />
      </div>
    );
  }
});

module.exports = ContentPanel;
