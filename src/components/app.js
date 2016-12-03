const React = require('react');

const Canvas = require('./canvas');
const Footer = require('./footer');
const Header = require('./header');
const LayersPanel = require('./layers-panel');
const Library = require('./library');
const Sidebar = require('./sidebar');
const Timeline = require('./timeline');

const App = React.createClass({

  getInitialState: function() {
    return {
      assets: [],
      compositionHeight: 1080,
      compositionWidth: 1920,
      layers: [],
      sidebarWidth: 360
    };
  },

  render: function() {
    return (
      <div className="pl-app">
        <Header/>
        <div className="pl-app-content">
          <Sidebar width={this.state.sidebarWidth}>
            <Library assets={this.state.assets}/>
          </Sidebar>
          <Canvas height={this.state.compositionHeight}
              width={this.state.compositionWidth}/>
        </div>
        <Footer>
          <LayersPanel layers={this.state.layers}
              width={this.state.sidebarWidth}/>
          <Timeline/>
        </Footer>
      </div>
    );
  }
});

module.exports = App;
