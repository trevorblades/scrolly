const React = require('react');
const {connect} = require('react-redux');
const bytes = require('bytes');
const classNames = require('classnames');
const mime = require('mime');

const Button = require('./button');
const Icon = require('./icon');
const Presets = require('./presets');

const {API_URL, ASSET_DRAG_TYPE, FILE_DRAG_TYPE} = require('../constants');
const isDragTypeFound = require('../util/is-drag-type-found');

const ALLOWED_MIME_TYPES = [
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/svg+xml'
];
const allowedFiletypes = ALLOWED_MIME_TYPES.map(
  mimeType => `.${mime.extension(mimeType)}`
);
const allowedFiletypesString = allowedFiletypes
  .map(
    (filetype, index, array) =>
      index === array.length - 1 ? `and ${filetype}` : filetype
  )
  .join(', ');

const Library = React.createClass({
  propTypes: {
    assets: React.PropTypes.array.isRequired,
    dispatch: React.PropTypes.func.isRequired,
    dragging: React.PropTypes.bool
  },

  getInitialState() {
    return {
      dragging: false,
      selectedAssetId: null,
      uploading: false
    };
  },

  componentWillMount() {
    this.filesToUpload = 0;
  },

  onDragEnter(event) {
    event.preventDefault();
    if (isDragTypeFound(event, FILE_DRAG_TYPE)) {
      this.setState({dragging: true});
    }
  },

  onDragLeave(event) {
    if (isDragTypeFound(event, FILE_DRAG_TYPE)) {
      this.setState({dragging: false});
    }
  },

  onDragOver(event) {
    event.preventDefault();
  },

  onDrop(event) {
    event.preventDefault();
    if (isDragTypeFound(event, FILE_DRAG_TYPE)) {
      for (let i = 0; i < event.dataTransfer.files.length; i += 1) {
        this.onFileUpload(event.dataTransfer.files[i]);
      }
      this.setState({dragging: false});
    }
  },

  _onUploadClick(event) {
    event.currentTarget.getElementsByTagName('input')[0].click();
  },

  onUploadChange(event) {
    const target = event.target;
    if (target.files.length) {
      for (let i = 0; i < event.dataTransfer.files.length; i += 1) {
        this.onFileUpload(event.dataTransfer.files[i]);
      }
      target.value = null;
    }
  },

  onFileUpload(file) {
    if (!file || ALLOWED_MIME_TYPES.indexOf(file.type) === -1) {
      return;
    }

    const reader = new FileReader();
    reader.onload = this.onReaderLoad.bind(null, file);
    reader.readAsDataURL(file);

    this.filesToUpload += 1;
    if (!this.state.uploading) {
      this.setState({uploading: true});
    }
  },

  onReaderLoad(file, event) {
    const img = new Image();
    const data = event.target.result;
    img.onload = this.onImageLoad.bind(null, file);
    img.src = data;
  },

  onImageLoad(file, event) {
    const {width, height} = event.target;

    const body = new FormData();
    body.append('file', file, file.name);
    fetch(`${API_URL}/asset`, {method: 'POST', body})
      .then(res => res.text())
      .then(src => {
        this.props.dispatch({
          type: 'ADD_ASSET',
          name: file.name,
          mimeType: file.type,
          size: file.size,
          src,
          width,
          height
        });
        this.filesToUpload -= 1;
        if (!this.filesToUpload) {
          this.setState({uploading: false});
        }
      });
  },

  onAssetsClick() {
    this.setState({selectedAssetId: null});
  },

  onAssetClick(event, id) {
    event.stopPropagation();
    this.setState({selectedAssetId: id});
  },

  onAssetDragStart(event, id) {
    event.dataTransfer.setData(ASSET_DRAG_TYPE, id);
  },

  onRemoveClick(id) {
    this.props.dispatch({type: 'REMOVE_ASSET', id});
  },

  render() {
    const selectedAsset = this.props.assets.find(
      asset => asset.id === this.state.selectedAssetId
    );
    const assetsClassName = classNames('sv-library-assets', {
      'sv-highlighted': this.props.dragging,
      'sv-dragging': this.state.dragging
    });
    return (
      <div className="sv-library">
        <div className="sv-library-preview">
          <div className="sv-library-preview-thumb">
            {selectedAsset
              ? <img alt={selectedAsset.name} src={selectedAsset.src} />
              : <Icon name="image" />}
          </div>
          <div className="sv-library-preview-info">
            {selectedAsset &&
              <div>
                <h5 title={selectedAsset.name}>{selectedAsset.name}</h5>
                <h6>{`${selectedAsset.width} x ${selectedAsset.height}`}</h6>
                <h6>{bytes(selectedAsset.size)}</h6>
              </div>}
          </div>
        </div>
        <div
          className={assetsClassName}
          onClick={this.onAssetsClick}
          onDragEnter={this.onDragEnter}
          onDragLeave={this.onDragLeave}
          onDragOver={this.onDragOver}
          onDrop={this.onDrop}
        >
          {this.state.uploading &&
            <div className="sv-library-assets-loading" />}
          {!this.props.assets.length
            ? <div className="sv-library-assets-empty">
                <div style={{width: '25%'}}>
                  <Icon name="upload" />
                </div>
                <h5>Upload images</h5>
                <p>
                  Drag and drop images from your computer into this panel to use them in your composition.
                </p>
                <p
                >{`Accepted file types include ${allowedFiletypesString.replace(/\./g, '')}.`}</p>
              </div>
            : this.props.assets.map(asset => {
                const assetClassName = classNames('sv-library-asset', {
                  'sv-selected': asset.id === this.state.selectedAssetId
                });
                return (
                  <div
                    key={asset.id}
                    className={assetClassName}
                    draggable
                    onClick={event => this.onAssetClick(event, asset.id)}
                    onDragStart={event =>
                      this.onAssetDragStart(event, asset.id)}
                  >
                    <span title={asset.name}>{asset.name}</span>
                    <span>{bytes(asset.size)}</span>
                    <span
                      onClick={() => this.onRemoveClick(asset.id)}
                      title="Remove asset"
                    >
                      <Icon name="trash" />
                    </span>
                  </div>
                );
              })}
        </div>
        <div className="sv-library-footer">
          <Button onClick={this.onUploadClick}>
            <Icon name="add" />
            <span>Upload asset</span>
            <input
              accept={allowedFiletypes.join(',')}
              multiple
              onChange={this.onUploadChange}
              type="file"
            />
          </Button>
          <Presets />
        </div>
      </div>
    );
  }
});

module.exports = connect(state => ({
  assets: state.assets.present
}))(Library);
