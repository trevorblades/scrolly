import PropTypes from 'prop-types';
import React from 'react';
import {connect} from 'react-redux';
import {ActionCreators} from 'redux-undo';
import styled from 'styled-components';

import ConnectedViewport from './connected-viewport';
import Dialog from './dialog';
import EditDialog from './edit-dialog';
import Header from './header';
import Library from './library';
import OpenDialog from './open-dialog';
import Timeline from './timeline';
import ViewBar from './view-bar';

import {copyLayer, selectLayer, loadProject} from '../actions';
import {FILE_DRAG_TYPE, JSON_HEADERS} from '../constants';
import isDragTypeFound from '../util/is-drag-type-found';
import isInput from '../util/is-input';
import layerPropType from '../util/layer-prop-type';

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
  user-select: none;
  position: absolute;
  top: 0;
  left: 0;
`;

const OuterWrapper = styled.div`
  display: flex;
  flex-grow: 1;
  border-bottom: 1px solid black;
  background-color: @gray-dark;
`;

const InnerWrapper = styled.div`
  display: flex;
  flex-direction: column;
  flex-grow: 1;
`;

const ViewportWrapper = styled.div`
  display: flex;
  align-items: center;
  flex-grow: 1;
  box-sizing: content-box;
  padding: @padding-largest;
  overflow: hidden;
  position: relative;
