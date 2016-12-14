const React = require('react');

const Library = React.createClass({

  propTypes: {
    assets: React.PropTypes.array
  },

  render: function() {
    return (
      <div className="pl-library">
        <div className="pl-library-assets">
          {this.props.assets.map(function(asset, index) {
            return (
              <div className="pl-library-asset" key={index}>
                <span>{asset.filename}</span>
              </div>
            );
          })}
        </div>
      </div>
    );
  }
});

module.exports = Library;
