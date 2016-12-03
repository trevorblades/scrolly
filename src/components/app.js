const React = require('react');

const Header = require('./header');
const Library = require('./library');
const Timeline = require('./timeline');

const App = React.createClass({

  getInitialState: function() {
    return {
      assets: [],
      layers: []
    };
  },

  render: function() {
    return (
      <div className="pl-app">
        <Header/>
        <div className="pl-app-content">
          <Library assets={this.state.assets}/>
        </div>
        <Timeline layers={this.state.layers}/>
      </div>
    );
  }
});

module.exports = App;
