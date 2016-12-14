const React = require('react');

const Library = React.createClass({

  getInitialState: function() {
    return {
      assets: []
    };
  },

  render: function() {
    return (
      <div className="pl-library">
        <div className="pl-library-assets">
          {this.state.assets.map(function(asset, index) {
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
