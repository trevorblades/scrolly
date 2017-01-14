const React = require('react');
const {connect} = require('react-redux');

const Button = require('./button');
const Checkbox = require('./checkbox');
const Dialog = require('./dialog');

const {DEFAULT_NAME} = require('../constants');
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
      name: DEFAULT_NAME,
      width: this.props.width
    };
  },

  _onNameChange: function(event) {
    this.setState({name: event.target.value});
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
      name: this.state.name,
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
    return (
      <Dialog className="sv-new-dialog" onClose={this.props.onClose}>
        <h3>New project</h3>
        <label>Project name</label>
        <input className="sv-new-dialog-name"
            onChange={this._onNameChange}
            type="text"
            value={this.state.name}/>
        <label>Width</label>
        <div className="sv-new-dialog-dimensions">
          <div className="sv-new-dialog-dimensions-fields">
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
          <div className="sv-new-dialog-dimensions-constrain">
            <Checkbox checked={this.state.constrained}
                label="Constrain dimensions to aspect ratio"
                onChange={this._onConstrainChange}/>
            {this.state.constrained &&
              <h6>{getAspectRatio(1, 1 / this.state.aspectRatio)}</h6>}
          </div>
        </div>
        <Button onClick={this._onCreateProjectClick} secondary>
          Create project
        </Button>
        <Button onClick={this.props.onClose} secondary>Cancel</Button>
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
