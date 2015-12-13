var Actions = require('./Actions');

var viewActions = {
  setExperiment: "EXPERIMENT_SET",
  setupExperiment: "EXPERIMENT_SETUP",
};

var actions = {};
Actions.registerViewActions(actions, viewActions);

module.exports = actions;
