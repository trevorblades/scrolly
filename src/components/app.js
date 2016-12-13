const React = require('react');
const ReactDOM = require('react-dom');
const {connect} = require('react-redux');

const Header = require('./header');
const Inspector = require('./inspector');
const Library = require('./library');
const Sidebar = require('./sidebar');
const Timeline = require('./timeline');
const Viewport = require('./viewport');

let App = React.createClass({

  propTypes: {
    layers: React.PropTypes.array.isRequired
  },

  getInitialState: function() {
    return {
      assets: [],
      compositionHeight: 1080,
      compositionWidth: 1920,
      viewportWrapperHeight: 0,
      viewportWrapperWidth: 0,
      percentPlayed: 0,
      selectedLayerId: null,
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
      if (event.target.contentEditable === 'true' ||
          event.target.tagName.toUpperCase() === 'INPUT') {
        return event.target.blur();
      }
      this._selectLayer(null);
    }
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
    this.setState({selectedLayerId: id}, function() {
      if (this.state.selectedLayerId !== null) {
        document.addEventListener('keydown', this._onKeyDown);
      } else {
        document.removeEventListener('keydown', this._onKeyDown);
      }
    });
  },

  render: function() {
    const layer = this.props.layers.filter(l => l.id === this.state.selectedLayerId)[0];
    return (
      <div className="pl-app">
        <Header ref="header"/>
        <div className="pl-app-content">
          <Sidebar>
            <Library assets={this.state.assets}/>
            {layer && <Inspector layer={layer}/>}
          </Sidebar>
          <div className="pl-app-viewport-wrapper" ref="viewportWrapper">
            <Viewport compositionHeight={this.state.compositionHeight}
                compositionWidth={this.state.compositionWidth}
                percentPlayed={this.state.percentPlayed}
                selectLayer={this._selectLayer}
                selectedLayerId={this.state.selectedLayerId}
                wrapperHeight={this.state.viewportWrapperHeight}
                wrapperWidth={this.state.viewportWrapperWidth}/>
          </div>
        </div>
        <Timeline maxHeight={this.state.timelineMaxHeight}
            onResize={this._onResize}
            percentPlayed={this.state.percentPlayed}
            selectLayer={this._selectLayer}
            selectedLayerId={this.state.selectedLayerId}
            setPercentPlayed={this._setPercentPlayed}/>
      </div>
    );
  }
});

module.exports = connect(function(state) {
  return {layers: state.layers};
})(App);
