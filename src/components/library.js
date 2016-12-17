const React = require('react');
const {connect} = require('react-redux');
const bytes = require('bytes');
const classNames = require('classnames');

const Icon = require('./icon');

const {addAsset, removeAsset} = require('../actions');

const ALLOWED_FILETYPES = ['image/jpeg', 'image/png', 'image/gif'];

const Library = React.createClass({

  propTypes: {
    assets: React.PropTypes.array.isRequired,
    dispatch: React.PropTypes.func,
    dragging: React.PropTypes.bool,
    onRemoveClick: React.PropTypes.func
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
    this.setState({dragging: true});
  },

  _onDragLeave: function(event) {
    this.setState({dragging: false});
  },

  _onDragOver: function(event) {
    event.preventDefault();
  },

  _onDrop: function(event) {
    event.preventDefault();
    this._onFileUpload(event.dataTransfer.files[0]);
    this.setState({dragging: false});
  },

  _onFileUpload: function(file) {
    if (!file || ALLOWED_FILETYPES.indexOf(file.type) === -1) {
      return;
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

  _onAssetClick: function(id, event) {
    event.stopPropagation();
    this.setState({selectedAssetId: id});
  },

  _onAssetsClick: function() {
    this.setState({selectedAssetId: null});
  },

  render: function() {
    const selectedAsset = this.props.assets.find(asset => asset.id === this.state.selectedAssetId);
    const assetsClassName = classNames('pl-library-assets', {
      'pl-highlighted': this.props.dragging,
      'pl-dragging': this.state.dragging
    });
    return (
      <div className="pl-library">
        <div className="pl-library-preview">
          <div className="pl-library-preview-thumb">
            {selectedAsset ?
              <img src={selectedAsset.data}/> : <Icon name="image"/>}
          </div>
          <div className="pl-library-preview-info">
            {selectedAsset && <div>
              <h5 title={selectedAsset.name}>{selectedAsset.name}</h5>
              <h6>{selectedAsset.filetype}</h6>
              <h6>{bytes(selectedAsset.size)}</h6>
            </div>}
          </div>
        </div>
        <div className="pl-library-header">
          <span>Name</span>
          <span>Size</span>
          <span/>
        </div>
        <div className={assetsClassName}
            onClick={this._onAssetsClick}
            onDragEnter={this._onDragEnter}
            onDragLeave={this._onDragLeave}
            onDragOver={this._onDragOver}
            onDrop={this._onDrop}>
          {this.props.assets.map((asset, index) => {
            const assetClassName = classNames('pl-library-asset', {
              'pl-selected': asset.id === this.state.selectedAssetId
            });
            return (
              <div className={assetClassName}
                  key={index}
                  onClick={this._onAssetClick.bind(null, asset.id)}>
                <span title={asset.name}>{asset.name}</span>
                <span>{bytes(asset.size)}</span>
                <span onClick={this.props.onRemoveClick.bind(null, asset.id)}>
                  <Icon name="trash"/>
                </span>
              </div>
            );
          })}
        </div>
      </div>
    );
  }
});

function mapStateToProps(state) {
  return {
    assets: state.assets.present
  };
}

function mapDispatchToProps(dispatch) {
  return {
    dispatch,
    onRemoveClick: function(id) {
      dispatch(removeAsset(id));
    }
  };
}

module.exports = connect(mapStateToProps, mapDispatchToProps)(Library);
