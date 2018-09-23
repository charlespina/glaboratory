import React from 'react';
import ReactDOM from 'react-dom';
import Context from '../core/Context';
import $ from 'jquery';

class WebGLView extends React.Component {
  render() {
    return <div className="context" ref="ctx"></div>;
  }

  getContext() {
    return this.ctx;
  }

  getContainer() {
    return ReactDOM.findDOMNode(this.refs.ctx);
  }

  resize() {
    if (this.ctx) {
      this.ctx.resize();
    }
  }

  init() {
    this.ctx = new Context(this.getContainer());
  }

  reset() {
    this.dispose();
    this.init();
  }

  dispose() {
    $(this.getContainer()).empty();
    if (this.ctx) {
      this.ctx.dispose();
      this.ctx = null;
    }
  }

  componentWillReceiveProps() {
    $(window).resize(this.resize);
    this.reset();
  }

  componentDidMount() {
    $(window).resize(this.resize);
    this.reset();
  }

  componentWillUnmount() {
    this.dispose();
  }
};

export default WebGLView;
