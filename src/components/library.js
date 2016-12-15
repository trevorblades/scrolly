const React = require('react');
const {connect} = require('react-redux');
const bytes = require('bytes');

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
          {selectedAsset &&
            <div className="pl-library-preview-asset">
              <div className="pl-library-preview-asset-thumb">
                <img src={selectedAsset.data}/>
              </div>
              <h5 className="pl-ellipsized">{selectedAsset.name}</h5>
              <h6>{bytes(selectedAsset.size)}</h6>
            </div>}
        </div>
        <div className="pl-library-assets" onClick={this._onAssetsClick}>
          {this.props.assets.map((asset, index) => {
            return (
              <div className="pl-library-asset"
                  key={index}
                  onClick={this._onAssetClick.bind(null, asset.id)}>
                {asset.name}
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
