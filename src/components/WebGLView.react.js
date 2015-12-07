var React = require('react');
var ReactDOM = require('react-dom');
var THREE = require('./../lib/three');
var $ = require('jquery');
var EventEmitter = require('events').EventEmitter;
var assign = require('object-assign');

var Context = function(container) {
  this.container = container;
  this.isPaused = false;

  this.init();

  this.renderer = new THREE.WebGLRenderer();
  $(this.container).append(this.renderer.domElement);
  this.resize();

  this.time = new Date();

  this.emit('scene-setup');

  // setup render callbacks
  this.animate();
}

Context.prototype = assign(Context.prototype, EventEmitter.prototype);

Context.prototype.init = function() {
  var aspect = this.getWidth()/this.getHeight();
  this.camera = new THREE.PerspectiveCamera(70, aspect, 1, 1000);
  this.camera.position.z = 400;
  this.scene = new THREE.Scene();
}

Context.prototype.setPaused = function(v) {
  this.isPaused = v;
}

Context.prototype.dispose = function() {
  this.removeAllListeners();
  this.disposed = true;
  this.renderer.dispose();
}

Context.prototype.resize  = function() {
  this.renderer.setSize(this.getWidth(), this.getHeight());
  this.camera.aspect = this.getWidth()/this.getHeight();
  this.camera.updateProjectionMatrix();
}

Context.prototype.renderDefaultCamera = function() {
  if (this.renderer)
    this.renderer.render(this.scene, this.camera);
}

Context.prototype.animate = function() {
  if (this.disposed)
    return;

  setTimeout(requestAnimationFrame.bind(null, this.animate.bind(this)), 60);

  if (this.isPaused)
    return;

  var now = new Date();
  this.emit('update', (now - this.time), this);

  if (!this.emit('render', this))
    this.renderDefaultCamera();

  this.time = now;
}

Context.prototype.getWidth = function() {
  return $(this.container).innerWidth();
}

Context.prototype.getHeight = function() {
  return $(this.container).innerHeight();
}

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
    $(this.getContainer()).empty();
    if (this.ctx) {
      this.ctx.dispose();
      this.ctx = null;
    }
  },

  componentDidReceiveProps: function() {
    $(window).resize(this.resize);
    this.reset();
    this.init();
  },

  componentDidMount: function() {
    $(window).resize(this.resize);
    this.reset();
    this.init();
  },

  componentWillUnmount: function() {
    this.reset();
  }
});

module.exports = WebGLView;
