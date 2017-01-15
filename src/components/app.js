const React = require('react');
const ReactDOM = require('react-dom');
const {connect} = require('react-redux');
const {ActionCreators} = require('redux-undo');

const Dialog = require('./dialog');
const EditDialog = require('./edit-dialog');
const Header = require('./header');
const Library = require('./library');
const OpenDialog = require('./open-dialog');
const Timeline = require('./timeline');
const ViewBar = require('./view-bar');
const Viewport = require('./viewport');

const {selectLayer, loadProject} = require('../actions');
const {API_URL, FILE_DRAG_TYPE, JSON_HEADERS} = require('../constants');
const isDragTypeFound = require('../util/is-drag-type-found');
const isInput = require('../util/is-input');
const layerPropType = require('../util/layer-prop-type');

const ConnectedViewport = connect(function(state) {
  return {
    assets: state.assets.present,
    layers: state.layers.present,
    percentPlayed: state.percentPlayed,
    selectedLayer: state.selectedLayer
  };
}, null, null, {withRef: true})(Viewport);

function setTitle(name) {
  document.title = `${name} - Scrolly`;
}

const App = React.createClass({

  propTypes: {
    assets: React.PropTypes.array.isRequired,
    changed: React.PropTypes.bool.isRequired,
    compositionHeight: React.PropTypes.number.isRequired,
    compositionWidth: React.PropTypes.number.isRequired,
    dispatch: React.PropTypes.func.isRequired,
    id: React.PropTypes.number,
    layers: React.PropTypes.arrayOf(layerPropType).isRequired,
    name: React.PropTypes.string.isRequired,
    onLogOutClick: React.PropTypes.func.isRequired,
    selectedLayer: React.PropTypes.number,
    slug: React.PropTypes.string,
    step: React.PropTypes.number.isRequired,
    user: React.PropTypes.object.isRequired
  },

  getInitialState: function() {
    return {
      dragging: false,
      newDialogShown: false,
      openDialogShown: false,
      saving: false,
      shareDialogShown: false,
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
    setTitle(this.props.name);
  },

  componentDidMount: function() {
    window.addEventListener('keydown', this._onKeyDown);
    window.addEventListener('resize', this._onResize);
    this._onResize();
  },

  componentWillReceiveProps: function(nextProps) {
    if (nextProps.name !== this.props.name) {
      setTitle(nextProps.name);
    }
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
    } else if (event.keyCode === 83 && (event.metaKey || event.ctrlKey)) {
      event.preventDefault();
      if (this.props.changed) {
        this._saveProject();
      }
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

  _onNewClick: function() {
    this.setState({newDialogShown: true});
  },

  _onEditClick: function() {
    this.setState({editDialogShown: true});
  },

  _onEditDialogClose: function() {
    this.setState({
      newDialogShown: false,
      editDialogShown: false
    });
  },

  _onOpenClick: function() {
    this.setState({openDialogShown: true});
  },

  _onOpenDialogClose: function() {
    this.setState({openDialogShown: false});
  },

  _onShareClick: function() {
    this.setState({shareDialogShown: true});
  },

  _onShareInputClick: function(event) {
    event.target.select();
  },

  _onShareDialogClose: function() {
    this.setState({shareDialogShown: false});
  },

  _deselectLayer: function() {
    this.props.dispatch(selectLayer(null));
  },

  _saveProject: function() {
    if (this.props.changed) {
      let url = `${API_URL}/projects`;
      if (this.props.id) {
        url += `/${this.props.id}`;
      }
      const options = {
        method: this.props.id ? 'PUT' : 'POST',
        headers: Object.assign({
          'Authorization': `Bearer ${this.props.user.token}`
        }, JSON_HEADERS),
        body: JSON.stringify({
          name: this.props.name,
          width: this.props.compositionWidth,
          height: this.props.compositionHeight,
          layers: this.props.layers,
          assets: this.props.assets,
          step: this.props.step
        })
      };
      fetch(url, options)
        .then(function(res) {
          if (!res.ok) {
            throw new Error();
          }
          return res.json();
        })
        .then(project => {
          this.setState({
            changed: false,
            saving: false
          });
          this.props.dispatch(loadProject(project));
          history.replaceState(null, null, `/${project.slug}`);
        })
        .catch(() => this.setState({saving: false}));

      this.setState({saving: true});
    }
  },

  _getLayerDimensions: function(id) {
    return this.refs.viewport.getWrappedInstance().getLayerDimensions(id);
  },

  render: function() {
    return (
      <div className="sv-app"
          onDragEnter={this._onDragEnter}
          onDragLeave={this._onDragLeave}
          onDragOver={this._onDragOver}
          onDrop={this._onDragLeave}>
        <Header onEditClick={this._onEditClick}
            onLogOutClick={this.props.onLogOutClick}
            onNewClick={this._onNewClick}
            onOpenClick={this._onOpenClick}
            onSaveClick={this._saveProject}
            onShareClick={this._onShareClick}
            ref="header"
            saving={this.state.saving}/>
        <div className="sv-app-content">
          <Library assets={this.state.assets}
              dragging={this.state.dragging}
              onDragEnter={this._onDragEnter}
              onDrop={this._onLibraryDrop}/>
          <div className="sv-app-content-viewport">
            <div className="sv-app-content-viewport-wrapper"
                onClick={this._deselectLayer}
                ref="viewportWrapper">
              <ConnectedViewport compositionHeight={this.props.compositionHeight}
                  compositionWidth={this.props.compositionWidth}
                  ref="viewport"
                  wrapperHeight={this.state.viewportWrapperHeight}
                  wrapperOffsetLeft={this.state.viewportWrapperOffsetLeft}
                  wrapperOffsetTop={this.state.viewportWrapperOffsetTop}
                  wrapperWidth={this.state.viewportWrapperWidth}/>
            </div>
            <ViewBar compositionHeight={this.props.compositionHeight}
                compositionWidth={this.props.compositionWidth}
                getLayerDimensions={this._getLayerDimensions}
                viewportScale={this.state.viewportScale}/>
          </div>
        </div>
        <Timeline maxHeight={this.state.timelineMaxHeight}
            onResize={this._onResize}/>
        {(this.state.newDialogShown || this.state.editDialogShown) &&
          <EditDialog onClose={this._onEditDialogClose}
              reset={this.state.newDialogShown}/>}
        {this.state.openDialogShown &&
          <OpenDialog onClose={this._onOpenDialogClose}
              user={this.props.user}/>}
        {this.state.shareDialogShown &&
          <Dialog className="sv-app-share-dialog" onClose={this._onShareDialogClose}>
            <h3>Share your project</h3>
            <label>Use the following link to share your creation with the world:</label>
            <input onClick={this._onShareInputClick}
                readOnly
                type="text"
                value={`${window.location.origin}/viewer/?p=${this.props.slug}`}/>
          </Dialog>}
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
    slug: state.slug,
    step: state.step.present,
    compositionHeight: state.height,
    compositionWidth: state.width
  };
})(App);
