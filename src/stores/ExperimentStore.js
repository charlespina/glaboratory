import { ActionTypes } from '../actions/Actions';
import AppDispatcher from '../dispatchers/AppDispatcher';
var EventEmitter = require('events').EventEmitter;

class Store extends EventEmitter {
  constructor() {
    super();
  }

  emitChange() {
    this.emit('change');
  }

  addChangeListener(callback) {
    this.on('change', callback);
  }

  removeChangeListener(callback) {
    this.removeListener('change', callback);
  }
}

class ExperimentStore extends Store {
  constructor() {
    super();
    this.experiments = [];
    this.currentExperiment = null;
    this.dispatcherIndex = AppDispatcher.register((payload)=> {
      var action = payload.action;
      switch(action.type) {
        case ActionTypes.EXPERIMENT_SET:
          this.setExperiment(action.data);
          this.emitChange();
          break;
        case ActionTypes.EXPERIMENT_SETUP:
          this.setupExperiment(action.data);
          this.emitChange();
          break;
        default:
          console.log(action);
      }
    });
  }

  registerExperiment(experiment) {
    this.experiments.push(experiment);
  }

  setExperiment(experiment) {
    if (this.currentExperiment
      && experiment.name == this.currentExperiment.name)
      return;
    this.currentExperiment = experiment;
  }

  setupExperiment(context) {
    if (!this.currentExperiment)
      return;

    if (this.currentExperiment.isSetup)
      return;

    this.currentExperiment.setup(context);

    var exp = this.currentExperiment;
    context.addListener('update', exp.update.bind(exp));
    context.addListener('render', exp.render.bind(exp));
    context.addListener('dispose', exp.dispose.bind(exp));

    this.currentExperiment.isSetup = true;

  }
}

const singleton = new ExperimentStore();
export default singleton;
