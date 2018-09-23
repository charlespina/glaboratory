import ExperimentStore from './stores/ExperimentStore';
import * as THREE from 'three';

require("./css/main.scss");

import React from 'react';
import ReactDOM from 'react-dom';
import { Route, BrowserRouter as Router, Link } from 'react-router-dom';
import ExperimentIndex from './components/ExperimentIndex.react';
import ExperimentDetail from './components/ExperimentDetail.react';


[ require('./experiments/EnvironmentBlur/index').default,
  require('./experiments/ReactionDiffusion/index').default,
  require('./experiments/PBR/index').default,
  require('./experiments/Tea/index').default,
  require('./experiments/HelloWorld/index').default,
  require('./experiments/Photograph/index').default,
  require('./experiments/ParticleSystem/index').default,
  // require('./experiments/HDR/index').default,
  // require('./experiments/PBR-ImageBasedLighting/index').default,
  require('./experiments/Grid/index').default,
  require('./experiments/Hologram/index').default,
  require('./experiments/MatterPaint/index').default,
].map(ExperimentStore.registerExperiment.bind(ExperimentStore));

const App = () => {
  return (
    <Router>
      <div id="site">
        <Route name="index"
          path="/"
          exact
          component={ExperimentIndex} />
        <Route
          name="exp"
          path="/exp/:experimentName"
          component={({match}) => <ExperimentDetail experimentName={match.params.experimentName} />} />
      </div>
    </Router>
  );
  /*
      <Router>
        <Route name="index"
          path="/"
          exact
          component={ExperimentIndex} />
      </Router>
  */
};

ReactDOM.render((
    <App />
  ), document.getElementById("app"));
