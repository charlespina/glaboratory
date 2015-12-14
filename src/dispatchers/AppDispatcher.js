var Dispatcher = require('flux').Dispatcher;
var assign = require('object-assign');

class AppDispatcher extends Dispatcher {
  constructor() {
    super();
  }
  
  handleServerAction(action) {
    var payload = {
      source: "SERVER_ACTION",
      action: action
    };
    this.dispatch(payload);
  }

  handleViewAction(action) {
    var payload = {
      source: "VIEW_ACTION",
      action: action
    };
    this.dispatch(payload);
  }
}

var singleton = new AppDispatcher();
export default singleton;
