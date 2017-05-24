const React = require('react');

const Button = require('./button');

const Presets = React.createClass({
  getInitialState: function() {
    return {
      panelShown: false
    };
  },

  _onButtonClick: function() {
    this.setState(prevState => ({panelShown: !prevState.panelShown}));
  },

  render: function() {
    return (
      <div className="sv-library-presets">
        <Button onClick={this._onButtonClick}>Preset assets</Button>
        {this.state.panelShown && <div className="sv-library-presets-panel">
          <h5>Preset assets</h5>
          <div className="sv-library-presets-panel-scroll">
            <div className="sv-library-presets-panel-item">
              <div className="sv-library-presets-panel-item-asset"/>
            </div>
            <div className="sv-library-presets-panel-item">
              <div className="sv-library-presets-panel-item-asset"/>
            </div>
            <div className="sv-library-presets-panel-item">
              <div className="sv-library-presets-panel-item-asset"/>
            </div>
            <div className="sv-library-presets-panel-item">
              <div className="sv-library-presets-panel-item-asset"/>
            </div>
            <div className="sv-library-presets-panel-item">
              <div className="sv-library-presets-panel-item-asset"/>
            </div>
            <div className="sv-library-presets-panel-item">
              <div className="sv-library-presets-panel-item-asset"/>
            </div>
            <div className="sv-library-presets-panel-item">
              <div className="sv-library-presets-panel-item-asset"/>
            </div>
            <div className="sv-library-presets-panel-item">
              <div className="sv-library-presets-panel-item-asset"/>
            </div>
            <div className="sv-library-presets-panel-item">
              <div className="sv-library-presets-panel-item-asset"/>
            </div>
            <div className="sv-library-presets-panel-item">
              <div className="sv-library-presets-panel-item-asset"/>
            </div>
          </div>
        </div>}
      </div>
    );
  }
});

module.exports = Presets;
