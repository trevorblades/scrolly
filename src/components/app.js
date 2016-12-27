const React = require('react');
const ReactDOM = require('react-dom');
const {connect} = require('react-redux');
const {ActionCreators} = require('redux-undo');

const Header = require('./header');
const Library = require('./library');
const Timeline = require('./timeline');
const Viewport = require('./viewport');

const {FILE_DRAG_TYPE} = require('../constants');
const isDragTypeFound = require('../util/is-drag-type-found');
const layerPropType = require('../util/layer-prop-type');

const App = React.createClass({

  propTypes: {
    dispatch: React.PropTypes.func.isRequired,
    layers: React.PropTypes.arrayOf(layerPropType).isRequired
  },

  getInitialState: function() {
    return {
      compositionHeight: 1080,
      compositionWidth: 1920,
      dragging: false,
      viewportWrapperHeight: 0,
      viewportWrapperOffsetLeft: 0,
      viewportWrapperOffsetTop: 0,
      viewportWrapperWidth: 0,
      percentPlayed: 0,
      selectedLayerId: null,
      timelineMaxHeight: 0
    };
  },

  componentWillMount: function() {
    this._dragCounter = 0;
  },

  componentDidMount: function() {
    window.addEventListener('keydown', this._onKeyDown);
    window.addEventListener('resize', this._onResize);
    this._onResize();
  },

  componentWillUnmount: function() {
    window.removeEventListener('keydown', this._onKeyDown);
    window.removeEventListener('resize', this._onResize);
  },

  _onKeyDown: function(event) {
    const tagName = event.target.tagName.toUpperCase();
    const isInput = event.target.contentEditable === 'true' ||
        tagName === 'INPUT' || tagName === 'TEXTAREA';

    if (event.keyCode === 90 && event.metaKey) { // cmd + z pressed
      const action = event.shiftKey ?
          ActionCreators.redo() :
          ActionCreators.undo();
      this.props.dispatch(action);
    } else if (this.state.selectedLayerId !== null && event.keyCode === 27) { // esc key pressed
      if (isInput) {
        return event.target.blur();
      }
      this._selectLayer(null);
    } else if (!isInput && (event.keyCode === 188 || event.keyCode === 190)) { // < or > key pressed
      event.preventDefault();
      let movement = event.keyCode === 188 ? -1 : 1;
      movement /= event.shiftKey ? 10 : 100;
      this._setPercentPlayed(this.state.percentPlayed + movement);
    }
  },

  _onResize: function() {
    const header = ReactDOM.findDOMNode(this.refs.header);
    const viewportWrapperStyle = getComputedStyle(this.refs.viewportWrapper, null);
    const viewportWrapperPadding = parseInt(viewportWrapperStyle.padding);
    this.setState({
      timelineMaxHeight: (window.innerHeight - header.offsetHeight) / 2,
      viewportWrapperHeight: parseFloat(viewportWrapperStyle.height),
      viewportWrapperOffsetLeft: this.refs.viewportWrapper.offsetLeft + viewportWrapperPadding,
      viewportWrapperOffsetTop: this.refs.viewportWrapper.offsetTop + viewportWrapperPadding,
      viewportWrapperWidth: parseFloat(viewportWrapperStyle.width)
    });
  },

  _onDragEnter: function(event) {
    event.preventDefault();
    if (isDragTypeFound(event, FILE_DRAG_TYPE)) {
      this._dragCounter++;
      this.setState({dragging: true});
    }
  },

  _onDragLeave: function(event) {
    if (isDragTypeFound(event, FILE_DRAG_TYPE)) {
      this._dragCounter--;
      if (!this._dragCounter) {
        this.setState({dragging: false});
      }
    }
  },

  _onDragOver: function(event) {
    event.preventDefault();
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
    this.setState({selectedLayerId: id});
  },

  render: function() {
    return (
      <div className="pl-app"
          onDragEnter={this._onDragEnter}
          onDragLeave={this._onDragLeave}
          onDragOver={this._onDragOver}
          onDrop={this._onDragLeave}>
        <Header ref="header"/>
        <div className="pl-app-content">
          <Library assets={this.state.assets}
              dragging={this.state.dragging}
              onDragEnter={this._onDragEnter}
              onDrop={this._onLibraryDrop}/>
          <div className="pl-app-viewport-wrapper" ref="viewportWrapper">
            <Viewport compositionHeight={this.state.compositionHeight}
                compositionWidth={this.state.compositionWidth}
                percentPlayed={this.state.percentPlayed}
                selectLayer={this._selectLayer}
                selectedLayerId={this.state.selectedLayerId}
                wrapperHeight={this.state.viewportWrapperHeight}
                wrapperOffsetLeft={this.state.viewportWrapperOffsetLeft}
                wrapperOffsetTop={this.state.viewportWrapperOffsetTop}
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
  return {
    layers: state.layers.present
  };
})(App);
