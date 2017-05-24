const React = require('react');
const {findDOMNode} = require('react-dom');

const Button = require('./button');
const Icon = require('./icon');

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
            <div className="sv-library-presets-panel-item">
              <div className="sv-library-presets-panel-item-asset" draggable>
                <svg fill="none" stroke="black" strokeWidth={2} viewBox="0 0 102 102">
                  <circle cx={51} cy={51} r={50}/>
                </svg>
              </div>
            </div>
            <div className="sv-library-presets-panel-item">
              <div className="sv-library-presets-panel-item-asset" draggable>
                <svg fill="none" stroke="black" strokeWidth={2} viewBox="0 0 102 102">
                  <rect height={100} width={100} x={1} y={1}/>
                </svg>
              </div>
            </div>
          </div>
        </div>}
      </div>
    );
  }
});

module.exports = Presets;
