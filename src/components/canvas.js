const React = require('react');
const classNames = require('classnames');

const Canvas = React.createClass({

  propTypes: {
    innerHeight: React.PropTypes.number,
    innerWidth: React.PropTypes.number,
    layers: React.PropTypes.object,
    onLayerChange: React.PropTypes.func,
    outerHeight: React.PropTypes.number,
    outerWidth: React.PropTypes.number
  },

  getInitialState: function() {
    return {
      editingLayer: null,
      selectedLayer: null
    };
  },

  componentWillUnmount: function() {
    window.removeEventListener('keydown', this._onKeyDown);
  },

  _onKeyDown: function(event) {
    if (event.keyCode === 27) { // Escape key pressed
      if (event.target.contentEditable === 'true') { // It happened on a text layer
        return event.target.blur();
      }
      this._deselectLayer();
    }
  },

  _onCanvasClick: function() {
    if (this.state.selectedLayer) {
      this._deselectLayer();
    }
  },

  _onLayerClick: function(id, event) {
    event.stopPropagation();
    if (id !== this.state.selectedLayer) {
      this.setState({selectedLayer: id});
      window.addEventListener('keydown', this._onKeyDown);
    }
  },

  _onTextLayerBlur: function(event) {
    this.props.onLayerChange(this.state.selectedLayer, {value: event.target.innerHTML});
    this._deselectLayer();
  },

  _onTextLayerDoubleClick: function(id, event) {
    event.stopPropagation();
    const target = event.target;
    if (id !== this.state.editingLayer) {
      this.setState({editingLayer: id}, function() {
        target.focus();
        document.execCommand('selectAll', false, null);
      });
    }
  },

  _deselectLayer: function() {
    this.setState({
      editingLayer: null,
      selectedLayer: null
    });
    window.removeEventListener('keydown', this._onKeyDown);
  },

  render: function() {
    const innerAspectRatio = this.props.innerWidth / this.props.innerHeight;
    const outerAspectRatio = this.props.outerWidth / this.props.outerHeight;

    let viewportStyle = {};
    let viewportHeight = this.props.outerHeight;
    let viewportWidth = this.props.outerWidth;
    if (innerAspectRatio > outerAspectRatio) {
      viewportHeight = this.props.outerWidth / innerAspectRatio;
      viewportStyle = {height: viewportHeight};
    } else {
      viewportWidth = this.props.outerHeight * innerAspectRatio;
      viewportStyle = {width: viewportWidth};
    }

    return (
      <div className="pl-canvas">
        <div className="pl-canvas-viewport"
            onClick={this._onCanvasClick}
            style={viewportStyle}>
          {Object.keys(this.props.layers).map(key => {
            const layer = this.props.layers[key];

            const x = viewportWidth * layer.x / this.props.innerWidth;
            const y = viewportHeight * layer.y / this.props.innerHeight;
            const style = {transform: `translate(${x}px, ${y}px)`};

            let extraProps;
            let isText = false;
            if (layer.type === 'text') {
              isText = true;
              style.fontSize = layer.fontSize;
              style.fontWeight = layer.fontWeight;
              style.fontStyle = layer.fontStyle;
              extraProps = {
                dangerouslySetInnerHTML: {__html: layer.value},
                onDoubleClick: this._onTextLayerDoubleClick.bind(this, key)
              };
              if (key === this.state.editingLayer) {
                extraProps.contentEditable = true;
                extraProps.onBlur = this._onTextLayerBlur;
              }
            }

            const canvasClassName = classNames('pl-canvas-viewport-layer', {
              'pl-selected': key === this.state.selectedLayer,
              'pl-text': isText
            });
            return (
              <div className={canvasClassName}
                  key={key}
                  onClick={this._onLayerClick.bind(this, key)}
                  style={style}
                  {...extraProps}/>
            );
          })}
        </div>
      </div>
    );
  }
});

module.exports = Canvas;
