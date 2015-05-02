var React = require('react');
var Router = require('react-router');
var Route = Router.Route;
var RouteHandler = Router.RouteHandler;
var BS = require('react-bootstrap');
var WebGLView = require('./components/WebGLView.react');

var ContentPanel = React.createClass({
  componentDidMount: function() {
    var context = this.refs.view.getContext();

    var mesh;
    context.once('update', function() {
      var geo = new THREE.SphereGeometry(100, 64, 64);
      var material = new THREE.MeshBasicMaterial({ color: new THREE.Color(0xFF0000) });
      mesh = new THREE.Mesh(geo, material);
      context.scene.add(mesh);
    });

    context.addListener('update', function(dt) {
      this.t = (this.t||0) + dt;
      mesh.position.y = Math.sin(this.t/5000 * Math.PI) * 20;
    });
  },

  render: function() {
    return (
      <div className="col-xs-7 col-sm-9 content-panel">
        <WebGLView ref="view" />
      </div>
    );
  }
});

var Sidebar = React.createClass({
  render: function() {
    var Button = BS.Button;
    var ButtonToolbar = BS.ButtonToolbar;
    return (
      <div className="col-xs-5 col-sm-3 sidebar">
        <ButtonToolbar vertical>
          <Button bsStyle="primary" block>Hello Yes</Button>
          <Button bsStyle="primary" block>Hello Yes</Button>
        </ButtonToolbar>
      </div>
    );
  }
});

var Routes;

var App = React.createClass({
  render: function() {
    var Navbar = BS.Navbar;
    return (
      <div id="site" className="container-fluid">
        <div className="row">
          <Navbar />
          <ContentPanel />
          <Sidebar />
        </div>
      </div>
    );
  }
});

var routes = (
  <Route name="app" path="/" handler={App} />
);

Router.run(routes, function(Handler, state) {
  React.render(<Handler />, document.getElementById("app"));
});
