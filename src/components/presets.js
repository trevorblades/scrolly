const React = require('react');
const {findDOMNode} = require('react-dom');

const Button = require('./button');
const Icon = require('./icon');

const {SHAPES, SHAPE_DRAG_TYPE} = require('../constants');

const Presets = React.createClass({
  getInitialState: function() {
    return {
      panelShown: false
    };
  },

  componentWillMount: function() {
    window.addEventListener('keydown', this._onKeyDown);
    document.body.addEventListener('click', this._onBodyClick);
  },

  componentWillUnmount: function() {
    window.removeEventListener('keydown', this._onKeyDown);
    document.body.removeEventListener('click', this._onBodyClick);
  },

  _onKeyDown: function(event) {
    if (this.state.panelShown && event.keyCode === 27) { // esc key pressed
      this._closePanel();
    }
  },

  _onBodyClick: function(event) {
    if (this.state.panelShown && !findDOMNode(this).contains(event.target)) {
      this._closePanel();
    }
  },

  _onButtonClick: function() {
    this.setState(prevState => ({panelShown: !prevState.panelShown}));
  },

  _onDragStart: function(id, event) {
    event.dataTransfer.setData(SHAPE_DRAG_TYPE, id);
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
            {Object.keys(SHAPES).map(key => (
              <div className="sv-library-presets-panel-item" key={key}>
                <div className="sv-library-presets-panel-item-asset" draggable onDragStart={event => this._onDragStart(key, event)}>
                  {SHAPES[key]}
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
