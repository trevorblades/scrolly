const React = require('react');
const {connect} = require('react-redux');
const bytes = require('bytes');
const classNames = require('classnames');
const mime = require('mime');

const Button = require('./button');
const Icon = require('./icon');

const {ASSET_DRAG_TYPE, FILE_DRAG_TYPE} = require('../constants');
const isDragTypeFound = require('../util/is-drag-type-found');

const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/svg+xml'];
const allowedFiletypes = ALLOWED_MIME_TYPES.map(mimeType => `.${mime.extension(mimeType)}`);
const allowedFiletypesString = allowedFiletypes.map(function(filetype, index, array) {
  return index === array.length - 1 ? `and ${filetype}` : filetype;
}).join(', ');

const Library = React.createClass({

  propTypes: {
    assets: React.PropTypes.array.isRequired,
    dispatch: React.PropTypes.func.isRequired,
    dragging: React.PropTypes.bool
  },

  getInitialState: function() {
    return {
      dragging: false,
      selectedAssetId: null,
      uploading: false
    };
  },

  _onDragEnter: function(event) {
    event.preventDefault();
    if (isDragTypeFound(event, FILE_DRAG_TYPE)) {
      this.setState({dragging: true});
    }
  },

  _onDragLeave: function(event) {
    if (isDragTypeFound(event, FILE_DRAG_TYPE)) {
      this.setState({dragging: false});
    }
  },

  _onDragOver: function(event) {
    event.preventDefault();
  },

  _onDrop: function(event) {
    event.preventDefault();
    if (isDragTypeFound(event, FILE_DRAG_TYPE)) {
      this._onFileUpload(event.dataTransfer.files[0]);
      this.setState({dragging: false});
    }
  },

  _onUploadChange: function(event) {
    if (event.target.files.length) {
      this._onFileUpload(event.target.files[0]);
      event.target.value = null;
    }
  },

  _onFileUpload: function(file) {
    if (!file || ALLOWED_MIME_TYPES.indexOf(file.type) === -1) {
      return;
    }

    const reader = new FileReader();
    reader.onload = this._onReaderLoad.bind(null, file);
    reader.readAsDataURL(file);
    this.setState({uploading: true});
  },

  _onReaderLoad: function(file, event) {
    const img = new Image();
    const data = event.target.result;
    img.onload = this._onImageLoad.bind(null, data, file);
    img.src = data;
  },

  _onImageLoad: function(data, file, event) {
    this.props.dispatch({
      type: 'ADD_ASSET',
      name: file.name,
      mimeType: file.type,
      size: file.size,
      src: data,
      width: event.target.width,
      height: event.target.height
    });
    this.setState({uploading: false});
  },

  _onAssetsClick: function() {
    this.setState({selectedAssetId: null});
  },

  _onAssetClick: function(id, event) {
    event.stopPropagation();
    this.setState({selectedAssetId: id});
  },

  _onAssetDragStart: function(id, event) {
    event.dataTransfer.setData(ASSET_DRAG_TYPE, id);
  },

  _onRemoveClick: function(id) {
    this.props.dispatch({type: 'REMOVE_ASSET', id});
  },

  render: function() {
    const selectedAsset = this.props.assets.find(asset => asset.id === this.state.selectedAssetId);
    const assetsClassName = classNames('sv-library-assets', {
      'sv-highlighted': this.props.dragging,
      'sv-dragging': this.state.dragging
    });
    return (
      <div className="sv-library">
        <div className="sv-library-preview">
          <div className="sv-library-preview-thumb">
            {selectedAsset ?
              <img src={selectedAsset.src}/> : <Icon name="image"/>}
          </div>
          <div className="sv-library-preview-info">
            {selectedAsset && <div>
              <h5 title={selectedAsset.name}>{selectedAsset.name}</h5>
              <h6>{`${selectedAsset.width} x ${selectedAsset.height}`}</h6>
              <h6>{bytes(selectedAsset.size)}</h6>
            </div>}
          </div>
        </div>
        <div className={assetsClassName}
            onClick={this._onAssetsClick}
            onDragEnter={this._onDragEnter}
            onDragLeave={this._onDragLeave}
            onDragOver={this._onDragOver}
            onDrop={this._onDrop}>
          {!this.props.assets.length ?
            <div className="sv-library-assets-empty">
              <div style={{width: '25%'}}>
                <Icon name="upload"/>
              </div>
              <h5>Upload images</h5>
              <p>Drag and drop images from your computer into this panel to use them in your composition.</p>
              <p>{`Accepted file types include ${allowedFiletypesString}.`}</p>
            </div> :
            this.props.assets.map((asset, index) => {
              const assetClassName = classNames('sv-library-asset', {
                'sv-selected': asset.id === this.state.selectedAssetId
              });
              return (
                <div className={assetClassName}
                    draggable
                    key={index}
                    onClick={this._onAssetClick.bind(null, asset.id)}
                    onDragStart={this._onAssetDragStart.bind(null, asset.id)}>
                  <span title={asset.name}>{asset.name}</span>
                  <span>{bytes(asset.size)}</span>
                  <span onClick={this._onRemoveClick.bind(null, asset.id)}
                      title="Remove asset">
                    <Icon name="trash"/>
                  </span>
                </div>
              );
            })}
        </div>
        <div className="sv-library-footer">
          <Button>
            <span>Upload asset</span>
            <input accept={allowedFiletypes.join(',')}
                onChange={this._onUploadChange}
                type="file"/>
          </Button>
        </div>
      </div>
    );
  }
});

module.exports = connect(function(state) {
  return {
    assets: state.assets.present
  };
})(Library);
