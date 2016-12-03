const React = require('react');

const Canvas = require('./canvas');
const Header = require('./header');
const Library = require('./library');
const Timeline = require('./timeline');

const App = React.createClass({

  getInitialState: function() {
    return {
      assets: [],
      height: 1080,
      layers: [],
      width: 1920
    };
  },

  render: function() {
    return (
      <div className="pl-app">
        <Header/>
        <div className="pl-app-content">
          <Library assets={this.state.assets}/>
          <Canvas height={this.state.height} width={this.state.width}/>
        </div>
        <Timeline layers={this.state.layers}/>
      </div>
    );
  }
});

module.exports = App;
