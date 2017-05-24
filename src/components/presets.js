const React = require('react');
const {findDOMNode} = require('react-dom');

const Button = require('./button');
const Icon = require('./icon');

const {PRESET_DRAG_TYPE} = require('../constants');

const presets = {
  circle: (
    <svg fill="none" stroke="black" strokeWidth={2} viewBox="0 0 102 102">
      <circle cx={51} cy={51} r={50}/>
    </svg>
  ),
  square: (
    <svg fill="none" stroke="black" strokeWidth={2} viewBox="0 0 102 102">
      <rect height={100} width={100} x={1} y={1}/>
    </svg>
  )
};

const Presets = React.createClass({
  getInitialState: function() {
    return {
      panelShown: false
    };
  },

  componentWillMount: function() {
    document.body.addEventListener('click', this._onBodyClick);
  },

  componentWillUnmount: function() {
    document.body.removeEventListener('click', this._onBodyClick);
  },

  _onBodyClick: function(event) {
    if (!findDOMNode(this).contains(event.target)) {
      this._closePanel();
    }
  },

  _onButtonClick: function() {
    this.setState(prevState => ({panelShown: !prevState.panelShown}));
  },

  _onDragStart: function(id, event) {
    event.dataTransfer.setData(PRESET_DRAG_TYPE, id);
  },

  _closePanel: function() {
    this.setState({panelShown: false});
  },

  render: function() {
    return (
      <div className="sv-library-presets">
        <Button onClick={this._onButtonClick}>Preset assets</Button>
        {this.state.panelShown && <div className="sv-library-presets-panel">
          <h5>
            <span>Preset assets</span>
            <a onClick={this._closePanel}>
              <Icon name="close"/>
            </a>
          </h5>
          <div className="sv-library-presets-panel-scroll">
            {Object.keys(presets).map(key => (
              <div className="sv-library-presets-panel-item" key={key}>
                <div className="sv-library-presets-panel-item-asset" draggable onDragStart={event => this._onDragStart(key, event)}>
                  {presets[key]}
                </div>
              </div>
            ))}
          </div>
        </div>}
      </div>
    );
  }
});

module.exports = Presets;
