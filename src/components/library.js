const React = require('react');
const {connect} = require('react-redux');
const bytes = require('bytes');
const classNames = require('classnames');

const Icon = require('./icon');

const Library = React.createClass({

  propTypes: {
    assets: React.PropTypes.array.isRequired
  },

  getInitialState: function() {
    return {
      selectedAssetId: null
    };
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
    return (
      <div className="pl-library">
        <div className="pl-library-preview">
          <div className="pl-library-preview-thumb">
            {selectedAsset ?
              <img src={selectedAsset.data}/> : <Icon name="image"/>}
          </div>
          <div className="pl-library-preview-info">
            {selectedAsset && <div>
              <h5>{selectedAsset.name}</h5>
              <h6>{selectedAsset.filetype}</h6>
              <h6>{bytes(selectedAsset.size)}</h6>
            </div>}
          </div>
        </div>
        <div className="pl-library-header">
          <span>Name</span>
          <span>Size</span>
        </div>
        <div className="pl-library-assets"
            onClick={this._onAssetsClick}>
          {this.props.assets.map((asset, index) => {
            const assetClassName = classNames('pl-library-asset', {
              'pl-selected': asset.id === this.state.selectedAssetId
            });
            return (
              <div className={assetClassName}
                  key={index}
                  onClick={this._onAssetClick.bind(null, asset.id)}>
                <span>{asset.name}</span>
                <span>{bytes(asset.size)}</span>
              </div>
            );
          })}
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
