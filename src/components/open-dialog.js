import React from 'react';
import {connect} from 'react-redux';

import Dialog from './dialog';

import {loadProject} from '../actions';
import {API_URL} from '../constants';
import formatDate from '../util/format-date';

const OpenDialog = React.createClass({
  propTypes: {
    dispatch: React.PropTypes.func.isRequired,
    onClose: React.PropTypes.func.isRequired,
    user: React.PropTypes.object.isRequired
  },

  getInitialState() {
    return {
      projects: null
    };
  },

  componentWillMount() {
    const headers = {Authorization: `Bearer ${this.props.user.token}`};
    fetch(`${API_URL}/projects`, {headers})
      .then(res => {
        if (!res.ok) {
          throw new Error();
        }
        return res.json();
      })
      .then(projects => {
        this.setState({projects});
      })
      .catch(() => {
        // the project doesn't exist/didn't load
      });
  },

  onProjectOpen(project) {
    history.pushState(null, null, `/${project.slug}`);
    this.props.dispatch(loadProject(project));
    this.props.onClose();
  },

  render() {
    let projects;
    if (this.state.projects) {
      projects = this.state.projects.length
        ? <div className="sv-open-dialog-projects">
            {this.state.projects.map(project => (
              <div key={project.id} className="sv-open-dialog-project">
                <div
                  className="sv-open-dialog-project-card"
                  onClick={() => this.onProjectOpen(project)}
                >
                  <span>{project.name}</span>
                  <span
                  >{`Last modified ${formatDate(project.updated_at)}`}</span>
                </div>
              </div>
            ))}
          </div>
        : <p>You have no saved projects.</p>;
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

export default connect()(OpenDialog);
