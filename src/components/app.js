const React = require('react');
const ReactDOM = require('react-dom');
const {connect} = require('react-redux');
const {ActionCreators} = require('redux-undo');
const request = require('request-promise');

const Header = require('./header');
const Library = require('./library');
const PublishDialog = require('./publish-dialog');
const Timeline = require('./timeline');
const ViewBar = require('./view-bar');
const Viewport = require('./viewport');

const {selectLayer} = require('../actions');
const {API_URL, FILE_DRAG_TYPE} = require('../constants');
const isDragTypeFound = require('../util/is-drag-type-found');
const isInput = require('../util/is-input');
const layerPropType = require('../util/layer-prop-type');

function getGCD(a, b) {
  return b === 0 ? a : getGCD(b, a % b);
}

const App = React.createClass({

  propTypes: {
    assets: React.PropTypes.array.isRequired,
    changed: React.PropTypes.bool.isRequired,
    dispatch: React.PropTypes.func.isRequired,
    id: React.PropTypes.number,
    layers: React.PropTypes.arrayOf(layerPropType).isRequired,
    name: React.PropTypes.string.isRequired,
    selectedLayer: React.PropTypes.number,
    step: React.PropTypes.number.isRequired
  },

  getInitialState: function() {
    return {
      compositionHeight: 1080,
      compositionWidth: 1920,
      dragging: false,
      publishing: false,
      timelineMaxHeight: 0,
      viewportScale: 1,
      viewportWrapperHeight: 0,
      viewportWrapperOffsetLeft: 0,
      viewportWrapperOffsetTop: 0,
      viewportWrapperWidth: 0
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
    } else if (this.props.changed &&
        event.keyCode === 83 && (event.metaKey || event.ctrlKey)) {
      event.preventDefault();
      this._saveProject();
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
    }, function() {
      const viewport = this.refs.viewport.getWrappedInstance();
      this.setState({viewportScale: viewport.getScale()});
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

  _saveProject: function() {
    if (this.props.changed) {
      const options = {
        url: `${API_URL}/projects`,
        body: {
          name: this.props.name,
          assets: this.props.assets,
          layers: this.props.layers,
          step: this.props.step
        },
        json: true
      };

      const client = !this.props.id ?
          request.post(options) :
          request.put(Object.assign(options, {
            url: `${options.url}/${this.props.id}`}
          ));
      client.then(this._handleSaveResponse).catch(function(err) {
        throw err;
      });
    }
  },

  _handleSaveResponse: function(project) {
    this.props.dispatch({
      type: 'UPDATE_PROJECT',
      id: project.id,
      slug: project.slug,
      name: project.name,
      layers: project.layers,
      assets: project.assets,
      step: project.step,
      createdAt: project.created_at,
      updatedAt: project.updated_at
    });
    this.setState({changed: false});
  },

  _getLayerDimensions: function(id) {
    return this.refs.viewport.getWrappedInstance().getLayerDimensions(id);
  },

  render: function() {
    const gcd = getGCD(this.state.compositionWidth, this.state.compositionHeight);
    const aspectRatio = `${this.state.compositionWidth / gcd}:${this.state.compositionHeight / gcd}`;
    return (
      <div className="sv-app"
          onDragEnter={this._onDragEnter}
          onDragLeave={this._onDragLeave}
          onDragOver={this._onDragOver}
          onDrop={this._onDragLeave}>
        <Header onPublishClick={this._onPublishClick}
            onSaveClick={this._saveProject}
            ref="header"/>
        <div className="sv-app-content">
          <Library assets={this.state.assets}
              dragging={this.state.dragging}
              onDragEnter={this._onDragEnter}
              onDrop={this._onLibraryDrop}/>
          <div className="sv-app-content-viewport">
            <div className="sv-app-content-viewport-wrapper"
                onClick={this._deselectLayer}
                ref="viewportWrapper">
              <Viewport compositionHeight={this.state.compositionHeight}
                  compositionWidth={this.state.compositionWidth}
                  ref="viewport"
                  wrapperHeight={this.state.viewportWrapperHeight}
                  wrapperOffsetLeft={this.state.viewportWrapperOffsetLeft}
                  wrapperOffsetTop={this.state.viewportWrapperOffsetTop}
                  wrapperWidth={this.state.viewportWrapperWidth}/>
            </div>
            <ViewBar aspectRatio={aspectRatio}
                compositionHeight={this.state.compositionHeight}
                compositionWidth={this.state.compositionWidth}
                getLayerDimensions={this._getLayerDimensions}
                viewportScale={this.state.viewportScale}/>
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
  const changedAt = new Date(state.changedAt && state.changedAt.present);
  return {
    id: state.id,
    assets: state.assets.present,
    changed: changedAt.getTime() !== new Date(state.updatedAt).getTime(),
    layers: state.layers.present,
    name: state.name.present,
    selectedLayer: state.selectedLayer,
    step: state.step.present
  };
})(App);
