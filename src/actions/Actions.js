import AppDispatcher from '../dispatchers/AppDispatcher';

export function register(context, methodName, actionType, isServerAction) {
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

var ActionTypes = {};

export function registerServerAction(context, actions) {
  Object.keys(actions).forEach(function(methodName) {
    ActionTypes[actions[methodName]] = actions[methodName];
    register(context, methodName, actions[methodName], true);
  });
}

export function registerViewActions(context, actions) {
  Object.keys(actions).forEach(function(methodName) {
    ActionTypes[actions[methodName]] = actions[methodName];
    register(context, methodName, actions[methodName], false);
  });
}

export { ActionTypes };
