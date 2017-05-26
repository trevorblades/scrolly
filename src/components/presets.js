import React from 'react';

import Button from './button';
import Circle from './circle';
import Shape from './shape';
import Rect from './rect';
import CloseIcon from '../assets/icons/close.svg';

import {SHAPE_DRAG_TYPE} from '../constants';

export const SHAPES = {
  circle: Circle,
  rect: Rect
};

const Presets = React.createClass({
  getInitialState() {
    return {
      panelShown: false
    };
  },

  componentWillMount() {
    window.addEventListener('keydown', this.onKeyDown);
    document.body.addEventListener('click', this.onBodyClick);
  },

  componentWillUnmount() {
    window.removeEventListener('keydown', this.onKeyDown);
    document.body.removeEventListener('click', this.onBodyClick);
  },

  onKeyDown(event) {
    if (this.state.panelShown && event.keyCode === 27) {
      // esc key pressed
      this.closePanel();
    }
  },

  onBodyClick(event) {
    if (this.state.panelShown && !this.presets.contains(event.target)) {
      this.closePanel();
    }
  },

  onButtonClick() {
    this.setState(prevState => ({panelShown: !prevState.panelShown}));
  },

  onDragStart(id, event) {
    event.dataTransfer.setData(SHAPE_DRAG_TYPE, id);
  },

  closePanel() {
    this.setState({panelShown: false});
  },

  render() {
    return (
      <div
        ref={node => {
          this.presets = node;
        }}
        className="sv-library-presets"
      >
        <Button onClick={this.onButtonClick}>Preset assets</Button>
        {this.state.panelShown &&
          <div className="sv-library-presets-panel">
            <h5>
              <span>Preset assets</span>
              <a onClick={this.closePanel}>
                <CloseIcon />
              </a>
            </h5>
            <div className="sv-library-presets-panel-scroll">
              {Object.keys(SHAPES).map(key => (
                <div key={key} className="sv-library-presets-panel-item">
                  <div
                    className="sv-library-presets-panel-item-asset"
                    draggable
                    onDragStart={event => this.onDragStart(key, event)}
                  >
                    <Shape shape={SHAPES[key]} />
                  </div>
                </div>
              ))}
            </div>
          </div>}
      </div>
    );
  }
});

export default Presets;