`;

const StyledViewport = styled(ConnectedViewport)`
  box-shadow: @box-shadow-large;
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
`;

function setTitle(name) {
  document.title = `${name} - Scrolly`;
}

const App = React.createClass({
  propTypes: {
    assets: PropTypes.array.isRequired,
    changed: PropTypes.bool.isRequired,
    compositionHeight: PropTypes.number.isRequired,
    compositionWidth: PropTypes.number.isRequired,
    dispatch: PropTypes.func.isRequired,
    id: PropTypes.number,
    layers: PropTypes.arrayOf(layerPropType).isRequired,
    name: PropTypes.string.isRequired,
    onLogOutClick: PropTypes.func.isRequired,
    selectedLayer: PropTypes.number,
    slug: PropTypes.string,
    step: PropTypes.number.isRequired,
    user: PropTypes.object.isRequired
  },

  getInitialState() {
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

  componentWillMount() {
    this.dragCounter = 0;
    setTitle(this.props.name);
  },

  componentDidMount() {
    window.addEventListener('keydown', this.onKeyDown);
    window.addEventListener('resize', this.onResize);
    this.onResize();
  },

  componentWillReceiveProps(nextProps) {
    if (nextProps.name !== this.props.name) {
      setTitle(nextProps.name);
    }
  },

  componentWillUnmount() {
    window.removeEventListener('keydown', this.onKeyDown);
    window.removeEventListener('resize', this.onResize);
  },

  onKeyDown(event) {
    const modifier = event.metaKey || event.ctrlKey;
    if (event.keyCode === 68 && modifier) {
      event.preventDefault();
      if (this.props.selectedLayer) {
        this.props.dispatch(copyLayer(this.props.selectedLayer));
      }
    } else if (event.keyCode === 90 && modifier) {
      // cmd/ctrl + z pressed
      this.props.dispatch(ActionCreators[event.shiftKey ? 'redo' : 'undo']());
    } else if (event.keyCode === 83 && modifier) {
      // cmd/ctrl + s pressed
      event.preventDefault();
      if (this.props.changed) {
        this.saveProject();
      }
    } else if (this.props.selectedLayer !== null && event.keyCode === 27) {
      // esc key pressed
      if (isInput(event.target)) {
        return event.target.blur();
      }
      this.deselectLayer();
    }
    return true;
  },

  onResize() {
    const viewportWrapperStyle = getComputedStyle(this.viewportWrapper, null);
    const viewportWrapperPadding = parseInt(viewportWrapperStyle.padding, 10);
    this.setState(
      {
        timelineMaxHeight: (window.innerHeight - this.header.offsetHeight) / 2,
        viewportWrapperHeight: parseFloat(viewportWrapperStyle.height),
        viewportWrapperOffsetLeft: this.viewportWrapper.offsetLeft +
          viewportWrapperPadding,
        viewportWrapperOffsetTop: this.viewportWrapper.offsetTop +
          viewportWrapperPadding,
        viewportWrapperWidth: parseFloat(viewportWrapperStyle.width)
      },
      () => {
        const viewport = this.viewport;
        this.setState({viewportScale: viewport.getScale()});
      }
    );
  },

  onDragEnter(event) {
    event.preventDefault();
    if (isDragTypeFound(event, FILE_DRAG_TYPE)) {
      this.dragCounter += 1;
      this.setState({dragging: true});
    }
  },

  onDragLeave(event) {
    event.preventDefault();
    if (isDragTypeFound(event, FILE_DRAG_TYPE)) {
      this.dragCounter -= 1;
      if (!this.dragCounter) {
        this.setState({dragging: false});
      }
    }
  },

  onDragOver(event) {
    event.preventDefault();
  },

  onNewClick() {
    this.setState({newDialogShown: true});
  },

  onEditClick() {
    this.setState({editDialogShown: true});
  },

  onEditDialogClose() {
    this.setState({
      newDialogShown: false,
      editDialogShown: false
    });
  },

  onOpenClick() {
    this.setState({openDialogShown: true});
  },

  onOpenDialogClose() {
    this.setState({openDialogShown: false});
  },

  onShareClick() {
    this.setState({shareDialogShown: true});
  },

  onShareInputClick(event) {
    event.target.select();
  },

  onShareDialogClose() {
    this.setState({shareDialogShown: false});
  },

  deselectLayer() {
    this.props.dispatch(selectLayer(null));
  },

  saveProject() {
    if (this.props.changed) {
      let url = `${API_URL}/projects`;
      if (this.props.id) {
        url += `/${this.props.id}`;
      }
      const options = {
        method: this.props.id ? 'PUT' : 'POST',
        headers: {
          Authorization: `Bearer ${this.props.user.token}`,
          ...JSON_HEADERS
        },
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
        .then(res => {
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

  getLayerDimensions(id) {
    return this.viewport.getLayerDimensions(id);
  },

  render() {
    return (
      <Wrapper
        onDragEnter={this.onDragEnter}
        onDragLeave={this.onDragLeave}
        onDragOver={this.onDragOver}
        onDrop={this.onDragLeave}
      >
        <Header
          ref={node => {
            this.header = node && node.getWrappedInstance();
          }}
          onEditClick={this.onEditClick}
          onLogOutClick={this.props.onLogOutClick}
          onNewClick={this.onNewClick}
          onOpenClick={this.onOpenClick}
          onSaveClick={this.saveProject}
          onShareClick={this.onShareClick}
          saving={this.state.saving}
        />
        <OuterWrapper>
          <Library
            assets={this.state.assets}
            dragging={this.state.dragging}
            onDragEnter={this.onDragEnter}
            onDrop={this.onLibraryDrop}
          />
          <InnerWrapper>
            <ViewportWrapper
              innerRef={node => {
                this.viewportWrapper = node;
              }}
              className="sv-app-content-viewport-wrapper"
              onClick={this.deselectLayer}
            >
              <StyledViewport
                innerRef={node => {
                  this.viewport = node && node.getWrappedInstance();
                }}
                compositionHeight={this.props.compositionHeight}
                compositionWidth={this.props.compositionWidth}
                wrapperHeight={this.state.viewportWrapperHeight}
                wrapperOffsetLeft={this.state.viewportWrapperOffsetLeft}
                wrapperOffsetTop={this.state.viewportWrapperOffsetTop}
                wrapperWidth={this.state.viewportWrapperWidth}
              />
            </ViewportWrapper>
            <ViewBar
              compositionHeight={this.props.compositionHeight}
              compositionWidth={this.props.compositionWidth}
              getLayerDimensions={this.getLayerDimensions}
              viewportScale={this.state.viewportScale}
            />
          </InnerWrapper>
        </OuterWrapper>
        <Timeline
          maxHeight={this.state.timelineMaxHeight}
          onResize={this.onResize}
        />
        {(this.state.newDialogShown || this.state.editDialogShown) &&
          <EditDialog
            onClose={this.onEditDialogClose}
            reset={this.state.newDialogShown}
          />}
        {this.state.openDialogShown &&
          <OpenDialog
            onClose={this.onOpenDialogClose}
            user={this.props.user}
          />}
        {this.state.shareDialogShown &&
          <Dialog onClose={this.onShareDialogClose}>
            <h3>Share your project</h3>
            <label htmlFor="link">
              Use the following link to share your creation with the world:
            </label>
            <input
              id="link"
              onClick={this.onShareInputClick}
              readOnly
              type="text"
              style={{width: '100%'}}
              value={`${window.location.origin}/viewer/?p=${this.props.slug}`}
            />
          </Dialog>}
      </Wrapper>
    );
  }
});

export default connect(state => {
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
