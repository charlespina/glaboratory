import { registerViewActions } from './Actions';

var viewActions = {
  setExperiment: "EXPERIMENT_SET",
  setupExperiment: "EXPERIMENT_SETUP",
};

var actions = {};
registerViewActions(actions, viewActions);

export default actions;
