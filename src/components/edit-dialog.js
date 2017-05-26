const React = require('react');
const {connect} = require('react-redux');

const Button = require('./button');
const Checkbox = require('./checkbox');
const Dialog = require('./dialog');

const {DEFAULT_NAME} = require('../constants');
const getAspectRatio = require('../util/get-aspect-ratio');

const EditDialog = React.createClass({
  propTypes: {
    dispatch: React.PropTypes.func.isRequired,
    height: React.PropTypes.number.isRequired,
    name: React.PropTypes.string.isRequired,
    onClose: React.PropTypes.func.isRequired,
    reset: React.PropTypes.bool,
    width: React.PropTypes.number.isRequired
  },

  getInitialState() {
    return {
      aspectRatio: this.props.width / this.props.height,
      constrained: true,
      height: this.props.height,
      name: this.props.reset ? DEFAULT_NAME : this.props.name,
      width: this.props.width
    };
  },

  componentDidMount() {
    this.name.focus();
    this.name.select();
  },

  _onSubmit(event) {
    event.preventDefault();
    history.replaceState(null, null, '/');
    this.props.dispatch({
      type: this.props.reset ? 'RESET_PROJECT' : 'UPDATE_PROJECT',
      name: this.state.name,
      width: this.state.width,
      height: this.state.height
    });
    this.props.onClose();
  },

  onNameChange(event) {
    this.setState({name: event.target.value});
  },

  onDimensionChange(event) {
    const key = event.target.name;
    let nextState = {[key]: event.target.value};
    if (nextState[key] && !isNaN(nextState[key])) {
      const value = parseInt(nextState[key], 10);
      if (value) {
        nextState = this.getConstrainedDimensions({[key]: value});
      }
    }
    this.setState(nextState);
  },

  onDimensionBlur(event) {
    if (!event.target.value) {
      const nextState = this.getConstrainedDimensions({
        [event.target.name]: 1
      });
      this.setState(nextState);
    }
  },

  onConstrainChange(constrained) {
    const nextState = {constrained};
    if (constrained) {
      nextState.aspectRatio = this.state.width / this.state.height;
    }
    this.setState(nextState);
  },

  getConstrainedDimensions(dimensions) {
    if (!this.state.constrained) {
      return dimensions;
    }
    const additional = 'width' in dimensions
      ? {height: dimensions.width / this.state.aspectRatio}
      : {width: dimensions.height * this.state.aspectRatio};
    return {...dimensions, ...additional};
  },

  render() {
    return (
      <Dialog className="sv-edit-dialog" onClose={this.props.onClose}>
        <h3>{`${this.props.reset ? 'New' : 'Edit'} project`}</h3>
        <form onSubmit={this.onSubmit}>
          <label htmlFor="name">Project name</label>
          <input
            ref={node => {
              this.name = node;
            }}
            className="sv-edit-dialog-name"
            id="name"
            onChange={this.onNameChange}
            type="text"
            value={this.state.name}
          />
          <label htmlFor="width">Width</label>
          <div className="sv-edit-dialog-dimensions">
            <div className="sv-edit-dialog-dimensions-fields">
              <input
                id="width"
                name="width"
                onBlur={this.onDimensionBlur}
                onChange={this.onDimensionChange}
                type="number"
                value={this.state.width}
              />
              <label htmlFor="height">Height</label>
              <input
                name="height"
                onBlur={this.onDimensionBlur}
                onChange={this.onDimensionChange}
                type="number"
                value={this.state.height}
              />
            </div>
            <div className="sv-edit-dialog-dimensions-constrain">
              <Checkbox
                checked={this.state.constrained}
                label="Constrain dimensions to aspect ratio"
                onChange={this.onConstrainChange}
              />
              {this.state.constrained &&
                <h6
                >{`Aspect ratio: ${getAspectRatio(1, 1 / this.state.aspectRatio)}`}</h6>}
            </div>
          </div>
          <Button secondary type="submit">
            {`${this.props.reset ? 'Create' : 'Update'} project`}
          </Button>
          <Button onClick={this.props.onClose} secondary>Cancel</Button>
        </form>
      </Dialog>
    );
  }
});

module.exports = connect(state => ({
  name: state.name.present,
  width: state.width,
  height: state.height
}))(EditDialog);
