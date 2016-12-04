const React = require('react');

const MIN_HEIGHT = 100;

const Footer = React.createClass({

  propTypes: {
    children: React.PropTypes.node,
    maxHeight: React.PropTypes.number,
    onResize: React.PropTypes.func
  },

  getInitialState: function() {
    return {
      height: 200
    };
  },

  componentWillReceiveProps: function(nextProps) {
    if (nextProps.maxHeight !== this.props.maxHeight &&
          this.state.height > nextProps.maxHeight) {
      let height = nextProps.maxHeight;
      if (height < MIN_HEIGHT) {
        height = MIN_HEIGHT;
      }
      this.setState({height: height});
    }
  },

  _onHandleMouseDown: function() {
    document.addEventListener('mousemove', this._onHandleMouseMove);
    document.addEventListener('mouseup', this._onHandleMouseUp);
  },

  _onHandleMouseMove: function(event) {
    let height = window.innerHeight - event.clientY;
    if (height > this.props.maxHeight) {
      height = this.props.maxHeight;
    }
    if (height < MIN_HEIGHT) {
      height = MIN_HEIGHT;
    }
    this.setState({height: height}, this.props.onResize);
  },

  _onHandleMouseUp: function() {
    document.removeEventListener('mousemove', this._onHandleMouseMove);
    document.removeEventListener('mouseup', this._onHandleMouseUp);
  },

  render: function() {
    return (
      <div className="pl-footer" style={{height: this.state.height}}>
        {this.props.children}
        <div className="pl-footer-handle" onMouseDown={this._onHandleMouseDown}/>
      </div>
    );
  }
});

module.exports = Footer;
