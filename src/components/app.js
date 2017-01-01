const React = require('react');
const ReactDOM = require('react-dom');
const {connect} = require('react-redux');
const {ActionCreators} = require('redux-undo');

const Button = require('./button');
const Header = require('./header');
const Library = require('./library');
const PublishDialog = require('./publish-dialog');
const Timeline = require('./timeline');
const Viewport = require('./viewport');

const {selectLayer} = require('../actions');
const {FILE_DRAG_TYPE} = require('../constants');
const isDragTypeFound = require('../util/is-drag-type-found');
const isInput = require('../util/is-input');
const layerPropType = require('../util/layer-prop-type');

const App = React.createClass({

  propTypes: {
    dispatch: React.PropTypes.func.isRequired,
    layers: React.PropTypes.arrayOf(layerPropType).isRequired,
    selectedLayer: React.PropTypes.number
  },

  getInitialState: function() {
    return {
      compositionHeight: 1080,
      compositionWidth: 1920,
      dragging: false,
      publishing: false,
      viewportWrapperHeight: 0,
      viewportWrapperOffsetLeft: 0,
      viewportWrapperOffsetTop: 0,
      viewportWrapperWidth: 0,
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
    if (event.keyCode === 90 && event.metaKey) { // cmd + z pressed
      this.props.dispatch(ActionCreators[event.shiftKey ? 'redo' : 'undo']());
    } else if (this.props.selectedLayer !== null && event.keyCode === 27) { // esc key pressed
      if (isInput(event.target)) {
        return event.target.blur();
      }
      this._deselectLayer();
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
    event.preventDefault();
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

  _onPublishClick: function() {
    this.setState({publishing: true});
  },

  _onPublishDialogClose: function() {
    this.setState({publishing: false});
  },

  _deselectLayer: function() {
    this.props.dispatch(selectLayer(null));
  },

  render: function() {
    return (
      <div className="sv-app"
          onDragEnter={this._onDragEnter}
          onDragLeave={this._onDragLeave}
          onDragOver={this._onDragOver}
          onDrop={this._onDragLeave}>
        <Header ref="header">
          <Button onClick={this._onPublishClick}>Publish</Button>
        </Header>
        <div className="sv-app-content">
          <Library assets={this.state.assets}
              dragging={this.state.dragging}
              onDragEnter={this._onDragEnter}
              onDrop={this._onLibraryDrop}/>
          <div className="sv-app-viewport-wrapper"
              onClick={this._deselectLayer}
              ref="viewportWrapper">
            <Viewport compositionHeight={this.state.compositionHeight}
                compositionWidth={this.state.compositionWidth}
                wrapperHeight={this.state.viewportWrapperHeight}
                wrapperOffsetLeft={this.state.viewportWrapperOffsetLeft}
                wrapperOffsetTop={this.state.viewportWrapperOffsetTop}
                wrapperWidth={this.state.viewportWrapperWidth}/>
          </div>
        </div>
        <Timeline maxHeight={this.state.timelineMaxHeight}
            onResize={this._onResize}/>
        {this.state.publishing &&
          <PublishDialog onClose={this._onPublishDialogClose}/>}
      </div>
    );
  }
});

module.exports = connect(function(state) {
  return {
    layers: state.layers.present,
    selectedLayer: state.selectedLayer
  };
})(App);
