const React = require('react');
const {connect} = require('react-redux');

const Button = require('./button');
const Checkbox = require('./checkbox');
const Dialog = require('./dialog');
const TextField = require('./text-field');

const getAspectRatio = require('../util/get-aspect-ratio');

const NewDialog = React.createClass({

  propTypes: {
    dispatch: React.PropTypes.func.isRequired,
    height: React.PropTypes.number.isRequired,
    onClose: React.PropTypes.func.isRequired,
    width: React.PropTypes.number.isRequired
  },

  getInitialState: function() {
    return {
      constrained: true,
      height: this.props.height,
      width: this.props.width
    };
  },

  _onWidthChange: function(width) {
    const nextState = {width};
    if (this.state.constrained) {
      nextState.height = width / (this.state.width / this.state.height);
    }
    this.setState(nextState);
  },

  _onHeightChange: function(height) {
    const nextState = {height};
    if (this.state.constrained) {
      nextState.width = height * (this.state.height / this.state.width);
    }
    this.setState(nextState);
  },

  _onConstrainChange: function(constrained) {
    this.setState({constrained});
  },

  _onCreateProjectClick: function() {
    history.replaceState(null, null, '/');
    this.props.dispatch({
      type: 'RESET',
      width: this.state.width,
      height: this.state.height
    });
    this.props.onClose();
  },

  render: function() {
    return (
      <Dialog className="sv-new-dialog" onClose={this.props.onClose}>
        <h3>New project</h3>
        <label>Width</label>
        <div className="sv-new-dialog-content">
          <div className="sv-new-dialog-content-fields">
            <TextField onChange={this._onWidthChange}
                type="number"
                value={this.state.width}/>
            <label>Height</label>
            <TextField onChange={this._onHeightChange}
                type="number"
                value={this.state.height}/>
          </div>
          <div className="sv-new-dialog-content-aspect-ratio">
            <Checkbox checked={this.state.constrained}
                label="Constrain to aspect ratio"
                onChange={this._onConstrainChange}/>
            <h6>{getAspectRatio(this.state.width, this.state.height)}</h6>
          </div>
        </div>
        <Button onClick={this._onCreateProjectClick} secondary>
          Create project
        </Button>
        <Button onClick={this._onNewDialogClose} secondary>Cancel</Button>
      </Dialog>
    );
  }
});

module.exports = connect(function(state) {
  return {
    width: state.width,
    height: state.height
  };
})(NewDialog);
