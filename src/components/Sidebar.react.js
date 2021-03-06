import React from 'react';
import ReactDOM from 'react-dom';
import SliderInput from './SliderInput.react';
import ColorPickerInput from './ColorPickerInput.react';
import ExperimentStore from '../stores/ExperimentStore';
import classnames from 'classnames';

class GenericInput extends React.Component {
  constructor(props) {
    super(props);
  }

  toggleAccordion() {
    var shouldReveal = !this.props.param.active;
    this.props.param.active = shouldReveal;

    var transition;

    if (shouldReveal) {
      transition = {
        animation: 'fade', // 'drop'
      };
      $(ReactDOM.findDOMNode(this.refs.accordionContent)).transition(transition);
    }
    this.forceUpdate(); // reveal before animation
  }

  onDropdownChange(e) {
    var name = e.target.value;
    var choice;
    this.props.param.choices.forEach(function(c) {
      if (c.name == name)
        choice = c;
    });

    if (choice)
      this.props.param.setValue(choice);

    e.target.blur();
  }

  render() {
    var param = this.props.param;
    var children;
    if (param.groupedType || param.type == 'group') {
      children = param.parameters.map(function(p, i) {
        return <GenericInput param={p} key={i} />;
      });
    }

    if (param.type == 'c') {
      return (
        <div className="ui form">
          <div className="field">
            <label>{param.name}</label>
            <ColorPickerInput parameter={param} />
          </div>
        </div>
      );
    } else if (param.type =='i' || param.type == 'f'){
      return (
        <div className="ui form">
          <div className="field">
            <label>{param.name}</label>
            <SliderInput parameter={param} />
          </div>
        </div>
      );
    } else if (param.type == 'group') {
      return (
        <div>
          <div className={classnames("fluid", "title", {"active": param.active})} onClick={this.toggleAccordion}>
            {param.name}
            <i className="ui right floated dropdown icon"></i>
          </div>
          <div className={classnames("content", {"active": param.active})}>
            <div ref="accordionContent">
              {children}
            </div>
          </div>
        </div>
      );
    } else if (param.type == 'accordion') {
      return (
        <div className="ui fluid styled accordion">
          {children}
        </div>
      );
    } else if (param.type == 'trigger') {
      return (
        <div className='ui fluid button' onClick={param.fire.bind(param)}>
          {param.name}
        </div>
      );
    } else if (param.type == 'menu') {
      return (
        <div className='ui fluid small vertical menu'>
          {children}
        </div>
      );
    } else if (param.type == 'choice') {
      var choices = param.choices.map(function(choice, i) {
        return <option key={i} value={choice.name}>{choice.name}</option>;
      });
      return (
        <select className='ui mini fluid dropdown'
          defaultValue={param.value.name}
          onChange={this.onDropdownChange.bind(this)}>
          {choices}
        </select>
      );
    }
  }
};

class Sidebar extends React.Component {
  constructor(props) {
    super(props);
    this.state = this.getState();
  }

  getState() {
    if (ExperimentStore.currentExperiment) {
      return {
        parameters: ExperimentStore.currentExperiment.parameters
      };
    } else {
      return {
        parameters: []
      }
    }
  }

  updateState() {
    this.setState(this.getState());
  }

  componentDidMount() {
    ExperimentStore.addChangeListener(this.updateState.bind(this));
  }

  componentWillUnmount() {
    ExperimentStore.removeChangeListener(this.updateState);
  }

  coalesceGroups() {
    if (!this.state.parameters)
      return [];

    var coalesced = [];
    var container = null;
    var remap = {
      'group': 'accordion',
      'trigger': 'menu',
    };

    this.state.parameters.forEach(function(param, i) {
      var remappedType = remap[param.type];
      if (remappedType !== undefined) {
        if (container === null || container.type != remappedType) {
          container = {
            type: remappedType,
            groupedType: param.type,
            parameters: []
          };
          coalesced.push(container);
        }
        container.parameters.push(param);
      } else {
        container = null;
        coalesced.push(param);
      }
    });
    return coalesced;
  }

  render() {
    var inGroup = false;
    var coalescedGroups = [];

    var inputs = this.coalesceGroups().map(function(param, i) {
      return <GenericInput param={param} key={i} />;
    });

    return (
      <div className="sidebar">
        {inputs}
      </div>
    );
  }
};

export default Sidebar;
