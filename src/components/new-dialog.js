const React = require('react');
const {connect} = require('react-redux');

const Button = require('./button');
const Checkbox = require('./checkbox');
const Dialog = require('./dialog');

const getAspectRatio = require('../util/get-aspect-ratio');

const NewDialog = React.createClass({

  propTypes: {
    dispatch: React.PropTypes.func.isRequired,
    height: React.PropTypes.number.isRequired,
    name: React.PropTypes.string.isRequired,
    onClose: React.PropTypes.func.isRequired,
    width: React.PropTypes.number.isRequired
  },

  getInitialState: function() {
    return {
      aspectRatio: this.props.width / this.props.height,
      constrained: true,
      height: this.props.height,
      name: this.props.name,
      width: this.props.width
    };
  },

  _onNameBlur: function() {
    if (this.state.name !== this.props.name) {
      this.props.dispatch({
        type: 'SET_NAME',
        value: this.state.name
      });
    }
  },

  _onNameChange: function(event) {
    this.setState({name: event.target.value});
  },

  _onNameKeyDown: function(event) {
    if (event.keyCode === 27) { // esc key pressed
      event.target.blur();
    }
  },

  _onDimensionChange: function(event) {
    const key = event.target.name;
    let nextState = {[key]: event.target.value};
    if (nextState[key] && !isNaN(nextState[key])) {
      const value = parseInt(nextState[key]);
      if (value) {
        nextState = this._getConstrainedDimensions({[key]: value});
      }
    }
    this.setState(nextState);
  },

  _onDimensionBlur: function(event) {
    if (!event.target.value) {
      const nextState = this._getConstrainedDimensions({[event.target.name]: 1});
      this.setState(nextState);
    }
  },

  _onConstrainChange: function(constrained) {
    const nextState = {constrained};
    if (constrained) {
      nextState.aspectRatio = this.state.width / this.state.height;
    }
    this.setState(nextState);
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

  _getConstrainedDimensions: function(dimensions) {
    if (!this.state.constrained) {
      return dimensions;
    }
    const additional = 'width' in dimensions ?
        {height: dimensions.width / this.state.aspectRatio} :
        {width: dimensions.height * this.state.aspectRatio};
    return Object.assign({}, dimensions, additional);
  },

  render: function() {
    const aspectRatio = getAspectRatio(1, 1 / this.state.aspectRatio);
    return (
      <Dialog className="sv-new-dialog" onClose={this.props.onClose}>
        <h3>New project</h3>
        <div className="sv-new-dialog-content">
          <div className="sv-new-dialog-content-fields">
            <label>Project name</label>
            <input onChange={this._onNameChange}
                type="text"
                value={this.state.name}/>
            <label>Width</label>
            <input name="width"
                onBlur={this._onDimensionBlur}
                onChange={this._onDimensionChange}
                type="number"
                value={this.state.width}/>
            <label>Height</label>
            <input name="height"
                onBlur={this._onDimensionBlur}
                onChange={this._onDimensionChange}
                type="number"
                value={this.state.height}/>
          </div>
          <div className="sv-new-dialog-content-aspect-ratio">
            <Checkbox checked={this.state.constrained}
                label="Constrain to aspect ratio"
                onChange={this._onConstrainChange}/>
            {aspectRatio && <h6>{aspectRatio}</h6>}
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
    name: state.name.present,
    width: state.width,
    height: state.height
  };
})(NewDialog);
