const React = require('react');

const Handle = React.createClass({

  propTypes: {
    position: React.PropTypes.oneOf(['top', 'right', 'bottom', 'left']).isRequired
  },

  render: function() {
    let handleStyle;
    const percent = this.props.position === 'left' || this.props.position === 'top' ? 0 : 100;
    if (this.props.position === 'left' || this.props.position === 'right') {
      handleStyle = {
        height: '100%',
        cursor: 'ew-resize',
        left: `${percent}%`,
        transform: 'translateX(-50%)'
      };
    } else {
      handleStyle = {
        width: '100%',
        cursor: 'ns-resize',
        top: `${percent}%`,
        transform: 'translateY(-50%)'
      };
    }
    return (
      <div className="pl-handle" style={handleStyle}/>
    );
  }
});

module.exports = Handle;
