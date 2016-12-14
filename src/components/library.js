const React = require('react');
const {connect} = require('react-redux');
const bytes = require('bytes');

const Library = React.createClass({

  propTypes: {
    assets: React.PropTypes.array.isRequired
  },

  render: function() {
    return (
      <div className="pl-library">
        <div className="pl-library-assets">
          {this.props.assets.map(function(asset, index) {
            return (
              <div className="pl-library-asset" key={index}>
                <div className="pl-library-asset-thumb">
                  <img src={asset.data}/>
                </div>
                <div className="pl-library-asset-info">
                  <h5 className="pl-ellipsized">{asset.name}</h5>
                  <h6>{bytes(asset.size)}</h6>
                </div>
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
