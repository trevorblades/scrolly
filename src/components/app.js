const React = require('react');
const ReactDOM = require('react-dom');
const {connect} = require('react-redux');
const {ActionCreators} = require('redux-undo');

const Header = require('./header');
const Inspector = require('./inspector');
const Library = require('./library');
const Sidebar = require('./sidebar');
const Timeline = require('./timeline');
const Viewport = require('./viewport');

const {addAsset} = require('../actions');

const ALLOWED_FILETYPES = ['image/jpeg', 'image/png', 'image/gif'];

const App = React.createClass({

  propTypes: {
    dispatch: React.PropTypes.func.isRequired,
    layers: React.PropTypes.array.isRequired
  },

  getInitialState: function() {
    return {
      compositionHeight: 1080,
      compositionWidth: 1920,
      dragging: false,
      viewportWrapperHeight: 0,
      viewportWrapperWidth: 0,
      percentPlayed: 0,
      selectedLayerId: null,
      timelineMaxHeight: 0
    };
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
    this.setState({
      viewportWrapperHeight: parseFloat(viewportWrapperStyle.height),
      viewportWrapperWidth: parseFloat(viewportWrapperStyle.width),
      timelineMaxHeight: (window.innerHeight - header.offsetHeight) / 2
    });
  },

  _onDragEnter: function(event) {
    if (event.dataTransfer.types.indexOf('Files') !== -1) {
      this.setState({dragging: true});
    }
  },

  _onDragLeave: function() {
    this.setState({dragging: false});
  },

  _onDragOver: function(event) {
    event.preventDefault();
    event.stopPropagation();
  },

  _onDrop: function(event) {
    event.preventDefault();
    event.stopPropagation();
    this._onFileUpload(event.dataTransfer.files[0]);
    this._onDragLeave();
  },

  _onFileUpload: function(file) {
    if (!file) {
      return;
    } else if (ALLOWED_FILETYPES.indexOf(file.type) === -1) {
      return; // file type not supported
    }

    const reader = new FileReader();
    reader.onload = event => {
      const action = addAsset(file.name, file.type, file.size, event.target.result);
      this.props.dispatch(action);
      this.setState({uploading: false});
    };
    reader.readAsDataURL(file);
    this.setState({uploading: true});
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
      <div className="pl-app" onDragEnter={this._onDragEnter}>
        <Header ref="header"/>
        <div className="pl-app-content">
          <Sidebar>
            <Library assets={this.state.assets}/>
            <Inspector selectedLayerId={this.state.selectedLayerId}/>
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
        {this.state.dragging &&
          <div className="pl-app-drop"
              onDragLeave={this._onDragLeave}
              onDragOver={this._onDragOver}
              onDrop={this._onDrop}/>}
      </div>
    );
  }
});

module.exports = connect(function(state) {
  return {
    layers: state.layers.present
  };
})(App);
