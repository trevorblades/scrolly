const React = require('react');
const {render} = require('react-dom');
const request = require('request-promise');
require('core-js/fn/array/find');

const Viewport = require('./components/viewport');

const {API_URL} = require('./constants');

const Viewer = React.createClass({

  getInitialState: function() {
    let loading = false;
    const slug = window.location.pathname.split('/').filter(Boolean)[0];
    if (slug) {
      loading = true;
      request.get({url: `${API_URL}/projects/${slug}`, json: true})
        .then(project => {
          this.setState({
            assets: project.assets,
            layers: project.layers,
            loading: false,
            step: project.step
          });
        })
        .catch(err => {
          this.setState({loading: false});
        });
    }
    return {
      assets: [],
      compositionHeight: 1920,
      compositionWidth: 1080,
      layers: [],
      loading,
      step: 1
    };
  },

  componentDidMount: function() {
    window.addEventListener('resize', this._onResize);
    this._onResize();
  },

  _onResize: function() {
    this.setState({
      wrapperHeight: window.innerHeight,
      wrapperWidth: window.innerWidth
    });
  },

  render: function() {
    if (this.state.loading) {
      return null;
    }
    return (
      <Viewport compositionHeight={this.state.compositionHeight}
          compositionWidth={this.state.compositionWidth}
          wrapperHeight={this.state.windowHeight}
          wrapperWidth={this.state.windowWidth}/>
    );
  }
});

render(<Viewer/>, document.getElementById('sv-root'));
