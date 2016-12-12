const React = require('react');
const ReactDOM = require('react-dom');

const Header = require('./header');
const Inspector = require('./inspector');
const Library = require('./library');
const Sidebar = require('./sidebar');
const Timeline = require('./timeline');
const Viewport = require('./viewport');

const TEST_LAYERS = {
  default: {
    id: 'default',
    type: 'image',
    name: 'Imagery',
    x: 100,
    y: 100,
    in: 0,
    out: 1,
    visible: true
  },
  text0: {
    id: 'text0',
    type: 'text',
    name: 'Some text',
    value: 'Hey',
    x: 100,
    y: 100,
    in: 0,
    out: 1,
    visible: true,
    fontSize: 48,
    fontStyle: 'italic'
  },
  text1: {
    id: 'text1',
    type: 'text',
    name: 'Some more text',
    value: 'Hi',
    x: 240,
    y: 400,
    in: 0,
    out: 1,
    visible: true,
    fontSize: 24
  },
  text2: {
    id: 'text2',
    type: 'text',
    name: 'Even more text',
    value: 'Ho',
    x: 960,
    y: 120,
    in: 0,
    out: 1,
    visible: true,
    fontSize: 16
  }
};

const App = React.createClass({

  getInitialState: function() {
    return {
      assets: [],
      compositionHeight: 1080,
      compositionWidth: 1920,
      layers: TEST_LAYERS,
      viewportWrapperHeight: 0,
      viewportWrapperWidth: 0,
      percentPlayed: 0,
      selectedLayer: null,
      timelineMaxHeight: 0
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
    const header = ReactDOM.findDOMNode(this.refs.header);
    const viewportWrapperStyle = getComputedStyle(this.refs.viewportWrapper, null);
    this.setState({
      viewportWrapperHeight: parseFloat(viewportWrapperStyle.height),
      viewportWrapperWidth: parseFloat(viewportWrapperStyle.width),
      timelineMaxHeight: (window.innerHeight - header.offsetHeight) / 2
    });
  },

  _onKeyDown: function(event) {
    if (event.keyCode === 27) { // Escape key pressed
      if (event.target.contentEditable === 'true') { // It happened on a text layer
        return event.target.blur();
      }
      this._selectLayer(null);
    }
  },

  _setLayerProperties: function(id, properties) {
    const layers = JSON.parse(JSON.stringify(this.state.layers));
    Object.assign(layers[id], properties);
    this.setState({layers: layers});
  },

  _setPercentPlayed: function(value) {
    if (value < 0) {
      value = 0;
    } else if (value > 1) {
      value = 1;
    }
    this.setState({percentPlayed: value});
  },

  _selectLayer: function(id) {
    this.setState({selectedLayer: id}, function() {
      if (this.state.selectedLayer) {
        document.addEventListener('keydown', this._onKeyDown);
      } else {
        document.removeEventListener('keydown', this._onKeyDown);
      }
    });
  },

  render: function() {
    return (
      <div className="pl-app">
        <Header ref="header"/>
        <div className="pl-app-content">
          <Sidebar>
            <Library assets={this.state.assets}/>
            {this.state.selectedLayer &&
              <Inspector layer={this.state.layers[this.state.selectedLayer]}
                  setLayerProperties={this._setLayerProperties}/>}
          </Sidebar>
          <div className="pl-app-viewport-wrapper" ref="viewportWrapper">
            <Viewport compositionHeight={this.state.compositionHeight}
                compositionWidth={this.state.compositionWidth}
                layers={this.state.layers}
                percentPlayed={this.state.percentPlayed}
                selectLayer={this._selectLayer}
                selectedLayer={this.state.selectedLayer}
                setLayerProperties={this._setLayerProperties}
                wrapperHeight={this.state.viewportWrapperHeight}
                wrapperWidth={this.state.viewportWrapperWidth}/>
          </div>
        </div>
        <Timeline layers={this.state.layers}
            maxHeight={this.state.timelineMaxHeight}
            onResize={this._onResize}
            percentPlayed={this.state.percentPlayed}
            selectLayer={this._selectLayer}
            selectedLayer={this.state.selectedLayer}
            setLayerProperties={this._setLayerProperties}
            setPercentPlayed={this._setPercentPlayed}/>
      </div>
    );
  }
});

module.exports = App;
