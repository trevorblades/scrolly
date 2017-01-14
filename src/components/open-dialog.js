const React = require('react');
const {connect} = require('react-redux');

const Dialog = require('./dialog');

const {loadProject} = require('../actions');
const {API_URL} = require('../constants');
const formatDate = require('../util/format-date');

const OpenDialog = React.createClass({

  propTypes: {
    dispatch: React.PropTypes.func.isRequired,
    onClose: React.PropTypes.func.isRequired
  },

  getInitialState: function() {
    return {
      projects: null
    };
  },

  componentWillMount: function() {
    fetch(`${API_URL}/projects`)
      .then(function(res) {
        if (res.ok) {
          return res.json();
        }
      })
      .then(projects => {
        this.setState({projects});
      });
  },

  _onProjectOpen: function(project) {
    this.props.dispatch(loadProject(project));
    this.props.onClose();
  },

  render: function() {
    return (
      <Dialog className="sv-open-dialog" onClose={this.props.onClose}>
        <h3>Open a project</h3>
        <div className="sv-open-dialog-projects">
          {this.state.projects ? this.state.projects.map(project => {
            return (
              <div className="sv-open-dialog-project" key={project.id}>
                <div className="sv-open-dialog-project-card"
                    onClick={this._onProjectOpen.bind(null, project)}>
                  <span>{project.name}</span>
                  <span>{`Last modified ${formatDate(project.updated_at)}`}</span>
                </div>
              </div>
            );
          }) : 'Loading projects...'}
        </div>
      </Dialog>
    );
  }
});

module.exports = connect()(OpenDialog);
