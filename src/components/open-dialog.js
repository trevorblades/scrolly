const React = require('react');
const {connect} = require('react-redux');

const Dialog = require('./dialog');

const {loadProject} = require('../actions');
const {API_URL} = require('../constants');
const formatDate = require('../util/format-date');

const OpenDialog = React.createClass({

  propTypes: {
    dispatch: React.PropTypes.func.isRequired,
    onClose: React.PropTypes.func.isRequired,
    user: React.PropTypes.object.isRequired
  },

  getInitialState: function() {
    return {
      projects: null
    };
  },

  componentWillMount: function() {
    const headers = {'Authorization': `Bearer ${this.props.user.token}`};
    fetch(`${API_URL}/projects`, {headers})
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
    history.pushState(null, null, `/${project.slug}`);
    this.props.dispatch(loadProject(project));
    this.props.onClose();
  },

  render: function() {
    let projects;
    if (this.state.projects) {
      projects = this.state.projects.length ? (
        <div className="sv-open-dialog-projects">
          {this.state.projects.map(project => {
            return (
              <div className="sv-open-dialog-project" key={project.id}>
                <div className="sv-open-dialog-project-card"
                    onClick={this._onProjectOpen.bind(null, project)}>
                  <span>{project.name}</span>
                  <span>{`Last modified ${formatDate(project.updated_at)}`}</span>
                </div>
              </div>
            );
          })}
        </div>
      ) : <p>You have no saved projects.</p>;
    } else {
      projects = <p>Loading projects...</p>;
    }

    return (
      <Dialog className="sv-open-dialog" onClose={this.props.onClose}>
        <h3>Open a project</h3>
        {projects}
      </Dialog>
    );
  }
});

module.exports = connect()(OpenDialog);
