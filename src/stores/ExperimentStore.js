import { ActionTypes } from '../actions/Actions';
import AppDispatcher from '../dispatchers/AppDispatcher';
import { EventEmitter } from 'events';

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
    if (this.currentExperiment) {
      // this.teardownExperiment();
    }

    this.currentExperiment = experiment;
  }

  setupExperiment(context) {
    var exp = this.currentExperiment;

    if (!exp) {
      console.warn('no experiment to setup');
      return;
    }

    if (exp.isSetup) {
      console.warn('experiment is already setup');
      return;
    }

    console.info('setting up experiment with', context && context.contextId);

    exp.setup(context);

    context.addListener('update', exp.update.bind(exp));
    context.addListener('render', exp.render.bind(exp));
    context.addListener('dispose', exp.dispose.bind(exp));
    context.addListener('resize', exp.resize.bind(exp));

    exp.isSetup = true;
  }

  teardownExperiment() {
    var exp = this.currentExperiment;
    exp.isSetup = false;
  }
}

const singleton = new ExperimentStore();
export default singleton;
