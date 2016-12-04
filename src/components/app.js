const React = require('react');
const ReactDOM = require('react-dom');

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
      innerHeight: 1080,
      innerWidth: 1920,
      layers: [],
      outerHeight: 0,
      outerWidth: 0
    };
  },

  componentDidMount: function() {
    window.addEventListener('resize', this._onResize);
    this._onResize();
  },

  componentWillUnmount: function() {
    window.removeEventListener('resize', this._onResize);
  },

  _onResize: function() {
    const canvas = ReactDOM.findDOMNode(this.refs.canvas);
    const header = ReactDOM.findDOMNode(this.refs.header);
    this.setState({
      footerMaxHeight: (window.innerHeight - header.offsetHeight) / 2,
      outerHeight: canvas.offsetHeight,
      outerWidth: canvas.offsetWidth
    });
  },

  render: function() {
    return (
      <div className="pl-app">
        <Header ref="header"/>
        <div className="pl-app-content">
          <Sidebar width={this.state.sidebarWidth}>
            <Library assets={this.state.assets}/>
          </Sidebar>
          <Canvas innerHeight={this.state.innerHeight}
              innerWidth={this.state.innerWidth}
              outerHeight={this.state.outerHeight}
              outerWidth={this.state.outerWidth}
              ref="canvas"/>
        </div>
        <Footer maxHeight={this.state.footerMaxHeight}
            onResize={this._onResize}>
          <LayersPanel layers={this.state.layers}
              width={this.state.sidebarWidth}/>
          <Timeline/>
        </Footer>
      </div>
    );
  }
});

module.exports = App;
