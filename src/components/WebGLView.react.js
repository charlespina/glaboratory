var React = require('react');
var ReactDOM = require('react-dom');
var Context = require('../core/Context');
var $ = require('jquery');

var WebGLView = React.createClass({
  render: function() {
    return <div className="context" ref="ctx"></div>;
  },

  getContext: function() {
    return this.ctx;
  },

  getContainer: function() {
    return ReactDOM.findDOMNode(this.refs.ctx);
  },

  resize: function() {
    if (this.ctx) {
      this.ctx.resize();
    }
  },

  init: function() {
    this.ctx = new Context(this.getContainer());
  },

  reset: function() {
    this.dispose();
    this.init();
  },

  dispose: function() {
    $(this.getContainer()).empty();
    if (this.ctx) {
      this.ctx.dispose();
      this.ctx = null;
    }
  },

  componentDidReceiveProps: function() {
    $(window).resize(this.resize);
    this.reset();
  },

  componentDidMount: function() {
    $(window).resize(this.resize);
    this.reset();
  },

  componentWillUnmount: function() {
    this.dispose();
  }
});

module.exports = WebGLView;
