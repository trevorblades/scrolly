const React = require('react');
const {render} = require('react-dom');
const request = require('request-promise');
const url = require('url');
require('core-js/fn/array/find');

const Viewport = require('../components/viewport');

const {API_URL} = require('../constants');

const Viewer = React.createClass({

  getInitialState: function() {
    let loading = false;
    const parsed = url.parse(window.location.href, true);
    const slug = parsed.query.project || parsed.query.p;
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
      compositionHeight: 1080,
      compositionWidth: 1920,
      layers: [],
      loading,
      percentPlayed: 0,
      step: 1,
      windowHeight: 0,
      windowWidth: 0
    };
  },

  componentDidMount: function() {
    window.addEventListener('wheel', this._onWheel);
    window.addEventListener('resize', this._onResize);
    this._onResize();
  },

  _onWheel: function(event) {
    const movementY = event.deltaY / this.state.step;
    let percentPlayed = (this.state.windowWidth * this.state.percentPlayed + movementY) / this.state.windowWidth;
    if (percentPlayed < 0) {
      percentPlayed = 0;
    } else if (percentPlayed > 1) {
      percentPlayed = 1;
    }
    this.setState({percentPlayed});
  },

  _onResize: function() {
    this.setState({
      windowHeight: window.innerHeight,
      windowWidth: window.innerWidth
    });
  },

  render: function() {
    if (this.state.loading) {
      return null;
    }
    return (
      <div className="sv-viewer">
        <Viewport assets={this.state.assets}
            compositionHeight={this.state.compositionHeight}
            compositionWidth={this.state.compositionWidth}
            layers={this.state.layers}
            percentPlayed={this.state.percentPlayed}
            readOnly
            wrapperHeight={this.state.windowHeight}
            wrapperWidth={this.state.windowWidth}/>
      </div>
    );
  }
});

render(<Viewer/>, document.getElementById('sv-root'));
