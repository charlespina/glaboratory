var AppDispatcher = require('../dispatchers/AppDispatcher');

function register(context, methodName, actionType, isServerAction) {
  var dispatchMethod;

  if (isServerAction)
    dispatchMethod = AppDispatcher.handleServerAction.bind(AppDispatcher);
  else
    dispatchMethod = AppDispatcher.handleViewAction.bind(AppDispatcher);

  context[methodName] = function(data) {
    dispatchMethod({
      type: actionType,
      data: data
    })
  };
}

var _ = {
  types: {}
};

module.exports = {
  register: register,
  registerServerActions: function(context, actions) {
    Object.keys(actions).forEach(function(methodName) {
      _.types[actions[methodName]] = actions[methodName];
      register(context, methodName, actions[methodName], true);
    });
  },
  registerViewActions: function(context, actions) {
    Object.keys(actions).forEach(function(methodName) {
      _.types[actions[methodName]] = actions[methodName];
      register(context, methodName, actions[methodName], false);
    });
  },
  ActionTypes: _.types
};
